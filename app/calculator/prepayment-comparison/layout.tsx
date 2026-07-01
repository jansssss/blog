import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '중도상환 vs 유지 비교 계산기 | 어떤 선택이 유리한가 | ohyess',
  description: '중도상환과 대출 유지 중 어떤 선택이 이득인지 계산합니다. 수수료 차감 후 절감 이자와 투자 기회비용을 비교해 최적 결정을 도와드립니다.',
  keywords: ['중도상환 비교', '중도상환 vs 유지', '대출 중도상환 계산', '기회비용 계산', '대출 계산기'],
  openGraph: {
    title: '중도상환 vs 유지 비교 계산기 — 최적 선택 계산',
    description: '중도상환과 대출 유지 중 수수료·이자 절감·기회비용을 고려한 최적 선택을 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/prepayment-comparison',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '중도상환 vs 유지 비교 계산기',
      description: '수수료 차감 후 이자 절감액과 투자 기회비용을 비교해 중도상환 vs 대출 유지 중 최적 선택을 계산하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/prepayment-comparison',
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
          name: '목돈이 생겼을 때 대출을 갚는 것이 유리한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '대출 금리보다 투자 수익률이 낮다면 대출을 갚는 것이 유리합니다. 반대로 대출 금리보다 높은 수익률이 기대된다면 투자를 유지하는 것이 유리할 수 있습니다. 중도상환수수료도 반드시 함께 고려해야 합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '중도상환 시 수수료가 있으면 손해인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '수수료보다 앞으로 내야 할 이자 절감액이 크면 이득입니다. 예를 들어 수수료 50만원이고 남은 이자가 500만원이라면 중도상환이 확실히 유리합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '부분 중도상환과 전액 상환 중 어느 것이 나은가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '전액 상환 시 이자 절감 효과가 가장 크지만, 생활자금·비상금이 부족해지면 오히려 손해입니다. 비상금 3~6개월치를 남기고 여유 자금으로 부분 상환하는 것이 일반적으로 권장됩니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '중도상환 vs 유지 비교 계산기', item: 'https://www.ohyess.kr/calculator/prepayment-comparison' },
      ],
    },
  ],
}

export default function PrepaymentComparisonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
