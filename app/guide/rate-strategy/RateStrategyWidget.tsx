'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function RateStrategyWidget() {
  const [balance, setBalance] = useState(300_000_000)
  const [curRate, setCurRate] = useState(5.0)
  const [newRate, setNewRate] = useState(3.8)
  const [remainYears, setRemainYears] = useState(20)
  const [feeRate, setFeeRate] = useState(1.0)

  const res = useMemo(() => {
    const n = remainYears * 12
    const rC = curRate / 100 / 12
    const rN = newRate / 100 / 12
    const pmtCur = rC > 0 ? balance * rC * Math.pow(1+rC,n) / (Math.pow(1+rC,n)-1) : balance/n
    const pmtNew = rN > 0 ? balance * rN * Math.pow(1+rN,n) / (Math.pow(1+rN,n)-1) : balance/n
    const totalFee = balance * feeRate / 100
    const monthlySavings = pmtCur - pmtNew
    const totalSavings = monthlySavings * n - totalFee
    const breakEven = monthlySavings > 0 ? Math.ceil(totalFee / monthlySavings) : Infinity
    return { pmtCur, pmtNew, monthlySavings, totalFee, totalSavings, breakEven }
  }, [balance, curRate, newRate, remainYears, feeRate])

  const rateDiff = curRate - newRate
  const isWorth = rateDiff > 0 && res.totalSavings > 0 && res.breakEven !== Infinity && res.breakEven < remainYears * 12

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">대환대출 손익 계산기</p>
          <p className="text-xs text-gray-400">갈아타기 수수료 vs 절감액 손익분기 즉시 계산</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '현재 잔액', val: balance, set: setBalance, min: 10_000_000, max: 1_000_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '현재 금리', val: curRate, set: setCurRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '갈아타기 후 금리', val: newRate, set: setNewRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '잔여 기간', val: remainYears, set: setRemainYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v}년` },
          { label: '중도상환수수료율', val: feeRate, set: setFeeRate, min: 0, max: 2, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
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

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-1">월 절감액</p>
          <p className={`text-base font-extrabold ${res.monthlySavings < 0 ? 'text-red-300' : ''}`}>{wm(Math.abs(res.monthlySavings))}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">수수료</p>
          <p className="text-base font-extrabold text-gray-900">{wm(res.totalFee)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">손익분기</p>
          <p className="text-base font-extrabold text-gray-900">
            {res.breakEven === Infinity ? '불가' : `${res.breakEven}개월`}
          </p>
        </div>
      </div>

      <div className={`rounded-xl p-3 text-xs font-semibold border ${
        rateDiff <= 0 ? 'bg-gray-50 border-gray-200 text-gray-600'
        : isWorth ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
        : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
        {rateDiff <= 0 ? '⚠️ 현재 금리가 더 낮음 — 갈아타기 의미 없음'
          : isWorth ? `✅ 갈아타기 유리 — ${res.breakEven}개월 후 본전, 잔여기간 총 ${wm(res.totalSavings)} 절약`
          : `⚠️ 잔여기간 내 손익분기 달성 어려움 — 수수료 면제 시점 이후 재검토 추천`}
      </div>
    </div>
  )
}
