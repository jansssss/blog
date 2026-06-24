'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })
const wm = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

const BANDS = [
  { label: '900~1000점', rate: 4.3 },
  { label: '800~899점',  rate: 5.0 },
  { label: '700~799점',  rate: 6.5 },
  { label: '600~699점',  rate: 8.5 },
]

function calcInterest(P: number, annualRate: number, years: number) {
  const n = years * 12
  const r = annualRate / 100 / 12
  if (r === 0 || n === 0) return 0
  const pmt = P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1)
  return pmt * n - P
}

export default function CreditScoreWidget() {
  const [bandIdx, setBandIdx] = useState(2)
  const [amount, setAmount] = useState(100_000_000)
  const [years, setYears] = useState(10)

  const res = useMemo(() => {
    const my = BANDS[bandIdx]
    const best = BANDS[0]
    const myInterest = calcInterest(amount, my.rate, years)
    const bestInterest = calcInterest(amount, best.rate, years)
    return { myInterest, bestInterest, extra: myInterest - bestInterest, myRate: my.rate, bestRate: best.rate }
  }, [bandIdx, amount, years])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">신용점수별 이자 비교</p>
          <p className="text-xs text-gray-400">내 점수와 최고점수의 이자 차이 즉시 확인</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-gray-600 mb-2">내 신용점수 구간</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BANDS.map((b, i) => (
            <button key={i} onClick={() => setBandIdx(i)}
              className={`py-2 rounded-xl text-xs font-medium transition-colors ${bandIdx === i ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-200'}`}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {([
          { label: '대출금액', val: amount, set: setAmount, min: 10_000_000, max: 500_000_000, step: 10_000_000, fmt: (v: number) => `${(v/10000).toLocaleString()}만원`, h: ['1,000만', '5억'] as [string,string] },
          { label: '대출기간', val: years, set: setYears, min: 1, max: 30, step: 1, fmt: (v: number) => `${v}년`, h: ['1년', '30년'] as [string,string] },
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

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-1">내 점수 총이자 ({res.myRate}%)</p>
          <p className="text-xl font-extrabold">{wm(res.myInterest)}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">900점대 총이자 ({res.bestRate}%)</p>
          <p className="text-xl font-extrabold text-emerald-600">{wm(res.bestInterest)}</p>
        </div>
      </div>

      {res.extra > 100 && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-800">
          점수 관리로 아낄 수 있는 이자: <strong>{wm(res.extra)}</strong> ({years}년 기준, 900점대 대비)
        </div>
      )}
    </div>
  )
}
