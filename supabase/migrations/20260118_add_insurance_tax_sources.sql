-- ============================================
-- 보험/세금 테마 RSS 소스 추가
-- ============================================

-- 보험 관련 소스
INSERT INTO news_sources (name, url, category, active) VALUES
  ('금융감독원 보도자료', 'https://www.fss.or.kr/fss/main/bbs/rssList.do?bbsId=1289478498948', '보험/세금', true),
  ('보험연구원', 'https://www.kiri.or.kr/rss/rss_report.xml', '보험/세금', true),
  ('조세일보', 'https://www.joseilbo.com/rss/rss_all.xml', '보험/세금', true),
  ('택스워치', 'https://www.taxwatch.co.kr/rss/allArticle.xml', '보험/세금', true),
  ('국세청 보도자료', 'https://www.nts.go.kr/comm/nttRssView.do?mi=40220', '보험/세금', true)
ON CONFLICT (url) DO NOTHING;

-- 기존 금융 카테고리 이름 통일
UPDATE news_sources
SET category = '금융/경제'
WHERE category = '금융';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '보험/세금 RSS 소스 추가 완료!';
  RAISE NOTICE '현재 테마: 금융/경제, 보험/세금';
END $$;
