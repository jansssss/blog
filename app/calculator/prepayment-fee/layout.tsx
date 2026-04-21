import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '중도상환수수료 계산기 | 실제 수수료 즉시 계산 | ohyess',
  description: '잔여 대출금액, 금리, 잔존기간을 입력하면 중도상환수수료를 즉시 계산합니다. 은행·종류별 수수료율 차이와 절약 전략도 확인하세요.',
  keywords: ['중도상환수수료계산기', '중도상환 수수료', '대출 조기 상환', '수수료 계산', '대출 계산기'],
  openGraph: {
    title: '중도상환수수료 계산기 — 실제 수수료 즉시 계산',
    description: '잔여 대출금액과 잔존기간을 입력해 중도상환수수료를 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/prepayment-fee',
  },
}

export default function PrepaymentFeeLayout({ children }: { children: React.ReactNode }) {
  return children
}
