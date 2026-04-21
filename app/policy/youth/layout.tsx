import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '청년 금융 지원 정책 | 청년 대출·금리 우대 총정리 | ohyess',
  description: '청년희망적금, 청년도약계좌, 청년전세대출, 청년 신용보증 등 청년을 위한 정부·공공기관 금융 지원 제도를 총정리했습니다. 나이·소득 조건과 신청 방법 확인하세요.',
  keywords: ['청년금융지원', '청년대출', '청년희망적금', '청년도약계좌', '청년 정책금융', '청년 금융혜택'],
  openGraph: {
    title: '청년 금융 지원 정책 — 대출·금리 우대 총정리',
    description: '청년을 위한 정부·공공기관 금융 지원 제도를 조건·한도별로 정리했습니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/policy/youth',
  },
}

export default function YouthLayout({ children }: { children: React.ReactNode }) {
  return children
}
