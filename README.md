# ohyess.kr - 자동 뉴스 수집 블로그 시스템

Next.js 15 App Router와 Supabase를 활용한 자동화된 금융 블로그 플랫폼입니다.
RSS 뉴스 수집 → AI 초안 생성 → 관리자 승인 → 자동 발행 파이프라인을 지원합니다.

## 🚀 주요 기능

### ✅ 완료된 기능
- ✅ Next.js 15 App Router 기반 구조
- ✅ Tailwind CSS + shadcn/ui 디자인 시스템
- ✅ TipTap 리치 에디터
- ✅ Supabase Database 연동
- ✅ Supabase Auth 인증
- ✅ Supabase Storage 이미지 업로드
- ✅ 반응형 디자인 (모바일 메뉴 지원)
- ✅ SEO 최적화 (메타태그, OG, 썸네일)
- ✅ 카테고리별 필터링
- ✅ 검색 기능
- ✅ Google AdSense 통합
- ✅ **자동 뉴스 수집 시스템 (RSS)**
- ✅ **템플릿 기반 초안 자동 생성**
- ✅ **관리자 승인 워크플로우**
- ✅ **Vercel Cron 스케줄링**

## 🤖 자동화 파이프라인

### 1. 뉴스 수집 (30분마다)
```
RSS 소스 → news_items 테이블 저장
- 중복 제거 (SHA-256 해시)
- 카테고리별 분류
- 메타데이터만 저장 (저작권 준수)
```

### 2. 초안 생성 (1시간마다)
```
news_items → drafts 테이블
- 템플릿 기반 마크다운 생성
- 금융/대출 특화 구조
- DSR, 금리, 한도 분석 포함
- FAQ, 계산 예시, 실제 사례 자동 생성
```

### 3. 관리자 승인
```
drafts → posts 테이블
- 초안 편집 및 검토
- 승인 시 블로그 발행
- 반려 시 초안 보관
```

## 📁 프로젝트 구조

```
blog/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── cron/
│   │   │   ├── news-fetch/        # RSS 수집 cron
│   │   │   └── draft-generate/    # 초안 생성 cron
│   │   └── admin/
│   │       └── drafts/[id]/
│   │           └── approve/       # 초안 승인 API
│   ├── admin/                     # 관리자 페이지
│   │   ├── login/                 # 로그인
│   │   ├── editor/                # 글쓰기 (수동)
│   │   ├── news/                  # 뉴스 관리
│   │   └── drafts/                # 초안 관리
│   │       └── [id]/              # 초안 편집
│   ├── blog/[slug]/               # 게시글 상세
│   └── page.tsx                   # 메인 페이지
├── components/                    # React 컴포넌트
│   ├── ui/                        # shadcn/ui 컴포넌트
│   ├── Header.tsx                 # 헤더 (모바일 메뉴)
│   ├── Footer.tsx                 # 푸터
│   └── Editor.tsx                 # TipTap 에디터
├── lib/                           # 라이브러리
│   ├── supabase.ts                # Supabase 클라이언트
│   ├── supabase-admin.ts          # Supabase Admin (서버 전용)
│   ├── types.ts                   # TypeScript 타입
│   └── utils.ts                   # 헬퍼 함수
├── supabase/                      # Supabase 설정
│   ├── schema.sql                 # 기본 DB 스키마
│   └── migrations/
│       └── 20260111_news_automation.sql  # 자동화 테이블
└── vercel.json                    # Vercel Cron 설정
```

## 🗄️ 데이터베이스 스키마

### 기존 테이블
- `admins` - 관리자 계정
- `posts` - 발행된 게시글
- `categories` - 카테고리
- `comments` - 댓글 (미사용)

### 자동화 테이블 (신규)
- `news_sources` - RSS 소스 관리
- `news_items` - 수집된 뉴스 (중복 제거)
- `drafts` - 자동 생성된 초안 (승인 대기)

## 🛠️ 기술 스택

- **Framework**: Next.js 15.1.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Editor**: TipTap
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **RSS Parser**: rss-parser
- **Deployment**: Vercel
- **Cron**: Vercel Cron

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일 생성:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel Cron Secret
CRON_SECRET=your-random-secret-key
```

### 3. 데이터베이스 마이그레이션
Supabase 대시보드에서 SQL 실행:
```bash
# 1. 기본 스키마
supabase/schema.sql

