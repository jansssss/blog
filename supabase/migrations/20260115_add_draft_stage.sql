-- ============================================
-- Draft Stage Tracking Migration
-- ============================================
-- AI 파이프라인 단계별 진행 상태 추적

-- stage 컬럼 추가
-- PERPLEXITY_DONE: Perplexity AI 초안 생성 완료
-- EDITOR_DONE: 편집자 AI 팩트체크 완료
-- COLUMNIST_DONE: 칼럼니스트 AI 최종 작성 완료
-- SAVED: 최종 저장 완료
-- FAILED: 처리 실패

ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS stage VARCHAR(20) DEFAULT 'PERPLEXITY_DONE';

-- 에러 추적 컬럼 추가
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS error_stage VARCHAR(20);  -- 실패한 단계 (EDITOR, COLUMNIST, SAVE)

ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS error_code VARCHAR(50);   -- 에러 코드 (OPENAI_QUOTA_EXCEEDED, OPENAI_ERROR, SAVE_ERROR 등)

ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS error_message TEXT;       -- 상세 에러 메시지

-- 중간 결과물 저장 컬럼 추가 (재시도 시 활용)
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS editor_content TEXT;      -- 편집자 AI 결과물

ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS columnist_content TEXT;   -- 칼럼니스트 AI 결과물

-- 기존 초안들의 stage 설정 (이미 생성된 것은 PERPLEXITY_DONE으로)
UPDATE drafts SET stage = 'PERPLEXITY_DONE' WHERE stage IS NULL;

-- stage 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_drafts_stage ON drafts(stage);
CREATE INDEX IF NOT EXISTS idx_drafts_error_code ON drafts(error_code);

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Draft stage tracking columns added successfully!';
  RAISE NOTICE 'Valid stages: PERPLEXITY_DONE, EDITOR_DONE, COLUMNIST_DONE, SAVED, FAILED';
  RAISE NOTICE 'Error tracking: error_stage, error_code, error_message';
  RAISE NOTICE 'Intermediate content: editor_content, columnist_content';
END $$;
