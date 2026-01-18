-- ============================================
-- Draft 파이프라인 락/재시도 컬럼 추가
-- 실행: Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- 1. 락 관련 컬럼 추가 (없으면 추가)
DO $$
BEGIN
    -- locked_at: 락 획득 시간
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'drafts' AND column_name = 'locked_at'
    ) THEN
        ALTER TABLE drafts ADD COLUMN locked_at TIMESTAMPTZ;
    END IF;

    -- locked_by: 락을 획득한 워커 ID
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'drafts' AND column_name = 'locked_by'
    ) THEN
        ALTER TABLE drafts ADD COLUMN locked_by TEXT;
    END IF;

    -- attempts: 재시도 횟수
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'drafts' AND column_name = 'attempts'
    ) THEN
        ALTER TABLE drafts ADD COLUMN attempts INT DEFAULT 0;
    END IF;

    -- next_retry_at: 다음 재시도 예정 시간
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'drafts' AND column_name = 'next_retry_at'
    ) THEN
        ALTER TABLE drafts ADD COLUMN next_retry_at TIMESTAMPTZ;
    END IF;

    -- last_error: 마지막 에러 메시지 (error_message와 별도로 재시도용)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'drafts' AND column_name = 'last_error'
    ) THEN
        ALTER TABLE drafts ADD COLUMN last_error TEXT;
    END IF;
END $$;

-- 2. stage 컬럼에 NEW, QUEUED 값 허용 확인
-- (기존에 CHECK 제약이 있다면 수정 필요)
-- 현재는 TEXT 타입이므로 별도 수정 불필요

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_drafts_stage ON drafts(stage);
CREATE INDEX IF NOT EXISTS idx_drafts_locked_at ON drafts(locked_at);
CREATE INDEX IF NOT EXISTS idx_drafts_next_retry_at ON drafts(next_retry_at);

-- 4. 기존 draft들의 stage 초기화 (필요시)
-- 기존에 stage가 NULL인 경우 'PERPLEXITY_DONE'으로 설정 (content가 있으면)
UPDATE drafts
SET stage = 'PERPLEXITY_DONE'
WHERE stage IS NULL AND content IS NOT NULL AND editor_content IS NULL;

UPDATE drafts
SET stage = 'EDITOR_DONE'
WHERE stage IS NULL AND editor_content IS NOT NULL AND columnist_content IS NULL;

UPDATE drafts
SET stage = 'SAVED'
WHERE stage IS NULL AND columnist_content IS NOT NULL;

-- 5. 고아 락 정리 (5분 이상 된 락은 해제)
UPDATE drafts
SET locked_at = NULL, locked_by = NULL
WHERE locked_at IS NOT NULL
  AND locked_at < NOW() - INTERVAL '5 minutes';

-- 완료 메시지
SELECT 'Migration completed: draft lock columns added' AS result;
