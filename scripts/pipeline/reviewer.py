"""
자동 생성 블로그 글 AI 검수 리포트 생성기
- 글을 수정하지 않고 검수 JSON 리포트만 반환
- JSON 파싱 실패 시 "발행 보류" fallback 반환
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError

from .columnist import Article


REVIEW_SYSTEM_PROMPT = """너는 ohyess.kr 금융 블로그 AI 검수관이다. 자동 생성된 금융 초안을 검수하고 구조화된 JSON 리포트만 반환한다. 글을 수정하지 않는다.

검수 기준:
1. 제목 검색 적합성 (25점)
   - 검색 의도를 반영한 키워드형 제목인지
   - 핵심 키워드가 제목 앞쪽에 배치됐는지
   - 숫자·조건·상황이 포함됐는지
   - 과장·낚시 표현(무조건/확실/즉시)이 없는지

2. 수치·계산 검증 (25점)
   - 연소득·금리·DSR·LTV·기간·기존부채 등 계산 가정이 명시됐는지
   - 계산 흐름이 논리적인지
   - 전세대출 글에서 DSR 40%를 핵심 승인 기준처럼 쓰지 않았는지
   - 대출 승인 가능성을 단정하지 않았는지

3. 출처 신뢰도 (25점)
   - 공식기관(금융위·금감원·HUG·HF·SGI·주택도시기금·은행 상품설명서) 우선인지
   - 핵심 수치에 출처명과 기준일이 명확한지
   - 언론자료만으로 핵심 수치를 단정하지 않았는지

4. CTA 적합성 (25점)
   - 글 주제와 계산기 링크가 일치하는지
   - CTA가 본문 흐름에 자연스럽게 삽입됐는지
   - "→ →" 같은 렌더링 오류가 없는지

판정 기준:
- total_score 75 이상 + fail 항목 없음 → "발행 가능"
- total_score 60~74 또는 warn 항목만 있음 → "수정 후 발행"
- total_score 60 미만 또는 fail 항목 1개 이상 → "발행 보류"

risk_level:
- "high": 금융 기준 오류·승인 단정·전세-DSR 과용·출처 없는 핵심 수치
- "medium": warn 1~2개 또는 개선 필요
- "low": 소소한 개선 권장 또는 문제 없음

JSON 형식 외 텍스트는 절대 출력하지 않는다."""


REVIEW_RESPONSE_FORMAT = """{
  "schema_version": 1,
  "total_score": <0~100 정수>,
  "final_decision": "발행 가능 | 수정 후 발행 | 발행 보류",
  "risk_level": "low | medium | high",
  "scores": {
    "title": <0~25 정수>,
    "calculation": <0~25 정수>,
    "sources": <0~25 정수>,
    "cta": <0~25 정수>
  },
  "issues": [
    {
      "severity": "fail | warn | info",
      "category": "title | calculation | sources | cta | ymyl",
      "message": "문제 설명",
      "evidence": "본문에서 근거 문장 (없으면 빈 문자열)",
      "fix": "수정 방향"
    }
  ],
  "suggestions": ["개선 제안"],
  "title_suggestions": ["대안 제목 1", "대안 제목 2"],
  "human_checkpoints": ["사람이 확인해야 할 사항"],
  "review_summary": "전체 검수 요약 (2~3문장)"
}"""


FALLBACK_REVIEW: dict = {
    "schema_version": 1,
    "total_score": 0,
    "final_decision": "발행 보류",
    "risk_level": "high",
    "scores": {"title": 0, "calculation": 0, "sources": 0, "cta": 0},
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


class ArticleReviewer:
    OPENAI_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, openai_api_key: str, openai_model: str = "gpt-4o-mini") -> None:
        self.openai_api_key = openai_api_key
        self.openai_model = openai_model

    def review(self, article: Article, html: str, research: dict) -> dict:
        """
        Article + HTML + research를 검수하고 검수 리포트 JSON을 반환.
        JSON 파싱 실패 또는 API 오류 시 FALLBACK_REVIEW 반환 (발행 보류).
        """
        user_content = (
            f"제목: {article.title}\n"
            f"카테고리: {article.category}\n"
            f"태그: {', '.join(article.tags or [])}\n\n"
            f"--- 리서치 정보 ---\n"
            f"주제: {research.get('topic', '')}\n"
            f"계산 가정: {json.dumps(research.get('calc_assumptions', []), ensure_ascii=False)}\n"
            f"핵심 데이터: {json.dumps(research.get('key_data', []), ensure_ascii=False)}\n\n"
            f"--- 본문 HTML (처음 3000자) ---\n{html[:3000]}\n\n"
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
                parsed.setdefault("schema_version", 1)
                return parsed
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
