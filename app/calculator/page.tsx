import { Calculator, ArrowLeftRight, Target, RotateCcw } from 'lucide-react'
import ToolCard from '@/components/ToolCard'

const CALCULATORS = [
  {
    icon: <Calculator className="w-6 h-6" />,
    title: '대출 이자 계산기',
    description: '대출 금액과 금리를 입력하여 예상 이자를 계산해보세요',
    href: '/calculator/loan-interest'
  },
  {
    icon: <ArrowLeftRight className="w-6 h-6" />,
    title: '원리금 vs 원금균등 비교',
    description: '두 가지 상환 방식의 차이를 한눈에 비교하세요',
    href: '/calculator/repayment-compare'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: '대출 한도 시뮬레이터',
    description: '소득과 조건을 입력하여 예상 대출 한도를 확인하세요',
    href: '/calculator/loan-limit'
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: '중도상환수수료 계산',
    description: '조기 상환 시 발생하는 수수료를 미리 계산하세요',
    href: '/calculator/prepayment-fee'
  }
]

export default function CalculatorPage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 계산기
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          대출, 이자, 상환 관련 계산을 간편하게 해보세요
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {CALCULATORS.map((calculator) => (
          <ToolCard
            key={calculator.href}
            icon={calculator.icon}
            title={calculator.title}
            description={calculator.description}
            href={calculator.href}
          />
        ))}
      </div>
    </div>
  )
}
