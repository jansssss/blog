import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '보험 리모델링 체크 | 보장 최적화 진단',
  description: '현재 보험의 리모델링 필요성을 진단합니다. 보장 공백, 보험료 부담, 상품 노후화, 생활 변화에 따른 점검 항목을 확인하세요.',
  keywords: ['보험 리모델링', '보험 점검', '보장 최적화', '보험료 절약', '보험 상담'],
  openGraph: {
    title: '보험 리모델링 체크',
    description: '현재 보험의 리모델링 필요성을 간단한 질문으로 진단해 드립니다.',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function InsuranceRemodelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
