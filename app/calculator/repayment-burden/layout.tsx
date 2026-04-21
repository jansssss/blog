import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '월 상환 부담 체감 계산기 | 소득 대비 대출 부담 진단 | ohyess',
  description: '월 납입액이 소득의 몇 %를 차지하는지 계산하고 부담 수준을 진단합니다. 적정 대출 규모 판단과 가계 재무 계획에 활용하세요.',
  keywords: ['월상환부담계산기', '대출 부담 계산', '소득 대비 이자', 'DTI 계산', '월 납입액 비율', '대출 계산기'],
  openGraph: {
    title: '월 상환 부담 체감 계산기 — 소득 대비 대출 부담 진단',
    description: '월 납입액이 소득의 몇 %인지 계산하고 가계 대출 부담을 진단합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/repayment-burden',
  },
}

export default function RepaymentBurdenLayout({ children }: { children: React.ReactNode }) {
  return children
}