# 2. 자동화 테이블
supabase/migrations/20260111_news_automation.sql
```

### 4. 개발 서버 실행
```bash
npm run dev
```

서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 5. 프로덕션 빌드
```bash
npm run build
npm start
```

## 🎯 운영 가이드

### 관리자 로그인
1. `/admin/login` 접속
2. Supabase Auth로 생성한 관리자 계정 로그인

### 뉴스 소스 관리
1. Supabase 대시보드에서 `news_sources` 테이블 접근
2. RSS URL 추가:
   - `name`: 소스 이름 (예: "한국은행 보도자료")
   - `url`: RSS 피드 URL
   - `category`: 카테고리 (예: "금융")
   - `active`: true

### 수집된 뉴스 확인
1. `/admin/news` 접속
2. 필터 사용:
   - 전체 / 초안 대기중 / 초안 생성됨 / 제외됨
3. 불필요한 뉴스는 "제외" 처리

### 초안 관리
1. `/admin/drafts` 접속
2. 승인 대기 중인 초안 확인
3. 초안 클릭 → 편집
4. 승인 → 블로그 발행 / 반려 → 보관

### 수동 글쓰기
1. `/admin/editor` 접속
2. 기존 TipTap 에디터 사용
3. 자동화와 별개로 직접 작성 가능

## 🔄 자동화 작동 방식

### Cron 스케줄 (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/news-fetch",
      "schedule": "*/30 * * * *"  // 30분마다
    },
    {
      "path": "/api/cron/draft-generate",
      "schedule": "10 * * * *"    // 매시 10분
    }
  ]
}
```

### RSS 수집 프로세스
1. `news_sources` 테이블에서 active=true인 소스 가져오기
2. 각 RSS 피드 파싱
3. SHA-256 해시로 중복 체크
4. 새 뉴스만 `news_items`에 저장

### 초안 생성 프로세스
1. `news_items`에서 draft_generated=false, excluded=false인 항목 가져오기 (최대 10개)
2. 템플릿 기반 마크다운 생성:
   - SEO 최적화 제목
   - 도입부 + 이슈 배경
   - DSR/금리/한도 영향 분석
   - 계산 예시 2개
   - 실제 사례 2개
   - FAQ 5개
   - 주의사항
3. `drafts` 테이블에 저장 (status=pending)

### 승인 및 발행
1. 관리자가 초안 편집 (제목, 본문 등)
2. "승인 및 발행" 버튼 클릭
3. `posts` 테이블에 게시글 생성 (published=true)
4. `drafts` 테이블 status=approved 업데이트

## 🔐 보안 주의사항

### Service Role Key
- **절대** 클라이언트에 노출 금지
- `lib/supabase-admin.ts`에서만 사용
- API Route Handlers (서버)에서만 import

### Cron 인증
```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### RLS 정책
- 모든 테이블에 RLS 활성화
- 관리자만 뉴스/초안 조회 가능
- 일반 사용자는 published=true인 posts만 조회

## 📊 저작권 준수

### 원칙
- ❌ 원문 텍스트 크롤링 금지
- ✅ RSS 메타데이터만 수집 (title, link, pubDate)
- ✅ 초안은 템플릿 기반 생성 ("내 말로" 작성)
- ✅ 원문 링크 명시 (출처 표시)

### 템플릿 구조
```
# 뉴스 제목 - 대출·금리 영향 분석

## 이슈 배경
[3-5줄 요약]
**원문 확인**: [링크]

## 내 대출에 미치는 영향
### DSR 관점
### 금리 관점
### 한도 관점

## 계산 예시
### 예시 1: ...
### 예시 2: ...

## 실제 사례
### 사례 1: ...
### 사례 2: ...

## FAQ (5개)

## 주의사항
```

## 🚀 Vercel 배포

### 1. Vercel 프로젝트 생성
```bash
vercel
```

### 2. 환경 변수 설정
Vercel 대시보드 → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

### 3. Cron 활성화
- `vercel.json` 자동 인식
- Vercel Dashboard → Cron에서 실행 로그 확인

## 🧪 테스트

### 로컬 Cron 테스트
```bash
# RSS 수집 테스트
curl -X GET http://localhost:3000/api/cron/news-fetch \
  -H "Authorization: Bearer your-cron-secret"

# 초안 생성 테스트
curl -X GET http://localhost:3000/api/cron/draft-generate \
  -H "Authorization: Bearer your-cron-secret"
```

### 수동 트리거 (Vercel)
```bash
curl -X GET https://your-domain.com/api/cron/news-fetch \
  -H "Authorization: Bearer your-cron-secret"
```

## 📝 트러블슈팅

### Cron이 실행되지 않음
- Vercel 대시보드 → Cron 탭 확인
- `CRON_SECRET` 환경변수 설정 확인
- 배포 로그 확인

### 초안이 생성되지 않음
- `news_items`에 데이터가 있는지 확인
- `excluded=false, draft_generated=false` 확인
- API 로그 확인 (`console.log`)

### 승인 시 에러
- slug 중복 확인 (posts 테이블)
- Supabase Auth 로그인 상태 확인
- RLS 정책 확인

## 📄 라이선스

MIT License

## 👤 작성자

ohyess.kr - 금융 생활정보 블로그

---

**현재 상태**: 자동화 파이프라인 완성 ✅
**다음 단계**: RSS 소스 확장, AI 요약 통합 (선택)
