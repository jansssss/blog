import { Metadata } from 'next'

import snapshotJson from '@/data/finlife-offers.json'
import { formatDisclosureMonth, type OfferSnapshot } from '@/lib/finlife/snapshot'

const snapshot = snapshotJson as unknown as OfferSnapshot
const monthLabel = formatDisclosureMonth(snapshot.disclosureMonths.mortgage)
const count = snapshot.offers.length

export const metadata: Metadata = {
  title: `은행별 대출금리 비교 | 주담대·전세·신용대출 ${count}개 상품 실시간 비교 | ohyess`,
  description: `금융감독원 공시 기준 ${count}개 대출상품의 금리를 비교합니다.${
    monthLabel ? ` ${monthLabel} 공시자료 기준.` : ''
  } 대출금액·기간·신용점수를 입력하면 은행별 월상환액과 총이자 차이를 바로 확인할 수 있습니다.`,
  keywords: [
    '은행별금리비교',
    '대출금리비교',
    '주택담보대출 금리비교',
    '전세자금대출 금리비교',
    '신용대출 금리비교',
    '은행 금리 비교',
    '금융감독원 금리공시',
  ],
  openGraph: {
    title: '은행별 대출금리 비교 — 금감원 공시 데이터로 총이자까지 계산',
    description: `${count}개 대출상품의 실제 공시 금리를 내 조건의 월상환액·총이자로 환산해 비교합니다.`,
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/compare/bank-rates',
  },
}

export default function BankRatesLayout({ children }: { children: React.ReactNode }) {
  return children
}
