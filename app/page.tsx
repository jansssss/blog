import BlogCard from '@/components/BlogCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import InfoWidget from '@/components/InfoWidget'
import InterestRateWidget from '@/components/InterestRateWidget'
import QuickToolsSection from '@/components/QuickToolsSection'
import { getCurrentSite, DEFAULT_WIDGET_STYLE } from '@/lib/site'
import { BookOpen, ArrowRight, HelpCircle, ChevronRight } from 'lucide-react'
import HomeLoanCalculator from '@/components/calculators/HomeLoanCalculator'

const FEATURED_QUESTIONS = [
  {
    q: '월급 5천이면 주담대 얼마까지?',
    hint: '소득별 한도 + DSR 즉시 계산',
    href: '/guide/mortgage-salary-5000',
    emoji: '🏠',
  },
  {
    q: '자동차 할부, 주담대 한도 얼마나 깎여?',
    hint: '할부 금액별 감소분 계산',
    href: '/guide/car-loan-dsr-impact',
    emoji: '🚗',
  },
  {
    q: 'LTV는 되는데 왜 대출이 안 될까?',
    hint: 'LTV·DSR 동시 비교 + 실제 한도',
    href: '/guide/ltv-ok-dsr-blocked',
    emoji: '🔒',
  },
  {
    q: '금리 0.5% 차이, 실제로 얼마나 달라?',
    hint: '금액·기간별 총이자 비교 계산',
    href: '/guide/rate-0p5-difference',
    emoji: '📊',
  },
]

const HOME_GUIDE_ITEMS = [
  { title: '주택담보대출 완전 정리', href: '/guide/mortgage-loan', desc: '한도·금리·절차 한 번에 이해하기' },
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', desc: '대출 한도 결정 3가지 핵심 지표' },
  { title: '대출이자 계산법 완전 정리', href: '/guide/loan-interest', desc: '상환방식·금리 유형별 이자 차이' },
  { title: '상환방식 완전 비교', href: '/guide/repayment-types', desc: '원리금균등 vs 원금균등 총이자 차이' },
  { title: '중도상환수수료 정리', href: '/guide/early-repayment-fee', desc: '수수료 계산·면제 조건·절약 전략' },
  { title: '대출 전 체크리스트', href: '/guide/loan-checklist', desc: '놓치면 후회하는 10가지 확인 항목' },
  { title: '자동차 할부 DSR 영향', href: '/guide/car-loan-dsr-impact', desc: '할부가 대출 한도를 깎는 구조' },
  { title: '금리 0.5% 차이 계산', href: '/guide/rate-0p5-difference', desc: '금액·기간별 총이자 차이 비교' },
]

