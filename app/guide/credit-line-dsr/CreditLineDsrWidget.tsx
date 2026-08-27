'use client'

import { useMemo, useState } from 'react'

function maxLoan(monthlyPayment: number, annualRate: number, months: number): number {
  if (monthlyPayment <= 0 || months <= 0) return 0
  const rate = annualRate / 12 / 100
  if (rate === 0) return monthlyPayment * months
  const factor = Math.pow(1 + rate, months)
  return monthlyPayment * (factor - 1) / (rate * factor)
}

function formatAmount(won: number) {
  if (won >= 100_000_000) {
    return `${(won / 100_000_000).toFixed(2).replace(/0$/, '').replace(/\.$/, '')}억원`
  }
  return `${Math.round(won / 10_000).toLocaleString('ko-KR')}만원`
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <span className="font-bold text-indigo-700">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="credit-line-slider h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${percent}%,#c7d2fe ${percent}%,#c7d2fe 100%)`,
        }}
      />
    </div>
  )
}

export default function CreditLineDsrWidget() {
  const [income, setIncome] = useState(5000)
  const [creditLimit, setCreditLimit] = useState(3000)
  const [usedBalance, setUsedBalance] = useState(0)
  const [creditRateX10, setCreditRateX10] = useState(60)
  const [mortgageRateX10, setMortgageRateX10] = useState(60)
  const [mortgageYears, setMortgageYears] = useState(30)

  const result = useMemo(() => {
    const annualIncome = income * 10_000
    const limitWon = creditLimit * 10_000
    const usedBalanceWon = Math.min(usedBalance, creditLimit) * 10_000
    const creditRate = creditRateX10 / 10
    const mortgageRate = mortgageRateX10 / 10
    const annualDsrCapacity = annualIncome * 0.4

    // 금융위가 안내한 신용대출 DSR 산식의 구조를 단순화한 값:
    // 한도대출은 약정 한도를 대출총액으로 보고, 일시상환 신용대출은 5년 만기로 환산.
    // 이자는 실제 사용잔액에 입력 금리를 곱한 참고값으로 둔다.
    const creditPrincipal = limitWon / 5
    const creditInterest = usedBalanceWon * creditRate / 100
    const creditAnnualBurden = creditPrincipal + creditInterest
    const remainingAnnualCapacity = Math.max(0, annualDsrCapacity - creditAnnualBurden)

    const noCreditLine = maxLoan(
      annualDsrCapacity / 12,
      mortgageRate,
      mortgageYears * 12,
    )
    const withCreditLine = maxLoan(
      remainingAnnualCapacity / 12,
      mortgageRate,
      mortgageYears * 12,
    )

    return {
      annualDsrCapacity,
      creditAnnualBurden,
      remainingAnnualCapacity,
      noCreditLine,
      withCreditLine,
      difference: noCreditLine - withCreditLine,
      share: annualDsrCapacity > 0 ? creditAnnualBurden / annualDsrCapacity : 0,
    }
  }, [income, creditLimit, usedBalance, creditRateX10, mortgageRateX10, mortgageYears])

  return (
    <div className="not-prose my-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6">
      <style>{`
        .credit-line-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,.2)}
        .credit-line-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,.2)}
      `}</style>

      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
        ⚡ 마이너스통장 한도가 주담대 여력에 미치는 영향
      </div>

      <div className="mb-6 space-y-5">
        <Slider
          label="연 소득"
          value={income}
          min={2000}
          max={15000}
          step={100}
          display={`${income.toLocaleString('ko-KR')}만원`}
          onChange={setIncome}
        />
        <Slider
          label="마이너스통장 약정 한도"
          value={creditLimit}
          min={0}
          max={10000}
          step={100}
          display={creditLimit === 0 ? '없음' : `${creditLimit.toLocaleString('ko-KR')}만원`}
          onChange={(nextLimit) => {
            setCreditLimit(nextLimit)
            setUsedBalance((current) => Math.min(current, nextLimit))
          }}
        />
        {creditLimit > 0 && (
          <Slider
            label="현재 사용 잔액"
            value={usedBalance}
            min={0}
            max={creditLimit}
            step={100}
            display={usedBalance === 0 ? '0원' : `${usedBalance.toLocaleString('ko-KR')}만원`}
            onChange={setUsedBalance}
          />
        )}
        <Slider
          label="마이너스통장 금리"
          value={creditRateX10}
          min={30}
          max={150}
          step={1}
          display={`${(creditRateX10 / 10).toFixed(1)}%`}
          onChange={setCreditRateX10}
        />
        <Slider
          label="주담대 심사금리 가정"
          value={mortgageRateX10}
          min={30}
          max={100}
          step={1}
          display={`${(mortgageRateX10 / 10).toFixed(1)}%`}
          onChange={setMortgageRateX10}
        />
        <div>
          <p className="mb-2 text-sm font-medium text-gray-600">주담대 상환기간</p>
          <div className="flex gap-2">
            {[20, 30, 40].map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => setMortgageYears(years)}
                className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors ${
                  mortgageYears === years
                    ? 'bg-indigo-600 text-white'
                    : 'border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                {years}년
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">연간 DSR 여력</p>
          <p className="text-xl font-extrabold text-gray-900">{formatAmount(result.annualDsrCapacity)}</p>
          <p className="mt-1 text-xs text-gray-400">연 소득의 40% 가정</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">마통이 차지하는 몫</p>
          <p className="text-xl font-extrabold text-amber-700">{formatAmount(result.creditAnnualBurden)}</p>
          <p className="mt-1 text-xs text-amber-600">DSR 여력의 {Math.round(result.share * 100)}%</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">주담대에 남는 몫</p>
          <p className="text-xl font-extrabold text-emerald-700">{formatAmount(result.remainingAnnualCapacity)}</p>
          <p className="mt-1 text-xs text-emerald-600">연간 원리금 기준</p>
        </div>
      </div>

      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#2563eb 100%)' }}>
        <p className="mb-1 text-xs text-indigo-200">마이너스통장 유지 시 줄어드는 주담대 추정 한도</p>
        <p className="text-4xl font-bold tracking-tight sm:text-5xl">– {formatAmount(result.difference)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/20 pt-3 text-xs">
          <div>
            <p className="text-indigo-200">마통 없을 때</p>
            <p className="mt-0.5 font-bold text-white">{formatAmount(result.noCreditLine)}</p>
          </div>
          <div>
            <p className="text-indigo-200">마통 유지할 때</p>
            <p className="mt-0.5 font-bold text-white">{formatAmount(result.withCreditLine)}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        규제 산식의 구조를 이해하기 위한 참고 추정치입니다. 한도대출 원금은 약정 한도를 5년으로 나누고,
        이자는 현재 사용 잔액에 입력 금리를 곱해 단순 계산했습니다. 실제 심사에는 스트레스 금리, 소득 인정액, 상환 방식,
        금융회사 내부 기준이 추가되므로 사전심사 결과와 다를 수 있습니다.
      </p>
    </div>
  )
}
