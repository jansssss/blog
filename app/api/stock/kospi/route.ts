import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Yahoo Finance API 시도
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?interval=1d&range=1d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Yahoo Finance API failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0]
      const meta = result.meta

      const currentPrice = meta.regularMarketPrice
      const previousClose = meta.chartPreviousClose || meta.previousClose

      if (currentPrice && previousClose) {
        const change = currentPrice - previousClose
        const changePercent = (change / previousClose) * 100

        return NextResponse.json({
          success: true,
          data: {
            value: parseFloat(currentPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2))
          }
        })
      }
    }

    throw new Error('Invalid data structure from Yahoo Finance')
  } catch (error) {
    console.error('KOSPI API Error:', error)

    // 폴백: 기본값 반환 (에러 표시하지 않음)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        value: 0,
        change: 0,
        changePercent: 0
      }
    }, { status: 200 }) // 200으로 반환하여 클라이언트 에러 방지
  }
}
