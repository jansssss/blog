"""
Claude API로 금융 칼럼니스트 스타일 글 생성
- max_tokens: 7000 (GitHub Actions에서는 타임아웃 없음)
- 구조화 JSON → Blogger 스타일 HTML 렌더링
"""
from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from urllib import request
from urllib.error import HTTPError


@dataclass
class ArticleSection:
    heading: str
    paragraphs: list[str]
    expert_insight: str = ""


@dataclass
class Article:
    topic: str
    category: str
    title: str
    meta_description: str
    subtitle: str
    summary_points: list[str]
    sections: list[ArticleSection]
    action_tips: list[str]
    tags: list[str]
    sources: list[str] = field(default_factory=list)

    @property
    def slug(self) -> str:
        today = date.today().strftime("%Y%m%d")
        normalized = unicodedata.normalize("NFKD", self.title).encode("ascii", "ignore").decode("ascii")
        slug_part = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
        if slug_part:
            return f"{today}-{slug_part[:40]}"
        # 한국어 제목은 ASCII 변환 불가 → 날짜+카테고리+해시
        import hashlib
        title_hash = hashlib.md5(self.title.encode()).hexdigest()[:8]
        cat = re.sub(r"[^a-z]", "", self.category.lower()) or "finance"
        return f"{today}-{cat}-{title_hash}"


class ColumnistWriter:
    ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

    def __init__(self, api_key: str, model: str, prompt_path: Path) -> None:
        self.api_key = api_key
        self.model = model
        self.prompt_text = prompt_path.read_text(encoding="utf-8")

    def write(self, research: dict) -> Article:
        """Perplexity 리서치 결과를 받아 칼럼 Article 반환"""
        topic = research["topic"]
        category = research.get("category", "금융")

        # 리서치 데이터 포맷팅
        key_data_lines = "\n".join(
            f"  - {d['fact']} ({d['source']})"
            for d in research.get("key_data", [])
        )
        research_block = (
            f"━━━ 리서치 자료 (반드시 수치 인용) ━━━\n"
            f"주제: {topic}\n"
            f"카테고리: {category}\n"
            f"배경: {research.get('background', '')}\n"
            f"핵심 데이터:\n{key_data_lines}\n"
            f"독자 영향: {research.get('impact_on_public', '')}\n"
            f"관련 키워드: {', '.join(research.get('related_keywords', []))}\n"
        )

        json_format = (
            '{\n'
            '  "title": "SEO H1 제목 (40~60자, 핵심 수치 포함)",\n'
            '  "meta_description": "메타 설명 150~170자",\n'
            '  "subtitle": "부제목 30~60자",\n'
            '  "tags": ["태그1", "태그2", "태그3"],\n'
            '  "summary_points": [\n'
            '    "요약1 (60자 이상, 수치+연쇄효과 포함)",\n'
            '    "요약2", "요약3", "요약4", "요약5"\n'
            '  ],\n'
            '  "sections": [\n'
            '    {\n'
            '      "heading": "섹션 제목 (질문형 또는 핵심 메시지형)",\n'
            '      "paragraphs": [\n'
            '        "문단1 (4~5문장, 수치+출처 포함)",\n'
            '        "문단2",\n'
            '        "문단3"\n'
            '      ],\n'
            '      "expert_insight": "전문가 인사이트 1~2문장 (없으면 빈 문자열)"\n'
            '    },\n'
            '    ... (섹션 5개)\n'
            '  ],\n'
            '  "action_tips": ["구체적 행동 팁1", "팁2", "팁3", "팁4", "팁5", "팁6"],\n'
            '  "sources": ["한국은행, 2024", "금융위원회, 2025", ...]\n'
            '}'
        )

        instructions = (
            f"{self.prompt_text}\n\n"
            f"{research_block}\n\n"
            f"위 리서치 자료를 바탕으로 칼럼을 작성하세요. "
            f"반드시 리서치의 수치와 출처를 글에 직접 인용하세요.\n\n"
            f"아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요:\n"
            f"{json_format}"
        )

        print(f"[COLUMNIST] Claude API 호출 중... 모델: {self.model}", flush=True)
        payload = _post_json(
            self.ANTHROPIC_API_URL,
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            payload={
                "model": self.model,
                "max_tokens": 8000,
                "messages": [{"role": "user", "content": instructions}],
            },
            timeout=300,
        )

        content_text = payload["content"][0]["text"]
        try:
            data = json.loads(_extract_json(content_text))
        except json.JSONDecodeError as e:
            # 디버그: 실패한 원본 응답 일부 출력
            snippet = content_text[:500].replace("\n", "\\n")
            print(f"[COLUMNIST] JSON 파싱 실패: {e}", flush=True)
            print(f"[COLUMNIST] 응답 앞 500자: {snippet}", flush=True)
            raise RuntimeError(f"Claude JSON 파싱 실패: {e}") from e

        input_tokens = payload.get("usage", {}).get("input_tokens", 0)
        output_tokens = payload.get("usage", {}).get("output_tokens", 0)
        print(
            f"[COLUMNIST] 완료! 섹션={len(data.get('sections', []))} "
            f"토큰={input_tokens}→{output_tokens}",
            flush=True,
        )

        return Article(
            topic=topic,
            category=category,
            title=data["title"],
            meta_description=data.get("meta_description", ""),
            subtitle=data.get("subtitle", ""),
            summary_points=data.get("summary_points", []),
            sections=[
                ArticleSection(
                    heading=s["heading"],
                    paragraphs=s.get("paragraphs", []),
                    expert_insight=s.get("expert_insight", ""),
                )
                for s in data.get("sections", [])
            ],
            action_tips=data.get("action_tips", []),
            tags=data.get("tags", []),
            sources=data.get("sources", []),
        )


