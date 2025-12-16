import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          {/* 링크 섹션 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              사이트 소개
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              문의하기
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              개인정보처리방침
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              이용약관
            </Link>
          </div>

          {/* 하단 정보 */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-gray-600">
              © 2025 we Blog. by pjs All rights reserved.
            </p>
            <p className="text-center text-xs text-gray-500">
              Built with Next.js & Supabase
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
