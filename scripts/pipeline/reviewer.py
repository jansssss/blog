"""
자동 생성 블로그 글 AI 검수 리포트 생성기
- 글을 수정하지 않고 검수 JSON 리포트만 반환
- 100점 배점을 둘로 나눈다:
    · 코드 채점 30점  — 출처/기준일/CTA/렌더링처럼 결정론적으로 판정 가능한 항목
    · LLM 채점 70점  — 제목·답변·숫자·표 구성처럼 판단이 필요한 항목
  LLM에게 코드가 판정할 수 있는 항목을 맡기지 않는다(추측 채점·유령 fail 방지).
- LLM에는 잘린 HTML이 아니라 글 전체를 담은 구조화 다이제스트를 넘긴다.
- JSON 파싱 실패 시 "발행 보류" fallback 반환
"""
from __future__ import annotations

import json

from .columnist import Article
from . import finance
from . import openai_client


# 9개 항목 배점 (합계 100) — 키/배점은 quality_feedback 호환을 위해 유지
SCORE_MAX = {
    "title_search": 15,       # 제목 검색 적합성        [LLM]
    "answer_clarity": 15,     # 상단 핵심 답변의 명확성  [LLM]
    "key_numbers": 15,        # 핵심 숫자 존재 여부      [LLM]
    "calc_table": 15,         # 계산 과정 표 완성도      [LLM]
    "scenario_table": 10,     # 시나리오 비교표 완성도   [LLM]
    "source_specificity": 10, # 공식 출처의 구체성       [코드]
    "freshness_date": 10,     # 최신 기준일 표시         [코드]
    "cta_restraint": 5,       # CTA 절제와 자연스러움    [코드]
    "rendering": 5,           # HTML/렌더링 오류 없음    [코드]
}

# LLM이 채점하는 항목 (합계 70)
LLM_SCORE_KEYS = ("title_search", "answer_clarity", "key_numbers", "calc_table", "scenario_table")
# 코드가 채점하는 항목 (합계 30)
CODE_SCORE_KEYS = ("source_specificity", "freshness_date", "cta_restraint", "rendering")
# 코드가 소유한 판정 영역 — LLM이 이 카테고리로 fail을 올려도 신뢰하지 않는다
CODE_OWNED_CATEGORIES = {"sources", "freshness", "cta", "rendering"}


REVIEW_SYSTEM_PROMPT = """너는 ohyess.kr 금융 블로그 AI 검수관이다. 자동 생성된 금융 초안을 검수하고 구조화된 JSON 리포트만 반환한다. 글을 수정하지 않는다.

너의 판단 기준은 "좋은 문장"이 아니라 "독자의 의사결정에 도움 되는 계산 결과"다.

【중요】 출처 구체성, 기준일 표시, CTA 개수, HTML 렌더링 4개 항목은 코드가 이미 결정론적으로 채점했다.
너는 이 4개 항목을 채점하지 말고, 이 항목으로 issue를 올리지도 마라. 아래 5개 항목(합계 70점)만 채점한다.

1. 제목 검색 적합성 (15점)
   - 검색자가 실제 입력할 질문형 제목인가, 핵심 조건이 있는가
   - "얼마나 줄어드나"류 제목인데 본문에 최종 감소액이 없으면 대폭 감점

2. 상단 핵심 답변의 명확성 (15점)
   - 글 시작 300자 이내에 "이 조건에서는 얼마까지 가능하고, 기존 대비 얼마 줄어든다"가 숫자로 있는가

3. 핵심 숫자 존재 여부 (15점)
   - 최종 한도/감소액/손익 같은 결과 숫자가 명확한가

4. 계산 과정 표 완성도 (15점)
   - DSR상 상환 가능액 → 기존부채 상환액 → 상환 여력 → 월 상환액 → 환산 한도가 표로 있는가
   - 표 없이 문장으로만 계산을 설명하면 감점

5. 시나리오 비교표 완성도 (10점)
   - 기본 사례 외 2개 이상 비교 사례가 표로 있는가

너는 글 전체(상단 답변·표 전문·본문 섹션·체크리스트·CTA·FAQ·출처)를 아래에서 제공받는다.
제공된 내용에 있는 것을 "없다"고 판정하지 마라. 확인 가능한 근거로만 감점하라.
또한 "코드 검증 결과(객관 사실)"와 모순되게 채점하지 마라.

severity=fail은 아래처럼 글의 존재 이유가 무너진 경우에만 쓴다(남발 금지):
- 제목엔 "얼마나 줄어드나"인데 본문 어디에도 최종 감소액이 없음
- DSR 설명만 있고 실제 대출한도 환산액이 없음
- 계산형 글인데 계산 표가 전혀 없음(문장 설명만 존재)
- 본문의 숫자가 서로 모순되거나 계산 결과와 어긋남
그 외 개선 여지는 severity=warn 또는 info로 분류한다.

risk_level: high(계산·수치 모순), medium(warn 위주), low(문제 거의 없음)

JSON 형식 외 텍스트는 절대 출력하지 않는다."""


