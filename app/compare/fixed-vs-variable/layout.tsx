import { Metadata } from 'next'

import snapshotJson from '@/data/finlife-offers.json'
import { computeMarketRates } from '@/lib/finlife/market'
import { formatDisclosureMonth, type OfferSnapshot } from '@/lib/finlife/snapshot'

const snapshot = snapshotJson as unknown as OfferSnapshot
const market = computeMarketRates(snapshot.offers, 'mortgage')
const monthLabel = formatDisclosureMonth(snapshot.disclosureMonths.mortgage)

/** 공시 수치를 메타 설명에 넣어, 데이터가 갱신되면 설명도 함께 갱신되게 한다 */
const rateSummary =
  market.fixed && market.variable
    ? `${monthLabel ?? ''} 기준 주택담보대출 고정 평균 ${market.fixed.avg}% · 변동 평균 ${market.variable.avg}%. `
    : ''

export const metadata: Metadata = {
  title: '고정금리 vs 변동금리 손익분기 계산기 | 얼마나 올라야 손해일까 | ohyess',
  description:
    `${rateSummary}변동금리가 몇 %p 올라야 고정금리보다 총이자가 많아지는지 계산합니다. ` +
    '금융감독원 공시 금리를 기본값으로 사용하며, 상승 시점과 폭을 조절해 비교할 수 있습니다.',
  keywords: [
    '고정금리 변동금리 비교',
    '고정금리 변동금리 손익분기',
    '변동금리 상승 시뮬레이션',
    '금리 유형 선택',
    '혼합금리',
  ],
  openGraph: {
    title: '고정금리 vs 변동금리 — 얼마나 올라야 손해일까',
    description:
      '금감원 공시 금리로 두 금리 유형의 총이자를 비교하고 손익분기 상승폭을 계산합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/compare/fixed-vs-variable',
  },
}

export default function FixedVsVariableLayout({ children }: { children: React.ReactNode }) {
  return children
}
