"""
Tavily Search + OpenAI로 오늘의 한국 금융/경제 인기 이슈 조사
- Tavily로 실시간 검색 → OpenAI로 JSON 포맷
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError
from datetime import date


class TavilyResearcher:
    TAVILY_URL = "https://api.tavily.com/search"
    ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

    def __init__(self, tavily_api_key: str, anthropic_api_key: str, anthropic_model: str = "claude-haiku-4-5-20251001") -> None:
        self.tavily_api_key = tavily_api_key
        self.anthropic_api_key = anthropic_api_key
        self.anthropic_model = anthropic_model

    def _tavily_search(self, query: str) -> dict:
        payload = {
            "api_key": self.tavily_api_key,
            "query": query,
            "search_depth": "basic",
            "include_answer": True,
            "max_results": 5,
        }
        raw_body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            self.TAVILY_URL,
            data=raw_body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"Tavily HTTP {e.code}: {body}") from e

    def research_today(self, excluded_topics: list[str] | None = None) -> dict:
        """
        오늘의 인기 금융/경제 이슈 1개 선정 + 심층 리서치
        excluded_topics: 이미 발행된 주제 목록 (중복 방지)
        Returns: { topic, category, background, key_data, impact_on_public, related_keywords }
        """
        today = date.today().strftime("%Y년 %m월 %d일")

        exclusion_block = ""
        if excluded_topics:
            titles = "\n".join(f"- {t}" for t in excluded_topics)
            exclusion_block = (
                "\n\n[중복 금지] 아래 주제들은 이미 발행된 글입니다. "
                "같거나 매우 유사한 주제는 절대 선택하지 마세요:\n"
                + titles
            )

        # Step 1: Tavily 실시간 검색
        query = f"대한민국 금융 경제 최신 뉴스 이슈 {today}"
        search_results = self._tavily_search(query)
        answer = search_results.get("answer", "")
        snippets = "\n".join(
            f"- [{r['title']}]({r['url']}): {r['content'][:300]}"
            for r in search_results.get("results", [])
        )
        context = f"[검색 요약]\n{answer}\n\n[주요 기사]\n{snippets}"

        # Step 2: Anthropic으로 JSON 포맷
        user_content = (
            f"오늘({today}) 아래 검색 결과를 바탕으로 금융·경제 이슈를 1개 선정하고, "
            "아래 형식의 JSON으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요.\n\n"
            f"[검색 결과]\n{context}\n\n"
            + exclusion_block + "\n\n"
            "{\n"
            '  "topic": "이슈 제목 (한국어, 50자 이내)",\n'
            '  "category": "금융 | 경제 | 대출 | 세금 | 부동산 중 1개",\n'
            '  "background": "이슈 배경 설명 (200자 이상, 왜 지금 화제인지)",\n'
            '  "key_data": [\n'
            '    {"fact": "구체적 수치나 사실", "source": "출처 기관명, 연도"},\n'
            '    ...\n'
            '  ],\n'
            '  "impact_on_public": "일반 국민/독자에게 미치는 실질적 영향 (200자 이상)",\n'
            '  "related_keywords": ["키워드1", "키워드2", "키워드3"]\n'
            "}\n\n"
            "요구사항:\n"
            "- key_data는 최소 3개 이상 (구체적 수치 필수)\n"
            "- 추측이나 불확실한 내용 금지"
        )
        payload = {
            "model": self.anthropic_model,
            "max_tokens": 2000,
            "system": (
                "당신은 대한민국 금융·경제 전문 리서처입니다. "
                "주어진 검색 결과를 분석하여 정확한 JSON 형식으로 응답합니다."
            ),
            "messages": [{"role": "user", "content": user_content}],
        }

        raw_body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            self.ANTHROPIC_URL,
            data=raw_body,
            headers={
                "x-api-key": self.anthropic_api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["content"][0]["text"].strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                return json.loads(content.strip())
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"Anthropic HTTP {e.code}: {body}") from e
