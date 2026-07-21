/**
 * 금융감독원 「금융상품 통합 비교공시」 OpenAPI 타입 정의
 *
 * 문서: https://finlife.fss.or.kr → 오픈API
 * 베이스: https://finlife.fss.or.kr/finlifeapi/{endpoint}.json
 * 공통 파라미터: auth(인증키), topFinGrpNo(권역코드), pageNo(페이지)
 *
 * 주의: API가 돌려주는 모든 값은 문자열이며, 결측은 null / "" / "-" 가 혼재한다.
 *       숫자 변환·결측 처리는 전부 normalize.ts 의 순수 함수가 담당한다.
 */

// ─── 권역(topFinGrpNo) ──────────────────────────────────────────────────────

/** 금융권역 코드 */
export const FIN_GROUPS = {
  bank: '020000',
  creditFinance: '030200',
  savingsBank: '030300',
  insurance: '050000',
  investment: '060000',
} as const

export type FinGroupCode = (typeof FIN_GROUPS)[keyof typeof FIN_GROUPS]

/** 권역 코드 → 한글명 */
export const FIN_GROUP_NAMES: Record<string, string> = {
  '020000': '은행',
  '030200': '여신전문',
  '030300': '저축은행',
  '050000': '보험',
  '060000': '금융투자',
}

// ─── 대출 상품 종류 ──────────────────────────────────────────────────────────

export type LoanProductType = 'mortgage' | 'rent' | 'credit'

/** 상품종류별 API 엔드포인트 및 수집 대상 권역 */
export const LOAN_ENDPOINTS: Record<
  LoanProductType,
  { endpoint: string; label: string; groups: FinGroupCode[] }
> = {
  mortgage: {
    endpoint: 'mortgageLoanProductsSearch',
    label: '주택담보대출',
    groups: [FIN_GROUPS.bank, FIN_GROUPS.insurance],
  },
  rent: {
    endpoint: 'rentHouseLoanProductsSearch',
    label: '전세자금대출',
    groups: [FIN_GROUPS.bank, FIN_GROUPS.insurance],
  },
  credit: {
    endpoint: 'creditLoanProductsSearch',
    label: '개인신용대출',
    groups: [FIN_GROUPS.bank, FIN_GROUPS.savingsBank, FIN_GROUPS.creditFinance],
  },
}

// ─── API 원본(raw) 응답 ─────────────────────────────────────────────────────

/** 모든 대출 상품이 공유하는 baseList 항목 */
export interface RawLoanBase {
  dcls_month?: string | null // 공시 제출월 (YYYYMM)
  fin_co_no?: string | null // 금융회사 코드
  kor_co_nm?: string | null // 금융회사명
  fin_prdt_cd?: string | null // 금융상품 코드
  fin_prdt_nm?: string | null // 금융상품명
  join_way?: string | null // 가입방법 (쉼표 구분)
  loan_inci_expn?: string | null // 대출 부대비용
  erly_rpay_fee?: string | null // 중도상환 수수료
  dly_rate?: string | null // 연체 이자율
  loan_lmt?: string | null // 대출 한도
  dcls_strt_day?: string | null // 공시 시작일
  dcls_end_day?: string | null // 공시 종료일
  fin_co_subm_day?: string | null // 금융회사 제출일
}

/** 주택담보대출 / 전세자금대출 optionList 항목 */
export interface RawSecuredLoanOption {
  dcls_month?: string | null
  fin_co_no?: string | null
  fin_prdt_cd?: string | null
  mrtg_type?: string | null // 담보유형 코드 (주담대 전용)
  mrtg_type_nm?: string | null // 담보유형명: 아파트 / 아파트외
  rpay_type?: string | null // 상환유형 코드
  rpay_type_nm?: string | null // 상환유형명: 분할상환 / 일시상환
  lend_rate_type?: string | null // 금리유형 코드
  lend_rate_type_nm?: string | null // 금리유형명: 고정금리 / 변동금리
  lend_rate_min?: string | null // 최저 금리 (연 %)
  lend_rate_max?: string | null // 최고 금리 (연 %)
  lend_rate_avg?: string | null // 전월 취급 평균금리 (연 %)
}

/** 개인신용대출 optionList 항목 — 신용점수 구간별 금리를 제공한다 */
export interface RawCreditLoanOption {
  dcls_month?: string | null
  fin_co_no?: string | null
  fin_prdt_cd?: string | null
  crdt_prdt_type?: string | null // 신용대출 종류 코드
  crdt_prdt_type_nm?: string | null // 일반신용대출 / 마이너스한도대출 등
  crdt_lend_rate_type?: string | null
  crdt_lend_rate_type_nm?: string | null // 대출금리 유형
  crdt_grad_1?: string | null // 신용점수 900 초과
  crdt_grad_4?: string | null // 801~900
  crdt_grad_5?: string | null // 701~800
  crdt_grad_6?: string | null // 601~700
  crdt_grad_10?: string | null // 501~600
  crdt_grad_11?: string | null // 401~500
  crdt_grad_12?: string | null // 400 이하
  crdt_grad_avg?: string | null // 평균 금리
}

export type RawLoanOption = RawSecuredLoanOption & RawCreditLoanOption

