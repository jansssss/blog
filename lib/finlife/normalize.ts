/**
 * FSS 원본 응답 → 도메인 모델 정규화 (순수 함수 전용, I/O 없음)
 *
 * FSS 응답의 지저분한 부분을 여기서 전부 흡수한다:
 *  - 모든 값이 문자열, 결측이 null / "" / "-" / " " 로 제각각
 *  - 숫자에 쉼표·퍼센트 기호가 섞여 오는 경우가 있음
 *  - baseList 와 optionList 가 분리되어 있고 1:N 으로 매칭해야 함
 *  - 취급하지 않는 신용점수 구간은 0 또는 결측으로 내려옴
 */

import {
  API_ERROR_MESSAGES,
  CREDIT_PRODUCT_TYPE_NAMES,
  CREDIT_RATE_TYPE_FINAL,
  CREDIT_SCORE_BANDS,
  FIN_GROUP_NAMES,
  type CreditScoreRates,
  type LoanOffer,
  type LoanProductType,
  type RawApiResponse,
  type RawCreditLoanOption,
  type RawLoanBase,
  type RawLoanOption,
} from './types'

// ─── 스칼라 파서 ─────────────────────────────────────────────────────────────

/** 결측 표기로 취급할 문자열 */
const BLANK_TOKENS = new Set(['', '-', '--', 'null', 'N/A', 'n/a', '해당없음'])

/**
 * 문자열 필드 정규화. 결측·플레이스홀더는 null 로 통일한다.
 */
export function parseText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  if (BLANK_TOKENS.has(text)) return null
  return text
}

/**
 * 금리 문자열 → number (연 %).
 *
 * FSS 는 해당 구간을 취급하지 않을 때 0 또는 결측을 내려준다.
 * 연 0% 대출 상품은 존재하지 않으므로 0 도 "미취급"으로 간주해 null 을 반환한다.
 * 이 구분이 무너지면 비교표에서 미취급 상품이 최저금리 1위로 올라온다.
 */
export function parseRate(value: unknown): number | null {
  const text = parseText(value)
  if (text === null) return null

  // 쉼표·퍼센트·공백 제거 후 파싱
  const cleaned = text.replace(/[,%\s]/g, '')
  if (cleaned === '') return null

  const num = Number(cleaned)
  if (!Number.isFinite(num)) return null
  if (num <= 0) return null // 0 이하 = 미취급 (위 주석 참조)
  if (num > 100) return null // 연 100% 초과는 공시 오류로 간주

  // 부동소수 오차 정리 (예: 3.6799999999999997 → 3.68)
  return Math.round(num * 1000) / 1000
}

/**
 * 가입방법처럼 쉼표로 이어진 문자열을 배열로 분해한다.
 */
export function parseJoinWay(value: unknown): string[] {
  const text = parseText(value)
  if (text === null) return []
  return text
    .split(/[,、·/]/)
    .map((part) => part.trim())
    .filter((part) => part !== '' && !BLANK_TOKENS.has(part))
}

// ─── 키 생성 ────────────────────────────────────────────────────────────────

/** id 조각에서 구분자와 공백을 제거해 키 충돌·깨짐을 막는다 */
function idPart(value: unknown): string {
  const text = parseText(value)
  if (text === null) return '_'
  return text.replace(/[\s:]+/g, '')
}

/**
 * 오퍼의 안정적인 고유 키.
 *
 * 공시월(dcls_month)은 일부러 제외한다. 매월 새 공시가 들어와도 같은 상품·옵션이면
 * 동일 키로 upsert 되어 최신 스냅샷만 유지되도록 하기 위함이다.
 */
export function buildOfferId(
  productType: LoanProductType,
  base: RawLoanBase,
  option: RawLoanOption
): string {
  return [
    productType,
    idPart(base.fin_co_no),
    idPart(base.fin_prdt_cd),
    idPart(option.mrtg_type),
    idPart(option.rpay_type),
    idPart(option.lend_rate_type),
    idPart(option.crdt_prdt_type),
    idPart(option.crdt_lend_rate_type),
  ].join(':')
}

// ─── 신용점수 구간 처리 ──────────────────────────────────────────────────────

