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
    OPENAI_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, tavily_api_key: str, openai_api_key: str, openai_model: str = "gpt-5.4-mini") -> None:
        self.tavily_api_key = tavily_api_key
        self.openai_api_key = openai_api_key
        self.openai_model = openai_model

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
        오늘의 금융/경제/정책 이슈 1개 선정 + 심층 리서치
        선정 기준: 독자의 실생활(자산·가계·소비)에 직접 영향을 미치는 이슈
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

        # Step 1: 3가지 각도로 Tavily 검색 (경제이슈 / 정책제도 / 정부지원)
        queries = [
            f"환율 금리 물가 전쟁 경제 영향 한국 {today}",
            f"금융위원회 금감원 정부 정책 제도 변경 시행 {today}",
            f"정부 지원금 보조금 혜택 신청 서민 {today}",
        ]
        combined_snippets = []
        combined_answers = []
        for q in queries:
            result = self._tavily_search(q)
            if result.get("answer"):
                combined_answers.append(result["answer"])
            for r in result.get("results", [])[:3]:
                combined_snippets.append(
                    f"- [{r['title']}]({r['url']}): {r['content'][:250]}"
                )
        context = (
            "[검색 요약]\n" + "\n".join(combined_answers) +
            "\n\n[주요 기사]\n" + "\n".join(combined_snippets)
        )

        # Step 2: OpenAI로 JSON 포맷
        user_content = (
            f"오늘({today}) 아래 검색 결과에서 독자의 실생활에 직접 영향을 주는 이슈를 1개 선정하세요.\n\n"
            "【선정 기준 — 아래 3가지 유형 중 하나여야 합니다】\n"
            "① 경제·시장 이슈 (환율 급등, 금리 변동, 전쟁·지정학 등) → 내 자산/물가/소비에 어떤 영향인가\n"
            "② 금융 정책·제도 변경 (금융위원회, 금감원, 세제 개편 등) → 내 금융생활에 어떤 변화가 생기나\n"
            "③ 정부 지원금·보조금·혜택 → 내가 받을 수 있나, 어떻게 신청하나\n\n"
            "단순 뉴스 브리핑이 아닌, 독자가 '그래서 나는 어떻게 해야 하나'를 알 수 있는 이슈를 선정하세요.\n\n"
            f"[검색 결과]\n{context}\n\n"
            + exclusion_block + "\n\n"
            "아래 형식의 JSON으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요.\n"
            "{\n"
            '  "topic": "이슈 제목 (한국어, 50자 이내)",\n'
            '  "article_type": "경제이슈 | 정책제도 | 정부지원 중 1개",\n'
            '  "category": "금융 | 경제 | 대출 | 세금 | 부동산 | 지원금 중 1개",\n'
            '  "background": "이슈 배경 설명 (200자 이상, 왜 지금 화제인지)",\n'
            '  "key_data": [\n'
            '    {"fact": "구체적 수치나 사실", "source": "출처 기관명, 연도"},\n'
            '    ...\n'
            '  ],\n'
            '  "impact_on_public": "일반 국민/독자의 가계·자산·일상에 미치는 실질적 영향 (200자 이상)",\n'
            '  "related_keywords": ["키워드1", "키워드2", "키워드3"]\n'
            "}\n\n"
            "요구사항:\n"
            "- key_data는 최소 3개 이상 (구체적 수치 필수)\n"
            "- 추측이나 불확실한 내용 금지"
        )
        payload = {
            "model": self.openai_model,
            "max_completion_tokens": 2000,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "당신은 대한민국 금융·경제 전문 리서처입니다. "
                        "주어진 검색 결과를 분석하여 정확한 JSON 형식으로 응답합니다."
                    ),
                },
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
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                return json.loads(content.strip())
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"OpenAI HTTP {e.code}: {body}") from e
