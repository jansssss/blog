import { Calculator, ArrowLeftRight, Target, RotateCcw, DollarSign, Activity, Scale, Shield } from 'lucide-react'
import Link from 'next/link'

const CALCULATORS = [
  {
    icon: <Calculator className="w-5 h-5" />,
    title: '대출 이자 계산기',
    description: '금액·금리로 예상 이자 계산',
    href: '/calculator/loan-interest'
  },
  {
    icon: <ArrowLeftRight className="w-5 h-5" />,
    title: '원리금 vs 원금균등',
    description: '두 상환 방식 한눈에 비교',
    href: '/calculator/repayment-compare'
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: '대출 한도 시뮬레이터',
    description: '소득 기반 예상 한도 확인',
    href: '/calculator/loan-limit'
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: '중도상환수수료',
    description: '조기 상환 수수료 미리 계산',
    href: '/calculator/prepayment-fee'
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: '월 상환 부담 체감',
    description: '소득 대비 상환액 비율 확인',
    href: '/calculator/repayment-burden'
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: '금리 변동 영향',
    description: '금리 변화에 따른 상환액 변화',
    href: '/calculator/rate-change-impact'
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: '중도상환 vs 유지',
    description: '이자 절감액과 수수료 비교',
    href: '/calculator/prepayment-comparison'
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: '비상자금 필요 금액',
    description: '3·6개월 권장 비상자금 산출',
    href: '/calculator/emergency-fund'
  }
]

export default function CalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Hero Section */}
      <div className="rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-100/60 px-8 py-12 text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-5">
          8가지 무료 계산기
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          금융 계산기
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          대출·이자·상환을 숫자로 먼저 확인하세요
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
              {calc.icon}
            </div>
            <p className="font-semibold text-sm text-gray-900 leading-snug mb-1">{calc.title}</p>
            <p className="text-xs text-gray-400 hidden sm:block leading-relaxed">{calc.description}</p>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-8">
        계산 결과는 참고용이며, 실제 대출 조건은 금융기관마다 다를 수 있습니다.
      </p>

    </div>
  )
}
