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
  python -m scripts.analytics.gsc_daily_insight --days 7 --out reports/gsc
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from scripts.pipeline.config import load_config
from scripts.analytics.gsc_collector import load_credentials

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
        """행동 가능한 개선 기회 4종."""
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

            # 1) 순위는 괜찮은데 클릭이 기대치 이하 -> 제목/메타 문제
            if imp >= min_imp and pos <= 15 and ctr < expected_ctr(pos) * 0.6:
                ctr_gap.append({
                    **base,
                    "expected_ctr": round(expected_ctr(pos), 4),
                    "action_hint": "제목/메타디스크립션 재작성 — 검색어를 제목 앞부분에 노출",
                })

            # 2) 4~20위 = 조금만 보강하면 상위 진입
            if imp >= min_imp and 4.0 <= pos <= 20.0:
                striking.append({
                    **base,
                    "action_hint": "랜딩 페이지에 이 검색어 전용 섹션·FAQ 추가로 관련성 강화",
                })

            # 3) 노출은 되는데 클릭 0 -> 검색 의도와 페이지 불일치 (순위 문제와 구분)
            if imp >= min_imp and clicks == 0:
                reason = (
                    "순위가 낮아 클릭 기회 자체가 없음 — 콘텐츠 깊이·내부링크 보강"
                    if pos > 20
                    else "노출 순위는 확보됐으나 클릭 없음 — 제목/스니펫이 의도와 불일치"
                )
                zero_click.append({**base, "action_hint": reason})

            # 4) 랜딩이 홈/목록 페이지 -> 이 주제 전용 페이지가 없음
            if imp >= min_imp and landing in _LISTING_PATHS:
                content_gap.append({
                    **base,
                    "action_hint": "전용 상세 페이지(계산기/가이드) 신설 후보",
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
                    "action_hint": "수요 대비 순위 미달 — 검색어 타겟 섹션 추가·내부링크 유입 강화",
                })

            # 순위는 확보했는데 클릭이 기대치 이하
            if imp >= min_imp and pos <= 20 and ctr < expected_ctr(pos) * 0.6:
                ctr_gap.append({
                    **base,
                    "expected_ctr": round(expected_ctr(pos), 4),
                    "action_hint": "metadata title/description 재작성",
                })

            # 지난 구간 대비 클릭 하락
            p = prev.get(url, {"clicks": 0})
            if p.get("clicks", 0) >= 2 and clicks < p["clicks"]:
                decaying.append({
                    **base,
                    "clicks_prev": p["clicks"],
                    "click_drop": p["clicks"] - clicks,
                    "action_hint": "콘텐츠 신선도 갱신(최신 수치·날짜) 검토",
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

    if cur["impressions"] == 0:
        add("> ⚠️ 이 구간에 노출 데이터가 없습니다. GSC 색인 상태 또는 사이트 속성 설정을 확인하세요.")
        add("")
        return "\n".join(lines)

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
        add("| 페이지 | 타입 | 노출 | 클릭 | CTR | 순위 | 조치 |")
        add("|---|---|---:|---:|---:|---:|---|")
        for o in rows[:10]:
            add(f"| {o['path']} | {o['page_type']} | {o['impressions']} | {o['clicks']} | {_pct(o['ctr'])} | {o['position']} | {o['action_hint']} |")
        add("")

    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="ohyess.kr GSC 일일 인사이트 리포트")
    p.add_argument("--days", type=int, default=7, help="분석 구간 길이 (일, 기본 7)")
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
