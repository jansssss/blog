'use client'
import { useState, useMemo } from 'react'

function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

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
        className="w-full h-2 rounded-full appearance-none cursor-pointer ms-guide-slider"
        style={{ background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${pct}%,#c7d2fe ${pct}%,#c7d2fe 100%)` }} />
      {hints && (
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{hints[0]}</span><span>{hints[1]}</span>
        </div>
      )}
    </div>
  )
}

export default function MortgageCalcWidget() {
  const [salary, setSalary]   = useState(5000)  // 만원
  const [existing, setExisting] = useState(90)  // 만원/월
  const [rateX10, setRateX10] = useState(40)
  const [years, setYears]     = useState(30)

  const r = useMemo(() => {
    const salaryWon  = salary * 10_000
    const existWon   = existing * 10_000
    const dsrLimit   = salaryWon * 0.4 / 12
    const available  = Math.max(0, dsrLimit - existWon)
    const rate       = rateX10 / 10
    const months     = years * 12
    const withDebt   = Math.max(0, maxLoan(available, rate, months))
    const noDebt     = maxLoan(dsrLimit, rate, months)
    const reduction  = noDebt - withDebt
    const blocked    = available <= 0
    return { dsrLimit, available, withDebt, noDebt, reduction, blocked }
  }, [salary, existing, rateX10, years])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 my-8 not-prose">
      <style>{`
        .ms-guide-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
        .ms-guide-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>

      <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-4">
        ⚡ 슬라이더 조작 즉시 계산
      </div>

      <div className="space-y-5 mb-6">
        <Slider label="연 소득" value={salary} min={2000} max={15000} step={100}
          display={`${fmt(salary)}만원`} onChange={setSalary} hints={['2,000만원', '1억 5,000만원']} />
        <Slider label="기존 대출 월 납입 합계" value={existing} min={0} max={200} step={5}
          display={existing === 0 ? '없음' : `월 ${existing}만원`} onChange={setExisting} hints={['없음', '200만원']} />
        <Slider label="신규 금리" value={rateX10} min={25} max={80} step={1}
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

      {/* 히어로 결과 */}
      <div className="rounded-2xl p-5 sm:p-6 text-white mb-3"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
        <p className="text-indigo-200 text-xs mb-1">
          내 주담대 최대 한도 ({(rateX10 / 10).toFixed(1)}%, {years}년 기준)
        </p>
        {r.blocked
          ? <p className="text-xl font-bold text-red-300">기존 부채가 DSR 한도 초과 → 주담대 불가</p>
          : <p className="text-4xl sm:text-5xl font-bold tracking-tight">{fmtAmt(r.withDebt)}</p>}
      </div>

      {/* KPI 3칸 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">DSR 월 한도</p>
          <p className="text-sm font-extrabold text-gray-800 leading-tight">
            {Math.round(r.dsrLimit / 10000)}만원
          </p>
          <p className="text-[9px] text-gray-400 mt-0.5">소득 × 40% ÷ 12</p>
        </div>
        <div className={`rounded-xl p-3 border shadow-sm ${r.blocked ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">주담대 가용</p>
          <p className={`text-sm font-extrabold leading-tight ${r.blocked ? 'text-red-500' : 'text-gray-800'}`}>
            {r.blocked ? '없음' : `${Math.round(r.available / 10000)}만원`}
          </p>
          <p className="text-[9px] text-gray-400 mt-0.5">한도 – 기존 납입</p>
        </div>
        <div className={`rounded-xl p-3 border shadow-sm ${existing > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">부채 없을 때</p>
          <p className={`text-sm font-extrabold leading-tight ${existing > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {fmtAmt(r.noDebt)}
          </p>
          {existing > 0 && (
            <p className="text-[9px] text-red-500 mt-0.5 font-medium">– {fmtAmt(r.reduction)} 감소</p>
          )}
        </div>
      </div>

      {/* 해석 메시지 */}
      {existing > 0 && !r.blocked && (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          기존 대출 월 {existing}만원이 DSR을 차지해 주담대 한도가 <strong>{fmtAmt(r.reduction)}</strong> 줄어든 상태입니다.
          기존 대출을 모두 상환하면 <strong>{fmtAmt(r.noDebt)}</strong>까지 빌릴 수 있습니다.
        </div>
      )}
    </div>
  )
}
