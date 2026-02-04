'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteTheme } from '@/lib/site'

interface FooterProps {
  siteTheme?: SiteTheme
  siteName?: string
}

export default function Footer({ siteTheme, siteName }: FooterProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  // 테마에서 값 추출
  const footerLinks = siteTheme?.footer?.links || [
    { label: '소개', href: '/about' },
    { label: '편집정책', href: '/editorial-policy' },
    { label: '문의하기', href: '/contact' },
    { label: '개인정보처리방침', href: '/privacy' },
    { label: '이용약관', href: '/terms' }
  ]
  const disclaimer = siteTheme?.footer?.disclaimer || '⚠️ 본 사이트는 금융 상품 판매를 하지 않으며, 일반 정보 제공을 목적으로 운영됩니다.'
  const copyright = siteTheme?.footer?.copyright || `© 2026 ${siteName?.toUpperCase() || 'OHYESS'}. All rights reserved.`
  const builtWith = siteTheme?.footer?.builtWith || 'Built with Next.js & Supabase'
  const adminEnabled = siteTheme?.features?.adminEnabled ?? true

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin')
    setIsAdmin(adminStatus === 'true')

    const handleStorageChange = () => {
      const adminStatus = localStorage.getItem('isAdmin')
      setIsAdmin(adminStatus === 'true')
    }

    const handleLoginStateChange = () => {
      const adminStatus = localStorage.getItem('isAdmin')
      setIsAdmin(adminStatus === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('loginStateChange', handleLoginStateChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('loginStateChange', handleLoginStateChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    window.dispatchEvent(new Event('loginStateChange'))
    window.location.href = '/'
  }

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

            {/* 관리자 메뉴 */}
            {adminEnabled && (
              <>
                <span className="flex items-center gap-4">
                  <span className="text-gray-300">|</span>
                  {!isAdmin ? (
                    <Link
                      href="/admin/login"
                      className="text-gray-500 hover:text-gray-900 transition-colors text-xs"
                    >
                      관리자
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/admin/editor"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        새 글쓰기
                      </Link>
                    </>
                  )}
                </span>
                {isAdmin && (
                  <>
                    <span className="flex items-center gap-4">
                      <span className="text-gray-300">|</span>
                      <Link
                        href="/admin/news"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        뉴스 관리
                      </Link>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="text-gray-300">|</span>
                      <Link
                        href="/admin/drafts"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        초안 관리
                      </Link>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="text-gray-300">|</span>
                      <Link
                        href="/admin/posts"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        글 관리
                      </Link>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        로그아웃
                      </button>
                    </span>
                  </>
                )}
              </>
            )}
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
