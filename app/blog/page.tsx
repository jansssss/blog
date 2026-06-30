import { Metadata } from 'next'
import BlogCard from '@/components/BlogCard'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCurrentSite } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const revalidate = 60

const POSTS_PER_PAGE = 12

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite()
  const siteName = site?.name || '오예스'
  const canonicalHost = site?.domain || 'ohyess.kr'
  return {
    title: `블로그 | ${siteName}`,
    description: '대출·금융·투자 실전 사례와 분석 글을 모았습니다.',
    alternates: { canonical: `https://${canonicalHost}/blog` },
    openGraph: {
      title: `블로그 | ${siteName}`,
      description: '대출·금융·투자 실전 사례와 분석 글을 모았습니다.',
      type: 'website',
      locale: 'ko_KR',
    },
  }
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  const site = await getCurrentSite()
  const siteId = site?.id

  let countQuery = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  let postsQuery = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (siteId) {
    countQuery = countQuery.eq('site_id', siteId)
    postsQuery = postsQuery.eq('site_id', siteId)
  }

  const [{ count }, { data: posts }] = await Promise.all([countQuery, postsQuery])
  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

  return (
    <div className="container max-w-5xl py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">블로그</h1>
        <p className="text-muted-foreground text-sm">
          대출·금융·투자 실전 사례와 분석 글을 모았습니다.
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              {currentPage > 1 && (
                <Link href={`/blog?page=${currentPage - 1}`}>
                  <Button variant="outline" size="sm">이전</Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link href={`/blog?page=${currentPage + 1}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    다음 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          아직 게시글이 없습니다.
        </div>
      )}
    </div>
  )
}
