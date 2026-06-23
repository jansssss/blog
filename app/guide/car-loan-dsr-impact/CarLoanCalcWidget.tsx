'use client'
import { useState, useMemo } from 'react'

function maxLoan(monthly: number, annualRate: number, months: number): number {
  if (monthly <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return monthly * months
  return monthly * (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months))
}

function fmt(n: number) { return new Intl.NumberFormat('ko-KR').format(Math.round(n)) }
function fmtAmt(n: number) {
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`
  if (abs >= 10_000_000)  return `${Math.round(n / 10_000_000)}천만`
  if (abs >= 10_000)      return `${Math.round(n / 10_000)}만`
  return `${fmt(n)}원`
}

function Slider({ label, value, min, max, step, display, onChange, hints }: {
  label: string; value: number; min: number; max: number; step: number
  display: string; onChange: (v: number) => void; hints?: [string, string]
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <span className="text-indigo-700 font-bold">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer cl-guide-slider"
        style={{ background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${pct}%,#c7d2fe ${pct}%,#c7d2fe 100%)` }} />
      {hints && (
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{hints[0]}</span><span>{hints[1]}</span>
        </div>
      )}
    </div>
  )
}

export default function CarLoanCalcWidget() {
  const [salary, setSalary]   = useState(5000)  // 만원
  const [carLoan, setCarLoan] = useState(50)    // 만원/월
  const [rateX10, setRateX10] = useState(40)
  const [years, setYears]     = useState(30)

  const r = useMemo(() => {
    const salaryWon = salary * 10_000
    const carWon    = carLoan * 10_000
    const dsrLimit  = salaryWon * 0.4 / 12
    const rate      = rateX10 / 10
    const months    = years * 12
    const noCar     = maxLoan(dsrLimit, rate, months)
    const withCar   = Math.max(0, maxLoan(Math.max(0, dsrLimit - carWon), rate, months))
    const reduction = noCar - withCar
    const blocked   = dsrLimit - carWon <= 0
    return { dsrLimit, noCar, withCar, reduction, blocked, dsrLimitMon: Math.round(dsrLimit / 10000) }
  }, [salary, carLoan, rateX10, years])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 my-8 not-prose">
      <style>{`
        .cl-guide-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
        .cl-guide-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>

      <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-4">
        ⚡ 차 할부가 내 주담대 한도를 얼마나 줄이나?
      </div>

      <div className="space-y-5 mb-6">
        <Slider label="연 소득" value={salary} min={2000} max={15000} step={100}
          display={`${fmt(salary)}만원`} onChange={setSalary} hints={['2,000만원', '1억 5,000만원']} />
        <Slider label="자동차 할부 월 납입" value={carLoan} min={0} max={150} step={5}
          display={carLoan === 0 ? '없음' : `월 ${carLoan}만원`} onChange={setCarLoan} hints={['없음', '150만원']} />
        <Slider label="주담대 금리" value={rateX10} min={25} max={80} step={1}
          display={`${(rateX10 / 10).toFixed(1)}%`} onChange={setRateX10} hints={['2.5%', '8.0%']} />
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">상환기간</p>
          <div className="flex gap-2">
            {[20, 30, 40].map(y => (
              <button key={y} onClick={() => setYears(y)}
                className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-colors ${years === y ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                {y}년
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 비교 카드 */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">차 할부 없을 때</p>
          <p className="text-3xl font-extrabold text-emerald-600">{fmtAmt(r.noCar)}</p>
          <p className="text-xs text-gray-400 mt-1">주담대 최대 한도</p>
        </div>
        <div className={`rounded-2xl p-5 border shadow-sm ${r.blocked ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-100'}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">월 {carLoan}만원 할부 있을 때</p>
          {r.blocked
            ? <p className="text-xl font-bold text-red-500">DSR 초과 — 주담대 불가</p>
            : <p className="text-3xl font-extrabold text-red-500">{fmtAmt(r.withCar)}</p>}
          <p className="text-xs text-gray-400 mt-1">주담대 최대 한도</p>
        </div>
      </div>

      {/* 감소액 강조 */}
      {!r.blocked && carLoan > 0 && (
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
          <p className="text-indigo-200 text-xs mb-1">차 할부로 인한 주담대 한도 감소</p>
          <p className="text-4xl sm:text-5xl font-bold tracking-tight">– {fmtAmt(r.reduction)}</p>
          <p className="text-indigo-200 text-sm mt-2">
            월 {carLoan}만원짜리 할부 하나가 살 수 있는 집 가격을 <strong>{fmtAmt(r.reduction)}</strong> 낮췄습니다
          </p>
        </div>
      )}

      {carLoan === 0 && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          차 할부 없음 — DSR 여유분 전액이 주담대로 사용 가능합니다.
        </div>
      )}
    </div>
  )
}
