import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '대출 갈아타기 계산기 | 수수료 제하고 실제 절감액 계산 | ohyess',
  description: '현재 대출 금리와 신규 금리를 입력하면 중도상환수수료·이전비용을 차감한 실제 절감액과 손익분기점을 즉시 계산합니다. 갈아타기 할지 말지 숫자로 판단하세요.',
  keywords: ['대출갈아타기', '대출 갈아타기 계산기', '대환대출 계산기', '갈아타기 손익', '중도상환수수료 계산', '금리 갈아타기'],
  openGraph: {
    title: '대출 갈아타기 계산기 — 수수료 차감 후 실제 절감액',
    description: '금리 차이와 수수료를 함께 계산해 갈아타기 실제 손익을 즉시 확인합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/refinancing',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '대출 갈아타기 손익 계산기',
      description: '중도상환수수료 차감 후 실제 이자 절감액과 손익분기점을 즉시 계산하는 무료 대환대출 계산기',
      url: 'https://www.ohyess.kr/calculator/refinancing',
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
          name: '대출 갈아타기(대환대출)란 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '대출 갈아타기(대환대출)란 현재 대출을 더 낮은 금리의 새 대출로 바꾸는 것입니다. 중도상환수수료와 이전 비용을 내고도 이자 절감 효과가 크면 이득입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '갈아타기가 이득인 기준은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '일반적으로 금리 차이가 0.5%p 이상이고, 수수료 회수 기간(손익분기점)이 대출 잔여 기간 이내일 때 이득입니다. 예를 들어 수수료 100만원이고 월 절감액이 5만원이면 20개월 후부터 이득입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '갈아타기 시 발생하는 비용은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '중도상환수수료(잔여 대출금의 1~2%), 근저당 설정·해지 비용, 인지세 등이 발생합니다. 온라인 대환대출 플랫폼 이용 시 일부 비용이 절감될 수 있습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '온라인 대환대출 플랫폼을 이용하면 어떤 점이 유리한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '금융위원회가 허가한 대출 갈아타기 플랫폼을 통해 은행 방문 없이 온라인으로 여러 금융사 금리를 비교하고 갈아탈 수 있습니다. 2023년부터 주담대까지 확대 적용되어 절차가 간편해졌습니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '대출 갈아타기 계산기', item: 'https://www.ohyess.kr/calculator/refinancing' },
      ],
    },
  ],
}

export default function RefinancingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
