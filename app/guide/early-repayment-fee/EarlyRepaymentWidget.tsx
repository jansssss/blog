'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function EarlyRepaymentWidget() {
  const [balance, setBalance] = useState(200_000_000)
  const [totalYears, setTotalYears] = useState(30)
  const [elapsedYears, setElapsedYears] = useState(2)
  const [feeRate, setFeeRate] = useState(1.2)
  const [curRate, setCurRate] = useState(4.8)
  const [newRate, setNewRate] = useState(3.8)

  const res = useMemo(() => {
    const total = totalYears * 12
    const elapsed = Math.min(elapsedYears * 12, total - 1)
    const remaining = total - elapsed

    const fee = balance * (feeRate / 100) * (remaining / total)

    const rC = curRate / 100 / 12
    const rN = newRate / 100 / 12
    const pmtCur = rC > 0 ? balance * rC * Math.pow(1+rC,remaining) / (Math.pow(1+rC,remaining)-1) : balance/remaining
    const pmtNew = rN > 0 ? balance * rN * Math.pow(1+rN,remaining) / (Math.pow(1+rN,remaining)-1) : balance/remaining
    const monthly = pmtCur - pmtNew
    const totalSavings = monthly * remaining - fee
    const breakEven = monthly > 0 ? Math.ceil(fee / monthly) : Infinity

    return { fee, monthly, totalSavings, breakEven, remaining }
  }, [balance, totalYears, elapsedYears, feeRate, curRate, newRate])

  const isWorth = res.breakEven !== Infinity && res.breakEven < res.remaining && res.totalSavings > 0

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">중도상환 손익 계산기</p>
          <p className="text-xs text-gray-400">수수료 vs 갈아타기 절감액 즉시 비교</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '대출 잔액', val: balance, set: setBalance, min: 10_000_000, max: 1_000_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원` },
          { label: '총 대출기간', val: totalYears, set: setTotalYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v}년` },
          { label: '경과기간', val: elapsedYears, set: setElapsedYears, min: 0, max: totalYears - 1, step: 1, fmt: (v: number) => `${v}년` },
          { label: '중도상환수수료율', val: feeRate, set: setFeeRate, min: 0, max: 2, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '현재 금리', val: curRate, set: setCurRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: '갈아타기 후 금리', val: newRate, set: setNewRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%` },
        ] as const).map(({ label, val, set, min, max, step, fmt }) => (
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
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-1">중도상환수수료</p>
          <p className="text-base font-extrabold">{wm(res.fee)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">월 절감액</p>
          <p className={`text-base font-extrabold ${res.monthly > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{wm(Math.abs(res.monthly))}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">손익분기</p>
          <p className="text-base font-extrabold text-gray-900">
            {res.breakEven === Infinity ? '불가' : `${res.breakEven}개월`}
          </p>
        </div>
      </div>

      <div className={`rounded-xl p-3 text-xs font-semibold border ${isWorth ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
        {isWorth
          ? `✅ 갈아타기 유리 — ${res.breakEven}개월 후부터 절감 시작, 잔여기간 총 ${wm(res.totalSavings)} 절약`
          : curRate <= newRate
            ? '⚠️ 현재 금리가 갈아타기 금리보다 낮거나 같음 — 갈아타기 불필요'
            : `⚠️ 잔여기간(${Math.round(res.remaining/12)}년) 내 손익분기 달성 어려움 — 수수료 면제 후 재검토`}
      </div>
    </div>
  )
}