REVIEW_RESPONSE_FORMAT = """{
  "scores": {
    "title_search": <0~15>,
    "answer_clarity": <0~15>,
    "key_numbers": <0~15>,
    "calc_table": <0~15>,
    "scenario_table": <0~10>
  },
  "issues": [
    {"severity": "fail | warn | info", "category": "title | answer | numbers | calc | scenario | ymyl",
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
    "schema_version": 3,
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


# ───────────────────────────────────────────
# 코드 채점 (30점) — 결정론적으로 판정 가능한 항목
# ───────────────────────────────────────────

def _source_is_complete(s) -> bool:
    """출처가 기관명·문서명·기준일(YYYY.MM 이상)을 모두 갖췄는지."""
    if not isinstance(s, dict):
        return False
    org = (s.get("org") or "").strip()
    doc = (s.get("doc") or "").strip()
    return bool(org and doc and finance.source_has_date(s))


def score_objective(article: Article, validation: "finance.ValidationResult | None") -> tuple[dict, list[dict]]:
    """출처/기준일/CTA/렌더링을 코드로 채점하고 (점수, 이슈) 반환."""
    scores: dict[str, int] = {}
    issues: list[dict] = []

    sources = article.sources or []
    total = len(sources)

    # 1) 출처 구체성 (10) — 기관명+문서명+기준일을 모두 갖춘 비율
    if total == 0:
        scores["source_specificity"] = 0
        issues.append({
            "severity": "fail", "category": "sources",
            "message": "출처가 하나도 없습니다.",
            "evidence": "", "fix": "공식 기관 자료를 기관명·문서명·기준일과 함께 2건 이상 추가하세요.",
        })
    else:
        complete = sum(1 for s in sources if _source_is_complete(s))
        raw = 10 * complete / total
        # 출처가 1건뿐이면 만점을 주지 않는다 (근거 다양성)
        scores["source_specificity"] = int(round(min(raw, 6.0) if total < 2 else raw))
        if complete < total:
            issues.append({
                "severity": "warn", "category": "sources",
                "message": f"출처 {total}건 중 {total - complete}건에 문서명 또는 기준일이 없습니다.",
                "evidence": "", "fix": "각 출처에 org·doc·as_of(YYYY.MM.DD)를 채우세요.",
            })

    # 2) 최신 기준일 표시 (10) — 기준일이 붙은 출처 비율
    if total == 0:
        scores["freshness_date"] = 0
    else:
        dated = sum(1 for s in sources if finance.source_has_date(s))
        scores["freshness_date"] = int(round(10 * dated / total))
        if dated < total:
            issues.append({
                "severity": "warn", "category": "freshness",
                "message": f"출처 {total - dated}건에 기준일이 없습니다 (연도만 있는 것은 불충분).",
                "evidence": "", "fix": "as_of를 'YYYY.MM.DD' 형식으로 명시하세요.",
            })

    # 3) CTA 절제 (5) — 최대 2개, URL 중복 없음
    ctas = article.calculator_ctas or []
    urls = [(c.get("url") or "").strip() for c in ctas if isinstance(c, dict)]
    has_dup = len(urls) != len(set(urls))
    if len(ctas) > 2 or has_dup:
        scores["cta_restraint"] = 0
        issues.append({
            "severity": "warn", "category": "cta",
            "message": f"CTA가 {len(ctas)}개이거나 URL이 중복됩니다 (최대 2개, 중복 불가).",
            "evidence": "", "fix": "본문 중간 1개 + 하단 1개로 줄이세요.",
        })
    elif len(ctas) == 0:
        scores["cta_restraint"] = 4  # 과다는 아니지만 도구 연결이 없음
    else:
        scores["cta_restraint"] = 5

    # 4) 렌더링 (5) — 코드 검증 결과 그대로 반영
    checks = dict(getattr(validation, "checks", {}) or {})
    rendering = 5
    if checks.get("no_raw_html_in_body") is False:
        rendering -= 3
        issues.append({
            "severity": "fail", "category": "rendering",
            "message": "본문 문단에 원시 HTML/링크 태그가 노출됩니다.",
            "evidence": "", "fix": "문단은 순수 텍스트로만 작성하세요. 링크는 calculator_ctas로 분리합니다.",
        })
    if checks.get("no_empty_bullet") is False:
        rendering -= 2
        issues.append({
            "severity": "warn", "category": "rendering",
            "message": "빈 목록 항목이 있습니다.",
            "evidence": "", "fix": "빈 <li>를 제거하세요.",
        })
    scores["rendering"] = max(0, rendering)

    return scores, issues


# ───────────────────────────────────────────
# 검수 입력 다이제스트 — 잘린 HTML 대신 글 전체를 구조화해서 전달
# ───────────────────────────────────────────

def _rows_to_text(headers: list, rows: list, limit: int = 12) -> str:
    head = " | ".join(str(h) for h in (headers or []))
    body = "\n".join("  " + " | ".join(str(c) for c in r) for r in (rows or [])[:limit])
    more = f"\n  … 외 {len(rows) - limit}행" if rows and len(rows) > limit else ""
    return f"  [{head}]\n{body}{more}"


def _tables_digest(article: Article, calc_result) -> str:
    if calc_result is not None:
        return (
            "계산 가정 표:\n"
            + _rows_to_text(["항목", "기준"], [[k, v] for k, v in calc_result.assumption_rows])
            + "\n계산 과정 표:\n"
            + _rows_to_text(calc_result.calc_process_headers, calc_result.calc_process_rows)
            + "\n조건별 시나리오 비교표:\n"
            + _rows_to_text(calc_result.scenario_headers, calc_result.scenario_rows)
        )
    tables = article.comparison_tables or []
    if not tables:
        return "(표 없음 — 계산 결과도 비교표도 생성되지 않음)"
    out = []
    for t in tables:
        if not isinstance(t, dict):
            continue
        out.append(f"비교표 「{t.get('title', '조건 비교')}」:\n"
                   + _rows_to_text(t.get("headers") or [], t.get("rows") or []))
    return "\n".join(out) or "(유효한 표 없음)"


def _body_digest(article: Article, budget: int = 6000) -> str:
    """본문 전체를 넘기되 예산 초과 시 섹션별로 균등 축약(모든 heading은 보존)."""
    sections = article.sections or []
    if not sections:
        return "(본문 섹션 없음)"
    per = max(400, budget // len(sections))
    out = []
    for s in sections:
        text = " ".join(s.paragraphs or [])
        if len(text) > per:
            text = text[:per] + f" …(이하 {len(text) - per}자 생략)"
        block = f"## {s.heading}\n{text}"
        if s.expert_insight:
            block += f"\n💡 {s.expert_insight}"
        out.append(block)
    return "\n\n".join(out)


def _article_digest(article: Article, calc_result) -> str:
    """검수관이 9개 항목을 모두 실제로 확인할 수 있는 전체 다이제스트."""
    answer = (calc_result.answer_box if calc_result is not None else article.answer_box) or "(상단 핵심 답변 없음)"

    ctas = article.calculator_ctas or []
    cta_text = "\n".join(f"  - {c.get('label', '')} → {c.get('url', '')}" for c in ctas if isinstance(c, dict))

    faqs = [f for f in (article.faqs or []) if f.get("question") and f.get("answer")]
    faq_text = "\n".join(f"  Q. {f['question']}\n  A. {f['answer']}" for f in faqs)

    tips = [str(t) for t in (article.action_tips or []) if str(t).strip()]
    tips_text = "\n".join(f"  - {t}" for t in tips)

    src_text = "\n".join(f"  - {finance.source_to_text(s)}" for s in (article.sources or []))

    return (
        f"━━━ 상단 핵심 답변 ━━━\n{answer}\n\n"
        f"━━━ 표 (전문) ━━━\n{_tables_digest(article, calc_result)}\n\n"
        f"━━━ 본문 섹션 ━━━\n{_body_digest(article)}\n\n"
        f"━━━ 지금 바로 확인할 것 ━━━\n{tips_text or '  (없음)'}\n\n"
        f"━━━ 계산기 CTA ({len(ctas)}개) ━━━\n{cta_text or '  (없음)'}\n\n"
        f"━━━ FAQ ({len(faqs)}개) ━━━\n{faq_text or '  (없음)'}\n\n"
        f"━━━ 출처 ({len(article.sources or [])}건) ━━━\n{src_text or '  (없음)'}\n"
    )


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


def _normalize_review(parsed: dict, code_scores: dict, code_issues: list[dict]) -> dict:
    """LLM 응답 + 코드 채점을 합쳐 정규화한다."""
    parsed["schema_version"] = 3
    llm_scores = parsed.get("scores") or {}

    norm_scores: dict[str, int] = {}
    for k, mx in SCORE_MAX.items():
        if k in CODE_SCORE_KEYS:
            src = code_scores
        else:
            src = llm_scores
        try:
            v = int(src.get(k, 0))
        except (TypeError, ValueError):
            v = 0
        norm_scores[k] = max(0, min(mx, v))
    parsed["scores"] = norm_scores
    parsed["score_owner"] = {
        "code": list(CODE_SCORE_KEYS),
        "llm": list(LLM_SCORE_KEYS),
    }
    # total_score는 scores 합계로 강제 (LLM 산술 오류 방지)
    parsed["total_score"] = sum(norm_scores.values())

    # 이슈 병합 — 코드 소유 카테고리의 LLM 판정은 신뢰하지 않고 info로 강등
    merged: list[dict] = []
    for iss in parsed.get("issues") or []:
        if not isinstance(iss, dict):
            continue
        if iss.get("category") in CODE_OWNED_CATEGORIES:
            iss = dict(iss, severity="info",
                       message="[코드 채점 항목 — 참고] " + str(iss.get("message", "")))
        merged.append(iss)
    merged.extend(code_issues)
    parsed["issues"] = merged

    parsed.setdefault("suggestions", [])
    parsed.setdefault("title_suggestions", [])
    parsed.setdefault("human_checkpoints", [])
    parsed.setdefault("review_summary", "")

    # final_decision 정합성
    has_fail = any(i.get("severity") == "fail" for i in merged)
    ts = parsed["total_score"]
    if has_fail or ts < 80:
        parsed["final_decision"] = "발행 보류"
    elif ts >= 90:
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
        Article + 코드 검증 결과를 검수하고 리포트 JSON을 반환.
        출처/기준일/CTA/렌더링(30점)은 코드가 채점하고, 나머지 70점만 LLM이 채점한다.
        expects_calc=False면 표준 계산공식이 없는 유형(전세대출/정책자금 등)으로 보고
        계산 중심 항목을 '구조 적합성' 기준으로 적응 채점하도록 지시한다.
        JSON 파싱/API 오류 시 FALLBACK_REVIEW(발행 보류) 반환.
        """
        code_scores, code_issues = score_objective(article, validation)
        calc_result = finance.compute_calc(article.calc)

        adaptive_block = ""
        if not expects_calc:
            adaptive_block = (
                "━━━ 카테고리 적응 채점 (이 글은 표준 계산공식이 없는 유형: 전세대출/정책자금/신용점수 등) ━━━\n"
                "숫자 계산식·DSR 환산 표가 없다는 이유만으로 아래 항목을 0점 처리하지 마라.\n"
                "- calc_table(15): 숫자 계산표 대신 '조건/자격/기관별 비교 표'의 완성도로 채점\n"
                "- scenario_table(10): HUG/HF/SGI 등 상품·기관별 또는 조건별 비교의 완성도로 채점\n"
                "- key_numbers(15): 보증한도 비율(%)·보증금·공시가격·소득 기준 등 구체적 기준 수치 존재로 채점\n"
                "- answer_clarity(15): 상단에 '어느 기관·조건에서 막히고 어떻게 해결하는지'가 명확한지로 채점\n"
                "단, 제목 적합성은 동일하게 엄격히 본다.\n\n"
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
            f"--- 글 전문 ---\n{_article_digest(article, calc_result)}\n\n"
            f"위 내용을 검수하고 아래 JSON 형식으로만 응답하세요:\n{REVIEW_RESPONSE_FORMAT}"
        )

        payload = {
            "model": self.openai_model,
            "max_completion_tokens": 4000,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": REVIEW_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
        }

        try:
            data = openai_client.post_chat(
                self.openai_api_key, payload, timeout=90, tag="REVIEWER"
            )
            content = data["choices"][0]["message"]["content"].strip()
            parsed = json.loads(content)
            return _normalize_review(parsed, code_scores, code_issues)
        except openai_client.OpenAIRequestError as e:
            print(f"[REVIEWER] OpenAI HTTP {e.code}: {e.body[:200]}", flush=True)
            return dict(FALLBACK_REVIEW)
        except (json.JSONDecodeError, KeyError) as exc:
            print(f"[REVIEWER] JSON 파싱 실패: {exc}", flush=True)
            return dict(FALLBACK_REVIEW)
        except Exception as exc:
            print(f"[REVIEWER] 검수 오류: {exc}", flush=True)
            return dict(FALLBACK_REVIEW)
