-- =====================================================
-- 멀티사이트 지원을 위한 마이그레이션
-- 원칙:
--   1. site_id(uuid)로 통일, 카테고리로 사이트 추론 금지
--   2. draft 단계: site_id NULL 허용
--   3. publish 단계: site_id 필수 (서버 로직에서 검증)
-- =====================================================

-- 1. Sites 테이블 생성
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT UNIQUE NOT NULL,           -- 도메인 (예: ohyess.kr, sureline.kr)
  name TEXT NOT NULL,                     -- 사이트명 (예: 오예스, 슈어라인)
  description TEXT,                       -- 사이트 설명
  theme_json JSONB DEFAULT '{}'::jsonb,   -- 테마 설정 (로고, 컬러, 메뉴 등)
  is_main BOOLEAN DEFAULT FALSE,          -- 메인(관리) 사이트 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 샘플 사이트 데이터 (오예스, sureline)
INSERT INTO sites (domain, name, description, is_main, theme_json) VALUES
  (
    'ohyess.kr',
    '오예스',
    '대출, 세금, 자산 흐름 등 금융·경제 정보를 이해하기 쉽게 정리합니다.',
    TRUE,
    '{
      "brand": {
        "backgroundColor": "#FFFFFF",
        "textColor": "#0F172A",
        "primaryColor": "#111827",
        "secondaryColor": "#374151",
        "accentColor": "#2563EB"
      },
      "header": {
        "title": "ohyess",
        "topLinks": [
          { "label": "홈", "href": "/" },
          { "label": "관리자", "href": "/admin", "requiresAdmin": true }
        ],
        "categoryTabs": [
          { "label": "전체", "href": "/?category=전체" },
          { "label": "금융", "href": "/?category=금융" },
          { "label": "경제", "href": "/?category=경제" },
          { "label": "대출", "href": "/?category=대출" },
          { "label": "세금", "href": "/?category=세금" }
        ]
      },
      "homepage": {
        "heroTitle": "금융·경제를 쉽게 정리하는 블로그",
        "heroSubtitle": "대출·세금·자산 흐름을 핵심만 요약해 제공합니다",
        "hotKeywordsLabel": "인기 검색어:",
        "hotKeywords": ["신용대출", "DSR", "연말정산", "환율"],
        "sectionTitleLatest": "최신 게시글"
      },
      "footer": {
        "links": [
          { "label": "사이트 소개", "href": "/about" },
          { "label": "문의하기", "href": "/contact" },
          { "label": "개인정보처리방침", "href": "/privacy" },
          { "label": "이용약관", "href": "/terms" }
        ],
        "disclaimer": "⚠️ 본 사이트는 금융상품 판매를 하지 않으며, 일반 정보 제공을 목적으로 운영됩니다.",
        "copyright": "© 2026 OHYESS. All rights reserved.",
        "builtWith": "Built with Next.js & Supabase"
      },
      "features": {
        "adminEnabled": true,
        "editorEnabled": true,
        "commentsEnabled": false,
        "searchEnabled": true
      },
      "meta": {
        "siteName": "ohyess",
        "defaultTitle": "오예스 | 금융·경제 정보 블로그",
        "defaultDescription": "대출, 세금, 자산 흐름 등 금융·경제 정보를 이해하기 쉽게 정리합니다.",
        "ogImage": "/og/ohyess.png",
        "keywords": ["금융", "경제", "대출", "세금", "환율", "금리"]
      }
    }'::jsonb
  ),
  (
    'sureline.kr',
    '슈어라인',
    '보험(실손·자동차 등)과 대출 정보를 조건·사례 중심으로 정리합니다.',
    FALSE,
    '{
      "brand": {
        "backgroundColor": "#FFFFFF",
        "textColor": "#0F172A",
        "primaryColor": "#0B1220",
        "secondaryColor": "#334155",
        "accentColor": "#16A34A"
      },
      "header": {
        "title": "sureline",
        "topLinks": [
          { "label": "홈", "href": "/" }
        ],
        "categoryTabs": [
          { "label": "전체", "href": "/?category=전체" },
          { "label": "보험", "href": "/?category=보험" },
          { "label": "실손", "href": "/?category=실손" },
          { "label": "자동차", "href": "/?category=자동차" },
          { "label": "대출", "href": "/?category=대출" }
        ]
      },
      "homepage": {
        "heroTitle": "보험·대출을 한 번에 정리",
        "heroSubtitle": "조건·한도·사례 중심으로 쉽게 설명합니다",
        "hotKeywordsLabel": "인기 검색어:",
        "hotKeywords": ["실손 개정", "도수치료", "자동차보험", "전세대출"],
        "sectionTitleLatest": "최신 게시글"
      },
      "footer": {
        "links": [
          { "label": "사이트 소개", "href": "/about" },
          { "label": "문의하기", "href": "/contact" },
          { "label": "개인정보처리방침", "href": "/privacy" },
          { "label": "이용약관", "href": "/terms" }
        ],
        "disclaimer": "⚠️ 본 사이트는 보험/대출 상품 판매를 하지 않으며, 일반 정보 제공을 목적으로 운영됩니다.",
        "copyright": "© 2026 SURELINE. All rights reserved.",
        "builtWith": "Built with Next.js & Supabase"
      },
      "features": {
        "adminEnabled": false,
        "editorEnabled": false,
        "commentsEnabled": false,
        "searchEnabled": true
      },
      "meta": {
        "siteName": "sureline",
        "defaultTitle": "슈어라인 | 보험·대출 정보 정리",
        "defaultDescription": "보험(실손·자동차 등)과 대출 정보를 조건·사례 중심으로 정리합니다.",
        "ogImage": "/og/sureline.png",
        "keywords": ["보험", "실손", "자동차보험", "대출", "보장", "면책"]
      }
    }'::jsonb
  )
ON CONFLICT (domain) DO NOTHING;

-- 3. Posts 테이블에 site_id 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;

-- 4. Drafts 테이블에 site_id 컬럼 추가 (NULL 허용 - 발행 전까지)
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_site_id ON posts(site_id);
CREATE INDEX IF NOT EXISTS idx_drafts_site_id ON drafts(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);

-- 6. 기존 posts에 기본 site_id 설정 (ohyess.kr)
-- 주의: 실행 전 ohyess.kr 사이트가 먼저 생성되어 있어야 함
UPDATE posts
SET site_id = (SELECT id FROM sites WHERE domain = 'ohyess.kr' LIMIT 1)
WHERE site_id IS NULL;

-- 7. sites 테이블 RLS 정책
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 sites 조회 가능 (공개)
CREATE POLICY "Sites are viewable by everyone" ON sites
  FOR SELECT USING (true);

-- 인증된 사용자만 sites 수정 가능
CREATE POLICY "Sites are editable by authenticated users" ON sites
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sites_updated_at ON sites;
CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_sites_updated_at();
