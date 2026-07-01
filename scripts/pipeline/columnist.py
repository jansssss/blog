"""
OpenAI API로 금융 칼럼니스트 스타일 글 생성
- max_completion_tokens: 8000 (GitHub Actions에서는 타임아웃 없음)
- 구조화 JSON → Supabase 발행용 시멘틱 HTML 렌더링
"""
from __future__ import annotations

import json
import random
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
    faqs: list[dict] = field(default_factory=list)
    slug_hint: str = ""           # 리서처가 제안한 slug (영문 하이픈)
    disclaimer: str = ""          # 면책 고지 문구
    calculator_ctas: list[dict] = field(default_factory=list)  # [{label, url}]

    @property
    def slug(self) -> str:
        # slug_hint가 있고 유효하면 그대로 사용 (날짜 남발 방지)
        if self.slug_hint:
            clean = re.sub(r"[^a-z0-9-]", "", self.slug_hint.lower()).strip("-")
            if 3 <= len(clean) <= 80:
                return clean
        # fallback: 제목에서 ASCII 추출
        import hashlib
        normalized = unicodedata.normalize("NFKD", self.title).encode("ascii", "ignore").decode("ascii")
        slug_part = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
        if slug_part:
            today = date.today().strftime("%Y%m%d")
            return f"{today}-{slug_part[:40]}"
        # 한국어 제목은 ASCII 변환 불가 → 날짜+카테고리+해시
        title_hash = hashlib.md5(self.title.encode()).hexdigest()[:8]
        cat = re.sub(r"[^a-z]", "", self.category.lower()) or "finance"
        today = date.today().strftime("%Y%m%d")
        return f"{today}-{cat}-{title_hash}"


def _get_category_frame(category: str, topic: str) -> str:
    """카테고리·주제 키워드를 보고 주제별 작성 프레임 지시를 반환한다."""
    cat = category.lower()
    top = topic.lower()

    is_jeonse = "전세" in cat or "전세" in top
    is_refinancing = "대환" in cat or "대환" in top or "갈아타기" in top
    is_credit = "신용" in cat or "신용" in top or "거절" in top
    is_policy = "정책" in cat or "정책" in top

    if is_jeonse:
        return (
            "━━━ [이번 글 적용 프레임: 전세대출] ━━━\n"
            "이 글은 전세대출 주제입니다. 아래 규칙을 반드시 지키세요.\n"
            "① 제목과 핵심 결론에 'DSR 40%'를 사용하지 말 것 — 전세대출의 주요 심사 기준이 아님\n"
            "② DSR은 기존부채 영향을 설명할 때만 보조 항목으로 언급\n"
            "③ 계산 가정 표 항목: 보증금, 공시가격(감정가), 소득 유형, 보증기관, 보증한도 비율\n"
            "④ HUG/HF/SGI/버팀목 각 상품 조건을 구분해서 설명 — 서로 다른 상품을 한 조건처럼 합치지 말 것\n"
            "⑤ 출처 우선: HUG 상품안내, HF 보증 기준, 주택도시기금 홈페이지 (공식 기관 자료)\n"
            "⑥ 계산기 CTA 우선: /calculator/loan-limit, /calculator/loan-interest"
        )
    if is_refinancing:
        return (
            "━━━ [이번 글 적용 프레임: 대환대출] ━━━\n"
            "핵심 기준: 금리 차이, 중도상환수수료, 잔여기간, 손익분기점\n"
            "계산 가정 표 항목: 현재 대출 잔액, 현재 금리, 신규 금리, 잔여기간, 중도상환수수료율\n"
            "계산기 CTA 우선: /calculator/refinancing, /calculator/prepayment-fee, /calculator/repayment-compare"
        )
    if is_credit:
        return (
            "━━━ [이번 글 적용 프레임: 신용점수/대출거절] ━━━\n"
            "핵심 기준: 신용점수 구간, 연체 이력, 기존 대출 건수, 소득증빙 방법, 재신청 시점\n"
            "시나리오: 점수 구간별 금리 차이, 거절 후 대안 상품 순서"
        )
    if is_policy:
        return (
            "━━━ [이번 글 적용 프레임: 정책자금] ━━━\n"
            "핵심 기준: 대상 자격, 소득/자산 기준, 신청 기간, 제외 조건\n"
            "공식 신청 경로 반드시 포함 (주택도시기금 홈페이지, 서민금융진흥원 등)"
        )
    # 주담대/기본 DSR 프레임
    return (
        "━━━ [이번 글 적용 프레임: 주담대/DSR] ━━━\n"
        "핵심 기준: DSR, LTV, 금리, 상환기간, 월상환액, 기존부채\n"
        "계산 가정 표 항목: 연소득, 기존부채 월상환액, 금리, 대출기간, DSR 상한(40%), LTV 상한\n"
        "계산기 CTA 우선: /calculator/dsr-dti-ltv, /calculator/loan-limit"
    )


