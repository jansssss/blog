import Link from 'next/link'
import { SiteTheme } from '@/lib/site'

interface FooterProps {
  siteTheme?: SiteTheme
  siteName?: string
}

export default function Footer({ siteTheme, siteName }: FooterProps) {
  // 테마에서 값 추출
  const footerLinks = siteTheme?.footer?.links || [
    { label: '사이트 소개', href: '/about' },
    { label: '문의하기', href: '/contact' },
    { label: '개인정보처리방침', href: '/privacy' },
    { label: '이용약관', href: '/terms' }
  ]
  const disclaimer = siteTheme?.footer?.disclaimer || '⚠️ 본 사이트는 금융 상품 판매를 하지 않으며, 일반 정보 제공을 목적으로 운영됩니다.'
  const copyright = siteTheme?.footer?.copyright || `© 2026 ${siteName?.toUpperCase() || 'OHYESS'}. All rights reserved.`
  const builtWith = siteTheme?.footer?.builtWith || 'Built with Next.js & Supabase'

  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          {/* 링크 섹션 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {footerLinks.map((link, idx) => (
              <span key={idx} className="flex items-center gap-4">
                {idx > 0 && <span className="text-gray-300">|</span>}
                <Link
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>

          {/* 고지사항 */}
          {disclaimer && (
            <div className="flex flex-col items-center gap-3">
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-center text-sm text-blue-800">
                  {disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* 하단 정보 */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-gray-600">
              {copyright}
            </p>
            {builtWith && (
              <p className="text-center text-xs text-gray-500">
                {builtWith}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
