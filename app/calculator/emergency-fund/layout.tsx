import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '비상자금 필요 금액 계산기 | 적정 비상금 규모 계산 | ohyess',
  description: '월 필수 지출과 가족 상황을 입력하면 적정 비상자금 규모를 계산합니다. 직장인·자영업자·프리랜서별 권장 비상금 기준도 확인하세요.',
  keywords: ['비상자금계산기', '비상금 계산', '비상금 얼마', '적정 비상자금', '생활비 계산', '재무 계획'],
  openGraph: {
    title: '비상자금 필요 금액 계산기 — 적정 비상금 규모 계산',
    description: '월 지출과 상황에 맞는 적정 비상자금 규모를 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/emergency-fund',
  },
}

export default function EmergencyFundLayout({ children }: { children: React.ReactNode }) {
  return children
}
