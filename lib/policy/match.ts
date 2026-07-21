/**
 * 정책 자격 판정 엔진 (순수 함수 전용)
 *
 * 설계 원칙 — 이 도구는 "받을 수 있다"고 단정하는 도구이므로 틀리면 해롭다.
 * 그래서 판정을 3단계로 나눈다:
 *
 *   ineligible  수치 조건에서 명확히 미달 → 왜 안 되는지 근거를 함께 준다
 *   needsCheck  수치 조건은 통과했으나 사람이 확인해야 할 조건이 남음
 *   eligible    수치·수동 조건이 모두 없거나 통과
 *
 * 실제로는 대부분의 제도가 서류 심사 항목을 갖고 있어 needsCheck 로 떨어진다.
 * 이는 결함이 아니라 의도다. "자격이 됩니다"가 아니라 "1차 요건은 맞으니
 * 다음 항목만 확인하세요"가 정직한 출력이다.
 */

import { annualIncomeThreshold, medianIncomeRatio } from './median-income'
import {
  MARITAL_LABELS,
  REGION_LABELS,
  type ApplicationPeriod,
  type CriterionResult,
  type MatchVerdict,
  type Policy,
  type PolicyMatch,
  type UserProfile,
} from './types'

// ─── 표시 보조 ──────────────────────────────────────────────────────────────

/** 금액을 억/만 단위로 (예: 345000000 → "3억 4,500만원") */
export function formatMoney(value: number): string {
  const won = Math.round(value)
  if (won === 0) return '0원'
  const eok = Math.floor(won / 100_000_000)
  const man = Math.floor((won % 100_000_000) / 10_000)
  if (eok > 0) return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  if (man > 0) return `${man.toLocaleString()}만원`
  return `${won.toLocaleString()}원`
}

// ─── 개별 조건 판정 ─────────────────────────────────────────────────────────

/**
 * 제도 하나에 대해 사용자의 각 조건을 판정한다.
 * 통과/미통과 모두 사유를 남겨 UI 가 "왜"를 보여줄 수 있게 한다.
 */
export function evaluateCriteria(policy: Policy, profile: UserProfile): CriterionResult[] {
  const results: CriterionResult[] = []
  const { criteria } = policy

  // 나이
  if (criteria.age) {
    const { min, max } = criteria.age
    const okMin = min === undefined || profile.age >= min
    const okMax = max === undefined || profile.age <= max
    const range =
      min !== undefined && max !== undefined
        ? `만 ${min}~${max}세`
        : min !== undefined
          ? `만 ${min}세 이상`
          : `만 ${max}세 이하`
    results.push({
      label: '나이',
      passed: okMin && okMax,
      detail: `${range} 대상 · 입력하신 나이 만 ${profile.age}세`,
    })
  }

  // 혼인 상태
  if (criteria.maritalStatus && criteria.maritalStatus.length > 0) {
    const passed = criteria.maritalStatus.includes(profile.maritalStatus)
    results.push({
      label: '혼인 상태',
      passed,
      detail: `${criteria.maritalStatus.map((m) => MARITAL_LABELS[m]).join(' 또는 ')} 대상 · 입력하신 상태 ${MARITAL_LABELS[profile.maritalStatus]}`,
    })
  }

  // 연소득 — 혼인상태별 완화 기준이 있으면 그쪽을 우선한다
  const incomeLimit =
    criteria.incomeByMarital?.[profile.maritalStatus] ?? criteria.maxAnnualIncome
  if (incomeLimit !== undefined) {
    const passed = profile.annualIncome <= incomeLimit
    results.push({
      label: '연소득',
      passed,
      detail: `${formatMoney(incomeLimit)} 이하 · 입력하신 소득 ${formatMoney(profile.annualIncome)}`,
    })
  }

  // 기준 중위소득 대비 가구소득
  if (criteria.maxMedianIncomeRatio !== undefined) {
    const threshold = annualIncomeThreshold(profile.householdSize, criteria.maxMedianIncomeRatio)
    const passed = profile.annualIncome <= threshold
    const ratio = medianIncomeRatio(profile.annualIncome, profile.householdSize)
    results.push({
      label: '가구소득 (중위소득 대비)',
      passed,
      detail:
        `기준 중위소득 ${criteria.maxMedianIncomeRatio}% 이하 = 연 ${formatMoney(threshold)} ` +
        `(${profile.householdSize}인 가구) · 입력하신 소득은 중위소득의 약 ${ratio}%`,
    })
  }

  // 순자산
  if (criteria.maxNetAssets !== undefined) {
    const passed = profile.netAssets <= criteria.maxNetAssets
    results.push({
      label: '순자산',
      passed,
      detail: `${formatMoney(criteria.maxNetAssets)} 이하 · 입력하신 순자산 ${formatMoney(profile.netAssets)}`,
    })
  }

  // 무주택
  if (criteria.requiresHomeless) {
    results.push({
      label: '무주택 여부',
      passed: profile.isHomeless,
      detail: profile.isHomeless
        ? '무주택 세대 대상 · 무주택으로 입력하셨습니다'
        : '무주택 세대만 신청할 수 있습니다 · 주택 보유로 입력하셨습니다',
    })
  }

  // 지역
  if (criteria.regions && criteria.regions.length > 0) {
    const passed = criteria.regions.includes(profile.region)
    results.push({
      label: '거주 지역',
      passed,
      detail: `${criteria.regions.map((r) => REGION_LABELS[r]).join(', ')} 대상 · 입력하신 지역 ${REGION_LABELS[profile.region]}`,
    })
  }

  return results
}

