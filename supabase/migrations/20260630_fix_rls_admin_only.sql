-- =====================================================
-- RLS 정책 강화: admins 테이블 membership 기반 쓰기 제한
--
-- 배경:
--   기존 정책은 TO authenticated + USING(true) 로,
--   Supabase Auth 계정만 있으면 누구나 posts/news/drafts 등을
--   insert/update/delete 할 수 있었음.
--   admins 테이블에 등록된 사용자만 쓸 수 있도록 수정.
--
-- 주의:
--   admin API 라우트는 supabaseAdmin(service role)을 사용하므로
--   RLS를 우회한다. 이 migration은 혹시라도 anon/authenticated
--   클라이언트가 직접 DB에 접근할 경우의 방어선이다.
--   실질적 보안은 lib/auth/admin.ts requireAdmin() 에서 담당.
-- =====================================================

-- ─── 헬퍼 함수 ───────────────────────────────────────
-- auth.uid() 가 admins 테이블에 존재하는지 확인
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  );
$$;

-- ─── posts ───────────────────────────────────────────

-- 기존 permissive 정책 제거
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- admins 테이블 등록 사용자만 쓰기 허용
CREATE POLICY "Only admins can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ─── news_sources ─────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage news sources" ON news_sources;

CREATE POLICY "Only admins can manage news sources"
  ON news_sources FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── news_items ───────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage news items" ON news_items;

CREATE POLICY "Only admins can manage news items"
  ON news_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── drafts ───────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage drafts" ON drafts;

CREATE POLICY "Only admins can manage drafts"
  ON drafts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── sites ────────────────────────────────────────────

DROP POLICY IF EXISTS "Sites are editable by authenticated users" ON sites;

CREATE POLICY "Only admins can edit sites"
  ON sites FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
