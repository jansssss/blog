"""과거 결정의 효과를 실제 GSC 수치로 측정한다 — 루프의 '판정' 단계.

에이전트가 스스로 "내 판단이 맞았는가"를 채점하려면 근거 수치가 있어야 한다.
그 수치를 뽑아오는 것이 이 모듈의 유일한 일이다. **판정의 해석은 하지 않는다** —
데이터 충족 여부와 사이트 기준선 보정까지만 산수로 확정하고, 의미 부여는 LLM 에 넘긴다.

Usage:
  python -m scripts.analytics.gsc_evaluate               # 만기 결정 평가
  python -m scripts.analytics.gsc_evaluate --status      # 상태만 (러너 티어 판정용, API 미호출)
  python -m scripts.analytics.gsc_evaluate --snapshot --query "dsr 계산기" --page /calculator/loan-limit

산출물:
  reports/gsc/state/evaluation-input.json   에이전트가 읽는 판정 근거
  reports/gsc/state/evaluation-input.md     사람이 읽는 요약
  reports/gsc/state/status.json             러너가 읽는 실행 티어 신호
"""
from __future__ import annotations

import argparse
import json
import sys
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from scripts.pipeline.config import load_config
from scripts.analytics import gsc_state as st
from scripts.analytics.gsc_daily_insight import (
    GSCInsight, page_path_of, scan_site_routes, _DATA_LAG_DAYS,
)


def normalize_page_arg(value: str, known_routes: list[str] | None = None) -> str:
    """CLI 로 받은 페이지 인자를 GSC 집계 키(`/calculator/foo`) 형태로 되돌린다.

    Git Bash(MSYS)는 `/calculator/foo` 같은 인자를 Windows 경로로 자동 변환해
    `C:/Program Files/Git/calculator/foo` 로 바꿔 버린다. 그대로 두면 스냅샷의
    pages 블록이 항상 0으로 나오고, 그 0이 baseline 으로 굳으면 판정이 통째로 망가진다.
    실제 라우트 목록과 대조해 복원하는 것이 가장 확실하다.
    """
    v = (value or "").strip().replace("\\", "/")
    # 전체 URL 로 준 경우
    if "://" in v:
        v = urlparse(v).path or "/"

    # MSYS 변환 흔적(드라이브 문자)이 있으면 알려진 라우트로 복원한다
    if re.match(r"^[A-Za-z]:/", v) and known_routes:
        for route in sorted(known_routes, key=len, reverse=True):
            if route != "/" and v.endswith(route):
                return route
    if not v.startswith("/"):
        v = "/" + v
    return v.rstrip("/") or "/"


