import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '은행별 금리 비교하는 방법 | 정확한 금리 확인 가이드 | ohyess',
  description: '은행별 대출 금리를 정확하게 비교하는 방법과 주의사항을 안내합니다. 금융감독원 금융상품 한눈에, 은행연합회 등 공식 비교 채널 활용법을 알아보세요.',
  keywords: ['은행별금리비교', '대출금리비교', '은행 금리 비교', '금리 비교 사이트', '대출 금리 확인'],
  openGraph: {
    title: '은행별 금리 비교하는 방법',
    description: '정확한 은행별 대출 금리를 비교하는 방법과 공식 채널 활용법을 안내합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/compare/bank-rates',
  },
}

export default function BankRatesLayout({ children }: { children: React.ReactNode }) {
  return children
}
