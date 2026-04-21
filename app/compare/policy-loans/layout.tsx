import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '정책자금 찾는 방법 | 정부 지원 대출 완전 가이드 | ohyess',
  description: '창업자금, 운전자금, 시설자금 등 정부·공공기관 정책자금을 찾고 신청하는 방법을 안내합니다. 중소벤처기업부, 신용보증기금 등 주요 창구도 정리했습니다.',
  keywords: ['정책자금', '정부지원대출', '정책금융', '중소기업 정책자금', '창업자금 대출', '정부 대출'],
  openGraph: {
    title: '정책자금 찾는 방법 — 정부 지원 대출 완전 가이드',
    description: '창업·운전·시설자금 정책자금을 찾고 신청하는 방법을 안내합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/compare/policy-loans',
  },
}

export default function PolicyLoansLayout({ children }: { children: React.ReactNode }) {
  return children
}
