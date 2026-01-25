'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GitCompare, TrendingUp, Lock, Unlock, ArrowLeft, ExternalLink, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
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
          고정금리 vs 변동금리 선택 가이드
        </h1>
        <p className="text-gray-600">
          두 가지 금리 유형의 특징을 이해하고 나에게 맞는 선택을 하세요
        </p>
      </div>

      {/* 핵심 요약 */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">고정금리</h3>
                <p className="text-sm text-blue-700">금리가 변하지 않음</p>
              </div>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-1">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>상환액이 일정해 계획 수립 용이</span>
              </li>
              <li className="flex items-start gap-1">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>금리 인상 위험 없음</span>
              </li>
              <li className="flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>초기 금리가 변동금리보다 높음</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">변동금리</h3>
                <p className="text-sm text-green-700">시장 금리에 따라 변동</p>
              </div>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-start gap-1">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>초기 금리가 상대적으로 낮음</span>
              </li>
              <li className="flex items-start gap-1">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>금리 하락 시 이자 부담 감소</span>
              </li>
              <li className="flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>금리 인상 시 부담 증가</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 시뮬레이터 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 금리 차이 시뮬레이터</h2>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">조건 입력</CardTitle>
            <p className="text-sm text-gray-500">아래 값을 조정하여 두 금리 유형을 비교해보세요</p>
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
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* 고정금리 */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                고정금리 {fixedRate}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">월 상환액</span>
                  <span className="font-semibold text-blue-600">{formatNumber(results.fixed.monthly)}원</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">총 상환액</span>
                  <span>{formatNumber(results.fixed.totalPayment)}원</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">총 이자</span>
                  <span>{formatNumber(results.fixed.totalInterest)}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 변동금리 */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Unlock className="w-5 h-5 text-green-600" />
                변동금리 {variableRate}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">월 상환액 (현재)</span>
                  <span className="font-semibold text-green-600">{formatNumber(results.variable.monthly)}원</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">총 상환액</span>
                  <span>{formatNumber(results.variable.totalPayment)}원</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">총 이자</span>
                  <span>{formatNumber(results.variable.totalInterest)}원</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차이 요약 */}
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">현재 시점 월 상환액 차이</span>
              <span className={`font-bold ${results.monthlyDiff > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                {results.monthlyDiff > 0 ? '고정금리가 ' : '변동금리가 '}
                {formatNumber(Math.abs(results.monthlyDiff))}원 더 높음
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 변동금리 상승 시나리오 */}
        <Card className="mt-4 border-amber-200">
          <CardHeader className="bg-amber-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              변동금리 상승 시나리오
            </CardTitle>
            <p className="text-sm text-amber-700 mt-1">향후 금리가 오르면 얼마나 부담이 늘어날까요?</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <span className="text-sm font-medium">1%p 상승 시</span>
                  <span className="text-xs text-gray-500 ml-2">({variableRate}% → {variableRate + 1}%)</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600">{formatNumber(results.variableUp1.monthly)}원</p>
                  <p className="text-xs text-amber-700">+{formatNumber(results.variableUp1.increase)}원/월</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <span className="text-sm font-medium">2%p 상승 시</span>
                  <span className="text-xs text-gray-500 ml-2">({variableRate}% → {variableRate + 2}%)</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatNumber(results.variableUp2.monthly)}원</p>
                  <p className="text-xs text-red-700">+{formatNumber(results.variableUp2.increase)}원/월</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 선택 가이드 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">나에게 맞는 금리 선택하기</h2>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              고정금리를 선택하면 좋은 경우
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">금리 인상이 예상될 때:</strong> 향후 기준금리가 오를 것으로 전망되는 경우</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">장기 대출인 경우:</strong> 20년 이상 장기 대출로 안정성이 중요한 경우</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">상환 계획이 필요할 때:</strong> 일정한 월 상환액으로 재정 계획을 세우고 싶은 경우</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">소득이 고정적일 때:</strong> 급여 변동이 적어 안정적인 상환을 원하는 경우</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-600" />
              변동금리를 선택하면 좋은 경우
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">금리 하락이 예상될 때:</strong> 향후 기준금리가 내릴 것으로 전망되는 경우</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">단기 대출인 경우:</strong> 5년 이내 상환 예정으로 금리 변동 위험이 적은 경우</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">초기 이자 부담을 줄이고 싶을 때:</strong> 당장의 월 상환액이 부담스러운 경우</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">조기 상환 계획이 있을 때:</strong> 1~2년 내 중도상환 예정인 경우</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-purple-600" />
              혼합형 금리도 고려하세요
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong className="text-gray-900">혼합형(MIX)</strong>은 처음 일정 기간은 고정금리, 이후는 변동금리가 적용됩니다.
              예를 들어 "3년 고정 + 변동" 상품은 처음 3년간은 금리가 고정되고, 이후 변동금리로 전환됩니다.
              두 금리의 장점을 적절히 활용할 수 있는 방법입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 주의사항 */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">금리 선택 시 체크 포인트</p>
            <ul className="text-amber-700 space-y-1">
              <li>• 현재 <strong>기준금리 추세</strong>와 한국은행 전망 확인</li>
              <li>• 고정금리와 변동금리의 <strong>금리 차이</strong>가 얼마인지 확인</li>
              <li>• <strong>중도상환수수료</strong> 조건 비교 (고정금리가 더 높은 경우 많음)</li>
              <li>• 변동금리는 <strong>금리 변동 주기</strong> 확인 (3개월, 6개월, 1년 등)</li>
              <li>• 금리 전환 옵션이 있는지 확인</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <DisclaimerNotice message="본 시뮬레이터는 참고용이며, 실제 상환액은 대출 조건에 따라 달라질 수 있습니다. 금리 선택은 개인의 재정 상황과 시장 전망을 종합적으로 고려하여 결정하세요." />

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">관련 도구</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/calculator/loan-interest"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">대출 이자 계산기</p>
              <p className="text-xs text-gray-500 mt-0.5">상환액 상세 계산</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/calculator/repayment-compare"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">상환 방식 비교</p>
              <p className="text-xs text-gray-500 mt-0.5">원리금 vs 원금균등</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
