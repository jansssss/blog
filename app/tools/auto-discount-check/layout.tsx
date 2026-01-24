import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '자동차보험 할인 진단 | 할인 누락 확인',
  description: '자동차보험에서 적용 가능한 할인 항목을 점검하고, 누락된 할인을 확인하세요. 마일리지, 블랙박스, 운전자 한정 등 다양한 할인 항목을 진단합니다.',
  keywords: ['자동차보험', '할인', '마일리지 특약', '블랙박스 할인', '운전자 한정', '보험료 절약'],
  openGraph: {
    title: '자동차보험 할인 진단',
    description: '적용 가능한 할인 항목을 점검하고 누락된 할인을 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function AutoDiscountCheckLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
