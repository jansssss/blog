'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'

interface WeatherData {
  temp: number
  humidity: number
  icon: string
  description: string
}

interface StockData {
  value: number
  change: number
  changePercent: number
}

const CITIES = [
  { name: '서울', lat: 37.5665, lon: 126.9780 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '대전', lat: 36.3504, lon: 127.3845 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '울산', lat: 35.5384, lon: 129.3114 },
  { name: '수원', lat: 37.2636, lon: 127.0286 },
]

export default function InfoWidget() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [stock, setStock] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 모바일 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // localStorage에서 저장된 도시 불러오기
    const savedCity = localStorage.getItem('selectedCity')
    if (savedCity) {
      const city = CITIES.find(c => c.name === savedCity)
      if (city) setSelectedCity(city)
    } else if (isMobile && 'geolocation' in navigator) {
      // 모바일: 현재 위치 감지
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // 위치 권한 거부 시 서울 기본값
          fetchWeather(selectedCity)
        }
      )
    } else {
      fetchWeather(selectedCity)
    }

    fetchStock()

    // 5분마다 갱신
    const interval = setInterval(() => {
      fetchWeather(selectedCity)
      fetchStock()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isMobile])

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      // OpenWeatherMap API 호출 (무료 API 키 필요)
      // 임시 더미 데이터
      setWeather({
        temp: -1,
        humidity: 40,
        icon: '❄️',
        description: '눈'
      })
      setLoading(false)
    } catch (error) {
      console.error('Weather fetch error:', error)
      setLoading(false)
    }
  }

  const fetchWeather = async (city: typeof CITIES[0]) => {
    try {
      // OpenWeatherMap API 호출
      // 임시 더미 데이터
      setWeather({
        temp: -1,
        humidity: 40,
        icon: '❄️',
        description: '눈'
      })
      setLoading(false)
    } catch (error) {
      console.error('Weather fetch error:', error)
      setLoading(false)
    }
  }

  const fetchStock = async () => {
    try {
      // Yahoo Finance API 또는 한국거래소 API
      // 임시 더미 데이터
      setStock({
        value: 4586.32,
        change: 34.32,
        changePercent: 0.75
      })
    } catch (error) {
      console.error('Stock fetch error:', error)
    }
  }

  const handleCityChange = (city: typeof CITIES[0]) => {
    setSelectedCity(city)
    setShowCitySelector(false)
    localStorage.setItem('selectedCity', city.name)
    fetchWeather(city)
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-3">
        <div className="container">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* 날씨 정보 */}
          <div className="flex items-center gap-3 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              <button
                onClick={() => setShowCitySelector(!showCitySelector)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{selectedCity.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCitySelector ? 'rotate-180' : ''}`} />
              </button>

              {showCitySelector && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[120px]">
                  {CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleCityChange(city)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        city.name === selectedCity.name ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-2">
              <span className="text-2xl">{weather?.icon}</span>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {weather?.temp}°C
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  습도 {weather?.humidity}%
                </span>
              </div>
            </div>
          </div>

          {/* 코스피 정보 */}
          <div className="flex items-center gap-3 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              코스피
            </span>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stock?.value.toLocaleString()}
              </span>
              {stock && stock.change > 0 ? (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    +{stock.changePercent}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-blue-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {stock?.changePercent}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
