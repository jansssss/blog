import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '고정금리 vs 변동금리 선택 가이드 | 나에게 맞는 금리 유형 | ohyess',
  description: '고정금리와 변동금리의 특징·장단점을 비교하고 개인 상황에 맞는 선택 기준을 제시합니다. 금리 인상기·하락기 전략과 혼합금리 활용법도 확인하세요.',
  keywords: ['고정금리변동금리비교', '고정 vs 변동', '금리 유형 선택', '혼합금리', '대출 금리 종류'],
  openGraph: {
    title: '고정금리 vs 변동금리 선택 가이드',
    description: '고정·변동금리 특징을 비교하고 나에게 맞는 금리 유형을 선택하는 방법을 안내합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/compare/fixed-vs-variable',
  },
}

export default function FixedVsVariableLayout({ children }: { children: React.ReactNode }) {
  return children
}
