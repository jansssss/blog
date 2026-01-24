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
import { Calculator, ArrowLeftRight, Car, Shield, ClipboardCheck } from 'lucide-react'

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
