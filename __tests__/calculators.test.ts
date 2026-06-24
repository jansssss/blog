import { describe, it, expect } from 'vitest'
import {
  pmt,
  epiTotalInterest,
  calcEPI,
  calcEP,
  calcDsr,
  calcMaxMonthly,
  calcMaxLoan,
  calcPrepaymentFee,
  calcPrepaymentNetSavings,
  calcRefinancingProfit,
} from '../lib/calculators'

// ─────────────────────────────────────────────────────────────────────────────
// PMT — 원리금균등 월 납입액
// ─────────────────────────────────────────────────────────────────────────────
describe('pmt — 원리금균등 월 납입액', () => {
  it('3억원 4.5% 30년 → 약 152만원대', () => {
    // 실제 금융기관 시뮬레이터 기준 약 152만원
    const payment = pmt(300_000_000, 4.5, 360)
    expect(Math.round(payment / 10_000)).toBe(152)
  })

  it('원금 0이면 월납입 0', () => {
    expect(pmt(0, 4.5, 120)).toBe(0)
  })

  it('기간 0이면 월납입 0', () => {
    expect(pmt(100_000_000, 4.5, 0)).toBe(0)
  })

  it('금리 0%일 때 원금 ÷ 기간', () => {
    expect(pmt(120_000_000, 0, 12)).toBeCloseTo(10_000_000, 0)
  })

  it('월납입 × 기간 − 원금 = 총이자 (항등식)', () => {
    const [p, r, n] = [300_000_000, 4.5, 360]
    const monthly = pmt(p, r, n)
    expect(monthly * n - p).toBeCloseTo(epiTotalInterest(p, r, n), 0)
  })

  it('금리 높을수록 월납입 증가', () => {
    expect(pmt(200_000_000, 5.5, 240)).toBeGreaterThan(pmt(200_000_000, 3.5, 240))
  })

  it('기간 길수록 월납입 감소', () => {
    expect(pmt(200_000_000, 4.5, 360)).toBeLessThan(pmt(200_000_000, 4.5, 120))
  })

  it('원금 클수록 월납입 비례 증가', () => {
    const base = pmt(100_000_000, 4.5, 240)
    const double = pmt(200_000_000, 4.5, 240)
    expect(double).toBeCloseTo(base * 2, 0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 원리금균등 vs 원금균등 — 상환 스케줄
// ─────────────────────────────────────────────────────────────────────────────
describe('calcEPI — 원리금균등 상환 스케줄', () => {
  it('모든 회차 납입액 동일', () => {
    const result = calcEPI(100_000_000, 5.0, 120)!
    const first = result.schedule[0].totalPayment
    result.schedule.forEach(row => {
      expect(row.totalPayment).toBeCloseTo(first, 0)
    })
  })

  it('마지막 회차 잔액 ≈ 0 (완전 상환)', () => {
    const result = calcEPI(100_000_000, 4.5, 120)!
    const lastBalance = result.schedule[result.schedule.length - 1].balance
    expect(Math.abs(lastBalance)).toBeLessThan(100) // 부동소수점 허용 오차
  })

  it('총상환액 = 원금 + 총이자', () => {
    const result = calcEPI(200_000_000, 4.5, 240)!
    expect(result.totalPayment).toBeCloseTo(200_000_000 + result.totalInterest, 0)
  })

  it('null 입력 안전 처리', () => {
    expect(calcEPI(0, 4.5, 120)).toBeNull()
  })
})

describe('calcEP — 원금균등 상환 스케줄', () => {
  it('매월 원금상환 동일', () => {
    const n = 120
    const result = calcEP(100_000_000, 5.0, n)!
    result.schedule.forEach(row => {
      expect(row.principal).toBeCloseTo(100_000_000 / n, 0)
    })
  })

  it('첫 납입 > 마지막 납입 (시간이 갈수록 부담 감소)', () => {
    const result = calcEP(300_000_000, 4.5, 360)!
    expect(result.firstPayment).toBeGreaterThan(result.lastPayment)
  })

  it('원금균등 총이자 < 원리금균등 총이자 (동일 조건)', () => {
    const [p, r, n] = [200_000_000, 4.5, 240]
    expect(calcEP(p, r, n)!.totalInterest).toBeLessThan(calcEPI(p, r, n)!.totalInterest)
  })

  it('원금균등 첫 납입 > 원리금균등 월납입 (초기 부담 높음)', () => {
    const [p, r, n] = [200_000_000, 4.5, 240]
    expect(calcEP(p, r, n)!.firstPayment).toBeGreaterThan(calcEPI(p, r, n)!.monthly)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DSR — 총부채원리금상환비율
// ─────────────────────────────────────────────────────────────────────────────
describe('DSR 계산', () => {
  it('연소득 6천만·기존 40만·신규 160만 → DSR 정확히 40%', () => {
    // (400K + 1600K) × 12 / 60M × 100 = 24M / 60M × 100 = 40
    expect(calcDsr(60_000_000, 400_000, 1_600_000)).toBe(40)
  })

  it('소득 0이면 DSR 0 반환 (ZeroDivision 방지)', () => {
    expect(calcDsr(0, 400_000, 1_000_000)).toBe(0)
  })

  it('대출 없으면 기존 부채만으로 DSR 계산', () => {
    // 연소득 6천만, 기존 100만/월 → DSR = 100만×12/6천만×100 = 20%
    expect(calcDsr(60_000_000, 1_000_000, 0)).toBeCloseTo(20, 1)
  })
})

describe('calcMaxMonthly — DSR 기준 최대 월 상환 가능액', () => {
  it('연소득 6천만·기존 40만 → 신규 월 상환 가능액 160만', () => {
    // (6천만/12) × 0.4 − 40만 = 200만 − 40만 = 160만
    expect(calcMaxMonthly(60_000_000, 400_000)).toBe(1_600_000)
  })

  it('기존 부채 없을 때 최대 = 연소득/12 × 40%', () => {
    const income = 60_000_000
    expect(calcMaxMonthly(income, 0)).toBeCloseTo((income / 12) * 0.4, 0)
  })

  it('기존 부채가 한도 초과 시 0 반환', () => {
    // 기존 200만/월 → 연소득 6천만 기준 이미 한도 초과
    expect(calcMaxMonthly(60_000_000, 2_000_001)).toBe(0)
  })

  it('maxMonthly로 calcDsr 역산 시 40% 달성', () => {
    const income = 80_000_000
    const existDebt = 500_000
    const maxMonthly = calcMaxMonthly(income, existDebt)
    expect(calcDsr(income, existDebt, maxMonthly)).toBeCloseTo(40, 1)
  })
})

describe('calcMaxLoan — DSR 기준 최대 대출 가능액', () => {
  it('pmt(calcMaxLoan(max, r, n), r, n) ≈ maxMonthly (역산 일관성)', () => {
    const maxMonthly = 1_600_000
    const [rate, months] = [4.5, 360]
    const maxLoan = calcMaxLoan(maxMonthly, rate, months)
    expect(pmt(maxLoan, rate, months)).toBeCloseTo(maxMonthly, 0)
  })

  it('maxMonthly 0이면 maxLoan 0', () => {
    expect(calcMaxLoan(0, 4.5, 360)).toBe(0)
  })

  it('금리 0%일 때 maxLoan = maxMonthly × months', () => {
    expect(calcMaxLoan(1_000_000, 0, 120)).toBeCloseTo(120_000_000, 0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 중도상환수수료
// ─────────────────────────────────────────────────────────────────────────────
describe('중도상환수수료', () => {
  it('1천만 × 1.5% = 15만', () => {
    expect(calcPrepaymentFee(10_000_000, 1.5)).toBe(150_000)
  })

  it('5천만 × 1.2% = 60만', () => {
    expect(calcPrepaymentFee(50_000_000, 1.2)).toBe(600_000)
  })

  it('수수료율 0% → 수수료 없음', () => {
    expect(calcPrepaymentFee(50_000_000, 0)).toBe(0)
  })

  it('잔여기간 길고 금리 높으면 순절감 양수 (상환 권장)', () => {
    // 5천만 잔액·1천만 상환·1.5% 수수료·7.5% 금리·10년 잔여
    // 이자절감 = 1천만 × (7.5/12/100) × 120 = 750만
    // 수수료 = 15만 → 순절감 ≈ 735만 (양수)
    const net = calcPrepaymentNetSavings(50_000_000, 10_000_000, 1.5, 7.5, 120)
    expect(net).toBeGreaterThan(0)
  })

  it('수수료 높고 잔여기간 짧으면 순절감 음수 (상환 비권장)', () => {
    // 5천만 전액·3% 수수료·1% 금리·6개월 잔여
    // 이자절감 = 5천만 × (1/12/100) × 6 = 25만
    // 수수료 = 150만 → 순절감 ≈ −125만 (음수)
    const net = calcPrepaymentNetSavings(50_000_000, 50_000_000, 3.0, 1.0, 6)
    expect(net).toBeLessThan(0)
  })

  it('상환금액 > 잔액이면 잔액만큼만 적용', () => {
    const netFull = calcPrepaymentNetSavings(10_000_000, 10_000_000, 1.5, 4.5, 60)
    const netOver = calcPrepaymentNetSavings(10_000_000, 99_999_999, 1.5, 4.5, 60)
    expect(netFull).toBeCloseTo(netOver, 0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 대환(갈아타기) 손익
// ─────────────────────────────────────────────────────────────────────────────
describe('calcRefinancingProfit — 대환 손익', () => {
  it('2억·5.5%→3.8%·10년 → 순이익 양수', () => {
    const result = calcRefinancingProfit(
      200_000_000, 5.5, 3.8, 120, 1.2, 300_000,
    )
    expect(result.netProfit).toBeGreaterThan(0)
  })

  it('같은 금리면 이자절감 0 → 비용 때문에 순손실', () => {
    const result = calcRefinancingProfit(200_000_000, 4.5, 4.5, 120, 1.0, 100_000)
    expect(result.interestSaved).toBeCloseTo(0, 0)
    expect(result.netProfit).toBeLessThan(0)
  })

  it('수수료·부대비용 0 → 순이익 = 이자절감액', () => {
    const result = calcRefinancingProfit(200_000_000, 5.0, 3.5, 120, 0, 0)
    expect(result.netProfit).toBeCloseTo(result.interestSaved, 0)
  })

  it('손익분기 = ceil(총비용 ÷ 월절감액) 수식 일관성', () => {
    const result = calcRefinancingProfit(300_000_000, 5.5, 3.8, 240, 1.2, 500_000)
    if (result.monthlySaving > 0) {
      expect(result.breakEvenMonths).toBe(
        Math.ceil(result.totalCost / result.monthlySaving),
      )
    }
  })

  it('신규 금리 낮을수록 월절감액 증가', () => {
    const r1 = calcRefinancingProfit(200_000_000, 5.5, 4.5, 120, 0, 0)
    const r2 = calcRefinancingProfit(200_000_000, 5.5, 3.5, 120, 0, 0)
    expect(r2.monthlySaving).toBeGreaterThan(r1.monthlySaving)
  })

  it('중도상환수수료 = 잔액 × 수수료율', () => {
    const balance = 200_000_000
    const feeRate = 1.2
    const result = calcRefinancingProfit(balance, 5.5, 3.8, 120, feeRate, 0)
    expect(result.prepayFee).toBeCloseTo(balance * (feeRate / 100), 0)
  })
})
