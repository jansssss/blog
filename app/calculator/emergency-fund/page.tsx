'use client'

import { useState } from 'react'
import { Calculator, AlertCircle, DollarSign, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface CalculationResult {
  threeMonths: number
  sixMonths: number
}

export default function EmergencyFundCalculatorPage() {
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const parseNumber = (str: string): number => {
    return parseFloat(str.replace(/,/g, '')) || 0
  }

  const handleCalculate = () => {
    const expenses = parseNumber(monthlyExpenses)

    // 유효성 검증
    if (expenses <= 0) {
      alert('월 생활비를 올바르게 입력해주세요.')
      return
    }
    if (expenses > 50000000) {
      alert('월 생활비를 다시 확인해주세요.')
      return
    }

    // 계산
    const threeMonths = expenses * 3
    const sixMonths = expenses * 6

    setResult({
      threeMonths,
      sixMonths
    })
  }

  const handleNumberInput = (value: string, setter: (v: string) => void) => {
    const numericValue = value.replace(/[^\d]/g, '')
    if (numericValue) {
      setter(formatNumber(parseInt(numericValue)))
    } else {
      setter('')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">비상자금 필요 금액 계산기</h1>
              <p className="text-muted-foreground mt-1">
                3개월 / 6개월 권장 비상자금을 확인하세요
              </p>
            </div>
          </div>
        </div>

        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>정보 입력</CardTitle>
            <CardDescription>
              현재 월 평균 생활비를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 월 생활비 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">월 생활비</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 3,000,000"
                  value={monthlyExpenses}
                  onChange={(e) => handleNumberInput(e.target.value, setMonthlyExpenses)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                주거비, 식비, 통신비, 보험료 등 고정 지출 포함
              </p>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              계산하기
            </Button>
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  권장 비상자금
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 3개월치 */}
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      3개월치 비상자금
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatNumber(result.threeMonths)}원
                    </div>
                    <div className="text-sm text-blue-700 mt-2">
                      최소 권장 금액
                    </div>
                  </div>

                  {/* 6개월치 */}
                  <div className="p-6 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      6개월치 비상자금
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatNumber(result.sixMonths)}원
                    </div>
                    <div className="text-sm text-green-700 mt-2">
                      안정적 권장 금액
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 설명 카드 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-semibold">참고 정보</p>
                    <p>
                      재무 전문가들은<br />
                      최소 3~6개월치 생활비를<br />
                      비상자금으로 권장합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 추가 고려사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  비상자금 관리 고려사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-semibold mb-2">적정 규모</div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 3개월: 최소 권장</li>
                      <li>• 6개월: 안정적 권장</li>
                      <li>• 자영업자: 6개월 이상</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-600 font-semibold mb-2">보관 방법</div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• 즉시 인출 가능한 계좌</li>
                      <li>• 예금자 보호 상품</li>
                      <li>• 생활비 계좌와 분리</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 면책 고지 */}
        <DisclaimerNotice />
      </div>
    </div>
  )
}
