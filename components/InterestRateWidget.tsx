'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Percent, Building2, Home } from 'lucide-react'

interface RateData {
  baseRate: number        // 기준금리
  basePrev: number        // 이전 기준금리
  mortgageRate: number    // 주담대 평균금리
  mortgagePrev: number    // 이전 주담대 금리
  jeonseRate: number      // 전세대출 평균금리
  jeonseRatePrev: number  // 이전 전세대출 금리
  updatedAt: string       // 업데이트 시간
}

export default function InterestRateWidget() {
  const [rates, setRates] = useState<RateData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRates()

    // 1시간마다 갱신 (금리는 자주 변하지 않음)
    const interval = setInterval(fetchRates, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/rates/interest')
      const result = await response.json()

      if (result.success && result.data) {
        setRates(result.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Interest rate fetch error:', error)
      setLoading(false)
    }
  }

  const getRateChange = (current: number, prev: number) => {
    const diff = current - prev
    return {
      diff: Math.abs(diff).toFixed(2),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    }
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-3">
        <div className="container">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  const baseChange = rates ? getRateChange(rates.baseRate, rates.basePrev) : null
  const mortgageChange = rates ? getRateChange(rates.mortgageRate, rates.mortgagePrev) : null

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container py-2 px-3">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* 기준금리 */}
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Building2 className="w-3 h-3" />
              <span>기준금리</span>
            </div>

            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {rates?.baseRate.toFixed(2)}%
              </span>
              {baseChange && baseChange.direction !== 'same' && (
                <div className={`flex items-center gap-0.5 ${baseChange.direction === 'up' ? 'text-red-600' : 'text-blue-600'}`}>
                  {baseChange.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-[10px] font-medium">
                    {baseChange.direction === 'up' ? '+' : '-'}{baseChange.diff}%p
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 주택담보대출 금리 */}
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Home className="w-3 h-3" />
              <span className="hidden sm:inline">주담대</span>
              <span className="sm:hidden">주담대</span>
            </div>

            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {rates?.mortgageRate.toFixed(2)}%
              </span>
              {mortgageChange && mortgageChange.direction !== 'same' && (
                <div className={`flex items-center gap-0.5 ${mortgageChange.direction === 'up' ? 'text-red-600' : 'text-blue-600'}`}>
                  {mortgageChange.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-[10px] font-medium">
                    {mortgageChange.direction === 'up' ? '+' : '-'}{mortgageChange.diff}%p
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 전세대출 금리 */}
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Percent className="w-3 h-3" />
              <span>전세대출</span>
            </div>

            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />

            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {rates?.jeonseRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
