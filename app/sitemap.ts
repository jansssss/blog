import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCurrentSiteId, getHostFromRequest } from '@/lib/site'
import { COMMON_ROUTES, OHYESS_ROUTES, toSitemapEntries } from '@/lib/sitemap-routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await getHostFromRequest()
  const siteId = await getCurrentSiteId()
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  // ohyess.kr 사이트: www/non-www/Vercel preview 무관하게 canonical을 www로 통일
  const normalizedHost = host.toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '')
  const isOhyess = normalizedHost === 'ohyess.kr'
  const baseUrl = isOhyess ? 'https://www.ohyess.kr' : `${protocol}://${host}`

  let postsQuery = supabase
    .from('posts')
    .select('id, slug, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (siteId) {
    postsQuery = postsQuery.eq('site_id', siteId)
  }

  const { data: posts } = await postsQuery

  const blogUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug || post.id}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 정적 라우트는 lib/sitemap-routes.ts가 단일 출처.
  // 새 페이지를 추가하면 그 파일에도 등록해야 하며, `npm run check:sitemap`이 누락을 잡는다.
  const staticUrls = toSitemapEntries(
    baseUrl,
    isOhyess ? [...COMMON_ROUTES, ...OHYESS_ROUTES] : COMMON_ROUTES
  )

  return [...staticUrls, ...blogUrls]
}
