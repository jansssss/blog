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
        className="w-full h-2 rounded-full appearance-none cursor-pointer ld-guide-slider"
        style={{ background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${pct}%,#c7d2fe ${pct}%,#c7d2fe 100%)` }} />
      {hints && (
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{hints[0]}</span><span>{hints[1]}</span>
        </div>
      )}
    </div>
  )
}

export default function LtvDsrCalcWidget() {
  const [salary, setSalary]       = useState(5000)   // 만원
  const [existing, setExisting]   = useState(100)    // 만원/월
  const [housePrice, setHousePrice] = useState(50000) // 만원
  const [ltvPct, setLtvPct]       = useState(70)     // %
  const [rateX10, setRateX10]     = useState(40)
  const [years, setYears]         = useState(30)

  const r = useMemo(() => {
    const salaryWon   = salary * 10_000
    const existWon    = existing * 10_000
    const housePriceW = housePrice * 10_000
    const rate        = rateX10 / 10
    const months      = years * 12

    const ltvLimit    = housePriceW * ltvPct / 100
    const dsrMonthly  = salaryWon * 0.4 / 12
    const available   = Math.max(0, dsrMonthly - existWon)
    const dsrLimit    = maxLoan(available, rate, months)
    const actualLimit = Math.min(ltvLimit, Math.max(0, dsrLimit))
    const blocked     = available <= 0
    const blocker: 'DSR' | 'LTV' | 'BOTH' = blocked ? 'DSR'
      : dsrLimit <= 0 ? 'DSR'
      : dsrLimit < ltvLimit ? 'DSR' : 'LTV'

    return { ltvLimit, dsrLimit: Math.max(0, dsrLimit), actualLimit, blocker, blocked, dsrMonthly, available }
  }, [salary, existing, housePrice, ltvPct, rateX10, years])

  const blockerColor = r.blocker === 'DSR'
    ? { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
    : { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 my-8 not-prose">
      <style>{`
        .ld-guide-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
        .ld-guide-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>

      <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-4">
        ⚡ LTV 한도 vs DSR 한도 — 무엇이 나를 막고 있나?
      </div>

      <div className="space-y-5 mb-6">
        <Slider label="연 소득" value={salary} min={2000} max={15000} step={100}
          display={`${fmt(salary)}만원`} onChange={setSalary} hints={['2,000만원', '1억 5,000만원']} />
        <Slider label="기존 대출 월 납입 합계" value={existing} min={0} max={200} step={5}
          display={existing === 0 ? '없음' : `월 ${existing}만원`} onChange={setExisting} hints={['없음', '200만원']} />
        <Slider label="주택 가격" value={housePrice} min={10000} max={200000} step={1000}
          display={fmtAmt(housePrice * 10_000)} onChange={setHousePrice} hints={['1억', '20억']} />
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">LTV 적용율</p>
          <div className="flex gap-2">
            {[40, 50, 70].map(p => (
              <button key={p} onClick={() => setLtvPct(p)}
                className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-colors ${ltvPct === p ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                {p}%
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">40% 투기과열 / 50% 조정대상 / 70% 일반</p>
        </div>
        <Slider label="주담대 금리" value={rateX10} min={25} max={80} step={1}
          display={`${(rateX10 / 10).toFixed(1)}%`} onChange={setRateX10} hints={['2.5%', '8.0%']} />
      </div>

      {/* 히어로 결과 */}
      <div className="rounded-2xl p-5 sm:p-6 text-white mb-3"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
        <p className="text-indigo-200 text-xs mb-1">내 실제 주담대 한도 (LTV·DSR 중 낮은 값)</p>
        {r.blocked
          ? <p className="text-xl font-bold text-red-300">기존 부채가 DSR 초과 → 주담대 불가</p>
          : <p className="text-4xl sm:text-5xl font-bold tracking-tight">{fmtAmt(r.actualLimit)}</p>}
        {!r.blocked && (
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${blockerColor.bg} ${blockerColor.text}`}>
            {r.blocker === 'DSR' ? '📌 DSR이 한도를 제한하고 있음' : '📌 LTV가 한도를 제한하고 있음'}
          </div>
        )}
      </div>

      {/* LTV vs DSR 비교 */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`rounded-xl p-4 border ${r.blocker === 'LTV' ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'} shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500">LTV 기준 한도</p>
            {r.blocker === 'LTV' && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">이쪽이 막힘</span>}
          </div>
          <p className="text-2xl font-extrabold text-gray-800">{fmtAmt(r.ltvLimit)}</p>
          <p className="text-[10px] text-gray-400 mt-1">집값 {fmtAmt(housePrice * 10_000)} × LTV {ltvPct}%</p>
        </div>
        <div className={`rounded-xl p-4 border ${r.blocker === 'DSR' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500">DSR 기준 한도</p>
            {r.blocker === 'DSR' && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">이쪽이 막힘</span>}
          </div>
          {r.blocked
            ? <p className="text-xl font-bold text-red-500">불가</p>
            : <p className="text-2xl font-extrabold text-gray-800">{fmtAmt(r.dsrLimit)}</p>}
          <p className="text-[10px] text-gray-400 mt-1">소득 월 {Math.round(r.dsrMonthly/10000)}만 – 기존 {existing}만 = {r.available > 0 ? `${Math.round(r.available/10000)}만 가용` : '없음'}</p>
        </div>
      </div>
    </div>
  )
}
