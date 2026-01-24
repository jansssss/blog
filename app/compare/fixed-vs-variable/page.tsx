'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GitCompare, TrendingUp, TrendingDown, Lock, Unlock, ArrowLeft, ExternalLink, CheckCircle2, Info } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

export default function FixedVsVariablePage() {
  const [loanAmount, setLoanAmount] = useState<number>(100000000) // 1억
  const [loanTerm, setLoanTerm] = useState<number>(30) // 30년
  const [fixedRate, setFixedRate] = useState<number>(4.0)
  const [variableRate, setVariableRate] = useState<number>(3.5)

  // 월 상환액 계산 (원리금균등)
  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 100 / 12
    const months = years * 12
    if (monthlyRate === 0) return principal / months
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const results = useMemo(() => {
    const fixedMonthly = calculateMonthlyPayment(loanAmount, fixedRate, loanTerm)
    const variableMonthly = calculateMonthlyPayment(loanAmount, variableRate, loanTerm)
    const totalMonths = loanTerm * 12

    // 금리 상승 시나리오 (1%p 상승)
    const variableUp1 = calculateMonthlyPayment(loanAmount, variableRate + 1, loanTerm)
    // 금리 상승 시나리오 (2%p 상승)
    const variableUp2 = calculateMonthlyPayment(loanAmount, variableRate + 2, loanTerm)

    return {
      fixed: {
        monthly: fixedMonthly,
        totalPayment: fixedMonthly * totalMonths,
        totalInterest: fixedMonthly * totalMonths - loanAmount
      },
      variable: {
        monthly: variableMonthly,
        totalPayment: variableMonthly * totalMonths,
        totalInterest: variableMonthly * totalMonths - loanAmount
      },
      variableUp1: {
        monthly: variableUp1,
        increase: variableUp1 - variableMonthly
      },
      variableUp2: {
        monthly: variableUp2,
        increase: variableUp2 - variableMonthly
      },
      monthlyDiff: fixedMonthly - variableMonthly,
      interestDiff: (fixedMonthly * totalMonths - loanAmount) - (variableMonthly * totalMonths - loanAmount)
    }
  }, [loanAmount, loanTerm, fixedRate, variableRate])

  const formatNumber = (num: number) => Math.round(num).toLocaleString()

  return (
    <div className="container py-8 max-w-5xl">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link href="/compare" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" />
          금융 상품 비교
        </Link>
      </div>

      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <GitCompare className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          고정금리 vs 변동금리
        </h1>
        <p className="text-gray-600">
          두 가지 금리 유형의 장단점과 상환액 차이를 비교해보세요
        </p>
      </div>

      {/* 입력 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">시뮬레이션 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">대출금액</label>
              <div className="relative">
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">원</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(loanAmount / 10000)}만원</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">대출기간</label>
              <div className="relative">
                <Input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">년</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">고정금리</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={fixedRate}
                  onChange={(e) => setFixedRate(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">변동금리 (현재)</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={variableRate}
                  onChange={(e) => setVariableRate(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비교 결과 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* 고정금리 */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <Lock className="w-5 h-5" />
              고정금리 ({fixedRate}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">월 상환액</span>
                <span className="font-bold text-blue-700">{formatNumber(results.fixed.monthly)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 상환액</span>
                <span className="font-medium">{formatNumber(results.fixed.totalPayment)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 이자</span>
                <span className="text-gray-700">{formatNumber(results.fixed.totalInterest)}원</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-blue-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  금리 변동 없이 동일 금액 유지
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 변동금리 */}
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50/50">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <Unlock className="w-5 h-5" />
              변동금리 ({variableRate}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">월 상환액 (현재)</span>
                <span className="font-bold text-amber-700">{formatNumber(results.variable.monthly)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 상환액 (현재 금리 유지 시)</span>
                <span className="font-medium">{formatNumber(results.variable.totalPayment)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 이자 (현재 금리 유지 시)</span>
                <span className="text-gray-700">{formatNumber(results.variable.totalInterest)}원</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-amber-700 flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  시장 금리에 따라 변동
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차이 요약 */}
      <Card className="mb-6 bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">현재 금리 기준 월 상환액 차이</p>
            <p className={`text-2xl font-bold ${results.monthlyDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.monthlyDiff > 0 ? '+' : ''}{formatNumber(results.monthlyDiff)}원/월
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {results.monthlyDiff > 0
                ? `고정금리가 월 ${formatNumber(results.monthlyDiff)}원 더 비쌈`
                : `변동금리가 월 ${formatNumber(Math.abs(results.monthlyDiff))}원 더 비쌈`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 금리 상승 시나리오 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            변동금리 상승 시나리오
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700 mb-1">금리 1%p 상승 시 ({variableRate + 1}%)</p>
              <p className="text-xl font-bold text-amber-800">
                {formatNumber(results.variableUp1.monthly)}원/월
              </p>
              <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +{formatNumber(results.variableUp1.increase)}원 증가
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 mb-1">금리 2%p 상승 시 ({variableRate + 2}%)</p>
              <p className="text-xl font-bold text-red-800">
                {formatNumber(results.variableUp2.monthly)}원/월
              </p>
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +{formatNumber(results.variableUp2.increase)}원 증가
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            * 금리 상승 시 고정금리는 동일하지만, 변동금리는 상환액이 증가합니다
          </p>
        </CardContent>
      </Card>

      {/* 가이드 콘텐츠 */}
      <section className="border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          고정금리 vs 변동금리, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
          {/* 비교표 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left">구분</th>
                  <th className="border p-3 text-center text-blue-700">고정금리</th>
                  <th className="border p-3 text-center text-amber-700">변동금리</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 font-medium">금리 특성</td>
                  <td className="border p-3 text-center">대출 기간 내 동일</td>
                  <td className="border p-3 text-center">6개월~1년 주기로 변동</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">초기 금리</td>
                  <td className="border p-3 text-center">상대적으로 높음</td>
                  <td className="border p-3 text-center">상대적으로 낮음</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">상환액 예측</td>
                  <td className="border p-3 text-center">쉬움 (고정)</td>
                  <td className="border p-3 text-center">어려움 (변동)</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">금리 상승기</td>
                  <td className="border p-3 text-center text-green-600">유리</td>
                  <td className="border p-3 text-center text-red-600">불리</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">금리 하락기</td>
                  <td className="border p-3 text-center text-red-600">불리</td>
                  <td className="border p-3 text-center text-green-600">유리</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">추천 대상</td>
                  <td className="border p-3 text-center">안정적 상환 원하는 경우</td>
                  <td className="border p-3 text-center">금리 하락 예상 / 단기 상환</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              언제 고정금리가 유리할까?
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">장기 대출:</strong> 30년 이상 장기 대출은 금리 변동 리스크가 큼</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">금리 상승기:</strong> 앞으로 금리가 오를 것으로 예상될 때</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">고정 소득:</strong> 급여가 일정하고 상환액 예측이 중요할 때</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              언제 변동금리가 유리할까?
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">단기 대출:</strong> 5년 이내 상환 계획이 있을 때</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">금리 하락기:</strong> 금리가 내려갈 것으로 예상될 때</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">여유 자금:</strong> 금리 상승 시에도 감당 가능할 때</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              혼합형도 고려하세요
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              최근에는 <strong className="text-gray-900">혼합형 금리</strong>도 많이 출시됩니다.
              처음 5년은 고정금리, 이후 변동금리로 전환되는 방식입니다.
              초반 상환액 부담을 줄이면서 일정 기간 안정성을 확보할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 체크리스트 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          금리 유형 선택 전 체크리스트
        </h2>
        <div className="bg-gray-50 border rounded-lg p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">대출 상환 기간이 얼마나 되는지 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">현재 경제 상황과 금리 전망을 파악했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">금리 상승 시에도 상환이 가능한지 계산했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">중도상환 또는 대환 가능성을 고려했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">고정금리와 변동금리의 금리 차이를 비교했는지</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 면책 */}
      <div className="mt-8">
        <DisclaimerNotice message="본 시뮬레이션은 참고용이며, 실제 상환액은 금융기관 및 개인 조건에 따라 달라집니다." />
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">관련 도구</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/calculator/repayment-compare"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">원리금 vs 원금균등 비교</p>
              <p className="text-xs text-gray-500 mt-0.5">상환 방식 비교</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/compare/bank-rates"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">은행별 금리 비교</p>
              <p className="text-xs text-gray-500 mt-0.5">금리 한눈에 보기</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
