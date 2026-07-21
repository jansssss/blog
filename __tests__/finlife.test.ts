import { describe, expect, it } from 'vitest'

import { calcEP, calcEPI } from '@/lib/calculators'
import {
  buildComparison,
  collectFacets,
  computeRepayment,
  filterOffers,
  repayMethodFromType,
  selectRate,
  type CompareInput,
} from '@/lib/finlife/compare'
import {
  FinlifeApiError,
  bandForScore,
  buildOfferId,
  deriveCreditRateRange,
  extractCreditScoreRates,
  joinOffers,
  parseApiPage,
  parseJoinWay,
  parseRate,
  parseText,
  rateForCreditScore,
} from '@/lib/finlife/normalize'
import type { LoanOffer, RawLoanBase, RawLoanOption } from '@/lib/finlife/types'

// ─── 스칼라 파서 ─────────────────────────────────────────────────────────────

describe('parseText', () => {
  it('결측 표기를 전부 null 로 통일한다', () => {
    for (const blank of [null, undefined, '', '   ', '-', '--', 'N/A', '해당없음']) {
      expect(parseText(blank)).toBeNull()
    }
  })

  it('앞뒤 공백을 제거한다', () => {
    expect(parseText('  KB국민은행 ')).toBe('KB국민은행')
  })
})

describe('parseRate', () => {
  it('정상 금리를 숫자로 변환한다', () => {
    expect(parseRate('3.5')).toBe(3.5)
    expect(parseRate(' 4.25 ')).toBe(4.25)
    expect(parseRate('4.5%')).toBe(4.5)
  })

  it('0 이하는 미취급으로 보고 null 을 반환한다', () => {
    // 연 0% 대출은 존재하지 않는다. 0 을 숫자로 받아들이면
    // 미취급 상품이 비교표 최저금리 1위로 올라온다.
    expect(parseRate('0')).toBeNull()
    expect(parseRate('0.00')).toBeNull()
    expect(parseRate('-1.5')).toBeNull()
  })

  it('결측·비정상 값은 null 을 반환한다', () => {
    expect(parseRate(null)).toBeNull()
    expect(parseRate('')).toBeNull()
    expect(parseRate('-')).toBeNull()
    expect(parseRate('abc')).toBeNull()
    expect(parseRate('150')).toBeNull() // 연 100% 초과 = 공시 오류
  })

  it('부동소수 오차를 정리한다', () => {
    expect(parseRate('3.6799999999999997')).toBe(3.68)
  })
})

describe('parseJoinWay', () => {
  it('쉼표로 이어진 가입방법을 배열로 분해한다', () => {
    expect(parseJoinWay('영업점,인터넷,스마트폰')).toEqual(['영업점', '인터넷', '스마트폰'])
  })

  it('결측이면 빈 배열', () => {
    expect(parseJoinWay(null)).toEqual([])
    expect(parseJoinWay('-')).toEqual([])
  })
})

// ─── 키 생성 ────────────────────────────────────────────────────────────────

describe('buildOfferId', () => {
  const base: RawLoanBase = { fin_co_no: '0010001', fin_prdt_cd: 'PRD01' }
  const option: RawLoanOption = { mrtg_type: 'A', rpay_type: 'D', lend_rate_type: 'F' }

  it('공시월이 바뀌어도 같은 키를 만든다 (월별 upsert 로 최신본만 유지)', () => {
    const jan = buildOfferId('mortgage', { ...base, dcls_month: '202601' }, option)
    const feb = buildOfferId('mortgage', { ...base, dcls_month: '202602' }, option)
    expect(jan).toBe(feb)
  })

  it('옵션이 다르면 다른 키를 만든다', () => {
    const fixed = buildOfferId('mortgage', base, { ...option, lend_rate_type: 'F' })
    const variable = buildOfferId('mortgage', base, { ...option, lend_rate_type: 'V' })
    expect(fixed).not.toBe(variable)
  })

  it('상품종류가 다르면 다른 키를 만든다', () => {
    expect(buildOfferId('mortgage', base, option)).not.toBe(buildOfferId('rent', base, option))
  })
})

// ─── 신용점수 구간 ──────────────────────────────────────────────────────────

