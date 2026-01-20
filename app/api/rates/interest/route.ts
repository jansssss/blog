/**
 * 금리 정보 API
 * GET /api/rates/interest
 *
 * 한국은행 기준금리 + 주담대/전세대출 평균금리 제공
 *
 * 데이터 소스:
 * - 기준금리: 한국은행 경제통계시스템 (ECOS)
 * - 대출금리: 한국은행 ECOS (예금은행 가중평균금리)
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const revalidate = 3600 // 1시간 캐시

// 한국은행 ECOS API 키
const BOK_API_KEY = 'GI7RVUPCEV9O6AJZTG7T'

// 캐시 (메모리)
let cachedRates: {
  baseRate: number
  basePrev: number
  mortgageRate: number
  mortgagePrev: number
  jeonseRate: number
  jeonseRatePrev: number
  updatedAt: string
} | null = null
let cacheTime = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1시간

/**
 * 한국은행 ECOS API에서 기준금리 조회
 * 통계표: 722Y001 (한국은행 기준금리 및 여수신금리)
 * 항목: 0101000 (한국은행 기준금리)
 */
async function fetchBaseRate(): Promise<{ current: number; prev: number }> {
  try {
    // 최근 2개월 데이터 조회
    const now = new Date()
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const startYear = now.getMonth() < 1 ? now.getFullYear() - 1 : now.getFullYear()
    const startMonth = now.getMonth() < 1 ? 12 : now.getMonth()
    const startDate = `${startYear}${String(startMonth).padStart(2, '0')}`

    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${BOK_API_KEY}/json/kr/1/2/722Y001/M/${startDate}/${endDate}/0101000`

    const response = await fetch(url, { next: { revalidate: 3600 } })
    const data = await response.json()

    if (data.StatisticSearch?.row) {
      const rows = data.StatisticSearch.row
      const current = parseFloat(rows[rows.length - 1]?.DATA_VALUE || '3.50')
      const prev = rows.length > 1 ? parseFloat(rows[rows.length - 2]?.DATA_VALUE || current.toString()) : current

      return { current, prev }
    }

    return { current: 3.50, prev: 3.50 }
  } catch (error) {
    console.error('Base rate fetch error:', error)
    return { current: 3.50, prev: 3.50 }
  }
}

/**
 * 한국은행 ECOS API에서 주택담보대출 금리 조회
 * 통계표: 121Y002 (예금은행 가중평균금리 - 신규취급액 기준)
 * 항목: BEABAA21 (주택담보대출)
 */
async function fetchMortgageRate(): Promise<{ current: number; prev: number }> {
  try {
    const now = new Date()
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const startYear = now.getMonth() < 1 ? now.getFullYear() - 1 : now.getFullYear()
    const startMonth = now.getMonth() < 1 ? 12 : now.getMonth()
    const startDate = `${startYear}${String(startMonth).padStart(2, '0')}`

    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${BOK_API_KEY}/json/kr/1/2/121Y002/M/${startDate}/${endDate}/BEABAA21`

    const response = await fetch(url, { next: { revalidate: 3600 } })
    const data = await response.json()

    if (data.StatisticSearch?.row) {
      const rows = data.StatisticSearch.row
      const current = parseFloat(rows[rows.length - 1]?.DATA_VALUE || '4.50')
      const prev = rows.length > 1 ? parseFloat(rows[rows.length - 2]?.DATA_VALUE || current.toString()) : current

      return { current, prev }
    }

    return { current: 4.50, prev: 4.50 }
  } catch (error) {
    console.error('Mortgage rate fetch error:', error)
    return { current: 4.50, prev: 4.50 }
  }
}

/**
 * 한국은행 ECOS API에서 전세대출 금리 조회
 * 통계표: 121Y002 (예금은행 가중평균금리 - 신규취급액 기준)
 * 항목: BEABAA22 (전세자금대출) 또는 일반 가계대출
 */
async function fetchJeonseRate(): Promise<{ current: number; prev: number }> {
  try {
    const now = new Date()
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const startYear = now.getMonth() < 1 ? now.getFullYear() - 1 : now.getFullYear()
    const startMonth = now.getMonth() < 1 ? 12 : now.getMonth()
    const startDate = `${startYear}${String(startMonth).padStart(2, '0')}`

    // 가계대출 금리 (전세자금 포함)
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${BOK_API_KEY}/json/kr/1/2/121Y002/M/${startDate}/${endDate}/BEABAA2`

    const response = await fetch(url, { next: { revalidate: 3600 } })
    const data = await response.json()

    if (data.StatisticSearch?.row) {
      const rows = data.StatisticSearch.row
      const current = parseFloat(rows[rows.length - 1]?.DATA_VALUE || '4.30')
      const prev = rows.length > 1 ? parseFloat(rows[rows.length - 2]?.DATA_VALUE || current.toString()) : current

      return { current, prev }
    }

    return { current: 4.30, prev: 4.30 }
  } catch (error) {
    console.error('Jeonse rate fetch error:', error)
    return { current: 4.30, prev: 4.30 }
  }
}

export async function GET() {
  try {
    // 캐시 확인
    if (cachedRates && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedRates,
        source: 'cache',
        message: '금리 데이터 조회 성공 (캐시)'
      })
    }

    // 병렬로 금리 데이터 조회
    const [baseRate, mortgageRate, jeonseRate] = await Promise.all([
      fetchBaseRate(),
      fetchMortgageRate(),
      fetchJeonseRate()
    ])

    const rates = {
      baseRate: baseRate.current,
      basePrev: baseRate.prev,
      mortgageRate: mortgageRate.current,
      mortgagePrev: mortgageRate.prev,
      jeonseRate: jeonseRate.current,
      jeonseRatePrev: jeonseRate.prev,
      updatedAt: new Date().toISOString()
    }

    // 캐시 저장
    cachedRates = rates
    cacheTime = Date.now()

    return NextResponse.json({
      success: true,
      data: rates,
      source: 'bok',
      message: '금리 데이터 조회 성공 (한국은행 ECOS)'
    })
  } catch (error) {
    console.error('Interest rate API error:', error)

    // 에러 시 기본값 반환
    return NextResponse.json({
      success: true,
      data: {
        baseRate: 3.50,
        basePrev: 3.50,
        mortgageRate: 4.50,
        mortgagePrev: 4.50,
        jeonseRate: 4.30,
        jeonseRatePrev: 4.30,
        updatedAt: new Date().toISOString()
      },
      source: 'fallback',
      message: '금리 데이터 조회 실패, 기본값 반환'
    })
  }
}
