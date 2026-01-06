import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Tag, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import EditButton from '@/components/EditButton'
import DeleteButton from '@/components/DeleteButton'

// 동적 렌더링 강제 (항상 최신 데이터 표시)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = await params
  // URL 디코딩 (한글 slug 지원)
  const slug = decodeURIComponent(encodedSlug)

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

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

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) {
    notFound()
  }

  // 이전 글 (현재 글보다 이전에 발행된 글 중 가장 최근 글)
  const { data: prevPost } = await supabase
    .from('posts')
    .select('id, title, slug')
    .eq('published', true)
    .lt('published_at', post.published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  // 다음 글 (현재 글보다 이후에 발행된 글 중 가장 오래된 글)
  const { data: nextPost } = await supabase
    .from('posts')
    .select('id, title, slug')
    .eq('published', true)
    .gt('published_at', post.published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .single()

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
      <div className="mt-12 pt-8 border-t">
        <div className="flex flex-col gap-3">
          {/* Previous Post */}
          {prevPost ? (
            <Link
              href={`/blog/${encodeURIComponent(prevPost.slug)}`}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">이전 글</p>
                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                  {prevPost.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 py-2 px-3 text-muted-foreground/50">
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">이전 글이 없습니다</p>
            </div>
          )}

          {/* Back to List */}
          <div className="text-center py-2">
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* Next Post */}
          {nextPost ? (
            <Link
              href={`/blog/${encodeURIComponent(nextPost.slug)}`}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">다음 글</p>
                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                  {nextPost.title}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 py-2 px-3 text-muted-foreground/50">
              <p className="text-sm flex-1">다음 글이 없습니다</p>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
