-- ============================================
-- 뉴스 소스 카테고리 업데이트
-- 금융/보험 두 가지 테마로 구분
-- ============================================

-- 기존 금융 소스는 그대로 유지 (한국은행, 금융위원회, 서울경제, 매일경제)
-- 보험 관련 RSS 소스 추가 (실제 동작 확인된 URL만)

INSERT INTO news_sources (name, url, category, active) VALUES
  -- 보험 카테고리 (실제 동작 확인됨)
  ('보험신문', 'http://www.insnews.co.kr/rss/S1N1.xml', '보험', true),
  ('뉴스핌 보험', 'https://www.newspim.com/news/rss_list.php?cid=23200', '보험', true),
  ('뉴스1 금융보험', 'https://www.news1.kr/rss/S1N14.xml', '보험', true),
  ('한국경제 보험', 'https://www.hankyung.com/feed/insurance', '보험', true),

  -- 추가 금융 소스 (다양성 확보)
  ('한국경제 금융', 'https://www.hankyung.com/feed/economy', '금융', true),
  ('연합뉴스 경제', 'https://www.yonhapnews.co.kr/rss/economy.xml', '금융', true),
  ('뉴스1 금융', 'https://www.news1.kr/rss/S1N11.xml', '금융', true),
  ('이데일리 금융', 'https://www.edaily.co.kr/rss/rss.asp?code=0402', '금융', true)
ON CONFLICT (url) DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE '뉴스 소스 카테고리 업데이트 완료!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '금융 카테고리: 8개 소스 (기존 4개 + 신규 4개)';
  RAISE NOTICE '보험 카테고리: 4개 소스 (신규)';
  RAISE NOTICE '';
  RAISE NOTICE '수집 방식:';
  RAISE NOTICE '1. 네이버 인기뉴스 (금융 키워드 필터링)';
  RAISE NOTICE '2. 구글 트렌드 키워드 기반 RSS 정렬';
  RAISE NOTICE '3. 각 카테고리별로 최대 10개씩 수집';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  참고: 네이버 스크래핑은 HTML 구조 변경 시 동작 안 할 수 있음';
  RAISE NOTICE '⚠️  구글 트렌드는 일반 검색어라 금융과 무관한 키워드 포함';
  RAISE NOTICE '===========================================';
END $$;
