-- ============================================
-- News Automation System Migration
-- ============================================
-- 자동 뉴스 수집 → 초안 생성 → 승인 발행 파이프라인

-- ============================================
-- 1. 뉴스 소스 테이블 (RSS URL 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_fetched_at TIMESTAMP WITH TIME ZONE
);

-- 소스 URL 유니크 인덱스
CREATE UNIQUE INDEX idx_news_sources_url ON news_sources(url);
CREATE INDEX idx_news_sources_active ON news_sources(active);
CREATE INDEX idx_news_sources_category ON news_sources(category);

-- ============================================
-- 2. 뉴스 아이템 테이블 (수집된 뉴스)
-- ============================================
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES news_sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  pub_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(50),
  hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 해시로 중복 제거
  excluded BOOLEAN DEFAULT false, -- 관리자가 제외 처리
  draft_generated BOOLEAN DEFAULT false, -- 초안 생성 여부
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 중복 방지용 해시 유니크 인덱스
CREATE UNIQUE INDEX idx_news_items_hash ON news_items(hash);
CREATE INDEX idx_news_items_source_id ON news_items(source_id);
CREATE INDEX idx_news_items_excluded ON news_items(excluded);
CREATE INDEX idx_news_items_draft_generated ON news_items(draft_generated);
CREATE INDEX idx_news_items_pub_date ON news_items(pub_date DESC);

-- ============================================
-- 3. 초안 테이블 (승인 대기 중인 글)
-- ============================================
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_item_id UUID REFERENCES news_items(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  published_post_id UUID -- posts 테이블의 id 참조 (승인 후)
);

-- 초안 인덱스
CREATE INDEX idx_drafts_news_item_id ON drafts(news_item_id);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_drafts_created_at ON drafts(created_at DESC);
CREATE INDEX idx_drafts_slug ON drafts(slug);

-- ============================================
-- 4. 트리거: updated_at 자동 업데이트
-- ============================================
CREATE TRIGGER update_news_sources_updated_at
  BEFORE UPDATE ON news_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Row Level Security (RLS) 설정
-- ============================================
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- 관리자만 뉴스 소스 조회/관리 가능
CREATE POLICY "Admins can view all news sources"
  ON news_sources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage news sources"
  ON news_sources FOR ALL
  TO authenticated
  USING (true);

-- 관리자만 뉴스 아이템 조회/관리 가능
CREATE POLICY "Admins can view all news items"
  ON news_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage news items"
  ON news_items FOR ALL
  TO authenticated
  USING (true);

-- 관리자만 초안 조회/관리 가능
CREATE POLICY "Admins can view all drafts"
  ON drafts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage drafts"
  ON drafts FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- 6. 초기 데이터: 기본 뉴스 소스
-- ============================================
-- 금융/대출 관련 RSS 소스 예시
INSERT INTO news_sources (name, url, category, active) VALUES
  ('한국은행 보도자료', 'https://www.bok.or.kr/portal/bbs/B0000249/rssList.do?menuNo=200690', '금융', true),
  ('금융위원회 보도자료', 'https://www.fsc.go.kr/comm/getRssList.do?bbsId=BBS0048', '금융', true),
  ('서울경제 금융', 'https://www.sedaily.com/RSS/S11.xml', '금융', true),
  ('매일경제 금융', 'https://www.mk.co.kr/rss/30100041/', '금융', true)
ON CONFLICT (url) DO NOTHING;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'News automation system tables created successfully!';
  RAISE NOTICE 'Tables: news_sources, news_items, drafts';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Add RSS sources to news_sources table';
  RAISE NOTICE '2. Set up cron jobs for /api/cron/news-fetch and /api/cron/draft-generate';
  RAISE NOTICE '3. Configure admin UI at /admin/news and /admin/drafts';
END $$;