describe('신용점수 구간', () => {
  const creditOption: RawLoanOption = {
    crdt_grad_1: '4.2',
    crdt_grad_4: '5.1',
    crdt_grad_5: '7.3',
    crdt_grad_6: '11.8',
    crdt_grad_10: '0', // 미취급
    crdt_grad_11: '-',
    crdt_grad_12: null,
    crdt_grad_avg: '6.4',
  }

  it('점수를 올바른 구간에 매핑한다', () => {
    expect(bandForScore(950)?.field).toBe('crdt_grad_1')
    expect(bandForScore(900)?.field).toBe('crdt_grad_4')
    expect(bandForScore(801)?.field).toBe('crdt_grad_4')
    expect(bandForScore(800)?.field).toBe('crdt_grad_5')
    expect(bandForScore(650)?.field).toBe('crdt_grad_6')
    expect(bandForScore(300)?.field).toBe('crdt_grad_12')
  })

  it('범위를 벗어난 점수는 양 끝 구간으로 클램프한다', () => {
    expect(bandForScore(1200)?.field).toBe('crdt_grad_1')
    expect(bandForScore(-50)?.field).toBe('crdt_grad_12')
  })

  it('취급하지 않는 구간은 null 로 남긴다', () => {
    const rates = extractCreditScoreRates(creditOption)
    expect(rates.crdt_grad_1).toBe(4.2)
    expect(rates.crdt_grad_6).toBe(11.8)
    expect(rates.crdt_grad_10).toBeNull() // "0" → 미취급
    expect(rates.crdt_grad_11).toBeNull()
    expect(rates.crdt_grad_12).toBeNull()
  })

  it('구간별 금리에서 최저·최고를 유도한다', () => {
    const range = deriveCreditRateRange(extractCreditScoreRates(creditOption))
    expect(range.min).toBe(4.2)
    expect(range.max).toBe(11.8)
  })

  it('금리가 하나도 없으면 범위도 null', () => {
    expect(deriveCreditRateRange({})).toEqual({ min: null, max: null })
  })
})

// ─── baseList × optionList 결합 ─────────────────────────────────────────────

