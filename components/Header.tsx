'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import LogoutButton from './LogoutButton'
import { useEffect, useState } from 'react'

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false)

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <BookOpen className="h-7 w-7 text-violet-600 transition-transform group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 h-7 w-7 bg-violet-600 opacity-20 blur-md transition-opacity group-hover:opacity-40"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">
            special
          </span>
        </Link>

        <nav className="ml-auto flex items-center space-x-6">
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
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
