'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'

// 기본 스타일 (밝은 파스텔 테마)
const DEFAULT_GRADIENT = 'from-purple-50 via-pink-50 to-blue-50'
const DEFAULT_BORDER = 'border-gray-200'

interface InfoWidgetProps {
  gradient?: string
  borderColor?: string
}

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

export default function InfoWidget({
  gradient = DEFAULT_GRADIENT,
  borderColor = DEFAULT_BORDER
}: InfoWidgetProps) {
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
    // 초기 데이터 로드
    const loadInitialData = async () => {
      // localStorage에서 저장된 도시 불러오기
      const savedCity = localStorage.getItem('selectedCity')
      let cityToUse = selectedCity

      if (savedCity) {
        const city = CITIES.find(c => c.name === savedCity)
        if (city) {
          cityToUse = city
          setSelectedCity(city)
        }
      }

      // 모바일에서 위치 정보 시도
      if (isMobile && 'geolocation' in navigator && !savedCity) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
          },
          () => {
            fetchWeather(cityToUse)
          }
        )
      } else {
        fetchWeather(cityToUse)
      }

      fetchStock()
    }

    loadInitialData()

    // 5분마다 갱신 (코스피는 장 시간에만)
    const interval = setInterval(() => {
      fetchWeather(selectedCity)

      // 코스피 장 시간 체크 (평일 09:00 ~ 16:00 KST)
      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay() // 0=일요일, 6=토요일
      const isWeekday = day >= 1 && day <= 5
      const isMarketHours = hour >= 9 && hour < 16

      if (isWeekday && isMarketHours) {
        fetchStock()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`
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

  const fetchWeather = async (city: typeof CITIES[0]) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
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

  const fetchStock = async () => {
    try {
      // 서버사이드 API 사용 (CORS 문제 해결)
      const response = await fetch('/api/stock/kospi')
      const result = await response.json()

      console.log('Stock API Response:', result)

      if (result.success && result.data) {
        setStock({
          value: result.data.value,
          change: result.data.change,
          changePercent: result.data.changePercent
        })
        console.log('Stock data set:', result.data)
      } else {
        console.error('Stock API returned unsuccessful response:', result)
      }

      setLoading(false)
    } catch (error) {
      console.error('Stock fetch error:', error)
      setLoading(false)
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
      <div className={`w-full bg-gradient-to-r ${gradient} py-3`}>
        <div className="container">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full bg-gradient-to-r ${gradient} border-b ${borderColor}`}>
      <div className="container py-2 px-3">
        <div className="flex items-center justify-between gap-2">
          {/* 날씨 정보 */}
          <div className="relative flex items-center gap-2 backdrop-blur-sm bg-white/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <button
              onClick={() => setShowCitySelector(!showCitySelector)}
              className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <MapPin className="w-3 h-3" />
              <span>{selectedCity.name}</span>
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showCitySelector ? 'rotate-180' : ''}`} />
            </button>

            <div className="h-3 w-px bg-gray-300 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-xl">{weather?.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">
                  {weather?.temp}°C
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  습도 {weather?.humidity}%
                </span>
              </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {showCitySelector && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[100] min-w-[120px]">
                {CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCityChange(city)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      city.name === selectedCity.name ? 'bg-gray-100 font-medium text-primary' : 'text-gray-700'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 코스피 정보 */}
          <div className="flex items-center gap-2 backdrop-blur-sm bg-white/60 px-3 py-1.5 rounded-full shadow-sm flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              코스피
            </span>

            <div className="h-3 w-px bg-gray-300" />

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">
                {stock?.value.toLocaleString()}
              </span>
              {stock && stock.change > 0 ? (
                <div className="flex items-center gap-0.5 text-red-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    +{stock.changePercent}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-blue-600">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-medium">
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
