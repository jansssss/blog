'use client'
import { useMemo, useState } from 'react'

const S = "w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"
const tr = (v: number, mn: number, mx: number) => ({ background: `linear-gradient(to right, #6366f1 ${((v-mn)/(mx-mn))*100}%, #c7d2fe ${((v-mn)/(mx-mn))*100}%)` })

type Agency = 'hug' | 'hf' | 'sgi'
const AGENCIES: { id: Agency; label: string; rate: number; desc: string }[] = [
  { id: 'hug', label: 'HUG (주택도시보증공사)', rate: 0.04, desc: '전세보증금반환보증 전문, 가장 저렴' },
  { id: 'hf',  label: 'HF (주택금융공사)',      rate: 0.07, desc: '버팀목·정책금융 연계, 무주택 우대' },
  { id: 'sgi', label: 'SGI (서울보증보험)',      rate: 0.15, desc: '소득 제한 없음, 고소득자·비해당자 활용' },
]

export default function GuaranteeFeeWidget() {
  const [amount, setAmount] = useState(300_000_000)
  const [agencyId, setAgencyId] = useState<Agency>('hug')
  const [period, setPeriod] = useState(2)

  const res = useMemo(() => {
    const agency = AGENCIES.find(a => a.id === agencyId)!
    const annualFee = amount * (agency.rate / 100)
    const totalFee = annualFee * period
    return { annualFee, totalFee, rate: agency.rate }
  }, [amount, agencyId, period])

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">보증료 계산기</p>
          <p className="text-xs text-gray-400">기관·금액·기간별 보증료 즉시 계산</p>
        </div>
      </div>

      <div className="mb-5 space-y-2">
        <p className="text-xs text-gray-600 mb-2">보증 기관 선택</p>
        {AGENCIES.map(a => (
          <button key={a.id} onClick={() => setAgencyId(a.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-colors ${agencyId === a.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-200'}`}>
            <span className="font-bold">{a.label}</span>
            <span className={`ml-2 font-semibold ${agencyId === a.id ? 'text-indigo-200' : 'text-indigo-600'}`}>연 {a.rate}%</span>
            <p className={`text-[10px] mt-0.5 ${agencyId === a.id ? 'text-indigo-200' : 'text-gray-400'}`}>{a.desc}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">보증금액</span>
            <span className="text-xs font-bold text-indigo-700">{(amount/10000).toLocaleString()}만원</span>
          </div>
          <input type="range" min={10_000_000} max={1_000_000_000} step={10_000_000} value={amount}
            onChange={e => setAmount(Number(e.target.value))} style={tr(amount, 10_000_000, 1_000_000_000)} className={S} />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1,000만</span><span>10억</span></div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">보증 기간</span>
            <span className="text-xs font-bold text-indigo-700">{period}년</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={period}
            onChange={e => setPeriod(Number(e.target.value))} style={tr(period, 1, 5)} className={S} />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1년</span><span>5년</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 mb-1">총 보증료 ({period}년)</p>
          <p className="text-xl font-extrabold">{Math.round(res.totalFee).toLocaleString()}원</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">연 보증료 (연 {res.rate}%)</p>
          <p className="text-xl font-extrabold text-gray-900">{Math.round(res.annualFee).toLocaleString()}원</p>
        </div>
      </div>
    </div>
  )
}
