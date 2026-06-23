'use client'
import { useState, useMemo } from 'react'

function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
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
        className="w-full h-2 rounded-full appearance-none cursor-pointer rc-guide-slider"
        style={{ background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${pct}%,#c7d2fe ${pct}%,#c7d2fe 100%)` }} />
      {hints && (
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{hints[0]}</span><span>{hints[1]}</span>
        </div>
      )}
    </div>
  )
}

export default function RateCompareWidget() {
  const [loanAmt, setLoanAmt]   = useState(30000)  // 만원 (3억)
  const [rateAX10, setRateAX10] = useState(40)     // 4.0%
  const [rateBX10, setRateBX10] = useState(45)     // 4.5%
  const [years, setYears]       = useState(30)

  const r = useMemo(() => {
    const loan     = loanAmt * 10_000
    const months   = years * 12
    const rateA    = rateAX10 / 10
    const rateB    = rateBX10 / 10
    const mA       = pmt(loan, rateA, months)
    const mB       = pmt(loan, rateB, months)
    const totalA   = mA * months - loan
    const totalB   = mB * months - loan
    const mDiff    = Math.abs(mB - mA)
    const tDiff    = Math.abs(totalB - totalA)
    const lower    = rateAX10 <= rateBX10 ? 'A' : 'B'
    const rateDiff = Math.abs((rateBX10 - rateAX10) / 10).toFixed(1)
    return { mA, mB, totalA, totalB, mDiff, tDiff, lower, rateDiff, loan }
  }, [loanAmt, rateAX10, rateBX10, years])

  const lowerLabel = r.lower === 'A' ? `${(rateAX10 / 10).toFixed(1)}%` : `${(rateBX10 / 10).toFixed(1)}%`
  const higherLabel = r.lower === 'A' ? `${(rateBX10 / 10).toFixed(1)}%` : `${(rateAX10 / 10).toFixed(1)}%`

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 my-8 not-prose">
      <style>{`
        .rc-guide-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
        .rc-guide-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>

      <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-4">
        ⚡ 금리 차이 실시간 비교
      </div>

      <div className="space-y-5 mb-6">
        <Slider label="대출 금액" value={loanAmt} min={5000} max={100000} step={1000}
          display={fmtAmt(loanAmt * 10_000)} onChange={setLoanAmt} hints={['5,000만원', '10억']} />

        {/* 금리 A/B 나란히 */}
        <div className="grid grid-cols-2 gap-4">
          <Slider label="금리 A" value={rateAX10} min={20} max={100} step={1}
            display={`${(rateAX10 / 10).toFixed(1)}%`} onChange={setRateAX10} hints={['2.0%', '10.0%']} />
          <Slider label="금리 B" value={rateBX10} min={20} max={100} step={1}
            display={`${(rateBX10 / 10).toFixed(1)}%`} onChange={setRateBX10} hints={['2.0%', '10.0%']} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">상환기간</p>
          <div className="flex gap-2">
            {[10, 20, 30].map(y => (
              <button key={y} onClick={() => setYears(y)}
                className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-colors ${years === y ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                {y}년
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 총이자 차이 히어로 */}
      <div className="rounded-2xl p-5 sm:p-6 text-white mb-3"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
        <p className="text-indigo-200 text-xs mb-1">
          금리 {r.rateDiff}%p 차이로 {years}년 총이자 차이
        </p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight">{fmtAmt(r.tDiff)}</p>
        <p className="text-indigo-200 text-sm mt-2">
          {lowerLabel} 선택 시 {higherLabel} 대비 <strong>{fmtAmt(r.tDiff)}</strong> 절감, 매달 <strong>{fmt(r.mDiff)}원</strong> 더 적게 납부
        </p>
      </div>

      {/* A vs B 비교 카드 */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`rounded-xl p-4 border shadow-sm ${rateAX10 <= rateBX10 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs font-bold text-gray-500 mb-2">금리 A — {(rateAX10/10).toFixed(1)}%</p>
          <p className="text-xl font-extrabold text-gray-800">{fmt(r.mA)}원/월</p>
          <p className="text-xs text-gray-400 mt-1">{years}년 총이자 {fmtAmt(r.totalA)}</p>
          {rateAX10 <= rateBX10 && (
            <span className="inline-block mt-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">더 유리</span>
          )}
        </div>
        <div className={`rounded-xl p-4 border shadow-sm ${rateBX10 < rateAX10 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs font-bold text-gray-500 mb-2">금리 B — {(rateBX10/10).toFixed(1)}%</p>
          <p className="text-xl font-extrabold text-gray-800">{fmt(r.mB)}원/월</p>
          <p className="text-xs text-gray-400 mt-1">{years}년 총이자 {fmtAmt(r.totalB)}</p>
          {rateBX10 < rateAX10 && (
            <span className="inline-block mt-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">더 유리</span>
          )}
        </div>
      </div>

      {rateAX10 === rateBX10 && (
        <p className="mt-3 text-xs text-gray-400 text-center">금리 A와 B가 같습니다. 슬라이더로 차이를 만들어보세요.</p>
      )}
    </div>
  )
}
