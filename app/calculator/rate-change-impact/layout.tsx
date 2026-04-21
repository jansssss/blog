import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '금리 변동 영향 계산기 | 금리 0.1% 오르면 얼마나 달라지나 | ohyess',
  description: '금리가 변동될 때 월 납입액과 총이자가 얼마나 달라지는지 즉시 계산합니다. 변동금리 대출자의 금리 인상 리스크 파악에 유용합니다.',
  keywords: ['금리변동영향계산기', '금리 인상 영향', '변동금리 계산', '금리 오르면 이자', '대출 금리 계산기'],
  openGraph: {
    title: '금리 변동 영향 계산기 — 금리 변화 시 납입액 차이 계산',
    description: '금리 변동 시 월 납입액과 총이자 변화를 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/rate-change-impact',
  },
}

export default function RateChangeImpactLayout({ children }: { children: React.ReactNode }) {
  return children
}
