import { Calculator, ArrowLeftRight, Target, RotateCcw, TrendingUp, FileText, Info, CheckCircle2, DollarSign, Activity, Scale, Shield } from 'lucide-react'
import Link from 'next/link'
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
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: '월 상환 부담 체감 계산기',
    description: '월 소득 대비 대출 상환액 비율을 확인하세요',
    href: '/calculator/repayment-burden'
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: '금리 변동 영향 계산기',
    description: '금리 변화에 따른 상환액 변화를 미리 확인하세요',
    href: '/calculator/rate-change-impact'
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: '중도상환 vs 유지 비교',
    description: '중도상환 시 이자 절감액과 수수료를 비교하세요',
    href: '/calculator/prepayment-comparison'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: '비상자금 필요 금액',
    description: '3개월 / 6개월 권장 비상자금을 확인하세요',
    href: '/calculator/emergency-fund'
  }
]

const QUICK_TIPS = [
  {
    title: '원리금균등 vs 원금균등',
    description: '원리금균등은 매월 동일한 금액, 원금균등은 초기 부담이 크지만 총 이자가 적습니다.'
  },
  {
    title: 'DSR 규제란?',
    description: '연간 소득 대비 모든 대출의 원리금 상환액 비율. 40~50%를 넘으면 대출이 제한됩니다.'
  },
  {
    title: '중도상환수수료',
    description: '대출 후 3년 이내 조기 상환 시 발생. 시간이 지날수록 감소합니다.'
  }
]

export default function CalculatorPage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Calculator className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 계산기
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          대출, 이자, 상환 관련 계산을 간편하게 해보세요
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-16">
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

      {/* 데스크톱용 추가 콘텐츠 */}
      <div className="max-w-6xl mx-auto">
        {/* 두 컬럼 레이아웃 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 빠른 팁 */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              알아두면 좋은 금융 상식
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {QUICK_TIPS.map((tip, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-5 border">
                  <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>

            {/* 계산 가이드 */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                대출 계산 시 체크포인트
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>금리는 고정/변동, 단리/복리 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>대출 실행 수수료, 인지세 별도 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>중도상환수수료 면제 여부 확인</span>
                  </li>
                </ul>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>DTI/DSR 규제 적용 여부</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>우대금리 조건 및 유지 요건</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>총 부채 현황 (기존 대출 포함)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 오른쪽: 관련 링크 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              함께 보면 좋은 정보
            </h2>
            <div className="space-y-3">
              <Link
                href="/compare/bank-rates"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">은행별 금리 비교</p>
                    <p className="text-xs text-gray-500">주요 은행 금리 한눈에</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/compare/fixed-vs-variable"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowLeftRight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">고정 vs 변동금리</p>
                    <p className="text-xs text-gray-500">금리 유형별 장단점</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/compare/policy-loans"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">정책자금 비교</p>
                    <p className="text-xs text-gray-500">저금리 정부 지원 대출</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/guide"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">가이드</p>
                    <p className="text-xs text-gray-500">금융 관련 정보 모음</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* 면책 */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                ⚠️ 계산 결과는 참고용이며, 실제 대출 조건은 금융기관마다 다를 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