/**
 * 이 옵션 행이 비교 가능한 최종 대출금리(A)인지 판정한다.
 *
 * 코드(crdt_lend_rate_type)를 우선 보고, 없으면 이름으로 판단한다.
 * 둘 다 없으면 구성요소인지 최종금리인지 알 수 없으므로 제외한다(안전 우선).
 */
export function isFinalCreditRate(option: RawCreditLoanOption): boolean {
  const code = parseText(option.crdt_lend_rate_type)
  if (code !== null) return code.toUpperCase() === CREDIT_RATE_TYPE_FINAL

  const name = parseText(option.crdt_lend_rate_type_nm)
  if (name !== null) return name === '대출금리'

  return false
}

/**
 * 신용대출 상품종류명. API 가 이름(crdt_prdt_type_nm)을 비워 보내므로 코드로 매핑한다.
 * 이름이 함께 오면 그쪽을 우선한다.
 */
export function resolveCreditProductType(option: RawCreditLoanOption): string | null {
  const name = parseText(option.crdt_prdt_type_nm)
  if (name !== null) return name

  const code = parseText(option.crdt_prdt_type)
  if (code === null) return null
  return CREDIT_PRODUCT_TYPE_NAMES[code] ?? null
}

/**
 * 개인신용대출 옵션에서 신용점수 구간별 금리를 추출한다.
 * 키는 구간 필드명(crdt_grad_1 등), 값은 연 % 또는 null(미취급).
 */
export function extractCreditScoreRates(option: RawCreditLoanOption): CreditScoreRates {
  const rates: CreditScoreRates = {}
  for (const band of CREDIT_SCORE_BANDS) {
    rates[band.field] = parseRate(option[band.field])
  }
  return rates
}

/**
 * 신용점수(0~1000)에 해당하는 구간을 찾는다. 범위를 벗어나면 양 끝 구간으로 클램프.
 */
export function bandForScore(score: number) {
  if (!Number.isFinite(score)) return null
  const clamped = Math.min(1000, Math.max(0, score))
  return CREDIT_SCORE_BANDS.find((band) => clamped >= band.min && clamped <= band.max) ?? null
}

/**
 * 특정 신용점수에 실제 적용되는 금리. 해당 구간을 취급하지 않으면 null.
 *
 * null 은 "금리 정보 없음"이 아니라 "그 점수대에는 이 상품을 취급하지 않음"을 뜻하므로
 * UI 에서 반드시 구분해 표시해야 한다.
 */
export function rateForCreditScore(offer: LoanOffer, score: number): number | null {
  if (!offer.creditScoreRates) return null
  const band = bandForScore(score)
  if (!band) return null
  return offer.creditScoreRates[band.field] ?? null
}

/** 신용점수 구간별 금리들로부터 최저/최고를 유도한다 */
export function deriveCreditRateRange(rates: CreditScoreRates): {
  min: number | null
  max: number | null
} {
  const values = Object.values(rates).filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v)
  )
  if (values.length === 0) return { min: null, max: null }
  return { min: Math.min(...values), max: Math.max(...values) }
}

// ─── baseList × optionList 결합 ─────────────────────────────────────────────

/** base 와 option 매칭 키 */
function matchKey(row: { fin_co_no?: string | null; fin_prdt_cd?: string | null }): string {
  return `${idPart(row.fin_co_no)}::${idPart(row.fin_prdt_cd)}`
}

/**
 * baseList 와 optionList 를 결합해 비교표 행(LoanOffer[]) 으로 만든다.
 *
 * - 매칭은 (fin_co_no, fin_prdt_cd) 기준. 한 상품에 옵션이 여러 개면 행도 여러 개다.
 * - 대응하는 base 가 없는 고아 option 은 회사·상품명을 알 수 없으므로 버린다.
 * - 유효 금리가 하나도 없는 행은 비교 대상이 될 수 없으므로 버린다.
 */
