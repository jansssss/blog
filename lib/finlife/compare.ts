/**
 * 대출 오퍼 비교·환산 엔진 (순수 함수 전용)
 *
 * 이 파일의 존재 이유: "연 4.1% vs 연 4.4%"는 사람이 체감할 수 없다.
 * 같은 조건에서 월상환액이 얼마나 차이 나는지, 만기까지 총이자가 얼마나 벌어지는지로
 * 환산해야 비교가 의사결정에 쓰인다.
 *
 * 성능 주의: 비교표는 수백 건의 오퍼를 한 번에 계산하므로 상환 스케줄 배열을 만들지 않고
 * 폐쇄형 공식만 사용한다. (lib/calculators.ts 의 반복 계산과 동일한 결과임을 테스트로 고정)
 */

import { rateForCreditScore } from './normalize'
import type { LoanOffer, LoanProductType } from './types'

// ─── 상환 방식 ──────────────────────────────────────────────────────────────

export type RepayMethod = 'epi' | 'ep' | 'bullet'

export const REPAY_METHOD_LABELS: Record<RepayMethod, string> = {
  epi: '원리금균등',
  ep: '원금균등',
  bullet: '만기일시',
}

/** FSS 공시의 상환유형명(rpay_type_nm) → 계산에 쓸 상환 방식 */
export function repayMethodFromType(repayType: string | null): RepayMethod {
  if (!repayType) return 'epi'
  if (repayType.includes('일시')) return 'bullet'
  return 'epi' // "분할상환"은 원리금균등을 기본으로 본다
}

// ─── 상환액 폐쇄형 계산 ──────────────────────────────────────────────────────

export interface RepaymentResult {
  /** 대표 월납입액. 원금균등은 첫 달(최대) 기준 */
  monthly: number
  /** 원금균등에서 마지막 달 납입액. 그 외에는 monthly 와 동일 */
  lastMonthly: number
  totalInterest: number
  totalPayment: number
}

/**
 * 상환 방식별 월납입액·총이자를 폐쇄형으로 계산한다.
 *
 * - 원리금균등: PMT 공식
 * - 원금균등:   총이자 = 원금 × 월이율 × (n+1)/2
 * - 만기일시:   매월 이자만, 만기에 원금 일시상환
 */
export function computeRepayment(
  principal: number,
  annualRate: number,
  months: number,
  method: RepayMethod
): RepaymentResult | null {
  if (!Number.isFinite(principal) || principal <= 0) return null
  if (!Number.isFinite(months) || months <= 0) return null
  if (!Number.isFinite(annualRate) || annualRate < 0) return null

  const r = annualRate / 12 / 100

  if (method === 'bullet') {
    const monthlyInterest = principal * r
    const totalInterest = monthlyInterest * months
    return {
      monthly: monthlyInterest,
      lastMonthly: monthlyInterest + principal,
      totalInterest,
      totalPayment: principal + totalInterest,
    }
  }

  if (method === 'ep') {
    const principalPerMonth = principal / months
    // 잔액이 매월 균등하게 줄어들므로 이자 합은 등차수열의 합
    const totalInterest = principal * r * ((months + 1) / 2)
    return {
      monthly: principalPerMonth + principal * r, // 첫 달
      lastMonthly: principalPerMonth + principalPerMonth * r, // 마지막 달
      totalInterest,
      totalPayment: principal + totalInterest,
    }
  }

  // 원리금균등
  let monthly: number
  if (r === 0) {
    monthly = principal / months
  } else {
    const pow = Math.pow(1 + r, months)
    monthly = (principal * (r * pow)) / (pow - 1)
  }
  const totalPayment = monthly * months
  return {
    monthly,
    lastMonthly: monthly,
    totalInterest: Math.max(0, totalPayment - principal),
    totalPayment,
  }
}

// ─── 비교 입력/출력 ─────────────────────────────────────────────────────────

/** 어떤 금리를 대표값으로 쓸지 */
export type RateBasis = 'min' | 'avg' | 'max'

export const RATE_BASIS_LABELS: Record<RateBasis, string> = {
  min: '최저금리',
  avg: '평균금리',
  max: '최고금리',
}

