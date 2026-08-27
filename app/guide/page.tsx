import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import BlogCard from '@/components/BlogCard'
import Pagination from '@/components/Pagination'
import { getCurrentSiteId } from '@/lib/site'
import { BookOpen, ArrowRight } from 'lucide-react'
import { getGuideIndexItems, isNewGuide } from '@/lib/guide-content'

export const metadata: Metadata = {
  title: '금융 가이드 | 대출·DSR·금리·상환 전략 | ohyess',
  description:
    '공식 자료와 계산 사례를 바탕으로 대출 한도, DSR, 금리, 상환 방식과 주택담보대출 준비 과정을 설명하는 실전 금융 가이드입니다.',
  alternates: { canonical: '/guide' },
  openGraph: {
    title: '금융 가이드 | ohyess',
    description: '공식 자료와 직접 계산으로 확인하는 대출·DSR·금리 실전 가이드',
    type: 'website',
  },
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GuidePage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const selectedCategory = params.category as string | undefined
  const postsPerPage = 12
  const staticGuides = getGuideIndexItems()

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
          {staticGuides.length}가지 완전 정리 가이드
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">금융 가이드</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          대출·이자·신용점수·상환 전략을 실전 사례와 계산 공식으로 완전히 정리합니다.
        </p>
      </div>

      {/* 주담대 준비 허브 CTA */}
      <Link
        href="/hub/mortgage-preparation"
        className="group flex items-center justify-between gap-4 mb-10 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 px-6 py-5 transition-colors"
      >
        <div>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">STEP BY STEP</p>
          <p className="text-base font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
            주택담보대출 준비 — 대출 신청 전 체크할 7단계
          </p>
          <p className="text-xs text-gray-500 mt-1">
            연봉 6천 단독 vs 부부합산 1억, DSR 계산부터 사전심사 체크까지 내 조건별 최적 전략
          </p>
        </div>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors">
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* 정적 핵심 가이드 */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">핵심 금융 가이드</h2>
          <span className="text-xs text-gray-400 ml-1">공식자료 기반 실전 금융 가이드</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staticGuides.map((guide) => {
            const isNew = isNewGuide(guide)
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className={`group block border-l-4 rounded-xl p-5 border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${guide.cardBg} ${guide.borderAccent} ${guide.hoverBg} ${guide.hoverBorder}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none">{guide.icon}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${guide.tagColor}`}>
                      {guide.tag}
                    </span>
                    {isNew && (
                      <span
                        aria-label="새 콘텐츠"
                        className="text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm"
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <h3 className="font-bold text-gray-900 text-[14.5px] leading-snug mb-2 group-hover:text-gray-800">
                  {guide.title}
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{guide.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 카테고리 필터 */}
      {categories && categories.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">금융 가이드 더보기</h2>
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
