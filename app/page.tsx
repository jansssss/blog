import BlogCard from '@/components/BlogCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

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
  const postsPerPage = 12
  const offset = (currentPage - 1) * postsPerPage

  // 카테고리별 쿼리 생성
  const postsQuery = supabase
    .from('posts')
    .select('*')
    .eq('published', true)

  const countQuery = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  // 카테고리 필터 적용
  if (selectedCategory) {
    postsQuery.eq('category', selectedCategory)
    countQuery.eq('category', selectedCategory)
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

  const totalPages = Math.ceil((count || 0) / postsPerPage)

  return (
    <div className="container py-10 overflow-x-hidden">
      {/* Hero Section */}
      <section className="mb-12 text-center overflow-visible">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl" style={{ lineHeight: '1.6' }}>
          모두의 궁금증을 해결하기위한 <br className="mb-2" />
          <span className="text-primary">생활정보 블로그</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground mt-6">
          금융, 세금, 대출, AI 등 다양한 주제의 전문 콘텐츠를 만나보세요
        </p>

        {/* AI-Style Search Bar */}
        <SearchBar />
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/">
            <Button variant={!selectedCategory ? 'default' : 'outline'}>
              전체
            </Button>
          </Link>
          {categories?.map((category) => (
            <Link key={category.name} href={`/?category=${encodeURIComponent(category.name)}`}>
              <Button variant={selectedCategory === category.name ? 'default' : 'outline'}>
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">최신 게시글</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {currentPage > 1 && (
              <Link href={`/?page=${currentPage - 1}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`}>
                <Button variant="outline">이전</Button>
              </Link>
            )}

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link key={page} href={`/?page=${page}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`}>
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                  >
                    {page}
                  </Button>
                </Link>
              ))}
            </div>

            {currentPage < totalPages && (
              <Link href={`/?page=${currentPage + 1}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`}>
                <Button variant="outline">다음</Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
