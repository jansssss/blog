-- ============================================
-- ohyess.kr 텍스트 수정 v2
-- ============================================
-- 1. "블로그" → "사이트"
-- 2. "금융 가이드 & 해설" → "최근 글"
-- 3. 메뉴 "가이드" → "관련글"

UPDATE sites
SET theme_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(theme_json, '{}'::jsonb),
      '{homepage, heroTitle}',
      '"똑똑한 금융 생활을 위한<br class=\"mb-2\" /><span class=\"text-primary\">대출·금리 정보 사이트</span>"'
    ),
    '{homepage, sectionTitleLatest}',
    '"최근 글"'
  ),
  '{header, topLinks}',
  '[
    {"label": "홈", "href": "/"},
    {"label": "계산기", "href": "/calculator"},
    {"label": "비교", "href": "/compare"},
    {"label": "정책·지원", "href": "/policy"},
    {"label": "관련글", "href": "/guide"}
  ]'::jsonb
)
WHERE domain = 'ohyess.kr';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ ohyess.kr 텍스트 업데이트 완료!';
  RAISE NOTICE '- Hero Title: "대출·금리 정보 사이트"';
  RAISE NOTICE '- Section Title: "최근 글"';
  RAISE NOTICE '- 메뉴: 홈 | 계산기 | 비교 | 정책·지원 | 관련글';
END $$;
