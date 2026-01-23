import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  category?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  category
}: PaginationProps) {
  // 페이지네이션 버튼 생성 로직
  const getPageNumbers = () => {
    const maxVisiblePages = 7 // 데스크톱에서 표시할 최대 페이지 수
    const pages: (number | string)[] = []

    if (totalPages <= maxVisiblePages) {
      // 총 페이지가 적으면 모두 표시
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 항상 첫 페이지 표시
    pages.push(1)

    // 현재 페이지 주변 페이지 계산
    const startPage = Math.max(2, currentPage - 2)
    const endPage = Math.min(totalPages - 1, currentPage + 2)

    // 첫 페이지와 시작 페이지 사이에 생략 표시
    if (startPage > 2) {
      pages.push('...')
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // 끝 페이지와 마지막 페이지 사이에 생략 표시
    if (endPage < totalPages - 1) {
      pages.push('...')
    }

    // 항상 마지막 페이지 표시
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  // URL 생성 헬퍼 함수
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (category) {
      params.set('category', category)
    }
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
      {/* 이전 버튼 */}
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)}>
          <Button variant="outline" size="sm">
            이전
          </Button>
        </Link>
      )}

      {/* 페이지 번호 */}
      <div className="flex gap-1 flex-wrap justify-center">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            )
          }

          return (
            <Link key={page} href={buildUrl(page as number)}>
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className="min-w-[40px]"
              >
                {page}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* 다음 버튼 */}
      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)}>
          <Button variant="outline" size="sm">
            다음
          </Button>
        </Link>
      )}
    </div>
  )
}
