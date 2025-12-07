import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">we Blog</span>
        </Link>

        <nav className="ml-auto flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            홈
          </Link>
          <Link
            href="/admin/login"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            관리자
          </Link>
        </nav>
      </div>
    </header>
  )
}
