'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface CalculationResult {
  monthlyInterest: number
  totalInterest: number
  totalRepayment: number
}

export default function LoanInterestCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [loanPeriod, setLoanPeriod] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const handleCalculate = () => {
    const amount = parseFloat(loanAmount.replace(/,/g, ''))
    const rate = parseFloat(interestRate)
    const period = parseFloat(loanPeriod)

    // 유효성 검증
    if (!amount || amount <= 0) {
      alert('대출 금액을 올바르게 입력해주세요.')
      return
    }
    if (!rate || rate <= 0 || rate > 100) {
      alert('금리를 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }
    if (!period || period <= 0 || period > 600) {
      alert('대출 기간을 올바르게 입력해주세요. (1 ~ 600개월 사이)')
      return
    }

    // 계산
    const monthlyRate = rate / 12 / 100
    const monthlyInterest = amount * monthlyRate
    const totalInterest = monthlyInterest * period
    const totalRepayment = amount + totalInterest

    setResult({
      monthlyInterest,
      totalInterest,
      totalRepayment
    })
  }

  const handleReset = () => {
    setLoanAmount('')
    setInterestRate('')
    setLoanPeriod('')
    setResult(null)
  }

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value) {
      setLoanAmount(formatNumber(parseFloat(value)))
    } else {
      setLoanAmount('')
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Calculator className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          대출 이자 계산기
        </h1>
        <p className="text-gray-600 text-lg">
          대출 금액과 금리를 입력하여 예상 이자를 계산해보세요
        </p>
      </div>

      {/* 입력 카드 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>대출 정보 입력</CardTitle>
          <CardDescription>
            아래 항목을 입력하시면 단순 이자 기준으로 계산됩니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 대출 금액 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              대출 금액 (원)
            </label>
            <Input
              type="text"
              placeholder="예: 100,000,000"
              value={loanAmount}
              onChange={handleLoanAmountChange}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              쉼표 없이 숫자만 입력하세요 (예: 1억원 = 100000000)
            </p>
          </div>

          {/* 연 금리 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              연 금리 (%)
            </label>
            <Input
              type="number"
              placeholder="예: 4.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              step="0.01"
              min="0"
              max="100"
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              연 단위 금리를 입력하세요 (예: 4.5%)
            </p>
          </div>

          {/* 대출 기간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              대출 기간 (개월)
            </label>
            <Input
              type="number"
              placeholder="예: 240"
              value={loanPeriod}
              onChange={(e) => setLoanPeriod(e.target.value)}
              min="1"
              max="600"
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              개월 단위로 입력하세요 (예: 20년 = 240개월)
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCalculate}
              className="flex-1"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              계산하기
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
            >
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결과 카드 */}
      {result && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="text-primary">계산 결과</CardTitle>
            <CardDescription>
              입력하신 조건으로 계산한 예상 이자 금액입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 월 이자 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">월 이자</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(result.monthlyInterest)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 총 이자 */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 이자</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(result.totalInterest)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 총 상환액 */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 상환액 (원금 + 이자)</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatNumber(result.totalRepayment)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">📌 계산 상세</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 대출 금액: {formatNumber(parseFloat(loanAmount.replace(/,/g, '')))}원</li>
                  <li>• 연 금리: {interestRate}%</li>
                  <li>• 대출 기간: {loanPeriod}개월</li>
                  <li>• 계산 방식: 단순 이자 (원금 × 금리 × 기간)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 면책 문구 */}
      <DisclaimerNotice />

      {/* 추가 안내 */}
      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 참고사항</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 본 계산기는 <strong>단순 이자</strong> 기준으로 계산됩니다.</li>
            <li>• 실제 대출 상환 방식(원리금균등, 원금균등)과는 다를 수 있습니다.</li>
            <li>• 중도상환, 거치기간 등의 조건은 반영되지 않습니다.</li>
            <li>• 정확한 상환 계획은 금융기관에서 제공하는 상환 스케줄을 확인하세요.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
