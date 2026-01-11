'use client'

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // 초기 상태 설정
    const adminStatus = localStorage.getItem('isAdmin')
    setIsAdmin(adminStatus === 'true')

    // storage 이벤트 리스너 (로그아웃 감지)
    const handleStorageChange = () => {
      const adminStatus = localStorage.getItem('isAdmin')
      setIsAdmin(adminStatus === 'true')
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="group flex items-center" onClick={closeMobileMenu}>
          <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
            ohyess
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            홈
          </Link>
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
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={closeMobileMenu}
            >
              홈
            </Link>
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
          </nav>
        </div>
      )}
    </header>
  )
}
