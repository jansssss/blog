import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('published', true)

  return posts?.map((post) => ({
    slug: post.slug,
  })) || []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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
  const { slug } = await params
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <article className="container py-10">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로
        </Button>
      </Link>

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

      {/* AdSense Top */}
      <div className="mb-8 rounded-lg border-2 border-dashed border-muted p-4 text-center">
        <p className="text-xs text-muted-foreground">광고 영역 (상단)</p>
      </div>

      {/* Post Content */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* AdSense Middle */}
      <div className="my-8 rounded-lg border-2 border-dashed border-muted p-4 text-center">
        <p className="text-xs text-muted-foreground">광고 영역 (중간)</p>
      </div>

      {/* Related Posts / CTA could go here */}

      {/* AdSense Bottom */}
      <div className="mt-8 rounded-lg border-2 border-dashed border-muted p-4 text-center">
        <p className="text-xs text-muted-foreground">광고 영역 (하단)</p>
      </div>

      {/* Back to List */}
      <div className="mt-12 text-center">
        <Link href="/">
          <Button size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </article>
  )
}
