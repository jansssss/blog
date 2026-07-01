import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '월 상환 부담 체감 계산기 | 소득 대비 대출 부담 진단 | ohyess',
  description: '월 납입액이 소득의 몇 %를 차지하는지 계산하고 부담 수준을 진단합니다. 적정 대출 규모 판단과 가계 재무 계획에 활용하세요.',
  keywords: ['월상환부담계산기', '대출 부담 계산', '소득 대비 이자', 'DTI 계산', '월 납입액 비율', '대출 계산기'],
  openGraph: {
    title: '월 상환 부담 체감 계산기 — 소득 대비 대출 부담 진단',
    description: '월 납입액이 소득의 몇 %인지 계산하고 가계 대출 부담을 진단합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/repayment-burden',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '월 상환 부담 체감 계산기',
      description: '월 납입액이 소득의 몇 %를 차지하는지 계산하고 가계 대출 부담 수준을 진단하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/repayment-burden',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      inLanguage: 'ko',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '월 상환액이 소득의 몇 %여야 적정한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '일반적으로 주거비 포함 월 상환액은 세후 소득의 30% 이하를 권장합니다. 금융 전문가들은 대출 상환액만 기준으로는 소득의 20~25% 이하를 안전 범위로 봅니다.',
          },
        },
        {
          '@type': 'Question',
          name: 'DTI와 월 상환 부담 체감 계산기의 차이는 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DTI는 금융기관의 대출 심사 기준이고, 월 상환 부담 체감 계산기는 개인 재무 관점에서 실제 생활비·비상금 등을 고려한 체감 부담을 확인하는 도구입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '대출 상환 부담이 높을 때 해결 방법은?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '① 대출 만기 연장으로 월 납입액 감소, ② 더 낮은 금리로 갈아타기(대환대출), ③ 목돈 생기면 중도상환으로 잔액 줄이기, ④ DSR 여유 있으면 장기 분할 재구성 등을 검토하세요.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '월 상환 부담 계산기', item: 'https://www.ohyess.kr/calculator/repayment-burden' },
      ],
    },
  ],
}

export default function RepaymentBurdenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
