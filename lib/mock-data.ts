import { Post } from './types'

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'ChatGPT와 Claude AI 비교 분석: 2025년 최신 업데이트',
    slug: 'chatgpt-vs-claude-2025',
    summary: '2025년 현재, ChatGPT와 Claude AI의 성능, 가격, 활용 사례를 심층 비교 분석합니다. 각 AI 모델의 강점과 약점을 파악하고 용도에 맞는 선택을 도와드립니다.',
    content: `
      <h2>AI 모델 비교의 필요성</h2>
      <p>2025년 현재, 생성형 AI 시장은 급격히 성장하고 있습니다. ChatGPT와 Claude는 가장 많이 사용되는 대화형 AI 모델로, 각각의 특징과 장단점이 있습니다.</p>

      <h2>성능 비교</h2>
      <p><strong>ChatGPT-4</strong>는 광범위한 지식 기반과 창의적인 답변으로 유명합니다. 반면 <strong>Claude 3.5 Sonnet</strong>은 긴 문맥 이해와 정확성에서 뛰어난 성능을 보입니다.</p>

      <ul>
        <li>ChatGPT: 창의적 작문, 브레인스토밍에 강점</li>
        <li>Claude: 문서 분석, 코딩 작업에 강점</li>
      </ul>

      <h2>가격 정책</h2>
      <p>ChatGPT는 무료 버전과 Plus($20/월)를 제공하며, Claude는 Pro($20/월) 플랜을 통해 더 많은 사용량을 제공합니다.</p>

      <h2>결론</h2>
      <p>두 AI 모두 훌륭한 선택이지만, <strong>창의적 작업</strong>에는 ChatGPT, <strong>정밀한 분석</strong>에는 Claude를 추천합니다.</p>
    `,
    category: 'AI',
    tags: ['ChatGPT', 'Claude', 'AI비교', '생성형AI'],
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    published: true,
    published_at: '2025-01-15T09:00:00Z',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:00:00Z',
  },
  {
    id: '2',
    title: '2025 연말정산 완벽 가이드: 세금 환급 최대화하기',
    slug: 'year-end-tax-settlement-2025',
    summary: '연말정산 시즌, 놓치기 쉬운 공제 항목과 세금 환급을 최대화하는 전략을 소개합니다. 신용카드, 의료비, 교육비 등 주요 공제 항목을 꼼꼼히 체크하세요.',
    content: `
      <h2>연말정산이란?</h2>
      <p>연말정산은 1년 동안 급여에서 원천징수된 세금을 정산하는 절차입니다. 올바른 공제 활용으로 세금 환급을 받을 수 있습니다.</p>

      <h2>주요 공제 항목</h2>
      <h3>1. 신용카드 소득공제</h3>
      <p>총 급여의 25%를 초과하는 사용액에 대해 공제받을 수 있습니다.</p>
      <ul>
        <li>신용카드: 15%</li>
        <li>체크카드/현금영수증: 30%</li>
        <li>전통시장/대중교통: 40%</li>
      </ul>

      <h3>2. 의료비 공제</h3>
      <p>총 급여의 3%를 초과하는 의료비는 15% 공제됩니다.</p>

      <h3>3. 교육비 공제</h3>
      <p>본인, 배우자, 자녀의 교육비는 전액 공제 가능합니다.</p>

      <h2>절세 팁</h2>
      <ol>
        <li>연말에 체크카드 사용 늘리기</li>
        <li>미루어둔 의료비 연말에 처리하기</li>
        <li>개인연금저축 납입 확인</li>
      </ol>

      <p><strong>주의:</strong> 공제 한도를 미리 확인하고, 증빙 서류를 잘 보관하세요!</p>
    `,
    category: '노무',
    tags: ['연말정산', '세금', '환급', '공제'],
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    published: true,
    published_at: '2025-01-10T14:30:00Z',
    created_at: '2025-01-10T14:30:00Z',
    updated_at: '2025-01-10T14:30:00Z',
  },
  {
    id: '3',
    title: '초보자를 위한 주식 투자 가이드: ETF부터 시작하기',
    slug: 'stock-investment-guide-etf',
    summary: '주식 투자가 처음이라면 개별 종목보다 ETF로 시작하는 것이 안전합니다. ETF의 개념, 장점, 추천 상품까지 초보 투자자를 위한 완벽 가이드.',
    content: `
      <h2>ETF란 무엇인가?</h2>
      <p><strong>ETF(상장지수펀드)</strong>는 주식처럼 거래되는 펀드로, 특정 지수를 추종합니다. 개별 주식보다 리스크가 낮아 초보자에게 적합합니다.</p>

      <h2>ETF의 장점</h2>
      <ul>
        <li><strong>분산 투자:</strong> 한 번의 매수로 여러 종목에 투자</li>
        <li><strong>낮은 수수료:</strong> 일반 펀드보다 운용 보수가 저렴</li>
        <li><strong>실시간 거래:</strong> 주식처럼 실시간으로 매매 가능</li>
        <li><strong>투명성:</strong> 보유 종목이 공개되어 투명함</li>
      </ul>

      <h2>초보자 추천 ETF</h2>
      <h3>국내 ETF</h3>
      <ol>
        <li><strong>KODEX 200:</strong> 국내 대표 200개 기업에 투자</li>
        <li><strong>TIGER 미국S&P500:</strong> 미국 주요 500개 기업</li>
        <li><strong>ACE 고배당주:</strong> 배당 수익 중심</li>
      </ol>

      <h2>투자 전략</h2>
      <p>초보자는 <strong>적립식 투자</strong>를 추천합니다. 매월 일정 금액을 투자하면 평균 매수 단가를 낮출 수 있습니다.</p>

      <blockquote>
        <p>"시장을 예측하려 하지 말고, 꾸준히 투자하라." - 워렌 버핏</p>
      </blockquote>

      <h2>주의사항</h2>
      <p>ETF도 주식처럼 가격 변동이 있으므로, <strong>장기 투자</strong> 관점에서 접근해야 합니다. 단기 수익을 노리기보다 꾸준한 자산 증식을 목표로 하세요.</p>
    `,
    category: '재테크',
    tags: ['주식', 'ETF', '투자', '재테크', '초보투자'],
    thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    published: true,
    published_at: '2025-01-08T11:00:00Z',
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-08T11:00:00Z',
  },
  {
    id: '4',
    title: 'Next.js 15 App Router 완벽 가이드: 실전 예제로 배우기',
    slug: 'nextjs-15-app-router-guide',
    summary: 'Next.js 15의 새로운 App Router는 기존 Pages Router와 어떻게 다를까요? Server Components, 라우팅, 데이터 페칭까지 실전 예제로 배워봅니다.',
    content: `
      <h2>App Router가 뭐길래?</h2>
      <p>Next.js 13부터 도입된 App Router는 React Server Components를 기반으로 하는 새로운 라우팅 시스템입니다. Next.js 15에서 더욱 안정화되었습니다.</p>

      <h2>주요 변경 사항</h2>
      <h3>1. 폴더 기반 라우팅</h3>
      <pre><code>app/
├── page.tsx          // 메인 페이지 (/)
├── about/
│   └── page.tsx      // /about
└── blog/
    └── [slug]/
        └── page.tsx  // /blog/[slug]</code></pre>

      <h3>2. Server Components 기본</h3>
      <p>모든 컴포넌트는 기본적으로 <strong>Server Component</strong>입니다. 클라이언트 컴포넌트가 필요할 때만 'use client' 지시어를 추가합니다.</p>

      <pre><code>'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return &lt;button onClick={() => setCount(count + 1)}&gt;{count}&lt;/button&gt;
}</code></pre>

      <h3>3. 데이터 페칭</h3>
      <p>getServerSideProps, getStaticProps 대신 <strong>async/await</strong>를 직접 사용합니다.</p>

      <pre><code>export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()

  return &lt;div&gt;{posts.map(post => ...)}&lt;/div&gt;
}</code></pre>

      <h2>레이아웃 시스템</h2>
      <p><code>layout.tsx</code>는 공통 UI를 정의합니다. 페이지 전환 시에도 레이아웃은 유지됩니다.</p>

      <pre><code>export default function RootLayout({ children }) {
  return (
    &lt;html lang="ko"&gt;
      &lt;body&gt;
        &lt;Header /&gt;
        {children}
        &lt;Footer /&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  )
}</code></pre>

      <h2>마이그레이션 팁</h2>
      <ol>
        <li>점진적 마이그레이션: Pages Router와 공존 가능</li>
        <li>서버/클라이언트 컴포넌트 구분 명확히</li>
        <li>Metadata API로 SEO 최적화</li>
      </ol>

      <p><strong>결론:</strong> App Router는 성능, SEO, 개발 경험 모두 개선되었습니다. 새 프로젝트라면 망설이지 말고 App Router를 선택하세요!</p>
    `,
    category: '개발',
    tags: ['Next.js', 'React', 'App Router', 'Server Components', '웹개발'],
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    published: true,
    published_at: '2025-01-05T16:00:00Z',
    created_at: '2025-01-05T16:00:00Z',
    updated_at: '2025-01-05T16:00:00Z',
  },
  {
    id: '5',
    title: 'Supabase vs Firebase: 2025년 백엔드 서비스 비교',
    slug: 'supabase-vs-firebase-2025',
    summary: 'BaaS(Backend as a Service) 시장의 양대 산맥, Supabase와 Firebase를 비교합니다. 데이터베이스, 인증, 스토리지, 가격까지 모든 것을 분석합니다.',
    content: `
      <h2>BaaS란?</h2>
      <p><strong>BaaS(Backend as a Service)</strong>는 백엔드 인프라를 직접 구축하지 않고 서비스로 이용하는 것입니다. 개발자는 프론트엔드에만 집중할 수 있습니다.</p>

      <h2>Firebase vs Supabase: 핵심 비교</h2>

      <h3>1. 데이터베이스</h3>
      <table>
        <tr>
          <th>항목</th>
          <th>Firebase</th>
          <th>Supabase</th>
        </tr>
        <tr>
          <td>DB 종류</td>
          <td>NoSQL (Firestore)</td>
          <td>PostgreSQL (관계형)</td>
        </tr>
        <tr>
          <td>쿼리 능력</td>
          <td>제한적</td>
          <td>강력한 SQL 지원</td>
        </tr>
      </table>

      <h3>2. 실시간 기능</h3>
      <p>두 서비스 모두 실시간 데이터베이스를 지원하지만, Supabase는 PostgreSQL의 <strong>Realtime Replication</strong>을 사용합니다.</p>

      <h3>3. 인증</h3>
      <ul>
        <li><strong>Firebase:</strong> 소셜 로그인, 전화번호 인증 등 다양한 방식</li>
        <li><strong>Supabase:</strong> Row Level Security로 세밀한 권한 제어</li>
      </ul>

      <h3>4. 스토리지</h3>
      <p>Firebase Storage와 Supabase Storage 모두 파일 업로드/다운로드를 지원하지만, Supabase는 S3 호환 API를 제공합니다.</p>

      <h2>가격 비교</h2>
      <h3>Firebase</h3>
      <ul>
        <li>무료: 제한적</li>
        <li>Blaze (종량제): 사용한 만큼 과금</li>
      </ul>

      <h3>Supabase</h3>
      <ul>
        <li>무료: 500MB DB, 1GB 스토리지</li>
        <li>Pro: $25/월 (8GB DB, 100GB 스토리지)</li>
      </ul>

      <h2>어떤 것을 선택해야 할까?</h2>

      <h3>Firebase를 선택해야 하는 경우:</h3>
      <ul>
        <li>NoSQL 문서 기반 데이터베이스가 필요할 때</li>
        <li>Google 생태계와 긴밀한 통합이 필요할 때</li>
        <li>모바일 앱 개발 (FCM 등)</li>
      </ul>

      <h3>Supabase를 선택해야 하는 경우:</h3>
      <ul>
        <li>복잡한 SQL 쿼리가 필요할 때</li>
        <li>PostgreSQL 생태계 활용</li>
        <li>오픈소스 선호</li>
        <li>비용 효율적인 솔루션</li>
      </ul>

      <h2>결론</h2>
      <p>두 서비스 모두 훌륭하지만, <strong>관계형 데이터와 복잡한 쿼리</strong>가 필요하다면 Supabase, <strong>빠른 프로토타이핑과 Google 생태계</strong>가 중요하다면 Firebase를 추천합니다.</p>

      <blockquote>
        <p>"프로젝트에 맞는 도구를 선택하는 것이 성공의 첫걸음입니다."</p>
      </blockquote>
    `,
    category: '개발',
    tags: ['Supabase', 'Firebase', 'BaaS', '백엔드', 'PostgreSQL'],
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    published: true,
    published_at: '2025-01-03T10:30:00Z',
    created_at: '2025-01-03T10:30:00Z',
    updated_at: '2025-01-03T10:30:00Z',
  },
]

// 카테고리별 게시글 필터링
export function getPostsByCategory(category: string): Post[] {
  return mockPosts.filter(post => post.category === category && post.published)
}

// 슬러그로 게시글 찾기
export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find(post => post.slug === slug && post.published)
}

// 최신 게시글 가져오기
export function getLatestPosts(limit: number = 10): Post[] {
  return mockPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, limit)
}

// 모든 카테고리 가져오기
export function getAllCategories(): string[] {
  return Array.from(new Set(mockPosts.map(post => post.category)))
}

// 모든 태그 가져오기
export function getAllTags(): string[] {
  const tags = mockPosts.flatMap(post => post.tags)
  return Array.from(new Set(tags))
}
