import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '모두를 위한 생활정보, 금융, AI 정보 블로그',
  description: '모두를 위한 생활정보, 금융, AI 정보 블로그',
  keywords: ['블로그', 'Next.js', 'Supabase', 'CMS', 'AI', '재테크', '개발'],
  authors: [{ name: 'CMS Blog' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: 'CMS Blog',
    description: '모두를 위한 생활정보, 금융, AI 정보 블로그',
    siteName: 'CMS Blog',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
