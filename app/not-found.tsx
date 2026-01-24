import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container max-w-2xl py-20">
      <div className="text-center">
        {/* 404 아이콘 */}
        <div className="mb-8">
          <span className="text-8xl font-bold text-gray-200">404</span>
        </div>

        {/* 메시지 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
          <br />
          주소를 다시 확인하시거나 아래 버튼을 이용해 주세요.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              홈으로 이동
            </Button>
          </Link>
          <Link href="/guide">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              가이드 보기
            </Button>
          </Link>
        </div>

        {/* 도움말 */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg text-left">
          <h2 className="font-semibold text-gray-900 mb-3">이런 경우일 수 있습니다</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>URL 주소가 잘못 입력되었습니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>해당 게시글이 삭제되었거나 비공개로 전환되었습니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>페이지 주소가 변경되었습니다</span>
            </li>
          </ul>
        </div>

        {/* 문의 안내 */}
        <p className="mt-8 text-sm text-gray-500">
          계속 문제가 발생하면{' '}
          <Link href="/contact" className="text-primary hover:underline">
            문의하기
          </Link>
          를 통해 알려주세요.
        </p>
      </div>
    </div>
  )
}
