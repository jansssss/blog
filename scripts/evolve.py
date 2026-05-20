"""
ohyess.kr GSC 데이터 수집 파이프라인

순서:
  1. config 로드 + 환경변수 검증
  2. GSC 데이터 수집 → Supabase post_performance 테이블 upsert

Usage:
  python -m scripts.evolve             # GSC 데이터 수집 실행
  python -m scripts.evolve --dry-run   # 연결 확인만 (저장 안 함)

사전 준비:
  1. Google Cloud Console에서 OAuth 클라이언트 생성
  2. scripts/credentials/client_secret.json 배치
  3. .env.local에 GSC_SITE_URL=sc-domain:ohyess.kr 설정
  4. pip install -r scripts/requirements.txt
  5. 첫 실행 시 브라우저 OAuth 인증 흐름 진행 (token.json 자동 저장)

Supabase 사전 준비 (테이블 없으면 생성 필요):
  CREATE TABLE post_performance (
    post_slug TEXT NOT NULL,
    date DATE NOT NULL,
    clicks INT DEFAULT 0,
    impressions INT DEFAULT 0,
    ctr FLOAT DEFAULT 0,
    position FLOAT DEFAULT 0,
    PRIMARY KEY (post_slug, date)
  );
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.pipeline.config import load_config
from scripts.analytics.gsc_collector import GSCCollector


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="ohyess.kr GSC 데이터 수집")
    p.add_argument("--dry-run", action="store_true", help="연결 확인만, 저장 안 함")
    p.add_argument("--days", type=int, default=28, help="수집할 기간 (일, 기본 28)")
    return p


def main() -> None:
    args = build_parser().parse_args()
    config = load_config()

    missing = []
    if not config.gsc_site_url:
        missing.append("GSC_SITE_URL")
    if not config.supabase_url:
        missing.append("NEXT_PUBLIC_SUPABASE_URL")
    if not config.supabase_service_role_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print(f"[ERROR] 필수 환경변수 누락: {', '.join(missing)}", flush=True)
        sys.exit(1)

    if args.dry_run:
        print("[DRY-RUN] 환경변수 확인 완료. 저장 건너뜀.", flush=True)
        print(f"  GSC_SITE_URL   = {config.gsc_site_url}", flush=True)
        print(f"  SUPABASE_URL   = {config.supabase_url}", flush=True)
        print(f"  client_secret  = {config.gsc_client_secret_path}", flush=True)
        return

    print("[EVOLVE] GSC 데이터 수집 시작", flush=True)
    try:
        collector = GSCCollector(
            client_secret_path=config.gsc_client_secret_path,
            token_path=config.gsc_token_path,
            site_url=config.gsc_site_url,
            supabase_url=config.supabase_url,
            service_role_key=config.supabase_service_role_key,
            url_pattern=r"/blog/([^/?#]+)",
            table="post_performance",
            slug_column="post_slug",
            conflict_columns="post_slug%2Cdate",
            days=args.days,
        )
        collected = collector.collect_and_save()
        print(f"[EVOLVE] 완료 - {collected}건 저장", flush=True)
    except Exception as exc:
        print(f"[EVOLVE] 실패: {exc}", flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
