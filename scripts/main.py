"""
ohyess.kr 자동 발행 파이프라인
Usage:
  python -m scripts.main                    # 오늘 이슈 1개 자동 발행
  python -m scripts.main --mode draft       # 초안으로만 저장
  python -m scripts.main --count 2          # 오늘 이슈 2개 발행
  python -m scripts.main --dry-run          # Supabase 저장 없이 미리보기
"""
from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가 (로컬 실행용)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.pipeline.config import load_config
from scripts.pipeline.researcher import TavilyResearcher
from scripts.pipeline.columnist import ColumnistWriter, assess
from scripts.pipeline.publisher import SupabasePublisher
from scripts.pipeline.reviewer import ArticleReviewer
from scripts.analytics.gsc_query_selector import GSCQuerySelector
from scripts.analytics.performance_analyzer import PerformanceAnalyzer
from scripts.analytics.quality_feedback import QualityFeedbackAnalyzer


# 로드맵 모드용 핵심 콘텐츠 클러스터 (GSC 데이터 없이 사용)
ROADMAP_TOPICS: list[tuple[str, str]] = [
    ("주담대_DSR_사례",       "DSR 40% 기준 연봉별 주담대 최대 한도 계산 사례"),
    ("연봉별_대출한도",       "연봉 5000만원 주담대 한도 얼마까지 가능한가"),
    ("자동차할부_주담대",     "자동차 할부 있을 때 주담대 한도 얼마나 줄어드나"),
    ("신용대출_DSR",          "마이너스통장 신용대출 있을 때 주담대 DSR 영향 계산"),
    ("대환대출_손익",         "주담대 갈아타기 중도상환수수료 금리차이 손익분기점 계산"),
    ("전세대출_거절재신청",   "전세대출 거절 이유와 재신청 조건 HUG HF"),
    ("보증보험_비교",         "전세보증보험 HUG HF SGI 가입 조건 한도 비교"),
    ("정책자금_신청",         "청년 정책자금 대출 자격 조건 소득 한도 신청 방법"),
]


def compute_publish_gate(ai_review: dict, validation) -> dict:
    """점수 + 코드 검증 하드 게이트를 합쳐 발행 상태를 판정한다.

    상태:
      auto_ok         90+ & warn 0 & 계산·출처·렌더링 검증 통과 → 자동 발행 품질
      human_review    85~89 → 사람 검토 후 발행
      draft_reinforce 80~84 → 초안 보강 필요
      regenerate      79 이하 · fail · 하드 게이트 실패 → 재생성
    금융 계산 글은 점수가 높아도 하드 게이트(계산/출처/렌더링) 실패 시 무조건 regenerate.
    """
    score = ai_review.get("total_score", 0)
    issues = ai_review.get("issues", [])
    fail_count = sum(1 for i in issues if i.get("severity") == "fail")
    warn_count = sum(1 for i in issues if i.get("severity") == "warn")
    hard_fail = list(getattr(validation, "hard_fail", []) or [])

    if hard_fail or fail_count > 0 or score < 80:
        status = "regenerate"
    elif score >= 90 and warn_count == 0:
        status = "auto_ok"
    elif score >= 85:
        status = "human_review"
    else:  # 80~84
        status = "draft_reinforce"

    return {
        "status": status,
        "score": score,
        "fail_count": fail_count,
        "warn_count": warn_count,
        "hard_fail": hard_fail,
        "warnings": list(getattr(validation, "warnings", []) or []),
        "checks": dict(getattr(validation, "checks", {}) or {}),
    }


def _needs_rewrite(gate: dict) -> bool:
    """재작성이 필요한 조건: 발행 게이트가 regenerate인 경우."""
    return gate.get("status") == "regenerate"


def pick_roadmap_seed(excluded_topics: list[str]) -> str:
    """날짜 기반으로 로드맵 클러스터에서 시드 쿼리 선택 (이미 발행된 주제 최대한 회피)."""
    n = len(ROADMAP_TOPICS)
    base = date.today().toordinal() % n
    excluded_lower = [t.lower() for t in excluded_topics]
    for offset in range(n):
        _, query = ROADMAP_TOPICS[(base + offset) % n]
        q_lower = query.lower()
        if not any(q_lower in p or p in q_lower for p in excluded_lower):
            return query
    return ROADMAP_TOPICS[base][1]


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="ohyess.kr 자동 발행 파이프라인")
    p.add_argument("--mode", choices=["publish", "draft"], default=None,
                   help="발행 모드 (기본: 환경변수 PUBLISH_MODE 또는 publish)")
    p.add_argument("--count", type=int, default=None,
                   help="생성할 글 수 (기본: 환경변수 POSTS_PER_RUN 또는 1)")
    p.add_argument("--dry-run", action="store_true",
                   help="Supabase 저장 없이 HTML 미리보기만 출력")
    return p


