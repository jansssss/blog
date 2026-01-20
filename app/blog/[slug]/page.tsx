import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Tag, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import EditButton from '@/components/EditButton'
import DeleteButton from '@/components/DeleteButton'
import { getCurrentSiteId } from '@/lib/site'

// 동적 렌더링 강제 (항상 최신 데이터 표시)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = await params
  // URL 디코딩 (한글 slug 지원)
  const slug = decodeURIComponent(encodedSlug)
  const siteId = await getCurrentSiteId()

  let query = supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)

  if (siteId) {
    query = query.eq('site_id', siteId)
  }

  const { data: post } = await query.single()

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} - CMS Blog`,
    description: post.summary,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.published_at,
      authors: ['CMS Blog'],
      tags: post.tags,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = await params
  // URL 디코딩 (한글 slug 지원)
  const slug = decodeURIComponent(encodedSlug)
  const siteId = await getCurrentSiteId()

  // 현재 글 조회 (site_id 필터 적용)
  let postQuery = supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)

  if (siteId) {
    postQuery = postQuery.eq('site_id', siteId)
  }

  const { data: post } = await postQuery.single()

  if (!post) {
    notFound()
  }

  // 이전 글 (현재 글보다 이전에 발행된 글 중 가장 최근 글, 같은 사이트)
  let prevQuery = supabase
    .from('posts')
    .select('id, title, slug')
    .eq('published', true)
    .lt('published_at', post.published_at)
    .order('published_at', { ascending: false })
    .limit(1)

  if (siteId) {
    prevQuery = prevQuery.eq('site_id', siteId)
  }

  const { data: prevPost } = await prevQuery.single()

  // 다음 글 (현재 글보다 이후에 발행된 글 중 가장 오래된 글, 같은 사이트)
  let nextQuery = supabase
    .from('posts')
    .select('id, title, slug')
    .eq('published', true)
    .gt('published_at', post.published_at)
    .order('published_at', { ascending: true })
    .limit(1)

  if (siteId) {
    nextQuery = nextQuery.eq('site_id', siteId)
  }

  const { data: nextPost } = await nextQuery.single()

  return (
    <article className="container max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
      {/* Back Button & Admin Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex gap-2">
          <EditButton postId={post.id} />
          <DeleteButton postId={post.id} />
        </div>
      </div>

      {/* Thumbnail */}
      {post.thumbnail_url && (
        <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg">
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Post Header */}
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
            {post.category}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        <p className="text-xl text-muted-foreground">{post.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <div
              key={tag}
              className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
            >
              <Tag className="h-3 w-3" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Post Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-base prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Previous/Next Post Navigation */}
      <div className="mt-16 mb-8">
        {/* Navigation Links */}
        <div className="border-y divide-y">
          {/* Previous Post */}
          {prevPost ? (
            <Link
              href={`/blog/${encodeURIComponent(prevPost.slug)}`}
              className="flex items-center justify-between py-4 group hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors truncate">
                  {prevPost.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="py-4 flex items-center gap-3 text-muted-foreground/30">
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">이전 글이 없습니다</span>
            </div>
          )}

          {/* Next Post */}
          {nextPost ? (
            <Link
              href={`/blog/${encodeURIComponent(nextPost.slug)}`}
              className="flex items-center justify-between py-4 group hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors truncate text-right">
                  {nextPost.title}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </Link>
          ) : (
            <div className="py-4 flex items-center gap-3 justify-end text-muted-foreground/30">
              <span className="text-sm">다음 글이 없습니다</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Back to List Button */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
