import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '비상자금 필요 금액 계산기 | 적정 비상금 규모 계산 | ohyess',
  description: '월 필수 지출과 가족 상황을 입력하면 적정 비상자금 규모를 계산합니다. 직장인·자영업자·프리랜서별 권장 비상금 기준도 확인하세요.',
  keywords: ['비상자금계산기', '비상금 계산', '비상금 얼마', '적정 비상자금', '생활비 계산', '재무 계획'],
  openGraph: {
    title: '비상자금 필요 금액 계산기 — 적정 비상금 규모 계산',
    description: '월 지출과 상황에 맞는 적정 비상자금 규모를 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/emergency-fund',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '비상자금 필요 금액 계산기',
      description: '월 필수 지출과 가족 상황을 입력해 직장인·자영업자·프리랜서별 적정 비상자금 규모를 계산하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/emergency-fund',
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
          name: '비상자금은 얼마나 필요한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '일반적으로 월 필수 생활비의 3~6개월치를 비상자금으로 권장합니다. 직장인은 3개월, 자영업자·프리랜서는 소득 변동성이 커 6개월 이상이 권장됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: '비상자금은 어디에 보관하는 것이 좋나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '즉시 인출 가능한 수시입출금 통장이나 파킹통장(고금리 수시입출금)에 보관하는 것이 좋습니다. 주식·펀드 등 변동성 자산은 비상자금으로 부적합합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '대출 상환 중에도 비상자금이 필요한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네, 필요합니다. 대출을 갚으면서도 비상자금이 없으면 갑작스러운 지출 발생 시 고금리 대출을 다시 받아야 할 수 있습니다. 대출 상환과 비상자금 확보를 병행하는 것이 안전합니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '비상자금 계산기', item: 'https://www.ohyess.kr/calculator/emergency-fund' },
      ],
    },
  ],
}

export default function EmergencyFundLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
