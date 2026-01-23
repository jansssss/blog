import Link from 'next/link'
import { Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlaceholderContentProps {
  title?: string
  message?: string
}

export default function PlaceholderContent({
  title = '준비 중입니다',
  message = '현재 이 페이지는 준비 중입니다. 곧 만나보실 수 있습니다.'
}: PlaceholderContentProps) {
  return (
    <div className="container py-16 md:py-24">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="rounded-full bg-gray-100 p-6">
          <Construction className="w-12 h-12 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 max-w-md">
            {message}
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" className="mt-4">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}
