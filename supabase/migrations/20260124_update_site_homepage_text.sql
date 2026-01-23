-- ============================================
-- 사이트별 메인 페이지 텍스트 업데이트
-- ============================================
-- 오예스: 금융/대출 중심
-- 슈어라인: 보험 중심

-- 1. 오예스 (www.ohyess.kr) - 금융/대출 중심 사이트
UPDATE sites
SET theme_json = jsonb_set(
  COALESCE(theme_json, '{}'::jsonb),
  '{homepage}',
  jsonb_build_object(
    'heroTitle', '똑똑한 금융 생활을 위한<br class="mb-2" /><span class="text-primary">대출·금리 정보 블로그</span>',
    'heroSubtitle', '주택담보대출, 신용대출, DSR 계산부터 금리 비교까지 실전 금융 정보를 제공합니다',
    'sectionTitleLatest', '최신 게시글'
  )
)
WHERE domain = 'ohyess.kr';

-- 2. 슈어라인 (www.sureline.kr) - 보험 중심 사이트
UPDATE sites
SET theme_json = jsonb_set(
  COALESCE(theme_json, '{}'::jsonb),
  '{homepage}',
  jsonb_build_object(
    'heroTitle', '안전한 미래를 위한<br class="mb-2" /><span class="text-primary">보험 가이드 블로그</span>',
    'heroSubtitle', '생명보험, 자동차보험, 건강보험부터 보험금 청구까지 꼭 필요한 보험 정보를 제공합니다',
    'sectionTitleLatest', '최신 게시글'
  )
)
WHERE domain = 'sureline.kr';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 사이트별 메인 페이지 텍스트 업데이트 완료!';
  RAISE NOTICE 'ohyess.kr: 금융/대출 중심 콘텐츠';
  RAISE NOTICE 'sureline.kr: 보험 중심 콘텐츠';
END $$;
