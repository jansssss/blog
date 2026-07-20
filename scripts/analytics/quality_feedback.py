"""
품질 피드백 분석기 (cross-run 자기 학습)

목적:
- 사람이 품질 낮은 글을 드래프트로 방치하는 행위 자체를 "부정 신호"로 흡수한다.
- 최근 검수(ai_review) 이력에서 반복되는 실패 원인을 집계해,
  다음 글 생성 프롬프트에 "이번엔 이걸 피하라" 힌트로 주입한다.
- 반대로 auto_ok로 통과한 글의 카테고리를 긍정 패턴으로 함께 알려준다.

performance_analyzer(성과=클릭 학습)와 나란히 동작한다.
performance_analyzer는 "공개된 글의 CTR"만 보지만, 이 모듈은
"드래프트로 남은 글 포함, 검수에서 걸린 이유"를 본다.

활성화 조건: ai_review가 있는 최근 글이 MIN_REVIEWED개 이상일 때만 힌트 생성.
데이터 부족 시 None 반환 → 파이프라인 기존 동작 유지.
"""
from __future__ import annotations

import json
from collections import Counter
from urllib import request
from urllib.error import HTTPError

from scripts.pipeline.reviewer import SCORE_MAX


MIN_REVIEWED = 6          # 힌트 생성 최소 검수 글 수
FETCH_LIMIT = 40          # 최근 몇 건을 학습 대상으로 볼지

# schema_version 2 이하의 검수는 신뢰하지 않는다.
# v2 검수관은 잘린 HTML(앞 3500자)만 보고 채점해서 출처·기준일·CTA 같은
# 글 뒷부분 항목을 "없다"고 오판했다. 그 오판을 학습에 넣으면 작가가
# 멀쩡한 항목을 고치느라 실제 품질을 놓치는 악순환이 생긴다.
MIN_TRUSTED_SCHEMA = 3
_WEAK_RATIO = 0.6         # 항목 점수가 만점의 60% 미만이면 "약한 항목"
_MIN_OCCURRENCE = 2       # 실패 원인이 최소 2회 반복돼야 힌트에 포함

# 검수 항목(rubric) 한글 라벨
_SCORE_LABELS = {
    "title_search": "제목 검색 적합성",
    "answer_clarity": "상단 핵심 답변",
    "key_numbers": "핵심 숫자",
    "calc_table": "계산 과정 표",
    "scenario_table": "시나리오 비교표",
    "source_specificity": "출처 구체성(문서명·기준일)",
    "freshness_date": "최신 기준일 표시",
    "cta_restraint": "CTA 절제",
    "rendering": "렌더링 품질",
}

# issue.category → 한글 라벨
_ISSUE_LABELS = {
    "title": "제목이 검색 질문과 어긋남",
    "answer": "상단 핵심 답변에 결과 수치 없음",
    "numbers": "핵심 결과 숫자 누락",
    "calc": "계산 과정 표 미흡",
    "scenario": "시나리오 비교표 미흡",
    "sources": "출처에 문서명·기준일 누락",
    "freshness": "최신 기준일 누락",
    "cta": "CTA 과다·중복",
    "rendering": "원시 HTML·링크 태그 본문 노출",
    "ymyl": "금융 정확성 결함",
}


def _classify_hard_fail(msg: str) -> str:
    """finance.validate_article이 만든 하드 실패 문구를 카테고리 라벨로 분류."""
    m = msg
    if "출처" in m and "기준일" in m:
        return "출처에 문서명·기준일 누락"
    if "계산 결과" in m or "계산 검증" in m:
        return "코드 계산 결과 없음(계산형인데 표 없음)"
    if "핵심 답변" in m:
        return "상단 핵심 답변에 결과 수치 없음"
    if "원시 HTML" in m:
        return "원시 HTML·링크 태그 본문 노출"
    if "CTA" in m:
        return "CTA 과다·중복"
    if "출처가 없습니다" in m:
        return "출처 없음"
    return m.strip()


