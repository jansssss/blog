import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '중도상환 vs 유지 비교 계산기 | 어떤 선택이 유리한가 | ohyess',
  description: '중도상환과 대출 유지 중 어떤 선택이 이득인지 계산합니다. 수수료 차감 후 절감 이자와 투자 기회비용을 비교해 최적 결정을 도와드립니다.',
  keywords: ['중도상환 비교', '중도상환 vs 유지', '대출 중도상환 계산', '기회비용 계산', '대출 계산기'],
  openGraph: {
    title: '중도상환 vs 유지 비교 계산기 — 최적 선택 계산',
    description: '중도상환과 대출 유지 중 수수료·이자 절감·기회비용을 고려한 최적 선택을 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/prepayment-comparison',
  },
}

export default function PrepaymentComparisonLayout({ children }: { children: React.ReactNode }) {
  return children
}
