import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import BlogCard from '@/components/BlogCard'
import Pagination from '@/components/Pagination'
import { getCurrentSiteId } from '@/lib/site'
import { BookOpen, ArrowRight } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 정적 금융 가이드 목록 (SEO 허브용)
// cardStyle: [카드배경, 왼쪽테두리색, 태그배경+텍스트, 아이콘색, 호버배경]
const STATIC_GUIDES = [
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '원리금균등·원금균등·만기일시 상환 방식별 이자 차이, 변동 vs 고정금리, 직장인·자영업자 실전 사례 2개.',
    tag: '대출 기초',
    icon: '💰',
    cardBg: 'bg-blue-50/60',
    borderAccent: 'border-l-blue-400',
    tagColor: 'bg-blue-100 text-blue-700',
    hoverBg: 'hover:bg-blue-100/60',
    hoverBorder: 'hover:border-l-blue-500',
  },
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '소득·자산 기준으로 실제 얼마까지 빌릴 수 있는지 3가지 지표로 계산하는 방법.',
    tag: '대출 한도',
    icon: '📊',
    cardBg: 'bg-purple-50/60',
    borderAccent: 'border-l-purple-400',
    tagColor: 'bg-purple-100 text-purple-700',
    hoverBg: 'hover:bg-purple-100/60',
    hoverBorder: 'hover:border-l-purple-500',
  },
  {
    title: '상환방식 완전 비교',
    href: '/guide/repayment-types',
    description: '원리금균등·원금균등·만기일시 — 총이자와 월납입액 차이, 내 상황에 맞는 선택 기준.',
    tag: '상환 전략',
    icon: '🔄',
    cardBg: 'bg-green-50/60',
    borderAccent: 'border-l-green-400',
    tagColor: 'bg-green-100 text-green-700',
    hoverBg: 'hover:bg-green-100/60',
    hoverBorder: 'hover:border-l-green-500',
  },
  {
    title: '중도상환수수료 완전 정리',
    href: '/guide/early-repayment-fee',
    description: '수수료 계산 공식, 면제 조건, 중도상환 vs 유지 손익 판단 기준 완전 정리.',
    tag: '비용 절약',
    icon: '✂️',
    cardBg: 'bg-orange-50/60',
    borderAccent: 'border-l-orange-400',
    tagColor: 'bg-orange-100 text-orange-700',
    hoverBg: 'hover:bg-orange-100/60',
    hoverBorder: 'hover:border-l-orange-500',
  },
  {
    title: '신용점수 완전 정리',
    href: '/guide/credit-score',
    description: '신용점수 올리는 현실적인 방법, 점수별 대출 금리 차이, 직장인·자영업자 회복 사례.',
    tag: '신용 관리',
    icon: '⭐',
    cardBg: 'bg-teal-50/60',
    borderAccent: 'border-l-teal-400',
    tagColor: 'bg-teal-100 text-teal-700',
    hoverBg: 'hover:bg-teal-100/60',
    hoverBorder: 'hover:border-l-teal-500',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인할 7가지 비교 포인트와 계약서 필수 확인 항목.',
    tag: '실전 가이드',
    icon: '✅',
    cardBg: 'bg-rose-50/60',
    borderAccent: 'border-l-rose-400',
    tagColor: 'bg-rose-100 text-rose-700',
    hoverBg: 'hover:bg-rose-100/60',
    hoverBorder: 'hover:border-l-rose-500',
  },
  {
    title: '주택담보대출 완전 정리',
    href: '/guide/mortgage-loan',
    description: '주담대 종류부터 LTV·DSR·DTI 한도 계산, 금리 비교, 신청·실행 7단계 절차까지 2026년 기준 완전 정리.',
    tag: '주담대',
    icon: '🏠',
    cardBg: 'bg-indigo-50/60',
    borderAccent: 'border-l-indigo-400',
    tagColor: 'bg-indigo-100 text-indigo-700',
    hoverBg: 'hover:bg-indigo-100/60',
    hoverBorder: 'hover:border-l-indigo-500',
  },
  {
    title: '전세대출 완전 정리',
    href: '/guide/jeonse-loan',
    description: '버팀목·HF·시중은행 전세대출 비교, 보증 기관 선택법, 전세 사기 예방 체크리스트까지.',
    tag: '전세 대출',
    icon: '🔑',
    cardBg: 'bg-emerald-50/60',
    borderAccent: 'border-l-emerald-400',
    tagColor: 'bg-emerald-100 text-emerald-700',
    hoverBg: 'hover:bg-emerald-100/60',
    hoverBorder: 'hover:border-l-emerald-500',
  },
  {
    title: '금리 인상기 대출 전략',
    href: '/guide/rate-strategy',
    description: '고정·변동금리 선택 기준, 대환대출 손익 계산, 금리 인하 요구권 활용법 실전 정리.',
    tag: '금리 전략',
    icon: '📈',
    cardBg: 'bg-amber-50/60',
    borderAccent: 'border-l-amber-400',
    tagColor: 'bg-amber-100 text-amber-700',
    hoverBg: 'hover:bg-amber-100/60',
    hoverBorder: 'hover:border-l-amber-500',
  },
  {
    title: '대출 종류 완전 가이드',
    href: '/guide/loan-types-complete',
    description: '신용대출·주담대·전세대출·사업자대출·정책금융까지 목적·금리·조건별 완전 비교.',
    tag: '대출 종류',
    icon: '📋',
    cardBg: 'bg-sky-50/60',
    borderAccent: 'border-l-sky-400',
    tagColor: 'bg-sky-100 text-sky-700',
    hoverBg: 'hover:bg-sky-100/60',
    hoverBorder: 'hover:border-l-sky-500',
  },
  {
    title: '대출 보증보험 완전 정리',
    href: '/guide/loan-guarantee',
    description: 'HUG·HF·SGI 3대 보증 기관 비교, 전세보증보험 가입법, 보증료 계산과 절약 전략.',
    tag: '보증 보험',
    icon: '🛡️',
    cardBg: 'bg-violet-50/60',
    borderAccent: 'border-l-violet-400',
    tagColor: 'bg-violet-100 text-violet-700',
    hoverBg: 'hover:bg-violet-100/60',
    hoverBorder: 'hover:border-l-violet-500',
  },
  {
    title: '대출 거절 극복 전략',
    href: '/guide/loan-rejection',
    description: '거절의 5가지 핵심 이유, 신용점수·DSR 개선 전략, 대안 대출 경로까지 재신청 성공 가이드.',
    tag: '거절 극복',
    icon: '💪',
    cardBg: 'bg-pink-50/60',
    borderAccent: 'border-l-pink-400',
    tagColor: 'bg-pink-100 text-pink-700',
    hoverBg: 'hover:bg-pink-100/60',
    hoverBorder: 'hover:border-l-pink-500',
  },
]

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GuidePage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const selectedCategory = params.category as string | undefined
  const postsPerPage = 12

  const siteId = await getCurrentSiteId()
  if (!siteId) {
    return <div className="container py-8">사이트 정보를 찾을 수 없습니다.</div>
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 카테고리 목록 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('site_id', siteId)
    .order('name')

  // 글 목록 조회
  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('site_id', siteId)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1)

  if (selectedCategory) {
    query = query.eq('category_id', selectedCategory)
  }

  const { data: posts, count } = await query
  const totalPages = count ? Math.ceil(count / postsPerPage) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-100/60 px-8 py-12 text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-5">
          12가지 완전 정리 가이드
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">금융 가이드</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          대출·이자·신용점수·상환 전략을 실전 사례와 계산 공식으로 완전히 정리합니다.
        </p>
      </div>

      {/* 정적 핵심 가이드 */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">핵심 금융 가이드</h2>
          <span className="text-xs text-gray-400 ml-1">12개 완전 정리 · 전문가 콘텐츠</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATIC_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className={`group block border-l-4 rounded-xl p-5 border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${guide.cardBg} ${guide.borderAccent} ${guide.hoverBg} ${guide.hoverBorder}`}
            >
              {/* 상단: 아이콘 + 태그 + 화살표 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{guide.icon}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${guide.tagColor}`}>
                    {guide.tag}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              {/* 제목 */}
              <h3 className="font-bold text-gray-900 text-[14.5px] leading-snug mb-2 group-hover:text-gray-800">
                {guide.title}
              </h3>
              {/* 설명 */}
              <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 카테고리 필터 */}
      {categories && categories.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">블로그 관련글</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/guide">
              <Button variant={!selectedCategory ? 'default' : 'outline'} size="sm">
                전체
              </Button>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/guide?category=${category.id}`}>
                <Button
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 블로그 글 목록 */}
      <section className="mb-12">
        {posts && posts.length > 0 ? (
          <div className="blog-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">작성된 글이 없습니다.</p>
          </div>
        )}
      </section>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/guide"
          category={selectedCategory}
        />
      )}
    </div>
  )
}
