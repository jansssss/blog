import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '실손/건강보험 중복 점검 | 보장 중복 확인',
  description: '가입한 보험의 중복 보장을 분석합니다. 실손의료보험 중복, 비례보상 항목, 정액형 중복 청구 가능 여부를 확인하세요.',
  keywords: ['실손보험', '건강보험', '보험 중복', '비례보상', '보험료 절약', '보장 분석'],
  openGraph: {
    title: '실손/건강보험 중복 점검',
    description: '가입한 보험의 중복 보장을 분석하고 효율적인 보험 구성을 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function HealthOverlapCheckLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
