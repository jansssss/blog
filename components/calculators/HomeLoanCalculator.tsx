'use client'

import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/* ── 원리금균등 계산 ── */
function calcEMI(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100
  if (r === 0) return { monthly: principal / months, totalInterest: 0 }
  const M = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  return { monthly: M, totalInterest: M * months - principal }
}

/* ── 숫자 포매터 ── */
const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(Math.round(n))
const fmtShort = (n: number) => {
  if (n >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1).replace(/\.0$/, '')}억`
  if (n >= 1_000_0000)  return `${(n / 1_000_0000).toFixed(0)}천만`
  if (n >= 10_000)      return `${(n / 10_000).toFixed(0)}만`
  return String(n)
}

/* ── 슬라이더 ── */
function Slider({
  label, value, min, max, step, display, unit, hint, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  display: string; unit?: string; hint?: string; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-indigo-700 font-bold text-base">{display}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${pct}%,#c7d2fe ${pct}%,#c7d2fe 100%)`,
        }}
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

/* ── KPI 카드 ── */
function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-0.5 ${accent ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-indigo-300' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-base font-extrabold leading-tight ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-[11px] ${accent ? 'text-indigo-200' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

/* ── 이자 부담도 게이지 ── */
function BurdenGauge({ ratio }: { ratio: number }) {
  const pct = Math.min(ratio * 100, 100)
  const level = ratio < 0.2
    ? { label: '낮음', color: '#22c55e', bg: 'bg-green-100 text-green-700' }
    : ratio < 0.5
    ? { label: '보통', color: '#f59e0b', bg: 'bg-amber-100 text-amber-700' }
    : { label: '높음', color: '#ef4444', bg: 'bg-red-100 text-red-700' }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>이자 부담도</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${level.bg}`}>{level.label}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,#22c55e,${level.color})` }}
        />
      </div>
      <p className="text-[11px] text-gray-400">원금 대비 이자 비율 {Math.round(ratio * 100)}%</p>
    </div>
  )
}

/* ── 프리셋 ── */
const PRESETS = [
  { label: '🏠 주택담보대출', amt: 300_000_000, r: 42, p: 360 },
  { label: '💳 신용대출',     amt:  30_000_000, r: 65, p:  60 },
  { label: '🏢 사업자대출',   amt: 100_000_000, r: 58, p: 120 },
]
const PIE_COLORS = ['#6366f1', '#f97316']

/* ── 메인 컴포넌트 ── */
export default function HomeLoanCalculator() {
  const [amount, setAmount] = useState(100_000_000)
  const [rate,   setRate]   = useState(45)   // ×10 저장 → 실제 4.5%
  const [period, setPeriod] = useState(120)

  const rateReal = rate / 10

  const { monthly, totalInterest } = useMemo(
    () => calcEMI(amount, rateReal, period),
    [amount, rateReal, period],
  )

  const totalRepayment = amount + totalInterest
  const pieData = [
    { name: '대출 원금', value: amount },
    { name: '총 이자',   value: Math.round(totalInterest) },
  ]

  return (
    <section className="mb-8">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">대출 이자 계산기</h2>
          <p className="text-[11px] text-gray-500">슬라이더를 움직이면 즉시 계산됩니다</p>
        </div>
        <Link
          href="/calculator/loan-interest"
          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          전체 분석 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-2xl p-5">
        {/* 프리셋 칩 */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setAmount(p.amt); setRate(p.r); setPeriod(p.p) }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* ── 입력 ── */}
          <div className="space-y-5">
            <Slider
              label="대출 금액" value={amount}
              min={5_000_000} max={1_500_000_000} step={5_000_000}
              display={fmtShort(amount)} hint={`${fmt(amount)}원`}
              onChange={setAmount}
            />
            <Slider
              label="연 금리" value={rate}
              min={10} max={200} step={1}
              display={rateReal.toFixed(1)} unit="%"
              onChange={setRate}
            />
            <Slider
              label="대출 기간" value={period}
              min={6} max={360} step={6}
              display={String(period)} unit="개월"
              hint={`${Math.floor(period / 12)}년${period % 12 ? ` ${period % 12}개월` : ''}`}
              onChange={setPeriod}
            />
          </div>

          {/* ── 결과 ── */}
          <div className="space-y-4">
            {/* KPI 3개 */}
            <div className="grid grid-cols-3 gap-2">
              <Kpi label="월 납입액" value={`${fmtShort(monthly)}원`} sub="원리금균등" />
              <Kpi label="총 이자" value={`${fmtShort(totalInterest)}원`} sub={`원금의 ${Math.round(totalInterest / amount * 100)}%`} />
              <Kpi label="총 상환액" value={`${fmtShort(totalRepayment)}원`} accent />
            </div>

            {/* 도넛 차트 + 부담도 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-4">
                {/* 도넛 */}
                <div className="w-28 h-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={32} outerRadius={48}
                        paddingAngle={3} dataKey="value"
                        animationBegin={0} animationDuration={600}
                      >
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => `${fmt(Number(v))}원`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 범례 + 부담도 */}
                <div className="flex-1 space-y-2.5">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs text-gray-500">{d.name}</span>
                      <span className="ml-auto text-xs font-bold text-gray-800">{fmt(d.value)}원</span>
                    </div>
                  ))}
                  <BurdenGauge ratio={totalInterest / amount} />
                </div>
              </div>
            </div>

            {/* 한줄 인사이트 */}
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
              <p className="text-xs text-indigo-800 leading-relaxed">
                <strong>{fmtShort(amount)}</strong>을 연 <strong>{rateReal.toFixed(1)}%</strong>로{' '}
                <strong>{period}개월</strong> 빌리면, 이자로만{' '}
                <strong className="text-orange-600">{fmtShort(totalInterest)}</strong>을 더 납니다.
              </p>
            </div>

            {/* 전체 분석 CTA */}
            <Link
              href="/calculator/loan-interest"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              상세 분석 보기 — 상각 스케줄·거치기간 비교
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 슬라이더 CSS */}
      <style>{`
        input[type=range]{-webkit-appearance:none;outline:none;border-radius:9999px;height:8px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 3px rgba(99,102,241,.2);transition:box-shadow .15s}
        input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 5px rgba(99,102,241,.3)}
        input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 3px rgba(99,102,241,.2)}
      `}</style>
    </section>
  )
}
