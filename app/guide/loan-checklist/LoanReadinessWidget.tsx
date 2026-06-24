'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function LoanReadinessWidget() {
  const [income, setIncome] = useState(60_000_000)
  const [existing, setExisting] = useState(500_000)
  const [wantAmount, setWantAmount] = useState(300_000_000)
  const [wantRate, setWantRate] = useState(4.5)
  const [wantYears, setWantYears] = useState(20)

  const res = useMemo(() => {
    const monthlyIncome = income / 12
    const r = wantRate / 100 / 12
    const n = wantYears * 12
    const newPmt = r > 0 ? wantAmount * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1) : wantAmount/n
    const afterDsr = ((existing + newPmt) / monthlyIncome) * 100
    const currentDsr = (existing / monthlyIncome) * 100
    const dsrBudget = monthlyIncome * 0.4 - existing
    const maxLoan = dsrBudget > 0 && r > 0
      ? dsrBudget * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n))
      : 0

    return { afterDsr, currentDsr, newPmt, maxLoan: Math.max(0, maxLoan), feasible: afterDsr <= 40 }
  }, [income, existing, wantAmount, wantRate, wantYears])

  const color = res.afterDsr <= 30 ? { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800' }
    : res.afterDsr <= 40 ? { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800' }
    : { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800' }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">대출 가능성 진단기</p>
          <p className="text-xs text-gray-400">DSR 기준 실제 가능 여부 + 최대 한도 즉시 확인</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '연소득', val: income, set: setIncome, min: 20_000_000, max: 300_000_000, step: 5_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '기존 월상환액', val: existing, set: setExisting, min: 0, max: 5_000_000, step: 100_000, fmt: (v: number) => v === 0 ? '없음' : `${(v/10000).toLocaleString()}만원` },
          { label: '희망 대출금액', val: wantAmount, set: setWantAmount, min: 10_000_000, max: 1_000_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '예상 금리', val: wantRate, set: setWantRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '대출기간', val: wantYears, set: setWantYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v}년` },
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
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-1">추가 후 DSR</p>
          <p className="text-2xl font-extrabold">{res.afterDsr.toFixed(1)}%</p>
          <p className="text-[10px] text-indigo-200 mt-1">한도 40%</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">DSR 기준 최대 한도</p>
          <p className="text-xl font-extrabold text-gray-900">{wm(res.maxLoan)}</p>
        </div>
      </div>

      <div className={`rounded-xl p-3 text-xs font-semibold border ${color.bg} ${color.border} ${color.text}`}>
        {res.afterDsr <= 30 ? '✅ DSR 여유 충분 — 은행 심사 통과 가능성 높음'
          : res.afterDsr <= 40 ? `⚠️ DSR ${res.afterDsr.toFixed(1)}% — 한도 내 승인 가능, 추가 부채 여유 없음`
          : `❌ DSR ${res.afterDsr.toFixed(1)}% 초과 — 현재 조건으로 대출 불가. 최대 ${wm(res.maxLoan)} 이하로 조정 필요`}
      </div>
    </div>
  )
}
