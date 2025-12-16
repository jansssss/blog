import BlogCard from '@/components/BlogCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// 동적 렌더링 강제 (항상 최신 데이터 표시)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const postsPerPage = 12
  const offset = (currentPage - 1) * postsPerPage

  // 전체 게시글 수 가져오기
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  // Supabase에서 게시글 가져오기 (페이지네이션 적용)
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + postsPerPage - 1)

  const totalPages = Math.ceil((count || 0) / postsPerPage)

  // Supabase에서 카테고리 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .order('name')

  return (
    <div className="container py-10">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl" style={{ lineHeight: '1.6' }}>
          모두의 궁금증을 해결하기위한 <br className="mb-2" />
          <span className="text-primary">생활정보 블로그</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground mt-6">
          금융, 세금, 대출, AI 등 다양한 주제의 전문 콘텐츠를 만나보세요
        </p>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="default">전체</Button>
          {categories?.map((category) => (
            <Button key={category.name} variant="outline">
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">최신 게시글</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {currentPage > 1 && (
              <Link href={`/?page=${currentPage - 1}`}>
                <Button variant="outline">이전</Button>
              </Link>
            )}

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link key={page} href={`/?page=${page}`}>
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
              <Link href={`/?page=${currentPage + 1}`}>
                <Button variant="outline">다음</Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