def _parse_date(v) -> date | None:
    if not v:
        return None
    try:
        return datetime.strptime(str(v)[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


class Evaluator:
    """GSCInsight 의 조회 기능만 재사용한다 (리포트 생성과는 별개 경로)."""

    def __init__(self, insight: GSCInsight) -> None:
        self.g = insight

    def window(self, start: date, end: date) -> dict:
        """한 구간의 검색어별·페이지별·사이트 전체 지표."""
        q = self.g._agg(self.g._query(["query"], start, end))
        p_raw = self.g._agg(self.g._query(["page"], start, end))
        pages = {}
        for url, v in p_raw.items():
            path = page_path_of(url)
            slot = pages.setdefault(
                path, {"clicks": 0, "impressions": 0, "_pw": 0.0}
            )
            slot["clicks"] += v["clicks"]
            slot["impressions"] += v["impressions"]
            slot["_pw"] += v["position"] * v["impressions"]
        for slot in pages.values():
            imp = slot["impressions"]
            slot["ctr"] = (slot["clicks"] / imp) if imp else 0.0
            slot["position"] = (slot["_pw"] / imp) if imp else 0.0
            slot.pop("_pw")

        site = {"clicks": 0, "impressions": 0, "_pw": 0.0}
        for v in p_raw.values():
            site["clicks"] += v["clicks"]
            site["impressions"] += v["impressions"]
            site["_pw"] += v["position"] * v["impressions"]
        imp = site["impressions"]
        site["ctr"] = (site["clicks"] / imp) if imp else 0.0
        site["position"] = (site["_pw"] / imp) if imp else 0.0
        site.pop("_pw")

        return {
            "start": start.isoformat(), "end": end.isoformat(),
            "days": (end - start).days + 1,
            "queries": q, "pages": pages, "site": site,
        }


_EMPTY = {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": 0.0}


def _pick(window: dict, kind: str, keys: list[str]) -> dict:
    """대상이 여러 개면 합산해서 하나의 지표로 본다 (표본을 키우기 위해)."""
    src = window.get(kind, {})
    out = {"clicks": 0, "impressions": 0, "_pw": 0.0}
    for k in keys:
        v = src.get(k)
        if not v:
            continue
        out["clicks"] += v.get("clicks", 0)
        out["impressions"] += v.get("impressions", 0)
        out["_pw"] += v.get("position", 0.0) * v.get("impressions", 0)
    imp = out["impressions"]
    return {
        "clicks": out["clicks"], "impressions": imp,
        "ctr": (out["clicks"] / imp) if imp else 0.0,
        "position": (out["_pw"] / imp) if imp else 0.0,
    }


def after_window_for(d: dict, data_end: date) -> tuple[date, date] | None:
    """배포 이후 구글이 실제로 재평가할 수 있었던 구간만 잘라낸다."""
    deployed = _parse_date(d.get("deployed_at"))
    if not deployed:
        return None
    start = deployed + timedelta(days=st.AFTER_WINDOW_LAG_DAYS)
    if (data_end - start).days + 1 < st.MIN_AFTER_WINDOW_DAYS:
        return None
    return start, data_end


def evaluate(project_root: Path, insight: GSCInsight, today: date | None = None) -> dict:
    today = today or date.today()
    data_end = today - timedelta(days=_DATA_LAG_DAYS)

    decisions = st.load_decisions(project_root)
    backfilled = st.backfill_deployed_at(project_root, decisions)
    for d in backfilled:
        st.save_decision(project_root, d)

    due = st.due_decisions(decisions, today)
    results = []

    if due:
        ev = Evaluator(insight)
        # 결정마다 창이 다르므로 창 단위로 캐시해 API 호출을 줄인다
        cache: dict[tuple[str, str], dict] = {}

        def get_window(s: date, e: date) -> dict:
            key = (s.isoformat(), e.isoformat())
            if key not in cache:
                cache[key] = ev.window(s, e)
            return cache[key]

        for d in due:
            win = after_window_for(d, data_end)
            if not win:
                results.append({
                    "id": d.get("id"), "grade": d.get("grade"),
                    "hypothesis": d.get("hypothesis"), "action": d.get("action"),
                    "judgement": {
                        "verdict": "판정불가",
                        "reason": f"배포 후 관찰 창이 {st.MIN_AFTER_WINDOW_DAYS}일 미만 (배포일 미확정 또는 너무 최근)",
                    },
                })
                continue

            a_start, a_end = win
            after = get_window(a_start, a_end)

            baseline = d.get("baseline") or {}
            targets = d.get("targets") or {}
            queries = targets.get("queries") or []
            pages = targets.get("pages") or []
            # 페이지 대상이 있으면 페이지를 우선한다 — 검색어보다 표본이 크다
            kind, keys = ("pages", pages) if pages else ("queries", queries)

            before = _pick(
                {"queries": baseline.get("queries") or {},
                 "pages": baseline.get("pages") or {}}, kind, keys
            )
            after_m = _pick(after, kind, keys)
            site_before = baseline.get("site") or dict(_EMPTY)
            site_after = after["site"]

            judgement = st.judge(
                before, after_m, site_before, site_after,
                d.get("predict") or {},
                days_before=int(baseline.get("days") or baseline.get("window_days") or 28),
                days_after=after["days"],
            )
            results.append({
                "id": d.get("id"), "grade": d.get("grade"),
                "hypothesis": d.get("hypothesis"), "action": d.get("action"),
                "predict": d.get("predict"),
                "deployed_at": d.get("deployed_at"),
                "target": {"kind": kind, "keys": keys},
                "after_window": {"start": a_start.isoformat(), "end": a_end.isoformat(),
                                 "days": after["days"]},
                "extensions_used": int(d.get("extensions", 0) or 0),
                "extension_available": int(d.get("extensions", 0) or 0) < st.MAX_EXTENSIONS,
                "is_final": bool(_parse_date(d.get("final_evaluate_at"))
                                 and today >= _parse_date(d.get("final_evaluate_at"))),
                "judgement": judgement,
            })

    can_new, quota_note = st.can_open_new(decisions)
    payload = {
        "generated_at": today.isoformat(),
        "data_end": data_end.isoformat(),
        "due_count": len(due),
        "evaluations": results,
        "open_experiments": [
            {"id": d.get("id"), "grade": d.get("grade"), "status": d.get("status"),
             "deployed_at": d.get("deployed_at"), "evaluate_at": d.get("evaluate_at")}
            for d in st.open_experiments(decisions)
        ],
        "frozen": st.frozen_targets(decisions, today),
        "stale_pending": [
            {"id": d.get("id"), "created": d.get("created"), "files": d.get("files")}
            for d in st.stale_pending(decisions, today)
        ],
        "can_open_new_decision": can_new,
        "quota_note": quota_note,
        "params": {
            "min_impressions_after": st.MIN_IMPRESSIONS_AFTER,
            "min_impressions_before": st.MIN_IMPRESSIONS_BEFORE,
            "position_move_threshold": st.POSITION_MOVE_THRESHOLD,
            "min_impressions_for_ctr": st.MIN_IMPRESSIONS_FOR_CTR,
            "max_open_experiments": st.MAX_OPEN_EXPERIMENTS,
            "max_new_decisions_per_run": st.MAX_NEW_DECISIONS_PER_RUN,
        },
    }
    return payload


def render(payload: dict) -> str:
    L = [f"# 결정 판정 근거 ({payload['generated_at']})", ""]
    L.append(f"- 데이터 확정일: {payload['data_end']}")
    L.append(f"- 판정 기일 도래: **{payload['due_count']}건**")
    L.append(f"- {payload['quota_note']}")
    L.append("")

    if payload["stale_pending"]:
        L.append("## ⚠️ 커밋 대기 중 (배포 안 됨)")
        L.append("")
        for s in payload["stale_pending"]:
            L.append(f"- `{s['id']}` (생성 {s['created']}) — 커밋되지 않아 관찰이 시작되지 않았습니다")
        L.append("")

    if payload["evaluations"]:
        L.append("## 판정 대상")
        L.append("")
        for e in payload["evaluations"]:
            j = e["judgement"]
            L.append(f"### [{e.get('grade')}] {e['id']}")
            L.append(f"- 가설: {e.get('hypothesis') or '—'}")
            L.append(f"- 조치: {e.get('action') or '—'}")
            if e.get("after_window"):
                w = e["after_window"]
                L.append(f"- 관찰 창: {w['start']} ~ {w['end']} ({w['days']}일)")
            L.append(f"- **판정: {j.get('verdict')}** — {j.get('reason', '')}")
            if "position_before" in j:
                L.append(
                    f"  - 순위 {j['position_before']} → {j['position_after']} / "
                    f"일평균 노출 {j.get('impressions_per_day_before')} → "
                    f"{j.get('impressions_per_day_after')}"
                )
            if j.get("weak_signal"):
                L.append(f"  - {j['weak_signal']}")
            if j.get("ctr_note"):
                L.append(f"  - {j['ctr_note']}")
            L.append(f"- 최종 판정 회차 여부: {'예' if e.get('is_final') else '아니오'}"
                     f" / 연장 가능: {'예' if e.get('extension_available') else '아니오'}")
            L.append("")
    else:
        L.append("## 판정 대상 없음")
        L.append("")
        L.append("이번 회차에 판정 기일이 도래한 결정이 없습니다.")
        L.append("")

    frozen = payload.get("frozen") or {}
    if frozen.get("pages") or frozen.get("queries"):
        L.append("## 🔒 동결 대상 (이번 회차에 수정 금지)")
        L.append("")
        for p, until in sorted((frozen.get("pages") or {}).items()):
            L.append(f"- `{p}` — 해제 {until}")
        for q, until in sorted((frozen.get("queries") or {}).items()):
            L.append(f"- 검색어 `{q}` — 해제 {until}")
        L.append("")

    return "\n".join(L)


def build_status(project_root: Path, today: date | None = None) -> dict:
    """API 를 호출하지 않고 러너가 실행 티어를 정할 수 있게 하는 요약."""
    today = today or date.today()
    decisions = st.load_decisions(project_root)
    st.backfill_deployed_at(project_root, decisions)
    due = st.due_decisions(decisions, today)
    can_new, note = st.can_open_new(decisions)

    marker = st.state_dir(project_root) / "last-tier2.txt"
    last = _parse_date(marker.read_text(encoding="utf-8").strip()) if marker.exists() else None
    days_since = (today - last).days if last else 999

    return {
        "today": today.isoformat(),
        "due_count": len(due),
        "open_count": len(st.open_experiments(decisions)),
        "stale_pending_count": len(st.stale_pending(decisions, today)),
        "can_open_new_decision": can_new,
        "quota_note": note,
        "days_since_last_deep_run": days_since,
    }


def record_observation(project_root: Path, today: date | None = None) -> Path | None:
    """이번 회차 관측을 압축해 state/observations/ 에 남긴다.

    리포트 원본(latest.json)은 용량이 커서 git 에 넣지 않는다. 하지만 PC 가 꺼져 있어
    로컬 회차가 오래 건너뛰어지면 "그동안 무슨 일이 있었는가"를 아무도 모르게 된다.
    클라우드에서 매주 이 요약만 커밋해 두면, 나중에 PC 를 켰을 때 에이전트가
    **시계열**을 읽을 수 있다 — 지금 스냅샷 하나보다 훨씬 나은 판단 재료다.
    """
    today = today or date.today()
    latest = project_root / "reports" / "gsc" / "latest.json"
    if not latest.exists():
        print("[EVAL] latest.json 이 없어 관측 기록을 건너뜁니다", flush=True)
        return None

    r = json.loads(latest.read_text(encoding="utf-8"))
    s = r.get("summary") or {}

    def trim(rows, keys, limit=10):
        out = []
        for row in (rows or [])[:limit]:
            out.append({k: row.get(k) for k in keys})
        return out

    record = {
        "recorded_at": today.isoformat(),
        "generated_for": r.get("generated_for"),
        "window": r.get("window"),
        "summary": s.get("current"),
        "delta_pct": s.get("delta_pct"),
        "anomaly_flags": (r.get("anomaly") or {}).get("flags") or [],
        "top_queries": trim(r.get("top_queries"),
                            ["query", "impressions", "clicks", "position", "intent"]),
        "top_pages": trim(r.get("top_pages"),
                          ["path", "impressions", "clicks", "position"]),
        "intent_breakdown": trim(r.get("intent_breakdown"),
                                 ["intent", "impressions", "queries"], limit=8),
        "loop": {
            "verdict_due": (r.get("loop_state") or {}).get("verdict_due") or [],
            "open_experiments": [e.get("id") for e in
                                 ((r.get("loop_state") or {}).get("open_experiments") or [])],
        },
    }

    obs_dir = st.state_dir(project_root) / "observations"
    obs_dir.mkdir(exist_ok=True)
    path = obs_dir / f"{r.get('generated_for') or today.isoformat()}.json"
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[EVAL] 관측 기록 저장: {path}", flush=True)
    return path


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="GSC 결정 판정 근거 생성")
    p.add_argument("--status", action="store_true",
                   help="GSC API 를 호출하지 않고 상태 요약만 출력 (러너 티어 판정용)")
    p.add_argument("--snapshot", action="store_true",
                   help="지정한 검색어·페이지의 현재 구간 지표를 JSON 으로 출력 (baseline 캡처용)")
    p.add_argument("--query", action="append", default=[], help="스냅샷 대상 검색어 (반복 가능)")
    p.add_argument("--page", action="append", default=[],
                   help="스냅샷 대상 페이지 경로 (반복 가능). Git Bash 의 경로 변환은 자동 복원된다")
    p.add_argument("--days", type=int, default=28, help="스냅샷 구간 길이 (기본 28)")
    p.add_argument("--mark-deep-run", action="store_true",
                   help="이번 회차를 심층 실행으로 기록 (러너가 호출)")
    p.add_argument("--record-observation", action="store_true",
                   help="latest.json 을 압축해 state/observations/ 에 기록 (클라우드 관측용)")
    return p


def main() -> int:
    args = build_parser().parse_args()
    config = load_config()
    root = config.project_root
    today = date.today()

    if args.record_observation:
        return 0 if record_observation(root, today) else 1

    if args.mark_deep_run:
        (st.state_dir(root) / "last-tier2.txt").write_text(today.isoformat(), encoding="utf-8")
        print(f"[EVAL] 심층 실행 기록: {today.isoformat()}", flush=True)
        return 0

    if args.status:
        status = build_status(root, today)
        (st.state_dir(root) / "status.json").write_text(
            json.dumps(status, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(status, ensure_ascii=False))
        return 0

    if not config.gsc_site_url:
        print("[EVAL] GSC_SITE_URL 환경변수가 없습니다 (.env.local 확인)", flush=True)
        return 1

    insight = GSCInsight(
        site_url=config.gsc_site_url,
        client_secret_path=config.gsc_client_secret_path,
        token_path=config.gsc_token_path,
    )

    if args.snapshot:
        end = today - timedelta(days=_DATA_LAG_DAYS)
        start = end - timedelta(days=args.days - 1)
        w = Evaluator(insight).window(start, end)
        routes = scan_site_routes(root)
        pages = [normalize_page_arg(x, routes) for x in args.page]
        for raw, fixed in zip(args.page, pages):
            if raw != fixed:
                print(f"[EVAL] 페이지 인자 정규화: {raw} -> {fixed}", flush=True)
        out = {
            "window_days": w["days"], "days": w["days"],
            "start": w["start"], "end": w["end"],
            "queries": {q: w["queries"].get(q, dict(_EMPTY)) for q in args.query},
            "pages": {p: w["pages"].get(p, dict(_EMPTY)) for p in pages},
            "site": w["site"],
        }
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0

    payload = evaluate(root, insight, today)
    sdir = st.state_dir(root)
    (sdir / "evaluation-input.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (sdir / "evaluation-input.md").write_text(render(payload), encoding="utf-8")

    print(f"[EVAL] 판정 대상 {payload['due_count']}건 / "
          f"열린 실험 {len(payload['open_experiments'])}건", flush=True)
    for e in payload["evaluations"]:
        print(f"[EVAL]   {e['id']}: {e['judgement'].get('verdict')}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
