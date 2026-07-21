/**
 * 정책 지원제도 데이터 스키마
 *
 * 설계 배경 — 기존 정책 페이지들이 안고 있던 문제를 구조로 막는다:
 *
 * 1. 기준일이 없어 2024년 정보와 2026년 정보가 섞여 있어도 알 수 없었다.
 *    → 모든 제도에 `asOf`(확인 기준일)와 `source`(확인한 공식 출처)를 필수로 둔다.
 *
 * 2. 폐지·대체된 제도가 현행처럼 안내되고 있었다.
 *    (청년희망적금 → 청년도약계좌 → 청년미래적금 으로 두 번 바뀌었다)
 *    → `status` 와 `supersededBy` 로 생애주기를 표현한다.
 *
 * 3. 자격요건이 '소득 기준 충족' 같은 문장이라 판정에 쓸 수 없었다.
 *    → 판정 가능한 것은 `criteria` 에 수치로, 불가능한 것은 `manualChecks` 에 문장으로
 *      분리한다. 이 분리가 "확실히 미해당"과 "확인 필요"를 가르는 근거가 된다.
 *
 * 4. 금리·한도가 가장 빨리 낡는다(실측: 검증한 6건 전부 낡아 있었다).
 *    → `volatile` 로 묶어 기준일과 함께 노출하고, 판정에는 쓰지 않는다.
 */

// ─── 사용자 입력 ────────────────────────────────────────────────────────────

/** 거주 지역 구분 — 상당수 제도가 수도권/비수도권으로 한도를 달리한다 */
export type RegionType = 'capital' | 'metro' | 'other'

export const REGION_LABELS: Record<RegionType, string> = {
  capital: '수도권 (서울·경기·인천)',
  metro: '광역시',
  other: '그 외 지역',
}

export type MaritalStatus = 'single' | 'newlywed' | 'married'

export const MARITAL_LABELS: Record<MaritalStatus, string> = {
  single: '미혼',
  newlywed: '신혼 (혼인 7년 이내)',
  married: '기혼 (혼인 7년 초과)',
}

/** 자격 확인기에 사용자가 입력하는 값 */
export interface UserProfile {
  /** 만 나이 */
  age: number
  maritalStatus: MaritalStatus
  /** 본인 연소득 (원). 기혼이면 부부합산 */
  annualIncome: number
  /** 순자산 (원) — 자산에서 부채를 뺀 값 */
  netAssets: number
  /** 무주택 여부 */
  isHomeless: boolean
  region: RegionType
  /** 가구원 수 — 중위소득 기준 판정에 필요 */
  householdSize: number
}

// ─── 자격 요건 ──────────────────────────────────────────────────────────────

/** 최소/최대 범위 (원 또는 세) */
export interface NumericRange {
  min?: number
  max?: number
}

/**
 * 기계적으로 판정 가능한 자격 요건.
 * 지정하지 않은 항목은 "그 제도가 해당 조건을 보지 않는다"는 뜻이다.
 */
export interface PolicyCriteria {
  /** 만 나이 범위 */
  age?: NumericRange
  /** 연소득 상한 (원). 혼인상태별로 다르면 incomeByMarital 를 쓴다 */
  maxAnnualIncome?: number
  /** 혼인상태별 연소득 상한 (원) */
  incomeByMarital?: Partial<Record<MaritalStatus, number>>
  /** 순자산 상한 (원) */
  maxNetAssets?: number
  /**
   * 가구소득이 기준 중위소득의 몇 % 이하여야 하는지.
   * 가구원 수에 따라 금액이 달라지므로 median-income.ts 에서 환산한다.
   */
  maxMedianIncomeRatio?: number
  /** 무주택이어야 하는지 */
  requiresHomeless?: boolean
  /** 허용되는 혼인 상태 (미지정이면 무관) */
  maritalStatus?: MaritalStatus[]
  /** 지원 지역 (미지정이면 전국) */
  regions?: RegionType[]
}

// ─── 변동성 높은 정보 ───────────────────────────────────────────────────────

