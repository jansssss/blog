import { TrendingUp, FileText, GitCompare, Landmark } from 'lucide-react'
import Link from 'next/link'

const COMPARISONS = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: '은행별 금리 비교',
    description: '주요 은행들의 대출 금리를 한눈에 비교해보세요',
    href: '/compare/bank-rates'
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: '대출 상품 비교',
    description: '다양한 대출 상품의 조건과 금리를 비교하세요',
    href: '/compare/loan-products'
  },
  {
    icon: <GitCompare className="w-5 h-5" />,
    title: '고정금리 vs 변동금리',
    description: '두 가지 금리 유형의 장단점을 비교해보세요',
    href: '/compare/fixed-vs-variable'
  },
  {
    icon: <Landmark className="w-5 h-5" />,
    title: '정책자금 비교',
    description: '정부 및 공공기관의 정책자금을 비교하세요',
    href: '/compare/policy-loans'
  }
]

export default function ComparePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-100/60 px-8 py-12 text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-5">
          4가지 금융 비교
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">금융 비교</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">은행별·상품별 금리와 조건을 직접 비교하세요</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {COMPARISONS.map((item) => (
          <Link key={item.href} href={item.href} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
              {item.icon}
            </div>
            <p className="font-semibold text-sm text-gray-900 leading-snug mb-1">{item.title}</p>
            <p className="text-xs text-gray-400 hidden sm:block leading-relaxed">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-8">금리 정보는 참고용이며, 실제 금리는 금융기관 및 개인 신용도에 따라 다릅니다.</p>
    </div>
  )
}
