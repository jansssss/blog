import { describe, expect, it, vi } from 'vitest'

import { fetchAllGroupsForProduct, fetchLoanOffers } from '@/lib/finlife/client'
import { FinlifeApiError } from '@/lib/finlife/normalize'

/** 정상 응답 한 페이지를 만든다 */
function okPage(opts: {
  nowPage: number
  maxPage: number
  companyNo: string
  productCd: string
  rate: string
}) {
  return {
    result: {
      err_cd: '000',
      err_msg: '정상',
      total_count: '1',
      now_page_no: String(opts.nowPage),
      max_page_no: String(opts.maxPage),
      baseList: [
        {
          dcls_month: '202606',
          fin_co_no: opts.companyNo,
          kor_co_nm: `은행${opts.companyNo}`,
          fin_prdt_cd: opts.productCd,
          fin_prdt_nm: `상품${opts.productCd}`,
        },
      ],
      optionList: [
        {
          fin_co_no: opts.companyNo,
          fin_prdt_cd: opts.productCd,
          lend_rate_type_nm: '변동금리',
          lend_rate_min: opts.rate,
        },
      ],
    },
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  } as Response
}

const NO_DELAY = { auth: 'TEST_KEY', delayMs: 0, retries: 0 }

describe('fetchLoanOffers', () => {
  it('max_page_no 만큼 페이지를 이어서 수집한다', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(okPage({ nowPage: 1, maxPage: 3, companyNo: '1', productCd: 'A', rate: '4.1' })))
      .mockResolvedValueOnce(jsonResponse(okPage({ nowPage: 2, maxPage: 3, companyNo: '2', productCd: 'B', rate: '4.2' })))
      .mockResolvedValueOnce(jsonResponse(okPage({ nowPage: 3, maxPage: 3, companyNo: '3', productCd: 'C', rate: '4.3' })))

    const { offers, summary } = await fetchLoanOffers('mortgage', '020000', {
      ...NO_DELAY,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(offers).toHaveLength(3)
    expect(summary.fetchedPages).toBe(3)
    expect(summary.disclosureMonth).toBe('202606')
    expect(summary.errors).toEqual([])
  })

  it('올바른 엔드포인트와 파라미터로 호출한다', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(okPage({ nowPage: 1, maxPage: 1, companyNo: '1', productCd: 'A', rate: '4.1' })))

    await fetchLoanOffers('credit', '030300', {
      ...NO_DELAY,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    const url = String(fetchImpl.mock.calls[0][0])
    expect(url).toContain('/finlifeapi/creditLoanProductsSearch.json')
    expect(url).toContain('auth=TEST_KEY')
    expect(url).toContain('topFinGrpNo=030300')
    expect(url).toContain('pageNo=1')
  })

  it('페이지 간 중복 오퍼를 제거한다', async () => {
    const same = { nowPage: 1, maxPage: 2, companyNo: '1', productCd: 'A', rate: '4.1' }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(okPage(same)))
      .mockResolvedValueOnce(jsonResponse(okPage({ ...same, nowPage: 2 })))

    const { offers } = await fetchLoanOffers('mortgage', '020000', {
      ...NO_DELAY,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(offers).toHaveLength(1)
  })

  it('페이지 상한을 넘기면 중단하고 경고를 남긴다', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(okPage({ nowPage: 1, maxPage: 99, companyNo: '1', productCd: 'A', rate: '4.1' })))

    const { summary } = await fetchLoanOffers('mortgage', '020000', {
      ...NO_DELAY,
      maxPages: 2,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(summary.errors[0]).toContain('페이지 상한')
  })

  it('네트워크 오류는 재시도한다', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(jsonResponse(okPage({ nowPage: 1, maxPage: 1, companyNo: '1', productCd: 'A', rate: '4.1' })))

    const { offers } = await fetchLoanOffers('mortgage', '020000', {
      auth: 'TEST_KEY',
      delayMs: 0,
      retries: 2,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(offers).toHaveLength(1)
  })

  it('인증 오류는 재시도하지 않고 즉시 던진다', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ result: { err_cd: '011', err_msg: '인증키가 유효하지 않습니다.' } }))

    await expect(
      fetchLoanOffers('mortgage', '020000', {
        auth: 'BAD',
        delayMs: 0,
        retries: 3,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toThrow(FinlifeApiError)

    // 재시도 없이 1회만 호출되어야 한다
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('IP 미등록 오류도 즉시 중단한다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ result: { err_cd: '020' } }))

    await expect(
      fetchLoanOffers('mortgage', '020000', {
        auth: 'K',
        delayMs: 0,
        retries: 3,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toMatchObject({ code: '020' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('HTTP 오류는 재시도 후 실패한다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(null, 503))

    await expect(
      fetchLoanOffers('mortgage', '020000', {
        auth: 'K',
        delayMs: 0,
        retries: 1,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toThrow(/503/)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('인증키가 없으면 안내 메시지와 함께 실패한다', async () => {
    const previous = process.env.FSS_FINLIFE_API_KEY
    delete process.env.FSS_FINLIFE_API_KEY
    try {
      await expect(fetchLoanOffers('mortgage', '020000')).rejects.toThrow(/FSS_FINLIFE_API_KEY/)
    } finally {
      if (previous !== undefined) process.env.FSS_FINLIFE_API_KEY = previous
    }
  })
})

describe('fetchAllGroupsForProduct', () => {
  it('권역 하나가 일시 실패해도 나머지는 계속 수집한다', async () => {
    // mortgage 대상 권역 = [은행(020000), 보험(050000)]
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout')) // 은행 실패 (재시도 0)
      .mockResolvedValueOnce(jsonResponse(okPage({ nowPage: 1, maxPage: 1, companyNo: '9', productCd: 'Z', rate: '4.9' })))

    const { offers, summaries } = await fetchAllGroupsForProduct('mortgage', {
      ...NO_DELAY,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    expect(summaries).toHaveLength(2)
    expect(summaries[0].errors[0]).toContain('timeout')
    expect(summaries[1].offerCount).toBe(1)
    expect(offers).toHaveLength(1)
  })

  it('인증키가 잘못되면 나머지 권역을 시도하지 않는다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ result: { err_cd: '011' } }))

    await expect(
      fetchAllGroupsForProduct('mortgage', {
        ...NO_DELAY,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toThrow(FinlifeApiError)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
