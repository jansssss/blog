import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import BlogCard from '@/components/BlogCard'
import Pagination from '@/components/Pagination'
import { getCurrentSiteId } from '@/lib/site'

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
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 가이드
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          상황별 금융 설명과 실전 체크리스트
        </p>
      </div>

      {/* 카테고리 필터 */}
      <section className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/guide">
            <Button variant={!selectedCategory ? 'default' : 'outline'}>
              전체
            </Button>
          </Link>
          {categories?.map((category) => (
            <Link key={category.id} href={`/guide?category=${category.id}`}>
              <Button variant={selectedCategory === category.id ? 'default' : 'outline'}>
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* 글 목록 */}
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