/**
 * 신용대출 금리유형(crdt_lend_rate_type) 코드.
 *
 * FSS 는 한 상품에 대해 금리를 구성요소별로 쪼개 여러 행으로 내려준다:
 *   A(대출금리) ≈ B(기준금리) + C(가산금리) − D(가감조정금리)
 *
 * 비교 가능한 최종 금리는 A 뿐이다. 이 구분을 놓치면 가감조정금리(우대 할인폭, 연 0.02% 등)가
 * 최저금리로 둔갑해 비교표 1위에 오른다. 실제로 개발 중 발생했던 오류다.
 */
export const CREDIT_RATE_TYPE_FINAL = 'A'

export const CREDIT_RATE_TYPE_NAMES: Record<string, string> = {
  A: '대출금리',
  B: '기준금리',
  C: '가산금리',
  D: '가감조정금리',
}

/**
 * 신용대출 상품종류(crdt_prdt_type) 코드.
 * API 가 crdt_prdt_type_nm 을 내려주지 않아 직접 매핑한다.
 * (2026-07 공시 데이터의 상품명을 전수 대조해 확인: 3번은 전부 "장기카드대출")
 */
export const CREDIT_PRODUCT_TYPE_NAMES: Record<string, string> = {
  '1': '일반신용대출',
  '2': '마이너스한도대출',
  '3': '장기카드대출',
}

/** API 응답 봉투 */
export interface RawApiResponse<O = RawLoanOption> {
  result?: {
    prdt_div?: string | null
    total_count?: number | string | null
    max_page_no?: number | string | null
    now_page_no?: number | string | null
    err_cd?: string | null
    err_msg?: string | null
    baseList?: RawLoanBase[] | null
    optionList?: O[] | null
  } | null
}

/** API 오류코드 → 사람이 읽을 수 있는 설명 */
export const API_ERROR_MESSAGES: Record<string, string> = {
  '000': '정상',
  '010': '인증키가 전달되지 않았습니다.',
  '011': '인증키가 유효하지 않습니다.',
  '020': '등록되지 않은 IP입니다. 금감원 오픈API에 호출 IP를 등록해야 합니다.',
  '021': '일시적으로 사용 중지된 인증키입니다.',
  '100': '필수 파라미터가 누락되었습니다.',
  '900': '정의되지 않은 오류가 발생했습니다.',
}

// ─── 신용점수 구간 ──────────────────────────────────────────────────────────

/**
 * 개인신용대출 금리는 신용점수(NICE 기준) 구간별로 공시된다.
 * 구간 경계는 금감원 공시 기준을 그대로 따른다.
 */
export interface CreditScoreBand {
  /** optionList 상의 필드명 */
  field: keyof RawCreditLoanOption
  /** 구간 하한 (이상) */
  min: number
  /** 구간 상한 (이하) */
  max: number
  label: string
}

export const CREDIT_SCORE_BANDS: CreditScoreBand[] = [
  { field: 'crdt_grad_1', min: 901, max: 1000, label: '900점 초과' },
  { field: 'crdt_grad_4', min: 801, max: 900, label: '801~900점' },
  { field: 'crdt_grad_5', min: 701, max: 800, label: '701~800점' },
  { field: 'crdt_grad_6', min: 601, max: 700, label: '601~700점' },
  { field: 'crdt_grad_10', min: 501, max: 600, label: '501~600점' },
  { field: 'crdt_grad_11', min: 401, max: 500, label: '401~500점' },
  { field: 'crdt_grad_12', min: 0, max: 400, label: '400점 이하' },
]

// ─── 정규화된 도메인 모델 ────────────────────────────────────────────────────

/** 신용점수 구간별 금리 (연 %) — 취급하지 않는 구간은 null */
export type CreditScoreRates = Partial<Record<string, number | null>>

/**
 * 정규화된 대출 오퍼 = 상품(baseList) × 옵션(optionList) 한 조합.
 * 비교표의 한 행에 대응한다.
 */
export interface LoanOffer {
  /** 안정적인 고유 키 (상품종류·회사·상품·옵션 조합) */
  id: string
  productType: LoanProductType
  /** 공시 제출월 (YYYYMM) — 데이터 기준 시점 */
  disclosureMonth: string
  companyCode: string
  companyName: string
  finGroupCode: string
  finGroupName: string
  productCode: string
  productName: string
  /** 가입방법 (쉼표 구분 문자열을 배열로 분해) */
  joinWay: string[]
  incidentalExpense: string | null
  earlyRepayFee: string | null
  delinquentRate: string | null
  loanLimit: string | null

  // 옵션 레벨
  /** 상환유형: 분할상환 / 일시상환 */
  repayType: string | null
  /** 금리유형: 고정금리 / 변동금리 */
  rateType: string | null
  /** 담보유형: 아파트 / 아파트외 (주담대 전용) */
  collateralType: string | null
  /** 신용대출 종류 (신용대출 전용) */
  creditProductType: string | null

  /** 최저 금리 (연 %) */
  rateMin: number | null
  /** 최고 금리 (연 %) */
  rateMax: number | null
  /** 전월 취급 평균금리 (연 %) */
  rateAvg: number | null

  /** 신용점수 구간별 금리 (신용대출 전용) */
  creditScoreRates: CreditScoreRates | null
}

/** 수집 실행 결과 요약 */
export interface SyncSummary {
  productType: LoanProductType
  finGroupCode: string
  fetchedPages: number
  offerCount: number
  disclosureMonth: string | null
  errors: string[]
}
