import { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '중도상환 계산기 | 수수료·면제일·이자 절감액 | ohyess',
  description: '대출 잔액, 중도상환 금액, 계약 수수료율과 실행일을 입력해 기간 체감 수수료와 면제 시점을 계산하고 단순 이자 절감 상한과 비교합니다.',
  keywords: ['중도상환 계산기', '중도상환수수료 계산기', '중도상환 면제일', '대출 조기 상환', '수수료 계산'],
  openGraph: {
    title: '중도상환 계산기 — 수수료·면제일 확인',
    description: '계약 수수료율과 실행일로 기간 체감 수수료를 계산하고 단순 이자 절감 상한과 비교합니다.',
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
      name: '중도상환 계산기',
      description: '중도상환 금액·계약 수수료율·대출 실행일로 기간 체감 수수료와 면제 시점을 계산하는 무료 금융 계산기',
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
            text: '중도상환수수료는 대출 만기 전에 일부 또는 전액을 상환할 때 계약에 따라 부과될 수 있는 비용입니다. 2025년 1월 13일 이후 적용 대상 신규 계약은 금융회사가 부담하는 실비용 안에서만 수수료를 산정합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '중도상환수수료 계산 공식은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '기간 체감식 계약은 중도상환금액 × 계약 수수료율 × 남은 부과기간 비율로 계산합니다. 남은 대출 만기가 아니라 계약서에 적힌 수수료 부과기간의 남은 비율을 사용해야 합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '중도상환수수료 면제 조건은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '금융소비자보호법 적용 대출은 원칙적으로 수수료 부과가 금지되지만 대출일부터 3년 안의 상환 등에는 예외가 있습니다. 실제 면제일은 계약 시점과 상품별 약정이 다르므로 계약서나 금융기관 앱의 상환예상금액에서 확인해야 합니다.',
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
        { '@type': 'ListItem', position: 3, name: '중도상환 계산기', item: 'https://www.ohyess.kr/calculator/prepayment-fee' },
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
