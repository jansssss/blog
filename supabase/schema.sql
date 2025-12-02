-- ============================================
-- Blog Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 관리자 테이블 (Admins)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 관리자 테이블 인덱스
CREATE INDEX idx_admins_email ON admins(email);

-- ============================================
-- 2. 게시글 테이블 (Posts)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  author_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0
);

-- 게시글 테이블 인덱스
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- ============================================
-- 3. 카테고리 테이블 (Categories) - 선택사항
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (name, slug, description) VALUES
  ('AI', 'ai', 'AI 및 인공지능 관련 글'),
  ('재테크', 'finance', '재테크 및 투자 관련 글'),
  ('노무', 'labor', '노무 및 근로 관련 글'),
  ('개발', 'development', '개발 및 프로그래밍 관련 글')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. 댓글 테이블 (Comments) - 향후 확장용
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_approved BOOLEAN DEFAULT false
);

-- 댓글 테이블 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- 5. 트리거: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- admins 테이블 트리거
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- posts 테이블 트리거
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- comments 테이블 트리거
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Row Level Security (RLS) 설정
-- ============================================

-- RLS 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Posts 정책: 발행된 게시글은 누구나 조회 가능
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

-- Posts 정책: 관리자는 모든 게시글 조회 가능
CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

-- Posts 정책: 관리자만 게시글 삽입 가능
CREATE POLICY "Admins can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Posts 정책: 관리자만 게시글 수정 가능
CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true);

-- Posts 정책: 관리자만 게시글 삭제 가능
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- Categories 정책: 누구나 카테고리 조회 가능
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Comments 정책: 승인된 댓글은 누구나 조회 가능
CREATE POLICY "Approved comments are viewable by everyone"
  ON comments FOR SELECT
  USING (is_approved = true);

-- Comments 정책: 관리자는 모든 댓글 조회 가능
CREATE POLICY "Admins can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 7. 뷰(View): 게시글 통계
-- ============================================
CREATE OR REPLACE VIEW post_statistics AS
SELECT
  category,
  COUNT(*) as post_count,
  SUM(view_count) as total_views,
  MAX(published_at) as latest_post_date
FROM posts
WHERE published = true
GROUP BY category;

-- ============================================
-- 8. 함수: 조회수 증가
-- ============================================
CREATE OR REPLACE FUNCTION increment_post_view_count(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. 함수: 관련 게시글 가져오기 (같은 카테고리)
-- ============================================
CREATE OR REPLACE FUNCTION get_related_posts(
  current_post_id UUID,
  limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  summary TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.slug, p.summary, p.thumbnail_url, p.published_at
  FROM posts p
  WHERE p.category = (SELECT category FROM posts WHERE posts.id = current_post_id)
    AND p.id != current_post_id
    AND p.published = true
  ORDER BY p.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. 초기 데이터: 테스트용 관리자 계정
-- ============================================
-- 비밀번호: admin123 (실제 사용 시 반드시 변경하세요!)
-- bcrypt 해시는 애플리케이션에서 생성해야 하므로 여기서는 주석 처리
-- INSERT INTO admins (email, password_hash, name) VALUES
--   ('admin@example.com', '$2b$10$...해시값...', 'Admin User');

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Blog database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create an admin user with hashed password';
  RAISE NOTICE '2. Configure Supabase authentication';
  RAISE NOTICE '3. Update frontend to connect to Supabase';
END $$;
