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

from . import finance
from . import openai_client


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
    sources: list = field(default_factory=list)   # [{org,doc,as_of,basis,url}] 또는 문자열
    faqs: list[dict] = field(default_factory=list)
    slug_hint: str = ""           # 리서처가 제안한 slug (영문 하이픈)
    disclaimer: str = ""          # 면책 고지 문구
    calculator_ctas: list[dict] = field(default_factory=list)  # [{label, url}] (최대 2개)
    calc: dict | None = None      # 계산 입력값 (finance.compute_calc용). 없으면 None
    answer_box: str = ""          # 상단 핵심 답변 (계산 결과 기반, 시스템 생성)
    comparison_tables: list = field(default_factory=list)  # 비계산형 글용 [{title, headers, rows}]

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


def suggest_calc_type(category: str, topic: str) -> str | None:
    """주제·카테고리를 보고 채워야 할 calc.type을 추정한다.
    표준 계산이 없는 유형(전세/정책/신용점수)은 None을 반환한다.
    LLM이 calc 타입을 빠뜨리거나 잘못 고르는 것을 막는 힌트로 사용한다.
    """
    t = (topic or "").lower()
    c = (category or "").lower()

    # 표준 공식 없음 → calc=null 경로
    if "전세" in c or "전세" in t or "정책" in c or "신용점수" in c:
        return None
    # 주택 구매 자기자금(취득세·부대비용 포함)
    if "자기자금" in t or "취득세" in t or ("자금" in t and any(k in t for k in ["주택", "집", "구매", "매매"])):
        return "purchase_cash"
    # 대출기간 비교 (30년 vs 40년 등)
    if ("30년" in t and "40년" in t) or ("기간" in t and "비교" in t):
        return "repayment_compare"
    # 월 납입액·총이자 (보금자리론 등 상환 시뮬레이션)
    if any(k in t for k in ["월납입", "월 납입", "납입액", "총이자", "보금자리", "원리금", "원금균등"]):
        return "amortization"
    # 대환·갈아타기·중도상환 손익
    if "대환" in c or "대환" in t or "갈아타기" in t or "중도상환" in t:
        return "refinancing"
    # 기존부채가 한도를 얼마나 줄이는가
    if any(k in t for k in ["할부", "마이너스", "마통", "카드론", "완납", "기존부채", "신용대출"]):
        return "dsr_capacity"
    # 소득 기준 한도 (단독 vs 부부합산 등)
    if "한도" in t:
        return "loan_limit"
    return None


_CALC_TYPE_DESC = {
    "dsr_capacity": "기존부채(할부·마통·카드론 등)가 주담대 한도를 얼마나 줄이는지",
    "refinancing": "대환대출 손익(금리차 절감 vs 중도상환수수료)",
    "amortization": "대출 원금·금리·기간으로 월 납입액·총이자",
    "repayment_compare": "동일 원금에서 기간별(30년 vs 40년) 월납입·총이자 비교",
    "loan_limit": "소득·DSR(·LTV)로 주담대 한도(단독 vs 합산 비교 포함)",
    "purchase_cash": "주택가격·LTV·취득세·부대비용으로 필요 자기자금",
}


def _calc_hint_block(calc_type: str | None) -> str:
    """추정된 calc.type을 작성자에게 강한 힌트로 전달하는 블록."""
    if calc_type is None:
        return (
            "━━━ [계산 타입 힌트 — 비계산형] ━━━\n"
            "이 주제는 표준 계산공식이 없는 유형입니다. calc는 null로 두세요.\n"
            "대신 comparison_tables에 '기관·조건 비교표'를 1~2개 반드시 채우세요 "
            "(예: HUG·HF·SGI 보증 한도/보증금 상한/전세가율 비교, 또는 조건별 자격 비교).\n"
            "표는 headers 2개 이상, rows 2개 이상으로 구체 수치·기준을 담아야 하며, "
            "이 표가 이 글의 핵심 근거가 됩니다. 본문 문단은 표의 차이를 해설하는 데 집중하세요."
        )
    return (
        "━━━ [계산 타입 힌트 — 반드시 반영] ━━━\n"
        f"이 글은 '{calc_type}' 계산이 핵심입니다: {_CALC_TYPE_DESC.get(calc_type, '')}.\n"
        f"calc 객체의 \"type\"을 반드시 \"{calc_type}\"으로 설정하고, 해당 타입의 필수 입력값을 "
        "리서치 수치에 맞춰 정확히 채우세요. calc를 null로 두거나 다른 타입으로 바꾸지 마세요.\n"
        "표는 시스템이 calc로 자동 생성하므로 comparison_tables는 빈 배열 []로 두세요."
    )


