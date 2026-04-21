import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대출 상품 선택 가이드 | 용도별 맞는 대출 고르기 | ohyess',
  description: '신용대출, 주택담보대출, 전세대출, 정책금융까지 용도에 맞는 대출 상품을 선택하는 방법을 안내합니다. 상품별 금리·한도·조건을 한눈에 비교하세요.',
  keywords: ['대출상품비교', '대출 종류 비교', '신용대출 주담대 비교', '대출 상품 선택', '대출 가이드'],
  openGraph: {
    title: '대출 상품 선택 가이드 — 용도별 맞는 대출 고르기',
    description: '신용대출·주담대·전세대출·정책금융의 조건을 비교하고 용도에 맞는 상품을 선택하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/compare/loan-products',
  },
}

export default function LoanProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
