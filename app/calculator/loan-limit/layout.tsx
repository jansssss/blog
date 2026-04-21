import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대출 한도 시뮬레이터 | DSR·소득 기반 대출 가능 금액 계산 | ohyess',
  description: '연소득, 금리, 기간을 입력하면 DSR 40% 기준 최대 대출 가능 금액을 즉시 계산합니다. 원리금균등·원금균등 방식별 비교도 가능합니다.',
  keywords: ['대출한도계산기', '대출 한도 시뮬레이터', 'DSR 계산', '최대 대출 가능 금액', '연소득 대출 한도', '대출 계산기'],
  openGraph: {
    title: '대출 한도 시뮬레이터 — DSR 기준 대출 가능 금액 계산',
    description: '연소득과 금리를 입력하면 DSR 40% 기준 최대 대출 가능 금액을 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/loan-limit',
  },
}

export default function LoanLimitLayout({ children }: { children: React.ReactNode }) {
  return children
}
