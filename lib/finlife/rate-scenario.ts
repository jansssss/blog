/**
 * 고정금리 vs 변동금리 손익분기 계산 (순수 함수 전용)
 *
 * 기존 페이지는 "변동금리가 1%p 오르면 월 X원 늘어납니다"까지만 보여줬다.
 * 그건 정작 사용자가 알고 싶은 것에 답하지 않는다. 실제 질문은 이것이다:
 *
 *   "지금 변동이 0.47%p 싼데, 앞으로 얼마나 올라야 고정을 고르는 게 나았을까?"
 *
 * 이 파일은 그 한 숫자(손익분기 상승폭)를 구한다.
 *
 * 모델: 변동금리는 처음 changeAfterYears 년 동안 초기금리를 유지하다가 한 번
 * 상승해 만기까지 그대로 간다고 본다. 상승 시점에 남은 잔액·잔여기간으로
 * 월납입액을 재산정하는데, 이는 실제 은행의 변동금리 재산정 방식과 같다.
 *
 * 왜 이 단순 모델인가: 금리 경로를 정교하게 예측하는 척하면 그 자체가 거짓이 된다.
 * "한 번 올라 유지"는 가장 보수적이면서 설명 가능한 가정이고, 사용자가 상승 시점과
 * 폭을 직접 조절할 수 있으므로 판단은 사용자에게 남는다.
 */

/** 원리금균등 월납입액 */
export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  const pow = Math.pow(1 + r, months)
  return (principal * r * pow) / (pow - 1)
}

/**
 * 원리금균등 상환 중 k개월 경과 시점의 잔액.
 * 폐쇄형: B = P(1+r)^k − PMT·((1+r)^k − 1)/r
 */
export function remainingBalance(
  principal: number,
  annualRate: number,
  months: number,
  elapsedMonths: number
): number {
  if (elapsedMonths <= 0) return principal
  if (elapsedMonths >= months) return 0

  const r = annualRate / 12 / 100
  const pmt = monthlyPayment(principal, annualRate, months)
  if (r === 0) return Math.max(0, principal - pmt * elapsedMonths)

  const pow = Math.pow(1 + r, elapsedMonths)
  return Math.max(0, principal * pow - pmt * ((pow - 1) / r))
}

export interface ScenarioResult {
  /** 상승 전 월납입액 (원) */
  monthlyBefore: number
  /** 상승 후 월납입액 (원) */
  monthlyAfter: number
  /** 만기까지 총이자 (원) */
  totalInterest: number
  /** 만기까지 총상환액 (원) */
  totalPayment: number
}

/**
 * 변동금리 시나리오의 총이자를 계산한다.
 *
 * @param changeAfterYears 몇 년 뒤 금리가 바뀌는지 (0이면 처음부터 변경 후 금리)
 * @param rateAfter        변경 후 연 금리 (%)
 */
export function simulateVariable(
  principal: number,
  months: number,
  rateBefore: number,
  changeAfterYears: number,
  rateAfter: number
): ScenarioResult {
  const changeMonth = Math.min(months, Math.max(0, Math.round(changeAfterYears * 12)))

  const pmtBefore = monthlyPayment(principal, rateBefore, months)

  // 금리 변경이 없거나 만기 이후면 단일 금리와 같다
  if (changeMonth >= months) {
    const totalPayment = pmtBefore * months
    return {
      monthlyBefore: pmtBefore,
      monthlyAfter: pmtBefore,
      totalInterest: Math.max(0, totalPayment - principal),
      totalPayment,
    }
  }

  const balance = remainingBalance(principal, rateBefore, months, changeMonth)
  const remainMonths = months - changeMonth
  const pmtAfter = monthlyPayment(balance, rateAfter, remainMonths)

  const totalPayment = pmtBefore * changeMonth + pmtAfter * remainMonths
  return {
    monthlyBefore: pmtBefore,
    monthlyAfter: pmtAfter,
    totalInterest: Math.max(0, totalPayment - principal),
    totalPayment,
  }
}

