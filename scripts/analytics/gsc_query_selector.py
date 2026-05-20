"""
Supabase gsc_search_queries 테이블에서 콘텐츠 공백이 있는 검색어를 선정한다.

선정 기준:
  - impressions 높음 (사람들이 많이 검색)
  - ctr 낮음 (우리 사이트를 클릭하지 않음 = 제대로 된 답변 없음)
  - position 5위 이하 (상위 노출 안 됨)
  - 이미 발행된 주제와 겹치지 않음
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError


class GSCQuerySelector:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.supabase_url = supabase_url.rstrip("/")
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }

    def pick_best_query(
        self,
        excluded_topics: list[str] | None = None,
        table: str = "gsc_search_queries",
        min_impressions: int = 30,
        max_ctr: float = 0.08,
        min_position: float = 4.0,
        limit: int = 50,
    ) -> str | None:
        """
        콘텐츠 공백이 가장 큰 검색어 1개 반환.
        조건에 맞는 쿼리가 없으면 None 반환.
        """
        candidates = self._fetch_candidates(table, min_impressions, max_ctr, min_position, limit)
        if not candidates:
            print("[GSC-SELECT] 조건에 맞는 쿼리 없음 - Tavily 폴백 사용", flush=True)
            return None

        published_lower = [t.lower() for t in (excluded_topics or [])]
        for row in candidates:
            q = row["query"]
            q_lower = q.lower()
            if any(q_lower in p or p in q_lower for p in published_lower):
                continue
            print(f"[GSC-SELECT] 선택된 쿼리: '{q}' (노출 {row['impressions']}회, CTR {row['ctr']:.1%}, 순위 {row['position']:.1f}위)", flush=True)
            return q

        print("[GSC-SELECT] 미발행 후보 없음 - Tavily 폴백 사용", flush=True)
        return None

    def _fetch_candidates(
        self, table: str, min_impressions: int, max_ctr: float, min_position: float, limit: int
    ) -> list[dict]:
        url = (
            f"{self.supabase_url}/rest/v1/{table}"
            f"?select=query,impressions,ctr,position"
            f"&order=impressions.desc&limit={limit * 10}"
        )
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=15) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8")
            print(f"[GSC-SELECT] Supabase 조회 실패 ({e.code}): {body}", flush=True)
            return []

        agg: dict[str, dict] = {}
        for row in rows:
            q = row["query"]
            if q not in agg:
                agg[q] = {"query": q, "impressions": 0, "ctr_sum": 0.0, "pos_sum": 0.0, "count": 0}
            agg[q]["impressions"] += row["impressions"]
            agg[q]["ctr_sum"] += row["ctr"]
            agg[q]["pos_sum"] += row["position"]
            agg[q]["count"] += 1

        results = []
        for a in agg.values():
            n = a["count"]
            avg_ctr = a["ctr_sum"] / n
            avg_pos = a["pos_sum"] / n
            if a["impressions"] >= min_impressions and avg_ctr <= max_ctr and avg_pos >= min_position:
                results.append({
                    "query": a["query"],
                    "impressions": a["impressions"],
                    "ctr": avg_ctr,
                    "position": avg_pos,
                })

        results.sort(key=lambda x: x["impressions"], reverse=True)
        return results[:limit]
