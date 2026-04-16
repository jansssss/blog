'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import DisclaimerNotice from '@/components/DisclaimerNotice'

/* ─── 유틸 ─────────────────────────────────────────────────── */
function fmt(v: number) {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`
  if (v >= 10_000) return `${Math.round(v / 10_000)}만`
  return v.toLocaleString()
}
function fmtWon(v: number) {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(2)}억원`
  if (v >= 10_000) return `${Math.round(v / 10_000).toLocaleString()}만원`
  return `${Math.round(v).toLocaleString()}원`
}

/* ─── 상각 계산 ─────────────────────────────────────────────── */
function calcPayment(principal: number, annualRate: number, months: number, method: 'equal' | 'principal') {
  const r = annualRate / 12 / 100
  if (method === 'equal') {
    if (r === 0) return { monthly: principal / months, totalInterest: 0 }
    const M = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    return { monthly: M, totalInterest: M * months - principal }
  } else {
    const principalPay = principal / months
    const firstInterest = principal * r
    const totalInterest = (principal * r * (months + 1)) / 2
    return { monthly: principalPay + firstInterest, totalInterest }
  }
}

/* ─── 슬라이더 ──────────────────────────────────────────────── */
function SliderInput({
  label, value, min, max, step, onChange, displayValue,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; displayValue: string;
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-indigo-700 font-bold text-base">{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="slider-light w-full h-2 rounded-full cursor-pointer appearance-none"
        style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${pct}%, #c7d2fe ${pct}%, #c7d2fe 100%)` }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  )
}

/* ─── 커스텀 툴팁 ───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p style={{ color: payload[0].fill }} className="font-bold">월 상환액: {fmtWon(payload[0].value)}</p>
    </div>
  )
}

/* ─── 프리셋 ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: '🏠 주담대 30년', amount: 300_000_000, rate: 4.2, period: 360 },
  { label: '💳 신용대출 5년', amount: 30_000_000, rate: 6.5, period: 60 },
  { label: '🏢 사업자 10년', amount: 100_000_000, rate: 5.5, period: 120 },
]

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function RateChangeImpactCalculatorPage() {
  const [amount, setAmount]   = useState(300_000_000)
  const [rate,   setRate]     = useState(4.2)
  const [period, setPeriod]   = useState(360)
  const [method, setMethod]   = useState<'equal' | 'principal'>('equal')

  const scenarios = useMemo(() => {
    return [-1, 0, 1].map(delta => {
      const r = Math.max(0.1, rate + delta)
      const { monthly, totalInterest } = calcPayment(amount, r, period, method)
      return { label: delta === 0 ? '현재 금리' : delta > 0 ? `+${delta}%p` : `${delta}%p`, rate: r, monthly, totalInterest, delta }
    })
  }, [amount, rate, period, method])

  const base = scenarios[1] // current

  const chartData = scenarios.map(s => ({
    name: s.label,
    value: Math.round(s.monthly),
    fill: s.delta < 0 ? '#10b981' : s.delta === 0 ? '#6366f1' : '#ef4444',
  }))

  const applyPreset = (p: typeof PRESETS[0]) => {
    setAmount(p.amount); setRate(p.rate); setPeriod(p.period)
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* ── 헤더 ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">금리 변동 영향 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          금리가 ±1%p 변동할 때 월 상환액과 총 이자 변화를 즉시 비교합니다
        </p>
      </div>

      {/* ── 2컬럼 ── */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">

        {/* ── 입력 패널 ── */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 lg:mb-0">
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                  {p.label}
                </button>
              ))}
            </div>
            <div className="space-y-7">
              <SliderInput label="대출 금액" value={amount} min={1_000_000} max={1_000_000_000} step={1_000_000}
                onChange={setAmount} displayValue={fmtWon(amount)} />
              <SliderInput label="현재 연 금리" value={rate} min={1} max={20} step={0.1}
                onChange={setRate} displayValue={`${rate.toFixed(1)}%`} />
              <SliderInput label="대출 기간" value={period} min={12} max={360} step={12}
                onChange={setPeriod} displayValue={`${period / 12}년 (${period}개월)`} />

              {/* 상환 방식 토글 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">상환 방식</span>
                </div>
                <div className="flex gap-2">
                  {(['equal', 'principal'] as const).map(m => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        method === m
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      }`}>
                      {m === 'equal' ? '원리금균등' : '원금균등'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {method === 'equal' ? '매월 동일한 금액 상환' : '원금 고정, 이자 점차 감소'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="space-y-5 mt-8 lg:mt-0">

          {/* 히어로: 현재 금리 기준 월 상환액 */}
          <div className="rounded-2xl p-6 sm:p-8 text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
            <p className="text-indigo-200 text-sm mb-1">현재 금리 {rate.toFixed(1)}% 기준 월 상환액</p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-1">{fmtWon(base.monthly)}</p>
            <p className="text-indigo-300 text-xs mt-3">
              {method === 'equal' ? '원리금균등' : '원금균등 (첫 달 기준)'}
              &nbsp;·&nbsp; 총 이자 {fmtWon(base.totalInterest)}
            </p>
          </div>

          {/* KPI 3개 시나리오 */}
          <div className="grid grid-cols-3 gap-3">
            {scenarios.map(s => (
              <div key={s.label} className={`rounded-xl p-4 border ${
                s.delta < 0 ? 'bg-emerald-50 border-emerald-100' :
                s.delta === 0 ? 'bg-indigo-50 border-indigo-100' :
                'bg-red-50 border-red-100'
              }`}>
                <p className={`text-xs mb-1 font-semibold ${
                  s.delta < 0 ? 'text-emerald-600' : s.delta === 0 ? 'text-indigo-600' : 'text-red-500'
                }`}>{s.label} ({s.rate.toFixed(1)}%)</p>
                <p className={`text-sm font-bold leading-tight ${
                  s.delta < 0 ? 'text-emerald-800' : s.delta === 0 ? 'text-indigo-800' : 'text-red-700'
                }`}>{fmtWon(s.monthly)}</p>
                {s.delta !== 0 && (
                  <p className={`text-[11px] mt-1 ${s.delta > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {s.delta > 0 ? '+' : ''}{fmtWon(s.monthly - base.monthly)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 바 차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-1">월 상환액 시나리오 비교</h3>
            <p className="text-xs text-gray-400 mb-4">금리 변동에 따른 월 부담 차이</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmt(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <ReferenceLine y={base.monthly} stroke="#6366f1" strokeDasharray="4 4" strokeWidth={1.5} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 총 이자 비교 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-3">총 이자 비교</h3>
            <div className="space-y-3">
              {scenarios.map(s => {
                const pct = (s.totalInterest / (scenarios[2].totalInterest || 1)) * 100
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{s.label} ({s.rate.toFixed(1)}%)</span>
                      <span className="font-bold text-gray-900">{fmtWon(s.totalInterest)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: s.delta < 0 ? '#10b981' : s.delta === 0 ? '#6366f1' : '#ef4444',
                        }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 계산식 */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
            <p>• 원리금균등: M = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</p>
            <p>• 원금균등: 첫 달 = (원금÷기간) + (잔액×월금리)</p>
            <p className="text-xs text-gray-400 pt-1">시나리오는 현재 금리 기준 ±1%p 변동</p>
          </div>

        </div>
      </div>

      {/* ── 하단 가이드 ── */}
      <div className="space-y-6 mt-8">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">💡 금리 변동 시 어떤 영향이 있을까요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="font-semibold text-red-900 mb-2">금리 인상 시 (+1%p)</h3>
              <p>변동금리 대출 보유자는 월 상환액이 즉시 증가합니다. 특히 대출 규모가 크거나 잔여 기간이 긴 경우 영향이 크므로, 고정금리 전환이나 중도상환을 검토할 수 있습니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">금리 인하 시 (-1%p)</h3>
              <p>기존 고금리 대출을 보유하고 있다면 저금리 대출로 갈아탈 기회입니다. 다만 중도상환수수료와 대환 비용을 감안해 실제 절감액을 계산해야 합니다.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">고정금리 vs 변동금리 선택</h3>
              <p>금리 인상이 예상될 때는 고정금리가 유리하고, 금리 인하가 예상될 때는 변동금리가 유리합니다. 금리 변동 리스크를 감당하기 어렵다면 처음부터 고정금리를 선택하는 것이 안전합니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">📐 원리금균등 vs 원금균등</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-indigo-50 p-4 rounded-xl">
              <h3 className="font-semibold text-indigo-900 mb-2">원리금균등 상환</h3>
              <p>매월 동일한 금액을 납부합니다. 초기에는 이자 비중이 크고 원금 비중이 작지만, 시간이 지날수록 비율이 역전됩니다. 현금 흐름 예측이 쉬워 가장 많이 사용되는 방식입니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-semibold text-purple-900 mb-2">원금균등 상환</h3>
              <p>매월 동일한 원금을 납부하고, 이자는 잔액에 따라 점차 감소합니다. 초기 부담이 크지만 총 이자가 원리금균등보다 적습니다. 초기 현금 여유가 충분할 때 유리합니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="space-y-1.5 ml-2">
              <li>• <a href="https://www.bok.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국은행</a> — 기준금리 및 통화정책 안내</li>
              <li>• <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회</a> — 금리 정책 및 대출 규제</li>
              <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> — 은행별 금리 비교</li>
            </ul>
            <p className="text-xs text-gray-500 bg-white rounded-lg p-3 mt-2">※ 실제 금리는 신용등급, 담보, 금융기관 정책에 따라 다릅니다. 대출 실행 전 반드시 금융기관에 문의하세요.</p>
          </div>
        </div>

        <DisclaimerNotice message="본 계산 결과는 원리금균등 또는 원금균등 방식 기준 예상치이며, 실제 상환액은 대출 조건·우대금리·수수료 등에 따라 달라질 수 있습니다." />

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 금리 변동 대비 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>변동금리 보유자:</strong> 금리 +1%p 시 월 상환액 증가분을 미리 계산해 대비하세요.</li>
            <li>• <strong>고정금리 전환:</strong> 변동금리 대출이라면 고정금리 전환 가능 여부를 금융기관에 문의하세요.</li>
            <li>• <strong>대환 대출 검토:</strong> 금리 인하 시 더 낮은 금리의 대출로 갈아타는 것을 고려하세요.</li>
            <li>• <strong>상환 기간 조정:</strong> 월 부담을 줄이려면 기간을 늘리고, 총 이자를 줄이려면 기간을 단축하세요.</li>
          </ul>
        </div>

      </div>

      <style jsx>{`
        .slider-light { -webkit-appearance: none; appearance: none; outline: none; }
        .slider-light::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #6366f1; cursor: pointer; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); transition: box-shadow .15s; }
        .slider-light::-webkit-slider-thumb:hover { box-shadow: 0 0 0 6px rgba(99,102,241,0.3); }
        .slider-light::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #6366f1; cursor: pointer; border: none; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
      `}</style>
    </div>
  )
}
