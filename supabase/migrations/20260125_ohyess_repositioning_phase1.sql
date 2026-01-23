-- ============================================
-- ohyess.kr 리포지셔닝 Phase 1: 네비게이션 및 레이아웃 구조 변경
-- ============================================
-- 블로그 중심 → 금융 계산·비교 도구 중심 정보 사이트

-- 1. 네비게이션 메뉴 재구성
-- 변경: 홈 | 계산기 | 비교 | 정책·지원 | 가이드
UPDATE sites
SET theme_json = jsonb_set(
  jsonb_set(
    COALESCE(theme_json, '{}'::jsonb),
    '{header, topLinks}',
    '[
      {"label": "홈", "href": "/"},
      {"label": "계산기", "href": "/calculator"},
      {"label": "비교", "href": "/compare"},
      {"label": "정책·지원", "href": "/policy"},
      {"label": "가이드", "href": "/guide"}
    ]'::jsonb
  ),
  '{homepage, sectionTitleLatest}',
  '"금융 가이드 & 해설"'
)
WHERE domain = 'ohyess.kr';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ ohyess.kr Phase 1 업데이트 완료!';
  RAISE NOTICE '- 네비게이션 메뉴: 홈 | 계산기 | 비교 | 정책·지원 | 가이드';
  RAISE NOTICE '- 홈페이지 섹션 제목: "금융 가이드 & 해설"';
END $$;
