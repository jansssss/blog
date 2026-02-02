'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeftRight, Calculator } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import {
  CalculatorShell,
  InputCard,
  InputField,
  ResultSection,
  KpiCompare,
  PresetChips,
  Interpretation,
  RelatedTools
} from '@/components/calculators'
import { formatKRW, formatNumber, parseNumberInput } from '@/lib/calculators/format'
import type { Preset, RelatedTool } from '@/lib/calculators/types'

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

// 프리셋 정의
const PRESETS: Preset[] = [
  {
    id: 'apartment',
    label: '아파트 담보대출',
    description: '5억 / 4.5% / 30년',
    values: { amount: 500000000, rate: '4.5', period: '360' }
  },
  {
    id: 'villa',
    label: '빌라 담보대출',
    description: '2억 / 4.8% / 20년',
    values: { amount: 200000000, rate: '4.8', period: '240' }
  },
  {
    id: 'business',
    label: '사업자 대출',
    description: '1.5억 / 5.5% / 15년',
    values: { amount: 150000000, rate: '5.5', period: '180' }
  }
]

// 관련 계산기 링크
const RELATED_TOOLS: RelatedTool[] = [
  {
    title: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '단순 이자 계산'
  },
  {
    title: '대출 한도 계산기',
    href: '/calculator/loan-limit',
    description: 'DSR/DTI 기반 한도'
  },
  {
    title: '중도상환수수료 계산기',
    href: '/calculator/prepayment-fee',
    description: '조기 상환 비용'
  }
]

// 해석 문구
const INTERPRETATION_LINES = [
  '총 이자만 보면 원금균등이 유리한 경우가 많습니다.',
  '다만 초기 월 상환 부담이 커질 수 있어 월 납입액과 총 이자를 함께 비교하세요.',
  '계산 결과는 단순화된 참고값이며, 실제 조건(우대금리·수수료 등)에 따라 달라질 수 있습니다.'
]

