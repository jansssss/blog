import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '원리금 vs 원금균등 상환 비교 계산기 | 월 상환액·총이자 비교',
  description: '대출 금액과 금리를 입력하면 원리금균등·원금균등 방식의 월 납입액과 총 이자를 바로 비교할 수 있습니다. 어떤 상환 방식이 유리한지 확인하세요.',
  keywords: ['상환 비교', '원리금균등', '원금균등', '대출 계산기', '월 상환액', '총 이자', '대출 이자'],
  openGraph: {
    title: '원리금 vs 원금균등 상환 비교 계산기',
    description: '대출 금액과 금리를 입력하면 원리금균등·원금균등 방식의 월 납입액과 총 이자를 바로 비교할 수 있습니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/repayment-compare',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '원리금균등 vs 원금균등 상환 비교 계산기',
      description: '동일 대출 조건에서 원리금균등·원금균등 방식의 월 납입액과 총이자를 즉시 비교하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/repayment-compare',
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
          name: '원리금균등과 원금균등의 차이는 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '원리금균등은 매월 동일한 금액을 납부하는 방식으로 초기 부담이 일정합니다. 원금균등은 매월 동일한 원금을 갚고 이자는 잔액에 비례해 줄어들어 초기 납입액이 높지만 총이자가 적습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '원금균등이 총이자가 적은 이유는 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '원금균등은 매월 동일한 원금을 상환하므로 대출 잔액이 원리금균등보다 빠르게 줄어듭니다. 이자는 잔액에 비례하므로, 잔액이 빠르게 감소할수록 총이자가 적어집니다.',
          },
        },
        {
          '@type': 'Question',
          name: 'DSR 산정 시 어느 방식이 유리한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DSR 산정 시에는 원리금균등 방식이 유리합니다. 원금균등은 초기 납입액이 높아 DSR 계산 시 불리하게 반영될 수 있습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '어떤 상환 방식을 선택해야 하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '여유자금이 있고 총이자 절감을 원한다면 원금균등, 안정적인 월 납입액을 원한다면 원리금균등을 선택하세요. 초기 소득이 낮은 사회초년생은 원리금균등이 현실적입니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '상환방식 비교 계산기', item: 'https://www.ohyess.kr/calculator/repayment-compare' },
      ],
    },
  ],
}

export default function RepaymentCompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
