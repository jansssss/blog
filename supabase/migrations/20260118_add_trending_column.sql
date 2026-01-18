-- ============================================
-- news_items 테이블에 트렌딩 플래그 추가
-- ============================================

-- is_trending 컬럼 추가 (기본값: false)
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

-- 트렌딩 뉴스 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_news_items_trending
ON news_items (is_trending, category, pub_date DESC);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'is_trending 컬럼 추가 완료!';
END $$;
