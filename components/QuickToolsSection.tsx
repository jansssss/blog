'use client'

import { Calculator, ArrowLeftRight, Target, RotateCcw } from 'lucide-react'
import ToolCard from './ToolCard'

const QUICK_TOOLS = [
  {
    icon: <Calculator className="w-6 h-6" />,
    title: '대출 이자 계산기',
    description: '대출 금액과 금리로 예상 이자를 계산해보세요',
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
    description: '소득과 조건을 입력하여 예상 한도를 확인하세요',
    href: '/calculator/loan-limit'
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: '중도상환수수료 계산',
    description: '조기 상환 시 발생하는 수수료를 미리 계산하세요',
    href: '/calculator/prepayment-fee'
  }
]

export default function QuickToolsSection() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">빠른 도구 바로가기</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_TOOLS.map((tool) => (
          <ToolCard
            key={tool.href}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>
    </section>
  )
}
