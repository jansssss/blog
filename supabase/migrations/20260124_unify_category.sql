-- ============================================
-- 카테고리 통합: 금융/대출로 통일
-- ============================================
-- 대출 블로그에 맞게 모든 금융 관련 뉴스를 하나의 카테고리로 통합

-- 1. news_sources 테이블의 모든 카테고리를 "금융/대출"로 변경
UPDATE news_sources
SET category = '금융/대출'
WHERE category IN ('금융', '금융/경제', '보험/세금');

-- 2. news_items 테이블의 모든 카테고리를 "금융/대출"로 변경
UPDATE news_items
SET category = '금융/대출'
WHERE category IN ('금융', '금융/경제', '보험/세금');

-- 3. drafts 테이블의 모든 카테고리를 "금융/대출"로 변경
UPDATE drafts
SET category = '금융/대출'
WHERE category IN ('금융', '금융/경제', '보험/세금');

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 카테고리 통합 완료!';
  RAISE NOTICE '모든 뉴스 소스와 뉴스가 "금융/대출" 카테고리로 통합되었습니다.';
  RAISE NOTICE '이제 금융, 대출, 보험, 세금 관련 뉴스가 모두 한 곳에서 수집됩니다.';
END $$;