class ColumnistWriter:
    OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, api_key: str, model: str, prompt_path: Path) -> None:
        self.api_key = api_key
        self.model = model
        self.prompt_text = prompt_path.read_text(encoding="utf-8")

    def write(
        self,
        research: dict,
        performance_hints: str | None = None,
        quality_hints: str | None = None,
    ) -> Article:
        """Tavily 리서치 결과를 받아 칼럼 Article 반환.
        performance_hints: 성과(CTR) 기반 제목 학습 힌트
        quality_hints: 과거 검수 실패 패턴 기반 품질 학습 힌트
        """
        topic = research["topic"]
        category = research.get("category", "금융")
        article_type = research.get("article_type", "경제이슈")
        category_frame = _get_category_frame(category, topic)
        calc_hint = _calc_hint_block(suggest_calc_type(category, topic))

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
            '  "title": "검색자가 입력할 법한 질문형 제목 (핵심 조건 포함, 가능하면 결과 방향)",\n'
            '  "meta_description": "메타 설명 150~170자",\n'
            '  "subtitle": "부제목 30~60자",\n'
            '  "slug": "영문 소문자+하이픈 3~6단어, 날짜 없이 주제 중심 (리서치 slug_hint 활용)",\n'
            '  "tags": ["태그1", "태그2", "태그3"],\n'
            '  "calc": {\n'
            '    "type": "dsr_capacity 또는 refinancing (해당 없으면 이 필드를 null)",\n'
            '    "annual_income": 50000000, "dsr_limit": 0.40,\n'
            '    "existing_monthly_payment": 500000, "mortgage_rate": 0.045, "years": 30,\n'
            '    "repayment_type": "원리금균등", "existing_label": "자동차 할부",\n'
            '    "scenarios": [0, 300000, 500000, 800000], "as_of": "YYYY.MM"\n'
            '  },\n'
            '  "summary_points": [\n'
            '    "요약 1개 (계산 가정+결과 방향+\'조건에 따라 다를 수 있음\' 포함). calc가 있으면 시스템 답변 박스가 우선한다."\n'
            '  ],\n'
            '  "sections": [\n'
            '    {\n'
            '      "heading": "섹션 제목 (조건 명시형 또는 질문형)",\n'
            '      "paragraphs": ["해석 문단 (표의 숫자가 왜 그렇게 나오는지 설명, 결과 수치 임의 생성·링크·HTML 금지)", "문단2"],\n'
            '      "expert_insight": "핵심 포인트 1~2문장 (없으면 빈 문자열)"\n'
            '    },\n'
            f'    ... (섹션 {section_target}개: 해석 → 결과를 바꾸는 변수 → 실제 행동 가이드)\n'
            '  ],\n'
            '  "calculator_ctas": [\n'
            '    {"label": "자연어 앵커 텍스트 (본문 중간용)", "url": "/calculator/dsr-dti-ltv"},\n'
            '    {"label": "자연어 앵커 텍스트 (하단용)", "url": "/calculator/loan-limit"}\n'
            '  ],\n'
            '  "comparison_tables": [\n'
            '    {"title": "비교표 제목 (예: HUG·HF·SGI 보증 조건 비교)", "headers": ["구분", "HUG", "HF", "SGI"], "rows": [["보증 한도", "값", "값", "값"], ["보증금 상한", "값", "값", "값"]]}\n'
            '  ],\n'
            '  "action_tips": ["지금 확인할 것1 (링크·HTML 없이 문장만)", "확인2", "확인3"],\n'
            '  "sources": [\n'
            '    {"org": "금융위원회", "doc": "DSR 제도 설명자료", "as_of": "YYYY.MM.DD", "basis": "DSR = 연간 원리금 상환액 / 연소득", "url": ""},\n'
            '    {"org": "금융감독원", "doc": "가계대출 소비자 안내", "as_of": "YYYY.MM.DD", "basis": "기존부채 반영 방식", "url": ""}\n'
            '  ],\n'
            '  "faqs": [\n'
            '    {"question": "검색 질문과 직결되는 질문1?", "answer": "숫자 예시 포함 답변 (2~3문장)"},\n'
            '    {"question": "질문2?", "answer": "답변2"},\n'
            '    {"question": "질문3?", "answer": "답변3"}\n'
            '  ],\n'
            '  "disclaimer": "이 글은 정보 제공 목적으로 작성되었으며, 금융기관 심사 결과를 보장하지 않습니다. 실제 대출 여부 및 한도는 신청 금융기관의 기준에 따라 달라질 수 있습니다."\n'
            '}'
        )

        hints_block = f"\n{performance_hints}\n" if performance_hints else ""
        quality_block = f"\n{quality_hints}\n" if quality_hints else ""

        instructions = (
            f"{self.prompt_text}\n\n"
            f"{category_frame}\n\n"
            f"{calc_hint}\n\n"
            f"{research_block}\n"
            f"{hints_block}\n"
            f"{quality_block}\n"
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

        return _build_article(data, topic=topic, category=category,
                              fallback_slug=research.get("slug_hint", ""))


    def rewrite(self, article: Article, issues: list[dict], research: dict) -> Article:
        """AI 검수 지적사항을 반영해 기존 글을 개선한다.
        완전히 새로 쓰지 않고 지적받은 항목(fail/warn)만 수정한다.
        """
        category_frame = _get_category_frame(article.category, article.topic)
        calc_hint = _calc_hint_block(suggest_calc_type(article.category, article.topic))
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
            '  "title": "질문형 제목 (핵심 조건·결과 방향 포함)",\n'
            '  "meta_description": "메타 설명 150~170자",\n'
            '  "subtitle": "부제목 30~60자",\n'
            '  "slug": "영문 소문자+하이픈 (기존 slug 최대한 유지)",\n'
            '  "tags": ["태그1", "태그2", "태그3"],\n'
            '  "calc": {"type": "dsr_capacity/refinancing 또는 null", "...": "계산 입력값 (금액=원, 금리/DSR=소수)"},\n'
            '  "summary_points": ["요약 (계산 가정+결과 방향 포함)"],\n'
            '  "sections": [\n'
            '    {\n'
            '      "heading": "섹션 제목",\n'
            '      "paragraphs": ["해석 문단 (결과 수치 임의 생성·링크·HTML 금지)", "문단2"],\n'
            '      "expert_insight": "핵심 포인트 또는 빈 문자열"\n'
            '    }\n'
            f'    ... (섹션 {section_count}개)\n'
            '  ],\n'
            '  "calculator_ctas": [{"label": "자연어 텍스트", "url": "/calculator/..."}],\n'
            '  "comparison_tables": [{"title": "비교표 제목", "headers": ["구분","A","B"], "rows": [["기준1","값","값"],["기준2","값","값"]]}],\n'
            '  "action_tips": ["확인1", "확인2", "확인3"],\n'
            '  "sources": [{"org": "기관명", "doc": "문서명", "as_of": "YYYY.MM.DD", "basis": "확인 기준", "url": ""}],\n'
            '  "faqs": [{"question": "질문?", "answer": "숫자 예시 포함 답변"}],\n'
            '  "disclaimer": "면책 고지"\n'
            '}'
        )

        instructions = (
            f"{self.prompt_text}\n\n"
            f"{category_frame}\n\n"
            f"{calc_hint}\n\n"
            f"━━━ 현재 글 (개선 대상) ━━━\n"
            f"제목: {article.title}\n"
            f"부제목: {article.subtitle}\n"
            f"메타: {article.meta_description}\n"
            f"slug: {article.slug_hint or article.slug}\n"
            f"섹션 구조:\n{sections_summary}\n"
            f"출처: {'; '.join(finance.source_to_text(s) for s in article.sources)}\n"
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

        return _build_article(data, topic=article.topic, category=article.category,
                              fallback_slug=article.slug_hint,
                              fallback_disclaimer=article.disclaimer)


DEFAULT_DISCLAIMER = (
    "이 글은 정보 제공 목적으로 작성되었으며, 금융기관 심사 결과를 보장하지 않습니다. "
    "실제 대출 여부 및 한도는 신청 금융기관의 기준에 따라 달라질 수 있습니다."
)


def _build_article(
    data: dict,
    *,
    topic: str,
    category: str,
    fallback_slug: str = "",
    fallback_disclaimer: str = DEFAULT_DISCLAIMER,
) -> Article:
    """LLM JSON → Article. calc 정제, 답변 박스 계산, CTA 정규화를 포함한다."""
    calc = data.get("calc")
    if not isinstance(calc, dict) or not calc.get("type"):
        calc = None

    article = Article(
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
        slug_hint=data.get("slug", fallback_slug),
        disclaimer=data.get("disclaimer") or fallback_disclaimer,
        calculator_ctas=finance.normalize_ctas(data.get("calculator_ctas", [])),
        calc=calc,
        comparison_tables=data.get("comparison_tables", []) if isinstance(data.get("comparison_tables"), list) else [],
    )

    # 상단 핵심 답변: 계산 결과가 있으면 계산값 기반(신뢰), 없으면 summary_point 첫 줄
    calc_result = finance.compute_calc(calc)
    if calc_result is not None:
        article.answer_box = calc_result.answer_box
    elif article.summary_points:
        article.answer_box = article.summary_points[0]
    return article


# ───────────────────────────────────────────
# HTML 렌더러 (Tailwind prose 호환 시멘틱 HTML)
# ───────────────────────────────────────────

def _cta_paragraph(cta: dict) -> str:
    """자연어 문장 안에 계산기 링크 1개를 삽입한 CTA 문단."""
    label = cta["label"].rstrip().rstrip("→").rstrip()
    return f'<p><a href="{_esc(cta["url"])}">👉 {_esc(label)}</a></p>'


def render_html(article: Article, calc_result: "finance.CalcResult | None" = None) -> str:
    """Article → 시멘틱 HTML (Tailwind prose 렌더링).

    구성: [상단 핵심 답변] → [계산 가정/과정/시나리오 표] → [본문 섹션 + 중간 CTA]
          → [지금 확인할 것] → [하단 CTA] → [FAQ] → [출처] → [면책]
    금융 수치가 담긴 표와 답변 박스는 finance 모듈이 생성한 값만 사용한다.
    """
    if calc_result is None:
        calc_result = finance.compute_calc(article.calc)

    # 1) 상단 핵심 답변
    if calc_result is not None:
        answer_html = finance.render_answer_box(calc_result)
    elif article.answer_box:
        answer_html = (
            f'<blockquote><p><strong>📌 핵심 답변</strong><br>{_esc(article.answer_box)}</p></blockquote>'
        )
    else:
        answer_html = ""

    # 2) 표 영역 — 계산이 있으면 코드 계산 표, 없으면 LLM 구조화 비교표
    if calc_result is not None:
        tables_html = finance.render_calc_tables(calc_result)
    else:
        tables_html = finance.render_comparison_tables(article.comparison_tables)

    # 3) 본문 섹션 (문단은 모두 이스케이프 → 원시 HTML 노출 방지)
    ctas = article.calculator_ctas or []
    mid_cta = ctas[0] if len(ctas) >= 1 else None
    bottom_cta = ctas[1] if len(ctas) >= 2 else (ctas[0] if len(ctas) == 1 else None)

    sections_html = ""
    for idx, section in enumerate(article.sections):
        paragraphs_html = "".join(f"<p>{_esc(p)}</p>" for p in section.paragraphs)
        insight_html = (
            f"<blockquote><p>💡 {_esc(section.expert_insight)}</p></blockquote>"
        ) if section.expert_insight else ""
        sections_html += (
            f"<h2>{_esc(section.heading)}</h2>{paragraphs_html}{insight_html}"
        )
        # 본문 중간 CTA 1개: 첫 섹션 뒤에 삽입
        if idx == 0 and mid_cta:
            sections_html += _cta_paragraph(mid_cta)

    # 4) 지금 확인할 것 (링크 없이 체크리스트만)
    action_html = ""
    if article.action_tips:
        tips_html = "".join(f"<li>{_esc(tip)}</li>" for tip in article.action_tips if str(tip).strip())
        if tips_html:
            action_html = f"<h3>🎯 지금 바로 확인할 것</h3><ul>{tips_html}</ul>"

    # 5) 하단 CTA 1개 (중간 CTA와 URL이 다를 때만)
    bottom_cta_html = ""
    if bottom_cta and (not mid_cta or bottom_cta.get("url") != mid_cta.get("url")):
        bottom_cta_html = _cta_paragraph(bottom_cta)

    # 6) FAQ (시멘틱 + JSON-LD)
    faq_html = ""
    valid_faqs = [f for f in article.faqs if f.get("question") and f.get("answer")]
    if valid_faqs:
        faq_items_html = "".join(
            f"<dt><strong>{_esc(f['question'])}</strong></dt><dd>{_esc(f['answer'])}</dd>"
            for f in valid_faqs
        )
        faq_schema = json.dumps(
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {"@type": "Question", "name": f["question"],
                     "acceptedAnswer": {"@type": "Answer", "text": f["answer"]}}
                    for f in valid_faqs
                ],
            },
            ensure_ascii=False,
        )
        faq_html = (
            f'<script type="application/ld+json">{faq_schema}</script>'
            f"<h3>자주 묻는 질문 (FAQ)</h3><dl>{faq_items_html}</dl>"
        )

    # 7) 출처 (기관명·문서명·기준일·확인기준 구조화)
    sources_html = finance.render_sources(article.sources)

    # 8) 면책 고지
    disclaimer_html = (
        f"<hr><p><small>⚠️ {_esc(article.disclaimer)}</small></p>"
        if article.disclaimer else ""
    )

    return (
        answer_html + tables_html + sections_html + action_html
        + bottom_cta_html + faq_html + sources_html + disclaimer_html
    )


