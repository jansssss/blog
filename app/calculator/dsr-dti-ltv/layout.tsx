import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'DSR 계산기 | DTI·LTV도 함께 계산해 대출 한도 확인 | ohyess',
  description: 'DSR 계산기로 내 소득과 기존 대출 월 납입액을 입력하면 DSR·DTI·LTV를 즉시 계산합니다. 규제 한도(DSR 40%)와 비교하고 최대 대출 가능 금액을 역산합니다.',
  keywords: ['dsr 계산기', 'DSR 계산기', 'DTI 계산기', 'LTV 계산기', 'dsr dti ltv 계산', '대출 한도 계산', '총부채원리금상환비율', 'DSR 40%', '대출 규제'],
  openGraph: {
    title: 'DSR 계산기 — DTI·LTV도 함께 계산해 대출 한도 확인',
    description: 'DSR 계산기로 소득·대출 조건을 입력하면 DSR/DTI/LTV를 즉시 계산하고 규제 한도와 비교합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/dsr-dti-ltv',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'DSR DTI LTV 계산기',
      description: 'DSR·DTI·LTV를 즉시 계산하고 규제 한도와 비교해 최대 대출 가능 금액을 역산하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/dsr-dti-ltv',
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
          name: 'DSR 40%란 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DSR(총부채원리금상환비율) 40%는 은행권 대출 규제 한도로, 연간 모든 대출(주담대·신용대출·카드론 등)의 원금+이자 합계가 연소득의 40%를 초과하면 대출이 제한됩니다. 2금융권은 50%가 적용됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: 'DSR과 DTI의 차이는 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DSR은 모든 대출의 원금+이자를 소득으로 나눈 비율이고, DTI는 주택담보대출 원금+이자와 기타 대출 이자만을 소득으로 나눈 비율입니다. DSR이 더 엄격한 규제이며, 현재 주택담보대출에는 DSR이 우선 적용됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: '스트레스 DSR이란 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '스트레스 DSR은 미래 금리 인상 위험을 반영해 실제 금리에 가산금리(스트레스 금리)를 더해 DSR을 산정하는 방식입니다. 2025년 7월부터 스트레스 DSR 3단계가 적용되어 대출 한도가 추가로 축소됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: 'LTV 규제 한도는 얼마인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'LTV(주택담보인정비율) 한도는 지역·규제 여부에 따라 다릅니다. 수도권 투기과열지구 50%, 조정대상지역 60%, 비규제 지역 70%가 상한선입니다. 단 DSR 규제가 선행 적용되면 LTV 한도보다 적게 받을 수 있습니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: 'DSR 계산기', item: 'https://www.ohyess.kr/calculator/dsr-dti-ltv' },
      ],
    },
  ],
}

export default function DsrDtiLtvLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
