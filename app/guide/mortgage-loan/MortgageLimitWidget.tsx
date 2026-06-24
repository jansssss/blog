'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function MortgageLimitWidget() {
  const [homeValue, setHomeValue] = useState(600_000_000)
  const [income, setIncome] = useState(60_000_000)
  const [existingMonthly, setExistingMonthly] = useState(0)
  const [regulated, setRegulated] = useState(true)
  const [rate, setRate] = useState(4.0)
  const [years, setYears] = useState(30)

  const res = useMemo(() => {
    const ltv = regulated ? 0.7 : 0.8
    const ltvLimit = homeValue * ltv
    const dsrBudget = income * 0.4 / 12 - existingMonthly
    const r = rate / 100 / 12
    const n = years * 12
    const dsrLimit = dsrBudget > 0 && r > 0
      ? dsrBudget * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n))
      : 0
    const actual = dsrLimit > 0 ? Math.min(ltvLimit, dsrLimit) : 0
    const dsr = existingMonthly / (income / 12) * 100
    return { ltvLimit, dsrLimit, actual: Math.max(0, actual), dsr, ltvPct: ltv * 100, binding: dsrLimit < ltvLimit && dsrLimit > 0 ? 'dsr' : 'ltv' }
  }, [homeValue, income, existingMonthly, regulated, rate, years])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">주담대 한도 계산기</p>
          <p className="text-xs text-gray-400">LTV · DSR 동시 계산, 실제 한도 즉시 확인</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {([true, false] as const).map(r => (
          <button key={String(r)} onClick={() => setRegulated(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${regulated === r ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
            {r ? '조정대상지역 (LTV 70%)' : '비규제지역 (LTV 80%)'}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '주택 가격', val: homeValue, set: setHomeValue, min: 100_000_000, max: 2_000_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '연소득', val: income, set: setIncome, min: 20_000_000, max: 300_000_000, step: 5_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '기존 월상환액', val: existingMonthly, set: setExistingMonthly, min: 0, max: 5_000_000, step: 100_000, fmt: (v: number) => v === 0 ? '없음' : `${(v/10000).toLocaleString()}만원` },
          { label: '예상 금리', val: rate, set: setRate, min: 1, max: 10, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '대출기간', val: years, set: setYears, min: 5, max: 40, step: 1, fmt: (v: number) => `${v}년` },
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

      <div className="rounded-2xl p-5 mb-3 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
        <p className="text-indigo-200 text-xs mb-1">실제 대출 한도 (LTV · DSR 중 낮은 값)</p>
        <p className="text-4xl font-bold tracking-tight">{wm(res.actual)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`rounded-xl p-4 bg-white border shadow-sm ${res.binding === 'ltv' ? 'border-indigo-200' : 'border-gray-100'}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">LTV 한도 ({res.ltvPct}%)</p>
          <p className="text-base font-extrabold text-gray-900">{wm(res.ltvLimit)}</p>
        </div>
        <div className={`rounded-xl p-4 bg-white border shadow-sm ${res.binding === 'dsr' ? 'border-amber-300' : 'border-gray-100'}`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">DSR 한도 (40%)</p>
          <p className={`text-base font-extrabold ${res.binding === 'dsr' ? 'text-amber-500' : 'text-gray-900'}`}>
            {res.dsrLimit > 0 ? wm(res.dsrLimit) : '한도 없음'}
          </p>
        </div>
      </div>

      {res.binding === 'dsr' && res.dsrLimit > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
          ⚠️ <strong>DSR이 더 엄격한 제한</strong> — LTV 여유가 있어도 소득 기준에서 막힘. 기존 부채 상환 또는 소득 증가로 해결
        </div>
      )}
    </div>
  )
}