/** 고정금리(단일 금리) 시나리오 */
export function simulateFixed(
  principal: number,
  months: number,
  rate: number
): ScenarioResult {
  return simulateVariable(principal, months, rate, Number.POSITIVE_INFINITY, rate)
}

// ─── 손익분기 ───────────────────────────────────────────────────────────────

/** 손익분기 탐색 상한 (%p) — 이 이상 올라야 뒤집힌다면 사실상 고정이 불리하다 */
const MAX_SEARCH_DELTA = 15
/** 이분탐색 허용 오차 (%p) */
const TOLERANCE = 0.001

export interface BreakEvenResult {
  /**
   * 변동금리가 이만큼(%p) 넘게 오르면 총이자가 고정금리를 넘어선다.
   * null 이면 탐색 범위 안에서 뒤집히지 않는다는 뜻이다.
   */
  deltaPoints: number | null
  /** 손익분기 시점의 변동금리 수준 (%) */
  breakEvenRate: number | null
  /**
   * 이미 변동금리 총이자가 고정금리보다 큰 상태.
   * (변동금리가 고정금리보다 높거나 같은 경우)
   */
  alreadyWorse: boolean
}

/**
 * 변동금리가 몇 %p 오르면 고정금리와 총이자가 같아지는지 이분탐색으로 구한다.
 *
 * 총이자는 상승폭에 대해 단조증가하므로 이분탐색이 안전하다.
 */
export function findBreakEven(
  principal: number,
  months: number,
  fixedRate: number,
  variableRate: number,
  changeAfterYears: number
): BreakEvenResult {
  const fixedInterest = simulateFixed(principal, months, fixedRate).totalInterest
  const interestAt = (delta: number) =>
    simulateVariable(principal, months, variableRate, changeAfterYears, variableRate + delta)
      .totalInterest

  // 금리가 전혀 안 올라도 이미 변동이 불리한 경우
  if (interestAt(0) >= fixedInterest) {
    return { deltaPoints: 0, breakEvenRate: variableRate, alreadyWorse: true }
  }

  // 탐색 상한까지 올려도 안 뒤집히면 (기간이 거의 안 남은 경우 등) 없음으로 본다
  if (interestAt(MAX_SEARCH_DELTA) < fixedInterest) {
    return { deltaPoints: null, breakEvenRate: null, alreadyWorse: false }
  }

  let lo = 0
  let hi = MAX_SEARCH_DELTA
  while (hi - lo > TOLERANCE) {
    const mid = (lo + hi) / 2
    if (interestAt(mid) < fixedInterest) lo = mid
    else hi = mid
  }

  const delta = Math.round(((lo + hi) / 2) * 100) / 100
  return {
    deltaPoints: delta,
    breakEvenRate: Math.round((variableRate + delta) * 100) / 100,
    alreadyWorse: false,
  }
}

// ─── 그래프용 데이터 ────────────────────────────────────────────────────────

export interface ScenarioPoint {
  /** 변동금리 상승폭 (%p) */
  delta: number
  /** 그 경우 변동금리 총이자 (원) */
  variable: number
  /** 고정금리 총이자 (원) — 상승폭과 무관하게 일정 */
  fixed: number
}

/**
 * 상승폭 0 ~ maxDelta 구간의 총이자 곡선을 만든다.
 * 고정금리 수평선과의 교차점이 곧 손익분기다.
 */
export function buildScenarioCurve(
  principal: number,
  months: number,
  fixedRate: number,
  variableRate: number,
  changeAfterYears: number,
  maxDelta = 3,
  steps = 13
): ScenarioPoint[] {
  const fixedInterest = simulateFixed(principal, months, fixedRate).totalInterest
  const points: ScenarioPoint[] = []

  for (let i = 0; i <= steps; i++) {
    const delta = Math.round(((maxDelta * i) / steps) * 100) / 100
    points.push({
      delta,
      variable: Math.round(
        simulateVariable(principal, months, variableRate, changeAfterYears, variableRate + delta)
          .totalInterest
      ),
      fixed: Math.round(fixedInterest),
    })
  }
  return points
}
