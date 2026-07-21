import { describe, expect, it } from 'vitest'

import { ACTIVE_POLICIES, CLOSED_POLICIES, POLICIES } from '@/lib/policy/data'
import {
  daysSince,
  evaluateApplicationWindow,
  evaluateCriteria,
  formatMoney,
  isStale,
  matchAllPolicies,
  matchPolicy,
} from '@/lib/policy/match'
import {
  annualIncomeThreshold,
  annualMedianIncome,
  medianIncomeRatio,
  monthlyMedianIncome,
} from '@/lib/policy/median-income'
import type { Policy, UserProfile } from '@/lib/policy/types'

// ─── 기준 중위소득 ──────────────────────────────────────────────────────────

describe('기준 중위소득', () => {
  it('복지부 고시 금액을 그대로 반환한다 (2026년)', () => {
    expect(monthlyMedianIncome(1)).toBe(2_564_238)
    expect(monthlyMedianIncome(4)).toBe(6_494_738)
    expect(monthlyMedianIncome(6)).toBe(8_555_952)
  })

  it('7인 이상은 6인 기준에 증가분을 더해 산출한다', () => {
    const increment = monthlyMedianIncome(6) - monthlyMedianIncome(5)
    expect(monthlyMedianIncome(7)).toBe(monthlyMedianIncome(6) + increment)
    expect(monthlyMedianIncome(8)).toBe(monthlyMedianIncome(6) + increment * 2)
  })

  it('0인·음수 가구는 1인으로 취급한다', () => {
    expect(monthlyMedianIncome(0)).toBe(monthlyMedianIncome(1))
    expect(monthlyMedianIncome(-3)).toBe(monthlyMedianIncome(1))
  })

  it('연소득 환산은 12배다', () => {
    expect(annualMedianIncome(4)).toBe(6_494_738 * 12)
  })

  it('중위소득 비율을 금액으로 환산한다', () => {
    // 주거급여 기준: 4인 가구 중위 48%
    const threshold = annualIncomeThreshold(4, 48)
    expect(threshold).toBe(Math.round(6_494_738 * 12 * 0.48))
    // 4인 기준 월 311만원 수준이라는 복지부 발표와 일치해야 한다
    expect(Math.round(threshold / 12)).toBeGreaterThan(3_050_000)
    expect(Math.round(threshold / 12)).toBeLessThan(3_150_000)
  })

  it('사용자 소득이 중위소득의 몇 %인지 계산한다', () => {
    const income = annualMedianIncome(3)
    expect(medianIncomeRatio(income, 3)).toBe(100)
    expect(medianIncomeRatio(income / 2, 3)).toBe(50)
  })
})

// ─── 데이터 무결성 ──────────────────────────────────────────────────────────

