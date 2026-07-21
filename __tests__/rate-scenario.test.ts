import { describe, expect, it } from 'vitest'

import { calcEPI } from '@/lib/calculators'
import {
  classifyRateType,
  computeMarketRates,
  summarizeRateKind,
} from '@/lib/finlife/market'
import {
  buildScenarioCurve,
  findBreakEven,
  monthlyPayment,
  remainingBalance,
  simulateFixed,
  simulateVariable,
} from '@/lib/finlife/rate-scenario'
import type { LoanOffer } from '@/lib/finlife/types'

function offer(partial: Partial<LoanOffer>): LoanOffer {
  return {
    id: 'x',
    productType: 'mortgage',
    disclosureMonth: '202607',
    companyCode: '000',
    companyName: '테스트은행',
    finGroupCode: '020000',
    finGroupName: '은행',
    productCode: 'P',
    productName: '테스트상품',
    joinWay: [],
    incidentalExpense: null,
    earlyRepayFee: null,
    delinquentRate: null,
    loanLimit: null,
    repayType: '분할상환',
    rateType: '변동금리',
    collateralType: null,
    creditProductType: null,
    rateMin: null,
    rateMax: null,
    rateAvg: null,
    creditScoreRates: null,
    ...partial,
  } as LoanOffer
}

// ─── 금리유형 분류 ──────────────────────────────────────────────────────────

describe('classifyRateType', () => {
  it('고정/변동을 분류한다', () => {
    expect(classifyRateType('고정금리')).toBe('fixed')
    expect(classifyRateType('변동금리')).toBe('variable')
  })

  it('분류할 수 없으면 null 을 준다 (임의로 한쪽에 넣지 않는다)', () => {
    expect(classifyRateType(null)).toBeNull()
    expect(classifyRateType('혼합')).toBeNull()
    expect(classifyRateType('')).toBeNull()
  })
})

// ─── 시장 금리 요약 ─────────────────────────────────────────────────────────

describe('summarizeRateKind', () => {
  it('해당 유형만 골라 평균을 낸다', () => {
    const stat = summarizeRateKind(
      [
        offer({ rateType: '고정금리', rateMin: 4, rateAvg: 5, rateMax: 6 }),
        offer({ rateType: '고정금리', rateMin: 3, rateAvg: 5.5, rateMax: 7 }),
        offer({ rateType: '변동금리', rateMin: 1, rateAvg: 1, rateMax: 1 }),
      ],
      'fixed'
    )
    expect(stat).toEqual({ count: 2, min: 3, avg: 5.25, max: 7 })
  })

  it('금리 0(미취급)은 통계에서 뺀다 — 최저금리가 0%로 무너지면 안 된다', () => {
    const stat = summarizeRateKind(
      [
        offer({ rateType: '고정금리', rateMin: 0, rateAvg: 0, rateMax: 0 }),
        offer({ rateType: '고정금리', rateMin: 4, rateAvg: 4.5, rateMax: 5 }),
      ],
      'fixed'
    )
    expect(stat).toEqual({ count: 1, min: 4, avg: 4.5, max: 5 })
  })

  it('평균금리가 없으면 최저/최고로 대체한다', () => {
    const stat = summarizeRateKind(
      [offer({ rateType: '고정금리', rateMin: 4.2, rateAvg: null, rateMax: null })],
      'fixed'
    )
    expect(stat?.avg).toBe(4.2)
  })

  it('해당 유형이 하나도 없으면 null', () => {
    expect(summarizeRateKind([offer({ rateType: '변동금리', rateAvg: 4 })], 'fixed')).toBeNull()
  })
})

describe('computeMarketRates', () => {
  it('상품종류를 넘어 섞이지 않는다', () => {
    const market = computeMarketRates(
      [
        offer({ productType: 'mortgage', rateType: '고정금리', rateAvg: 5 }),
        offer({ productType: 'rent', rateType: '고정금리', rateAvg: 9 }),
        offer({ productType: 'mortgage', rateType: '변동금리', rateAvg: 4 }),
      ],
      'mortgage'
    )
    expect(market.fixed?.avg).toBe(5)
    expect(market.variable?.avg).toBe(4)
    expect(market.spread).toBe(1)
  })

  it('한쪽 유형이 없으면 스프레드를 내지 않는다', () => {
    const market = computeMarketRates([offer({ rateType: '고정금리', rateAvg: 5 })], 'mortgage')
    expect(market.spread).toBeNull()
  })
})

// ─── 상환 계산 ──────────────────────────────────────────────────────────────

describe('monthlyPayment', () => {
  it('기존 계산기(calcEPI)와 같은 값을 낸다', () => {
    const existing = calcEPI(300_000_000, 4.2, 360)
    const closed = monthlyPayment(300_000_000, 4.2, 360)
    expect(Math.round(closed)).toBe(Math.round(existing!.monthly))
  })

  it('무이자면 원금을 기간으로 나눈다', () => {
    expect(monthlyPayment(1_200_000, 0, 12)).toBe(100_000)
  })
})

describe('remainingBalance', () => {
  it('시작 시점 잔액은 원금이다', () => {
    expect(remainingBalance(100_000_000, 4, 360, 0)).toBe(100_000_000)
  })

  it('만기에는 0이 된다', () => {
    expect(remainingBalance(100_000_000, 4, 360, 360)).toBe(0)
  })

  it('상환이 진행될수록 잔액이 줄어든다', () => {
    const y5 = remainingBalance(300_000_000, 4.5, 360, 60)
    const y10 = remainingBalance(300_000_000, 4.5, 360, 120)
    expect(y5).toBeLessThan(300_000_000)
    expect(y10).toBeLessThan(y5)
  })

  it('원리금균등 초반에는 원금이 거의 안 줄어든다 (5년 뒤 잔액 > 원금의 88%)', () => {
    const balance = remainingBalance(300_000_000, 4.5, 360, 60)
    expect(balance / 300_000_000).toBeGreaterThan(0.88)
  })
})

