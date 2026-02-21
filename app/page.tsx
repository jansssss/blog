import BlogCard from '@/components/BlogCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import InfoWidget from '@/components/InfoWidget'
import InterestRateWidget from '@/components/InterestRateWidget'
import InsuranceWidget from '@/components/InsuranceWidget'
import QuickToolsSection from '@/components/QuickToolsSection'
import InsuranceToolsSection from '@/components/InsuranceToolsSection'
import { getCurrentSite, DEFAULT_WIDGET_STYLE } from '@/lib/site'
import { Calculator, ArrowLeftRight, Car, Shield, ClipboardCheck, BookOpen, ArrowRight } from 'lucide-react'
import TrendingBanner from '@/components/TrendingBanner'

const HOME_GUIDE_ITEMS = [
  { title: '대출이자 계산법 완전 정리', href: '/guide/loan-interest', desc: '상환방식·금리 유형별 이자 차이' },
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', desc: '대출 한도 결정 3가지 핵심 지표' },
  { title: '상환방식 완전 비교', href: '/guide/repayment-types', desc: '원리금균등 vs 원금균등 총이자 차이' },
  { title: '중도상환수수료 정리', href: '/guide/early-repayment-fee', desc: '수수료 계산·면제 조건·절약 전략' },
  { title: '신용점수 완전 정리', href: '/guide/credit-score', desc: '점수 올리는 방법·금리에 미치는 영향' },
  { title: '대출 전 체크리스트', href: '/guide/loan-checklist', desc: '놓치면 후회하는 10가지 확인 항목' },
  { title: '주택담보대출 완전 정리', href: '/guide/mortgage-loan', desc: '한도·금리·절차 한 번에 이해하기' },
  { title: '전세대출 완전 정리', href: '/guide/jeonse-loan', desc: '종류·보증·사기 예방까지 완전 가이드' },
  { title: '금리 인상기 대출 전략', href: '/guide/rate-strategy', desc: '고정·변동 선택부터 갈아타기 타이밍' },
  { title: '대출 종류 완전 가이드', href: '/guide/loan-types-complete', desc: '신용·주담대·정책금융 목적별 비교' },
  { title: '대출 보증보험 정리', href: '/guide/loan-guarantee', desc: 'HUG·HF·SGI 비교와 전세 사기 방어' },
  { title: '대출 거절 극복 전략', href: '/guide/loan-rejection', desc: '거절 이유 파악부터 재신청 성공까지' },
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
  const isMainSite = site?.is_main ?? true

  // 위젯 스타일 (사이트 테마에서 가져오거나 기본값 사용)
  const widgetStyle = {
    gradient: site?.theme_json?.widget?.gradient || DEFAULT_WIDGET_STYLE.gradient,
    borderColor: site?.theme_json?.widget?.borderColor || DEFAULT_WIDGET_STYLE.borderColor,
  }
  const widgetType = site?.theme_json?.widget?.type || (isMainSite ? 'weather-stock' : 'interest-rate')

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
      {/* 사이트별 Info Widget (기본: 밝은 파스텔 테마) */}
      {widgetType === 'weather-stock' ? (
        <InfoWidget gradient={widgetStyle.gradient} borderColor={widgetStyle.borderColor} />
      ) : widgetType === 'interest-rate' ? (
        <InterestRateWidget gradient={widgetStyle.gradient} borderColor={widgetStyle.borderColor} />
      ) : widgetType === 'insurance' ? (
        <InsuranceWidget gradient={widgetStyle.gradient} borderColor={widgetStyle.borderColor} />
      ) : (
        <InterestRateWidget gradient={widgetStyle.gradient} borderColor={widgetStyle.borderColor} />
      )}

      <div className="container py-6 overflow-x-hidden">
        {/* Hero Section - Compact */}
        <section className="mb-6 text-center overflow-visible">
          <h1 className="mb-3 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl" style={{ lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            {heroSubtitle}
          </p>
          <SearchBar />
        </section>

        {/* 지금 핫한 이슈 배너 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && <TrendingBanner />}

        {/* 즉시 실행 CTA 버튼 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && (
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/calculator/loan-interest" className="block">
                <div className="flex items-center justify-center gap-2 py-4 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <Calculator className="w-5 h-5" />
                  <span className="text-sm sm:text-base">대출 이자 계산</span>
                </div>
              </Link>
              <Link href="/calculator/repayment-compare" className="block">
                <div className="flex items-center justify-center gap-2 py-4 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border">
                  <ArrowLeftRight className="w-5 h-5" />
                  <span className="text-sm sm:text-base">상환방식 비교</span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* 빠른 도구 바로가기 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && <QuickToolsSection />}

        {/* 핵심 금융 가이드 (ohyess.kr 전용) */}
        {site?.domain === 'ohyess.kr' && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg">
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">핵심 금융 가이드</h2>
                    <p className="text-[11px] text-blue-200 leading-tight">전문가 수준의 대출·신용 완전 정리</p>
                  </div>
                </div>
                <Link
                  href="/guide"
                  className="text-[11px] text-blue-200 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg"
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
                    className="group block p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl transition-all"
                  >
                    <p className="text-xs font-semibold text-white leading-snug mb-1">
                      {g.title}
                    </p>
                    <p className="text-[11px] text-blue-200 leading-tight">{g.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 즉시 실행 CTA 버튼 (sureline.kr 전용) */}
        {site?.domain === 'sureline.kr' && (
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/tools/auto-discount-check" className="block">
                <div className="flex items-center justify-center gap-2 py-4 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <Car className="w-5 h-5" />
                  <span className="text-sm sm:text-base">자동차보험 할인 진단</span>
                </div>
              </Link>
              <Link href="/tools/health-overlap-check" className="block">
                <div className="flex items-center justify-center gap-2 py-4 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm sm:text-base">실손/건강 중복 점검</span>
                </div>
              </Link>
              <Link href="/tools/insurance-remodel" className="block">
                <div className="flex items-center justify-center gap-2 py-4 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border">
                  <ClipboardCheck className="w-5 h-5" />
                  <span className="text-sm sm:text-base">보험 리모델링 체크</span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* 보험 점검 도구 (sureline.kr 전용) */}
        {site?.domain === 'sureline.kr' && <InsuranceToolsSection />}

        {/* Blog Posts Grid - 관련 가이드 */}
        <section>
          <h2 className="mb-6 text-xl font-bold">관련 가이드</h2>
        {posts && posts.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* 더보기 버튼 */}
            <div className="mt-8 flex justify-center">
              <Link href="/guide">
                <Button variant="outline">
                  더 많은 가이드 보기
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
