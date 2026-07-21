/**
 * 금융감독원 finlife OpenAPI 클라이언트
 *
 * 이 클라이언트는 **웹 요청 경로에서 호출하지 않는다.** GitHub Actions 수집 잡에서만 사용한다.
 * 이유:
 *  - FSS 는 호출 IP 제한을 두며(err_cd 020), 서버리스의 유동 IP 는 등록이 불가능하다.
 *  - 사용자 요청마다 외부 API 를 치면 지연·rate limit·장애가 그대로 노출된다.
 * 사이트는 Supabase 에 적재된 스냅샷만 읽는다. (lib/finlife/repository.ts)
 */

import { FinlifeApiError, parseApiPage } from './normalize'
import {
  LOAN_ENDPOINTS,
  type FinGroupCode,
  type LoanOffer,
  type LoanProductType,
  type RawApiResponse,
  type SyncSummary,
} from './types'

const BASE_URL = 'https://finlife.fss.or.kr/finlifeapi'

/** 재시도해도 결과가 달라지지 않는 오류코드 (인증·권한 문제) */
const PERMANENT_ERROR_CODES = new Set(['010', '011', '020', '021', '100'])

export interface FetchOptions {
  /** 인증키. 미지정 시 FSS_FINLIFE_API_KEY 환경변수 */
  auth?: string
  /** 페이지당 타임아웃 (ms) */
  timeoutMs?: number
  /** 네트워크 오류 시 재시도 횟수 */
  retries?: number
  /** 안전장치: 최대 조회 페이지 수 */
  maxPages?: number
  /** 페이지 간 호출 간격 (ms) — 상대 서버 배려 */
  delayMs?: number
  /** 테스트 주입용 */
  fetchImpl?: typeof fetch
}

const DEFAULTS = {
  timeoutMs: 15_000,
  retries: 2,
  maxPages: 20,
  delayMs: 250,
}

function resolveAuth(explicit?: string): string {
  const auth = explicit ?? process.env.FSS_FINLIFE_API_KEY
  if (!auth) {
    throw new FinlifeApiError(
      'NO_KEY',
      'FSS_FINLIFE_API_KEY 가 설정되지 않았습니다. https://finlife.fss.or.kr 오픈API 에서 인증키를 발급받아 환경변수에 넣어주세요.'
    )
  }
  return auth
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 한 페이지 조회 (재시도 포함) */
async function fetchPage(
  productType: LoanProductType,
  finGroupCode: string,
  pageNo: number,
  options: Required<Pick<FetchOptions, 'timeoutMs' | 'retries'>> & {
    auth: string
    fetchImpl: typeof fetch
  }
) {
  const { endpoint } = LOAN_ENDPOINTS[productType]
  const url =
    `${BASE_URL}/${endpoint}.json` +
    `?auth=${encodeURIComponent(options.auth)}` +
    `&topFinGrpNo=${encodeURIComponent(finGroupCode)}` +
    `&pageNo=${pageNo}`

  let lastError: unknown

  for (let attempt = 0; attempt <= options.retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), options.timeoutMs)

    try {
      const response = await options.fetchImpl(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      const payload = (await response.json()) as RawApiResponse
      return parseApiPage(productType, finGroupCode, payload)
    } catch (error) {
      lastError = error

      // 인증·권한 오류는 재시도해도 소용없으므로 즉시 중단
      if (error instanceof FinlifeApiError && PERMANENT_ERROR_CODES.has(error.code)) {
        throw error
      }
      if (attempt < options.retries) {
        await sleep(500 * Math.pow(2, attempt)) // 지수 백오프
      }
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`알 수 없는 오류: ${String(lastError)}`)
}

/**
 * 특정 상품종류·권역의 전체 오퍼를 페이지네이션하며 수집한다.
 */
export async function fetchLoanOffers(
  productType: LoanProductType,
  finGroupCode: FinGroupCode | string,
  options: FetchOptions = {}
): Promise<{ offers: LoanOffer[]; summary: SyncSummary }> {
  const auth = resolveAuth(options.auth)
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs
  const retries = options.retries ?? DEFAULTS.retries
  const maxPages = options.maxPages ?? DEFAULTS.maxPages
  const delayMs = options.delayMs ?? DEFAULTS.delayMs

  const offers: LoanOffer[] = []
  const errors: string[] = []
  let fetchedPages = 0
  let pageNo = 1
  let maxPageNo = 1

  while (pageNo <= maxPageNo && pageNo <= maxPages) {
    const page = await fetchPage(productType, finGroupCode, pageNo, {
      auth,
      fetchImpl,
      timeoutMs,
      retries,
    })

    offers.push(...page.offers)
    fetchedPages++
    maxPageNo = page.maxPageNo
    pageNo++

    if (pageNo <= maxPageNo && pageNo <= maxPages && delayMs > 0) {
      await sleep(delayMs)
    }
  }

  if (maxPageNo > maxPages) {
    errors.push(`페이지 상한(${maxPages})에 걸려 ${maxPageNo - maxPages}개 페이지를 건너뛰었습니다.`)
  }

  // 여러 페이지에 같은 오퍼가 중복 등장하는 경우 방어
  const deduped = new Map<string, LoanOffer>()
  for (const offer of offers) deduped.set(offer.id, offer)
  const unique = Array.from(deduped.values())

  return {
    offers: unique,
    summary: {
      productType,
      finGroupCode,
      fetchedPages,
      offerCount: unique.length,
      disclosureMonth: unique[0]?.disclosureMonth ?? null,
      errors,
    },
  }
}

/**
 * 한 상품종류에 대해 관련 권역 전체를 수집한다.
 * 한 권역이 실패해도 나머지는 계속 수집하고, 실패 내역을 summary 에 남긴다.
 */
export async function fetchAllGroupsForProduct(
  productType: LoanProductType,
  options: FetchOptions = {}
): Promise<{ offers: LoanOffer[]; summaries: SyncSummary[] }> {
  const { groups } = LOAN_ENDPOINTS[productType]
  const offers: LoanOffer[] = []
  const summaries: SyncSummary[] = []

  for (const group of groups) {
    try {
      const result = await fetchLoanOffers(productType, group, options)
      offers.push(...result.offers)
      summaries.push(result.summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      summaries.push({
        productType,
        finGroupCode: group,
        fetchedPages: 0,
        offerCount: 0,
        disclosureMonth: null,
        errors: [message],
      })
      // 인증키 자체가 잘못된 경우 나머지 권역도 전부 실패하므로 즉시 중단
      if (error instanceof FinlifeApiError && PERMANENT_ERROR_CODES.has(error.code)) {
        throw error
      }
    }
  }

  return { offers, summaries }
}