// ─── 시나리오 ───────────────────────────────────────────────────────────────

describe('simulateVariable', () => {
  it('금리 변동이 없으면 고정금리와 같다', () => {
    const fixed = simulateFixed(300_000_000, 360, 4.5)
    const flat = simulateVariable(300_000_000, 360, 4.5, 30, 4.5)
    expect(Math.round(flat.totalInterest)).toBe(Math.round(fixed.totalInterest))
  })

  it('상승 시점이 만기 이후여도 안전하게 처리한다', () => {
    const result = simulateVariable(100_000_000, 120, 4, 50, 9)
    const fixed = simulateFixed(100_000_000, 120, 4)
    expect(Math.round(result.totalInterest)).toBe(Math.round(fixed.totalInterest))
  })

  it('금리가 오르면 월납입액과 총이자가 함께 늘어난다', () => {
    const result = simulateVariable(300_000_000, 360, 4, 5, 6)
    expect(result.monthlyAfter).toBeGreaterThan(result.monthlyBefore)
    expect(result.totalInterest).toBeGreaterThan(simulateFixed(300_000_000, 360, 4).totalInterest)
  })

  it('같은 상승폭이면 일찍 오를수록 손해가 크다', () => {
    const early = simulateVariable(300_000_000, 360, 4, 3, 6)
    const late = simulateVariable(300_000_000, 360, 4, 15, 6)
    expect(early.totalInterest).toBeGreaterThan(late.totalInterest)
  })

  it('처음부터(0년) 오르면 상승 후 금리로 시작한 것과 같다', () => {
    const immediate = simulateVariable(200_000_000, 240, 4, 0, 6)
    const fixed = simulateFixed(200_000_000, 240, 6)
    expect(Math.round(immediate.totalInterest)).toBe(Math.round(fixed.totalInterest))
  })
})

// ─── 손익분기 ───────────────────────────────────────────────────────────────

describe('findBreakEven', () => {
  it('손익분기 상승폭에서 두 총이자가 실제로 같아진다', () => {
    const [p, n, fixedRate, varRate, years] = [300_000_000, 360, 5.28, 4.81, 3]
    const result = findBreakEven(p, n, fixedRate, varRate, years)
    expect(result.deltaPoints).not.toBeNull()

    const fixedInterest = simulateFixed(p, n, fixedRate).totalInterest
    const atBreakEven = simulateVariable(
      p, n, varRate, years, varRate + (result.deltaPoints as number)
    ).totalInterest
    // 이분탐색 오차(0.001%p) 범위 안에서 일치해야 한다
    expect(Math.abs(atBreakEven - fixedInterest) / fixedInterest).toBeLessThan(0.001)
  })

  it('변동금리가 이미 더 비싸면 alreadyWorse 로 알린다', () => {
    const result = findBreakEven(300_000_000, 360, 4.0, 5.0, 3)
    expect(result.alreadyWorse).toBe(true)
    expect(result.deltaPoints).toBe(0)
  })

  it('변동이 쌀수록 버틸 수 있는 상승폭이 커진다', () => {
    const narrow = findBreakEven(300_000_000, 360, 5.0, 4.8, 3)
    const wide = findBreakEven(300_000_000, 360, 5.0, 4.0, 3)
    expect(wide.deltaPoints as number).toBeGreaterThan(narrow.deltaPoints as number)
  })

  it('늦게 오를수록 더 큰 상승폭을 견딘다', () => {
    const early = findBreakEven(300_000_000, 360, 5.28, 4.81, 1)
    const late = findBreakEven(300_000_000, 360, 5.28, 4.81, 10)
    expect(late.deltaPoints as number).toBeGreaterThan(early.deltaPoints as number)
  })

  it('breakEvenRate 는 초기 변동금리 + 상승폭이다', () => {
    const result = findBreakEven(300_000_000, 360, 5.28, 4.81, 3)
    expect(result.breakEvenRate).toBeCloseTo(4.81 + (result.deltaPoints as number), 2)
  })
})

// ─── 곡선 ───────────────────────────────────────────────────────────────────

describe('buildScenarioCurve', () => {
  it('요청한 구간을 모두 채우고 고정금리는 수평선이다', () => {
    const curve = buildScenarioCurve(300_000_000, 360, 5.28, 4.81, 3, 3, 6)
    expect(curve).toHaveLength(7)
    expect(curve[0].delta).toBe(0)
    expect(curve[curve.length - 1].delta).toBe(3)
    expect(new Set(curve.map((p) => p.fixed)).size).toBe(1)
  })

  it('변동금리 총이자는 상승폭에 대해 단조증가한다 (이분탐색의 전제)', () => {
    const curve = buildScenarioCurve(300_000_000, 360, 5.28, 4.81, 3, 5, 20)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].variable).toBeGreaterThan(curve[i - 1].variable)
    }
  })

  it('곡선이 고정금리 수평선을 실제로 가로지른다 (손익분기와 일치)', () => {
    const breakEven = findBreakEven(300_000_000, 360, 5.28, 4.81, 3)
    const curve = buildScenarioCurve(300_000_000, 360, 5.28, 4.81, 3, 5, 100)
    const crossing = curve.find((p) => p.variable >= p.fixed)
    expect(crossing).toBeDefined()
    expect(crossing!.delta).toBeGreaterThanOrEqual(breakEven.deltaPoints as number)
  })
})
