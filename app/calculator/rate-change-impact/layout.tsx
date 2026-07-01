import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '금리 변동 영향 계산기 | 금리 0.1% 오르면 얼마나 달라지나 | ohyess',
  description: '금리가 변동될 때 월 납입액과 총이자가 얼마나 달라지는지 즉시 계산합니다. 변동금리 대출자의 금리 인상 리스크 파악에 유용합니다.',
  keywords: ['금리변동영향계산기', '금리 인상 영향', '변동금리 계산', '금리 오르면 이자', '대출 금리 계산기'],
  openGraph: {
    title: '금리 변동 영향 계산기 — 금리 변화 시 납입액 차이 계산',
    description: '금리 변동 시 월 납입액과 총이자 변화를 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/rate-change-impact',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '금리 변동 영향 계산기',
      description: '금리 변동 시 월 납입액과 총이자 변화를 즉시 계산해 변동금리 리스크를 파악하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/rate-change-impact',
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
          name: '금리 0.1%p 오르면 이자가 얼마나 늘어나나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '대출 1억원 기준으로 금리 0.1%p 상승 시 월 납입액은 약 5~6천원 증가합니다. 3억원 대출이라면 약 1.5~1.8만원 증가합니다. 대출 원금이 클수록 금리 영향이 크므로 변동금리 대출자는 주의가 필요합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '변동금리와 고정금리 중 어느 것이 유리한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '금리 하락이 예상되면 변동금리, 금리 상승이 우려되면 고정금리가 유리합니다. 일반적으로 대출 기간이 길고 대출 규모가 클수록 고정금리로 리스크를 관리하는 것이 안전합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '변동금리 조정 주기는 어떻게 되나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '변동금리 주담대는 일반적으로 6개월 또는 1년마다 COFIX(코픽스) 기준금리에 연동해 금리가 변경됩니다. 변경 시 월 납입액이 달라지므로 여유 자금을 확보해두는 것이 좋습니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '금리 변동 영향 계산기', item: 'https://www.ohyess.kr/calculator/rate-change-impact' },
      ],
    },
  ],
}

export default function RateChangeImpactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
