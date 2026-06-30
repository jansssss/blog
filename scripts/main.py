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
from scripts.pipeline.columnist import ColumnistWriter, render_html
from scripts.pipeline.publisher import SupabasePublisher
from scripts.analytics.gsc_query_selector import GSCQuerySelector
from scripts.analytics.performance_analyzer import PerformanceAnalyzer


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
    if config.supabase_url and config.supabase_service_role_key:
        gsc_selector = GSCQuerySelector(config.supabase_url, config.supabase_service_role_key)
        perf_analyzer = PerformanceAnalyzer(config.supabase_url, config.supabase_service_role_key)

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
        try:
            article = writer.write(research, performance_hints=performance_hints)
            print(f"[STEP 2] 완료 - 제목: {article.title}", flush=True)
        except Exception as exc:
            print(f"[STEP 2] 실패: {exc}", flush=True)
            sys.exit(1)

        # 3. HTML 렌더링
        html = render_html(article)
        print(f"[STEP 3] HTML 렌더링 완료 ({len(html):,}자)", flush=True)

        # 4. Dry-run이면 출력만
        if args.dry_run:
            output_path = Path(f"/tmp/{article.slug}.html")
            output_path.write_text(
                f"<h1>{article.title}</h1>\n{html}", encoding="utf-8"
            )
            print(f"[DRY-RUN] 저장됨: {output_path}", flush=True)
            continue

        # 5. Supabase 발행
        print(f"[STEP 4] Supabase 발행 중... (mode={mode})", flush=True)
        try:
            result = publisher.publish(article, html, mode)
            status = "발행" if result["published"] else "초안 저장"
            print(f"[STEP 4] {status} 완료! slug={result['slug']}", flush=True)
        except Exception as exc:
            print(f"[STEP 4] 실패: {exc}", flush=True)
            sys.exit(1)

    print(f"\n[PIPELINE] 전체 완료! {count}개 글 생성됨", flush=True)


if __name__ == "__main__":
    main()
