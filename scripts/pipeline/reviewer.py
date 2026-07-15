"""
자동 생성 블로그 글 AI 검수 리포트 생성기
- 글을 수정하지 않고 검수 JSON 리포트만 반환
- 코드 검증기(finance.validate_article) 결과를 프롬프트에 주입해 객관 사실 위에서 채점
- JSON 파싱 실패 시 "발행 보류" fallback 반환
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError

from .columnist import Article
from . import finance


# 9개 항목 배점 (합계 100)
SCORE_MAX = {
    "title_search": 15,       # 제목 검색 적합성
    "answer_clarity": 15,     # 상단 핵심 답변의 명확성
    "key_numbers": 15,        # 핵심 숫자 존재 여부
    "calc_table": 15,         # 계산 과정 표 완성도
    "scenario_table": 10,     # 시나리오 비교표 완성도
    "source_specificity": 10, # 공식 출처의 구체성
    "freshness_date": 10,     # 최신 기준일 표시
    "cta_restraint": 5,       # CTA 절제와 자연스러움
    "rendering": 5,           # HTML/렌더링 오류 없음
}


REVIEW_SYSTEM_PROMPT = """너는 ohyess.kr 금융 블로그 AI 검수관이다. 자동 생성된 금융 초안을 검수하고 구조화된 JSON 리포트만 반환한다. 글을 수정하지 않는다.

너의 판단 기준은 "좋은 문장"이 아니라 "독자의 의사결정에 도움 되는 계산 결과"다.
문장 품질보다 아래 9개 항목을 더 엄격히 본다. 각 항목은 배점 만점 대비 점수를 매긴다.

1. 제목 검색 적합성 (15점)
   - 검색자가 실제 입력할 질문형 제목인가, 핵심 조건이 있는가
   - "얼마나 줄어드나"류 제목인데 본문에 최종 감소액이 없으면 대폭 감점

2. 상단 핵심 답변의 명확성 (15점)
   - 글 시작 300자 이내에 "이 조건에서는 얼마까지 가능하고, 기존 대비 얼마 줄어든다"가 숫자로 있는가
   - 이 문장이 없으면 절대 발행 가능 판정을 내리지 마라

3. 핵심 숫자 존재 여부 (15점)
   - 최종 한도/감소액/손익 같은 결과 숫자가 명확한가

4. 계산 과정 표 완성도 (15점)
   - DSR상 상환 가능액 → 기존부채 상환액 → 상환 여력 → 월 상환액 → 환산 한도가 표로 있는가
   - 표 없이 문장으로만 계산을 설명하면 감점

5. 시나리오 비교표 완성도 (10점)
   - 기본 사례 외 2개 이상 비교 사례가 표로 있는가

6. 공식 출처의 구체성 (10점)
   - 기관명뿐 아니라 문서명·기준일·확인 기준이 있는가
   - "금융위원회, 2025"처럼 모호하면 대폭 감점

7. 최신 기준일 표시 (10점)
   - 최신 확인이 필요한 금융·정책 수치에 기준일이 있는가. 없으면 감점

8. CTA 절제와 자연스러움 (5점)
   - 계산기 링크가 2개 이하이고 자연스러운 문장인가. 3개 이상 반복이면 감점

9. HTML/렌더링 오류 없음 (5점)
   - 본문에 원시 <a> 태그, 깨진 표, 빈 bullet, 중복 문장이 없는가

너는 아래 "코드 검증 결과(객관 사실)"를 제공받는다. 이 사실과 모순되게 채점하지 마라.
예: 코드 검증에서 '계산 결과 없음'이면 3·4번 점수를 높게 주지 마라.

반드시 잡아야 하는 문제(발견 시 해당 issue를 severity=fail로):
- 제목엔 "얼마나 줄어드나"인데 본문에 최종 감소액이 없음
- DSR 설명만 있고 실제 대출한도 환산액이 없음
- 표 없이 문장으로만 계산 설명
- 출처가 기관명만 있고 문서명·기준일 없음
- 계산기 링크 3개 이상 반복
- 원시 HTML 링크 태그가 본문 노출
- 최신 기준 확인이 필요한데 기준일 없음

final_decision 매핑(코드 검증 하드 게이트는 파이프라인이 별도 적용):
- total_score 90 이상 + fail 없음 → "발행 가능"
- total_score 80~89 → "수정 후 발행"
- total_score 80 미만 또는 fail 1개 이상 → "발행 보류"

