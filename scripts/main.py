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
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가 (로컬 실행용)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.pipeline.config import load_config
from scripts.pipeline.researcher import PerplexityResearcher
from scripts.pipeline.columnist import ColumnistWriter, render_html
from scripts.pipeline.publisher import SupabasePublisher


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
    if not config.perplexity_api_key:
        missing.append("PERPLEXITY_API_KEY")
    if not config.anthropic_api_key:
        missing.append("ANTHROPIC_API_KEY")
    if not args.dry_run:
        if not config.supabase_url:
            missing.append("NEXT_PUBLIC_SUPABASE_URL")
        if not config.supabase_service_role_key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print(f"[ERROR] 필수 환경변수 누락: {', '.join(missing)}", flush=True)
        sys.exit(1)

    # ── 파이프라인 초기화 ──────────────────────────
    researcher = PerplexityResearcher(config.perplexity_api_key)
    writer = ColumnistWriter(
        api_key=config.anthropic_api_key,
        model=config.anthropic_model,
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

    # ── 실행 ────────────────────────────────────────
    for i in range(count):
        print(f"\n{'='*50}", flush=True)
        print(f"[PIPELINE] {i+1}/{count}번째 글 생성 시작", flush=True)

        # 1. Perplexity - 오늘의 이슈 리서치
        print("[STEP 1] Perplexity 리서치 중...", flush=True)
        try:
            research = researcher.research_today(excluded_topics=excluded_topics)
            print(f"[STEP 1] 완료 - 주제: {research['topic']}", flush=True)
            excluded_topics.append(research["topic"])  # 같은 실행 내 중복 방지
        except Exception as exc:
            print(f"[STEP 1] 실패: {exc}", flush=True)
            sys.exit(1)

        # 2. Claude - 칼럼 작성
        print("[STEP 2] Claude 칼럼 작성 중...", flush=True)
        try:
            article = writer.write(research)
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
