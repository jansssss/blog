import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '소상공인·자영업자 지원 정책 | 정부 금융 지원 총정리 | ohyess',
  description: '소상공인 정책자금, 저금리 대출, 신용보증 등 소상공인과 자영업자를 위한 정부·공공기관 금융 지원 제도를 총정리했습니다. 소진공·기업은행 창구 정보도 확인하세요.',
  keywords: ['소상공인지원', '자영업자대출', '소상공인정책자금', '소진공', '자영업 금융지원', '소상공인 대출'],
  openGraph: {
    title: '소상공인·자영업자 지원 정책 — 정부 금융 지원 총정리',
    description: '소상공인·자영업자를 위한 정책자금·보증·저금리 대출을 정리했습니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/policy/small-business',
  },
}

export default function SmallBusinessLayout({ children }: { children: React.ReactNode }) {
  return children
}
