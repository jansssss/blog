'use client'

import { useState } from 'react'
import { Calculator, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface ScenarioResult {
  scenario: string
  rate: number
  monthlyPayment: number
  totalInterest: number
  icon: React.ReactNode
  color: string
}

export default function RateChangeImpactCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [loanPeriod, setLoanPeriod] = useState<string>('')
  const [repaymentMethod, setRepaymentMethod] = useState<string>('equal-principal-interest')
  const [results, setResults] = useState<ScenarioResult[] | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const parseNumber = (str: string): number => {
    return parseFloat(str.replace(/,/g, '')) || 0
  }

  const calculateMonthlyPayment = (
    principal: number,
    annualRate: number,
    months: number,
    method: string
  ): { monthly: number; totalInterest: number } => {
    const monthlyRate = annualRate / 12 / 100

    if (method === 'equal-principal-interest') {
      // 원리금균등상환
      if (monthlyRate === 0) {
        const monthly = principal / months
        return { monthly, totalInterest: 0 }
      }
      const monthly =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
      const totalInterest = monthly * months - principal
      return { monthly, totalInterest }
    } else {
      // 원금균등상환 (첫 달 기준)
      const principalPayment = principal / months
      const firstMonthInterest = principal * monthlyRate
      const monthly = principalPayment + firstMonthInterest
      const totalInterest = (principal * monthlyRate * (months + 1)) / 2
      return { monthly, totalInterest }
    }
  }

  const handleCalculate = () => {
    const amount = parseNumber(loanAmount)
    const rate = parseFloat(interestRate)
    const period = parseFloat(loanPeriod)

    // 유효성 검증
    if (amount <= 0) {
      alert('대출 금액을 올바르게 입력해주세요.')
      return
    }
    if (rate <= 0 || rate > 100) {
      alert('금리를 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }
    if (period <= 0 || period > 600) {
      alert('대출 기간을 올바르게 입력해주세요. (1 ~ 600개월 사이)')
      return
    }

    // 3가지 시나리오 계산
    const baseScenario = calculateMonthlyPayment(amount, rate, period, repaymentMethod)
    const upScenario = calculateMonthlyPayment(amount, rate + 1, period, repaymentMethod)
    const downScenario = calculateMonthlyPayment(amount, rate - 1, period, repaymentMethod)

    const scenarioResults: ScenarioResult[] = [
      {
        scenario: '기준',
        rate: rate,
        monthlyPayment: baseScenario.monthly,
        totalInterest: baseScenario.totalInterest,
        icon: <div className="w-3 h-3 bg-blue-500 rounded-full" />,
        color: 'text-blue-600'
      },
      {
        scenario: '금리 +1%p',
        rate: rate + 1,
        monthlyPayment: upScenario.monthly,
        totalInterest: upScenario.totalInterest,
        icon: <TrendingUp className="w-4 h-4 text-red-500" />,
        color: 'text-red-600'
      },
      {
        scenario: '금리 -1%p',
        rate: rate - 1,
        monthlyPayment: downScenario.monthly,
        totalInterest: downScenario.totalInterest,
        icon: <TrendingDown className="w-4 h-4 text-green-500" />,
        color: 'text-green-600'
      }
    ]

    setResults(scenarioResults)
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
              <h1 className="text-3xl font-bold">금리 변동 영향 계산기</h1>
              <p className="text-muted-foreground mt-1">
                금리 변동 시 상환액과 이자 변화를 비교하세요
              </p>
            </div>
          </div>
        </div>

        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>정보 입력</CardTitle>
            <CardDescription>
              대출 조건을 입력하면 3가지 시나리오로 비교해드립니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 대출 금액 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">대출 금액</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 300,000,000"
                  value={loanAmount}
                  onChange={(e) => handleNumberInput(e.target.value, setLoanAmount)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            {/* 금리 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">현재 금리 (연)</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="예: 4.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* 대출 기간 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">대출 기간</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="예: 360"
                  value={loanPeriod}
                  onChange={(e) => setLoanPeriod(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  개월
                </span>
              </div>
            </div>

            {/* 상환 방식 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">상환 방식</label>
              <Select value={repaymentMethod} onValueChange={setRepaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal-principal-interest">원리금균등상환</SelectItem>
                  <SelectItem value="equal-principal">원금균등상환</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {repaymentMethod === 'equal-principal-interest'
                  ? '매월 동일한 금액 납부'
                  : '매월 원금은 동일, 이자는 점차 감소'}
              </p>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              계산하기
            </Button>
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        {results && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>시나리오 비교</CardTitle>
                <CardDescription>
                  금리 변동 시 상환액과 총 이자를 비교합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border-2 ${
                        result.scenario === '기준'
                          ? 'bg-blue-50 border-blue-200'
                          : result.scenario === '금리 +1%p'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        {result.icon}
                        <span className={`font-semibold ${result.color}`}>
                          {result.scenario}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">금리</div>
                          <div className={`text-lg font-bold ${result.color}`}>
                            {result.rate.toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {repaymentMethod === 'equal-principal-interest'
                              ? '월 상환액'
                              : '첫 달 상환액'}
                          </div>
                          <div className="text-xl font-bold">
                            {formatNumber(result.monthlyPayment)}원
                          </div>
                          {index > 0 && (
                            <div className={`text-sm mt-1 ${result.color}`}>
                              {result.monthlyPayment > results[0].monthlyPayment
                                ? `+${formatNumber(
                                    result.monthlyPayment - results[0].monthlyPayment
                                  )}원`
                                : `${formatNumber(
                                    result.monthlyPayment - results[0].monthlyPayment
                                  )}원`}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">총 이자</div>
                          <div className="text-lg font-semibold">
                            {formatNumber(result.totalInterest)}원
                          </div>
                          {index > 0 && (
                            <div className={`text-xs mt-1 ${result.color}`}>
                              {result.totalInterest > results[0].totalInterest
                                ? `+${formatNumber(
                                    result.totalInterest - results[0].totalInterest
                                  )}원`
                                : `${formatNumber(
                                    result.totalInterest - results[0].totalInterest
                                  )}원`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                      금리는 예측할 수 없지만,<br />
                      변동 시 부담 변화는 미리 계산해볼 수 있습니다.
                    </p>
                    <p className="text-blue-700">
                      본 계산은 참고용입니다.
                    </p>
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
