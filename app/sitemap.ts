import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCurrentSiteId, getHostFromRequest } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 현재 도메인 및 사이트 ID 가져오기
  const host = await getHostFromRequest()
  const siteId = await getCurrentSiteId()
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  // 블로그 글 목록 가져오기 (현재 사이트만)
  let postsQuery = supabase
    .from('posts')
    .select('id, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (siteId) {
    postsQuery = postsQuery.eq('site_id', siteId)
  }

  const { data: posts } = await postsQuery

  // 블로그 글 URL 생성
  const blogUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 정적 페이지 URL (모든 사이트 공통)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 계산기 페이지 URL (ohyess.kr 전용)
  const calculatorPages: MetadataRoute.Sitemap = []

  // ohyess.kr인 경우에만 계산기 페이지 추가
  if (host.includes('ohyess')) {
    calculatorPages.push(
      {
        url: `${baseUrl}/calculator/loan-interest`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/calculator/loan-limit`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/calculator/prepayment-fee`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/calculator/repayment-compare`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    )
  }

  // 모든 URL 합치기
  return [...staticPages, ...calculatorPages, ...blogUrls]
}
