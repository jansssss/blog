'use client'

import { useState } from 'react'
import { ArrowLeftRight, TrendingDown, Calendar, Calculator } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface RepaymentSchedule {
  month: number
  principal: number
  interest: number
  totalPayment: number
  remainingBalance: number
}

interface ComparisonResult {
  equalPrincipalInterest: {
    monthlyPayment: number
    totalInterest: number
    totalPayment: number
    schedule: RepaymentSchedule[]
  }
  equalPrincipal: {
    firstPayment: number
    lastPayment: number
    totalInterest: number
    totalPayment: number
    schedule: RepaymentSchedule[]
  }
  difference: {
    interestSaved: number
    firstPaymentDiff: number
  }
}

export default function RepaymentComparePage() {
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [loanPeriod, setLoanPeriod] = useState<string>('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  // 원리금균등 계산
  const calculateEqualPrincipalInterest = (
    principal: number,
    annualRate: number,
    months: number
  ) => {
    const monthlyRate = annualRate / 12 / 100
    const monthlyPayment =
      principal *
      (monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)

    let remainingBalance = principal
    const schedule: RepaymentSchedule[] = []
    let totalInterest = 0

    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment
      totalInterest += interestPayment

      schedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        totalPayment: monthlyPayment,
        remainingBalance: Math.max(0, remainingBalance)
      })
    }

    return {
      monthlyPayment,
      totalInterest,
      totalPayment: principal + totalInterest,
      schedule
    }
  }

  // 원금균등 계산
  const calculateEqualPrincipal = (
    principal: number,
    annualRate: number,
    months: number
  ) => {
    const monthlyRate = annualRate / 12 / 100
    const principalPayment = principal / months

    let remainingBalance = principal
    const schedule: RepaymentSchedule[] = []
    let totalInterest = 0

    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const totalPayment = principalPayment + interestPayment
      remainingBalance -= principalPayment
      totalInterest += interestPayment

      schedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        totalPayment,
        remainingBalance: Math.max(0, remainingBalance)
      })
    }

    return {
      firstPayment: schedule[0].totalPayment,
      lastPayment: schedule[schedule.length - 1].totalPayment,
      totalInterest,
      totalPayment: principal + totalInterest,
      schedule
    }
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

    const equalPrincipalInterest = calculateEqualPrincipalInterest(amount, rate, period)
    const equalPrincipal = calculateEqualPrincipal(amount, rate, period)

    setResult({
      equalPrincipalInterest,
      equalPrincipal,
      difference: {
        interestSaved: equalPrincipalInterest.totalInterest - equalPrincipal.totalInterest,
        firstPaymentDiff: equalPrincipalInterest.monthlyPayment - equalPrincipal.firstPayment
      }
    })
  }

  const handleReset = () => {
    setLoanAmount('')
    setInterestRate('')
    setLoanPeriod('')
    setResult(null)
    setShowSchedule(false)
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
    <div className="container py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <ArrowLeftRight className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          원리금 vs 원금균등 비교
        </h1>
        <p className="text-gray-600 text-lg">
          두 가지 상환 방식의 차이를 한눈에 비교하세요
        </p>
      </div>

      {/* 입력 카드 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>대출 정보 입력</CardTitle>
          <CardDescription>
            대출 금액, 금리, 기간을 입력하면 두 가지 상환 방식을 비교합니다
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
              onChange={(e) => handleNumberInput(e.target.value, setLoanAmount)}
              className="text-lg"
            />
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
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCalculate} className="flex-1" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              비교하기
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결과 비교 카드 */}
      {result && (
        <>
          {/* 요약 비교 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 원리금균등 */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">원리금균등 상환</CardTitle>
                <CardDescription className="text-blue-700">
                  매월 동일한 금액 상환
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">월 상환액 (고정)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(result.equalPrincipalInterest.monthlyPayment)}원
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 이자</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(result.equalPrincipalInterest.totalInterest)}원
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 상환액</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(result.equalPrincipalInterest.totalPayment)}원
                  </p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-800">
                    ✅ 매월 일정한 금액으로 예산 관리가 쉬움
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 원금균등 */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">원금균등 상환</CardTitle>
                <CardDescription className="text-green-700">
                  원금은 고정, 이자는 감소
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">첫 달 상환액</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(result.equalPrincipal.firstPayment)}원
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 이자</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(result.equalPrincipal.totalInterest)}원
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 상환액</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(result.equalPrincipal.totalPayment)}원
                  </p>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <p className="text-xs text-green-800">
                    ✅ 총 이자가 적고 시간이 지날수록 부담 감소
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 차이 분석 */}
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="text-primary">비교 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900">이자 절감액</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(result.difference.interestSaved)}원
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    원금균등이 원리금균등보다 이자 절감
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <p className="font-semibold text-amber-900">초기 부담 차이</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatNumber(Math.abs(result.difference.firstPaymentDiff))}원
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    원금균등이 첫 달 더 많음
                  </p>
                </div>
              </div>

              {/* 추천 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-2 text-gray-900">💡 선택 가이드</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>원리금균등</strong>을 선택하세요:{' '}
                    <span className="text-gray-700">
                      월 소득이 일정하고 예산 관리를 안정적으로 하고 싶을 때
                    </span>
                  </p>
                  <p>
                    <strong>원금균등</strong>을 선택하세요:{' '}
                    <span className="text-gray-700">
                      초기 상환 능력이 있고 총 이자를 줄이고 싶을 때
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상환 스케줄 토글 버튼 */}
          <div className="text-center mb-6">
            <Button
              variant="outline"
              onClick={() => setShowSchedule(!showSchedule)}
              size="lg"
            >
              {showSchedule ? '상환 스케줄 숨기기' : '상환 스케줄 보기'}
            </Button>
          </div>

          {/* 상환 스케줄 테이블 */}
          {showSchedule && (
            <Card>
              <CardHeader>
                <CardTitle>월별 상환 스케줄</CardTitle>
                <CardDescription>
                  처음 12개월과 마지막 12개월의 상환 내역을 표시합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left">회차</th>
                        <th className="py-2 px-3 text-right bg-blue-50">
                          원리금균등
                          <br />
                          <span className="text-xs font-normal text-gray-600">월 상환액</span>
                        </th>
                        <th className="py-2 px-3 text-right bg-green-50">
                          원금균등
                          <br />
                          <span className="text-xs font-normal text-gray-600">월 상환액</span>
                        </th>
                        <th className="py-2 px-3 text-right">차이</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 처음 12개월 */}
                      {result.equalPrincipalInterest.schedule.slice(0, 12).map((item, idx) => {
                        const equalPrincipalItem = result.equalPrincipal.schedule[idx]
                        const diff = item.totalPayment - equalPrincipalItem.totalPayment
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3">{item.month}개월</td>
                            <td className="py-2 px-3 text-right bg-blue-50">
                              {formatNumber(item.totalPayment)}원
                            </td>
                            <td className="py-2 px-3 text-right bg-green-50">
                              {formatNumber(equalPrincipalItem.totalPayment)}원
                            </td>
                            <td className={`py-2 px-3 text-right ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {diff > 0 ? '+' : ''}{formatNumber(diff)}원
                            </td>
                          </tr>
                        )
                      })}

                      {/* 중간 생략 */}
                      {result.equalPrincipalInterest.schedule.length > 24 && (
                        <tr>
                          <td colSpan={4} className="py-2 px-3 text-center text-gray-400">
                            ... 중간 생략 ...
                          </td>
                        </tr>
                      )}

                      {/* 마지막 12개월 */}
                      {result.equalPrincipalInterest.schedule.length > 12 &&
                        result.equalPrincipalInterest.schedule
                          .slice(-12)
                          .map((item, idx) => {
                            const actualIdx = result.equalPrincipalInterest.schedule.length - 12 + idx
                            const equalPrincipalItem = result.equalPrincipal.schedule[actualIdx]
                            const diff = item.totalPayment - equalPrincipalItem.totalPayment
                            return (
                              <tr key={`last-${idx}`} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">{item.month}개월</td>
                                <td className="py-2 px-3 text-right bg-blue-50">
                                  {formatNumber(item.totalPayment)}원
                                </td>
                                <td className="py-2 px-3 text-right bg-green-50">
                                  {formatNumber(equalPrincipalItem.totalPayment)}원
                                </td>
                                <td className={`py-2 px-3 text-right ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {diff > 0 ? '+' : ''}{formatNumber(diff)}원
                                </td>
                              </tr>
                            )
                          })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 면책 문구 */}
      <div className="mt-6">
        <DisclaimerNotice />
      </div>

      {/* 추가 안내 */}
      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">📚 상환 방식 이해하기</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">원리금균등 상환</p>
              <ul className="space-y-1 ml-4">
                <li>• 매월 원금 + 이자의 합계가 동일</li>
                <li>• 초기에는 이자 비중이 높고, 후반에는 원금 비중이 높아짐</li>
                <li>• 예산 계획이 쉽고 관리가 편리함</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">원금균등 상환</p>
              <ul className="space-y-1 ml-4">
                <li>• 매월 원금은 동일하고, 이자는 잔액에 비례하여 감소</li>
                <li>• 초기 상환액이 많지만, 시간이 지날수록 부담 감소</li>
                <li>• 총 이자 부담이 원리금균등보다 적음</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
