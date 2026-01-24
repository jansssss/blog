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

        disclaimer: <DisclaimerNotice />,

        related: <RelatedTools items={RELATED_TOOLS} />
      }}
    </CalculatorShell>
  )
}
