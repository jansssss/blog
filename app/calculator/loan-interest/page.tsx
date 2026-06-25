'use client'

import { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import MortgagePrepHubCTA from '@/components/MortgagePrepHubCTA'
import Link from 'next/link'

/* ──────────────────────────────────────────
   상각 스케줄 계산 (원리금균등)
────────────────────────────────────────── */
function calcAmortization(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100
  if (r === 0) {
    const mp = principal / months
    return Array.from({ length: months }, (_, i) => ({
      month: i + 1,
      interest: 0,
      principal: mp,
      balance: principal - mp * (i + 1),
    }))
  }
  const M = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  let balance = principal
  return Array.from({ length: months }, (_, i) => {
    const interest = balance * r
    const prin = M - interest
    balance = Math.max(0, balance - prin)
    return { month: i + 1, interest: Math.round(interest), principal: Math.round(prin), balance: Math.round(balance) }
  })
}

/* ──────────────────────────────────────────
   이자 부담도 게이지
────────────────────────────────────────── */
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
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, ${level.color})` }}
        />
      </div>
      <p className="text-xs text-gray-400">원금 대비 이자 비율 {Math.round(ratio * 100)}%</p>
    </div>
  )
}

/* ──────────────────────────────────────────
   슬라이더 컴포넌트
────────────────────────────────────────── */
function SliderInput({
  label, unit, value, min, max, step,
  displayValue, onChange, hint,
}: {
  label: string; unit: string; value: number; min: number; max: number; step: number
  displayValue: string; onChange: (v: number) => void; hint?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <div className="flex items-baseline gap-1">
          <span className="text-indigo-700 font-bold text-base">{displayValue}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${pct}%, #c7d2fe ${pct}%, #c7d2fe 100%)` }}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

