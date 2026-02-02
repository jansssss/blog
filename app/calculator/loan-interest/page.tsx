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
  gracePeriodInterest?: number
  gracePeriodTotal?: number
}

export default function LoanInterestCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [loanPeriod, setLoanPeriod] = useState<string>('')
  const [gracePeriod, setGracePeriod] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const loadPreset = (preset: 'first-home' | 'credit-loan' | 'business-loan') => {
    switch (preset) {
      case 'first-home':
        setLoanAmount(formatNumber(300000000))
        setInterestRate('4.2')
        setLoanPeriod('360')
        setGracePeriod('12')
        break
      case 'credit-loan':
        setLoanAmount(formatNumber(30000000))
        setInterestRate('6.5')
        setLoanPeriod('60')
        setGracePeriod('0')
        break
      case 'business-loan':
        setLoanAmount(formatNumber(100000000))
        setInterestRate('5.8')
        setLoanPeriod('120')
        setGracePeriod('6')
        break
    }
  }

  const handleCalculate = () => {
    const amount = parseFloat(loanAmount.replace(/,/g, ''))
    const rate = parseFloat(interestRate)
    const period = parseFloat(loanPeriod)
    const grace = parseFloat(gracePeriod || '0')

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
    if (grace < 0 || grace >= period) {
      alert('거치기간은 0 이상, 대출 기간보다 작아야 합니다.')
      return
    }

    // 계산
    const monthlyRate = rate / 12 / 100
    const monthlyInterest = amount * monthlyRate
    const totalInterest = monthlyInterest * period
    const totalRepayment = amount + totalInterest

    let gracePeriodInterest = 0
    let gracePeriodTotal = 0

    if (grace > 0) {
      // 거치기간 동안 이자만 납부
      gracePeriodInterest = monthlyInterest * grace
      // 거치기간 후 원금 상환 + 이자
      const remainingPeriod = period - grace
      const remainingInterest = monthlyInterest * remainingPeriod
      gracePeriodTotal = amount + gracePeriodInterest + remainingInterest
    }

    setResult({
      monthlyInterest,
      totalInterest,
      totalRepayment,
      gracePeriodInterest: grace > 0 ? gracePeriodInterest : undefined,
      gracePeriodTotal: grace > 0 ? gracePeriodTotal : undefined
    })
  }

  const handleReset = () => {
    setLoanAmount('')
    setInterestRate('')
    setLoanPeriod('')
    setGracePeriod('')
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

      {/* 예시 시나리오 */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
            <span>✨</span>
            <span>빠른 시작: 예시 시나리오</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              onClick={() => loadPreset('first-home')}
              variant="outline"
              className="bg-white hover:bg-blue-50 border-blue-200 h-auto py-3 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm">🏠 첫 주택담보대출</span>
              <span className="text-xs text-gray-500">3억원 / 4.2% / 30년</span>
            </Button>
            <Button
              onClick={() => loadPreset('credit-loan')}
              variant="outline"
              className="bg-white hover:bg-green-50 border-green-200 h-auto py-3 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm">💳 개인 신용대출</span>
              <span className="text-xs text-gray-500">3천만원 / 6.5% / 5년</span>
            </Button>
            <Button
              onClick={() => loadPreset('business-loan')}
              variant="outline"
              className="bg-white hover:bg-purple-50 border-purple-200 h-auto py-3 flex flex-col items-start gap-1"
            >
              <span className="font-semibold text-sm">🏢 사업자 대출</span>
              <span className="text-xs text-gray-500">1억원 / 5.8% / 10년</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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

          {/* 거치기간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              거치기간 (개월)
              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">선택사항</span>
            </label>
            <Input
              type="number"
              placeholder="예: 12 (없으면 0 또는 비워두세요)"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
              min="0"
              max="600"
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              거치기간 동안 이자만 납부하고 원금은 나중에 상환합니다
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

              {/* 거치기간 사용 시 비교 */}
              {result.gracePeriodInterest !== undefined && result.gracePeriodTotal !== undefined && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>📊</span>
                    <span>거치기간 사용 시 비교</span>
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* 거치기간 없이 */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 mb-1">거치기간 없이</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatNumber(result.totalRepayment)}원
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        매월 원금+이자 상환
                      </p>
                    </div>

                    {/* 거치기간 사용 */}
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700 mb-1">거치기간 {gracePeriod}개월 사용</p>
                      <p className="text-lg font-bold text-amber-900">
                        {formatNumber(result.gracePeriodTotal)}원
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {gracePeriod}개월간 이자만: {formatNumber(result.gracePeriodInterest)}원
                      </p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${
                    result.gracePeriodTotal > result.totalRepayment
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className="text-sm">
                      {result.gracePeriodTotal > result.totalRepayment ? (
                        <>
                          <strong className="text-red-700">⚠️ 추가 비용:</strong>{' '}
                          <span className="text-red-900">
                            거치기간 사용 시 {formatNumber(result.gracePeriodTotal - result.totalRepayment)}원 더 부담
                          </span>
                        </>
                      ) : (
                        <span className="text-green-700">동일한 총 상환액</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* 상세 정보 */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">📌 계산 상세</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 대출 금액: {formatNumber(parseFloat(loanAmount.replace(/,/g, '')))}원</li>
                  <li>• 연 금리: {interestRate}%</li>
                  <li>• 대출 기간: {loanPeriod}개월</li>
                  {gracePeriod && parseFloat(gracePeriod) > 0 && (
                    <li>• 거치기간: {gracePeriod}개월 (이자만 납부)</li>
                  )}
                  <li>• 계산 방식: 단순 이자 (원금 × 금리 × 기간)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상세 가이드 */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">💡 언제 대출 이자 계산이 필요할까요?</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. 신용대출 갈아타기 검토 시</h3>
              <p>기존 대출의 금리가 높아 다른 금융기관으로 갈아탈지 고민할 때, 현재 대출의 총 이자와 신규 대출의 예상 이자를 비교하여 실제 절감 효과를 확인할 수 있습니다. 단, 중도상환수수료와 신규 대출 취급 수수료를 함께 고려해야 정확한 비교가 가능합니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. 주택담보대출 실행 전 예산 계획</h3>
              <p>내 집 마련을 위해 주택담보대출을 받기 전, 월 이자 부담과 총 상환액을 미리 계산하여 가계 예산에 무리가 없는지 확인할 수 있습니다. 특히 원리금균등 상환과 원금균등 상환 방식 중 어떤 것을 선택할지 결정하는 데 도움이 됩니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. 거치기간 설정 여부 결정</h3>
              <p>대출 초기 현금 흐름이 부족한 경우 거치기간을 설정하면 초기 부담을 줄일 수 있지만, 총 상환액이 증가합니다. 거치기간 사용 시와 미사용 시의 이자 차이를 계산하여 본인의 재무 상황에 맞는 선택을 할 수 있습니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📐 이 계산기의 계산 방식과 가정</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">계산 공식</h3>
              <p className="mb-2">본 계산기는 <strong>단순 이자 방식</strong>을 사용합니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>월 이자 = 대출 원금 × (연 금리 ÷ 12 ÷ 100)</li>
                <li>총 이자 = 월 이자 × 대출 기간(개월)</li>
                <li>총 상환액 = 대출 원금 + 총 이자</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 계산에 포함되지 않는 요소</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>복리 이자:</strong> 실제 대출은 월복리가 적용되어 총 이자가 약간 더 높을 수 있습니다.</li>
                <li><strong>원리금균등/원금균등 상환:</strong> 본 계산기는 이자만 계산하며, 실제 상환 방식에 따라 월 납입액이 달라집니다.</li>
                <li><strong>중도상환수수료:</strong> 대출 기간 중 조기 상환 시 수수료가 발생할 수 있습니다.</li>
                <li><strong>우대금리 및 할인:</strong> 급여이체, 자동이체 등 조건 충족 시 추가 할인이 있을 수 있습니다.</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">거치기간 계산 방식</h3>
              <p>거치기간을 설정한 경우, 해당 기간 동안 원금 상환 없이 이자만 납부하고, 이후 남은 기간 동안 원금과 이자를 함께 상환합니다. 거치기간 동안 원금이 줄지 않으므로 총 이자 부담이 커집니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📊 결과를 어떻게 해석하나요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">월 이자 금액 해석</h3>
              <p>월 이자는 매달 납부해야 하는 최소 금액입니다. 예를 들어 월 이자가 50만 원이면, 원리금균등 방식에서는 월 납입액이 약 50만 원 이상이 되며, 원금균등 방식에서는 초기에 원금 상환액이 추가되어 더 높아집니다. 월 소득 대비 20~30%를 넘지 않도록 설정하는 것이 안전합니다.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">총 이자와 총 상환액 비교</h3>
              <p>총 이자가 1,200만 원이고 대출 원금이 1억 원이라면, 총 상환액은 1억 1,200만 원입니다. 대출 기간이 길수록 총 이자가 증가하므로, 가능하면 대출 기간을 짧게 설정하거나 중도상환을 통해 이자 부담을 줄이는 것이 유리합니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">거치기간 사용 시 주의사항</h3>
              <p>거치기간을 사용하면 초기 월 부담이 줄어들지만, 총 이자는 증가합니다. 계산 결과에서 "추가 비용"이 표시되면, 그만큼 더 많은 이자를 내야 한다는 의미입니다. 창업 초기나 소득이 불안정한 경우에는 유용하지만, 장기적으로는 비용 증가를 감수해야 합니다.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 실제 대출과의 차이</h3>
              <p>본 계산기는 단순 이자 기준이므로, 실제 은행의 상환 스케줄과 10~15% 정도 차이가 날 수 있습니다. 대출 실행 전 반드시 금융기관에서 제공하는 "대출 상환 계획서"를 확인하고, 정확한 월 납입액과 총 이자를 확인하세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">금융 당국 및 공공기관</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> - 대출 상품 비교 및 금리 정보</li>
                <li>• <a href="https://www.bok.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국은행</a> - 기준금리 및 금융통계</li>
                <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> - 주택담보대출 안내</li>
                <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> - 대출 금리 비교</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">시중 은행 대출 정보</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://www.kbanknow.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">KB국민은행</a> - 개인대출 상품 안내</li>
                <li>• <a href="https://www.shinhan.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신한은행</a> - 대출금리 및 한도 조회</li>
                <li>• <a href="https://www.wooribank.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">우리은행</a> - 주택담보대출 안내</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600">※ 위 링크는 참고용이며, 실제 대출 조건은 개인의 신용등급, 소득, 담보 가치 등에 따라 달라질 수 있습니다. 대출 실행 전 반드시 해당 금융기관에 직접 문의하시기 바랍니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 면책 문구 */}
      <DisclaimerNotice />

      {/* 추가 안내 */}
      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 참고사항</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 본 계산기는 <strong>단순 이자</strong> 기준으로 계산됩니다.</li>
            <li>• 실제 대출 상환 방식(원리금균등, 원금균등)과는 다를 수 있습니다.</li>
            <li>• <strong>거치기간</strong>: 설정 시 해당 기간 동안 이자만 납부하고, 이후 원금을 상환합니다.</li>
            <li>• 거치기간 사용 시 초기 부담은 줄어들지만, 총 상환액은 증가할 수 있습니다.</li>
            <li>• 정확한 상환 계획은 금융기관에서 제공하는 상환 스케줄을 확인하세요.</li>
          </ul>
        </CardContent>
      </Card>

      {/* 거치기간 가이드 */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
            <span>🤔</span>
            <span>거치기간, 언제 사용하면 좋을까요?</span>
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-white p-3 rounded-lg">
              <p className="font-semibold text-green-700 mb-1">✅ 추천하는 경우</p>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• 초기 현금 흐름이 부족할 때 (창업 초기, 사업 안정화 전)</li>
                <li>• 소득이 점진적으로 증가할 것으로 예상될 때</li>
                <li>• 단기적으로 자금을 다른 곳에 투자하여 수익을 낼 수 있을 때</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-semibold text-red-700 mb-1">⚠️ 신중해야 하는 경우</p>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• 안정적인 소득이 있고 원금 상환 여력이 충분할 때</li>
                <li>• 총 이자 비용을 최소화하고 싶을 때</li>
                <li>• 대출 기간이 짧거나 금리가 높을 때</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
