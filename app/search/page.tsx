import { supabase } from '@/lib/supabase'
import BlogCard from '@/components/BlogCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''

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
              <span className="font-semibold text-foreground">&quot;{query}&quot;</span>에 대한 검색 결과 {posts.length}개
            </>
          ) : (
            '검색어를 입력해주세요'
          )}
        </p>
      </div>

      {/* Search Results */}
      {query && (
        <section>
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                검색 결과가 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                다른 키워드로 검색해보세요
              </p>
            </div>
          )}
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