describe('정책 데이터셋 무결성', () => {
  it('모든 제도에 확인 기준일과 공식 출처가 있다', () => {
    for (const policy of POLICIES) {
      expect(policy.asOf, `${policy.name}: asOf 누락`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(policy.source.url, `${policy.name}: 출처 URL 누락`).toMatch(/^https:\/\//)
      expect(policy.source.name.length, `${policy.name}: 출처명 누락`).toBeGreaterThan(0)
    }
  })

  it('출처는 공식 기관 도메인만 사용한다 (블로그·위키 금지)', () => {
    const allowed = /\.(go\.kr|or\.kr)(\/|$)/
    for (const policy of POLICIES) {
      expect(policy.source.url, `${policy.name}: 비공식 출처`).toMatch(allowed)
    }
  })

  it('제도 id 가 중복되지 않는다', () => {
    const ids = POLICIES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('종료된 제도는 사유를 명시한다', () => {
    for (const policy of CLOSED_POLICIES) {
      expect(policy.closedReason, `${policy.name}: 종료 사유 누락`).toBeTruthy()
    }
  })

  it('supersededBy 가 가리키는 제도가 실제로 존재한다', () => {
    for (const policy of POLICIES) {
      if (!policy.supersededBy) continue
      const target = POLICIES.find((p) => p.id === policy.supersededBy)
      expect(target, `${policy.name}: 후속제도 ${policy.supersededBy} 없음`).toBeDefined()
    }
  })

  it('판정 대상에는 종료된 제도가 포함되지 않는다', () => {
    expect(ACTIVE_POLICIES.every((p) => p.status === 'active')).toBe(true)
    expect(ACTIVE_POLICIES.some((p) => p.id === 'youth-hope-savings')).toBe(false)
  })

  it('신청 기간은 시작일이 종료일보다 앞선다', () => {
    for (const policy of POLICIES) {
      for (const period of policy.applicationPeriods ?? []) {
        expect(period.start <= period.end, `${policy.name}: 신청기간 역전`).toBe(true)
      }
    }
  })
})

// ─── 조건 판정 ──────────────────────────────────────────────────────────────

const baseProfile: UserProfile = {
  age: 30,
  maritalStatus: 'single',
  annualIncome: 40_000_000,
  netAssets: 100_000_000,
  isHomeless: true,
  region: 'capital',
  householdSize: 1,
}

function policyOf(partial: Partial<Policy>): Policy {
  return {
    id: 'test',
    name: '테스트 제도',
    provider: '테스트',
    category: 'jeonse',
    summary: '테스트',
    status: 'active',
    criteria: {},
    manualChecks: [],
    volatile: {},
    howToApply: '테스트',
    asOf: '2026-07-21',
    source: { name: '테스트', url: 'https://test.go.kr' },
    ...partial,
  }
}

describe('evaluateCriteria', () => {
  it('나이 범위를 판정한다', () => {
    const p = policyOf({ criteria: { age: { min: 19, max: 34 } } })
    expect(evaluateCriteria(p, { ...baseProfile, age: 30 })[0].passed).toBe(true)
    expect(evaluateCriteria(p, { ...baseProfile, age: 35 })[0].passed).toBe(false)
    expect(evaluateCriteria(p, { ...baseProfile, age: 18 })[0].passed).toBe(false)
  })

  it('경계값을 포함으로 처리한다', () => {
    const p = policyOf({ criteria: { age: { min: 19, max: 34 } } })
    expect(evaluateCriteria(p, { ...baseProfile, age: 19 })[0].passed).toBe(true)
    expect(evaluateCriteria(p, { ...baseProfile, age: 34 })[0].passed).toBe(true)
  })

  it('혼인상태별 완화된 소득기준을 우선 적용한다', () => {
    // 버팀목: 일반 5천만원, 신혼 7.5천만원
    const p = policyOf({
      criteria: { maxAnnualIncome: 50_000_000, incomeByMarital: { newlywed: 75_000_000 } },
    })
    const income = 60_000_000
    expect(evaluateCriteria(p, { ...baseProfile, annualIncome: income })[0].passed).toBe(false)
    expect(
      evaluateCriteria(p, { ...baseProfile, annualIncome: income, maritalStatus: 'newlywed' })[0].passed
    ).toBe(true)
  })

  it('무주택 요건을 판정한다', () => {
    const p = policyOf({ criteria: { requiresHomeless: true } })
    expect(evaluateCriteria(p, { ...baseProfile, isHomeless: true })[0].passed).toBe(true)
    expect(evaluateCriteria(p, { ...baseProfile, isHomeless: false })[0].passed).toBe(false)
  })

  it('중위소득 기준은 가구원 수에 따라 달라진다', () => {
    const p = policyOf({ criteria: { maxMedianIncomeRatio: 60 } })
    // 1인 가구 중위 60% = 약 1,846만원
    const income = 25_000_000
    expect(evaluateCriteria(p, { ...baseProfile, annualIncome: income, householdSize: 1 })[0].passed).toBe(false)
    // 같은 소득도 4인 가구면 통과한다
    expect(evaluateCriteria(p, { ...baseProfile, annualIncome: income, householdSize: 4 })[0].passed).toBe(true)
  })

  it('기준이 없는 항목은 판정하지 않는다', () => {
    const p = policyOf({ criteria: {} })
    expect(evaluateCriteria(p, baseProfile)).toHaveLength(0)
  })

  it('판정 결과에는 기준과 입력값이 함께 담긴다', () => {
    const p = policyOf({ criteria: { maxAnnualIncome: 50_000_000 } })
    const result = evaluateCriteria(p, { ...baseProfile, annualIncome: 60_000_000 })[0]
    expect(result.detail).toContain('5,000만원')
    expect(result.detail).toContain('6,000만원')
  })
})

// ─── 신청 기간 ──────────────────────────────────────────────────────────────

describe('evaluateApplicationWindow', () => {
  it('신청 기간이 없으면 상시 접수로 본다', () => {
    const p = policyOf({})
    expect(evaluateApplicationWindow(p, new Date(2026, 6, 21)).isOpenNow).toBe(true)
  })

  it('기간 안이면 열려 있다', () => {
    const p = policyOf({ applicationPeriods: [{ start: '2026-06-22', end: '2026-07-03' }] })
    expect(evaluateApplicationWindow(p, new Date(2026, 5, 25)).isOpenNow).toBe(true)
  })

  it('시작일·종료일 당일도 열려 있다', () => {
    const p = policyOf({ applicationPeriods: [{ start: '2026-06-22', end: '2026-07-03' }] })
    expect(evaluateApplicationWindow(p, new Date(2026, 5, 22)).isOpenNow).toBe(true)
    expect(evaluateApplicationWindow(p, new Date(2026, 6, 3)).isOpenNow).toBe(true)
  })

  it('기간이 지났으면 닫힌 것으로 본다', () => {
    // 청년미래적금 1차는 7/3 종료 — 7/21 에는 신청할 수 없다
    const p = policyOf({ applicationPeriods: [{ start: '2026-06-22', end: '2026-07-03' }] })
    expect(evaluateApplicationWindow(p, new Date(2026, 6, 21)).isOpenNow).toBe(false)
  })

  it('아직 시작 전이면 다음 기간을 알려준다', () => {
    const p = policyOf({
      applicationPeriods: [{ start: '2026-09-01', end: '2026-09-30', label: '2차' }],
    })
    const result = evaluateApplicationWindow(p, new Date(2026, 6, 21))
    expect(result.isOpenNow).toBe(false)
    expect(result.nextPeriod?.label).toBe('2차')
  })
})

// ─── 종합 판정 ──────────────────────────────────────────────────────────────

describe('matchPolicy', () => {
  it('조건 미달이면 ineligible 과 사유를 준다', () => {
    const p = policyOf({ criteria: { age: { min: 19, max: 34 } } })
    const match = matchPolicy(p, { ...baseProfile, age: 40 })
    expect(match.verdict).toBe('ineligible')
    expect(match.failed).toHaveLength(1)
    expect(match.failed[0].label).toBe('나이')
  })

  it('수동 확인 항목이 있으면 단정하지 않고 needsCheck 를 준다', () => {
    const p = policyOf({
      criteria: { age: { min: 19, max: 34 } },
      manualChecks: ['세대주 요건 확인 필요'],
    })
    expect(matchPolicy(p, baseProfile).verdict).toBe('needsCheck')
  })

  it('수동 확인 항목이 없고 모두 통과하면 eligible 이다', () => {
    const p = policyOf({ criteria: { age: { min: 19, max: 34 } }, manualChecks: [] })
    expect(matchPolicy(p, baseProfile).verdict).toBe('eligible')
  })

  it('여러 조건이 미달하면 모두 보고한다', () => {
    const p = policyOf({
      criteria: { age: { min: 19, max: 34 }, maxAnnualIncome: 30_000_000, requiresHomeless: true },
    })
    const match = matchPolicy(p, { ...baseProfile, age: 40, annualIncome: 50_000_000, isHomeless: false })
    expect(match.failed).toHaveLength(3)
  })
})

describe('matchAllPolicies', () => {
  it('조건 미달 제도도 버리지 않고 사유와 함께 돌려준다', () => {
    const policies = [
      policyOf({ id: 'ok', name: 'A', criteria: { age: { min: 19, max: 34 } } }),
      policyOf({ id: 'no', name: 'B', criteria: { age: { min: 60, max: 99 } } }),
    ]
    const summary = matchAllPolicies(policies, baseProfile)
    expect(summary.matched).toHaveLength(1)
    expect(summary.unmatched).toHaveLength(1)
    expect(summary.unmatched[0].failed[0].label).toBe('나이')
  })

  it('미달 항목이 적은 제도를 앞에 둔다 (조금만 조정하면 되는 것 우선)', () => {
    const policies = [
      policyOf({ id: 'far', name: '먼제도', criteria: { age: { min: 60 }, maxAnnualIncome: 1, requiresHomeless: true } }),
      policyOf({ id: 'near', name: '가까운제도', criteria: { age: { min: 60 } } }),
    ]
    const summary = matchAllPolicies(policies, { ...baseProfile, isHomeless: false })
    expect(summary.unmatched[0].policy.id).toBe('near')
  })

  it('지금 신청 가능한 제도 수를 센다', () => {
    const policies = [
      policyOf({ id: 'open', criteria: {} }),
      policyOf({ id: 'closed', criteria: {}, applicationPeriods: [{ start: '2026-01-01', end: '2026-02-01' }] }),
    ]
    const summary = matchAllPolicies(policies, baseProfile, new Date(2026, 6, 21))
    expect(summary.openNowCount).toBe(1)
  })

  it('빈 목록에서도 터지지 않는다', () => {
    const summary = matchAllPolicies([], baseProfile)
    expect(summary.matched).toEqual([])
    expect(summary.unmatched).toEqual([])
  })
})

// ─── 실제 데이터셋 회귀 ─────────────────────────────────────────────────────

describe('실제 제도 데이터 판정', () => {
  const now = new Date(2026, 6, 21)

  it('만 30세 무주택 미혼 청년(연 4천만원)은 청년 전세대출 후보가 된다', () => {
    const summary = matchAllPolicies(ACTIVE_POLICIES, baseProfile, now)
    const ids = summary.matched.map((m) => m.policy.id)
    expect(ids).toContain('huf-jeonse-youth')
  })

  it('만 40세는 청년 전용 제도에서 나이로 걸러진다', () => {
    const summary = matchAllPolicies(ACTIVE_POLICIES, { ...baseProfile, age: 40 }, now)
    const youth = summary.unmatched.find((m) => m.policy.id === 'huf-jeonse-youth')
    expect(youth?.failed.some((f) => f.label === '나이')).toBe(true)
  })

  it('주택 보유자는 무주택 요건 제도에서 전부 걸러진다', () => {
    const summary = matchAllPolicies(ACTIVE_POLICIES, { ...baseProfile, isHomeless: false }, now)
    const homelessRequired = ACTIVE_POLICIES.filter((p) => p.criteria.requiresHomeless)
    for (const policy of homelessRequired) {
      const match = summary.unmatched.find((m) => m.policy.id === policy.id)
      expect(match, `${policy.name} 이 걸러지지 않음`).toBeDefined()
    }
  })

  it('미혼자는 신혼부부 전용 제도에서 걸러진다', () => {
    const summary = matchAllPolicies(ACTIVE_POLICIES, baseProfile, now)
    const ids = summary.matched.map((m) => m.policy.id)
    expect(ids).not.toContain('huf-jeonse-newlywed')
    expect(ids).not.toContain('huf-purchase-newlywed')
  })

  it('신혼부부는 신혼 전용 제도의 후보가 된다', () => {
    const summary = matchAllPolicies(
      ACTIVE_POLICIES,
      { ...baseProfile, maritalStatus: 'newlywed', householdSize: 2, annualIncome: 70_000_000 },
      now
    )
    const ids = summary.matched.map((m) => m.policy.id)
    expect(ids).toContain('huf-jeonse-newlywed')
  })

  it('청년미래적금은 자격이 되어도 2026-07-21 에는 신청 기간이 아니다', () => {
    const summary = matchAllPolicies(ACTIVE_POLICIES, baseProfile, now)
    const match = summary.matched.find((m) => m.policy.id === 'youth-future-savings')
    expect(match).toBeDefined()
    expect(match!.isOpenNow).toBe(false)
  })

  it('어떤 제도도 근거 없이 eligible 로 단정하지 않는다', () => {
    // 실제 제도는 모두 서류 확인 항목이 있으므로 needsCheck 여야 한다
    const summary = matchAllPolicies(ACTIVE_POLICIES, baseProfile, now)
    for (const match of summary.matched) {
      if (match.verdict === 'eligible') {
        expect(match.policy.manualChecks, `${match.policy.name}`).toHaveLength(0)
      }
    }
  })
})

// ─── 신선도 ─────────────────────────────────────────────────────────────────

describe('기준일 신선도', () => {
  it('6개월이 지나면 오래된 것으로 본다', () => {
    expect(isStale('2026-07-21', new Date(2026, 9, 1))).toBe(false)
    expect(isStale('2026-07-21', new Date(2027, 2, 1))).toBe(true)
  })

  it('형식이 잘못된 기준일은 오래된 것으로 간주한다 (안전 우선)', () => {
    expect(isStale('알수없음')).toBe(true)
    expect(isStale('')).toBe(true)
  })

  it('경과 일수를 계산한다', () => {
    expect(daysSince('2026-07-21', new Date(2026, 6, 31))).toBe(10)
  })
})

describe('formatMoney', () => {
  it('억·만 단위로 표기한다', () => {
    expect(formatMoney(345_000_000)).toBe('3억 4,500만원')
    expect(formatMoney(100_000_000)).toBe('1억원')
    expect(formatMoney(50_000_000)).toBe('5,000만원')
    expect(formatMoney(0)).toBe('0원')
  })
})