# ───────────────────────────────────────────
# HTML 렌더러 (Tailwind prose 호환 시멘틱 HTML)
# ───────────────────────────────────────────

def render_html(article: Article) -> str:
    """Article → 인라인 스타일 없는 시멘틱 HTML (Tailwind prose 클래스로 렌더링)"""

    # 핵심 요약
    summary_items = "".join(f"<li>{_esc(p)}</li>" for p in article.summary_points)
    summary_html = (
        f"<h3>✅ 핵심 요약</h3>"
        f"<ul>{summary_items}</ul>"
    ) if summary_items else ""

    # 본문 섹션
    sections_html = ""
    for section in article.sections:
        paragraphs_html = "".join(f"<p>{_esc(p)}</p>" for p in section.paragraphs)
        insight_html = (
            f"<blockquote><p>💡 {_esc(section.expert_insight)}</p></blockquote>"
        ) if section.expert_insight else ""
        sections_html += (
            f"<h2>{_esc(section.heading)}</h2>"
            f"{paragraphs_html}"
            f"{insight_html}"
        )

    # 실천 팁
    tips_html = "".join(f"<li>{_esc(tip)}</li>" for tip in article.action_tips)
    action_html = (
        f"<h3>🎯 지금 바로 확인할 것</h3>"
        f"<ul>{tips_html}</ul>"
    )

    # 출처
    if article.sources:
        sources_items = "".join(f"<li>{_esc(s)}</li>" for s in article.sources)
        sources_html = (
            f"<hr>"
            f"<h3>참고 자료</h3>"
            f"<ul>{sources_items}</ul>"
        )
    else:
        sources_html = ""

    return summary_html + sections_html + action_html + sources_html


def _extract_json(text: str) -> str:
    """코드펜스 제거 후 중첩 괄호 매칭으로 JSON 블록 추출"""
    # 코드펜스 제거
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())
    # 첫 { 찾기
    start = text.find("{")
    if start == -1:
        return text
    # 중첩 카운팅으로 닫는 } 찾기
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return _fix_json_strings(text[start : i + 1])
    return _fix_json_strings(text[start:])


def _fix_json_strings(text: str) -> str:
    """JSON 문자열 값 내부의 literal 개행/탭을 이스케이프 시퀀스로 치환"""
    result: list[str] = []
    in_string = False
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == "\\" and in_string:
            # 이미 이스케이프된 문자 — 다음 한 글자와 함께 그대로 유지
            result.append(ch)
            i += 1
            if i < len(text):
                result.append(text[i])
        elif ch == '"':
            in_string = not in_string
            result.append(ch)
        elif in_string and ch == "\n":
            result.append("\\n")
        elif in_string and ch == "\r":
            result.append("\\r")
        elif in_string and ch == "\t":
            result.append("\\t")
        else:
            result.append(ch)
        i += 1
    return "".join(result)


def _esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


# ───────────────────────────────────────────
# HTTP 헬퍼
# ───────────────────────────────────────────
def _post_json(url: str, headers: dict, payload: dict, timeout: int = 60) -> dict:
    raw_body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=raw_body, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {body}") from e
