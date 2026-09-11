import { describe, expect, it } from 'vitest'
import { calculateStressDsr, DEFAULT_STRESS_INPUT, mortgagePayment, mortgageStressFactor, STRESS_EXAMPLES, validateStressInput } from '../lib/stress-dsr'
import { getHomeGuideItems, getGuideIndexItems, isNewGuide, searchStaticGuides } from '../lib/guide-content'

describe('stress DSR mortgage calculation', () => {
  it('separates real payments from assessment and reverses the DSR budget', () => {
    const r = calculateStressDsr(DEFAULT_STRESS_INPUT)
    // Independently known PMT for 300m KRW, 30 years, 4% / 7%.
    expect(r.actualMonthly).toBeCloseTo(1432245.886, 2)
    expect(r.assessmentMonthly).toBeCloseTo(1995907.486, 2)
    expect(r.ordinaryDsr).toBeCloseTo(34.3739, 3)
    expect(r.stressDsr).toBeCloseTo(47.9018, 3)
    expect(mortgagePayment(r.stressLimit, 7, 30) * 12).toBeCloseTo(20_000_000, 4)
    expect(r.limitReduction).toBeGreaterThan(98_000_000)
  })

  it('applies both regional relief factors, including mixed and periodic loans', () => {
    const regional = { ...DEFAULT_STRESS_INPUT, region: 'regional' as const }
    expect(calculateStressDsr(regional).stressRate).toBe(0.75)
    expect(calculateStressDsr({ ...regional, rateType: 'mixed' }).stressRate).toBeCloseTo(0.45)
    expect(calculateStressDsr({ ...regional, rateType: 'periodic' }).stressRate).toBeCloseTo(0.225)
    expect(calculateStressDsr({ ...DEFAULT_STRESS_INPUT, rateType: 'mixed' }).stressRate).toBeCloseTo(2.4)
    expect(calculateStressDsr({ ...DEFAULT_STRESS_INPUT, rateType: 'periodic' }).stressRate).toBeCloseTo(1.2)
  })

  it.each([
    ['mixed', 4, 1], ['periodic', 4, 1],
    ['mixed', 5, 0.8], ['mixed', 9, 0.6], ['mixed', 15, 0.4], ['mixed', 21, 0],
    ['periodic', 5, 0.4], ['periodic', 9, 0.3], ['periodic', 15, 0.2], ['periodic', 21, 0],
  ] as const)('handles 5-year and 30/50/70%% boundaries for %s at %s years', (type, years, expected) => {
    expect(mortgageStressFactor('capital', type, 30, years)).toBe(expected)
  })

  it('uses a fixed-loan exemption without losing existing-debt stress amounts', () => {
    const r = calculateStressDsr({ ...DEFAULT_STRESS_INPUT, rateType: 'fixed', existingAnnual: 6_000_000, existingStressExtra: 1_000_000 })
    expect(r.stressRate).toBe(0)
    expect(r.assessmentMonthly).toBe(r.actualMonthly)
    expect(r.stressDsr - r.ordinaryDsr).toBeCloseTo(2)
    expect(r.remainingAnnual).toBe(13_000_000)
  })

  it('does not double-count existing debt and floors exhausted budgets at zero', () => {
    const r = calculateStressDsr({ ...DEFAULT_STRESS_INPUT, existingAnnual: 6_000_000 })
    expect(r.remainingAnnual).toBe(14_000_000)
    expect(r.stressLimit / calculateStressDsr(DEFAULT_STRESS_INPUT).stressLimit).toBeCloseTo(0.7)
    const noBudget = calculateStressDsr({ ...DEFAULT_STRESS_INPUT, existingAnnual: 25_000_000 })
    expect(noBudget.normalLimit).toBe(0)
    expect(noBudget.stressLimit).toBe(0)
    expect(noBudget.stressDsr).toBeGreaterThan(40)
  })

  it('handles zero and very small interest rates without NaN or cancellation', () => {
    expect(mortgagePayment(120_000_000, 0, 10)).toBe(1_000_000)
    expect(mortgagePayment(120_000_000, 1e-10, 10)).toBeCloseTo(1_000_000, 3)
    const r = calculateStressDsr({ ...DEFAULT_STRESS_INPUT, principal: 0, rate: 0, rateType: 'fixed' })
    expect(r.actualMonthly).toBe(0)
    expect(r.stressDsr).toBe(0)
    expect(r.stressLimit).toBe(600_000_000)
  })

  it.each([{ income: 0 }, { income: NaN }, { principal: -1 }, { rate: Infinity }, { years: 0 }, { years: 31 }, { years: 5.5 }, { fixedYears: 31 }, { existingAnnual: -1 }, { existingStressExtra: -1 }])('rejects invalid inputs %j', change => {
    expect(validateStressInput({ ...DEFAULT_STRESS_INPUT, ...change })).not.toBeNull()
    expect(() => calculateStressDsr({ ...DEFAULT_STRESS_INPUT, ...change })).toThrow(RangeError)
  })

  it('keeps all six examples finite and makes regional / periodic comparisons improve the same DSR budget', () => {
    for (const example of STRESS_EXAMPLES) {
      const r = calculateStressDsr(example.input)
      expect(Object.values(r).every(Number.isFinite)).toBe(true)
      expect(r.stressLimit).toBeLessThanOrEqual(r.normalLimit)
    }
    const baseline = calculateStressDsr(STRESS_EXAMPLES[0].input)
    for (const id of ['regional', 'periodic-5']) {
      expect(calculateStressDsr(STRESS_EXAMPLES.find(e => e.id === id)!.input).stressLimit).toBeGreaterThan(baseline.stressLimit)
    }
  })
})

describe('stress DSR discoverability', () => {
  it.each(['스트레스 DSR', '스트레스DSR계산기', '#스트레스DSR', '스트레스 dsr 계산기'])('finds the static guide for internal search %s', query => {
    expect(searchStaticGuides(query, new Date('2026-09-08T12:00:00+09:00'))[0].href).toBe('/guide/stress-dsr')
  })
  it('does not return guides for blank or unmatched queries', () => {
    expect(searchStaticGuides('  ## ')).toEqual([])
    expect(searchStaticGuides('일치하지않는검색어')).toEqual([])
  })
  it('appears first on the homepage at publication and retains its guide after NEW expiry', () => {
    const home = getHomeGuideItems(new Date('2026-09-08T12:00:00+09:00'))
    expect(home).toHaveLength(12)
    expect(home[0].href).toBe('/guide/stress-dsr')
    expect(isNewGuide(home[0], new Date('2026-09-09T23:59:59+09:00'))).toBe(true)
    expect(isNewGuide(home[0], new Date('2026-09-10T00:00:00+09:00'))).toBe(false)
    expect(getGuideIndexItems(new Date('2026-10-30')).some(g => g.href === home[0].href)).toBe(true)
  })
})
