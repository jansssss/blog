import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Tag, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import EditButton from '@/components/EditButton'
import DeleteButton from '@/components/DeleteButton'
import { getCurrentSiteId, getCurrentSite } from '@/lib/site'
import ArticleToc from '@/components/ArticleToc'
import AdUnit from '@/components/AdUnit'
import RelatedCalculators from '@/components/RelatedCalculators'

// 동적 렌더링 강제 (멀티테넌트 host 헤더 의존 + 최신 데이터 표시)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 본문 prose 스타일 (광고 삽입을 위해 본문을 둘로 나눠도 동일 스타일 적용)
const ARTICLE_PROSE_CLASS = `prose prose-base max-w-none
  prose-headings:font-bold prose-headings:text-gray-900
  prose-h2:text-xl prose-h3:text-lg
  prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-10
  prose-p:text-[15px] prose-p:leading-[1.85] prose-p:text-gray-700
  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
  prose-strong:text-gray-900 prose-strong:font-semibold
  prose-ol:my-4 prose-ol:pl-6
  prose-ul:my-4 prose-ul:pl-6
  prose-li:my-1 prose-li:text-gray-700 prose-li:leading-relaxed
  prose-li:marker:text-blue-500 prose-li:marker:font-semibold
  prose-blockquote:border-l-4 prose-blockquote:border-blue-400
  prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r
  prose-blockquote:text-gray-600 prose-blockquote:not-italic
  prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-600
  prose-pre:bg-gray-900 prose-pre:text-gray-100
  prose-table:text-sm prose-th:bg-gray-100 prose-th:font-semibold
  prose-hr:border-gray-200`

/**
 * 본문 HTML을 중간 H2 경계에서 둘로 분할.
 * 인아티클 광고를 글 정중앙 섹션 사이에 1개만 삽입하기 위함.
 * H2가 2개 미만이면 분할하지 않음(광고 미삽입).
 */
function splitAtMiddleH2(html: string): [string, string] {
  const positions: number[] = []
  const regex = /<h2[\s>]/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    positions.push(match.index)
  }
  if (positions.length < 2) return [html, '']
  const target = positions[Math.floor(positions.length / 2)]
  return [html.slice(0, target), html.slice(target)]
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id: idOrSlug } = await params
  const site = await getCurrentSite()
  const siteId = site?.id
  const siteName = site?.name || '오예스'

  let query = supabase.from('posts').select('*').eq('published', true)
  if (UUID_RE.test(idOrSlug)) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }
  if (siteId) query = query.eq('site_id', siteId)

  const { data: post } = await query.single()

  if (!post) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 게시글이 존재하지 않습니다.',
    }
  }

  const canonicalHost = site?.domain || 'ohyess.kr'
  const canonicalSlug = post.slug || post.id

  return {
    title: `${post.title} | ${siteName}`,
    description: post.summary,
    keywords: post.tags,
    authors: [{ name: siteName }],
    alternates: {
      canonical: `https://${canonicalHost}/blog/${canonicalSlug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      siteName: siteName,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: [siteName],
      tags: post.tags,
      locale: 'ko_KR',
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idOrSlug } = await params
  const siteId = await getCurrentSiteId()

  // slug 또는 UUID로 현재 글 조회
  let postQuery = supabase.from('posts').select('*').eq('published', true)
  if (UUID_RE.test(idOrSlug)) {
    postQuery = postQuery.eq('id', idOrSlug)
  } else {
    postQuery = postQuery.eq('slug', idOrSlug)
  }
  if (siteId) postQuery = postQuery.eq('site_id', siteId)

  // 현재 글 + 사이트 정보를 병렬 조회
  const [{ data: post }, site] = await Promise.all([
    postQuery.single(),
    getCurrentSite(),
  ])

  if (!post) {
    notFound()
  }

  // 이전 글 (slug 포함 조회)
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

  // 다음 글 (slug 포함 조회)
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

  const [{ data: prevPost }, { data: nextPost }] = await Promise.all([
    prevQuery.single(),
    nextQuery.single(),
  ])

  const siteName = site?.name || '오예스'
  const protocol = 'https'
  const host = site?.domain || 'ohyess.kr'
  const baseUrl = `${protocol}://${host}`
  const canonicalSlug = post.slug || post.id

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${canonicalSlug}`,
    },
    ...(post.thumbnail_url && { image: post.thumbnail_url }),
    ...(post.tags?.length && { keywords: post.tags.join(', ') }),
  }

  // slug 있으면 /blog/{slug}, 없으면 /blog/{id} fallback
  const postHref = (p: { id: string; slug?: string | null }) =>
    p.slug ? `/blog/${p.slug}` : `/blog/${p.id}`

  return (
    <div className="container max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Button & Admin Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/blog">
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
        <div className="relative mb-8 h-[360px] w-full overflow-hidden rounded-xl">
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 2-column layout: article + sticky TOC */}
      <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-14 lg:items-start">
        {/* Main Article */}
        <article>
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

            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl leading-snug text-gray-900">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">{post.summary}</p>

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

          {/* Post Content — 중간 H2 사이에 인아티클 광고 1개 삽입.
              data-article-content는 부모 1개에만 두어 목차(ArticleToc)가 모든 헤딩을 스캔하도록 유지 */}
          <div data-article-content className={ARTICLE_PROSE_CLASS}>
            {(() => {
              const [first, second] = splitAtMiddleH2(post.content)
              if (!second) {
                return <div dangerouslySetInnerHTML={{ __html: first }} />
              }
              return (
                <>
                  <div dangerouslySetInnerHTML={{ __html: first }} />
                  <AdUnit
                    slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE}
                    format="fluid"
                    layout="in-article"
                    className="my-8"
                  />
                  <div dangerouslySetInnerHTML={{ __html: second }} />
                </>
              )
            })()}
          </div>

          {/* 본문 하단 광고 (멀티플렉스) */}
          <AdUnit
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM}
            format="autorelaxed"
            className="mt-10"
          />

          {/* 관련 계산기 내부링크 (모든 글 → 고가치 계산기 동선) */}
          <RelatedCalculators />
        </article>

        {/* Sticky TOC Sidebar */}
        <ArticleToc />
      </div>

      {/* Previous/Next Post Navigation */}
      <div className="mt-16 mb-8">
        {/* Navigation Links */}
        <div className="border-y divide-y">
          {/* Previous Post */}
          {prevPost ? (
            <Link
              href={postHref(prevPost)}
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
              href={postHref(nextPost)}
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
          <Link href="/blog">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
