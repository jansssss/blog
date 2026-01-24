'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

// 경로별 한글 레이블 매핑
const PATH_LABELS: Record<string, string> = {
  // 메인 카테고리
  'calculator': '계산기',
  'compare': '금융 비교',
  'policy': '정책 지원',
  'guide': '가이드',
  'tools': '보험 도구',
  'about': '소개',

  // 계산기 하위
  'loan-interest': '대출 이자 계산기',
  'repayment-compare': '원리금 vs 원금균등 비교',
  'loan-limit': '대출 한도 시뮬레이터',
  'prepayment-fee': '중도상환수수료 계산',

  // 비교 하위
  'bank-rates': '은행별 금리 비교',
  'loan-products': '대출 상품 비교',
  'fixed-vs-variable': '고정금리 vs 변동금리',
  'policy-loans': '정책자금 비교',

  // 정책 하위
  'youth': '청년 금융 지원',
  'small-business': '소상공인·자영업자 지원',
  'sme': '중소기업 정책자금',
  'housing': '주거 지원',

  // 보험 도구 하위
  'auto-discount-check': '자동차보험 할인 체크',
  'health-overlap-check': '실비보험 중복 체크',
  'insurance-remodel': '보험 리모델링 체크',
}

export default function Breadcrumb() {
  const pathname = usePathname()

  // 홈페이지면 표시하지 않음
  if (pathname === '/') return null

  // 관리자 페이지는 표시하지 않음
  if (pathname.startsWith('/admin')) return null

  // 경로를 세그먼트로 분리
  const segments = pathname.split('/').filter(Boolean)

  // 브레드크럼 아이템 생성
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = PATH_LABELS[segment] || segment
    const isLast = index === segments.length - 1

    return {
      href,
      label,
      isLast
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b">
      <div className="container py-3">
        <ol className="flex items-center flex-wrap gap-1 text-sm">
          {/* 홈 */}
          <li>
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">홈</span>
            </Link>
          </li>

          {/* 경로 세그먼트들 */}
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              {crumb.isLast ? (
                <span className="font-medium text-gray-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
