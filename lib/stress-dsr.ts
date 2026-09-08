// 주담대 원리금균등·비거치 시뮬레이션. 모든 금액은 원, 금리는 연 % / %p.
// 금융위 2026-07-01 행정지도: 수도권·규제지역 3% 하한, 지방 50% 및 2단계 유형비율.
export const STRESS_DSR_BASIS = {
  reviewedAt: '2026-09-08',
  effectiveFrom: '2026-07-01',
  effectiveUntil: '2026-12-31',
  capitalBase: 3,
  regionalBase: 1.5,
  sources: [
    { label: '금융위원회 · 2026년 하반기 스트레스 DSR 행정지도(첨부 원문)', href: 'https://better.fsc.go.kr/fsc_new/status/adminMap/OpertnDetail.do?muNo=145&postNo=4215&stNo=11' },
    { label: '금융위원회 · 10·15 대책: 수도권·규제지역 스트레스 금리 상향', href: 'https://www.fsc.go.kr/no010101/85432' },
    { label: '금융위원회 · 3단계 시행방안과 금리 유형별 적용비율', href: 'https://www.fsc.go.kr/no010101/84617' },
    { label: '은행연합회 · 2026년 하반기 운영방안(한국금융연구원 게재)', href: 'https://www.kif.re.kr/kif2/publication/maildetview.aspx?SL=0&controlno=364749&ismail=1&nodeid=402' },
  ],
} as const

export type MortgageRegion = 'capital' | 'regional'
export type MortgageRateType = 'variable' | 'mixed' | 'periodic' | 'fixed'
export const RATE_TYPE_LABELS: Record<MortgageRateType, string> = {
  variable: '변동형', mixed: '혼합형', periodic: '주기형', fixed: '만기까지 고정',
}

export interface StressDsrInput {
  income: number
  principal: number
  rate: number
  years: number
  existingAnnual: number
  existingStressExtra: number
  dsrLimit: number
  region: MortgageRegion
  rateType: MortgageRateType
  fixedYears: number
}

export const DEFAULT_STRESS_INPUT: StressDsrInput = {
  income: 50_000_000, principal: 300_000_000, rate: 4, years: 30,
  existingAnnual: 0, existingStressExtra: 0, dsrLimit: 40,
  region: 'capital', rateType: 'variable', fixedYears: 5,
}

export const STRESS_EXAMPLES: { id: string; label: string; note: string; input: StressDsrInput }[] = [
  { id: 'salary-5000', label: '연봉 5천 · 수도권', note: '연봉 5천만원, 3억원 신청, 기존 부채 없음', input: { ...DEFAULT_STRESS_INPUT } },
  { id: 'salary-7000', label: '연봉 7천 · 수도권', note: '연봉 7천만원, 4억원 신청, 기존 부채 없음', input: { ...DEFAULT_STRESS_INPUT, income: 70_000_000, principal: 400_000_000 } },
  { id: 'salary-10000', label: '연봉 1억 · 수도권', note: '연봉 1억원, 5억원 신청, 기존 부채 없음', input: { ...DEFAULT_STRESS_INPUT, income: 100_000_000, principal: 500_000_000 } },
  { id: 'existing-debt', label: '기존 부채 연 600만원', note: '연봉 5천만원, 기존 DSR 원리금 연 600만원', input: { ...DEFAULT_STRESS_INPUT, existingAnnual: 6_000_000 } },
  { id: 'regional', label: '지방 비규제 · 연봉 5천', note: '동일 조건에서 지방 비규제지역 주담대 비교', input: { ...DEFAULT_STRESS_INPUT, region: 'regional' } },
  { id: 'periodic-5', label: '5년 주기형 · 연봉 5천', note: '30년 만기, 5년마다 금리 재설정, 동일 약정금리 가정', input: { ...DEFAULT_STRESS_INPUT, rateType: 'periodic' } },
]

