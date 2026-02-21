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
const STATIC_GUIDES = [
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '원리금균등·원금균등·만기일시 상환 방식별 이자 차이, 변동 vs 고정금리, 직장인·자영업자 실전 사례 2개.',
    tag: '대출 기초',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '소득·자산 기준으로 실제 얼마까지 빌릴 수 있는지 3가지 지표로 계산하는 방법.',
    tag: '대출 한도',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    title: '상환방식 완전 비교',
    href: '/guide/repayment-types',
    description: '원리금균등·원금균등·만기일시 — 총이자와 월납입액 차이, 내 상황에 맞는 선택 기준.',
    tag: '상환 전략',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    title: '중도상환수수료 완전 정리',
    href: '/guide/early-repayment-fee',
    description: '수수료 계산 공식, 면제 조건, 중도상환 vs 유지 손익 판단 기준 완전 정리.',
    tag: '비용 절약',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    title: '신용점수 완전 정리',
    href: '/guide/credit-score',
    description: '신용점수 올리는 현실적인 방법, 점수별 대출 금리 차이, 직장인·자영업자 회복 사례.',
    tag: '신용 관리',
    tagColor: 'bg-teal-100 text-teal-700',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인할 7가지 비교 포인트와 계약서 필수 확인 항목.',
    tag: '실전 가이드',
    tagColor: 'bg-rose-100 text-rose-700',
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
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">금융 가이드</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          대출·이자·신용점수·상환 전략을 실전 사례와 계산 공식으로 완전히 정리합니다.
        </p>
      </div>

      {/* 정적 핵심 가이드 */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">핵심 금융 가이드</h2>
          <span className="text-xs text-gray-400 ml-1">상시 업데이트 · 정적 전문 콘텐츠</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIC_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${guide.tagColor}`}>
                  {guide.tag}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 text-[15px] leading-snug">
                {guide.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{guide.description}</p>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
