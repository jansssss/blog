import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '중소기업 정책자금 | 정부 지원 대출·보증 총정리 | ohyess',
  description: '중소기업 정책자금 융자, 신용보증기금·기술보증기금 보증, 수출 지원 금융 등 중소기업을 위한 정책금융을 총정리했습니다. 업종·규모별 지원 조건을 확인하세요.',
  keywords: ['중소기업정책자금', '중소기업대출', '신용보증기금', '기술보증기금', '중소기업 금융지원', '정책금융'],
  openGraph: {
    title: '중소기업 정책자금 — 정부 지원 대출·보증 총정리',
    description: '중소기업을 위한 정책자금 융자, 신용·기술보증 제도를 정리했습니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/policy/sme',
  },
}

export default function SmeLayout({ children }: { children: React.ReactNode }) {
  return children
}