// ─── 신청 기간 ──────────────────────────────────────────────────────────────

/** YYYY-MM-DD 문자열을 그날 00:00(로컬) 기준 Date 로. 잘못된 형식이면 null */
function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(date.getTime()) ? null : date
}

/** 오늘이 신청 기간 안인지, 아니면 다음 기간이 언제인지 판단한다 */
export function evaluateApplicationWindow(
  policy: Policy,
  now: Date
): { isOpenNow: boolean; nextPeriod?: ApplicationPeriod } {
  const periods = policy.applicationPeriods
  // 신청 기간이 명시되지 않은 제도는 상시 접수로 본다
  if (!periods || periods.length === 0) return { isOpenNow: true }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  for (const period of periods) {
    const start = parseDate(period.start)
    const end = parseDate(period.end)
    if (!start || !end) continue
    if (today >= start && today <= end) return { isOpenNow: true }
  }

  // 아직 시작하지 않은 기간 중 가장 이른 것
  const upcoming = periods
    .map((p) => ({ period: p, start: parseDate(p.start) }))
    .filter((x): x is { period: ApplicationPeriod; start: Date } => x.start !== null)
    .filter((x) => x.start > today)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0]

  return { isOpenNow: false, nextPeriod: upcoming?.period }
}

// ─── 종합 판정 ──────────────────────────────────────────────────────────────

/** 제도 하나에 대한 판정 */
export function matchPolicy(policy: Policy, profile: UserProfile, now: Date = new Date()): PolicyMatch {
  const results = evaluateCriteria(policy, profile)
  const passed = results.filter((r) => r.passed)
  const failed = results.filter((r) => !r.passed)

  let verdict: MatchVerdict
  if (failed.length > 0) {
    verdict = 'ineligible'
  } else if (policy.manualChecks.length > 0) {
    // 수치로 확인할 수 없는 조건이 남아 있으면 단정하지 않는다
    verdict = 'needsCheck'
  } else {
    verdict = 'eligible'
  }

  const { isOpenNow, nextPeriod } = evaluateApplicationWindow(policy, now)

  return { policy, verdict, passed, failed, isOpenNow, nextPeriod }
}

/** 판정 우선순위 — 해당 가능성이 높고 지금 신청 가능한 것부터 */
function verdictRank(match: PolicyMatch): number {
  if (match.verdict === 'ineligible') return 3
  // 자격이 되더라도 지금 신청할 수 없으면 뒤로 민다
  if (!match.isOpenNow) return 2
  return match.verdict === 'eligible' ? 0 : 1
}

export interface MatchSummary {
  /** 해당 가능성이 있는 제도 (eligible + needsCheck) */
  matched: PolicyMatch[]
  /** 조건 미달인 제도 — 무엇이 걸리는지 보여주기 위해 함께 반환한다 */
  unmatched: PolicyMatch[]
  /** 지금 신청 가능한 제도 수 */
  openNowCount: number
}

/**
 * 전체 제도를 판정한다.
 *
 * 조건 미달 제도를 버리지 않고 함께 돌려주는 것이 핵심이다.
 * "소득이 300만원만 낮았으면 됐다"는 정보가 사용자에게 가장 쓸모 있다.
 */
export function matchAllPolicies(
  policies: Policy[],
  profile: UserProfile,
  now: Date = new Date()
): MatchSummary {
  const all = policies.map((policy) => matchPolicy(policy, profile, now))

  const matched = all.filter((m) => m.verdict !== 'ineligible')
  const unmatched = all.filter((m) => m.verdict === 'ineligible')

  const sortFn = (a: PolicyMatch, b: PolicyMatch) => {
    const rank = verdictRank(a) - verdictRank(b)
    if (rank !== 0) return rank
    // 미달 항목이 적은 순 → 조금만 조정하면 되는 제도를 앞에
    if (a.failed.length !== b.failed.length) return a.failed.length - b.failed.length
    return a.policy.name.localeCompare(b.policy.name, 'ko')
  }

  return {
    matched: matched.sort(sortFn),
    unmatched: unmatched.sort(sortFn),
    openNowCount: matched.filter((m) => m.isOpenNow).length,
  }
}

// ─── 기준일 신선도 ──────────────────────────────────────────────────────────

/**
 * 확인 기준일이 오래됐는지 판단한다.
 *
 * 정책 조건은 통상 연 단위로 바뀌지만 금리·한도는 훨씬 자주 바뀐다.
 * (실측: 기존 데이터의 금리·한도는 검증한 6건 전부 낡아 있었다)
 * 그래서 6개월을 경고 기준으로 둔다.
 */
export function isStale(asOf: string, now: Date = new Date(), months = 6): boolean {
  const checked = parseDate(asOf)
  if (!checked) return true
  const limit = new Date(checked)
  limit.setMonth(limit.getMonth() + months)
  return now > limit
}

/** 기준일로부터 며칠 지났는지 */
export function daysSince(asOf: string, now: Date = new Date()): number {
  const checked = parseDate(asOf)
  if (!checked) return Number.POSITIVE_INFINITY
  return Math.floor((now.getTime() - checked.getTime()) / (1000 * 60 * 60 * 24))
}
