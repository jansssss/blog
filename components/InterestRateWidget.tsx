'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Percent, Building2, Home, MapPin, ChevronDown } from 'lucide-react'

interface RateData {
  baseRate: number        // 기준금리
  basePrev: number        // 이전 기준금리
  mortgageRate: number    // 주담대 평균금리
  mortgagePrev: number    // 이전 주담대 금리
  jeonseRate: number      // 전세대출 평균금리
  jeonseRatePrev: number  // 이전 전세대출 금리
  updatedAt: string       // 업데이트 시간
}

interface WeatherData {
  temp: number
  humidity: number
  icon: string
  description: string
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

// OpenWeatherMap 날씨 코드를 이모지로 변환
function getWeatherIcon(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return '⛈️' // 천둥번개
  if (weatherId >= 300 && weatherId < 400) return '🌦️' // 이슬비
  if (weatherId >= 500 && weatherId < 600) return '🌧️' // 비
  if (weatherId >= 600 && weatherId < 700) return '❄️' // 눈
  if (weatherId >= 700 && weatherId < 800) return '🌫️' // 안개/연무
  if (weatherId === 800) return '☀️' // 맑음
  if (weatherId === 801) return '🌤️' // 약간 흐림
  if (weatherId === 802) return '⛅' // 흐림
  if (weatherId >= 803) return '☁️' // 많이 흐림
  return '🌤️'
}

export default function InterestRateWidget() {
  const [rates, setRates] = useState<RateData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileSlide, setMobileSlide] = useState(0) // 0: 날씨+기준금리, 1: 주담대+전세대출

  useEffect(() => {
    // localStorage에서 저장된 도시 불러오기
    const savedCity = localStorage.getItem('selectedCity')
    if (savedCity) {
      const city = CITIES.find(c => c.name === savedCity)
      if (city) {
        setSelectedCity(city)
        fetchWeather(city)
      } else {
        fetchWeather(selectedCity)
      }
    } else {
      fetchWeather(selectedCity)
    }

    fetchRates()

    // 금리: 1시간마다 갱신
    const rateInterval = setInterval(fetchRates, 60 * 60 * 1000)
    // 날씨: 5분마다 갱신
    const weatherInterval = setInterval(() => fetchWeather(selectedCity), 5 * 60 * 1000)
    // 모바일 슬라이드: 4초마다 전환
    const slideInterval = setInterval(() => {
      setMobileSlide(prev => (prev + 1) % 2)
    }, 4000)

    return () => {
      clearInterval(rateInterval)
      clearInterval(weatherInterval)
      clearInterval(slideInterval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWeather = async (city: typeof CITIES[0]) => {
    try {
      const API_KEY = '48d5ebc4a7208643947ff76715bbb880'
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&lang=kr&appid=${API_KEY}`
      )
      const data = await response.json()

      if (data.main && data.weather) {
        setWeather({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          icon: getWeatherIcon(data.weather[0].id),
          description: data.weather[0].description
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Weather fetch error:', error)
      setLoading(false)
    }
  }

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

  const handleCityChange = (city: typeof CITIES[0]) => {
    setSelectedCity(city)
    setShowCitySelector(false)
    localStorage.setItem('selectedCity', city.name)
    fetchWeather(city)
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

  const jeonseChange = rates ? getRateChange(rates.jeonseRate, rates.jeonseRatePrev) : null

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container py-2 px-3">
        {/* 데스크톱: 4개 모두 표시 */}
        <div className="hidden sm:flex items-center justify-between gap-2">
          {/* 날씨 정보 */}
          <div className="relative flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <button
              onClick={() => setShowCitySelector(!showCitySelector)}
              className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
            >
              <MapPin className="w-3 h-3" />
              <span>{selectedCity.name}</span>
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showCitySelector ? 'rotate-180' : ''}`} />
            </button>

            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-1.5">
              <span className="text-xl">{weather?.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {weather?.temp}°C
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  습도 {weather?.humidity}%
                </span>
              </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {showCitySelector && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] min-w-[120px]">
                {CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCityChange(city)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      city.name === selectedCity.name ? 'bg-gray-100 dark:bg-gray-700 font-medium text-primary' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  {baseChange.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-[10px] font-medium">{baseChange.direction === 'up' ? '+' : '-'}{baseChange.diff}%p</span>
                </div>
              )}
            </div>
          </div>

          {/* 주택담보대출 금리 */}
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Home className="w-3 h-3" />
              <span>주담대</span>
            </div>
            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {rates?.mortgageRate.toFixed(2)}%
              </span>
              {mortgageChange && mortgageChange.direction !== 'same' && (
                <div className={`flex items-center gap-0.5 ${mortgageChange.direction === 'up' ? 'text-red-600' : 'text-blue-600'}`}>
                  {mortgageChange.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-[10px] font-medium">{mortgageChange.direction === 'up' ? '+' : '-'}{mortgageChange.diff}%p</span>
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

        {/* 모바일: 2개씩 롤링 */}
        <div className="sm:hidden relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${mobileSlide * 100}%)` }}
          >
            {/* 슬라이드 1: 날씨 + 기준금리 */}
            <div className="flex items-center justify-between gap-2 min-w-full px-1">
              {/* 날씨 */}
              <div className="relative flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm">
                <button
                  onClick={() => setShowCitySelector(!showCitySelector)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{selectedCity.name}</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showCitySelector ? 'rotate-180' : ''}`} />
                </button>
                <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{weather?.icon}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{weather?.temp}°C</span>
                </div>
                {showCitySelector && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] min-w-[120px]">
                    {CITIES.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCityChange(city)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          city.name === selectedCity.name ? 'bg-gray-100 dark:bg-gray-700 font-medium text-primary' : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* 기준금리 */}
              <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <Building2 className="w-3 h-3" />
                  <span>기준금리</span>
                </div>
                <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{rates?.baseRate.toFixed(2)}%</span>
                  {baseChange && baseChange.direction !== 'same' && (
                    <div className={`flex items-center gap-0.5 ${baseChange.direction === 'up' ? 'text-red-600' : 'text-blue-600'}`}>
                      {baseChange.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 슬라이드 2: 주담대 + 전세대출 */}
            <div className="flex items-center justify-between gap-2 min-w-full px-1">
              {/* 주담대 */}
              <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <Home className="w-3 h-3" />
                  <span>주담대</span>
                </div>
                <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{rates?.mortgageRate.toFixed(2)}%</span>
                  {mortgageChange && mortgageChange.direction !== 'same' && (
                    <div className={`flex items-center gap-0.5 ${mortgageChange.direction === 'up' ? 'text-red-600' : 'text-blue-600'}`}>
                      {mortgageChange.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                  )}
                </div>
              </div>
              {/* 전세대출 */}
              <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full shadow-sm">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <Percent className="w-3 h-3" />
                  <span>전세대출</span>
                </div>
                <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{rates?.jeonseRate.toFixed(2)}%</span>
                  {jeonseChange && jeonseChange.direction !== 'same' && (
                    <div className={`flex items-center gap-0.5 ${jeonseChange.direction === 'up' ? 'text-red-600' : 'text-blue-600'}`}>
                      {jeonseChange.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center gap-1.5 mt-1.5">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${mobileSlide === 0 ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${mobileSlide === 1 ? 'bg-gray-600' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
