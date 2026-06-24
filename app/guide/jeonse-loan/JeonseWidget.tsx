'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

type LoanType = 'bumok' | 'hf' | 'bank'
const TYPES: { id: LoanType; label: string; rate: number; maxSeoul: number | null; maxRegion: number | null }[] = [
  { id: 'bumok', label: '버팀목', rate: 2.1, maxSeoul: 300_000_000, maxRegion: 200_000_000 },
  { id: 'hf',    label: 'HF 전세', rate: 3.8, maxSeoul: 220_000_000, maxRegion: 180_000_000 },
  { id: 'bank',  label: '시중은행', rate: 4.5, maxSeoul: null, maxRegion: null },
]

export default function JeonseWidget() {
  const [deposit, setDeposit] = useState(300_000_000)
  const [income, setIncome] = useState(50_000_000)
  const [existing, setExisting] = useState(0)
  const [isSeoul, setIsSeoul] = useState(true)
  const [typeId, setTypeId] = useState<LoanType>('bumok')

  const res = useMemo(() => {
    const t = TYPES.find(x => x.id === typeId)!
    const ltvBase = deposit * 0.8
    const typeMax = isSeoul ? t.maxSeoul : t.maxRegion
    const ltvLimit = typeMax !== null ? Math.min(ltvBase, typeMax) : ltvBase

    const dsrBudget = income * 0.4 / 12 - existing
    const r = t.rate / 100 / 12
    const dsrLimit = dsrBudget > 0 ? dsrBudget / r : Infinity

    const actual = Math.max(0, Math.min(ltvLimit, dsrLimit))
    const monthlyInterest = actual * r

    return { actual, monthlyInterest, rate: t.rate, ltvLimit }
  }, [deposit, income, existing, isSeoul, typeId])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">전세대출 한도 계산기</p>
          <p className="text-xs text-gray-400">LTV 80% + DSR 40% 기준 즉시 계산</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => setTypeId(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${typeId === t.id ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
            {t.label} ({t.rate}%)
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {([true, false] as const).map(s => (
            <button key={String(s)} onClick={() => setIsSeoul(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isSeoul === s ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
              {s ? '수도권' : '지방'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '전세보증금', val: deposit, set: setDeposit, min: 50_000_000, max: 1_500_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '연소득', val: income, set: setIncome, min: 20_000_000, max: 200_000_000, step: 5_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '기존 월상환액', val: existing, set: setExisting, min: 0, max: 3_000_000, step: 50_000, fmt: (v: number) => v === 0 ? '없음' : `${(v/10000).toLocaleString()}만원` },
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
        <p className="text-indigo-200 text-xs mb-1">전세대출 한도</p>
        <p className="text-4xl font-bold tracking-tight">{wm(res.actual)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">월 이자 ({res.rate}%)</p>
          <p className="text-base font-extrabold text-gray-900">{wm(res.monthlyInterest)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">LTV 기준 한도 (80%)</p>
          <p className="text-base font-extrabold text-gray-900">{wm(res.ltvLimit)}</p>
        </div>
      </div>
    </div>
  )
}
