import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대출 이자 계산기 | 월 이자·총이자 즉시 계산 | ohyess',
  description: '대출금액, 금리, 기간을 입력하면 원리금균등·원금균등·만기일시 방식별 월 납입액과 총이자를 즉시 계산합니다. 슬라이더 조작으로 실시간 확인 가능.',
  keywords: ['대출이자계산기', '대출 이자 계산', '월 이자 계산', '원리금균등', '원금균등', '만기일시', '대출 계산기'],
  openGraph: {
    title: '대출 이자 계산기 — 월 이자·총이자 즉시 계산',
    description: '대출금액, 금리, 기간 입력 시 상환방식별 월 납입액과 총이자를 실시간으로 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/loan-interest',
  },
}

export default function LoanInterestLayout({ children }: { children: React.ReactNode }) {
  return children
}
