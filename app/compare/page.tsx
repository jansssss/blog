import { TrendingUp, FileText, GitCompare, Landmark } from 'lucide-react'
import ToolCard from '@/components/ToolCard'

const COMPARISONS = [
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: '은행별 금리 비교',
    description: '주요 은행들의 대출 금리를 한눈에 비교해보세요',
    href: '/compare/bank-rates'
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: '대출 상품 비교',
    description: '다양한 대출 상품의 조건과 금리를 비교하세요',
    href: '/compare/loan-products'
  },
  {
    icon: <GitCompare className="w-6 h-6" />,
    title: '고정금리 vs 변동금리',
    description: '두 가지 금리 유형의 장단점을 비교해보세요',
    href: '/compare/fixed-vs-variable'
  },
  {
    icon: <Landmark className="w-6 h-6" />,
    title: '정책자금 비교',
    description: '정부 및 공공기관의 정책자금을 비교하세요',
    href: '/compare/policy-loans'
  }
]

export default function ComparePage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 상품 비교
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          은행별, 상품별 금리와 조건을 한눈에 비교하세요
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {COMPARISONS.map((comparison) => (
          <ToolCard
            key={comparison.href}
            icon={comparison.icon}
            title={comparison.title}
            description={comparison.description}
            href={comparison.href}
          />
        ))}
      </div>
    </div>
  )
}
