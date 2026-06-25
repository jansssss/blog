-- ============================================
-- ohyess.kr 사이트 제목 업데이트
-- 변경: "오예스 | 금융·경제 정보 블로그" → "오예스 | 대출이자·DSR·주담대 한도 계산과 생활금융 가이드"
-- ============================================

UPDATE sites
SET theme_json = jsonb_set(
  theme_json,
  '{meta,defaultTitle}',
  '"오예스 | 대출이자·DSR·주담대 한도 계산과 생활금융 가이드"'::jsonb
)
WHERE domain = 'ohyess.kr';

DO $$
BEGIN
  RAISE NOTICE '✅ ohyess.kr 사이트 제목 업데이트 완료!';
  RAISE NOTICE '- defaultTitle: "오예스 | 대출이자·DSR·주담대 한도 계산과 생활금융 가이드"';
END $$;