/* ──────────────────────────────────────────
   KPI 카드
────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-1 ${accent ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-indigo-300' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-lg font-extrabold leading-tight whitespace-nowrap ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-xs ${accent ? 'text-indigo-200' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

/* ──────────────────────────────────────────
   메인 페이지
────────────────────────────────────────── */
export default function LoanInterestCalculatorPage() {
  const [amount, setAmount] = useState(100_000_000)
  const [rate, setRate] = useState(45)   // ×10 저장 → 실제 4.5%
  const [period, setPeriod] = useState(120)
  const [grace, setGrace] = useState(0)

  const rateReal = rate / 10

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(Math.round(n))
  const fmtShort = (n: number) => {
    if (n >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1).replace(/\.0$/, '')}억`
    if (n >= 1_000_0000) return `${(n / 1_000_0000).toFixed(0)}천만`
    if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`
    return String(n)
  }

  /* 계산 결과 */
  const { simpleResult, schedule, chartData } = useMemo(() => {
    const monthlyRate = rateReal / 12 / 100
    const monthlyInterest = amount * monthlyRate
    const totalInterest = monthlyInterest * period
    const totalRepayment = amount + totalInterest

    let graceTotalRepayment: number | null = null
    let graceExtra: number | null = null
    if (grace > 0 && grace < period) {
      const gi = monthlyInterest * grace
      const ri = monthlyInterest * (period - grace)
      graceTotalRepayment = amount + gi + ri
      graceExtra = graceTotalRepayment - totalRepayment
    }

    // 원리금균등 amortization
    const sched = calcAmortization(amount, rateReal, period)

    // 차트 데이터: 12개월 단위 집계 (너무 많으면 가려짐)
    const step = Math.max(1, Math.floor(period / 24))
    const cd = sched
      .filter((_, i) => i % step === 0 || i === sched.length - 1)
      .map(d => ({
        month: `${d.month}개월`,
        이자: d.interest,
        원금: d.principal,
      }))

    return {
      simpleResult: { monthlyInterest, totalInterest, totalRepayment, graceTotalRepayment, graceExtra },
      schedule: sched,
      chartData: cd,
    }
  }, [amount, rateReal, period, grace])

  // 원리금균등 총 이자 계산
  const emiTotalInterest = useMemo(() => schedule.reduce((s, d) => s + d.interest, 0), [schedule])
  const emiMonthlyPayment = useMemo(() => schedule[0] ? schedule[0].interest + schedule[0].principal : 0, [schedule])

  const pieData = [
    { name: '대출 원금', value: amount },
    { name: '총 이자', value: Math.round(emiTotalInterest) },
  ]
  const PIE_COLORS = ['#6366f1', '#f97316']

  const presets = [
    { label: '🏠 주택담보대출', amt: 300_000_000, r: 42, p: 360, g: 12 },
    { label: '💳 신용대출', amt: 30_000_000, r: 65, p: 60, g: 0 },
    { label: '🏢 사업자대출', amt: 100_000_000, r: 58, p: 120, g: 6 },
  ]

  return (
    <div className="container max-w-6xl py-8">

      {/* ── 헤더 ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">대출 이자 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">슬라이더를 움직이면 바로 계산됩니다</p>
      </div>

      {/* ── 메인 2컬럼 레이아웃 (데스크탑) ── */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">

        {/* ── 입력 패널 (데스크탑에서 sticky) ── */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 lg:mb-0">

            {/* 프리셋 칩 */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setAmount(p.amt); setRate(p.r); setPeriod(p.p); setGrace(p.g) }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 슬라이더 4개 */}
            <div className="space-y-7">
              <SliderInput
                label="대출 금액" unit="" value={amount}
                min={5_000_000} max={1_500_000_000} step={5_000_000}
                displayValue={fmtShort(amount)} onChange={setAmount}
                hint={`${fmt(amount)}원`}
              />
              <SliderInput
                label="연 금리" unit="%" value={rate}
                min={10} max={200} step={1}
                displayValue={rateReal.toFixed(1)} onChange={setRate}
              />
              <SliderInput
                label="대출 기간" unit="개월" value={period}
                min={6} max={360} step={6}
                displayValue={`${period}`} onChange={setPeriod}
                hint={`${Math.floor(period / 12)}년 ${period % 12 > 0 ? `${period % 12}개월` : ''}`}
              />
              <SliderInput
                label="거치기간 (선택)" unit="개월" value={grace}
                min={0} max={Math.max(0, period - 6)} step={1}
                displayValue={`${grace}`}
                onChange={v => setGrace(Math.min(v, period - 1))}
                hint={grace === 0 ? '거치기간 없음 — 처음부터 원금+이자 상환' : `${grace}개월 이자만 납부 후 원금 상환 시작`}
              />
            </div>
          </div>
        </div>

        {/* ── 결과 영역 ── */}
        <div className="space-y-6 mt-8 lg:mt-0">

        {/* KPI 3개 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard
            label="월 납입액 (원리금균등)"
            value={`${fmt(emiMonthlyPayment)}원`}
            sub="매월 고정 납입"
          />
          <KpiCard
            label="총 이자"
            value={`${fmt(emiTotalInterest)}원`}
            sub={`원금의 ${Math.round(emiTotalInterest / amount * 100)}%`}
          />
          <KpiCard
            label="총 상환액"
            value={`${fmt(amount + emiTotalInterest)}원`}
            sub="원금 + 이자 합계"
            accent
          />
        </div>

        {/* 파이 차트 + 부담도 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-bold text-gray-700 mb-4">원금 vs 이자 구성</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-52 h-52 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                    animationBegin={0} animationDuration={700}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => `${fmt(Number(v))}원`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-2.5">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-sm text-gray-500">{d.name}</span>
                    <span className="ml-auto font-bold text-gray-900">{fmt(d.value)}원</span>
                  </div>
                ))}
              </div>
              <BurdenGauge ratio={emiTotalInterest / amount} />
            </div>
          </div>
        </div>

        {/* 상각 차트 — 이자/원금 흐름 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-bold text-gray-700 mb-1">월별 납입 구성 변화 (원리금균등)</p>
          <p className="text-xs text-gray-400 mb-4">시간이 지날수록 원금 비중이 높아집니다</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 10000 ? `${Math.round(v / 10000)}만` : String(v)} />
                <Tooltip formatter={(v: unknown) => `${fmt(Number(v))}원`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="이자" stroke="#f97316" strokeWidth={2} fill="url(#gradInterest)" />
                <Area type="monotone" dataKey="원금" stroke="#6366f1" strokeWidth={2} fill="url(#gradPrincipal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 타임라인 + 거치기간 비교 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <p className="text-sm font-bold text-gray-700">상환 타임라인</p>
          <div className="space-y-2">
            {grace > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right text-xs text-gray-400 shrink-0">거치 {grace}개월</div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 flex items-center px-2"
                      style={{ width: `${(grace / period) * 100}%` }}
                    >
                      <span className="text-[10px] text-amber-900 font-semibold whitespace-nowrap overflow-hidden">이자만</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right text-xs text-gray-400 shrink-0">상환 {period - grace}개월</div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 flex items-center px-2"
                      style={{ width: `${((period - grace) / period) * 100}%` }}
                    >
                      <span className="text-[10px] text-white font-semibold whitespace-nowrap overflow-hidden">원금+이자</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-20 text-right text-xs text-gray-400 shrink-0">{period}개월</div>
                <div className="flex-1 h-5 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 flex items-center px-3">
                    <span className="text-[10px] text-white font-semibold">원금 + 이자 전액 상환</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {grace > 0 && simpleResult.graceTotalRepayment !== null && simpleResult.graceExtra !== null && (
            <div className="mt-2 pt-4 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-50 p-3 border border-green-100">
                  <p className="text-[11px] text-green-600 font-semibold mb-1">거치 없이 상환</p>
                  <p className="font-extrabold text-green-800">{fmt(simpleResult.totalRepayment)}원</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
                  <p className="text-[11px] text-amber-600 font-semibold mb-1">거치 {grace}개월 사용</p>
                  <p className="font-extrabold text-amber-800">{fmt(simpleResult.graceTotalRepayment)}원</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <span className="text-red-500 font-bold">+</span>
                <p className="text-sm text-red-700">
                  거치기간 사용 시 <strong>{fmt(simpleResult.graceExtra)}원</strong> 추가 부담
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 한줄 인사이트 */}
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-5 py-4">
          <p className="text-sm text-indigo-800 leading-relaxed">
            <strong>{fmtShort(amount)}</strong>을 연 <strong>{rateReal.toFixed(1)}%</strong>로 <strong>{period}개월</strong> 빌리면,
            이자로만 <strong className="text-orange-600">{fmtShort(emiTotalInterest)}</strong>을 더 납니다.
            원금의 <strong>{Math.round(emiTotalInterest / amount * 100)}%</strong>에 해당합니다.
          </p>
        </div>

      </div>{/* 결과 영역 끝 */}
      </div>{/* 2컬럼 그리드 끝 */}

      {/* ─── 하단 안내 콘텐츠 ─── */}
      <div className="space-y-6 mt-8">

        {/* 1. 중도상환 타이밍 전략 */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1 text-gray-900">이자를 가장 많이 줄이는 방법 — 중도상환 타이밍</h2>
          <p className="text-sm text-gray-500 mb-5">총 이자를 보고 충격받는 분이 많습니다. 같은 금액을 중도상환해도 <strong>언제</strong> 하느냐에 따라 절약 효과가 크게 다릅니다.</p>
          <div className="space-y-4 text-sm">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="font-bold text-emerald-800 mb-2">초반 중도상환이 훨씬 효과적입니다</p>
              <p className="text-gray-700 leading-relaxed mb-3">원리금균등 방식에서 초반에는 납입액의 대부분이 이자입니다. 3억원, 4.5%, 30년 대출 기준으로 1개월차 납입액 152만원 중 이자가 112만원(74%)입니다. 즉, 초반에 원금을 줄이면 남은 기간 내내 이자가 줄어드는 복리 효과가 생깁니다.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-semibold mb-1">5년 후 5천만원 중도상환</p>
                  <p className="text-base font-bold text-gray-800">총 이자 절약 <span className="text-emerald-600">약 3,200만원</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">잔여 25년 이자 감소</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1">25년 후 5천만원 중도상환</p>
                  <p className="text-base font-bold text-gray-800">총 이자 절약 <span className="text-gray-600">약 540만원</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">잔여 5년 이자 감소</p>
                </div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-2">중도상환수수료 vs 이자 절약 — 언제 득인가?</p>
              <p className="text-gray-600 leading-relaxed">중도상환수수료는 보통 잔액의 1~1.5%, 3년 이내 상환 시 부과됩니다. 5,000만원 중도상환 시 수수료 최대 75만원. 반면 이자 절약은 수백만~수천만원대이므로 수수료를 내더라도 중도상환이 거의 항상 유리합니다. 단, <strong>3년 이후에 수수료 없이</strong> 상환할 수 있다면 그때까지 기다리는 것이 가장 낫습니다.</p>
            </div>
          </div>
        </div>

        {/* 2. 원리금균등 vs 원금균등 */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1 text-gray-900">원리금균등 vs 원금균등 — 실제 차이는 얼마나 될까?</h2>
          <p className="text-sm text-gray-500 mb-5">많은 분이 "원리금균등이 편하지만 이자를 더 낸다"는 걸 알면서도 얼마나 더 내는지는 모릅니다. 구체적으로 계산해봤습니다.</p>
          <div className="space-y-4 text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs">
                    <th className="text-left pb-2 font-medium">항목</th>
                    <th className="text-center pb-2 font-medium">원리금균등</th>
                    <th className="text-center pb-2 font-medium">원금균등</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {[
                    ['첫 달 납입액', '126만원', '158만원 (더 높음)'],
                    ['마지막 달 납입액', '126만원', '83만원 (더 낮음)'],
                    ['총 이자 (2억, 4.5%, 20년)', '1억 3,343만원', '9,045만원'],
                    ['이자 차이', '—', '4,298만원 절약'],
                  ].map(([item, a, b]) => (
                    <tr key={item} className="border-b border-gray-50">
                      <td className="py-2 text-gray-500 text-xs">{item}</td>
                      <td className="py-2 text-center font-medium">{a}</td>
                      <td className="py-2 text-center font-medium text-emerald-700">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="font-semibold text-amber-800 mb-2">많은 사람이 오해하는 부분</p>
              <p className="text-gray-700 leading-relaxed">원금균등의 <strong>첫 달 납입액이 원리금균등보다 높습니다.</strong> 원금을 매달 똑같이 갚기 때문에 초반 납입 부담이 크고, 후반으로 갈수록 줄어드는 구조입니다. 즉, 초기 현금 여유가 있고 장기적으로 이자를 아끼고 싶다면 원금균등이 유리하고, 매달 고정된 금액으로 계획적으로 살고 싶다면 원리금균등이 적합합니다.</p>
            </div>
          </div>
        </div>

        {/* 3. 거치기간의 진짜 비용 */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1 text-gray-900">거치기간의 진짜 비용 — 나중에 내는 게 아니라 더 내는 것</h2>
          <p className="text-sm text-gray-500 mb-5">거치기간을 쓰면 초기 부담이 줄지만, 사라지는 이자가 아니라 <strong>뒤로 밀리는 이자+새로 생기는 이자</strong>입니다.</p>
          <div className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">거치기간 없음</p>
                <p className="font-bold text-gray-800">1억, 4.5%, 10년</p>
                <p className="text-2xl font-extrabold text-gray-900 my-1">2,393만원</p>
                <p className="text-xs text-gray-400">총 이자</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <p className="text-xs text-amber-600 mb-1">거치 6개월</p>
                <p className="font-bold text-gray-800">1억, 4.5%, 10년</p>
                <p className="text-2xl font-extrabold text-amber-700 my-1">2,623만원</p>
                <p className="text-xs text-amber-500">+230만원 추가</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <p className="text-xs text-red-500 mb-1">거치 12개월</p>
                <p className="font-bold text-gray-800">1억, 4.5%, 10년</p>
                <p className="text-2xl font-extrabold text-red-600 my-1">2,853만원</p>
                <p className="text-xs text-red-400">+460만원 추가</p>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-2">그래도 거치기간이 유용한 경우</p>
              <ul className="space-y-1.5 text-gray-600">
                <li className="flex gap-2"><span className="text-emerald-500 font-bold shrink-0">✓</span><span><strong>창업 초기 운전자금:</strong> 매출 발생 전 현금 흐름 확보가 생존보다 우선일 때</span></li>
                <li className="flex gap-2"><span className="text-emerald-500 font-bold shrink-0">✓</span><span><strong>입주 전 잔금 대출:</strong> 전세 보증금 회수와 잔금 사이 갭 기간</span></li>
                <li className="flex gap-2"><span className="text-red-400 font-bold shrink-0">✗</span><span><strong>단순히 월 부담이 커서:</strong> 이 경우엔 대출 금액 자체를 줄이는 게 낫습니다</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. 계산 방식 */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
          <p>• 월 납입액(원리금균등) M = P × r(1+r)ⁿ / ((1+r)ⁿ - 1)</p>
          <p>• P = 대출 원금, r = 월 금리(연금리 ÷ 12 ÷ 100), n = 상환 기간(개월)</p>
          <p>• 총 이자 = 월 납입액 × n - P</p>
          <p className="text-xs text-gray-400 pt-1">※ 원금균등 방식, 중도상환수수료, 우대금리는 반영되지 않습니다. 실제 상환 계획서는 금융기관에서 확인하세요.</p>
        </div>

      </div>

      {/* 관련 계산기 */}
      <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
          <div>
            <p className="text-sm font-bold text-gray-900">다음 단계로 — 관련 계산기</p>
            <p className="text-xs text-gray-400">이자 확인 후 이어서 계산해보세요</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/calculator/dsr-dti-ltv', emoji: '📋', title: 'DSR · DTI · LTV 계산기', desc: '이 대출이 내 DSR 한도 안에 들어오는지 확인' },
            { href: '/calculator/repayment-compare', emoji: '⚖️', title: '상환방식 비교', desc: '원금균등으로 바꾸면 총이자 얼마나 줄어드나' },
            { href: '/calculator/refinancing', emoji: '🔄', title: '갈아타기 손익 계산', desc: '이자가 부담된다면 갈아타기로 얼마나 아낄 수 있나' },
            { href: '/calculator/prepayment-comparison', emoji: '💰', title: '중도상환 vs 유지 비교', desc: '목돈 생겼을 때 갚는 게 이득인지 투자가 이득인지' },
          ].map(({ href, emoji, title, desc }) => (
            <Link key={href} href={href}
              className="group flex items-start gap-3 p-4 bg-white hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl shadow-sm transition-all">
              <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <span className="text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5">→</span>
            </Link>
          ))}
        </div>
      </div>

      <MortgagePrepHubCTA />
      <DisclaimerNotice />

      {/* 슬라이더 스타일 */}
      <style>{`
        input[type=range]{-webkit-appearance:none;outline:none;border-radius:9999px;height:8px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2);transition:box-shadow .15s}
        input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 6px rgba(99,102,241,0.3)}
        input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>
    </div>
  )
}
