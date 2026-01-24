'use client'

import { useState, useRef, useEffect } from 'react'
import { Car, Check, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import Link from 'next/link'

// 할인 항목 정의
const DISCOUNT_ITEMS = [
  {
    id: 'mileage',
    category: '주행',
    label: '마일리지 특약',
    description: '연간 주행거리 1만km 이하',
    discount: '최대 15%',
    priority: 1,
    tip: '보험사 앱에서 마일리지 특약 신청 가능',
    documents: ['운전습관 앱 설치', '주행거리 측정장치']
  },
  {
    id: 'blackbox',
    category: '장치',
    label: '블랙박스 장착',
    description: '2채널 이상 블랙박스 장착',
    discount: '최대 5%',
    priority: 2,
    tip: '2채널(전후방) 블랙박스 장착 증빙 필요',
    documents: ['블랙박스 구매영수증', '장착 사진']
  },
  {
    id: 'safety_device',
    category: '장치',
    label: '안전장치 할인',
    description: 'ABS, 에어백, 차선이탈경고 등',
    discount: '최대 10%',
    priority: 3,
    tip: '차량 출고 시 기본 장착된 경우 자동 적용',
    documents: ['차량등록증', '사양표']
  },
  {
    id: 'child',
    category: '가족',
    label: '자녀 할인',
    description: '만 6세 이하 자녀 동반',
    discount: '최대 5%',
    priority: 4,
    tip: '가족관계증명서 또는 주민등록등본 필요',
    documents: ['가족관계증명서']
  },
  {
    id: 'multi_car',
    category: '가족',
    label: '다자녀 또는 다자동차',
    description: '2대 이상 또는 3자녀 이상',
    discount: '최대 7%',
    priority: 5,
    tip: '동일 보험사에서 2대 이상 가입 시 적용',
    documents: ['차량등록증', '가족관계증명서']
  },
  {
    id: 'public_transport',
    category: '주행',
    label: '대중교통 이용 할인',
    description: '대중교통 정기권 이용자',
    discount: '최대 5%',
    priority: 6,
    tip: '교통카드 또는 정기권 사용 내역 필요',
    documents: ['대중교통 이용내역']
  },
  {
    id: 'driver_limit',
    category: '운전자',
    label: '운전자 범위 한정',
    description: '1인 또는 부부 한정',
    discount: '최대 15%',
    priority: 1,
    tip: '운전자를 본인만 또는 부부만으로 제한',
    documents: ['운전면허증', '주민등록등본']
  },
  {
    id: 'age_limit',
    category: '운전자',
    label: '운전자 연령 한정',
    description: '26세/30세 이상 한정',
    discount: '최대 12%',
    priority: 2,
    tip: '가족 중 젊은 운전자가 없는 경우 적용 가능',
    documents: ['운전면허증']
  },
  {
    id: 'no_accident',
    category: '운전',
    label: '무사고 경력',
    description: '최근 3년간 사고 이력 없음',
    discount: '최대 30%',
    priority: 1,
    tip: '보험개발원에서 경력 조회 가능',
    documents: ['보험가입경력 확인서']
  },
  {
    id: 'eco_car',
    category: '차량',
    label: '친환경차 할인',
    description: '전기차, 하이브리드 차량',
    discount: '최대 10%',
    priority: 3,
    tip: '차량등록증에 차종 명시',
    documents: ['차량등록증']
  },
  {
    id: 'low_mileage',
    category: '주행',
    label: '저주행 거리 할인',
    description: '연간 5,000km 이하 주행',
    discount: '최대 10%',
    priority: 2,
    tip: '보험 갱신 시 주행거리 인증 필요',
    documents: ['계기판 사진', '정비이력']
  },
  {
    id: 'online',
    category: '가입',
    label: '온라인/다이렉트 가입',
    description: '온라인 직접 가입',
    discount: '최대 15%',
    priority: 1,
    tip: '설계사 없이 직접 가입 시 적용',
    documents: []
  }
]

interface CheckResult {
  applied: typeof DISCOUNT_ITEMS
  notApplied: typeof DISCOUNT_ITEMS
  topPriority: typeof DISCOUNT_ITEMS
  estimatedSavings: string
}

export default function AutoDiscountCheckPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [result, setResult] = useState<CheckResult | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const handleCheck = (id: string) => {
    setCheckedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleAnalyze = () => {
    const applied = DISCOUNT_ITEMS.filter(item => checkedItems.includes(item.id))
    const notApplied = DISCOUNT_ITEMS.filter(item => !checkedItems.includes(item.id))
    const topPriority = notApplied
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)

    // 추정 절약 가능 금액 (연간 평균 보험료 80만원 기준)
    const totalDiscountPercent = applied.reduce((sum, item) => {
      const match = item.discount.match(/(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
    const estimatedSavings = Math.min(totalDiscountPercent, 50) // 최대 50% 캡
    const savingsAmount = Math.round(800000 * (estimatedSavings / 100))

    setResult({
      applied,
      notApplied,
      topPriority,
      estimatedSavings: `약 ${savingsAmount.toLocaleString()}원 (${estimatedSavings}%)`
    })
  }

  const handleReset = () => {
    setCheckedItems([])
    setResult(null)
  }

  // 카테고리별 그룹화
  const categories = Array.from(new Set(DISCOUNT_ITEMS.map(item => item.category)))

  return (
    <div className="container py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Car className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          자동차보험 할인 진단
        </h1>
        <p className="text-gray-600">
          적용 가능한 할인을 점검하고 누락된 할인을 확인하세요
        </p>
      </div>

      {/* 입력 카드 */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">현재 적용 중인 할인 항목을 선택하세요</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {DISCOUNT_ITEMS.filter(item => item.category === category).map(item => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      checkedItems.includes(item.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.includes(item.id)}
                      onChange={() => handleCheck(item.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{item.label}</span>
                        <span className="text-xs text-primary font-medium shrink-0">
                          {item.discount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t mt-6">
            <Button onClick={handleAnalyze} className="flex-1" size="lg">
              <Car className="w-4 h-4 mr-2" />
              진단하기
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결과 */}
      {result && (
        <div ref={resultRef}>
          <Card className="mb-6 border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-primary">진단 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 요약 KPI */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{result.applied.length}개</p>
                  <p className="text-xs text-green-600 mt-1">적용 중인 할인</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">{result.notApplied.length}개</p>
                  <p className="text-xs text-amber-600 mt-1">미적용 할인</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg text-center col-span-2 sm:col-span-1">
                  <p className="text-lg font-bold text-primary">{result.estimatedSavings}</p>
                  <p className="text-xs text-gray-600 mt-1">추정 절약액 (연간)</p>
                </div>
              </div>

              {/* 우선 확인 TOP 3 */}
              {result.topPriority.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    우선 확인 TOP {result.topPriority.length}
                  </h3>
                  <div className="space-y-3">
                    {result.topPriority.map((item, idx) => (
                      <div key={item.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-sm text-amber-700 font-medium">{item.discount}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.tip}</p>
                            {item.documents.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.documents.map(doc => (
                                  <span key={doc} className="text-xs bg-white px-2 py-0.5 rounded border">
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 적용 중인 할인 */}
              {result.applied.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    적용 중인 할인 ({result.applied.length}개)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.applied.map(item => (
                      <span key={item.id} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 해석 */}
          <div className="bg-gray-50 rounded-lg p-4 border mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">참고 사항</p>
            <ul className="space-y-1.5">
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">·</span>
                <span>할인율은 보험사마다 다르며, 실제 적용 여부는 보험사 확인이 필요합니다.</span>
              </li>
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">·</span>
                <span>일부 할인은 중복 적용되지 않거나 한도가 있을 수 있습니다.</span>
              </li>
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">·</span>
                <span>보험 갱신 시 누락된 할인을 확인하고 적용 요청하세요.</span>
              </li>
            </ul>
          </div>

          {/* 면책 */}
          <DisclaimerNotice message="본 진단 결과는 참고용이며, 실제 할인 적용 여부와 할인율은 보험사 및 개인 조건에 따라 상이할 수 있습니다. 정확한 정보는 보험사에 직접 문의하시기 바랍니다." />

          {/* 관련 도구 */}
          <div className="bg-gray-50 rounded-lg p-4 border mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">관련 점검 도구</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/tools/health-overlap-check"
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 group-hover:text-primary">실손/건강 중복 점검</p>
                  <p className="text-xs text-gray-500 mt-0.5">중복 보장 확인</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              </Link>
              <Link
                href="/tools/insurance-remodel"
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 group-hover:text-primary">보험 리모델링 체크</p>
                  <p className="text-xs text-gray-500 mt-0.5">보장 최적화</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 결과 없을 때 관련 도구 표시 */}
      {!result && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <p className="text-sm font-medium text-gray-700 mb-3">다른 점검 도구</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/tools/health-overlap-check"
              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <div>
                <p className="font-medium text-sm text-gray-900 group-hover:text-primary">실손/건강 중복 점검</p>
                <p className="text-xs text-gray-500 mt-0.5">중복 보장 확인</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
            </Link>
            <Link
              href="/tools/insurance-remodel"
              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <div>
                <p className="font-medium text-sm text-gray-900 group-hover:text-primary">보험 리모델링 체크</p>
                <p className="text-xs text-gray-500 mt-0.5">보장 최적화</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
