import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DSR DTI LTV 계산기 | 내 비율 즉시 확인 | ohyess',
  description: '연 소득과 대출 조건을 입력하면 DSR·DTI·LTV를 즉시 계산합니다. 규제 한도(DSR 40%)와 비교하고 최대 대출 가능 금액을 역산합니다. 슬라이더 조작으로 실시간 확인.',
  keywords: ['DSR 계산기', 'DTI 계산기', 'LTV 계산기', 'dsr dti ltv 계산', '총부채원리금상환비율', '대출 한도 계산', 'DSR 40%', '대출 규제'],
  openGraph: {
    title: 'DSR DTI LTV 계산기 — 내 비율 즉시 확인',
    description: '소득·대출 조건 입력 시 DSR/DTI/LTV를 즉시 계산하고 규제 한도와 비교합니다.',
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
