/**
 * 대출 계산기 핵심 로직 — 순수 함수 모음 (UI 의존성 없음)
 * 모든 금액 단위: 원(KRW), 금리: 연 % (예: 4.5 = 4.5%)
 */

// ─── 원리금균등 (EPI: Equal Payment Installment) ───────────────────────────

/** 원리금균등 월 납입액 (PMT 공식) */
export function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  const pow = Math.pow(1 + r, months)
  return principal * (r * pow) / (pow - 1)
}

/** 원리금균등 총 이자 */
export function epiTotalInterest(principal: number, annualRate: number, months: number): number {
  return Math.max(0, pmt(principal, annualRate, months) * months - principal)
}

export interface ScheduleRow {
  month: number
  totalPayment: number
  interest: number
  principal: number
  balance: number
}

/** 원리금균등 상환 스케줄 전체 */
export function calcEPI(principal: number, annualRate: number, months: number): {
  monthly: number
  totalInterest: number
  totalPayment: number
  schedule: ScheduleRow[]
} | null {
  if (!principal || !months) return null
  const r = annualRate / 12 / 100
  const monthly = pmt(principal, annualRate, months)
  let balance = principal
  let totalInterestAmt = 0
  const schedule: ScheduleRow[] = []
  for (let m = 1; m <= months; m++) {
    const interest = balance * r
    const princ = monthly - interest
    balance = Math.max(0, balance - princ)
    totalInterestAmt += interest
    schedule.push({ month: m, totalPayment: monthly, interest, principal: princ, balance })
  }
  return { monthly, totalInterest: totalInterestAmt, totalPayment: principal + totalInterestAmt, schedule }
}

// ─── 원금균등 (EP: Equal Principal) ──────────────────────────────────────────

/** 원금균등 상환 스케줄 전체 */
export function calcEP(principal: number, annualRate: number, months: number): {
  firstPayment: number
  lastPayment: number
  totalInterest: number
  totalPayment: number
  schedule: ScheduleRow[]
} | null {
  if (!principal || !months) return null
  const r = annualRate / 12 / 100
  const principalPerMonth = principal / months
  let balance = principal
  let totalInterestAmt = 0
  const schedule: ScheduleRow[] = []
  for (let m = 1; m <= months; m++) {
    const interest = balance * r
    const total = principalPerMonth + interest
    balance = Math.max(0, balance - principalPerMonth)
    totalInterestAmt += interest
    schedule.push({ month: m, totalPayment: total, interest, principal: principalPerMonth, balance })
  }
  return {
    firstPayment: schedule[0].totalPayment,
    lastPayment: schedule[schedule.length - 1].totalPayment,
    totalInterest: totalInterestAmt,
    totalPayment: principal + totalInterestAmt,
    schedule,
  }
}

// ─── DSR 계산 ────────────────────────────────────────────────────────────────

/**
 * DSR (총부채원리금상환비율)
 * = (기존 연 원리금 + 신규 연 원리금) / 연 소득 × 100
 */
export function calcDsr(
  income: number,
  existDebtMonthly: number,
  newMonthly: number,
): number {
  if (income <= 0) return 0
  return ((existDebtMonthly * 12 + newMonthly * 12) / income) * 100
}

/**
 * DSR 한도 내 신규 월 상환 가능액
 * = (연 소득 × DSR한도%) / 12 − 기존 월 납입액
 */
export function calcMaxMonthly(
  income: number,
  existDebtMonthly: number,
  dsrLimit = 40,
): number {
  return Math.max(0, (income / 12) * (dsrLimit / 100) - existDebtMonthly)
}

/**
 * DSR 기준 최대 대출 가능액 (역산 PMT)
 * maxMonthly를 월 납입액으로 원금을 역산
 */
export function calcMaxLoan(
  maxMonthly: number,
  annualRate: number,
  months: number,
): number {
  if (maxMonthly <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return maxMonthly * months
  const pow = Math.pow(1 + r, months)
  return maxMonthly * (pow - 1) / (r * pow)
}

// ─── 중도상환수수료 ───────────────────────────────────────────────────────────

/** 중도상환수수료 */
export function calcPrepaymentFee(prepayAmount: number, feeRate: number): number {
  return prepayAmount * (feeRate / 100)
}

/**
 * 중도상환 이자 절감액 (단순 이자 기준)
 * = 상환한 원금 × 월금리 × 잔여 개월
 */
export function calcPrepaymentInterestSavings(
  prepayAmount: number,
  annualRate: number,
  remainMonths: number,
): number {
  return prepayAmount * (annualRate / 12 / 100) * remainMonths
}

/**
 * 중도상환 순 절감액
 * = 이자절감액 − 중도상환수수료
 */
export function calcPrepaymentNetSavings(
  balance: number,
  prepayAmount: number,
  feeRate: number,
  annualRate: number,
  remainMonths: number,
): number {
  const safePrepay = Math.min(prepayAmount, balance)
  const fee = calcPrepaymentFee(safePrepay, feeRate)
  const savings = calcPrepaymentInterestSavings(safePrepay, annualRate, remainMonths)
  return savings - fee
}

// ─── 대환 (갈아타기) 손익 ─────────────────────────────────────────────────────

export interface RefinancingResult {
  curMonthly: number
  newMonthly: number
  curTotalInterest: number
  newTotalInterest: number
  interestSaved: number
  prepayFee: number
  totalCost: number
  netProfit: number
  monthlySaving: number
  breakEvenMonths: number
}

/**
 * 대환 손익 계산
 * 순이익 = 이자절감액 − 중도상환수수료 − 부대비용
 * 손익분기 = 초기비용 / 월 납입 절감액 (올림)
 */
export function calcRefinancingProfit(
  balance: number,
  curRate: number,
  newRate: number,
  months: number,
  feeRate: number,
  extraCost: number,
): RefinancingResult {
  const curMonthly = pmt(balance, curRate, months)
  const newMonthly = pmt(balance, newRate, months)
  const curTotalInterest = epiTotalInterest(balance, curRate, months)
  const newTotalInterest = epiTotalInterest(balance, newRate, months)
  const interestSaved = curTotalInterest - newTotalInterest
  const prepayFee = balance * (feeRate / 100)
  const totalCost = prepayFee + extraCost
  const netProfit = interestSaved - totalCost
  const monthlySaving = curMonthly - newMonthly
  const breakEvenMonths = monthlySaving > 0 ? Math.ceil(totalCost / monthlySaving) : Infinity

  return {
    curMonthly, newMonthly,
    curTotalInterest, newTotalInterest,
    interestSaved, prepayFee, totalCost,
    netProfit, monthlySaving, breakEvenMonths,
  }
}