describe('joinOffers', () => {
  const base: RawLoanBase = {
    dcls_month: '202606',
    fin_co_no: '0010001',
    kor_co_nm: 'KB국민은행',
    fin_prdt_cd: 'PRD01',
    fin_prdt_nm: 'KB주택담보대출',
    join_way: '영업점,인터넷',
    loan_lmt: 'LTV 이내',
  }

  it('한 상품의 여러 옵션을 각각의 행으로 펼친다', () => {
    const offers = joinOffers(
      'mortgage',
      '020000',
      [base],
      [
        { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', lend_rate_type: 'F', lend_rate_type_nm: '고정금리', lend_rate_min: '4.1', lend_rate_max: '5.2' },
        { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', lend_rate_type: 'V', lend_rate_type_nm: '변동금리', lend_rate_min: '3.9', lend_rate_max: '5.0' },
      ]
    )
    expect(offers).toHaveLength(2)
    expect(offers.map((o) => o.rateType)).toEqual(['고정금리', '변동금리'])
    expect(offers[0].companyName).toBe('KB국민은행')
    expect(offers[0].finGroupName).toBe('은행')
    expect(offers[0].joinWay).toEqual(['영업점', '인터넷'])
  })

  it('대응하는 상품이 없는 고아 옵션은 버린다', () => {
    const offers = joinOffers('mortgage', '020000', [base], [
      { fin_co_no: '9999999', fin_prdt_cd: 'GHOST', lend_rate_min: '4.1' },
    ])
    expect(offers).toHaveLength(0)
  })

  it('유효 금리가 하나도 없는 행은 버린다 (비교 불가)', () => {
    const offers = joinOffers('mortgage', '020000', [base], [
      { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', lend_rate_min: '0', lend_rate_max: '-', lend_rate_avg: null },
    ])
    expect(offers).toHaveLength(0)
  })

  it('회사명·상품명이 없으면 표기 불가이므로 버린다', () => {
    const offers = joinOffers(
      'mortgage',
      '020000',
      [{ ...base, kor_co_nm: null }],
      [{ fin_co_no: '0010001', fin_prdt_cd: 'PRD01', lend_rate_min: '4.1' }]
    )
    expect(offers).toHaveLength(0)
  })

  it('신용대출은 구간별 금리로부터 최저·최고를 유도한다', () => {
    const offers = joinOffers(
      'credit',
      '020000',
      [{ ...base, fin_prdt_nm: 'KB직장인대출' }],
      [
        {
          fin_co_no: '0010001',
          fin_prdt_cd: 'PRD01',
          crdt_lend_rate_type: 'A',
          crdt_prdt_type: '1',
          crdt_grad_1: '4.2',
          crdt_grad_6: '11.8',
          crdt_grad_avg: '6.4',
        },
      ]
    )
    expect(offers).toHaveLength(1)
    expect(offers[0].rateMin).toBe(4.2)
    expect(offers[0].rateMax).toBe(11.8)
    expect(offers[0].rateAvg).toBe(6.4)
    expect(offers[0].creditProductType).toBe('일반신용대출')
    expect(offers[0].creditScoreRates).not.toBeNull()
  })

  it('신용대출에서 최종 대출금리(A) 행만 채택한다', () => {
    // 실제 FSS 응답 형태. A ≈ B + C − D 로 분해되어 내려온다.
    // D(가감조정금리)를 금리로 취급하면 연 0.02% 짜리 가짜 1위가 만들어진다.
    const offers = joinOffers(
      'credit',
      '020000',
      [{ ...base, fin_prdt_nm: '일반신용대출' }],
      [
        { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', crdt_lend_rate_type: 'A', crdt_lend_rate_type_nm: '대출금리', crdt_grad_1: '5.08', crdt_grad_avg: '5.57' },
        { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', crdt_lend_rate_type: 'B', crdt_lend_rate_type_nm: '기준금리', crdt_grad_1: '2.96' },
        { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', crdt_lend_rate_type: 'C', crdt_lend_rate_type_nm: '가산금리', crdt_grad_1: '2.12' },
        { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', crdt_lend_rate_type: 'D', crdt_lend_rate_type_nm: '가감조정금리', crdt_grad_4: '0.02' },
      ]
    )
    expect(offers).toHaveLength(1)
    expect(offers[0].rateMin).toBe(5.08)
    // 가감조정금리 0.02 가 최저금리로 새어 들어오면 안 된다
    expect(offers[0].rateMin).not.toBe(0.02)
  })

  it('신용대출은 고정/변동 구분이 없으므로 금리유형을 비워둔다', () => {
    const offers = joinOffers(
      'credit',
      '020000',
      [{ ...base, fin_prdt_nm: '일반신용대출' }],
      [{ fin_co_no: '0010001', fin_prdt_cd: 'PRD01', crdt_lend_rate_type: 'A', crdt_lend_rate_type_nm: '대출금리', crdt_grad_1: '5.08' }]
    )
    expect(offers[0].rateType).toBeNull()
  })

  it('금리유형을 알 수 없는 신용대출 행은 안전하게 제외한다', () => {
    const offers = joinOffers('credit', '020000', [base], [
      { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', crdt_grad_1: '5.0' },
    ])
    expect(offers).toHaveLength(0)
  })

  it('주담대는 금리유형 필터링을 적용하지 않는다 (A/B/C/D 체계가 없음)', () => {
    const offers = joinOffers('mortgage', '020000', [base], [
      { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', lend_rate_type: 'F', lend_rate_type_nm: '고정금리', lend_rate_min: '4.1' },
    ])
    expect(offers).toHaveLength(1)
    expect(offers[0].rateType).toBe('고정금리')
  })

  it('동일 키 중복 옵션은 한 번만 남긴다', () => {
    const dup = { fin_co_no: '0010001', fin_prdt_cd: 'PRD01', lend_rate_type: 'F', lend_rate_min: '4.1' }
    const offers = joinOffers('mortgage', '020000', [base], [dup, { ...dup }])
    expect(offers).toHaveLength(1)
  })
})

// ─── 응답 봉투 ──────────────────────────────────────────────────────────────

describe('parseApiPage', () => {
  it('오류코드를 예외로 올린다 (조용히 빈 표를 만들지 않는다)', () => {
    expect(() =>
      parseApiPage('mortgage', '020000', { result: { err_cd: '011', err_msg: '인증키가 유효하지 않습니다.' } })
    ).toThrow(FinlifeApiError)
  })

  it('IP 미등록 오류도 그대로 전파한다', () => {
    try {
      parseApiPage('mortgage', '020000', { result: { err_cd: '020', err_msg: null } })
      expect.unreachable('예외가 발생해야 한다')
    } catch (error) {
      expect(error).toBeInstanceOf(FinlifeApiError)
      expect((error as FinlifeApiError).code).toBe('020')
      expect((error as FinlifeApiError).message).toContain('등록되지 않은 IP')
    }
  })

  it('result 가 없으면 예외', () => {
    expect(() => parseApiPage('mortgage', '020000', {})).toThrow(FinlifeApiError)
  })

  it('정상 응답에서 페이지 정보와 오퍼를 뽑는다', () => {
    const page = parseApiPage('mortgage', '020000', {
      result: {
        err_cd: '000',
        total_count: '2',
        max_page_no: '3',
        now_page_no: '1',
        baseList: [{ fin_co_no: '1', kor_co_nm: '신한은행', fin_prdt_cd: 'P', fin_prdt_nm: '신한주담대', dcls_month: '202606' }],
        optionList: [{ fin_co_no: '1', fin_prdt_cd: 'P', lend_rate_min: '4.0' }],
      },
    })
    expect(page.maxPageNo).toBe(3)
    expect(page.nowPageNo).toBe(1)
    expect(page.offers).toHaveLength(1)
  })
})

// ─── 상환 계산: 기존 구현과의 동치성 ─────────────────────────────────────────

describe('computeRepayment — lib/calculators 반복 계산과 동치', () => {
  const cases = [
    { principal: 300_000_000, rate: 4.2, months: 360 },
    { principal: 50_000_000, rate: 3.15, months: 60 },
    { principal: 120_000_000, rate: 7.8, months: 120 },
  ]

  it('원리금균등 결과가 calcEPI 와 일치한다', () => {
    for (const { principal, rate, months } of cases) {
      const closed = computeRepayment(principal, rate, months, 'epi')!
      const iterative = calcEPI(principal, rate, months)!
      expect(closed.monthly).toBeCloseTo(iterative.monthly, 6)
      expect(closed.totalInterest).toBeCloseTo(iterative.totalInterest, 4)
    }
  })

  it('원금균등 결과가 calcEP 와 일치한다', () => {
    for (const { principal, rate, months } of cases) {
      const closed = computeRepayment(principal, rate, months, 'ep')!
      const iterative = calcEP(principal, rate, months)!
      expect(closed.monthly).toBeCloseTo(iterative.firstPayment, 6)
      expect(closed.lastMonthly).toBeCloseTo(iterative.lastPayment, 6)
      expect(closed.totalInterest).toBeCloseTo(iterative.totalInterest, 4)
    }
  })

  it('만기일시는 매월 이자만 내고 만기에 원금을 갚는다', () => {
    const r = computeRepayment(100_000_000, 6, 12, 'bullet')!
    expect(r.monthly).toBeCloseTo(500_000, 6) // 1억 × 6% ÷ 12
    expect(r.totalInterest).toBeCloseTo(6_000_000, 6)
    expect(r.lastMonthly).toBeCloseTo(100_500_000, 6)
  })

  it('잘못된 입력은 null', () => {
    expect(computeRepayment(0, 4, 360, 'epi')).toBeNull()
    expect(computeRepayment(1000, 4, 0, 'epi')).toBeNull()
    expect(computeRepayment(1000, -1, 12, 'epi')).toBeNull()
  })

  it('무이자여도 나누어 갚는다 (0 나눗셈 방어)', () => {
    const r = computeRepayment(1_200_000, 0, 12, 'epi')!
    expect(r.monthly).toBeCloseTo(100_000, 6)
    expect(r.totalInterest).toBeCloseTo(0, 6)
  })
})

describe('repayMethodFromType', () => {
  it('공시 상환유형명을 계산 방식으로 옮긴다', () => {
    expect(repayMethodFromType('분할상환방식')).toBe('epi')
    expect(repayMethodFromType('만기일시상환방식')).toBe('bullet')
    expect(repayMethodFromType(null)).toBe('epi')
  })
})

// ─── 비교표 ─────────────────────────────────────────────────────────────────

function offer(partial: Partial<LoanOffer> & Pick<LoanOffer, 'id' | 'companyName'>): LoanOffer {
  return {
    productType: 'mortgage',
    disclosureMonth: '202606',
    companyCode: '000',
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

const baseInput: CompareInput = {
  productType: 'mortgage',
  amount: 300_000_000,
  months: 360,
  rateBasis: 'min',
  repayMethod: 'epi',
}

describe('selectRate', () => {
  it('요청한 기준이 없으면 다음 순위 금리로 대체한다', () => {
    const o = offer({ id: 'a', companyName: 'A', rateMin: null, rateAvg: 4.5, rateMax: 5.5 })
    expect(selectRate(o, baseInput)).toEqual({ rate: 4.5, source: 'avg' })
  })

  it('신용대출은 신용점수 구간의 실제 공시 금리를 쓴다', () => {
    const o = offer({
      id: 'c',
      companyName: 'C',
      productType: 'credit',
      rateMin: 4.2,
      creditScoreRates: { crdt_grad_1: 4.2, crdt_grad_6: 11.8 },
    })
    const result = selectRate(o, { ...baseInput, productType: 'credit', creditScore: 650 })
    expect(result).toEqual({ rate: 11.8, source: 'creditScore' })
  })

  it('해당 신용점수 구간을 취급하지 않으면 다른 금리로 대체하지 않는다', () => {
    const o = offer({
      id: 'c',
      companyName: 'C',
      productType: 'credit',
      rateMin: 4.2,
      creditScoreRates: { crdt_grad_1: 4.2, crdt_grad_6: null },
    })
    expect(selectRate(o, { ...baseInput, productType: 'credit', creditScore: 650 })).toBeNull()
  })
})

describe('buildComparison', () => {
  const offers = [
    offer({ id: 'high', companyName: '비싼은행', rateMin: 5.0 }),
    offer({ id: 'low', companyName: '싼은행', rateMin: 4.0 }),
    offer({ id: 'mid', companyName: '중간은행', rateMin: 4.5 }),
  ]

  it('총이자 오름차순으로 정렬한다', () => {
    const { rows } = buildComparison(offers, baseInput, 'totalInterest')
    expect(rows.map((r) => r.offer.id)).toEqual(['low', 'mid', 'high'])
  })

  it('1위 대비 총이자 차액을 채운다', () => {
    const { rows } = buildComparison(offers, baseInput, 'totalInterest')
    expect(rows[0].extraInterestVsBest).toBe(0)
    expect(rows[1].extraInterestVsBest).toBeGreaterThan(0)
    // 3억 30년에서 1%p 차이는 총이자 수천만원 규모여야 한다
    expect(rows[2].extraInterestVsBest).toBeGreaterThan(20_000_000)
  })

  it('월상환액 차액도 함께 계산한다', () => {
    const { rows } = buildComparison(offers, baseInput, 'monthly')
    expect(rows[0].extraMonthlyVsBest).toBe(0)
    expect(rows[2].extraMonthlyVsBest).toBeGreaterThan(0)
  })

  it('회사명 정렬을 지원한다', () => {
    const { rows } = buildComparison(offers, baseInput, 'company')
    expect(rows.map((r) => r.offer.companyName)).toEqual(['비싼은행', '싼은행', '중간은행'])
  })

  it('신용점수 구간 미취급 건수를 따로 보고한다', () => {
    const creditOffers = [
      offer({
        id: 'ok',
        companyName: 'OK',
        productType: 'credit',
        creditScoreRates: { crdt_grad_6: 9.5 },
      }),
      offer({
        id: 'no',
        companyName: 'NO',
        productType: 'credit',
        creditScoreRates: { crdt_grad_6: null, crdt_grad_1: 4.0 },
      }),
    ]
    const result = buildComparison(creditOffers, {
      ...baseInput,
      productType: 'credit',
      creditScore: 650,
    })
    expect(result.rows).toHaveLength(1)
    expect(result.excludedByCreditScore).toBe(1)
    expect(result.candidateCount).toBe(2)
  })

  it('빈 목록에서도 터지지 않는다', () => {
    const result = buildComparison([], baseInput)
    expect(result.rows).toEqual([])
  })

  it('만기일시상환은 같은 금리라도 총이자가 원리금균등보다 훨씬 크다', () => {
    // UI 가 두 방식을 섞어 "은행 간 격차"로 제시하면 안 되는 근거.
    // 3억/30년/5%: 원리금균등 총이자 ≈ 2.8억, 만기일시 ≈ 4.5억
    const o = offer({ id: 'x', companyName: 'X', rateMin: 5.0 })
    const epi = buildComparison([o], { ...baseInput, repayMethod: 'epi' }).rows[0]
    const bullet = buildComparison([o], { ...baseInput, repayMethod: 'bullet' }).rows[0]

    expect(bullet.totalInterest).toBeGreaterThan(epi.totalInterest * 1.5)
    // 반대로 월 부담은 만기일시가 더 적다
    expect(bullet.monthly).toBeLessThan(epi.monthly)
  })

  it('상환방식이 섞이면 금리가 낮아도 총이자 순위가 뒤집힌다', () => {
    // 저금리 만기일시(3.6%) vs 고금리 원리금균등(4.0%) → 총이자는 만기일시가 더 크다.
    // 이 역전 때문에 격차 계산은 반드시 같은 상환방식끼리 해야 한다.
    const cheapBullet = offer({ id: 'bullet', companyName: '경남', rateMin: 3.64, repayType: '만기일시상환방식' })
    const pricierEpi = offer({ id: 'epi', companyName: '카카오', rateMin: 4.01, repayType: '분할상환방식' })

    const { rows } = buildComparison([cheapBullet, pricierEpi], { ...baseInput, repayMethod: undefined }, 'totalInterest')

    expect(rows[0].offer.id).toBe('epi') // 금리는 더 높지만 총이자는 더 적다
    expect(rows[0].rate).toBeGreaterThan(rows[1].rate)
  })

  it('오퍼의 공시 상환유형을 따를 수 있다', () => {
    const bulletOffer = offer({ id: 'b', companyName: 'B', rateMin: 5, repayType: '만기일시상환' })
    const { rows } = buildComparison([bulletOffer], { ...baseInput, repayMethod: undefined })
    expect(rows[0].repayMethod).toBe('bullet')
  })
})

// ─── 필터 ───────────────────────────────────────────────────────────────────

describe('filterOffers', () => {
  const offers = [
    offer({ id: '1', companyName: 'KB국민은행', rateType: '고정금리', finGroupCode: '020000' }),
    offer({ id: '2', companyName: '웰컴저축은행', rateType: '변동금리', finGroupCode: '030300' }),
  ]

  it('권역으로 거른다', () => {
    expect(filterOffers(offers, { finGroupCodes: ['030300'] })).toHaveLength(1)
  })

  it('빈 권역 목록은 전체 통과', () => {
    expect(filterOffers(offers, { finGroupCodes: [] })).toHaveLength(2)
  })

  it('금리유형으로 거른다', () => {
    expect(filterOffers(offers, { rateType: '고정' })[0].id).toBe('1')
  })

  it('회사명으로 검색한다', () => {
    expect(filterOffers(offers, { query: '저축' })[0].id).toBe('2')
  })

  it('필터가 비어있으면 전부 통과', () => {
    expect(filterOffers(offers, {})).toHaveLength(2)
  })
})

describe('collectFacets', () => {
  it('실제 데이터에 존재하는 선택지만 모은다', () => {
    const facets = collectFacets([
      offer({ id: '1', companyName: 'A', rateType: '고정금리', repayType: '분할상환' }),
      offer({ id: '2', companyName: 'B', rateType: '변동금리', repayType: '분할상환', finGroupCode: '030300', finGroupName: '저축은행' }),
    ])
    expect(facets.rateTypes).toEqual(['고정금리', '변동금리'])
    expect(facets.repayTypes).toEqual(['분할상환'])
    expect(facets.finGroups).toHaveLength(2)
  })
})