class ColumnistWriter:
    OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, api_key: str, model: str, prompt_path: Path) -> None:
        self.api_key = api_key
        self.model = model
        self.prompt_text = prompt_path.read_text(encoding="utf-8")

    def write(self, research: dict, performance_hints: str | None = None) -> Article:
        """Tavily 리서치 결과를 받아 칼럼 Article 반환"""
        topic = research["topic"]
        category = research.get("category", "금융")
        article_type = research.get("article_type", "경제이슈")
        category_frame = _get_category_frame(category, topic)

        # 리서치 데이터 포맷팅
        key_data_lines = "\n".join(
            f"  - {d['fact']} ({d['source']})"
            for d in research.get("key_data", [])
        )
        calc_assumption_lines = "\n".join(
            f"  - {a['label']}: {a['value']}"
            for a in research.get("calc_assumptions", [])
        )
        related_calcs = ", ".join(research.get("related_calculators", []))
        research_block = (
            f"━━━ 리서치 자료 (반드시 수치 인용) ━━━\n"
            f"주제: {topic}\n"
            f"글 유형: {article_type}\n"
            f"카테고리: {category}\n"
            f"독자 핵심 질문: {research.get('core_question', topic)}\n"
            f"slug 힌트(영문): {research.get('slug_hint', '')}\n"
            f"배경: {research.get('background', '')}\n"
            f"계산 가정:\n{calc_assumption_lines}\n"
            f"핵심 데이터:\n{key_data_lines}\n"
            f"독자 생활에 미치는 영향: {research.get('impact_on_public', '')}\n"
            f"관련 키워드: {', '.join(research.get('related_keywords', []))}\n"
            f"삽입할 ohyess 계산기 URL: {related_calcs}\n"
        )

        # 섹션 수를 3~5개로 무작위 변주 → 글 구조 동일성(scaled-content 패턴) 완화
        section_target = random.randint(3, 5)

        json_format = (
            '{\n'
            '  "title": "SEO H1 제목 (40~60자, 핵심 수치·조건 포함)",\n'
            '  "meta_description": "메타 설명 150~170자",\n'
            '  "subtitle": "부제목 30~60자",\n'
            '  "slug": "영문 소문자+하이픈 3~6단어, 날짜 없이 주제 중심 (리서치 slug_hint 활용)",\n'
            '  "tags": ["태그1", "태그2", "태그3"],\n'
            '  "summary_points": [\n'
            '    "요약 1개 (60자 이상, 계산 가정+결과 수치+\'조건에 따라 다를 수 있음\' 포함)"\n'
            '  ],\n'
            '  "sections": [\n'
            '    {\n'
            '      "heading": "섹션 제목 (조건 명시형 또는 질문형)",\n'
            '      "paragraphs": [\n'
            '        "문단1 (3~4문장, 수치+출처+계산 근거 포함)",\n'
            '        "문단2",\n'
            '        "문단3"\n'
            '      ],\n'
            '      "expert_insight": "핵심 포인트 1~2문장 (없으면 빈 문자열)"\n'
            '    },\n'
            f'    ... (섹션 {section_target}개, 계산 가정 표·시나리오 비교·계산기 CTA 섹션 포함)\n'
            '  ],\n'
            '  "calculator_ctas": [\n'
            '    {"label": "계산기 링크 텍스트", "url": "/calculator/dsr-dti-ltv"},\n'
            '    {"label": "계산기 링크 텍스트2", "url": "/calculator/loan-limit"}\n'
            '  ],\n'
            '  "action_tips": ["구체적 행동 팁1 (계산기 URL 포함 가능)", "팁2", "팁3", "팁4"],\n'
            '  "sources": ["한국은행, 2024", "금융위원회, 2025", ...],\n'
            '  "faqs": [\n'
            '    {"question": "독자가 실제로 검색할 법한 질문1?", "answer": "명확하고 구체적인 답변 (2~3문장, 수치 포함)"},\n'
            '    {"question": "질문2?", "answer": "답변2"},\n'
            '    {"question": "질문3?", "answer": "답변3"}\n'
            '  ],\n'
            '  "disclaimer": "이 글은 정보 제공 목적으로 작성되었으며, 금융기관 심사 결과를 보장하지 않습니다. 실제 대출 여부 및 한도는 신청 금융기관의 기준에 따라 달라질 수 있습니다."\n'
            '}'
        )

        hints_block = f"\n{performance_hints}\n" if performance_hints else ""

        instructions = (
            f"{self.prompt_text}\n\n"
            f"{category_frame}\n\n"
            f"{research_block}\n"
            f"{hints_block}\n"
            f"위 리서치 자료를 바탕으로 칼럼을 작성하세요. "
            f"반드시 리서치의 수치와 출처를 글에 직접 인용하세요.\n"
            f"이번 글은 섹션을 정확히 {section_target}개로 작성하세요. "
            f"섹션마다 길이·문단 수를 주제에 맞게 다르게 구성해 천편일률적인 구조를 피하세요.\n\n"
            f"아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요:\n"
            f"{json_format}"
        )

        print(f"[COLUMNIST] OpenAI API 호출 중... 모델: {self.model}", flush=True)
        payload = _post_json(
            self.OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            payload={
                "model": self.model,
                "max_completion_tokens": 8000,
                "temperature": 0.3,
                "messages": [{"role": "user", "content": instructions}],
            },
            timeout=300,
        )

        content_text = payload["choices"][0]["message"]["content"]
        try:
            data = json.loads(_extract_json(content_text))
        except json.JSONDecodeError as e:
            snippet = content_text[:500].replace("\n", "\\n")
            print(f"[COLUMNIST] JSON 파싱 실패: {e}", flush=True)
            print(f"[COLUMNIST] 응답 앞 500자: {snippet}", flush=True)
            raise RuntimeError(f"OpenAI JSON 파싱 실패: {e}") from e

        usage = payload.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)
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
            faqs=data.get("faqs", []),
            slug_hint=data.get("slug", research.get("slug_hint", "")),
            disclaimer=data.get("disclaimer", "이 글은 정보 제공 목적으로 작성되었으며, 금융기관 심사 결과를 보장하지 않습니다. 실제 대출 여부 및 한도는 신청 금융기관의 기준에 따라 달라질 수 있습니다."),
            calculator_ctas=data.get("calculator_ctas", []),
        )


    def rewrite(self, article: Article, issues: list[dict], research: dict) -> Article:
        """AI 검수 지적사항을 반영해 기존 글을 개선한다.
        완전히 새로 쓰지 않고 지적받은 항목(fail/warn)만 수정한다.
        """
        category_frame = _get_category_frame(article.category, article.topic)
        section_count = len(article.sections)

        sections_summary = "\n".join(
            f"  [{idx+1}] {s.heading}: {(s.paragraphs[0][:120] + '...') if s.paragraphs else '(단락 없음)'}"
            for idx, s in enumerate(article.sections)
        )

        fix_items = [
            f"  [{iss.get('severity', '?').upper()}·{iss.get('category', '')}] {iss.get('message', '')}\n"
            f"    근거: \"{iss.get('evidence', '')}\"\n"
            f"    수정 방향: {iss.get('fix', '')}"
            for iss in issues
            if iss.get("severity") in ("fail", "warn")
        ]
        issues_block = "\n".join(fix_items) if fix_items else "  (수정 필요 이슈 없음)"

        json_format = (
            '{\n'
            '  "title": "SEO H1 제목 (40~60자, 핵심 수치·조건 포함)",\n'
            '  "meta_description": "메타 설명 150~170자",\n'
            '  "subtitle": "부제목 30~60자",\n'
            '  "slug": "영문 소문자+하이픈 (기존 slug 최대한 유지)",\n'
            '  "tags": ["태그1", "태그2", "태그3"],\n'
            '  "summary_points": ["요약 (계산 가정+결과 수치 포함)"],\n'
            '  "sections": [\n'
            '    {\n'
            '      "heading": "섹션 제목",\n'
            '      "paragraphs": ["문단1", "문단2"],\n'
            '      "expert_insight": "핵심 포인트 또는 빈 문자열"\n'
            '    }\n'
            f'    ... (섹션 {section_count}개)\n'
            '  ],\n'
            '  "calculator_ctas": [{"label": "텍스트", "url": "/calculator/..."}],\n'
            '  "action_tips": ["팁1", "팁2", "팁3"],\n'
            '  "sources": ["출처1 (기관명, 연도)", "출처2"],\n'
            '  "faqs": [{"question": "질문?", "answer": "답변"}],\n'
            '  "disclaimer": "면책 고지"\n'
            '}'
        )

        instructions = (
            f"{self.prompt_text}\n\n"
            f"{category_frame}\n\n"
            f"━━━ 현재 글 (개선 대상) ━━━\n"
            f"제목: {article.title}\n"
            f"부제목: {article.subtitle}\n"
            f"메타: {article.meta_description}\n"
            f"slug: {article.slug_hint or article.slug}\n"
            f"섹션 구조:\n{sections_summary}\n"
            f"출처: {', '.join(article.sources)}\n"
            f"CTA URL: {', '.join(c.get('url', '') for c in article.calculator_ctas)}\n\n"
            f"━━━ AI 검수 지적사항 (반드시 모두 반영) ━━━\n"
            f"{issues_block}\n\n"
            f"위 지적사항을 반영해 글을 개선하세요.\n"
            f"- 지적받지 않은 섹션은 최대한 유지하고 지적된 부분만 수정\n"
            f"- 수치·계산을 수정할 때는 반드시 출처와 함께 작성\n"
            f"- 섹션 수는 기존과 동일하게 {section_count}개 유지\n"
            f"- 원 리서치 주제: '{research.get('topic', '')}'\n\n"
            f"아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 출력하지 마세요:\n"
            f"{json_format}"
        )

        print("[COLUMNIST] 재작성 API 호출 중...", flush=True)
        payload = _post_json(
            self.OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            payload={
                "model": self.model,
                "max_completion_tokens": 8000,
                "temperature": 0.2,
                "messages": [{"role": "user", "content": instructions}],
            },
            timeout=300,
        )

        content_text = payload["choices"][0]["message"]["content"]
        try:
            data = json.loads(_extract_json(content_text))
        except json.JSONDecodeError as e:
            snippet = content_text[:500].replace("\n", "\\n")
            print(f"[COLUMNIST] 재작성 JSON 파싱 실패: {e}", flush=True)
            print(f"[COLUMNIST] 응답 앞 500자: {snippet}", flush=True)
            raise RuntimeError(f"재작성 JSON 파싱 실패: {e}") from e

        usage = payload.get("usage", {})
        print(
            f"[COLUMNIST] 재작성 완료! 섹션={len(data.get('sections', []))} "
            f"토큰={usage.get('prompt_tokens', 0)}→{usage.get('completion_tokens', 0)}",
            flush=True,
        )

        return Article(
            topic=article.topic,
            category=article.category,
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
            faqs=data.get("faqs", []),
            slug_hint=data.get("slug", article.slug_hint),
            disclaimer=data.get("disclaimer", article.disclaimer),
            calculator_ctas=data.get("calculator_ctas", []),
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

    # FAQ 섹션 (시멘틱 HTML + JSON-LD 구조화 데이터)
    faq_html = ""
    if article.faqs:
        faq_items_html = "".join(
            f"<dt><strong>{_esc(faq['question'])}</strong></dt>"
            f"<dd>{_esc(faq['answer'])}</dd>"
            for faq in article.faqs
        )
        faq_schema = json.dumps(
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": faq["question"],
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq["answer"],
                        },
                    }
                    for faq in article.faqs
                ],
            },
            ensure_ascii=False,
        )
        faq_html = (
            f'<script type="application/ld+json">{faq_schema}</script>'
            f"<h3>자주 묻는 질문 (FAQ)</h3>"
            f"<dl>{faq_items_html}</dl>"
        )

    # 계산기 CTA
    cta_html = ""
    if article.calculator_ctas:
        cta_links = "".join(
            f'<li><a href="{_esc(c["url"])}">{_esc(c["label"].rstrip().rstrip("→").rstrip())} →</a></li>'
            for c in article.calculator_ctas
        )
        cta_html = (
            f"<h3>🧮 직접 계산해보기</h3>"
            f"<ul>{cta_links}</ul>"
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

    # 면책 고지
    disclaimer_html = ""
    if article.disclaimer:
        disclaimer_html = (
            f"<hr>"
            f"<p><small>⚠️ {_esc(article.disclaimer)}</small></p>"
        )

    return summary_html + sections_html + action_html + cta_html + faq_html + sources_html + disclaimer_html


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
