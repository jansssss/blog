import { MetadataRoute } from 'next'
import { getHostFromRequest } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = await getHostFromRequest()
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
