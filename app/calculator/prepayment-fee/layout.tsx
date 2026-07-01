import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '중도상환수수료 계산기 | 실제 수수료 즉시 계산 | ohyess',
  description: '잔여 대출금액, 금리, 잔존기간을 입력하면 중도상환수수료를 즉시 계산합니다. 은행·종류별 수수료율 차이와 절약 전략도 확인하세요.',
  keywords: ['중도상환수수료계산기', '중도상환 수수료', '대출 조기 상환', '수수료 계산', '대출 계산기'],
  openGraph: {
    title: '중도상환수수료 계산기 — 실제 수수료 즉시 계산',
    description: '잔여 대출금액과 잔존기간을 입력해 중도상환수수료를 즉시 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/calculator/prepayment-fee',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '중도상환수수료 계산기',
      description: '잔여 대출금액·수수료율·잔존기간으로 중도상환수수료를 즉시 계산하는 무료 금융 계산기',
      url: 'https://www.ohyess.kr/calculator/prepayment-fee',
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
          name: '중도상환수수료란 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '중도상환수수료는 대출 만기 전에 일부 또는 전액을 조기 상환할 때 은행에 내는 수수료입니다. 통상 잔여 대출금액의 1~2%이며, 잔존기간에 비례해 줄어듭니다.',
          },
        },
        {
          '@type': 'Question',
          name: '중도상환수수료 계산 공식은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '중도상환수수료 = 중도상환금액 × 수수료율 × (잔존기간/전체약정기간)으로 계산합니다. 예를 들어 잔여 대출 1억원, 수수료율 1.2%, 잔존 1.5년/전체 3년이면 수수료 = 1억 × 0.012 × 0.5 = 60만원입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '중도상환수수료 면제 조건은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '대출일로부터 3년이 지나면 대부분의 은행에서 중도상환수수료가 면제됩니다. 금융위원회 고시에 따라 2024년부터 가계대출 중도상환수수료 인하 정책이 시행되었으며, 일부 정책금융상품은 수수료가 없습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '갈아타기 전에 수수료를 먼저 확인해야 하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네, 반드시 먼저 확인해야 합니다. 갈아타기로 절감되는 이자보다 중도상환수수료가 더 크면 손해입니다. 갈아타기 손익 계산기로 수수료 대비 금리 절감액을 비교해 실제 이득 여부를 확인하세요.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '금융 계산기', item: 'https://www.ohyess.kr/calculator' },
        { '@type': 'ListItem', position: 3, name: '중도상환수수료 계산기', item: 'https://www.ohyess.kr/calculator/prepayment-fee' },
      ],
    },
  ],
}

export default function PrepaymentFeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  )
}
