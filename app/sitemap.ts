import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getCurrentSiteId, getHostFromRequest } from '@/lib/site'

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

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
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
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  const calculatorPages: MetadataRoute.Sitemap = []
  const guidePages: MetadataRoute.Sitemap = []
  const hubPages: MetadataRoute.Sitemap = []
  const trendPages: MetadataRoute.Sitemap = []
  const comparePages: MetadataRoute.Sitemap = []
  const policyPages: MetadataRoute.Sitemap = []
  const toolPages: MetadataRoute.Sitemap = []

  if (isOhyess) {
    calculatorPages.push(
      {
        url: `${baseUrl}/calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
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
      },
      {
        url: `${baseUrl}/calculator/refinancing`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/calculator/dsr-dti-ltv`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      }
    )

    hubPages.push({
      url: `${baseUrl}/hub/mortgage-preparation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })

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
      },
      {
        url: `${baseUrl}/guide/jeonse-loan`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/loan-guarantee`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/loan-rejection`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/loan-types-complete`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/mortgage-loan`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/rate-strategy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/car-loan-dsr-impact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/ltv-ok-dsr-blocked`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/mortgage-salary-5000`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/guide/rate-0p5-difference`,
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
      },
      {
        url: `${baseUrl}/trend/us-iran-oil`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/trend/israel-iran-war`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/oil-shock-korea-strategy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/kospi-7800`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/kospi-8300-ai-oil-investment`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trend/kospi-black-friday-june-2026`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      }
    )

    comparePages.push(
      {
        url: `${baseUrl}/compare`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/compare/bank-rates`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/compare/fixed-vs-variable`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/compare/loan-products`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/compare/policy-loans`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    )

    policyPages.push(
      {
        url: `${baseUrl}/policy`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/policy/housing`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/policy/youth`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/policy/small-business`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/policy/sme`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    )

  }

  return [...staticPages, ...hubPages, ...guidePages, ...calculatorPages, ...trendPages, ...comparePages, ...policyPages, ...toolPages, ...blogUrls]
}
