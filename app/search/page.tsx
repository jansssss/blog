import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import BlogCard from '@/components/BlogCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getHostFromRequest, normalizeDomain } from '@/lib/site'
import { searchStaticGuides, isNewGuide } from '@/lib/guide-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = (params.q || '').trim()
  const host = normalizeDomain(await getHostFromRequest())
  const guides = ['ohyess.kr', 'localhost', '127.0.0.1'].includes(host) ? searchStaticGuides(query) : []

  // Supabase에서 검색 수행
  let posts = []
  if (query) {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`)
      .order('published_at', { ascending: false })

    posts = data || []
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          검색 결과
        </h1>
        <p className="text-muted-foreground">
          {query ? (
            <>
              <span className="font-semibold text-foreground">&quot;{query}&quot;</span>에 대한 검색 결과 {posts.length + guides.length}개
            </>
          ) : (
            '검색어를 입력해주세요'
          )}
        </p>
      </div>

      {/* Search Results */}
      {guides.length > 0 && (
        <section className="mb-8" aria-labelledby="guide-search-title">
          <h2 id="guide-search-title" className="mb-4 text-lg font-bold">금융 가이드·계산기</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(guide => (
              <Link key={guide.href} href={guide.href} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50">
                <div className="mb-2 flex items-center gap-2 text-xs text-indigo-700"><span>{guide.tag}</span>{isNewGuide(guide) && <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-white">NEW</span>}</div>
                <h3 className="mb-2 font-bold text-gray-900">{guide.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      {query && (
        <section>
          {posts.length > 0 ? (
            <div className="blog-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : guides.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                검색 결과가 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                다른 키워드로 검색해보세요
              </p>
            </div>
          ) : null}
        </section>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            검색어를 입력하여 콘텐츠를 찾아보세요
          </p>
        </div>
      )}
    </div>
  )
}
