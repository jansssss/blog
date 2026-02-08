import type { Metadata } from 'next'
import { Inter, Sacramento } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { getCurrentSite } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })
const sacramento = Sacramento({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sacramento'
})

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite()
  const theme = site?.theme_json

  // 테마에서 메타 정보 추출
  const title = theme?.meta?.defaultTitle || site?.description || '모두를 위한 생활정보, 금융 정보 사이트'
  const description = theme?.meta?.defaultDescription || site?.description || title
  const siteName = theme?.meta?.siteName || site?.name || 'ohyess'
  const keywords = theme?.meta?.keywords || ['사이트', 'Next.js', 'Supabase', '재테크', '개발']
  const ogImage = theme?.meta?.ogImage

  // 사이트별 파비콘 설정
  const isSureline = siteName?.toLowerCase().includes('sureline') || siteName?.includes('슈어라인')
  const faviconSvg = isSureline ? '/sureline-favicon.svg' : '/ohyess-favicon.svg'

  return {
    title,
    description,
    keywords,
    authors: [{ name: siteName }],
    icons: {
      icon: [
        { url: faviconSvg, type: 'image/svg+xml' },
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      title: siteName,
      description,
      siteName,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 현재 사이트 정보 조회
  const site = await getCurrentSite()

  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6676446565175753"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${sacramento.variable} overflow-x-hidden`}>
        <div className="relative flex min-h-screen flex-col">
          <Header
            siteTheme={site?.theme_json}
            siteName={site?.name}
            isMainSite={site?.is_main ?? true}
          />
          <Breadcrumb />
          <main className="flex-1">{children}</main>
          <Footer
            siteTheme={site?.theme_json}
            siteName={site?.name}
          />
        </div>
      </body>
    </html>
  )
}