class QualityFeedbackAnalyzer:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.base_url = supabase_url.rstrip("/")
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }
        self._site_id: str | None = None

    def _get_site_id(self) -> str | None:
        if self._site_id:
            return self._site_id
        url = f"{self.base_url}/rest/v1/sites?domain=eq.ohyess.kr&select=id&limit=1"
        try:
            with request.urlopen(request.Request(url, headers=self._headers), timeout=10) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                if rows:
                    self._site_id = rows[0]["id"]
        except (HTTPError, Exception):  # noqa: BLE001 - 사이트 필터는 선택적
            self._site_id = None
        return self._site_id

    def _fetch_reviews(self, limit: int) -> list[dict]:
        site_id = self._get_site_id()
        site_filter = f"&site_id=eq.{site_id}" if site_id else ""
        url = (
            f"{self.base_url}/rest/v1/posts"
            f"?select=title,category,published,ai_review,ai_reviewed_at"
            f"&ai_review=not.is.null{site_filter}"
            f"&order=ai_reviewed_at.desc.nullslast&limit={limit}"
        )
        try:
            with request.urlopen(request.Request(url, headers=self._headers), timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8")
            print(f"[QUALITY] 검수 이력 조회 실패 ({e.code}): {body[:200]}", flush=True)
            return []
        except Exception as exc:  # noqa: BLE001
            print(f"[QUALITY] 검수 이력 조회 오류: {exc}", flush=True)
            return []

    def get_quality_hints(self, limit: int = FETCH_LIMIT, min_reviewed: int = MIN_REVIEWED) -> str | None:
        """반복 실패 패턴 + 긍정 패턴을 프롬프트용 문자열로 반환. 부족 시 None."""
        rows = self._fetch_reviews(limit)
        all_reviewed = [r for r in rows if isinstance(r.get("ai_review"), dict)]
        # 구버전(잘린 HTML 기반) 검수는 학습에서 제외 — 유령 실패 학습 방지
        reviewed = [
            r for r in all_reviewed
            if int(r["ai_review"].get("schema_version") or 0) >= MIN_TRUSTED_SCHEMA
        ]
        stale = len(all_reviewed) - len(reviewed)
        if stale:
            print(f"[QUALITY] 구버전 검수 {stale}건 제외 (schema_version < {MIN_TRUSTED_SCHEMA})", flush=True)
        if len(reviewed) < min_reviewed:
            print(
                f"[QUALITY] 신뢰 가능한 검수 이력 부족 ({len(reviewed)} < {min_reviewed}) — 품질 힌트 생략",
                flush=True,
            )
            return None

        fail_counter: Counter[str] = Counter()   # 반복 실패 원인
        weak_counter: Counter[str] = Counter()   # 약한 검수 항목
        auto_ok_cats: Counter[str] = Counter()   # 통과한 카테고리
        n_auto_ok = n_hold = n_draft = 0

        for r in reviewed:
            rev = r["ai_review"]
            gate = rev.get("publish_gate") or {}
            status = gate.get("status")
            published = bool(r.get("published"))
            if not published:
                n_draft += 1

            if status == "auto_ok":
                n_auto_ok += 1
                if r.get("category"):
                    auto_ok_cats[r["category"]] += 1
            elif status in ("regenerate", "draft_reinforce"):
                n_hold += 1

            # 1) 하드 실패 문구
            for msg in gate.get("hard_fail", []) or []:
                fail_counter[_classify_hard_fail(str(msg))] += 1

            # 2) 검수 이슈(fail/warn) 카테고리
            for iss in rev.get("issues", []) or []:
                if iss.get("severity") in ("fail", "warn"):
                    cat = iss.get("category", "")
                    fail_counter[_ISSUE_LABELS.get(cat, cat or "기타")] += 1

            # 3) 만점 대비 낮은 검수 항목
            for key, val in (rev.get("scores") or {}).items():
                mx = SCORE_MAX.get(key)
                if mx and isinstance(val, (int, float)) and val < mx * _WEAK_RATIO:
                    weak_counter[_SCORE_LABELS.get(key, key)] += 1

        top_fails = [(k, c) for k, c in fail_counter.most_common() if c >= _MIN_OCCURRENCE]
        top_weak = [(k, c) for k, c in weak_counter.most_common(4) if c >= _MIN_OCCURRENCE]

        # 반복 실패가 하나도 없고 대부분 통과면 굳이 힌트를 넣지 않는다
        if not top_fails and not top_weak:
            print("[QUALITY] 반복 실패 패턴 없음 — 품질 힌트 생략", flush=True)
            return None

        lines = [
            "━━━ 품질 피드백 (자동 학습) ━━━",
            f"최근 검수 {len(reviewed)}건 중 자동발행 품질(auto_ok) {n_auto_ok}건, "
            f"보류·재생성 {n_hold}건, 드래프트로 남은 글 {n_draft}건.",
            "아래는 과거 글이 실제로 걸렸던 지점입니다. 이번 글에서는 반드시 피하세요.",
            "",
        ]
        if top_fails:
            lines.append("[반복되는 실패 — 이번 글에서 반드시 피할 것]")
            for label, cnt in top_fails[:6]:
                lines.append(f"  - {label}: {cnt}회")
            lines.append("")
        if top_weak:
            lines.append("[검수에서 특히 약했던 항목 — 이번엔 강화]")
            for label, cnt in top_weak:
                lines.append(f"  - {label}: {cnt}건 저조")
            lines.append("")
        if auto_ok_cats:
            cats = ", ".join(f"{c}({n})" for c, n in auto_ok_cats.most_common(3))
            lines.append(f"[자동발행 품질을 통과한 카테고리] {cats}")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        print(
            f"[QUALITY] 품질 힌트 생성 — 실패패턴 {len(top_fails)}종, 약항목 {len(top_weak)}종",
            flush=True,
        )
        return "\n".join(lines)