/**
 * 금리·한도처럼 자주 바뀌는 값.
 * 자격 판정에 쓰지 않고, 항상 기준일과 함께 참고용으로만 보여준다.
 */
export interface VolatileInfo {
  /** 금리 표기 (예: "연 2.2~3.3%") */
  rate?: string
  /** 한도 표기. 지역별로 다르면 limitByRegion 사용 */
  limit?: string
  /** 지역별 한도 */
  limitByRegion?: Partial<Record<RegionType, string>>
  /** 그 외 지원 내용 (예: "월 최대 20만원 × 최장 24개월") */
  benefit?: string
}

// ─── 신청 기간 ──────────────────────────────────────────────────────────────

/**
 * 상시 접수가 아닌 제도의 신청 창구.
 * 자격이 되어도 지금 신청할 수 없는 경우를 구분하기 위해 필요하다.
 * (예: 청년미래적금 2026년 1차는 6/22~7/3 로 종료)
 */
export interface ApplicationPeriod {
  /** YYYY-MM-DD */
  start: string
  /** YYYY-MM-DD */
  end: string
  /** 회차 설명 (예: "2026년 1차") */
  label?: string
}

// ─── 제도 ───────────────────────────────────────────────────────────────────

export type PolicyStatus =
  /** 현재 운영 중 (상시 또는 정기 접수) */
  | 'active'
  /** 신규 접수 종료 (기존 가입자만 유지) */
  | 'closed'
  /** 아직 확인하지 못한 제도 — 판정에 쓰지 않고 안내만 한다 */
  | 'unverified'

export type PolicyCategory = 'jeonse' | 'monthly' | 'purchase' | 'public' | 'asset' | 'living'

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  jeonse: '전세자금',
  monthly: '월세·주거비',
  purchase: '주택구입',
  public: '공공주택',
  asset: '자산형성',
  living: '생활자금',
}

export interface Policy {
  id: string
  name: string
  /** 운영 기관 */
  provider: string
  category: PolicyCategory
  /** 한 줄 설명 */
  summary: string

  status: PolicyStatus
  /** 이 제도를 대체한 후속 제도 id (status 가 closed 일 때) */
  supersededBy?: string
  /** closed 인 이유 */
  closedReason?: string

  /** 기계 판정용 자격요건 */
  criteria: PolicyCriteria
  /**
   * 수치로 판정할 수 없어 사용자가 직접 확인해야 하는 조건.
   * 이 항목이 있으면 판정 결과가 '해당'이어도 '확인 필요'를 함께 표시한다.
   */
  manualChecks: string[]

  /** 금리·한도 등 자주 바뀌는 정보 */
  volatile: VolatileInfo

  /** 신청 기간 (상시 접수면 생략) */
  applicationPeriods?: ApplicationPeriod[]
  /** 신청 방법 */
  howToApply: string

  /** 이 데이터를 확인한 날짜 (YYYY-MM-DD) */
  asOf: string
  /** 확인에 사용한 공식 출처 */
  source: {
    name: string
    url: string
  }
}

// ─── 판정 결과 ──────────────────────────────────────────────────────────────

export type MatchVerdict =
  /** 입력한 조건을 모두 충족 */
  | 'eligible'
  /** 명확히 미달하는 조건이 있음 */
  | 'ineligible'
  /** 수치 조건은 통과했으나 직접 확인이 필요한 조건이 남음 */
  | 'needsCheck'

/** 개별 조건 판정 내역 — 왜 되는지/안 되는지를 사용자에게 보여주기 위한 것 */
export interface CriterionResult {
  label: string
  passed: boolean
  /** 사용자 값과 기준을 함께 보여주는 설명 */
  detail: string
}

export interface PolicyMatch {
  policy: Policy
  verdict: MatchVerdict
  /** 통과한 조건들 */
  passed: CriterionResult[]
  /** 미달한 조건들 — 여기가 이 도구의 핵심 가치다 */
  failed: CriterionResult[]
  /** 지금 신청할 수 있는지 (신청 기간 기준) */
  isOpenNow: boolean
  /** 다음 신청 기간 (있다면) */
  nextPeriod?: ApplicationPeriod
}
