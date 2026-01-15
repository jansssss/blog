-- ============================================
-- Draft Stage Tracking Migration
-- ============================================
-- AI 파이프라인 단계별 진행 상태 추적

-- stage 컬럼 추가
-- PERPLEXITY_DONE: Perplexity AI 초안 생성 완료
-- EDITOR_DONE: 편집자 AI 팩트체크 완료
-- COLUMNIST_DONE: 칼럼니스트 AI 최종 작성 완료
-- FAILED: 처리 실패

ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS stage VARCHAR(20) DEFAULT 'PERPLEXITY_DONE';

-- 기존 초안들의 stage 설정 (이미 생성된 것은 PERPLEXITY_DONE으로)
UPDATE drafts SET stage = 'PERPLEXITY_DONE' WHERE stage IS NULL;

-- stage 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_drafts_stage ON drafts(stage);

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Draft stage tracking column added successfully!';
  RAISE NOTICE 'Valid stages: PERPLEXITY_DONE, EDITOR_DONE, COLUMNIST_DONE, FAILED';
END $$;
