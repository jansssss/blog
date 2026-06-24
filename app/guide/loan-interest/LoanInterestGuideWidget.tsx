'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

export default function LoanInterestGuideWidget() {
  const [amount, setAmount] = useState(200_000_000)
  const [rate, setRate] = useState(4.5)
  const [years, setYears] = useState(20)
  const [type, setType] = useState<'equal' | 'principal'>('equal')

  const res = useMemo(() => {
    const n = years * 12
    const r = rate / 100 / 12
    const P = amount

    if (type === 'equal') {
      const pmt = r > 0 ? P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1) : P/n
      return { monthly: pmt, totalInterest: pmt * n - P, totalPay: pmt * n, label: '월납입액 (고정)' }
    } else {
      const ppmt = P / n
      let interest = 0
      for (let i = 0; i < n; i++) interest += (P - ppmt * i) * r
      return { monthly: ppmt + P * r, totalInterest: interest, totalPay: P + interest, label: '첫달 납입액' }
    }
  }, [amount, rate, years, type])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">대출이자 계산기</p>
          <p className="text-xs text-gray-400">슬라이더 조작 즉시 계산</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['equal', 'principal'] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${type === t ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
            {t === 'equal' ? '원리금균등' : '원금균등'}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '대출금액', val: amount, set: setAmount, min: 10_000_000, max: 1_000_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원`, h: ['1,000만', '10억'] as [string,string] },
          { label: '연이율', val: rate, set: setRate, min: 1, max: 15, step: 0.1, fmt: (v: number) => `${v.toFixed(1)}%`, h: ['1%', '15%'] as [string,string] },
          { label: '대출기간', val: years, set: setYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v}년`, h: ['1년', '40년'] as [string,string] },
        ]).map(({ label, val, set, min, max, step, fmt, h }) => (
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

      <div className="rounded-2xl p-5 sm:p-6 mb-3 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
        <p className="text-indigo-200 text-xs mb-1">{res.label}</p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight">{wm(res.monthly)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">총 이자</p>
          <p className="text-lg font-extrabold text-red-500">{wm(res.totalInterest)}</p>
        </div>
        <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">총 납입</p>
          <p className="text-lg font-extrabold text-gray-900">{wm(res.totalPay)}</p>
        </div>
      </div>
    </div>
  )
}
