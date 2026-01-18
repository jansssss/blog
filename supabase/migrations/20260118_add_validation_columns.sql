-- ============================================
-- drafts 테이블에 검증 결과 컬럼 추가
-- ============================================

-- 검증 결과 저장 컬럼
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS validation_passed BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS validation_failures TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS validation_warnings TEXT[] DEFAULT '{}';

-- 인덱스 (검증 실패 필터링용)
CREATE INDEX IF NOT EXISTS idx_drafts_validation_passed
ON drafts (validation_passed);

-- 코멘트
COMMENT ON COLUMN drafts.validation_passed IS '품질 검증 통과 여부 (true=통과, false=실패, null=미검증)';
COMMENT ON COLUMN drafts.validation_failures IS '검증 실패 항목 목록';
COMMENT ON COLUMN drafts.validation_warnings IS '검증 경고 항목 목록';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '검증 결과 컬럼 추가 완료!';
  RAISE NOTICE '- validation_passed: 통과 여부';
  RAISE NOTICE '- validation_failures: 실패 항목';
  RAISE NOTICE '- validation_warnings: 경고 항목';
END $$;
