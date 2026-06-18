import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대출 갈아타기 계산기 | 수수료 제하고 실제 절감액 계산 | ohyess',
  description: '현재 대출 금리와 신규 금리를 입력하면 중도상환수수료·이전비용을 차감한 실제 절감액과 손익분기점을 즉시 계산합니다. 갈아타기 할지 말지 숫자로 판단하세요.',
  keywords: ['대출갈아타기', '대출 갈아타기 계산기', '대환대출 계산기', '갈아타기 손익', '중도상환수수료 계산', '금리 갈아타기'],
  openGraph: {
    title: '대출 갈아타기 계산기 — 수수료 차감 후 실제 절감액',
    description: '금리 차이와 수수료를 함께 계산해 갈아타기 실제 손익을 즉시 확인합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/refinancing',
  },
}

export default function RefinancingLayout({ children }: { children: React.ReactNode }) {
  return children
}