export interface CompareInput {
  productType: LoanProductType
  /** 대출 원금 (원) */
  amount: number
  /** 대출 기간 (개월) */
  months: number
  /** 대표 금리 기준 */
  rateBasis: RateBasis
  /** 신용점수 (개인신용대출일 때만 사용) */
  creditScore?: number
  /** 상환 방식을 강제 지정. 미지정 시 오퍼의 공시 상환유형을 따른다 */
  repayMethod?: RepayMethod
}

export interface ComparisonRow {
  offer: LoanOffer
  /** 실제 계산에 사용된 연 금리 (%) */
  rate: number
  /** 그 금리가 어디서 왔는지 — UI 표기용 */
  rateSource: RateBasis | 'creditScore'
  repayMethod: RepayMethod
  monthly: number
  lastMonthly: number
  totalInterest: number
  totalPayment: number
  /** 최저 총이자 상품 대비 추가로 더 내는 이자 (원). 1위는 0 */
  extraInterestVsBest: number
  /** 최저 월상환액 상품 대비 월 추가 부담 (원) */
  extraMonthlyVsBest: number
}

export interface ComparisonResult {
  rows: ComparisonRow[]
  /** 금리 정보가 있으나 해당 신용점수 구간을 취급하지 않아 제외된 오퍼 수 */
  excludedByCreditScore: number
  /** 비교 대상 오퍼 총 수 (제외 전) */
  candidateCount: number
}

/**
 * 오퍼에서 대표 금리를 뽑는다.
 *
 * 개인신용대출은 신용점수가 주어지면 그 점수 구간의 실제 공시 금리를 우선한다.
 * (최저금리는 최고신용자 기준이라 대부분의 사용자에게 현실적이지 않다)
 */
export function selectRate(
  offer: LoanOffer,
  input: CompareInput
): { rate: number; source: RateBasis | 'creditScore' } | null {
  if (offer.productType === 'credit' && typeof input.creditScore === 'number') {
    const scoped = rateForCreditScore(offer, input.creditScore)
    // null = 해당 점수 구간 미취급. 다른 금리로 대체하면 안 된다.
    return scoped === null ? null : { rate: scoped, source: 'creditScore' }
  }

  const order: RateBasis[] =
    input.rateBasis === 'min'
      ? ['min', 'avg', 'max']
      : input.rateBasis === 'max'
        ? ['max', 'avg', 'min']
        : ['avg', 'min', 'max']

  for (const basis of order) {
    const value =
      basis === 'min' ? offer.rateMin : basis === 'max' ? offer.rateMax : offer.rateAvg
    if (typeof value === 'number' && Number.isFinite(value)) {
      return { rate: value, source: basis }
    }
  }
  return null
}

// ─── 정렬 ───────────────────────────────────────────────────────────────────

export type SortKey = 'rate' | 'monthly' | 'totalInterest' | 'company'

export const SORT_LABELS: Record<SortKey, string> = {
  rate: '금리 낮은 순',
  monthly: '월상환액 적은 순',
  totalInterest: '총이자 적은 순',
  company: '금융회사명 순',
}

function compareRows(a: ComparisonRow, b: ComparisonRow, key: SortKey): number {
  switch (key) {
    case 'rate':
      return a.rate - b.rate
    case 'monthly':
      return a.monthly - b.monthly
    case 'totalInterest':
      return a.totalInterest - b.totalInterest
    case 'company':
      return a.offer.companyName.localeCompare(b.offer.companyName, 'ko')
  }
}

// ─── 비교표 생성 ────────────────────────────────────────────────────────────

/**
 * 오퍼 목록을 조건에 따라 계산·정렬하고, 1위 대비 차액까지 채워 비교표를 만든다.
 */
