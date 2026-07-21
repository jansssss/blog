/**
 * 금리유형(고정/변동)별 시장 실측치 요약 (순수 함수 전용)
 *
 * 이 파일의 존재 이유: 고정금리·변동금리 비교 도구가 기본값을 임의의 숫자로
 * 깔아두면 사용자는 그 숫자를 시장 시세로 오해한다. 실제로 기존 페이지는
 * 고정 4.0% / 변동 3.5% 를 하드코딩하고 있었는데, 같은 시점 금감원 공시는
 * 고정 5.28% / 변동 4.81% 였다. 1%p 넘게 낮은 값으로 시뮬레이션하면
 * 이자 부담을 과소평가하게 된다.
 *
 * 그래서 기본값을 스냅샷에서 뽑아 쓴다. 새 API 호출은 필요 없다 —
 * 이미 수집한 데이터에 rateType(고정금리/변동금리)이 들어 있다.
 */

import type { LoanOffer, LoanProductType } from './types'

/** 스냅샷의 rateType 문자열에서 찾을 키워드 */
const FIXED_KEYWORD = '고정'
const VARIABLE_KEYWORD = '변동'

export type RateKind = 'fixed' | 'variable'

export const RATE_KIND_LABELS: Record<RateKind, string> = {
  fixed: '고정금리',
  variable: '변동금리',
}

/** 한 금리유형의 시장 실측 요약 */
export interface RateTypeStat {
  /** 해당 유형으로 공시된 상품 수 */
  count: number
  /** 공시 최저금리들 중 최저 (%) */
  min: number
  /** 공시 평균금리의 상품 단순평균 (%) — 잔액 가중이 아니므로 '상품 평균'이다 */
  avg: number
  /** 공시 최고금리들 중 최고 (%) */
  max: number
}

export interface MarketRates {
  productType: LoanProductType
  fixed: RateTypeStat | null
  variable: RateTypeStat | null
  /**
   * 고정 평균 − 변동 평균 (%p).
   * 양수면 변동금리가 그만큼 싸다는 뜻이고, 이 값이 곧 '변동을 골랐을 때 선불로
   * 받는 할인폭'이다. 손익분기 계산의 출발점이 된다.
   */
  spread: number | null
}

/** rateType 문자열 → 금리유형 (분류 불가면 null) */
export function classifyRateType(rateType: string | null): RateKind | null {
  if (!rateType) return null
  if (rateType.includes(FIXED_KEYWORD)) return 'fixed'
  if (rateType.includes(VARIABLE_KEYWORD)) return 'variable'
  return null
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * 한 금리유형의 통계를 낸다.
 *
 * 금리가 하나도 없는 오퍼(전 항목 null)는 통계에서 빼야 한다.
 * 0 을 유효한 금리로 세면 최저금리가 0% 로 무너진다.
 */
export function summarizeRateKind(offers: LoanOffer[], kind: RateKind): RateTypeStat | null {
  const mins: number[] = []
  const avgs: number[] = []
  const maxes: number[] = []

  for (const offer of offers) {
    if (classifyRateType(offer.rateType) !== kind) continue

    // 평균금리가 없으면 최저/최고로 대체한다 (일부 보험사 공시가 이렇다)
    const avg = offer.rateAvg ?? offer.rateMin ?? offer.rateMax
    if (typeof avg !== 'number' || !Number.isFinite(avg) || avg <= 0) continue

    avgs.push(avg)
    if (typeof offer.rateMin === 'number' && offer.rateMin > 0) mins.push(offer.rateMin)
    if (typeof offer.rateMax === 'number' && offer.rateMax > 0) maxes.push(offer.rateMax)
  }

  if (avgs.length === 0) return null

  const sum = avgs.reduce((a, b) => a + b, 0)
  return {
    count: avgs.length,
    min: round2(mins.length > 0 ? Math.min(...mins) : Math.min(...avgs)),
    avg: round2(sum / avgs.length),
    max: round2(maxes.length > 0 ? Math.max(...maxes) : Math.max(...avgs)),
  }
}

/** 특정 상품종류의 고정·변동 시장 금리를 요약한다 */
export function computeMarketRates(
  offers: LoanOffer[],
  productType: LoanProductType
): MarketRates {
  const scoped = offers.filter((offer) => offer.productType === productType)
  const fixed = summarizeRateKind(scoped, 'fixed')
  const variable = summarizeRateKind(scoped, 'variable')

  return {
    productType,
    fixed,
    variable,
    spread: fixed && variable ? round2(fixed.avg - variable.avg) : null,
  }
}
