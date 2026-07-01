import { Metadata } from 'next'
import { Calculator, ArrowLeftRight, Target, RotateCcw, DollarSign, Activity, Scale, Shield, RefreshCcw, PieChart } from 'lucide-react'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '금융 계산기 모음 | 대출이자·DSR·중도상환·갈아타기 즉시 계산 | ohyess',
  description: '대출이자, DSR/DTI/LTV, 중도상환수수료, 대출 갈아타기, 상환방식 비교 등 10가지 무료 금융 계산기를 슬라이더로 즉시 계산하세요. 버튼 없이 실시간 결과 확인.',
  keywords: ['금융 계산기', '대출 계산기', 'dsr 계산기', '이자 계산기', '중도상환 계산기', '대출 갈아타기 계산기', '상환 계산기'],
  openGraph: {
    title: '금융 계산기 모음 — 대출이자·DSR·갈아타기 즉시 계산',
    description: '10가지 무료 금융 계산기. 슬라이더 조작으로 대출이자, DSR, 중도상환수수료를 실시간 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator',
  },
}

const CALCULATORS = [
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    title: '대출 갈아타기 손익',
    description: '수수료 차감 후 실제 절감액 계산',
    href: '/calculator/refinancing',
  },
  {
    icon: <PieChart className="w-5 h-5" />,
    title: 'DSR DTI LTV 계산기',
    description: '내 비율 즉시 확인 · 규제 한도 비교',
    href: '/calculator/dsr-dti-ltv',
  },
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

const indexJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      name: '금융 계산기 모음',
      description: '대출이자·DSR·중도상환·갈아타기 등 10가지 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator',
      numberOfItems: 10,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '대출 갈아타기 손익 계산기', url: 'https://www.ohyess.kr/calculator/refinancing' },
        { '@type': 'ListItem', position: 2, name: 'DSR DTI LTV 계산기', url: 'https://www.ohyess.kr/calculator/dsr-dti-ltv' },
        { '@type': 'ListItem', position: 3, name: '대출 이자 계산기', url: 'https://www.ohyess.kr/calculator/loan-interest' },
        { '@type': 'ListItem', position: 4, name: '원리금 vs 원금균등 비교 계산기', url: 'https://www.ohyess.kr/calculator/repayment-compare' },
        { '@type': 'ListItem', position: 5, name: '대출 한도 시뮬레이터', url: 'https://www.ohyess.kr/calculator/loan-limit' },
        { '@type': 'ListItem', position: 6, name: '중도상환수수료 계산기', url: 'https://www.ohyess.kr/calculator/prepayment-fee' },
        { '@type': 'ListItem', position: 7, name: '월 상환 부담 체감 계산기', url: 'https://www.ohyess.kr/calculator/repayment-burden' },
        { '@type': 'ListItem', position: 8, name: '금리 변동 영향 계산기', url: 'https://www.ohyess.kr/calculator/rate-change-impact' },
        { '@type': 'ListItem', position: 9, name: '중도상환 vs 유지 비교 계산기', url: 'https://www.ohyess.kr/calculator/prepayment-comparison' },
        { '@type': 'ListItem', position: 10, name: '비상자금 필요 금액 계산기', url: 'https://www.ohyess.kr/calculator/emergency-fund' },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
      ],
    },
  ],
}

export default function CalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <JsonLd data={indexJsonLd} />

      {/* Hero Section */}
      <div className="rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-100/60 px-8 py-12 text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-5">
          10가지 무료 계산기
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
