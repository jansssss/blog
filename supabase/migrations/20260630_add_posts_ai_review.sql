-- AI 검수 결과를 posts 테이블에 저장
-- 공개 블로그 페이지에서는 절대 노출하지 않음 (관리자 화면 전용)

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS ai_review       jsonb,
  ADD COLUMN IF NOT EXISTS ai_reviewed_at  timestamptz;

-- final_decision 값으로 필터링하는 관리자 쿼리용 인덱스
CREATE INDEX IF NOT EXISTS posts_ai_review_decision_idx
  ON posts ((ai_review->>'final_decision'))
  WHERE ai_review IS NOT NULL;

COMMENT ON COLUMN posts.ai_review IS 'AI 검수 리포트 JSON (관리자 전용, 공개 페이지 노출 금지)';
COMMENT ON COLUMN posts.ai_reviewed_at IS 'AI 검수 실행 시각 (UTC)';
