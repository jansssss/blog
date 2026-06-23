import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DSR 계산기 | DTI·LTV도 함께 계산해 대출 한도 확인 | ohyess',
  description: 'DSR 계산기로 내 소득과 기존 대출 월 납입액을 입력하면 DSR·DTI·LTV를 즉시 계산합니다. 규제 한도(DSR 40%)와 비교하고 최대 대출 가능 금액을 역산합니다.',
  keywords: ['dsr 계산기', 'DSR 계산기', 'DTI 계산기', 'LTV 계산기', 'dsr dti ltv 계산', '대출 한도 계산', '총부채원리금상환비율', 'DSR 40%', '대출 규제'],
  openGraph: {
    title: 'DSR 계산기 — DTI·LTV도 함께 계산해 대출 한도 확인',
    description: 'DSR 계산기로 소득·대출 조건을 입력하면 DSR/DTI/LTV를 즉시 계산하고 규제 한도와 비교합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/dsr-dti-ltv',
  },
}

export default function DsrDtiLtvLayout({ children }: { children: React.ReactNode }) {
  return children
}