// ISR 설정 (60초마다 재검증)
export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const selectedCategory = params.category || null
  const postsPerPage = 3  // 홈페이지에서는 3개만 표시
  const offset = (currentPage - 1) * postsPerPage

  // 현재 사이트 정보 조회
  const site = await getCurrentSite()
  const siteId = site?.id

  // 위젯 스타일 (사이트 테마에서 가져오거나 기본값 사용)
  const widgetStyle = {
    gradient: site?.theme_json?.widget?.gradient || DEFAULT_WIDGET_STYLE.gradient,
    borderColor: site?.theme_json?.widget?.borderColor || DEFAULT_WIDGET_STYLE.borderColor,
  }
  const widgetType = site?.theme_json?.widget?.type || 'weather-stock'

  // 카테고리별 쿼리 생성 (site_id 필터 강제)
  let postsQuery = supabase
    .from('posts')
    .select('*')
    .eq('published', true)

  let countQuery = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  // site_id 필터 적용 (필수)
  if (siteId) {
    postsQuery = postsQuery.eq('site_id', siteId)
    countQuery = countQuery.eq('site_id', siteId)
  }

  // 카테고리 필터 적용
  if (selectedCategory) {
    postsQuery = postsQuery.eq('category', selectedCategory)
    countQuery = countQuery.eq('category', selectedCategory)
  }

  // 병렬로 데이터 가져오기 (성능 개선)
  const [
    { count },
    { data: posts },
    { data: categories }
  ] = await Promise.all([
    countQuery,
    postsQuery.order('published_at', { ascending: false }).range(offset, offset + postsPerPage - 1),
    supabase.from('categories').select('name').order('name')
  ])

  // Phase 1: 홈페이지에서는 페이지네이션 제거 (첫 페이지만 표시)

  // 사이트별 메인 페이지 텍스트 (theme_json에서 가져오거나 기본값 사용)
  const heroTitle = site?.theme_json?.homepage?.heroTitle || '모두의 궁금증을 해결하기위한 생활정보 블로그'
  const heroSubtitle = site?.theme_json?.homepage?.heroSubtitle || '금융, 세금, 대출, AI 등 다양한 주제의 전문 콘텐츠를 만나보세요'
  const sectionTitleLatest = site?.theme_json?.homepage?.sectionTitleLatest || '최신 게시글'

  return (
    <>
      {widgetType === 'weather-stock' ? (
        <InfoWidget gradient={widgetStyle.gradient} borderColor={widgetStyle.borderColor} />
      ) : (
        <InterestRateWidget gradient={widgetStyle.gradient} borderColor={widgetStyle.borderColor} />
      )}

      <div className="container max-w-5xl py-6 overflow-x-hidden">
        {/* Hero Section - Compact */}
        <section className="mb-6 text-center overflow-visible">
          {/* heroTitle은 관리자가 직접 설정하는 신뢰된 DB 값 */}
          {/* eslint-disable-next-line react/no-danger */}
          <h1 className="mb-3 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl" style={{ lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            {heroSubtitle}
          </p>
          <SearchBar />
        </section>

        {/* 인라인 대출 이자 계산기 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && <HomeLoanCalculator />}

        {/* 주담대 준비 허브 카드 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && (
          <section className="mb-8">
            <div className="rounded-2xl overflow-hidden border border-indigo-200 shadow-sm">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 px-5 py-5 sm:px-6">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">STEP BY STEP</p>
                <h2 className="text-white text-base sm:text-lg font-bold leading-snug mb-1">
                  집을 사기 전, 대출 준비를 순서대로 확인하세요
                </h2>
                <p className="text-indigo-200 text-xs leading-relaxed">
                  연봉·기존 대출·집값을 기준으로 한도와 월 납입액을 확인하고, 사전심사 전 체크할 항목까지 한 번에 정리합니다.
                </p>
              </div>
              <div className="bg-white px-5 py-4">
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {(['한도 확인', '월 납입액 계산', '기존 부채 영향', '사전심사 체크'] as const).map((step, i, arr) => (
                    <span key={step} className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                        <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </span>
                      {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />}
                    </span>
                  ))}
                </div>
                <Link
                  href="/hub/mortgage-preparation"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  주담대 준비 순서 확인하기 <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 빠른 도구 바로가기 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && <QuickToolsSection />}

        {/* 자주 묻는 대출 질문 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-800">자주 묻는 대출 질문</h2>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">계산기 포함</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED_QUESTIONS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 p-4 bg-white hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl shadow-sm transition-all"
                >
                  <span className="text-2xl leading-none mt-0.5 shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors leading-snug mb-0.5">
                      {item.q}
                    </p>
                    <p className="text-[11px] text-gray-400">{item.hint}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 핵심 금융 가이드 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-2xl p-5">
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 leading-tight">핵심 금융 가이드</h2>
                    <p className="text-[11px] text-gray-500 leading-tight">공식자료 기반 실전 금융 가이드</p>
                  </div>
                </div>
                <Link
                  href="/guide"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg"
                >
                  전체 보기 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {/* 가이드 카드 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {HOME_GUIDE_ITEMS.map((g) => (
                  <Link
                    key={g.href}
                    href={g.href}
                    className="group block p-3 bg-white hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 rounded-xl transition-all shadow-sm"
                  >
                    <p className="text-xs font-semibold text-gray-800 leading-snug mb-1 group-hover:text-indigo-700 transition-colors">
                      {g.title}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-tight">{g.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid - 최신 사례글 */}
        <section>
          <h2 className="mb-6 text-xl font-bold">최신 사례글</h2>
        {posts && posts.length > 0 ? (
          <>
            <div className="blog-grid-md3 grid gap-6 grid-cols-1 md:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* 더보기 버튼 */}
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <Link href="/blog">
                <Button variant="outline">
                  블로그 전체 보기
                </Button>
              </Link>
              <Link href="/guide">
                <Button variant="outline">
                  금융 가이드 보기
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">작성된 글이 없습니다.</p>
          </div>
        )}
      </section>
      </div>
    </>
  )
}
