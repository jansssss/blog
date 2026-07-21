/**
 * 금리 비교 데이터 스냅샷 포맷 정의 및 로더.
 *
 * FSS 공시는 월 1회 갱신되고 전체 데이터가 500행 남짓이라 DB 를 둘 이유가 없다.
 * 수집 결과를 저장소에 JSON 으로 커밋하고 페이지는 이를 정적으로 읽는다.
 *  - 조회 지연 0, 런타임 외부 의존 0
 *  - git 히스토리에 월별 금리 변동이 그대로 남는다
 */

import type { LoanOffer, LoanProductType, SyncSummary } from './types'

/** 저장소에 커밋되는 스냅샷 파일 경로 (프로젝트 루트 기준) */
export const SNAPSHOT_PATH = 'data/finlife-offers.json'

export interface OfferSnapshot {
  /** 스냅샷 생성 시각 (ISO) */
  generatedAt: string
  /** 상품종류별 공시월 (YYYYMM). 데이터 신뢰성 표기에 사용 */
  disclosureMonths: Partial<Record<LoanProductType, string>>
  /** 상품종류별 오퍼 수 */
  counts: Partial<Record<LoanProductType, number>>
  /** 수집 실행 요약 (권역별 성공/실패) */
  summaries: SyncSummary[]
  offers: LoanOffer[]
}

/** 빈 스냅샷 — 아직 수집 전이거나 파일이 없을 때의 안전한 기본값 */
export const EMPTY_SNAPSHOT: OfferSnapshot = {
  generatedAt: '',
  disclosureMonths: {},
  counts: {},
  summaries: [],
  offers: [],
}

/**
 * 스냅샷의 공시월을 사람이 읽는 표기로 바꾼다. (202607 → 2026년 7월)
 */
export function formatDisclosureMonth(month: string | undefined | null): string | null {
  if (!month || !/^\d{6}$/.test(month)) return null
  const year = month.slice(0, 4)
  const mon = String(Number(month.slice(4, 6)))
  return `${year}년 ${mon}월`
}

/**
 * 스냅샷이 얼마나 오래됐는지 판단한다.
 * FSS 공시는 월 1회이므로 두 달 넘게 갱신이 없으면 수집이 멈춘 것으로 본다.
 */
export function isSnapshotStale(snapshot: OfferSnapshot, now: Date = new Date()): boolean {
  if (!snapshot.generatedAt) return true
  const generated = new Date(snapshot.generatedAt)
  if (Number.isNaN(generated.getTime())) return true
  const days = (now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24)
  return days > 62
}

/** 스냅샷에서 특정 상품종류의 오퍼만 추린다 */
export function offersOfType(snapshot: OfferSnapshot, type: LoanProductType): LoanOffer[] {
  return snapshot.offers.filter((offer) => offer.productType === type)
}