export function joinOffers(
  productType: LoanProductType,
  finGroupCode: string,
  baseList: RawLoanBase[],
  optionList: RawLoanOption[]
): LoanOffer[] {
  const baseByKey = new Map<string, RawLoanBase>()
  for (const base of baseList) {
    baseByKey.set(matchKey(base), base)
  }

  const offers: LoanOffer[] = []
  const seenIds = new Set<string>()

  for (const option of optionList) {
    const base = baseByKey.get(matchKey(option))
    if (!base) continue // 고아 옵션

    const isCredit = productType === 'credit'

    // 신용대출은 최종 대출금리(A) 행만 비교 대상이다.
    // 기준금리(B)·가산금리(C)·가감조정금리(D)는 금리의 구성요소일 뿐이며,
    // 이를 섞으면 가감조정금리(연 0.02% 등)가 최저금리로 둔갑한다.
    if (isCredit && !isFinalCreditRate(option)) continue

    const creditScoreRates = isCredit ? extractCreditScoreRates(option) : null

    let rateMin = parseRate(option.lend_rate_min)
    let rateMax = parseRate(option.lend_rate_max)
    let rateAvg = parseRate(option.lend_rate_avg)

    if (isCredit && creditScoreRates) {
      const derived = deriveCreditRateRange(creditScoreRates)
      rateMin = derived.min
      rateMax = derived.max
      rateAvg = parseRate(option.crdt_grad_avg)
    }

    // 금리 정보가 전혀 없으면 비교 불가 → 제외
    if (rateMin === null && rateMax === null && rateAvg === null) continue

    const id = buildOfferId(productType, base, option)
    if (seenIds.has(id)) continue // 동일 키 중복 방어
    seenIds.add(id)

    const companyName = parseText(base.kor_co_nm)
    const productName = parseText(base.fin_prdt_nm)
    if (!companyName || !productName) continue // 표기 불가능한 행

    offers.push({
      id,
      productType,
      disclosureMonth: parseText(base.dcls_month) ?? parseText(option.dcls_month) ?? '',
      companyCode: parseText(base.fin_co_no) ?? '',
      companyName,
      finGroupCode,
      finGroupName: FIN_GROUP_NAMES[finGroupCode] ?? finGroupCode,
      productCode: parseText(base.fin_prdt_cd) ?? '',
      productName,
      joinWay: parseJoinWay(base.join_way),
      incidentalExpense: parseText(base.loan_inci_expn),
      earlyRepayFee: parseText(base.erly_rpay_fee),
      delinquentRate: parseText(base.dly_rate),
      loanLimit: parseText(base.loan_lmt),
      repayType: parseText(option.rpay_type_nm),
      // 신용대출은 고정/변동 구분을 공시하지 않는다. 이 자리에 "대출금리"를 넣으면
      // 금리유형 필터가 의미 없는 선택지 하나만 갖게 되므로 비워둔다.
      rateType: isCredit ? null : parseText(option.lend_rate_type_nm),
      collateralType: parseText(option.mrtg_type_nm),
      creditProductType: resolveCreditProductType(option),
      rateMin,
      rateMax,
      rateAvg,
      creditScoreRates,
    })
  }

  return offers
}

// ─── 응답 봉투 처리 ─────────────────────────────────────────────────────────

export class FinlifeApiError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'FinlifeApiError'
  }
}

export interface ParsedPage {
  offers: LoanOffer[]
  nowPageNo: number
  maxPageNo: number
  totalCount: number
}

/** 숫자일 수도 문자열일 수도 있는 페이지 관련 필드 파싱 */
function parseCount(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === '') return fallback
  const num = Number(value)
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : fallback
}

/**
 * API 응답 한 페이지를 파싱한다. err_cd 가 정상(000)이 아니면 예외를 던진다.
 *
 * 오류를 조용히 삼키면 빈 비교표가 "상품 없음"처럼 보이게 되므로 반드시 던진다.
 */
export function parseApiPage(
  productType: LoanProductType,
  finGroupCode: string,
  payload: RawApiResponse
): ParsedPage {
  const result = payload?.result
  if (!result) {
    throw new FinlifeApiError('EMPTY', 'API 응답에 result 필드가 없습니다.')
  }

  const errCode = parseText(result.err_cd)
  if (errCode !== null && errCode !== '000') {
    const detail =
      parseText(result.err_msg) ?? API_ERROR_MESSAGES[errCode] ?? '알 수 없는 오류'
    throw new FinlifeApiError(errCode, `[${errCode}] ${detail}`)
  }

  const offers = joinOffers(
    productType,
    finGroupCode,
    result.baseList ?? [],
    result.optionList ?? []
  )

  return {
    offers,
    nowPageNo: parseCount(result.now_page_no, 1),
    maxPageNo: parseCount(result.max_page_no, 1),
    totalCount: parseCount(result.total_count, offers.length),
  }
}
