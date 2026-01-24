'use client'

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SiteTheme } from '@/lib/site'

interface HeaderProps {
  siteTheme?: SiteTheme
  siteName?: string
  isMainSite?: boolean
}

export default function Header({ siteTheme, siteName, isMainSite = true }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 테마에서 값 추출
  const headerTitle = siteTheme?.header?.title || siteName || 'ohyess'
  const primaryColor = siteTheme?.brand?.primaryColor || '#111827'
  const accentColor = siteTheme?.brand?.accentColor || '#2563EB'
  const adminEnabled = siteTheme?.features?.adminEnabled ?? isMainSite

  // 사이트별 기본 네비게이션 링크
  const defaultLinks: Array<{ label: string; href: string; requiresAdmin?: boolean }> = siteName?.toLowerCase() === 'sureline'
    ? [
        { label: '보험 도구', href: '/tools/auto-discount-check' },
        { label: '가이드', href: '/guide' },
        { label: '소개', href: '/about' },
      ]
    : [
        { label: '계산기', href: '/calculator' },
        { label: '가이드', href: '/guide' },
        { label: '소개', href: '/about' },
      ]

  const topLinks = siteTheme?.header?.topLinks?.length
    ? siteTheme.header.topLinks
    : defaultLinks

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

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // 링크 필터링: requiresAdmin이 true인 링크는 로그인 상태에서만 표시
  const filteredTopLinks = topLinks.filter(link => {
    if (link.requiresAdmin) {
      return adminEnabled && isAdmin
    }
    return true
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="group flex items-center" onClick={closeMobileMenu}>
          <span
            className="text-xl sm:text-2xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {headerTitle}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-6">
          {filteredTopLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          {/* 관리자 기능 (adminEnabled + 로그인 상태) */}
          {adminEnabled && (
            <>
              {!isAdmin ? (
                <Link
                  href="/admin/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  관리자
                </Link>
              ) : (
                <>
                  <Link
                    href="/admin/editor"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    새 글쓰기
                  </Link>
                  <Link
                    href="/admin/news"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    뉴스 관리
                  </Link>
                  <Link
                    href="/admin/drafts"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    초안 관리
                  </Link>
                  <LogoutButton />
                </>
              )}
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="ml-auto md:hidden p-2 hover:bg-accent rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col space-y-3">
            {filteredTopLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary py-2"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}

            {/* 관리자 기능 (모바일) */}
            {adminEnabled && (
              <>
                {!isAdmin ? (
                  <Link
                    href="/admin/login"
                    className="text-sm font-medium transition-colors hover:text-primary py-2"
                    onClick={closeMobileMenu}
                  >
                    관리자
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/admin/editor"
                      className="text-sm font-medium transition-colors hover:text-primary py-2"
                      onClick={closeMobileMenu}
                    >
                      새 글쓰기
                    </Link>
                    <Link
                      href="/admin/news"
                      className="text-sm font-medium transition-colors hover:text-primary py-2"
                      onClick={closeMobileMenu}
                    >
                      뉴스 관리
                    </Link>
                    <Link
                      href="/admin/drafts"
                      className="text-sm font-medium transition-colors hover:text-primary py-2"
                      onClick={closeMobileMenu}
                    >
                      초안 관리
                    </Link>
                    <div onClick={closeMobileMenu}>
                      <LogoutButton />
                    </div>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