def main() -> None:
    args = build_parser().parse_args()
    config = load_config()

    mode = args.mode or config.publish_mode
    count = args.count or config.posts_per_run

    # ── 환경변수 검증 ──────────────────────────────
    missing = []
    if not config.tavily_api_key:
        missing.append("TAVILY_API_KEY")
    if not config.openai_api_key:
        missing.append("OPENAI_API_KEY")
    if not args.dry_run:
        if not config.supabase_url:
            missing.append("NEXT_PUBLIC_SUPABASE_URL")
        if not config.supabase_service_role_key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print(f"[ERROR] 필수 환경변수 누락: {', '.join(missing)}", flush=True)
        sys.exit(1)

    # ── 파이프라인 초기화 ──────────────────────────
    researcher = TavilyResearcher(config.tavily_api_key, config.openai_api_key, config.openai_model)
    reviewer = ArticleReviewer(config.openai_api_key, config.openai_model)
    writer = ColumnistWriter(
        api_key=config.openai_api_key,
        model=config.openai_model,
        prompt_path=config.prompt_path,
    )
    publisher = SupabasePublisher(
        supabase_url=config.supabase_url,
        service_role_key=config.supabase_service_role_key,
    ) if not args.dry_run else None

    # ── 최근 발행 주제 조회 (중복 방지) ────────────────
    excluded_topics: list[str] = []
    if publisher:
        print("[INIT] 최근 발행 주제 조회 중...", flush=True)
        excluded_topics = publisher.get_recent_topics(limit=30)
        if excluded_topics:
            print(f"[INIT] 제외할 주제 {len(excluded_topics)}개 로드 완료", flush=True)

    # ── 분석기 초기화 (Supabase 연결 있을 때만) ─────────
    gsc_selector: GSCQuerySelector | None = None
    perf_analyzer: PerformanceAnalyzer | None = None
    quality_analyzer: QualityFeedbackAnalyzer | None = None
    if config.supabase_url and config.supabase_service_role_key:
        gsc_selector = GSCQuerySelector(config.supabase_url, config.supabase_service_role_key)
        perf_analyzer = PerformanceAnalyzer(config.supabase_url, config.supabase_service_role_key)
        quality_analyzer = QualityFeedbackAnalyzer(config.supabase_url, config.supabase_service_role_key)

    # ── 실행 ────────────────────────────────────────
    for i in range(count):
        print(f"\n{'='*50}", flush=True)
        print(f"[PIPELINE] {i+1}/{count}번째 글 생성 시작", flush=True)

        # STEP 0: 주제 선정 (CONTENT_SEED_MODE 분기)
        seed_query: str | None = None
        opportunity: dict | None = None
        topic_source = "roadmap"
        seed_mode = config.content_seed_mode

        print(f"[STEP 0] CONTENT_SEED_MODE={seed_mode}", flush=True)

        if seed_mode == "gsc":
            # 기존 동작: opportunity → gsc_query → tavily_evergreen
            topic_source = "tavily_evergreen"
            if gsc_selector:
                opportunity = gsc_selector.pick_best_opportunity(excluded_topics)
                if opportunity:
                    seed_query = opportunity["query"]
                    topic_source = "gsc_opportunity"
                else:
                    seed_query = gsc_selector.pick_best_query(excluded_topics)
                    if seed_query:
                        topic_source = "gsc_query"

        elif seed_mode == "hybrid":
            # GSC 데이터 충분 여부 확인 후 분기
            gsc_ready = bool(gsc_selector and gsc_selector.has_sufficient_data())
            if gsc_ready:
                opportunity = gsc_selector.pick_best_opportunity(excluded_topics)
                if opportunity:
                    seed_query = opportunity["query"]
                    topic_source = "gsc_opportunity"
                else:
                    seed_query = gsc_selector.pick_best_query(excluded_topics)
                    if seed_query:
                        topic_source = "gsc_query"
                    else:
                        seed_query = pick_roadmap_seed(excluded_topics)
                        topic_source = "roadmap"
            else:
                seed_query = pick_roadmap_seed(excluded_topics)
                topic_source = "roadmap"

        else:  # roadmap
            seed_query = pick_roadmap_seed(excluded_topics)
            topic_source = "roadmap"

        print(f"[STEP 0] 주제 선정 방식: {topic_source}", flush=True)
        if opportunity:
            print(f"[STEP 0] 기회: '{seed_query}' on {opportunity['page_path']} — {opportunity['reason']}", flush=True)
        elif topic_source == "roadmap" and seed_query:
            print(f"[STEP 0] 로드맵 시드: '{seed_query}'", flush=True)

        # 1. Tavily - 오늘의 이슈 리서치
        print("[STEP 1] Tavily 리서치 중...", flush=True)
        try:
            research = researcher.research_today(
                excluded_topics=excluded_topics,
                seed_query=seed_query,
                opportunity=opportunity,
            )
            print(f"[STEP 1] 완료 - 주제: {research['topic']}", flush=True)
            excluded_topics.append(research["topic"])  # 같은 실행 내 중복 방지
        except Exception as exc:
            print(f"[STEP 1] 실패: {exc}", flush=True)
            sys.exit(1)

        # 2. OpenAI - 칼럼 작성
        print("[STEP 2] OpenAI 칼럼 작성 중...", flush=True)
        performance_hints = perf_analyzer.get_writing_hints() if perf_analyzer else None
        quality_hints = quality_analyzer.get_quality_hints() if quality_analyzer else None
        try:
            article = writer.write(
                research,
                performance_hints=performance_hints,
                quality_hints=quality_hints,
            )
            print(f"[STEP 2] 완료 - 제목: {article.title}", flush=True)
        except Exception as exc:
            print(f"[STEP 2] 실패: {exc}", flush=True)
            sys.exit(1)

        # 3. HTML 렌더링 + 코드 검증 (계산/출처/렌더링 하드 게이트)
        assessment = assess(article)
        html = assessment["html"]
        validation = assessment["validation"]
        print(
            f"[STEP 3] HTML 렌더링 완료 ({len(html):,}자) — "
            f"코드검증 {'통과' if validation.passed else '실패: ' + '; '.join(validation.hard_fail)}",
            flush=True,
        )

        # 3.5. AI 검수 + 재작성 루프 (최대 2회)
        MAX_REWRITES = 2
        ai_review: dict | None = None
        gate: dict | None = None
        previous_scores: list[int] = []
        rewrite_attempts = 0

        try:
            ai_review = reviewer.review(article, html, research, validation)
            gate = compute_publish_gate(ai_review, validation)
            print(
                f"[STEP 3.5] AI 검수 — {ai_review.get('final_decision')} "
                f"({gate['score']}점, fail {gate['fail_count']}건) → 게이트: {gate['status']}",
                flush=True,
            )

            for attempt in range(1, MAX_REWRITES + 1):
                if not _needs_rewrite(gate):
                    break
                previous_scores.append(gate["score"])
                print(
                    f"[STEP 3.5] 재작성 시도 {attempt}/{MAX_REWRITES} "
                    f"(이전 점수: {previous_scores[-1]}점, 하드실패: {gate['hard_fail']})...",
                    flush=True,
                )
                try:
                    new_article = writer.rewrite(article, ai_review.get("issues", []), research)
                    new_assessment = assess(new_article)
                    new_html = new_assessment["html"]
                    new_validation = new_assessment["validation"]
                    print(f"[STEP 3.5] 재작성 HTML ({len(new_html):,}자)", flush=True)
                    new_review = reviewer.review(new_article, new_html, research, new_validation)
                    new_gate = compute_publish_gate(new_review, new_validation)
                    # 모든 단계 성공 시에만 교체
                    article, html, validation = new_article, new_html, new_validation
                    ai_review, gate = new_review, new_gate
                    rewrite_attempts += 1
                    print(
                        f"[STEP 3.5] 재작성 {attempt}회 검수 — "
                        f"{ai_review.get('final_decision')} ({gate['score']}점, "
                        f"fail {gate['fail_count']}건) → 게이트: {gate['status']}",
                        flush=True,
                    )
                except Exception as exc:
                    print(f"[STEP 3.5] 재작성 {attempt}회 실패 (이전 결과 유지): {exc}", flush=True)
                    break

            # 게이트·검증·재작성 이력을 ai_review에 기록 (관리자 노출용)
            if ai_review is not None:
                ai_review["publish_gate"] = gate
                ai_review["rewrite_attempts"] = rewrite_attempts
                if previous_scores:
                    ai_review["previous_scores"] = previous_scores
                # 하드 게이트 실패 시 최종 판정을 발행 보류로 강제
                if gate and gate.get("hard_fail"):
                    ai_review["final_decision"] = "발행 보류"

        except Exception as exc:
            print(f"[STEP 3.5] AI 검수 실패 (무시하고 계속): {exc}", flush=True)

        # 4. Dry-run이면 출력만
        if args.dry_run:
            output_path = Path(f"/tmp/{article.slug}.html")
            output_path.write_text(
                f"<h1>{article.title}</h1>\n{html}", encoding="utf-8"
            )
            print(f"[DRY-RUN] 저장됨: {output_path}", flush=True)
            continue

        # 5. Supabase 발행 (안전장치: 자동 발행 품질이 아니면 무조건 초안 저장)
        #    자동 파이프라인 글은 관리자가 '공개'를 눌러야 메인에 노출된다.
        effective_mode = mode
        gate_status = (gate or {}).get("status") if gate else None
        if mode == "publish" and gate_status != "auto_ok":
            effective_mode = "draft"
            print(
                f"[STEP 4] mode=publish 였으나 게이트가 '{gate_status}'(auto_ok 아님) → "
                f"초안으로 강제 저장 (관리자 검토 후 공개 필요)",
                flush=True,
            )
        print(f"[STEP 4] Supabase 저장 중... (요청 mode={mode}, 실제 mode={effective_mode})", flush=True)
        try:
            result = publisher.publish(article, html, effective_mode, ai_review=ai_review)
            status = "발행" if result["published"] else "초안 저장"
            print(f"[STEP 4] {status} 완료! slug={result['slug']}", flush=True)
        except Exception as exc:
            print(f"[STEP 4] 실패: {exc}", flush=True)
            sys.exit(1)

    print(f"\n[PIPELINE] 전체 완료! {count}개 글 생성됨", flush=True)


if __name__ == "__main__":
    main()
