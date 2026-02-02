'use client'

import { useState } from 'react'
import { Target, DollarSign, TrendingUp, AlertTriangle, Calculator } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

interface LimitResult {
  maxMonthlyPayment: number
  estimatedLoanLimit: number
  monthlyIncome: number
  currentDebtPayment: number
  availablePayment: number
  dsrRatio: number
  dsrLimit: number
}

export default function LoanLimitSimulatorPage() {
  const [annualIncome, setAnnualIncome] = useState<string>('')
  const [currentDebtPayment, setCurrentDebtPayment] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('4.5')
  const [loanPeriod, setLoanPeriod] = useState<string>('240')
  const [dsrLimit, setDsrLimit] = useState<string>('40')
  const [result, setResult] = useState<LimitResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  // 원리금균등 방식으로 대출 가능 금액 역산
  const calculateLoanAmount = (monthlyPayment: number, annualRate: number, months: number): number => {
    const monthlyRate = annualRate / 12 / 100
    if (monthlyRate === 0) return monthlyPayment * months

    // 원리금균등 공식을 역산
    // monthlyPayment = principal * (r * (1+r)^n) / ((1+r)^n - 1)
    // principal = monthlyPayment * ((1+r)^n - 1) / (r * (1+r)^n)
    const principal = monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months))
    return principal
  }

  const handleCalculate = () => {
    const income = parseFloat(annualIncome.replace(/,/g, ''))
    const debtPayment = parseFloat(currentDebtPayment.replace(/,/g, '')) || 0
    const rate = parseFloat(interestRate)
    const period = parseFloat(loanPeriod)
    const dsr = parseFloat(dsrLimit)

    // 유효성 검증
    if (!income || income <= 0) {
      alert('연 소득을 올바르게 입력해주세요.')
      return
    }
    if (debtPayment < 0) {
      alert('기존 대출 월 상환액을 올바르게 입력해주세요.')
      return
    }
    if (!rate || rate <= 0 || rate > 100) {
      alert('금리를 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }
    if (!period || period <= 0 || period > 600) {
      alert('상환 기간을 올바르게 입력해주세요. (1 ~ 600개월 사이)')
      return
    }
    if (!dsr || dsr <= 0 || dsr > 100) {
      alert('DSR 한도를 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }

    // 계산
    const monthlyIncome = income / 12
    const maxMonthlyPayment = monthlyIncome * (dsr / 100)
    const availablePayment = Math.max(0, maxMonthlyPayment - debtPayment)

    // 신규 대출 가능 금액 계산
    const estimatedLoanLimit = calculateLoanAmount(availablePayment, rate, period)

    // 실제 DSR 비율 (신규 대출 포함)
    const actualDsrRatio = ((debtPayment + availablePayment) / monthlyIncome) * 100

    setResult({
      maxMonthlyPayment,
      estimatedLoanLimit,
      monthlyIncome,
      currentDebtPayment: debtPayment,
      availablePayment,
      dsrRatio: actualDsrRatio,
      dsrLimit: dsr
    })
  }

  const handleReset = () => {
    setAnnualIncome('')
    setCurrentDebtPayment('')
    setInterestRate('4.5')
    setLoanPeriod('240')
    setDsrLimit('40')
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

  const loadPreset = (preset: 'young-worker' | 'family' | 'high-income') => {
    switch (preset) {
      case 'young-worker':
        setAnnualIncome(formatNumber(40000000))
        setCurrentDebtPayment(formatNumber(500000))
        setInterestRate('4.5')
        setLoanPeriod('360')
        setDsrLimit('40')
        break
      case 'family':
        setAnnualIncome(formatNumber(80000000))
        setCurrentDebtPayment(formatNumber(1000000))
        setInterestRate('4.2')
        setLoanPeriod('300')
        setDsrLimit('40')
        break
      case 'high-income':
        setAnnualIncome(formatNumber(150000000))
        setCurrentDebtPayment(formatNumber(2000000))
        setInterestRate('4.0')
        setLoanPeriod('240')
        setDsrLimit('40')
        break
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          대출 한도 시뮬레이터
        </h1>
        <p className="text-gray-600 text-lg">
          소득과 조건을 입력하여 예상 대출 한도를 확인하세요
        </p>
      </div>

      {/* 안내 카드 */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">DSR(총부채원리금상환비율) 기반 계산</p>
              <p>본 계산기는 DSR 규제를 기반으로 예상 대출 한도를 계산합니다. 실제 한도는 신용등급, 담보 가치, 소득 증빙, 금융기관 정책 등에 따라 달라질 수 있습니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 예시 시나리오 */}
      <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
            <span>✨</span>
            <span>빠른 시작: 예시 시나리오</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              onClick={() => loadPreset('young-worker')}
              variant="outline"
              className="bg-white hover:bg-blue-50 border-blue-200 h-auto py-3 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm">👤 청년 직장인</span>
              <span className="text-xs text-gray-500">연 4천만원 / 기존 대출 50만원</span>
            </Button>
            <Button
              onClick={() => loadPreset('family')}
              variant="outline"
              className="bg-white hover:bg-green-50 border-green-200 h-auto py-3 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm">👨‍👩‍👧 맞벌이 부부</span>
              <span className="text-xs text-gray-500">연 8천만원 / 기존 대출 100만원</span>
            </Button>
            <Button
              onClick={() => loadPreset('high-income')}
              variant="outline"
              className="bg-white hover:bg-purple-50 border-purple-200 h-auto py-3 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm">💼 고소득자</span>
              <span className="text-xs text-gray-500">연 1.5억원 / 기존 대출 200만원</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 입력 카드 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>소득 및 부채 정보 입력</CardTitle>
          <CardDescription>
            현재 소득과 부채 상황을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 연 소득 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              연 소득 (원)
            </label>
            <Input
              type="text"
              placeholder="예: 60,000,000"
              value={annualIncome}
              onChange={(e) => handleNumberInput(e.target.value, setAnnualIncome)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              세전 연 소득을 입력하세요 (근로소득, 사업소득 등)
            </p>
          </div>

          {/* 기존 대출 월 상환액 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              기존 대출 월 상환액 (원)
            </label>
            <Input
              type="text"
              placeholder="예: 1,000,000 (없으면 0)"
              value={currentDebtPayment}
              onChange={(e) => handleNumberInput(e.target.value, setCurrentDebtPayment)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              현재 갚고 있는 모든 대출의 월 상환액 합계 (없으면 0 입력)
            </p>
          </div>

          {/* DSR 한도 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              DSR 한도 (%)
            </label>
            <Input
              type="number"
              placeholder="예: 40"
              value={dsrLimit}
              onChange={(e) => setDsrLimit(e.target.value)}
              step="1"
              min="0"
              max="100"
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              일반적으로 40% (9억 이하 주담대) 또는 50% (기타 대출) 적용
            </p>
          </div>

          {/* 연 금리 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              예상 연 금리 (%)
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
              대출받을 예상 금리를 입력하세요
            </p>
          </div>

          {/* 상환 기간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              상환 기간 (개월)
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
              대출 상환 기간을 개월 단위로 입력하세요 (예: 20년 = 240개월)
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCalculate} className="flex-1" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              한도 계산하기
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결과 카드 */}
      {result && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="text-primary">예상 대출 한도</CardTitle>
            <CardDescription>
              입력하신 조건으로 계산한 예상 대출 가능 금액입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 예상 대출 한도 */}
              <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">예상 대출 가능 금액</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatNumber(result.estimatedLoanLimit)}원
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  * 원리금균등 상환 방식 기준
                </p>
              </div>

              {/* DSR 비율 */}
              <div className={`p-4 rounded-lg border ${
                result.dsrRatio <= result.dsrLimit
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">DSR (총부채원리금상환비율)</p>
                    <p className={`text-2xl font-bold ${
                      result.dsrRatio <= result.dsrLimit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.dsrRatio.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">DSR 한도</p>
                    <p className="text-lg font-semibold text-gray-700">{result.dsrLimit}%</p>
                  </div>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">월 소득</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(result.monthlyIncome)}원
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">최대 월 상환 가능액</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(result.maxMonthlyPayment)}원
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700">기존 대출 월 상환액</p>
                  </div>
                  <p className="text-xl font-bold text-amber-900">
                    {formatNumber(result.currentDebtPayment)}원
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700">신규 대출 가능 월 상환액</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    {formatNumber(result.availablePayment)}원
                  </p>
                </div>
              </div>

              {/* 계산 공식 설명 */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">📌 계산 방식</p>
                <div className="space-y-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <p>• DSR = (모든 대출 월 상환액) / (월 소득) × 100</p>
                  <p>• 최대 월 상환액 = 월 소득 × (DSR 한도 / 100)</p>
                  <p>• 신규 대출 가능 월 상환액 = 최대 월 상환액 - 기존 대출 월 상환액</p>
                  <p>• 대출 가능 금액 = 원리금균등 공식으로 역산</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상세 가이드 */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">💡 언제 DSR 한도 계산이 필요할까요?</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. 주택 구매 전 대출 가능 금액 확인</h3>
              <p>내 집 마련을 준비할 때 실제로 얼마까지 대출을 받을 수 있는지 미리 확인하여 예산을 계획할 수 있습니다. DSR 규제로 인해 소득 대비 일정 비율 이상은 대출받을 수 없으므로, 주택 가격대를 결정하기 전에 한도를 파악하는 것이 중요합니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. 기존 대출이 있는 상태에서 추가 대출 검토</h3>
              <p>이미 신용대출이나 자동차할부가 있는 경우, 추가로 주택담보대출이나 전세자금대출을 받을 수 있는 여력이 얼마나 되는지 확인할 수 있습니다. DSR은 모든 대출의 상환액을 합산하므로, 기존 부채가 많을수록 신규 대출 한도가 줄어듭니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. 대출 상환 계획 수립</h3>
              <p>현재 소득 수준에서 안전하게 감당할 수 있는 대출 규모를 파악하여, 무리한 대출로 인한 재무 위험을 방지할 수 있습니다. 특히 맞벌이 부부의 경우 합산 소득으로 계산하면 한도가 늘어나지만, 한 사람의 소득이 줄어들 경우를 대비한 계획도 필요합니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📐 DSR 계산 방식과 가정</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">DSR 계산 공식</h3>
              <p className="mb-2"><strong>DSR (Debt Service Ratio, 총부채원리금상환비율)</strong>은 다음과 같이 계산됩니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>DSR = (모든 대출의 연간 원리금 상환액) ÷ (연 소득) × 100</li>
                <li>월 소득 = 연 소득 ÷ 12</li>
                <li>최대 월 상환액 = 월 소득 × (DSR 한도 ÷ 100)</li>
                <li>신규 대출 가능 월 상환액 = 최대 월 상환액 - 기존 대출 월 상환액</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">원리금균등 방식 역산</h3>
              <p className="mb-2">본 계산기는 <strong>원리금균등 상환 방식</strong>을 기준으로 대출 가능 금액을 역산합니다:</p>
              <p className="font-mono text-xs bg-white p-2 rounded">대출 가능 금액 = 월 상환액 × [(1+월금리)^개월수 - 1] ÷ [월금리 × (1+월금리)^개월수]</p>
              <p className="mt-2">이 방식은 매월 동일한 금액을 상환하는 가장 일반적인 대출 방식입니다.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 계산에 반영되지 않는 요소</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>LTV (주택담보인정비율):</strong> 주택 가격 대비 최대 대출 비율 (일반적으로 40~70%)</li>
                <li><strong>DTI (총부채상환비율):</strong> 일부 대출 상품에 추가 적용되는 규제</li>
                <li><strong>신용등급:</strong> 신용등급에 따라 금리 우대 및 한도가 달라질 수 있음</li>
                <li><strong>담보 가치:</strong> 주택담보대출의 경우 담보 평가액에 따라 한도가 제한됨</li>
                <li><strong>금융기관 내부 심사:</strong> 재직 기간, 업종, 연령 등 추가 심사 요소</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">DSR 규제 적용 기준</h3>
              <p>2024년 기준 주요 DSR 한도는 다음과 같습니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>주택담보대출 (9억 원 이하): 40%</li>
                <li>주택담보대출 (9억 원 초과): 규제 강화</li>
                <li>기타 가계대출 (신용대출 등): 40~50%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📊 결과를 어떻게 해석하나요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">예상 대출 한도 해석</h3>
              <p>계산 결과가 2억 원이라면, DSR 규제 기준으로 최대 2억 원까지 대출이 가능하다는 의미입니다. 다만 이는 <strong>이론적 최대치</strong>이며, 실제로는 다음 요소를 추가로 고려해야 합니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>주택담보대출의 경우 LTV 규제로 주택 가격의 40~70%까지만 가능</li>
                <li>신용등급이 낮으면 한도가 줄어들거나 금리가 높아질 수 있음</li>
                <li>소득 증빙이 어려운 경우 (프리랜서, 사업소득 등) 한도가 줄어들 수 있음</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">DSR 비율 해석</h3>
              <p>계산 결과에서 DSR이 40%로 표시되면, 소득의 40%를 대출 상환에 사용한다는 뜻입니다. 예를 들어:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>월 소득 500만 원, DSR 40% → 월 상환액 최대 200만 원</li>
                <li>DSR이 규제 한도에 근접할수록 추가 대출 여력이 줄어듦</li>
                <li>안전한 재무 관리를 위해서는 DSR 30% 이하를 권장</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">기존 대출과의 관계</h3>
              <p>기존 대출 월 상환액이 많을수록 신규 대출 한도가 줄어듭니다. 만약 추가 대출이 필요하다면:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>기존 대출 중 금리가 높은 것을 먼저 상환하여 DSR 여력 확보</li>
                <li>소득을 높이거나 맞벌이 소득을 합산하여 한도 증가</li>
                <li>대출 기간을 늘려 월 상환액을 줄이는 방법 고려 (단, 총 이자는 증가)</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 실제 은행 심사와의 차이</h3>
              <p>본 계산기는 DSR 규제만 반영한 예상치입니다. 실제 은행 심사에서는 추가로:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>신용등급별 차등 한도 적용 (1~3등급: 고한도, 4~6등급: 중한도, 7~10등급: 저한도)</li>
                <li>담보 가치 평가 (주택담보대출 시 감정평가 필수)</li>
                <li>재직 기간 및 소득 안정성 평가</li>
                <li>기존 금융 거래 이력 및 연체 여부 확인</li>
              </ul>
              <p className="mt-2"><strong>정확한 한도는 반드시 금융기관에 직접 문의하여 확인하세요.</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">금융 당국 및 규제 정보</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회</a> - DSR 규제 및 정책 발표</li>
                <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> - 대출 규제 안내 및 민원 상담</li>
                <li>• <a href="https://www.bok.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국은행</a> - 금융안정 보고서 및 통계</li>
                <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> - 주택담보대출 상품 안내</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">대출 한도 및 금리 비교</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> - 은행별 대출 상품 비교</li>
                <li>• <a href="https://www.kfb.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">은행연합회</a> - 대출 제도 및 이용 안내</li>
                <li>• <a href="https://www.credit4u.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신용회복위원회</a> - 신용 관리 및 채무 상담</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600">※ DSR 규제는 정책에 따라 변경될 수 있으며, 금융기관별로 세부 기준이 다를 수 있습니다. 대출 신청 전 반드시 최신 정보를 확인하시기 바랍니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 면책 문구 */}
      <DisclaimerNotice message="본 계산 결과는 DSR 규제 기준 예상치이며, 실제 대출 한도는 신용등급, 담보 가치, 금융기관 심사 기준, 소득 증빙 방식, 기타 부채 상황 등에 따라 크게 달라질 수 있습니다. 정확한 한도는 반드시 금융기관에 문의하세요." />

      {/* 추가 안내 */}
      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 DSR 규제 안내</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">DSR(총부채원리금상환비율)이란?</p>
              <p className="ml-4">모든 대출의 연간 원리금 상환액을 연 소득으로 나눈 비율입니다.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">일반적인 DSR 한도</p>
              <ul className="space-y-1 ml-4">
                <li>• 주택담보대출 (9억 이하): 40%</li>
                <li>• 주택담보대출 (9억 초과): 규제 강화</li>
                <li>• 기타 대출 (신용대출 등): 40~50%</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">실제 한도에 영향을 주는 요소</p>
              <ul className="space-y-1 ml-4">
                <li>• 신용등급 (1~10등급)</li>
                <li>• 담보 가치 (주택담보대출의 경우 LTV 규제)</li>
                <li>• 소득 증빙 방법 (근로소득, 사업소득, 기타소득)</li>
                <li>• 연령 및 재직 기간</li>
                <li>• 금융기관별 내부 심사 기준</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">⚠️ 주의사항</p>
              <ul className="space-y-1 ml-4">
                <li>• 본 계산기는 단순 DSR 기준만 고려합니다</li>
                <li>• LTV(주택담보인정비율), DTI(총부채상환비율) 등 다른 규제는 미반영</li>
                <li>• 실제 대출 심사에서는 추가 서류와 조건 확인 필요</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
