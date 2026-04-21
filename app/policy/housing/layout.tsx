import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '주거 지원 정책 | 전세·월세 정부 금융 지원 총정리 | ohyess',
  description: '버팀목전세자금대출, 청년전세대출, 월세대출 등 전세·월세 주거 안정을 위한 정부 금융 지원 제도를 한눈에 정리했습니다. 조건·한도·신청 방법 확인하세요.',
  keywords: ['주거지원정책', '전세자금대출', '버팀목전세대출', '청년전세대출', '월세대출', '주거 금융지원'],
  openGraph: {
    title: '주거 지원 정책 — 전세·월세 정부 금융 지원 총정리',
    description: '버팀목전세·청년전세·월세대출 등 주거 안정 정책금융을 한눈에 정리했습니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/policy/housing',
  },
}

export default function HousingLayout({ children }: { children: React.ReactNode }) {
  return children
}
