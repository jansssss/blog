"""
post_performance 데이터에서 고성과 제목 패턴 + 카테고리 성과를 분석해 writer 힌트를 생성한다.

핵심 지표: 순위 대비 실제 클릭율 (position-adjusted CTR quality score)
  quality_score = avg_ctr / expected_ctr_at(avg_position)

  → 6위에서 CTR 13% = 기대치(6.5%) 대비 2.0배 = 진짜 좋은 제목
  → 1위에서 CTR 28% = 평범한 성과 (기대치와 일치)

  blog는 posts 테이블에 category가 저장되어 있으므로
  카테고리별 평균 quality_score도 함께 분석한다.

활성화 조건: 클릭 10회 이상인 포스트가 5개 이상일 때만 힌트 생성
  → 데이터 불충분 시 None 반환, 파이프라인 기존 동작 유지
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError

# 구글 검색 결과 순위별 기대 CTR (업계 표준 참고값, index = 검색 순위)
_EXPECTED_CTR = [0, 0.28, 0.15, 0.10, 0.08, 0.065, 0.05, 0.04, 0.035, 0.03, 0.025]
_BEYOND_10_CTR = 0.02   # 11위 이하 기대 CTR

_MIN_QUALIFIED = 5   # 힌트 생성을 위한 최소 적격 포스트 수
_MIN_CLICKS = 10     # 통계적 신뢰를 위한 포스트당 최소 총 클릭 수


def _expected_ctr(avg_position: float) -> float:
    pos = max(1, min(10, round(avg_position)))
    return _EXPECTED_CTR[pos] if pos <= 10 else _BEYOND_10_CTR


class PerformanceAnalyzer:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.supabase_url = supabase_url.rstrip("/")
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }

    def get_writing_hints(
        self,
        performance_table: str = "post_performance",
        slug_column: str = "post_slug",
        posts_table: str = "posts",
    ) -> str | None:
        """
        고성과 제목 패턴 + 카테고리 성과 분석 결과를 writer 프롬프트용 문자열로 반환.
        데이터 불충분 시 None 반환 (파이프라인 기존 동작 유지).
        """
        perf_rows = self._fetch_performance(performance_table, slug_column)
        if not perf_rows:
            return None

        # slug별 집계: 총 클릭, 평균 CTR, 평균 순위
        agg: dict[str, dict] = {}
        for row in perf_rows:
            slug = row[slug_column]
            if slug not in agg:
                agg[slug] = {"clicks": 0, "ctr_sum": 0.0, "pos_sum": 0.0, "count": 0}
            agg[slug]["clicks"] += row["clicks"]
            agg[slug]["ctr_sum"] += row["ctr"]
            agg[slug]["pos_sum"] += row["position"]
            agg[slug]["count"] += 1

        # 최소 클릭 필터 + quality_score 계산
        qualified: list[dict] = []
        for slug, a in agg.items():
            if a["clicks"] < _MIN_CLICKS:
                continue
            n = a["count"]
            avg_ctr = a["ctr_sum"] / n
            avg_pos = a["pos_sum"] / n
            quality_score = avg_ctr / _expected_ctr(avg_pos)
            qualified.append({
                "slug": slug,
                "clicks": a["clicks"],
                "avg_ctr": avg_ctr,
                "avg_position": avg_pos,
                "quality_score": quality_score,
            })

        if len(qualified) < _MIN_QUALIFIED:
            print(
                f"[PERF-ANALYZER] 데이터 부족 "
                f"({len(qualified)}개 < {_MIN_QUALIFIED}개) - 힌트 생략",
                flush=True,
            )
            return None

        # quality_score 상위 5개 선정
        top = sorted(qualified, key=lambda x: x["quality_score"], reverse=True)[:5]
        slugs = [r["slug"] for r in top]
        meta = self._fetch_post_meta(posts_table, slugs)

        top_with_meta = [r for r in top if r["slug"] in meta]
        if not top_with_meta:
            return None

        print(
            f"[PERF-ANALYZER] 고성과 포스트 {len(top_with_meta)}개 분석 완료",
            flush=True,
        )

        # 카테고리별 평균 quality_score 집계
        cat_scores: dict[str, list[float]] = {}
        for r in top_with_meta:
            cat = meta[r["slug"]].get("category")
            if cat:
                cat_scores.setdefault(cat, []).append(r["quality_score"])

        top_cats = sorted(
            [(cat, sum(scores) / len(scores)) for cat, scores in cat_scores.items()],
            key=lambda x: x[1],
            reverse=True,
        )[:3]

        # 힌트 텍스트 생성
        examples = "\n".join(
            f'  - "{meta[r["slug"]]["title"]}"'
            f' ({r["avg_position"]:.0f}위 -> CTR {r["avg_ctr"]:.1%}, 기대치 {r["quality_score"]:.1f}배)'
            for r in top_with_meta
        )

        cat_line = ""
        if top_cats:
            cat_str = ", ".join(f"{cat}({score:.1f}배)" for cat, score in top_cats)
            cat_line = f"[잘 되는 카테고리] {cat_str}\n\n"

        return (
            "━━━ 성과 데이터 기반 전략 (자동 학습) ━━━\n"
            "아래는 실제 독자 클릭 데이터에서 도출한 패턴입니다.\n\n"
            f"{cat_line}"
            f"[고성과 제목 예시]\n{examples}\n\n"
            "-> 이 제목들의 공통 패턴(구조, 어투, 키워드 배치)을 분석해 제목을 작성하세요.\n"
            "-> 단, 주제는 반드시 위의 리서치 자료를 따르세요.\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        )

    def _fetch_performance(self, table: str, slug_column: str) -> list[dict]:
        url = (
            f"{self.supabase_url}/rest/v1/{table}"
            f"?select={slug_column},clicks,ctr,position"
            f"&limit=5000"
        )
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8")
            print(f"[PERF-ANALYZER] 성과 데이터 조회 실패 ({e.code}): {body}", flush=True)
            return []

    def _fetch_post_meta(self, table: str, slugs: list[str]) -> dict[str, dict]:
        """slug 목록에 해당하는 title + category 매핑을 반환"""
        if not slugs:
            return {}
        slug_list = ",".join(slugs)
        url = (
            f"{self.supabase_url}/rest/v1/{table}"
            f"?select=slug,title,category"
            f"&slug=in.({slug_list})"
        )
        req = request.Request(url, headers=self._headers)
        try:
            with request.urlopen(req, timeout=10) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                return {
                    row["slug"]: {"title": row["title"], "category": row.get("category")}
                    for row in rows
                }
        except HTTPError as e:
            body = e.read().decode("utf-8")
            print(f"[PERF-ANALYZER] 포스트 메타 조회 실패 ({e.code}): {body}", flush=True)
            return {}