export default function RepaymentComparePage() {
  const [loanAmount, setLoanAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanPeriod, setLoanPeriod] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // 결과 생성 시 스크롤
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

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
    const amount = parseNumberInput(loanAmount)
    const rate = parseFloat(interestRate)
    const period = parseFloat(loanPeriod)

    if (!amount || amount <= 0) {
      alert('대출 금액을 올바르게 입력해주세요.')
      return
    }
    if (!rate || rate <= 0 || rate > 100) {
      alert('금리를 올바르게 입력해주세요. (0 ~ 100% 사이)')
      return
    }
    if (!period || period <= 0 || period > 600) {
      alert('대출 기간을 올바르게 입력해주세요. (1 ~ 600개월)')
      return
    }

    const equalPrincipalInterest = calculateEqualPrincipalInterest(amount, rate, period)
    const equalPrincipal = calculateEqualPrincipal(amount, rate, period)

    setResult({
      equalPrincipalInterest,
      equalPrincipal,
      difference: {
        interestSaved: equalPrincipalInterest.totalInterest - equalPrincipal.totalInterest,
        firstPaymentDiff: equalPrincipal.firstPayment - equalPrincipalInterest.monthlyPayment
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

  const handlePresetSelect = (preset: Preset) => {
    setLoanAmount(formatNumber(preset.values.amount as number))
    setInterestRate(preset.values.rate as string)
    setLoanPeriod(preset.values.period as string)
  }

  return (
    <CalculatorShell
      title="원리금 vs 원금균등 상환 비교"
      description="두 가지 상환 방식의 월 납입액과 총 이자를 비교하세요"
      icon={<ArrowLeftRight className="w-7 h-7 text-primary" />}
    >
      {{
        preset: (
          <PresetChips presets={PRESETS} onSelect={handlePresetSelect} />
        ),

        input: (
          <InputCard
            title="대출 정보 입력"
            description="대출 금액, 금리, 기간을 입력하면 두 가지 상환 방식을 비교합니다"
          >
            <InputField label="대출 금액" unit="원">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="예: 100,000,000"
                value={loanAmount}
                onChange={(e) => handleNumberInput(e.target.value, setLoanAmount)}
                className="text-lg"
              />
            </InputField>

            <InputField label="연 금리" unit="%">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="예: 4.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                step="0.01"
                min="0"
                max="100"
                className="text-lg"
              />
            </InputField>

            <InputField label="대출 기간" unit="개월" helpText="예: 20년 = 240개월">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="예: 240"
                value={loanPeriod}
                onChange={(e) => setLoanPeriod(e.target.value)}
                min="1"
                max="600"
                className="text-lg"
              />
            </InputField>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleCalculate} className="flex-1" size="lg">
                <Calculator className="w-4 h-4 mr-2" />
                비교하기
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                초기화
              </Button>
            </div>
          </InputCard>
        ),

        result: result && (
          <div ref={resultRef}>
            <ResultSection
              title="비교 결과"
              summary={`원금균등 선택 시 총 이자 약 ${formatKRW(result.difference.interestSaved)} 절감 예상`}
            >
              <div className="space-y-5">
                {/* 월 상환액 비교 */}
                <KpiCompare
                  label="월 상환액"
                  items={[
                    {
                      name: '원리금균등 (고정)',
                      value: formatKRW(result.equalPrincipalInterest.monthlyPayment),
                      color: 'blue'
                    },
                    {
                      name: '원금균등 (첫 달)',
                      value: formatKRW(result.equalPrincipal.firstPayment),
                      color: 'green'
                    }
                  ]}
                  diffLabel="첫 달 차이"
                  diffValue={`+${formatKRW(result.difference.firstPaymentDiff)}`}
                />

                {/* 총 이자 비교 */}
                <KpiCompare
                  label="총 이자"
                  items={[
                    {
                      name: '원리금균등',
                      value: formatKRW(result.equalPrincipalInterest.totalInterest),
                      color: 'blue'
                    },
                    {
                      name: '원금균등',
                      value: formatKRW(result.equalPrincipal.totalInterest),
                      color: 'green'
                    }
                  ]}
                  diffLabel="절감액"
                  diffValue={formatKRW(result.difference.interestSaved)}
                />

                {/* 총 상환액 비교 */}
                <KpiCompare
                  label="총 상환액"
                  items={[
                    {
                      name: '원리금균등',
                      value: formatKRW(result.equalPrincipalInterest.totalPayment),
                      color: 'blue'
                    },
                    {
                      name: '원금균등',
                      value: formatKRW(result.equalPrincipal.totalPayment),
                      color: 'green'
                    }
                  ]}
                />

                {/* 선택 가이드 */}
                <div className="bg-gray-50 rounded-lg p-4 border mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">선택 가이드</p>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p><strong className="text-blue-700">원리금균등</strong>: 월 소득이 일정하고 예산 관리를 안정적으로 하고 싶을 때</p>
                    <p><strong className="text-green-700">원금균등</strong>: 초기 상환 능력이 있고 총 이자를 줄이고 싶을 때</p>
                  </div>
                </div>

                {/* 상환 스케줄 토글 */}
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSchedule(!showSchedule)}
                  >
                    {showSchedule ? '상환 스케줄 숨기기' : '상환 스케줄 보기'}
                  </Button>
                </div>

                {/* 상환 스케줄 테이블 */}
                {showSchedule && (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="py-2 px-3 text-left">회차</th>
                          <th className="py-2 px-3 text-right text-blue-700">원리금균등</th>
                          <th className="py-2 px-3 text-right text-green-700">원금균등</th>
                          <th className="py-2 px-3 text-right">차이</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.equalPrincipalInterest.schedule.slice(0, 12).map((item, idx) => {
                          const equalPrincipalItem = result.equalPrincipal.schedule[idx]
                          const diff = item.totalPayment - equalPrincipalItem.totalPayment
                          return (
                            <tr key={idx} className="border-b">
                              <td className="py-2 px-3 text-gray-600">{item.month}개월</td>
                              <td className="py-2 px-3 text-right">{formatKRW(item.totalPayment)}</td>
                              <td className="py-2 px-3 text-right">{formatKRW(equalPrincipalItem.totalPayment)}</td>
                              <td className={`py-2 px-3 text-right ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {diff > 0 ? '+' : ''}{formatKRW(diff)}
                              </td>
                            </tr>
                          )
                        })}
                        {result.equalPrincipalInterest.schedule.length > 24 && (
                          <tr>
                            <td colSpan={4} className="py-2 px-3 text-center text-gray-400">
                              ... 중간 생략 ...
                            </td>
                          </tr>
                        )}
                        {result.equalPrincipalInterest.schedule.length > 12 &&
                          result.equalPrincipalInterest.schedule.slice(-6).map((item, idx) => {
                            const actualIdx = result.equalPrincipalInterest.schedule.length - 6 + idx
                            const equalPrincipalItem = result.equalPrincipal.schedule[actualIdx]
                            const diff = item.totalPayment - equalPrincipalItem.totalPayment
                            return (
                              <tr key={`last-${idx}`} className="border-b">
                                <td className="py-2 px-3 text-gray-600">{item.month}개월</td>
                                <td className="py-2 px-3 text-right">{formatKRW(item.totalPayment)}</td>
                                <td className="py-2 px-3 text-right">{formatKRW(equalPrincipalItem.totalPayment)}</td>
                                <td className={`py-2 px-3 text-right ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {diff > 0 ? '+' : ''}{formatKRW(diff)}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ResultSection>
          </div>
        ),

        interpretation: result && (
          <Interpretation lines={INTERPRETATION_LINES} />
        ),

        disclaimer: (
          <>
            {/* 상세 가이드 */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">💡 언제 상환 방식 비교가 필요할까요?</h2>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">1. 주택담보대출 실행 전 상환 방식 선택</h3>
                    <p>주택을 구매하면서 대출을 받을 때, 은행에서 원리금균등과 원금균등 중 선택하라고 합니다. 초기 월 부담과 총 이자 부담을 비교하여 본인의 재무 상황에 맞는 방식을 선택할 수 있습니다. 일반적으로 안정적인 소득이 있다면 원금균등이, 초기 현금 흐름이 중요하다면 원리금균등이 유리합니다.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">2. 대출 전환 또는 갈아타기 검토</h3>
                    <p>기존 대출을 다른 금융기관으로 갈아탈 때, 상환 방식을 변경하는 것도 고려할 수 있습니다. 예를 들어 소득이 증가했다면 원리금균등에서 원금균등으로 바꿔 총 이자를 줄이거나, 반대로 월 부담을 줄이기 위해 원금균등에서 원리금균등으로 변경할 수 있습니다.</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">3. 장기 재무 계획 수립</h3>
                    <p>대출 기간이 20~30년으로 길 경우, 초기 몇 년과 후반부의 월 상환액 차이를 미리 확인하여 장기 재무 계획을 세울 수 있습니다. 특히 은퇴 시점이 가까워질수록 월 상환 부담이 줄어드는 원금균등 방식이 유리할 수 있습니다.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">📐 두 가지 상환 방식의 계산 원리</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">원리금균등 상환 방식</h3>
                    <p className="mb-2"><strong>매월 동일한 금액(원금 + 이자)</strong>을 상환하는 방식입니다:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>초기: 이자 비중이 높고 원금 상환은 적음</li>
                      <li>후반부: 이자 비중이 줄고 원금 상환이 많아짐</li>
                      <li>월 상환액이 일정하여 예산 관리가 용이함</li>
                      <li>총 이자는 원금균등보다 많이 발생함</li>
                    </ul>
                    <p className="mt-2 font-mono text-xs bg-white p-2 rounded">월 상환액 = 대출원금 × [월금리 × (1+월금리)^개월수] / [(1+월금리)^개월수 - 1]</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">원금균등 상환 방식</h3>
                    <p className="mb-2"><strong>매월 동일한 원금 + 감소하는 이자</strong>를 상환하는 방식입니다:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>원금: 매월 동일한 금액 상환 (대출원금 ÷ 총 개월수)</li>
                      <li>이자: 남은 원금에 비례하여 매월 감소</li>
                      <li>초기 월 상환액이 높지만 점점 줄어듦</li>
                      <li>총 이자는 원리금균등보다 적게 발생함</li>
                    </ul>
                    <p className="mt-2 font-mono text-xs bg-white p-2 rounded">월 원금 = 대출원금 / 개월수<br/>월 이자 = 남은 원금 × 월금리</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-900 mb-2">⚠️ 두 방식의 주요 차이</h3>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-xs border">
                        <thead className="bg-white">
                          <tr>
                            <th className="border p-2">구분</th>
                            <th className="border p-2">원리금균등</th>
                            <th className="border p-2">원금균등</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2 font-semibold">월 상환액</td>
                            <td className="border p-2">일정함</td>
                            <td className="border p-2">점점 감소</td>
                          </tr>
                          <tr>
                            <td className="border p-2 font-semibold">초기 부담</td>
                            <td className="border p-2">낮음</td>
                            <td className="border p-2">높음</td>
                          </tr>
                          <tr>
                            <td className="border p-2 font-semibold">총 이자</td>
                            <td className="border p-2">많음</td>
                            <td className="border p-2">적음</td>
                          </tr>
                          <tr>
                            <td className="border p-2 font-semibold">예산 관리</td>
                            <td className="border p-2">쉬움</td>
                            <td className="border p-2">초기 어려움</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">📊 어떤 방식을 선택해야 할까요?</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">원리금균등을 선택하면 좋은 경우</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>월 소득이 일정한 직장인:</strong> 매월 같은 금액을 상환하므로 예산 관리가 편리</li>
                      <li><strong>초기 현금 흐름이 중요한 경우:</strong> 첫 달 상환액이 원금균등보다 낮아 부담이 적음</li>
                      <li><strong>장기 대출:</strong> 30년 이상 장기 대출에서는 월 부담을 일정하게 유지하는 것이 유리</li>
                      <li><strong>다른 투자 계획이 있는 경우:</strong> 초기 여유 자금을 다른 곳에 투자할 수 있음</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">원금균등을 선택하면 좋은 경우</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>초기 상환 능력이 충분한 경우:</strong> 보너스, 퇴직금 등으로 초기 높은 부담을 감당 가능</li>
                      <li><strong>총 이자 비용을 최소화하고 싶을 때:</strong> 원금을 빨리 갚아 이자 부담을 줄임</li>
                      <li><strong>은퇴가 가까운 경우:</strong> 시간이 지날수록 월 부담이 줄어 은퇴 후 부담 감소</li>
                      <li><strong>변동금리 대출:</strong> 원금이 빨리 줄어 금리 인상 시 이자 증가폭이 작음</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">실제 사례 비교</h3>
                    <p className="mb-2"><strong>사례: 2억 원, 4.5% 금리, 20년 대출</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>원리금균등: 매월 약 126만 원 고정, 총 이자 약 3,060만 원</li>
                      <li>원금균등: 첫 달 약 159만 원 → 마지막 달 약 84만 원, 총 이자 약 2,280만 원</li>
                      <li>차이: 총 이자 약 780만 원 절감 가능 (원금균등 선택 시)</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-900 mb-2">⚠️ 상환 방식 변경</h3>
                    <p>대부분의 금융기관은 대출 실행 후 상환 방식 변경을 허용하지 않습니다. 일부 은행에서는 변경을 허용하지만 수수료가 발생할 수 있으므로, <strong>대출 실행 전에 신중하게 선택</strong>해야 합니다.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">대출 상환 방식 안내</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> - 대출 상환 방식 비교 가이드</li>
                      <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> - 주택담보대출 상환 방식 설명</li>
                      <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> - 은행별 상환 조건 비교</li>
                      <li>• <a href="https://www.kfb.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">은행연합회</a> - 대출 상품 이용 안내</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">대출 계산 및 시뮬레이션</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <a href="https://www.kbanknow.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">KB국민은행</a> - 대출 상환 시뮬레이터</li>
                      <li>• <a href="https://www.shinhan.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신한은행</a> - 원리금 계산기</li>
                      <li>• <a href="https://www.wooribank.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">우리은행</a> - 대출 상환 스케줄 조회</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">※ 실제 상환 방식과 금액은 금융기관별 약관 및 조건에 따라 다를 수 있습니다. 대출 실행 전 반드시 금융기관에서 제공하는 상환 계획서를 확인하세요.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DisclaimerNotice />
          </>
        ),

        related: <RelatedTools items={RELATED_TOOLS} />
      }}
    </CalculatorShell>
  )
}
