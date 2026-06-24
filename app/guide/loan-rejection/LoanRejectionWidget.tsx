'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function LoanRejectionWidget() {
  const [income, setIncome] = useState(50_000_000)
  const [existing, setExisting] = useState(1_000_000)
  const [rate, setRate] = useState(5.0)
  const [years, setYears] = useState(20)

  const res = useMemo(() => {
    const monthlyIncome = income / 12
    const currentDsr = (existing / monthlyIncome) * 100
    const dsrBudget = monthlyIncome * 0.4 - existing
    const r = rate / 100 / 12
    const n = years * 12
    const maxLoan = dsrBudget > 0 && r > 0
      ? dsrBudget * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n))
      : 0
    const headroom = Math.max(0, 40 - currentDsr)
    return { currentDsr, maxLoan: Math.max(0, maxLoan), headroom }
  }, [income, existing, rate, years])

  const statusCls =
    res.currentDsr <= 20 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
    res.currentDsr <= 30 ? 'bg-blue-50 border-blue-100 text-blue-800' :
    res.currentDsr <= 40 ? 'bg-amber-50 border-amber-100 text-amber-800' :
    'bg-red-50 border-red-100 text-red-800'

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">DSR 자가진단 · 추가대출 한도</p>
          <p className="text-xs text-gray-400">현재 DSR과 추가로 빌릴 수 있는 최대 금액 즉시 확인</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '연소득', val: income, set: setIncome, min: 20_000_000, max: 200_000_000, step: 5_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '현재 월상환액 (전체)', val: existing, set: setExisting, min: 0, max: 5_000_000, step: 100_000, fmt: (v: number) => v === 0 ? '없음' : `${(v/10000).toLocaleString()}만원` },
          { label: '추가 대출 금리', val: rate, set: setRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '추가 대출 기간', val: years, set: setYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v}년` },
        ]).map(({ label, val, set, min, max, step, fmt }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600">{label}</span>
              <span className="text-xs font-bold text-indigo-700">{fmt(val)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(Number(e.target.value))} style={tr(val, min, max)} className={S} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-1">현재 DSR</p>
          <p className="text-2xl font-extrabold">{res.currentDsr.toFixed(1)}%</p>
          <p className="text-[10px] text-indigo-200 mt-1">DSR 여유 {res.headroom.toFixed(1)}%p</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">추가 대출 최대 한도</p>
          <p className="text-xl font-extrabold text-gray-900">{wm(res.maxLoan)}</p>
          <p className="text-[10px] text-gray-400 mt-1">DSR 40% 기준</p>
        </div>
      </div>

      <div className={`rounded-xl p-3 text-xs font-semibold border ${statusCls}`}>
        {res.currentDsr <= 20 ? `✅ DSR 여유 충분 — 추가 대출 최대 ${wm(res.maxLoan)} 가능` :
         res.currentDsr <= 30 ? `✅ DSR 양호 — 추가 대출 최대 ${wm(res.maxLoan)}` :
         res.currentDsr <= 40 ? `⚠️ DSR ${res.currentDsr.toFixed(1)}% — 추가 한도 ${wm(res.maxLoan)}으로 제한` :
         `❌ DSR ${res.currentDsr.toFixed(1)}% 초과 — 기존 부채 상환 후 재신청 필요`}
      </div>
    </div>
  )
}
