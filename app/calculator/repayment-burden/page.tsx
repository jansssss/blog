'use client'

import { useState } from 'react'
import { Calculator, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface CalculationResult {
  repaymentRatio: number
  availableIncome: number
  status: 'stable' | 'caution' | 'burden'
  statusText: string
  statusColor: string
}

export default function RepaymentBurdenCalculatorPage() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('')
  const [fixedExpenses, setFixedExpenses] = useState<string>('')
  const [monthlyRepayment, setMonthlyRepayment] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const parseNumber = (str: string): number => {
    return parseFloat(str.replace(/,/g, '')) || 0
  }

  const handleCalculate = () => {
    const income = parseNumber(monthlyIncome)
    const expenses = parseNumber(fixedExpenses)
    const repayment = parseNumber(monthlyRepayment)

    // 유효성 검증
    if (income <= 0) {
      alert('월 소득을 올바르게 입력해주세요.')
      return
    }
    if (expenses < 0) {
      alert('월 고정지출을 올바르게 입력해주세요.')
      return
    }
    if (repayment <= 0) {
      alert('월 대출 상환액을 올바르게 입력해주세요.')
      return
    }
    if (expenses + repayment > income) {
      alert('고정지출과 상환액의 합이 소득을 초과했습니다.')
      return
    }

    // 계산
    const repaymentRatio = (repayment / income) * 100
    const availableIncome = income - expenses - repayment

    let status: 'stable' | 'caution' | 'burden'
    let statusText: string
    let statusColor: string

    if (repaymentRatio < 30) {
      status = 'stable'
      statusText = '안정'
      statusColor = 'text-green-600'
    } else if (repaymentRatio < 40) {
      status = 'caution'
      statusText = '주의'
      statusColor = 'text-yellow-600'
    } else {
      status = 'burden'
      statusText = '과부담'
      statusColor = 'text-red-600'
    }

    setResult({
      repaymentRatio,
      availableIncome,
      status,
      statusText,
      statusColor
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
              <h1 className="text-3xl font-bold">월 상환 부담 체감 계산기</h1>
              <p className="text-muted-foreground mt-1">
                소득 대비 대출 상환액 비중을 확인하세요
              </p>
            </div>
          </div>
        </div>

        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>정보 입력</CardTitle>
            <CardDescription>
              월 소득, 고정지출, 대출 상환액을 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 월 소득 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">월 소득 (세후)</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 3,000,000"
                  value={monthlyIncome}
                  onChange={(e) => handleNumberInput(e.target.value, setMonthlyIncome)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            {/* 월 고정지출 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                월 고정지출 (월세, 관리비, 통신비 등)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 1,000,000"
                  value={fixedExpenses}
                  onChange={(e) => handleNumberInput(e.target.value, setFixedExpenses)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            {/* 월 대출 상환액 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">월 대출 상환액</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 800,000"
                  value={monthlyRepayment}
                  onChange={(e) => handleNumberInput(e.target.value, setMonthlyRepayment)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              계산하기
            </Button>
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        {result && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                계산 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 상환 비중 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    소득 대비 상환액 비중
                  </span>
                  <div className="text-right">
                    <span className={`text-3xl font-bold ${result.statusColor}`}>
                      {result.repaymentRatio.toFixed(1)}%
                    </span>
                    <div className={`text-sm font-semibold ${result.statusColor}`}>
                      {result.statusText}
                    </div>
                  </div>
                </div>

                {/* 진행 바 */}
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      result.status === 'stable'
                        ? 'bg-green-500'
                        : result.status === 'caution'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(result.repaymentRatio, 100)}%` }}
                  />
                  {/* 30% 기준선 */}
                  <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-gray-400" />
                  {/* 40% 기준선 */}
                  <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-gray-600" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>30%</span>
                  <span>40%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 가용 소득 */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    고정지출·상환 후 가용 소득
                  </span>
                  <span className="text-2xl font-bold">
                    {formatNumber(result.availableIncome)}원
                  </span>
                </div>
              </div>

              {/* 설명 */}
              <div className="p-6 bg-blue-50 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-semibold">참고 정보</p>
                    <p>
                      고정 상환액이 소득의 30~40%를 넘을 경우<br />
                      생활비 부담이 커질 수 있습니다.
                    </p>
                    <p className="text-blue-700">
                      본 계산은 참고용입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 기준 설명 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold mb-1">안정 (30% 미만)</div>
                  <p className="text-sm text-green-700">
                    여유 있는 가계 운영이 가능한 수준
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-semibold mb-1">주의 (30~40%)</div>
                  <p className="text-sm text-yellow-700">
                    관리가 필요한 수준
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-red-600 font-semibold mb-1">과부담 (40% 이상)</div>
                  <p className="text-sm text-red-700">
                    생활비 부담이 큰 수준
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 면책 고지 */}
        <DisclaimerNotice />
      </div>
    </div>
  )
}
