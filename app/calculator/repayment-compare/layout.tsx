import { Metadata } from 'next'

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
}

export default function RepaymentCompareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