# 계산이 반드시 필요한(계산 실패 시 발행 불가) 카테고리
CALC_REQUIRED_CATEGORIES = {"주담대", "대환대출", "신용대출"}


def assess(article: Article) -> dict:
    """Article을 렌더링하고 하드 게이트 검증까지 수행한다.
    반환: {html, calc_result, validation, requires_calc}
    """
    calc_result = finance.compute_calc(article.calc)
    html = render_html(article, calc_result=calc_result)

    requires_calc = article.category in CALC_REQUIRED_CATEGORIES
    paragraphs: list[str] = []
    for s in article.sections:
        paragraphs.extend(s.paragraphs)
    paragraphs.extend(str(t) for t in article.action_tips)

    validation = finance.validate_article(
        calc_result=calc_result,
        paragraphs=paragraphs,
        answer_box_text=(calc_result.answer_box if calc_result else article.answer_box),
        sources=article.sources,
        ctas=article.calculator_ctas,
        full_html=html,
        requires_calc=requires_calc,
        comparison_tables=article.comparison_tables,
    )
    return {
        "html": html,
        "calc_result": calc_result,
        "validation": validation,
        "requires_calc": requires_calc,
    }


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
    """OpenAI 호출 래퍼. 모델이 거부하는 샘플링 파라미터는 자동으로 떼고 재시도한다."""
    api_key = (headers.get("Authorization") or "").removeprefix("Bearer ").strip()
    try:
        return openai_client.post_chat(api_key, payload, timeout=timeout, tag="COLUMNIST")
    except openai_client.OpenAIRequestError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.body}") from e
