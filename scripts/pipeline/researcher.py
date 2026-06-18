"""
Tavily Search + OpenAI로 한국 금융/경제 에버그린 실무 주제 조사
- Tavily로 검색 → OpenAI로 JSON 포맷
- 단명 뉴스 추격 대신, 독자가 반복 검색하는 고의도 에버그린 질의 중심
"""
from __future__ import annotations

import json
from urllib import request
from urllib.error import HTTPError
from datetime import date


# 에버그린·고의도(고CPC) 금융 실무 질의 클러스터.
# 실행 날짜 기준으로 클러스터를 회전시켜 매번 다른 영역의 글을 생성한다.
# 단명 뉴스가 아니라 "조건/방법/비교/계산"형 검색 수요를 노린다.
EVERGREEN_QUERY_CLUSTERS: list[list[str]] = [
    [
        "전세대출 거절 이유와 재신청 조건 방법",
        "주택담보대출 갈아타기 절차 비용 조건",
        "신용대출 한도 늘리는 방법과 조건",
    ],
    [
        "신용점수 단기간 올리는 방법 실제 기준",
        "고정금리 변동금리 갈아타기 판단 기준",
        "대출 중도상환수수료 면제 조건과 계산 방법",
    ],
    [
        "청년 정책자금 대출 자격 조건 신청 방법",
        "정부 보증부 대출 종류 자격 비교 HUG HF SGI",
        "서민 금융 지원 상품 자격 신청 방법",
    ],
    [
        "양도소득세 비과세 요건과 계산 사례",
        "연말정산 공제 항목 절세 방법",
        "종합소득세 신고 대상과 절세 전략",
    ],
    [
        "전세보증보험 가입 조건 종류 비교",
        "주택청약 1순위 조건과 가점 계산",
        "DSR DTI LTV 계산 방법과 대출 한도",
    ],
    [
        "근로장려금 자녀장려금 자격 조건 신청 방법",
        "정부 지원금 보조금 신청 자격 기준",
        "소상공인 정책자금 대출 종류 자격 비교",
    ],
]


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

    def research_today(
        self,
        excluded_topics: list[str] | None = None,
        seed_query: str | None = None,
    ) -> dict:
        """
        오늘의 금융/경제/정책 이슈 1개 선정 + 심층 리서치
        seed_query가 있으면 해당 독자 질문에 답하는 방향으로 리서치.
        excluded_topics: 이미 발행된 주제 목록 (중복 방지)
        Returns: { topic, category, background, key_data, impact_on_public, related_keywords }
        """
        exclusion_block = ""
        if excluded_topics:
            titles = "\n".join(f"- {t}" for t in excluded_topics)
            exclusion_block = (
                "\n\n[중복 금지] 아래 주제들은 이미 발행된 글입니다. "
                "같거나 매우 유사한 주제는 절대 선택하지 마세요:\n"
                + titles
            )

        # Step 1: Tavily 검색
        if seed_query:
            tavily_query = f"{seed_query} 금융 경제 정책 한국"
            print(f"[RESEARCHER] GSC 시드 쿼리 사용: '{seed_query}'", flush=True)
            search_results = self._tavily_search(tavily_query)
            answer = search_results.get("answer", "")
            snippets = "\n".join(
                f"- [{r['title']}]({r['url']}): {r['content'][:300]}"
                for r in search_results.get("results", [])
            )
            context = f"[검색 요약]\n{answer}\n\n[주요 기사]\n{snippets}"
        else:
            # 날짜 기준으로 에버그린 클러스터 회전 (실행마다 다른 영역)
            cluster_idx = date.today().toordinal() % len(EVERGREEN_QUERY_CLUSTERS)
            year = date.today().year
            queries = [f"{q} {year}년 기준" for q in EVERGREEN_QUERY_CLUSTERS[cluster_idx]]
            print(
                f"[RESEARCHER] 에버그린 자유 선정 모드 (클러스터 {cluster_idx})",
                flush=True,
            )
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
        if seed_query:
            task_instruction = (
                f"실제 독자가 구글에서 검색한 질문입니다: \"{seed_query}\"\n\n"
                "이 질문에 제대로 된 답변을 제공하는 글을 작성하기 위한 리서치를 수행하세요. "
                "독자가 이 질문을 검색한 상황과 맥락을 먼저 파악하고, "
                "그들이 실제로 알고 싶은 것(결론과 판단 기준)을 중심으로 리서치하세요.\n\n"
                f"[참고 자료]\n{context}\n\n"
                + exclusion_block + "\n\n"
            )
        else:
            task_instruction = (
                "아래 검색 결과를 바탕으로, 독자가 검색엔진에서 '반복적으로' 검색하는 "
                "에버그린(시간이 지나도 검색되는) 금융 실무 주제를 1개 선정하세요.\n\n"
                "【선정 기준 — 단명 뉴스가 아닌 에버그린 고의도 질문】\n"
                "① 조건/자격형 — '~할 수 있는 조건', '~자격 기준' (예: 전세대출 거절 후 재신청 조건)\n"
                "② 방법/절차형 — '~하는 방법', '~신청 절차' (예: 주담대 갈아타기 절차)\n"
                "③ 비교/판단형 — '~vs~ 차이', '~언제 유리한가' (예: 고정 vs 변동 금리)\n"
                "④ 계산/사례형 — '~계산 방법', '~얼마인가' (예: 중도상환수수료 계산)\n\n"
                "【반드시 지킬 것】\n"
                "- 특정 날짜·속보성 사건(오늘의 환율, 주가 폭락 등)에 의존하는 주제는 피한다.\n"
                "- 1년 뒤에 검색해도 유효한, 제도·절차·기준 중심의 주제를 고른다.\n"
                "- 제목에 연도가 들어가더라도 내용은 '기준·방법·조건'이 핵심이어야 한다.\n"
                "- 독자가 '그래서 나는 어떻게 해야 하나'를 끝까지 알 수 있는 주제를 선정한다.\n\n"
                f"[검색 결과]\n{context}\n\n"
                + exclusion_block + "\n\n"
            )

        user_content = (
            task_instruction
            + "아래 형식의 JSON으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요.\n"
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
