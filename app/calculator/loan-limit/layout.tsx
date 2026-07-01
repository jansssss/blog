import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '대출 한도 시뮬레이터 | DSR·소득 기반 대출 가능 금액 계산 | ohyess',
  description: '연소득, 금리, 기간을 입력하면 DSR 40% 기준 최대 대출 가능 금액을 즉시 계산합니다. 원리금균등·원금균등 방식별 비교도 가능합니다.',
  keywords: ['대출한도계산기', '대출 한도 시뮬레이터', 'DSR 계산', '최대 대출 가능 금액', '연소득 대출 한도', '대출 계산기'],
  openGraph: {
    title: '대출 한도 시뮬레이터 — DSR 기준 대출 가능 금액 계산',
    description: '연소득과 금리를 입력하면 DSR 40% 기준 최대 대출 가능 금액을 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/loan-limit',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '대출 한도 시뮬레이터',
      description: '연소득·금리·기간 입력으로 DSR 40% 기준 최대 대출 가능 금액을 즉시 계산하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/loan-limit',
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
          name: '연소득으로 얼마까지 대출받을 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DSR 40% 기준 최대 대출 가능 금액은 연소득 × 40% ÷ 12(월 최대 상환액)를 원리금균등 공식으로 역산해 계산합니다. 예를 들어 연소득 6천만원, 금리 4%, 30년 기준 약 3.8억원이 한도입니다.',
          },
        },
        {
          '@type': 'Question',
          name: 'DSR 40% 기준 대출 한도는 어떻게 계산하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '월 최대 상환 가능액 = 연소득 × 40% ÷ 12로 구한 뒤, 이를 원리금균등상환 공식으로 역산해 대출 원금을 계산합니다. 기존 대출가 있으면 해당 납입액을 먼저 차감해야 합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '신용대출이 있으면 주담대 한도가 줄어드나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네, 줄어듭니다. DSR은 모든 대출의 원리금을 합산하므로, 신용대출·카드론·자동차 할부 등이 있으면 그만큼 주담대 한도가 감소합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '소득 인정 기준은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '근로소득자는 근로소득원천징수영수증 기준 세전 연소득, 자영업자는 종합소득세 신고 소득이 기준입니다. 부업·임대 소득도 일정 기준 충족 시 인정됩니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '대출 한도 시뮬레이터', item: 'https://www.ohyess.kr/calculator/loan-limit' },
      ],
    },
  ],
}

export default function LoanLimitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
