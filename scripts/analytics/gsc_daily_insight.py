"""
GSC 일일 인사이트 리포트 생성기

Search Console API를 직접 조회해서 "유저가 어떤 검색어로 들어오고,
무엇을 원했는데 못 얻고 갔는지"를 분석한 리포트를 만든다.
Supabase 없이 단독 동작한다 (수집 파이프라인 scripts/evolve.py 와 별개).

산출물:
  reports/gsc/YYYY-MM-DD.json   기계 판독용 (에이전트가 읽음)
  reports/gsc/YYYY-MM-DD.md     사람 판독용
  reports/gsc/latest.md         최신 리포트 사본

Usage:
  python -m scripts.analytics.gsc_daily_insight
  python -m scripts.analytics.gsc_daily_insight --days 28 --out reports/gsc
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from scripts.pipeline.config import load_config
from scripts.analytics.gsc_collector import load_credentials
from scripts.analytics import gsc_state as st
from scripts.analytics import llm_client

# GSC 데이터 확정 지연 (오늘 기준 며칠 전까지가 신뢰 가능한 데이터인가)
_DATA_LAG_DAYS = 3

# 구글 검색 순위별 기대 CTR (performance_analyzer 와 동일 기준)
_EXPECTED_CTR = [0, 0.28, 0.15, 0.10, 0.08, 0.065, 0.05, 0.04, 0.035, 0.03, 0.025]
_BEYOND_10_CTR = 0.02

# 검색어 -> 사용자 의도 분류 규칙 (앞에 있을수록 우선)
_INTENT_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("계산", ("계산기", "계산", "얼마", "시뮬", "산정", "환산")),
    ("비교", ("비교", "vs", "차이", "어디가", "유리")),
    ("자격조건", ("자격", "조건", "대상", "되나요", "가능한가", "가능할까", "제한", "요건")),
    ("절차방법", ("방법", "신청", "절차", "서류", "준비물", "어떻게", "하는법", "받는법")),
    ("한도금리", ("한도", "금리", "이자", "최대", "우대", "수수료")),
    ("사례후기", ("후기", "사례", "경험", "실제")),
    ("정의개념", ("뜻", "이란", "무엇", "의미", "개념")),
]

# 랜딩 페이지가 이 목록에 해당하면 "전용 페이지 없음" = 콘텐츠 공백 신호
_LISTING_PATHS = {
    "/", "/blog", "/calculator", "/guide", "/compare",
    "/policy", "/trend", "/hub", "/search",
}

_PAGE_TYPE_PREFIXES = [
    ("/blog/", "blog"),
    ("/calculator/", "calculator"),
    ("/guide/", "guide"),
    ("/compare/", "compare"),
    ("/policy/", "policy"),
    ("/trend/", "trend"),
    ("/hub/", "hub"),
]


def expected_ctr(position: float) -> float:
    pos = round(position)
    if pos < 1:
        return _EXPECTED_CTR[1]
    if pos > 10:
        return _BEYOND_10_CTR
    return _EXPECTED_CTR[pos]


def classify_intent(query: str) -> str:
    q = query.lower().replace(" ", "")
    for label, needles in _INTENT_RULES:
        if any(n.replace(" ", "") in q for n in needles):
            return label
    return "기타"


def page_path_of(page_url: str) -> str:
    return urlparse(page_url).path.rstrip("/") or "/"


def page_type_of(page_path: str) -> str:
    for prefix, ptype in _PAGE_TYPE_PREFIXES:
        if page_path.startswith(prefix):
            return ptype
    return "other"


def scan_site_routes(project_root: Path) -> list[str]:
    """app/ 디렉터리를 스캔해 실제 존재하는 라우트 목록을 만든다."""
    app_dir = project_root / "app"
    routes: list[str] = []
    if not app_dir.exists():
        return routes
    for page in app_dir.rglob("page.tsx"):
        rel = page.relative_to(app_dir).parent.as_posix()
        if rel == ".":
            routes.append("/")
            continue
        # 라우트 그룹 (foo) 는 URL에 안 나오므로 제거
        segments = [s for s in rel.split("/") if not (s.startswith("(") and s.endswith(")"))]
        routes.append("/" + "/".join(segments))
    return sorted(set(routes))


_TITLE_RE = re.compile(r"title:\s*['\"`](.+?)['\"`]", re.S)
_HEADING_RE = re.compile(r"<h[123][^>]*>([^<{]{2,80})</h[123]>")


def scan_site_pages(project_root: Path, limit_per_page: int = 8) -> list[dict]:
    """라우트별 제목·주요 헤딩을 뽑는다.

    '이 검색어에 대한 답이 우리 사이트에 있는가'를 판정하려면 경로 목록만으로는
    부족하다 — 페이지가 실제로 무엇을 다루는지 알아야 한다. layout.tsx 의 metadata
    title 과 page.tsx 의 h1~h3 텍스트면 그 판정에 충분하다.
    """
    app_dir = project_root / "app"
    if not app_dir.exists():
        return []

    out: list[dict] = []
    for page in app_dir.rglob("page.tsx"):
        rel = page.relative_to(app_dir).parent.as_posix()
        if rel == ".":
            path = "/"
        else:
            segments = [s for s in rel.split("/") if not (s.startswith("(") and s.endswith(")"))]
            path = "/" + "/".join(segments)
        # 동적 라우트·관리자 화면은 검색 유입 대조 대상이 아니다
        if "[" in path or path.startswith(("/admin", "/api")):
            continue

        try:
            body = page.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        title = ""
        layout = page.parent / "layout.tsx"
        for src in (layout, page):
            if not title and src.exists():
                try:
                    m = _TITLE_RE.search(src.read_text(encoding="utf-8", errors="replace"))
                except OSError:
                    m = None
                if m:
                    title = m.group(1).strip()
        headings = []
        for m in _HEADING_RE.finditer(body):
            h = " ".join(m.group(1).split())
            if h and h not in headings:
                headings.append(h)
            if len(headings) >= limit_per_page:
                break
        out.append({"path": path, "title": title, "headings": headings})
    return sorted(out, key=lambda r: r["path"])


class GSCInsight:
    def __init__(
        self,
        site_url: str,
        client_secret_path: str,
        token_path: str,
        min_impressions: int | None = None,
    ) -> None:
        import googleapiclient.discovery as discovery

        credentials = load_credentials(client_secret_path, token_path)
        self.site_url = site_url
        # None 이면 build() 에서 트래픽 규모에 맞춰 자동 결정
        self._min_impressions_override = min_impressions
        self.min_impressions = min_impressions or 0
        self._service = discovery.build(
            "searchconsole", "v1", credentials=credentials, cache_discovery=False
        )

    def _query(self, dimensions: list[str], start: date, end: date, row_limit: int = 25000) -> list[dict]:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": dimensions,
            "rowLimit": row_limit,
        }
        try:
            resp = (
                self._service.searchanalytics()
                .query(siteUrl=self.site_url, body=body)
                .execute()
            )
        except Exception as exc:
            print(f"[INSIGHT] API 호출 실패 ({'+'.join(dimensions)}): {exc}", flush=True)
            return []
        return resp.get("rows", [])

    @staticmethod
    def _agg(rows: list[dict], key_index: int = 0) -> dict[str, dict]:
        """GSC 행들을 키별로 합산. ctr/position 은 노출 가중 평균."""
        out: dict[str, dict] = {}
        for row in rows:
            keys = row.get("keys") or []
            if len(keys) <= key_index:
                continue
            k = keys[key_index]
            slot = out.setdefault(k, {"clicks": 0, "impressions": 0, "_pos_weighted": 0.0})
            imp = int(row.get("impressions", 0))
            slot["clicks"] += int(row.get("clicks", 0))
            slot["impressions"] += imp
            slot["_pos_weighted"] += float(row.get("position", 0.0)) * imp
        for slot in out.values():
            imp = slot["impressions"]
            slot["ctr"] = (slot["clicks"] / imp) if imp else 0.0
            slot["position"] = (slot["_pos_weighted"] / imp) if imp else 0.0
            slot.pop("_pos_weighted")
        return out

    def build(self, days: int, project_root: Path) -> dict:
        end = date.today() - timedelta(days=_DATA_LAG_DAYS)
        start = end - timedelta(days=days - 1)
        prev_end = start - timedelta(days=1)
        prev_start = prev_end - timedelta(days=days - 1)

        print(f"[INSIGHT] 현재 {start} ~ {end} / 비교 {prev_start} ~ {prev_end}", flush=True)

        q_now = self._agg(self._query(["query"], start, end))
        q_prev = self._agg(self._query(["query"], prev_start, prev_end))
        p_now = self._agg(self._query(["page"], start, end))
        p_prev = self._agg(self._query(["page"], prev_start, prev_end))
        device = self._agg(self._query(["device"], start, end))
        country = self._agg(self._query(["country"], start, end))
        qp_rows = self._query(["query", "page"], start, end)

        # 트래픽 규모에 맞춘 적응형 임계값 — 초기 사이트에서도 기회가 잡히게 한다.
        total_imp = sum(v["impressions"] for v in q_now.values())
        self.min_impressions = self._min_impressions_override or max(
            2, min(30, round(total_imp * 0.015))
        )
        print(f"[INSIGHT] 기회 판정 최소 노출 = {self.min_impressions} (총 노출 {total_imp})", flush=True)

        return {
            "generated_for": end.isoformat(),
            "generated_at": date.today().isoformat(),
            "site_url": self.site_url,
            "window": {"start": start.isoformat(), "end": end.isoformat(), "days": days},
            "previous_window": {"start": prev_start.isoformat(), "end": prev_end.isoformat()},
            "summary": self._summary(q_now, q_prev),
            "top_queries": self._top_queries(q_now, q_prev),
            "rising_queries": self._rising_queries(q_now, q_prev),
            "falling_queries": self._falling_queries(q_now, q_prev),
            "intent_breakdown": self._intent_breakdown(q_now),
            "top_pages": self._top_pages(p_now, p_prev),
            "page_type_breakdown": self._page_type_breakdown(p_now),
            "device_breakdown": self._simple_breakdown(device),
            "country_breakdown": self._simple_breakdown(country, limit=5),
            "thresholds": {"min_impressions": self.min_impressions},
            "opportunities": self._opportunities(q_now, qp_rows),
            "page_opportunities": self._page_opportunities(p_now, p_prev),
            "site_routes": scan_site_routes(project_root),
            "anomaly": self._anomaly(start, end),
            "coverage": self._coverage(q_now, project_root),
            "loop_state": self._loop_state(project_root),
        }

    def _anomaly(self, start: date, end: date) -> dict:
        """최근 7일 vs 직전 7일. 28일 창은 급변을 평균으로 덮어버리므로 따로 본다.

        급변은 '이번 회차에 반드시 사람이 봐야 하는가'를 가르는 신호라서,
        느린 추세와 분리해 두는 편이 판단에 훨씬 쓸모 있다.
        """
        a_end = end
        a_start = a_end - timedelta(days=6)
        b_end = a_start - timedelta(days=1)
        b_start = b_end - timedelta(days=6)

        recent = self._totals(self._agg(self._query(["query"], a_start, a_end)))
        prior = self._totals(self._agg(self._query(["query"], b_start, b_end)))

        def ratio(cur: float, prev: float) -> float | None:
            if not prev:
                return None
            return round((cur - prev) / prev, 3)

        imp_change = ratio(recent["impressions"], prior["impressions"])
        flags = []
        if imp_change is not None and abs(imp_change) >= 0.40:
            flags.append(f"7일 노출 {imp_change * 100:+.0f}% 급변")
        if prior["clicks"] >= 3 and recent["clicks"] == 0:
            flags.append("클릭이 0으로 소멸")
        if prior["impressions"] >= 20 and recent["impressions"] == 0:
            flags.append("노출이 0으로 소멸 — 색인 이탈 가능성")

        return {
            "recent_7d": {"start": a_start.isoformat(), "end": a_end.isoformat(), **recent},
            "prior_7d": {"start": b_start.isoformat(), "end": b_end.isoformat(), **prior},
            "impressions_change": imp_change,
            "flags": flags,
        }

    def _coverage(self, now: dict, project_root: Path) -> dict:
        """'답이 우리 사이트에 있는데 못 찾은 것' vs '아예 없는 것' 구분.

        이 구분이 처방을 완전히 갈라놓는다 — 전자는 랭킹·동선 문제이고
        후자는 콘텐츠 공백이다. 규칙으로는 판별할 수 없어 LLM 을 쓰며,
        키가 없으면 판정 없이 재료(페이지 목록)만 넘겨 에이전트가 직접 보게 한다.
        """
        pages = scan_site_pages(project_root)
        queries = [q for q, v in sorted(now.items(), key=lambda kv: -kv[1]["impressions"])
                   if v["impressions"] >= self.min_impressions][:60]

        if not llm_client.is_available():
            return {
                "available": False,
                "reason": llm_client.unavailable_reason(),
                "site_pages": pages,
                "assessed_queries": queries,
                "verdicts": {},
            }

        print(f"[INSIGHT] 커버리지 판정 중 (검색어 {len(queries)}개 × 페이지 {len(pages)}개)...", flush=True)
        verdicts = llm_client.assess_coverage(queries, pages)
        counts = {"covered": 0, "partial": 0, "missing": 0}
        for v in verdicts.values():
            counts[v["verdict"]] = counts.get(v["verdict"], 0) + 1
        return {
            "available": True,
            "site_pages": pages,
            "assessed_queries": queries,
            "verdicts": verdicts,
            "counts": counts,
        }

    @staticmethod
    def _loop_state(project_root: Path) -> dict:
        """진행 중인 실험·동결 대상·판정 대기. 리포트만 보고 같은 곳을 또 건드리는
        사고를 막으려면 이 정보가 리포트 안에 함께 있어야 한다."""
        decisions = st.load_decisions(project_root)
        changed = st.backfill_deployed_at(project_root, decisions)
        for d in changed:
            st.save_decision(project_root, d)
        today = date.today()
        st.refresh_statuses(decisions, today)
        can_new, note = st.can_open_new(decisions)
        return {
            "open_experiments": [
                {"id": d.get("id"), "grade": d.get("grade"), "status": d.get("status"),
                 "hypothesis": d.get("hypothesis"),
                 "deployed_at": d.get("deployed_at"), "evaluate_at": d.get("evaluate_at")}
                for d in st.open_experiments(decisions)
            ],
            "verdict_due": [d.get("id") for d in decisions if d.get("status") == st.STATUS_DUE],
            "frozen": st.frozen_targets(decisions, today),
            "can_open_new_decision": can_new,
            "quota_note": note,
            "max_new_decisions_per_run": st.MAX_NEW_DECISIONS_PER_RUN,
        }

    # ---------- 섹션별 분석 ----------

    @staticmethod
    def _totals(agg: dict[str, dict]) -> dict:
        clicks = sum(v["clicks"] for v in agg.values())
        impressions = sum(v["impressions"] for v in agg.values())
        pos_w = sum(v["position"] * v["impressions"] for v in agg.values())
        return {
            "clicks": clicks,
            "impressions": impressions,
            "ctr": (clicks / impressions) if impressions else 0.0,
            "position": (pos_w / impressions) if impressions else 0.0,
            "query_count": len(agg),
        }

    def _summary(self, now: dict, prev: dict) -> dict:
        t_now = self._totals(now)
        t_prev = self._totals(prev)

        def delta(key: str) -> float:
            a, b = t_now[key], t_prev[key]
            if not b:
                return 0.0 if not a else 100.0
            return round((a - b) / b * 100, 1)

        return {
            "current": t_now,
            "previous": t_prev,
            "delta_pct": {
                "clicks": delta("clicks"),
                "impressions": delta("impressions"),
                "query_count": delta("query_count"),
            },
            "ctr_change_pt": round((t_now["ctr"] - t_prev["ctr"]) * 100, 2),
            "position_change": round(t_now["position"] - t_prev["position"], 2),
        }

    @staticmethod
    def _row(query: str, cur: dict, prev: dict | None = None) -> dict:
        prev = prev or {}
        return {
            "query": query,
            "intent": classify_intent(query),
            "clicks": cur.get("clicks", 0),
            "impressions": cur.get("impressions", 0),
            "ctr": round(cur.get("ctr", 0.0), 4),
            "position": round(cur.get("position", 0.0), 1),
            "clicks_prev": prev.get("clicks", 0),
            "impressions_prev": prev.get("impressions", 0),
        }

    def _top_queries(self, now: dict, prev: dict, limit: int = 25) -> list[dict]:
        ranked = sorted(now.items(), key=lambda kv: (-kv[1]["clicks"], -kv[1]["impressions"]))
        return [self._row(q, v, prev.get(q)) for q, v in ranked[:limit]]

    def _rising_queries(self, now: dict, prev: dict, limit: int = 20) -> list[dict]:
        rising = []
        for q, v in now.items():
            if v["impressions"] < 10:
                continue
            p = prev.get(q, {"clicks": 0, "impressions": 0})
            imp_gain = v["impressions"] - p["impressions"]
            click_gain = v["clicks"] - p["clicks"]
            if imp_gain <= 0 and click_gain <= 0:
                continue
            row = self._row(q, v, p)
            row["is_new"] = p["impressions"] == 0
            row["impression_gain"] = imp_gain
            row["click_gain"] = click_gain
            row["_score"] = click_gain * 10 + imp_gain
            rising.append(row)
        rising.sort(key=lambda r: -r["_score"])
        for r in rising:
            r.pop("_score", None)
        return rising[:limit]

    def _falling_queries(self, now: dict, prev: dict, limit: int = 10) -> list[dict]:
        falling = []
        for q, p in prev.items():
            if p["clicks"] < 2:
                continue
            v = now.get(q, {})
            drop = p["clicks"] - v.get("clicks", 0)
            if drop <= 0:
                continue
            row = self._row(q, v, p)
            row["click_drop"] = drop
            falling.append(row)
        falling.sort(key=lambda r: -r["click_drop"])
        return falling[:limit]

    @staticmethod
    def _intent_breakdown(now: dict) -> list[dict]:
        buckets: dict[str, dict] = defaultdict(
            lambda: {"clicks": 0, "impressions": 0, "queries": 0, "samples": []}
        )
        for q, v in now.items():
            b = buckets[classify_intent(q)]
            b["clicks"] += v["clicks"]
            b["impressions"] += v["impressions"]
            b["queries"] += 1
            b["samples"].append((v["impressions"], q))
        out = []
        for label, b in buckets.items():
            samples = [q for _, q in sorted(b["samples"], reverse=True)[:5]]
            out.append({
                "intent": label,
                "clicks": b["clicks"],
                "impressions": b["impressions"],
                "queries": b["queries"],
                "ctr": round(b["clicks"] / b["impressions"], 4) if b["impressions"] else 0.0,
                "sample_queries": samples,
            })
        out.sort(key=lambda r: -r["impressions"])
        return out

    def _top_pages(self, now: dict, prev: dict, limit: int = 20) -> list[dict]:
        ranked = sorted(now.items(), key=lambda kv: (-kv[1]["clicks"], -kv[1]["impressions"]))
        rows = []
        for url, v in ranked[:limit]:
            p = prev.get(url, {"clicks": 0, "impressions": 0})
            path = page_path_of(url)
            rows.append({
                "path": path,
                "page_type": page_type_of(path),
                "clicks": v["clicks"],
                "impressions": v["impressions"],
                "ctr": round(v["ctr"], 4),
                "position": round(v["position"], 1),
                "clicks_prev": p["clicks"],
                "click_delta": v["clicks"] - p["clicks"],
            })
        return rows

    @staticmethod
    def _page_type_breakdown(now: dict) -> list[dict]:
        buckets: dict[str, dict] = defaultdict(lambda: {"clicks": 0, "impressions": 0, "pages": 0})
        for url, v in now.items():
            b = buckets[page_type_of(page_path_of(url))]
            b["clicks"] += v["clicks"]
            b["impressions"] += v["impressions"]
            b["pages"] += 1
        out = [
            {
                "page_type": t,
                "clicks": b["clicks"],
                "impressions": b["impressions"],
                "pages": b["pages"],
                "ctr": round(b["clicks"] / b["impressions"], 4) if b["impressions"] else 0.0,
            }
            for t, b in buckets.items()
        ]
        out.sort(key=lambda r: -r["impressions"])
        return out

    @staticmethod
    def _simple_breakdown(agg: dict[str, dict], limit: int = 10) -> list[dict]:
        ranked = sorted(agg.items(), key=lambda kv: -kv[1]["impressions"])[:limit]
        return [
            {
                "key": k,
                "clicks": v["clicks"],
                "impressions": v["impressions"],
                "ctr": round(v["ctr"], 4),
                "position": round(v["position"], 1),
            }
            for k, v in ranked
        ]

    def _opportunities(self, now: dict, qp_rows: list[dict]) -> dict:
        """관측된 신호 4종.

        여기서는 **처방하지 않는다.** 예전에는 각 항목에 action_hint 로
        "제목을 고쳐라" 같은 지시를 박아 넣었는데, 그러면 판단이 파이썬 임계값
        안에서 끝나 버리고 LLM 은 룩업 테이블 실행기로 전락한다.
        이 함수의 책임은 '무엇이 관측됐는가'까지다. '왜 그런가'와 '무엇을 할 것인가'는
        데이터를 다 보고 나서 에이전트가 정한다.
        """
        # 검색어 -> 최다 노출 랜딩 페이지 매핑
        best_page: dict[str, tuple[str, int]] = {}
        for row in qp_rows:
            keys = row.get("keys") or []
            if len(keys) < 2:
                continue
            q, url = keys[0], keys[1]
            imp = int(row.get("impressions", 0))
            if q not in best_page or imp > best_page[q][1]:
                best_page[q] = (page_path_of(url), imp)

        ctr_gap, striking, zero_click, content_gap = [], [], [], []
        min_imp = self.min_impressions

        for q, v in now.items():
            imp, pos, ctr, clicks = v["impressions"], v["position"], v["ctr"], v["clicks"]
            landing = best_page.get(q, ("(unknown)", 0))[0]
            base = {
                "query": q,
                "intent": classify_intent(q),
                "impressions": imp,
                "clicks": clicks,
                "ctr": round(ctr, 4),
                "position": round(pos, 1),
                "landing_page": landing,
            }

            # 1) 순위 대비 클릭이 기대치 이하
            if imp >= min_imp and pos <= 15 and ctr < expected_ctr(pos) * 0.6:
                ctr_gap.append({
                    **base,
                    "expected_ctr": round(expected_ctr(pos), 4),
                    "observation": (
                        f"순위 {pos:.1f}위의 기대 CTR 은 {expected_ctr(pos) * 100:.1f}% 인데 "
                        f"실제는 {ctr * 100:.2f}%"
                    ),
                })

            # 2) 4~20위 구간
            if imp >= min_imp and 4.0 <= pos <= 20.0:
                striking.append({
                    **base,
                    "observation": f"1페이지 경계({pos:.1f}위) — 노출 {imp}",
                })

            # 3) 노출은 되는데 클릭 0
            if imp >= min_imp and clicks == 0:
                zero_click.append({
                    **base,
                    "observation": (
                        f"노출 {imp}, 클릭 0, 순위 {pos:.1f}위"
                        + ("(20위 밖 — 클릭 기회 자체가 희박한 구간)" if pos > 20
                           else "(20위 안 — 노출은 확보된 구간)")
                    ),
                })

            # 4) 랜딩이 홈/목록 페이지
            if imp >= min_imp and landing in _LISTING_PATHS:
                content_gap.append({
                    **base,
                    "observation": f"랜딩이 목록/홈({landing}) — 구글이 전용 페이지를 고르지 못함",
                })

        for bucket in (ctr_gap, striking, zero_click, content_gap):
            bucket.sort(key=lambda r: -r["impressions"])

        return {
            "ctr_gap": ctr_gap[:15],
            "striking_distance": striking[:15],
            "zero_click": zero_click[:15],
            "content_gap": content_gap[:15],
        }

    def _page_opportunities(self, now: dict, prev: dict) -> dict:
        """페이지 단위 기회. 검색어 단위 데이터는 GSC 프라이버시 필터로 잘리므로
        페이지 차원이 더 많은 노출을 담고 있다 — 양쪽을 함께 본다."""
        min_imp = self.min_impressions
        buried, ctr_gap, decaying = [], [], []

        for url, v in now.items():
            path = page_path_of(url)
            imp, pos, ctr, clicks = v["impressions"], v["position"], v["ctr"], v["clicks"]
            base = {
                "path": path,
                "page_type": page_type_of(path),
                "impressions": imp,
                "clicks": clicks,
                "ctr": round(ctr, 4),
                "position": round(pos, 1),
            }

            # 수요는 있는데 순위가 2페이지 밖 -> 콘텐츠 자체가 얕거나 타겟팅이 흐림
            if imp >= min_imp and pos > 20:
                buried.append({
                    **base,
                    "observation": f"노출 {imp}인데 순위 {pos:.1f}위 — 2페이지 밖",
                })

            # 순위는 확보했는데 클릭이 기대치 이하
            if imp >= min_imp and pos <= 20 and ctr < expected_ctr(pos) * 0.6:
                ctr_gap.append({
                    **base,
                    "expected_ctr": round(expected_ctr(pos), 4),
                    "observation": f"순위 {pos:.1f}위 확보, CTR {ctr * 100:.2f}% (기대 {expected_ctr(pos) * 100:.1f}%)",
                })

            # 지난 구간 대비 클릭 하락
            p = prev.get(url, {"clicks": 0})
            if p.get("clicks", 0) >= 2 and clicks < p["clicks"]:
                decaying.append({
                    **base,
                    "clicks_prev": p["clicks"],
                    "click_drop": p["clicks"] - clicks,
                    "observation": f"클릭 {p['clicks']} → {clicks} 로 하락",
                })

        buried.sort(key=lambda r: -r["impressions"])
        ctr_gap.sort(key=lambda r: -r["impressions"])
        decaying.sort(key=lambda r: -r["click_drop"])

        return {
            "buried": buried[:15],
            "ctr_gap": ctr_gap[:15],
            "decaying": decaying[:10],
        }


# ---------- 마크다운 렌더링 ----------


def _pct(x: float) -> str:
    return f"{x * 100:.2f}%"


def _signed(x: float, unit: str = "") -> str:
    return f"{'+' if x >= 0 else ''}{x}{unit}"


def render_markdown(r: dict) -> str:
    s = r["summary"]
    cur, prev, d = s["current"], s["previous"], s["delta_pct"]
    w, pw = r["window"], r["previous_window"]

    lines: list[str] = []
    add = lines.append

    add(f"# GSC 일일 인사이트 — {r['generated_for']} 기준")
    add("")
    add(f"- 사이트: `{r['site_url']}`")
    add(f"- 분석 구간: **{w['start']} ~ {w['end']}** ({w['days']}일)")
    add(f"- 비교 구간: {pw['start']} ~ {pw['end']}")
    add("")

    # 루프 상태를 맨 앞에 둔다 — 무엇을 건드리면 안 되는지가 다른 무엇보다 먼저다.
    loop = r.get("loop_state") or {}
    if loop:
        add("## 0. 루프 상태")
        add("")
        add(f"- {loop.get('quota_note', '')}")
        if loop.get("verdict_due"):
            add(f"- **판정 기일 도래: {', '.join(loop['verdict_due'])}**")
        for e in loop.get("open_experiments") or []:
            add(f"  - `{e['id']}` [{e.get('grade')}] {e.get('status')} "
                f"— 배포 {e.get('deployed_at') or '대기'} / 판정 {e.get('evaluate_at') or '미정'}")
        fz = loop.get("frozen") or {}
        if fz.get("pages") or fz.get("queries"):
            add("- 🔒 **수정 금지 대상**: "
                + ", ".join(f"`{k}`(~{v})" for k, v in
                            list((fz.get("pages") or {}).items())[:10]))
        add("")

    anomaly = r.get("anomaly") or {}
    if anomaly.get("flags"):
        add("## 0-1. 급변 감지 (최근 7일)")
        add("")
        for f in anomaly["flags"]:
            add(f"- ⚠️ {f}")
        rc, pr = anomaly["recent_7d"], anomaly["prior_7d"]
        add(f"- 최근 7일 노출 {rc['impressions']} / 클릭 {rc['clicks']} "
            f"↔ 직전 7일 노출 {pr['impressions']} / 클릭 {pr['clicks']}")
        add("")

    if cur["impressions"] == 0:
        add("> ⚠️ 이 구간에 노출 데이터가 없습니다. GSC 색인 상태 또는 사이트 속성 설정을 확인하세요.")
        add("")
        return "\n".join(lines)

    cov = r.get("coverage") or {}
    if cov.get("available") and cov.get("verdicts"):
        counts = cov.get("counts") or {}
        add("## 0-2. 커버리지 — 답이 사이트에 있었는가")
        add("")
        add(f"- 답이 있음(covered) {counts.get('covered', 0)} · "
            f"부분적(partial) {counts.get('partial', 0)} · "
            f"없음(missing) {counts.get('missing', 0)}")
        add("")
        add("| 검색어 | 판정 | 최적 페이지 | 근거 |")
        add("|---|---|---|---|")
        for q, v in list(cov["verdicts"].items())[:20]:
            add(f"| {q} | {v['verdict']} | {v.get('best_page') or '—'} | {v.get('why', '')} |")
        add("")
    elif cov and not cov.get("available"):
        add(f"> ℹ️ 커버리지 자동 판정 비활성 ({cov.get('reason', '')}) — "
            f"에이전트가 site_pages 를 직접 읽고 판단해야 합니다.")
        add("")

    add("## 1. 요약")
    add("")
    add("| 지표 | 현재 | 이전 | 변화 |")
    add("|---|---:|---:|---:|")
    add(f"| 클릭 | {cur['clicks']:,} | {prev['clicks']:,} | {_signed(d['clicks'], '%')} |")
    add(f"| 노출 | {cur['impressions']:,} | {prev['impressions']:,} | {_signed(d['impressions'], '%')} |")
    add(f"| CTR | {_pct(cur['ctr'])} | {_pct(prev['ctr'])} | {_signed(s['ctr_change_pt'], 'pt')} |")
    add(f"| 평균 순위 | {cur['position']:.1f} | {prev['position']:.1f} | {_signed(s['position_change'])} |")
    add(f"| 유입 검색어 수 | {cur['query_count']:,} | {prev['query_count']:,} | {_signed(d['query_count'], '%')} |")
    add("")

    add("## 2. 사용자 니즈 (검색 의도 분포)")
    add("")
    add("| 의도 | 노출 | 클릭 | CTR | 검색어 수 | 대표 검색어 |")
    add("|---|---:|---:|---:|---:|---|")
    for b in r["intent_breakdown"]:
        samples = ", ".join(b["sample_queries"][:3])
        add(f"| {b['intent']} | {b['impressions']:,} | {b['clicks']:,} | {_pct(b['ctr'])} | {b['queries']} | {samples} |")
    add("")

    add("## 3. 유입 검색어 TOP")
    add("")
    add("| 검색어 | 의도 | 클릭 | 노출 | CTR | 순위 |")
    add("|---|---|---:|---:|---:|---:|")
    for q in r["top_queries"][:15]:
        add(f"| {q['query']} | {q['intent']} | {q['clicks']} | {q['impressions']} | {_pct(q['ctr'])} | {q['position']} |")
    add("")

    if r["rising_queries"]:
        add("## 4. 급상승 검색어")
        add("")
        add("| 검색어 | 의도 | 노출 증가 | 클릭 증가 | 순위 | 신규 |")
        add("|---|---|---:|---:|---:|:---:|")
        for q in r["rising_queries"][:12]:
            add(f"| {q['query']} | {q['intent']} | {_signed(q['impression_gain'])} | {_signed(q['click_gain'])} | {q['position']} | {'🆕' if q['is_new'] else ''} |")
        add("")

    if r["falling_queries"]:
        add("## 5. 하락 검색어")
        add("")
        add("| 검색어 | 클릭 감소 | 현재 클릭 | 순위 |")
        add("|---|---:|---:|---:|")
        for q in r["falling_queries"][:8]:
            add(f"| {q['query']} | -{q['click_drop']} | {q['clicks']} | {q['position']} |")
        add("")

    add("## 6. 페이지 성과")
    add("")
    add("| 페이지 | 타입 | 클릭 | 증감 | 노출 | CTR | 순위 |")
    add("|---|---|---:|---:|---:|---:|---:|")
    for p in r["top_pages"][:15]:
        add(f"| {p['path']} | {p['page_type']} | {p['clicks']} | {_signed(p['click_delta'])} | {p['impressions']} | {_pct(p['ctr'])} | {p['position']} |")
    add("")

    add("### 페이지 타입별 집계")
    add("")
    add("| 타입 | 노출 | 클릭 | CTR | 페이지 수 |")
    add("|---|---:|---:|---:|---:|")
    for b in r["page_type_breakdown"]:
        add(f"| {b['page_type']} | {b['impressions']:,} | {b['clicks']:,} | {_pct(b['ctr'])} | {b['pages']} |")
    add("")

    add("## 7. 유입 형태")
    add("")
    dev = " · ".join(f"{b['key']} {b['impressions']:,}노출/{b['clicks']}클릭" for b in r["device_breakdown"])
    ctry = " · ".join(f"{b['key']} {b['impressions']:,}" for b in r["country_breakdown"])
    add(f"- 디바이스: {dev or '데이터 없음'}")
    add(f"- 국가: {ctry or '데이터 없음'}")
    add("")

    opp = r["opportunities"]
    add("## 8. 개선 기회 — 검색어 단위 (실행 대상)")
    add("")
    add(f"_기회 판정 최소 노출: {r.get('thresholds', {}).get('min_impressions', '-')}회 (트래픽 규모에 맞춰 자동 조정)_")
    add("")

    sections = [
        ("8-1. CTR 갭 — 순위 대비 클릭 부족 (제목/메타 문제)", opp["ctr_gap"], "expected_ctr"),
        ("8-2. 스트라이킹 디스턴스 — 4~20위, 보강 시 상위 진입", opp["striking_distance"], None),
        ("8-3. 노출은 있는데 클릭 0 — 의도 불일치", opp["zero_click"], None),
        ("8-4. 콘텐츠 공백 — 목록/홈으로 떨어지는 검색어", opp["content_gap"], None),
    ]
    for title, rows, extra in sections:
        add(f"### {title}")
        add("")
        if not rows:
            add("해당 없음")
            add("")
            continue
        header = "| 검색어 | 의도 | 노출 | CTR | 순위 | 랜딩 |"
        sep = "|---|---|---:|---:|---:|---|"
        if extra:
            header = "| 검색어 | 의도 | 노출 | CTR | 기대 CTR | 순위 | 랜딩 |"
            sep = "|---|---|---:|---:|---:|---:|---|"
        add(header)
        add(sep)
        for o in rows[:10]:
            if extra:
                add(f"| {o['query']} | {o['intent']} | {o['impressions']} | {_pct(o['ctr'])} | {_pct(o['expected_ctr'])} | {o['position']} | {o['landing_page']} |")
            else:
                add(f"| {o['query']} | {o['intent']} | {o['impressions']} | {_pct(o['ctr'])} | {o['position']} | {o['landing_page']} |")
        add("")

    popp = r.get("page_opportunities", {})
    add("## 9. 개선 기회 — 페이지 단위")
    add("")
    page_sections = [
        ("9-1. 수요 대비 순위 미달 (20위 밖)", popp.get("buried", [])),
        ("9-2. 순위 확보했으나 CTR 미달", popp.get("ctr_gap", [])),
        ("9-3. 클릭 하락 페이지", popp.get("decaying", [])),
    ]
    for title, rows in page_sections:
        add(f"### {title}")
        add("")
        if not rows:
            add("해당 없음")
            add("")
            continue
        add("| 페이지 | 타입 | 노출 | 클릭 | CTR | 순위 | 관측 |")
        add("|---|---|---:|---:|---:|---:|---|")
        for o in rows[:10]:
            add(f"| {o['path']} | {o['page_type']} | {o['impressions']} | {o['clicks']} | {_pct(o['ctr'])} | {o['position']} | {o.get('observation', '')} |")
        add("")

    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="ohyess.kr GSC 일일 인사이트 리포트")
    # 28일: 현재 트래픽에서 14일 창은 노출 ~87 로 잡음이 신호를 덮는다.
    p.add_argument("--days", type=int, default=28, help="분석 구간 길이 (일, 기본 28)")
    p.add_argument("--out", default="reports/gsc", help="리포트 출력 디렉터리")
    p.add_argument(
        "--min-impressions",
        type=int,
        default=None,
        help="기회 판정 최소 노출 수 (미지정 시 트래픽 규모에 맞춰 자동)",
    )
    return p


def main() -> int:
    args = build_parser().parse_args()
    config = load_config()

    if not config.gsc_site_url:
        print("[INSIGHT] GSC_SITE_URL 환경변수가 없습니다 (.env.local 확인)", flush=True)
        return 1

    insight = GSCInsight(
        site_url=config.gsc_site_url,
        client_secret_path=config.gsc_client_secret_path,
        token_path=config.gsc_token_path,
        min_impressions=args.min_impressions,
    )
    report = insight.build(days=args.days, project_root=config.project_root)

    out_dir = config.project_root / args.out
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = report["generated_for"]

    json_path = out_dir / f"{stamp}.json"
    md_path = out_dir / f"{stamp}.md"
    md = render_markdown(report)

    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(md, encoding="utf-8")
    (out_dir / "latest.md").write_text(md, encoding="utf-8")
    (out_dir / "latest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    s = report["summary"]["current"]
    print(f"[INSIGHT] 리포트 생성 완료: {md_path}", flush=True)
    print(
        f"[INSIGHT] 클릭 {s['clicks']} / 노출 {s['impressions']} / "
        f"CTR {s['ctr'] * 100:.2f}% / 평균순위 {s['position']:.1f}",
        flush=True,
    )
    opp = report["opportunities"]
    print(
        f"[INSIGHT] 기회: CTR갭 {len(opp['ctr_gap'])} · "
        f"스트라이킹 {len(opp['striking_distance'])} · "
        f"무클릭 {len(opp['zero_click'])} · 공백 {len(opp['content_gap'])}",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