export function mortgageStressFactor(region: MortgageRegion, type: MortgageRateType, years: number, fixedYears: number): number {
  if (type === 'fixed') return 0
  if (type === 'variable' || fixedYears < 5) return 1
  const share = fixedYears / years
  if (share >= 0.7) return 0
  const band = share < 0.3 ? 0 : share < 0.5 ? 1 : 2
  const ratios = region === 'capital'
    ? { mixed: [0.8, 0.6, 0.4], periodic: [0.4, 0.3, 0.2] }
    : { mixed: [0.6, 0.4, 0.2], periodic: [0.3, 0.2, 0.1] }
  return ratios[type][band]
}

/** 0%와 극소 금리에서도 안정적인 원리금균등 월 납입액. */
export function mortgagePayment(principal: number, annualRate: number, years: number): number {
  const months = years * 12
  if (annualRate === 0) return principal / months
  const monthlyRate = annualRate / 1200
  return principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate))
}

export function validateStressInput(input: StressDsrInput): string | null {
  const ranges: [number, number, number, string][] = [
    [input.income, 1, 10_000_000_000, '연소득은 0원 초과, 100억원 이하로 입력하세요.'],
    [input.principal, 0, 10_000_000_000, '신청금액은 0~100억원으로 입력하세요.'],
    [input.rate, 0, 20, '약정금리는 0~20%로 입력하세요.'],
    [input.years, 1, 30, '이 계산기는 1~30년 만기를 지원합니다.'],
    [input.existingAnnual, 0, 10_000_000_000, '기존 연 원리금은 0~100억원으로 입력하세요.'],
    [input.existingStressExtra, 0, 10_000_000_000, '기존 부채 추가 반영액은 0~100억원으로 입력하세요.'],
    [input.dsrLimit, 1, 100, 'DSR 기준은 1~100%로 입력하세요.'],
    [input.fixedYears, 1, input.years, '고정기간·변동주기는 만기 이내로 입력하세요.'],
  ]
  for (const [value, min, max, error] of ranges) {
    if (!Number.isFinite(value) || value < min || value > max) return error
  }
  if (!Number.isInteger(input.years) || !Number.isInteger(input.fixedYears)) return '만기와 고정기간은 정수 연도로 입력하세요.'
  if (!['capital', 'regional'].includes(input.region) || !Object.hasOwn(RATE_TYPE_LABELS, input.rateType)) return '지역과 금리 유형을 확인하세요.'
  return null
}

export function calculateStressDsr(input: StressDsrInput) {
  const error = validateStressInput(input)
  if (error) throw new RangeError(error)
  const base = input.region === 'capital' ? STRESS_DSR_BASIS.capitalBase : STRESS_DSR_BASIS.regionalBase
  const stageFactor = input.region === 'capital' ? 1 : 0.5
  const typeFactor = mortgageStressFactor(input.region, input.rateType, input.years, input.fixedYears)
  const stressRate = base * stageFactor * typeFactor
  const assessmentRate = input.rate + stressRate
  const actualMonthly = mortgagePayment(input.principal, input.rate, input.years)
  const assessmentMonthly = mortgagePayment(input.principal, assessmentRate, input.years)
  const annualBudget = input.income * input.dsrLimit / 100
  const remainingAnnual = Math.max(0, annualBudget - input.existingAnnual - input.existingStressExtra)
  const normalLimit = Math.max(0, annualBudget - input.existingAnnual) / 12 / mortgagePayment(1, input.rate, input.years)
  const stressLimit = remainingAnnual / 12 / mortgagePayment(1, assessmentRate, input.years)
  return {
    base, stageFactor, typeFactor, stressRate, assessmentRate, actualMonthly, assessmentMonthly,
    ordinaryDsr: (actualMonthly * 12 + input.existingAnnual) / input.income * 100,
    stressDsr: (assessmentMonthly * 12 + input.existingAnnual + input.existingStressExtra) / input.income * 100,
    annualBudget, remainingAnnual, normalLimit, stressLimit,
    limitReduction: Math.max(0, normalLimit - stressLimit),
    shortfall: Math.max(0, input.principal - stressLimit),
  }
}

export function formatDsrMoney(won: number): string {
  return `${Math.round(won / 10_000).toLocaleString('ko-KR')}만원`
}