export function buildComparison(
  offers: LoanOffer[],
  input: CompareInput,
  sortKey: SortKey = 'totalInterest'
): ComparisonResult {
  const rows: ComparisonRow[] = []
  let excludedByCreditScore = 0

  for (const offer of offers) {
    const selected = selectRate(offer, input)
    if (!selected) {
      // 신용점수 구간 미취급으로 빠진 건은 사용자에게 알려줄 가치가 있다
      if (offer.productType === 'credit' && typeof input.creditScore === 'number') {
        excludedByCreditScore++
      }
      continue
    }

    const method = input.repayMethod ?? repayMethodFromType(offer.repayType)
    const repayment = computeRepayment(input.amount, selected.rate, input.months, method)
    if (!repayment) continue

    rows.push({
      offer,
      rate: selected.rate,
      rateSource: selected.source,
      repayMethod: method,
      monthly: repayment.monthly,
      lastMonthly: repayment.lastMonthly,
      totalInterest: repayment.totalInterest,
      totalPayment: repayment.totalPayment,
      extraInterestVsBest: 0,
      extraMonthlyVsBest: 0,
    })
  }

  if (rows.length > 0) {
    const bestInterest = Math.min(...rows.map((r) => r.totalInterest))
    const bestMonthly = Math.min(...rows.map((r) => r.monthly))
    for (const row of rows) {
      row.extraInterestVsBest = row.totalInterest - bestInterest
      row.extraMonthlyVsBest = row.monthly - bestMonthly
    }
  }

  rows.sort((a, b) => {
    const primary = compareRows(a, b, sortKey)
    if (primary !== 0) return primary
    // 동점일 때 순서가 흔들리지 않도록 id 로 안정화
    return a.offer.id.localeCompare(b.offer.id)
  })

  return {
    rows,
    excludedByCreditScore,
    candidateCount: offers.length,
  }
}

// ─── 필터 ───────────────────────────────────────────────────────────────────

export interface OfferFilter {
  /** 금융권역 코드 화이트리스트 (비어있으면 전체) */
  finGroupCodes?: string[]
  /** 금리유형: 고정 / 변동 부분일치 */
  rateType?: string
  /** 상환유형 부분일치 */
  repayType?: string
  /** 담보유형 부분일치 (주담대) */
  collateralType?: string
  /** 신용대출 종류 부분일치 */
  creditProductType?: string
  /** 회사명·상품명 검색어 */
  query?: string
}

function includesLoose(haystack: string | null, needle: string | undefined): boolean {
  if (!needle) return true
  if (!haystack) return false
  return haystack.includes(needle)
}

/** 오퍼 목록에 필터를 적용한다 */
export function filterOffers(offers: LoanOffer[], filter: OfferFilter): LoanOffer[] {
  const query = filter.query?.trim().toLowerCase()

  return offers.filter((offer) => {
    if (
      filter.finGroupCodes &&
      filter.finGroupCodes.length > 0 &&
      !filter.finGroupCodes.includes(offer.finGroupCode)
    ) {
      return false
    }
    if (!includesLoose(offer.rateType, filter.rateType)) return false
    if (!includesLoose(offer.repayType, filter.repayType)) return false
    if (!includesLoose(offer.collateralType, filter.collateralType)) return false
    if (!includesLoose(offer.creditProductType, filter.creditProductType)) return false

    if (query) {
      const haystack = `${offer.companyName} ${offer.productName}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
}

/** 필터 UI 를 채우기 위해 현재 데이터에 실제로 존재하는 선택지만 추출한다 */
export function collectFacets(offers: LoanOffer[]) {
  const rateTypes = new Set<string>()
  const repayTypes = new Set<string>()
  const collateralTypes = new Set<string>()
  const creditProductTypes = new Set<string>()
  const finGroups = new Map<string, string>()

  for (const offer of offers) {
    if (offer.rateType) rateTypes.add(offer.rateType)
    if (offer.repayType) repayTypes.add(offer.repayType)
    if (offer.collateralType) collateralTypes.add(offer.collateralType)
    if (offer.creditProductType) creditProductTypes.add(offer.creditProductType)
    if (offer.finGroupCode) finGroups.set(offer.finGroupCode, offer.finGroupName)
  }

  const sorted = (set: Set<string>) => Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))

  return {
    rateTypes: sorted(rateTypes),
    repayTypes: sorted(repayTypes),
    collateralTypes: sorted(collateralTypes),
    creditProductTypes: sorted(creditProductTypes),
    finGroups: Array.from(finGroups.entries()).map(([code, name]) => ({ code, name })),
  }
}
