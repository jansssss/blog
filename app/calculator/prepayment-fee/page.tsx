'use client'

import { useState } from 'react'
import { RotateCcw, DollarSign, TrendingDown, Calculator } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface CalculationResult {
  prepaymentFee: number
  actualRepayment: number
  savings: number
  remainingBalance: number
}

export default function PrepaymentFeeCalculatorPage() {
  const [loanBalance, setLoanBalance] = useState<string>('')
  const [prepaymentAmount, setPrepaymentAmount] = useState<string>('')
  const [feeRate, setFeeRate] = useState<string>('')
  const [remainingMonths, setRemainingMonths] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const handleCalculate = () => {
    const balance = parseFloat(loanBalance.replace(/,/g, ''))
    const prepayment = parseFloat(prepaymentAmount.replace(/,/g, ''))
    const rate = parseFloat(feeRate)
    const months = parseFloat(remainingMonths)
    const interest = parseFloat(interestRate)

    // 유효성 검증
    if (!balance || balance <= 0) {
      alert('대출 잔액을 올바르게 입력해주세요.')
      return
    }
    if (!prepayment || prepayment <= 0) {
      alert('조기상환 금액을 올바르게 입력해주세요.')
      return
    }
    if (prepayment > balance) {
      alert('조기상환 금액은 대출 잔액보다 클 수 없습니다.')
      return
    }
    if (!rate || rate < 0 || rate > 10) {
      alert('수수료율을 올바르게 입력해주세요. (0 ~ 10% 사이)')
      return
    }
    if (!months || months <= 0) {
      alert('잔여 기간을 올바르게 입력해주세요.')
      return
    }
    if (!interest || interest <= 0 || interest > 100) {
      alert('연 금리를 올바르게 입력해주세요.')
      return
    }

    // 계산
    const prepaymentFee = prepayment * (rate / 100)
    const actualRepayment = prepayment + prepaymentFee

    // 이자 절감액 계산 (단순 이자 기준)
    const monthlyInterest = (balance * (interest / 12 / 100))
    const totalInterestWithoutPrepayment = monthlyInterest * months
    const remainingBalanceAfterPrepayment = balance - prepayment
    const monthlyInterestAfterPrepayment = (remainingBalanceAfterPrepayment * (interest / 12 / 100))
    const totalInterestWithPrepayment = monthlyInterestAfterPrepayment * months
    const interestSavings = totalInterestWithoutPrepayment - totalInterestWithPrepayment
    const netSavings = interestSavings - prepaymentFee

    setResult({
      prepaymentFee,
      actualRepayment,
      savings: netSavings,
      remainingBalance: balance - prepayment
    })
  }

  const handleReset = () => {
    setLoanBalance('')
    setPrepaymentAmount('')
    setFeeRate('')
    setRemainingMonths('')
    setInterestRate('')
    setResult(null)
  }

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const numValue = value.replace(/[^0-9]/g, '')
    if (numValue) {
      setter(formatNumber(parseFloat(numValue)))
    } else {
      setter('')
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <RotateCcw className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          중도상환수수료 계산
        </h1>
        <p className="text-gray-600 text-lg">
          조기 상환 시 발생하는 수수료와 실제 절감액을 계산해보세요
        </p>
      </div>

      {/* 입력 카드 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>대출 정보 입력</CardTitle>
          <CardDescription>
            현재 대출 정보와 상환 계획을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 대출 잔액 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              현재 대출 잔액 (원)
            </label>
            <Input
              type="text"
              placeholder="예: 50,000,000"
              value={loanBalance}
              onChange={(e) => handleNumberInput(e.target.value, setLoanBalance)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              현재 남아있는 대출 원금을 입력하세요
            </p>
          </div>

          {/* 조기상환 금액 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              조기상환 금액 (원)
            </label>
            <Input
              type="text"
              placeholder="예: 10,000,000"
              value={prepaymentAmount}
              onChange={(e) => handleNumberInput(e.target.value, setPrepaymentAmount)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              미리 갚으려는 금액을 입력하세요
            </p>
          </div>

          {/* 수수료율 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              중도상환수수료율 (%)
            </label>
            <Input
              type="number"
              placeholder="예: 1.5"
              value={feeRate}
              onChange={(e) => setFeeRate(e.target.value)}
              step="0.1"
              min="0"
              max="10"
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              대출 계약서에 명시된 수수료율을 입력하세요 (일반적으로 0.5~2%)
            </p>
          </div>

          {/* 연 금리 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              현재 연 금리 (%)
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
              현재 적용 중인 연 금리를 입력하세요
            </p>
          </div>

          {/* 잔여 기간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              잔여 상환 기간 (개월)
            </label>
            <Input
              type="number"
              placeholder="예: 120"
              value={remainingMonths}
              onChange={(e) => setRemainingMonths(e.target.value)}
              min="1"
              max="600"
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              남은 상환 기간을 개월 단위로 입력하세요
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
              중도상환 시 발생하는 비용과 예상 절감액입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 중도상환수수료 */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">중도상환수수료</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatNumber(result.prepaymentFee)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 실제 상환 금액 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">실제 상환 금액 (상환금 + 수수료)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(result.actualRepayment)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 이자 절감액 */}
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                result.savings > 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    result.savings > 0 ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <TrendingDown className={`w-5 h-5 ${
                      result.savings > 0 ? 'text-green-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      순 절감액 (이자 절감 - 수수료)
                    </p>
                    <p className={`text-2xl font-bold ${
                      result.savings > 0 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {result.savings > 0 ? '+' : ''}{formatNumber(result.savings)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 상환 후 잔액 */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">상환 후 남은 대출 잔액</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(result.remainingBalance)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 분석 결과 */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">📊 분석</p>
                {result.savings > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>✅ 중도상환 권장:</strong> 수수료를 내더라도 이자 절감액이 더 크므로,
                      조기 상환이 유리합니다.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ 신중한 검토 필요:</strong> 중도상환수수료가 이자 절감액보다 크므로,
                      수수료 면제 기간을 기다리거나 다른 방법을 고려해보세요.
                    </p>
                  </div>
                )}
              </div>

              {/* 상세 정보 */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">📌 계산 상세</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 대출 잔액: {formatNumber(parseFloat(loanBalance.replace(/,/g, '')))}원</li>
                  <li>• 조기상환 금액: {formatNumber(parseFloat(prepaymentAmount.replace(/,/g, '')))}원</li>
                  <li>• 수수료율: {feeRate}%</li>
                  <li>• 연 금리: {interestRate}%</li>
                  <li>• 잔여 기간: {remainingMonths}개월</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 면책 문구 */}
      <DisclaimerNotice message="본 계산 결과는 단순 이자 기준 예상치이며, 실제 중도상환수수료는 대출 종류, 금융기관, 계약 조건에 따라 다를 수 있습니다. 정확한 수수료는 반드시 대출 계약서를 확인하거나 금융기관에 문의하세요." />

      {/* 추가 안내 */}
      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 중도상환 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>수수료 면제 기간:</strong> 많은 대출 상품이 3년 또는 5년 후 수수료 면제를 제공합니다.</li>
            <li>• <strong>일부 상환 vs 전액 상환:</strong> 수수료율이 다를 수 있으니 확인하세요.</li>
            <li>• <strong>변동금리 대출:</strong> 금리 인상이 예상되면 조기 상환이 더 유리할 수 있습니다.</li>
            <li>• <strong>세제 혜택:</strong> 주택담보대출의 경우 이자 소득공제를 받고 있다면 고려하세요.</li>
            <li>• <strong>유동성 확보:</strong> 비상자금을 충분히 남기고 상환 계획을 세우세요.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
