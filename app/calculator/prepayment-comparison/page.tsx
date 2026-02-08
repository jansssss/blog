'use client'

import { useState } from 'react'
import { Calculator, AlertCircle, DollarSign, Percent } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface CalculationResult {
  remainingInterest: number
  interestSaved: number
  prepaymentFee: number
  netBenefit: number
}

export default function PrepaymentComparisonCalculatorPage() {
  const [remainingBalance, setRemainingBalance] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [remainingMonths, setRemainingMonths] = useState<string>('')
  const [feeRate, setFeeRate] = useState<string>('')
  const [prepaymentAmount, setPrepaymentAmount] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const parseNumber = (str: string): number => {
    return parseFloat(str.replace(/,/g, '')) || 0
  }

  const handleCalculate = () => {
    const balance = parseNumber(remainingBalance)
    const rate = parseFloat(interestRate)
    const months = parseFloat(remainingMonths)
    const fee = parseFloat(feeRate)
    const prepayment = parseNumber(prepaymentAmount)

    // 유효성 검증
    if (balance <= 0) {
      alert('남은 잔액을 올바르게 입력해주세요.')
      return
    }
    if (rate <= 0 || rate > 100) {
      alert('금리를 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }
    if (months <= 0 || months > 600) {
      alert('남은 기간을 올바르게 입력해주세요. (1 ~ 600개월 사이)')
      return
    }
    if (fee < 0 || fee > 100) {
      alert('수수료율을 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }
    if (prepayment <= 0 || prepayment > balance) {
      alert('상환 예정 금액을 올바르게 입력해주세요. (잔액 이하)')
      return
    }

    // 계산
    // 단순 이자 계산 (원금 기준)
    const monthlyRate = rate / 12 / 100

    // 유지 시 총 이자
    const remainingInterest = balance * monthlyRate * months

    // 중도상환 시 절감되는 이자
    const interestSaved = prepayment * monthlyRate * months

    // 중도상환 수수료
    const prepaymentFee = prepayment * (fee / 100)

    // 순 차이 (절감액 - 수수료)
    const netBenefit = interestSaved - prepaymentFee

    setResult({
      remainingInterest,
      interestSaved,
      prepaymentFee,
      netBenefit
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
              <h1 className="text-3xl font-bold">중도상환 vs 유지 비교 계산기</h1>
              <p className="text-muted-foreground mt-1">
                중도상환 시 이자 절감액과 수수료를 비교하세요
              </p>
            </div>
          </div>
        </div>

        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>정보 입력</CardTitle>
            <CardDescription>
              현재 대출 상태와 중도상환 계획을 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 남은 잔액 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">남은 대출 잔액</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 200,000,000"
                  value={remainingBalance}
                  onChange={(e) => handleNumberInput(e.target.value, setRemainingBalance)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            {/* 금리 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">대출 금리 (연)</label>
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

            {/* 남은 기간 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">남은 대출 기간</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="예: 240"
                  value={remainingMonths}
                  onChange={(e) => setRemainingMonths(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  개월
                </span>
              </div>
            </div>

            {/* 중도상환 수수료율 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">중도상환 수수료율</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="예: 1.5"
                  value={feeRate}
                  onChange={(e) => setFeeRate(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                대출 계약서 또는 금융기관에 확인하세요
              </p>
            </div>

            {/* 상환 예정 금액 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">중도상환 예정 금액</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 50,000,000"
                  value={prepaymentAmount}
                  onChange={(e) => handleNumberInput(e.target.value, setPrepaymentAmount)}
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  비교 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 유지 시 */}
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      유지 시 남은 총 이자
                    </div>
                    <div className="text-3xl font-bold text-gray-700">
                      {formatNumber(result.remainingInterest)}원
                    </div>
                  </div>

                  {/* 중도상환 시 */}
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      중도상환 시 이자 절감액
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatNumber(result.interestSaved)}원
                    </div>
                  </div>

                  {/* 수수료 */}
                  <div className="p-6 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      중도상환 수수료
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {formatNumber(result.prepaymentFee)}원
                    </div>
                  </div>

                  {/* 순 차이 */}
                  <div className={`p-6 rounded-lg ${
                    result.netBenefit >= 0
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      순 차이 (절감액 - 수수료)
                    </div>
                    <div className={`text-3xl font-bold ${
                      result.netBenefit >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {result.netBenefit >= 0 ? '+' : ''}{formatNumber(result.netBenefit)}원
                    </div>
                    <div className={`text-sm mt-2 ${
                      result.netBenefit >= 0
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {result.netBenefit >= 0
                        ? '이자 절감 효과가 더 큽니다'
                        : '수수료가 절감액보다 큽니다'}
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
                      중도상환은 이자 절감과 함께<br />
                      수수료와 유동성 감소를 고려해야 합니다.
                    </p>
                    <p className="text-blue-700">
                      본 계산은 단순 이자 기준 참고용입니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 추가 고려사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Percent className="h-5 w-5" />
                  중도상환 시 고려사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-semibold mb-2">장점</div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 총 이자 부담 감소</li>
                      <li>• 대출 기간 단축 가능</li>
                      <li>• 심리적 부담 경감</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-600 font-semibold mb-2">고려사항</div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• 수수료 발생 가능</li>
                      <li>• 비상자금 감소</li>
                      <li>• 다른 투자 기회 비용</li>
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