risk_level: high(계산·출처·기준일 결함), medium(warn 위주), low(문제 거의 없음)

JSON 형식 외 텍스트는 절대 출력하지 않는다."""


REVIEW_RESPONSE_FORMAT = """{
  "schema_version": 2,
  "total_score": <0~100 정수, 아래 scores 합계와 일치>,
  "final_decision": "발행 가능 | 수정 후 발행 | 발행 보류",
  "risk_level": "low | medium | high",
  "scores": {
    "title_search": <0~15>,
    "answer_clarity": <0~15>,
    "key_numbers": <0~15>,
    "calc_table": <0~15>,
    "scenario_table": <0~10>,
    "source_specificity": <0~10>,
    "freshness_date": <0~10>,
    "cta_restraint": <0~5>,
    "rendering": <0~5>
  },
  "issues": [
    {"severity": "fail | warn | info", "category": "title | answer | numbers | calc | scenario | sources | freshness | cta | rendering | ymyl",
     "message": "문제 설명", "evidence": "본문 근거 문장(없으면 빈 문자열)", "fix": "수정 방향"}
  ],
  "suggestions": ["개선 제안"],
  "title_suggestions": ["대안 제목 1", "대안 제목 2"],
  "human_checkpoints": ["사람이 확인해야 할 사항"],
  "review_summary": "전체 검수 요약 (2~3문장)"
}"""


def _zero_scores() -> dict:
    return {k: 0 for k in SCORE_MAX}


FALLBACK_REVIEW: dict = {
    "schema_version": 2,
    "total_score": 0,
    "final_decision": "발행 보류",
    "risk_level": "high",
    "scores": _zero_scores(),
    "issues": [{
        "severity": "fail",
        "category": "ymyl",
        "message": "AI 검수 JSON 파싱 실패 — 수동 검토 필요",
        "evidence": "",
        "fix": "관리자가 직접 글을 검토하세요",
    }],
    "suggestions": [],
    "title_suggestions": [],
    "human_checkpoints": ["AI 검수가 실패했습니다. 발행 전 반드시 수동 검토하세요."],
    "review_summary": "AI 검수 리포트 생성에 실패했습니다. 수동 검토 후 발행 여부를 결정하세요.",
}


def _validation_facts(validation: "finance.ValidationResult | None") -> str:
    """코드 검증 결과를 프롬프트용 객관 사실 블록으로 변환."""
    if validation is None:
        return "코드 검증 결과: (없음)"
    lines = ["━━━ 코드 검증 결과 (객관 사실, 이와 모순되게 채점 금지) ━━━"]
    labels = {
        "calc_present": "코드 계산 결과 존재",
        "answer_has_number": "상단 답변에 결과 숫자 존재",
        "sources_present": "출처 존재",
        "sources_dated": "모든 출처에 기준일 존재",
        "cta_within_limit": "CTA 2개 이하",
        "no_raw_html_in_body": "본문에 원시 HTML 없음",
        "no_empty_bullet": "빈 목록 없음",
        "comparison_table_present": "구조화 비교표 존재(비계산형)",
    }
    for key, ok in validation.checks.items():
        lines.append(f"- {labels.get(key, key)}: {'통과' if ok else '실패'}")
    if validation.hard_fail:
        lines.append("발행 불가 사유: " + "; ".join(validation.hard_fail))
    if validation.warnings:
        lines.append("경고: " + "; ".join(validation.warnings))
    return "\n".join(lines)


def _normalize_review(parsed: dict) -> dict:
    """LLM 응답을 정규화: scores 키 보정, total_score 재계산 정합성 확보."""
    parsed.setdefault("schema_version", 2)
    scores = parsed.get("scores") or {}
    # 9개 키 보정 + 상한 클램프
    norm_scores = {}
    for k, mx in SCORE_MAX.items():
        try:
            v = int(scores.get(k, 0))
        except (TypeError, ValueError):
            v = 0
        norm_scores[k] = max(0, min(mx, v))
    parsed["scores"] = norm_scores
    # total_score는 scores 합계로 강제 (LLM 산술 오류 방지)
    parsed["total_score"] = sum(norm_scores.values())
    parsed.setdefault("issues", [])
    parsed.setdefault("suggestions", [])
    parsed.setdefault("title_suggestions", [])
    parsed.setdefault("human_checkpoints", [])
    parsed.setdefault("review_summary", "")
    # final_decision 정합성 (fail이 있으면 발행 보류)
    has_fail = any(i.get("severity") == "fail" for i in parsed["issues"])
    ts = parsed["total_score"]
    if has_fail or ts < 80:
        parsed["final_decision"] = "발행 보류"
    elif ts >= 90:
        parsed.setdefault("final_decision", "발행 가능")
        if parsed.get("final_decision") not in ("발행 가능", "수정 후 발행", "발행 보류"):
            parsed["final_decision"] = "발행 가능"
    else:
        parsed["final_decision"] = "수정 후 발행"
    return parsed


class ArticleReviewer:
    OPENAI_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, openai_api_key: str, openai_model: str = "gpt-4o-mini") -> None:
        self.openai_api_key = openai_api_key
        self.openai_model = openai_model

    def review(
        self,
        article: Article,
        html: str,
        research: dict,
        validation: "finance.ValidationResult | None" = None,
        expects_calc: bool = True,
    ) -> dict:
        """
        Article + HTML + research + 코드 검증 결과를 검수하고 리포트 JSON을 반환.
        expects_calc=False면 표준 계산공식이 없는 유형(전세대출/정책자금 등)으로 보고
        계산 중심 항목을 '구조 적합성' 기준으로 적응 채점하도록 지시한다.
        JSON 파싱/API 오류 시 FALLBACK_REVIEW(발행 보류) 반환.
        """
        adaptive_block = ""
        if not expects_calc:
            adaptive_block = (
                "━━━ 카테고리 적응 채점 (이 글은 표준 계산공식이 없는 유형: 전세대출/정책자금/신용점수 등) ━━━\n"
                "숫자 계산식·DSR 환산 표가 없다는 이유만으로 아래 항목을 0점 처리하지 마라.\n"
                "- calc_table(15): 숫자 계산표 대신 '조건/자격/기관별 비교 표'의 완성도로 채점\n"
                "- scenario_table(10): HUG/HF/SGI 등 상품·기관별 또는 조건별 비교의 완성도로 채점\n"
                "- key_numbers(15): 보증한도 비율(%)·보증금·공시가격·소득 기준 등 구체적 기준 수치 존재로 채점\n"
                "- answer_clarity(15): 상단에 '어느 기관·조건에서 막히고 어떻게 해결하는지'가 명확한지로 채점\n"
                "단, 출처 구체성·기준일·CTA 절제·렌더링·제목 적합성은 동일하게 엄격히 본다.\n\n"
            )

        user_content = (
            f"제목: {article.title}\n"
            f"카테고리: {article.category}\n"
            f"태그: {', '.join(article.tags or [])}\n\n"
            f"{adaptive_block}"
            f"{_validation_facts(validation)}\n\n"
            f"--- 리서치 정보 ---\n"
            f"주제: {research.get('topic', '')}\n"
            f"계산 입력값(calc): {json.dumps(article.calc, ensure_ascii=False)}\n"
            f"핵심 데이터: {json.dumps(research.get('key_data', []), ensure_ascii=False)}\n\n"
            f"--- 본문 HTML (처음 3500자) ---\n{html[:3500]}\n\n"
            f"위 내용을 검수하고 아래 JSON 형식으로만 응답하세요:\n{REVIEW_RESPONSE_FORMAT}"
        )

        payload = {
            "model": self.openai_model,
            "max_completion_tokens": 2000,
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": REVIEW_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
        }

        raw_body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            self.OPENAI_URL,
            data=raw_body,
            headers={
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"].strip()
                parsed = json.loads(content)
                return _normalize_review(parsed)
        except HTTPError as e:
            body = e.read().decode("utf-8")
            print(f"[REVIEWER] OpenAI HTTP {e.code}: {body[:200]}", flush=True)
            return dict(FALLBACK_REVIEW)
        except (json.JSONDecodeError, KeyError) as exc:
            print(f"[REVIEWER] JSON 파싱 실패: {exc}", flush=True)
            return dict(FALLBACK_REVIEW)
        except Exception as exc:
            print(f"[REVIEWER] 검수 오류: {exc}", flush=True)
            return dict(FALLBACK_REVIEW)
