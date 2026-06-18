import Link from 'next/link'
import { Calculator, Percent, Scale, Wallet, ArrowRight } from 'lucide-react'

interface CalcLink {
  href: string
  title: string
  desc: string
  Icon: typeof Calculator
}

// 고의도·에버그린 계산기 — 모든 글에서 내부링크로 연결해 수익 동선 형성
const CALCULATORS: CalcLink[] = [
  {
    href: '/calculator/loan-interest',
    title: '대출이자 계산기',
    desc: '상환방식·금리별 월 납입금과 총이자',
    Icon: Percent,
  },
  {
    href: '/calculator/loan-limit',
    title: '대출한도(DSR) 계산기',
    desc: '소득·기존부채로 가능한 한도 추정',
    Icon: Wallet,
  },
  {
    href: '/calculator/prepayment-fee',
    title: '중도상환수수료 계산기',
    desc: '갈아타기 전 수수료·절감액 비교',
    Icon: Calculator,
  },
  {
    href: '/calculator/repayment-compare',
    title: '상환방식 비교',
    desc: '원리금균등 vs 원금균등 총이자 차이',
    Icon: Scale,
  },
]

/**
 * 블로그 본문 하단에 노출되는 "관련 계산기" 내부링크 섹션.
 * 모든 글 → 고가치 계산기 페이지로 링크를 흘려보내 SEO·수익 동선을 만든다.
 */
export default function RelatedCalculators() {
  return (
    <section className="mt-12 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Calculator className="h-3.5 w-3.5" />
          관련 계산기
        </span>
        <span className="text-sm text-gray-500">직접 내 조건으로 계산해 보세요</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CALCULATORS.map(({ href, title, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-gray-900">{title}</span>
              <span className="block truncate text-xs text-gray-500">{desc}</span>
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-indigo-600" />
          </Link>
        ))}
      </div>
    </section>
  )
}
