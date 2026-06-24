'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function RepaymentTypesWidget() {
  const [amount, setAmount] = useState(200_000_000)
  const [rate, setRate] = useState(4.5)
  const [years, setYears] = useState(20)

  const res = useMemo(() => {
    const n = years * 12
    const r = rate / 100 / 12
    const P = amount

    const pmt = r > 0 ? P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1) : P/n
    const equInterest = pmt * n - P

    const ppmt = P / n
    let prinInterest = 0
    for (let i = 0; i < n; i++) prinInterest += (P - ppmt * i) * r
    const firstMonth = ppmt + P * r

    const bulletMonthly = P * r
    const bulletInterest = bulletMonthly * n

    return { pmt, equInterest, prinInterest, firstMonth, bulletMonthly, bulletInterest }
  }, [amount, rate, years])

  const savings = Math.round((res.equInterest - res.prinInterest) / 10000)
  const bulletExtra = Math.round((res.bulletInterest - res.equInterest) / 10000)

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">상환방식 비교 계산기</p>
          <p className="text-xs text-gray-400">슬라이더 조작 즉시 3가지 방식 동시 비교</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '대출금액', val: amount, set: setAmount, min: 10_000_000, max: 1_000_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원`, h: ['1,000만', '10억'] },
          { label: '연이율', val: rate, set: setRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%`, h: ['1%', '15%'] },
          { label: '대출기간', val: years, set: setYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v}년`, h: ['1년', '40년'] },
        ] as const).map(({ label, val, set, min, max, step, fmt, h }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600">{label}</span>
              <span className="text-xs font-bold text-indigo-700">{fmt(val)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(Number(e.target.value))} style={tr(val, min, max)} className={S} />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>{h[0]}</span><span>{h[1]}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div className="rounded-xl p-3 sm:p-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-2">원리금균등</p>
          <p className="text-[10px] text-indigo-200 mb-0.5">매월 (고정)</p>
          <p className="text-sm font-extrabold">{wm(res.pmt)}</p>
          <p className="text-[10px] text-indigo-200 mt-2 mb-0.5">총이자</p>
          <p className="text-sm font-bold">{wm(res.equInterest)}</p>
        </div>
        <div className="rounded-xl p-3 sm:p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">원금균등</p>
          <p className="text-[10px] text-gray-400 mb-0.5">첫달 납입</p>
          <p className="text-sm font-extrabold text-gray-900">{wm(res.firstMonth)}</p>
          <p className="text-[10px] text-gray-400 mt-2 mb-0.5">총이자</p>
          <p className="text-sm font-bold text-emerald-600">{wm(res.prinInterest)}</p>
        </div>
        <div className="rounded-xl p-3 sm:p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">만기일시</p>
          <p className="text-[10px] text-gray-400 mb-0.5">매월 이자</p>
          <p className="text-sm font-extrabold text-gray-900">{wm(res.bulletMonthly)}</p>
          <p className="text-[10px] text-gray-400 mt-2 mb-0.5">총이자</p>
          <p className="text-sm font-bold text-red-500">{wm(res.bulletInterest)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 space-y-1">
        <p>• 원금균등이 원리금균등보다 총이자 <strong>{savings}만원</strong> 절약</p>
        <p>• 만기일시는 원리금균등보다 총이자 <strong>{bulletExtra}만원</strong> 더 많음</p>
      </div>
    </div>
  )
}
