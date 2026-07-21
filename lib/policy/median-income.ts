/**
 * 기준 중위소득 (보건복지부 고시)
 *
 * 주거급여·청년월세지원·청년미래적금 등 상당수 제도가 "기준 중위소득 N% 이하"로
 * 자격을 정하므로, 가구원 수를 금액으로 환산하는 이 표가 판정의 전제가 된다.
 *
 * 출처: 보건복지부 「2026년 기준 중위소득 6.51% 역대 최대로 인상」 보도자료
 *       https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&list_no=1487098
 * 확인일: 2026-07-21
 *
 * 매년 7~8월경 다음 해 기준이 고시되므로 연 1회 갱신이 필요하다.
 */

/** 고시 기준연도 */
export const MEDIAN_INCOME_YEAR = 2026

/** 확인 기준일 */
export const MEDIAN_INCOME_AS_OF = '2026-07-21'

export const MEDIAN_INCOME_SOURCE = {
  name: '보건복지부 2026년 기준 중위소득 고시',
  url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1487098',
}

/** 가구원 수별 기준 중위소득 (월, 원) — 2026년 */
const MONTHLY_MEDIAN_INCOME: Record<number, number> = {
  1: 2_564_238,
  2: 4_199_292,
  3: 5_359_036,
  4: 6_494_738,
  5: 7_556_719,
  6: 8_555_952,
}

/** 표에 있는 최대 가구원 수 */
const MAX_TABLE_SIZE = 6

/**
 * 7인 이상 가구의 기준 중위소득.
 *
 * 복지부 고시는 7인 이상에 대해 "6인 기준에 5인→6인 증가분을 가구원 1인당 더한다"는
 * 방식을 쓴다. 표에 없는 구간을 임의로 추정하지 않고 이 규칙을 그대로 적용한다.
 */
function extrapolate(householdSize: number): number {
  const sixth = MONTHLY_MEDIAN_INCOME[6]
  const increment = MONTHLY_MEDIAN_INCOME[6] - MONTHLY_MEDIAN_INCOME[5]
  return sixth + increment * (householdSize - MAX_TABLE_SIZE)
}

/**
 * 가구원 수에 해당하는 월 기준 중위소득 (원).
 * 1인 미만은 1인으로 취급한다.
 */
export function monthlyMedianIncome(householdSize: number): number {
  const size = Math.max(1, Math.floor(householdSize))
  if (size <= MAX_TABLE_SIZE) return MONTHLY_MEDIAN_INCOME[size]
  return extrapolate(size)
}

/** 가구원 수에 해당하는 연 기준 중위소득 (원) */
export function annualMedianIncome(householdSize: number): number {
  return monthlyMedianIncome(householdSize) * 12
}

/**
 * "기준 중위소득 N% 이하"를 연소득 금액(원)으로 환산한다.
 *
 * @param householdSize 가구원 수
 * @param ratioPercent  기준 비율 (예: 180 → 중위소득의 180%)
 */
export function annualIncomeThreshold(householdSize: number, ratioPercent: number): number {
  return Math.round((annualMedianIncome(householdSize) * ratioPercent) / 100)
}

/**
 * 사용자의 연소득이 기준 중위소득의 몇 %인지 계산한다. (UI 설명용)
 */
export function medianIncomeRatio(annualIncome: number, householdSize: number): number {
  const median = annualMedianIncome(householdSize)
  if (median <= 0) return 0
  return Math.round((annualIncome / median) * 1000) / 10
}
