import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCurrentSiteId, getHostFromRequest } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await getHostFromRequest()
  const siteId = await getCurrentSiteId()
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  let postsQuery = supabase
    .from('posts')
    .select('id, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (siteId) {
    postsQuery = postsQuery.eq('site_id', siteId)
  }

  const { data: posts } = await postsQuery

  const blogUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

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

  const calculatorPages: MetadataRoute.Sitemap = []
  const guidePages: MetadataRoute.Sitemap = []
  const trendPages: MetadataRoute.Sitemap = []

  if (host.includes('ohyess')) {
    calculatorPages.push(
      {
        url: `${baseUrl}/calculator/loan-interest`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
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
      },
      {
        url: `${baseUrl}/calculator/repayment-burden`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/calculator/rate-change-impact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/calculator/prepayment-comparison`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/calculator/emergency-fund`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }
    )

    guidePages.push(
      {
        url: `${baseUrl}/guide`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/guide/loan-interest`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/dsr-dti-ltv`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/repayment-types`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/early-repayment-fee`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/credit-score`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/loan-checklist`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      }
    )

    trendPages.push(
      {
        url: `${baseUrl}/trend`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/capital-market-shift`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/multi-home-loan`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/capital-gains-tax`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      }
    )
  }

  return [...staticPages, ...guidePages, ...calculatorPages, ...trendPages, ...blogUrls]
}
