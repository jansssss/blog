import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const robotsContent = `# robots.txt

User-agent: *
Disallow: /private/
Disallow: /admin/
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
