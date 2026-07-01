import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '대출 이자 계산기 | 주담대·신용대출 월납입액·총이자 즉시 계산 | ohyess',
  description: '대출금액·금리·기간을 입력하면 원리금균등·원금균등·만기일시 방식별 월 납입액과 총이자를 즉시 계산합니다. 주택담보대출·신용대출 이자 계산에 활용하세요.',
  keywords: ['이자 계산기', '대출이자계산기', '대출 이자 계산', '월 이자 계산', '주담대 계산기', '주택담보대출 계산기', '원리금균등', '원금균등', '만기일시', '대출 계산기'],
  openGraph: {
    title: '대출 이자 계산기 — 월 이자·총이자 즉시 계산',
    description: '대출금액, 금리, 기간 입력 시 상환방식별 월 납입액과 총이자를 실시간으로 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/loan-interest',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '대출 이자 계산기',
      description: '대출금액·금리·기간으로 원리금균등·원금균등·만기일시 방식별 월 납입액과 총이자를 즉시 계산하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/loan-interest',
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
          name: '원리금균등과 원금균등 중 어느 것이 유리한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '총이자 측면에서는 원금균등이 유리합니다. 원금균등은 초기에 많이 갚아 잔액이 빠르게 줄어 총이자가 적습니다. 단, 초기 납입액이 높으므로 현금 흐름이 부족하면 원리금균등이 현실적입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '대출 이자는 어떻게 계산하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '원리금균등 월 납입액 = 대출원금 × [월이율 × (1+월이율)^기간] ÷ [(1+월이율)^기간 - 1]로 계산합니다. 월이율은 연이율 ÷ 12입니다. 예를 들어 3억원, 연 4%, 30년 기준 월 납입액은 약 143만원입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '주택담보대출(주담대) 금리는 어떻게 결정되나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '주담대 금리는 기준금리(COFIX 또는 금융채)에 가산금리를 더해 결정됩니다. 신용도, 담보물건, 대출 기간, 상환 방식에 따라 달라집니다. 고정금리는 5년간 고정 후 변동, 변동금리는 6개월·1년마다 변경됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: '총이자를 줄이는 방법은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '총이자를 줄이는 방법으로는 ① 대출 기간 단축, ② 원금균등상환 방식 선택, ③ 중도상환(목돈 생길 때 일부 조기 상환), ④ 더 낮은 금리로 갈아타기(대환대출) 등이 있습니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '대출 이자 계산기', item: 'https://www.ohyess.kr/calculator/loan-interest' },
      ],
    },
  ],
}

export default function LoanInterestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
