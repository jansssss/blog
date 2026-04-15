'use client'

import { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import DisclaimerNotice from '@/components/DisclaimerNotice'

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
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-white/70">{label}</label>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-white">{displayValue}</span>
          <span className="text-sm text-white/50">{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(90deg, #818cf8 ${pct}%, rgba(255,255,255,0.15) ${pct}%)` }}
      />
      {hint && <p className="text-xs text-white/35">{hint}</p>}
    </div>
  )
}

/* ──────────────────────────────────────────
   KPI 카드
────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-1 ${accent ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-indigo-300' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-xl sm:text-2xl font-extrabold leading-tight ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
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
    <div className="min-h-screen bg-gray-50">

      {/* ── 다크 입력 영역 ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 pt-10 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">

          <div className="text-center space-y-1">
            <p className="text-[11px] font-bold tracking-[0.25em] text-indigo-400 uppercase">Loan Calculator</p>
            <h1 className="text-3xl font-extrabold text-white">대출 이자 계산기</h1>
            <p className="text-sm text-white/40">슬라이더를 움직이면 바로 계산됩니다</p>
          </div>

          {/* 프리셋 칩 */}
          <div className="flex flex-wrap gap-2 justify-center">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => { setAmount(p.amt); setRate(p.r); setPeriod(p.p); setGrace(p.g) }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/60 hover:bg-indigo-500 hover:text-white transition-all border border-white/10"
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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

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

        {/* ─── 하단 안내 콘텐츠 (SEO + 가이드) ─── */}
        <div className="space-y-6 mt-4">

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">언제 대출 이자 계산이 필요할까요?</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">1. 신용대출 갈아타기 검토 시</h3>
                <p>기존 대출의 금리가 높아 다른 금융기관으로 갈아탈지 고민할 때, 현재 대출의 총 이자와 신규 대출의 예상 이자를 비교하여 실제 절감 효과를 확인할 수 있습니다. 단, 중도상환수수료와 신규 대출 취급 수수료를 함께 고려해야 정확한 비교가 가능합니다.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-900 mb-2">2. 주택담보대출 실행 전 예산 계획</h3>
                <p>내 집 마련을 위해 주택담보대출을 받기 전, 월 납입액과 총 상환액을 미리 계산하여 가계 예산에 무리가 없는지 확인할 수 있습니다. 특히 원리금균등 상환과 원금균등 상환 방식 중 어떤 것을 선택할지 결정하는 데 도움이 됩니다.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-semibold text-purple-900 mb-2">3. 거치기간 설정 여부 결정</h3>
                <p>대출 초기 현금 흐름이 부족한 경우 거치기간을 설정하면 초기 부담을 줄일 수 있지만, 총 상환액이 증가합니다. 거치기간 사용 시와 미사용 시의 이자 차이를 계산하여 본인의 재무 상황에 맞는 선택을 할 수 있습니다.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">계산 방식과 가정</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">원리금균등 공식</h3>
                <p className="mb-2">월 납입액 M = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li>P = 대출 원금, r = 월 금리(연금리÷12÷100), n = 상환 기간(개월)</li>
                  <li>매월 납입액은 동일, 이자 비중이 점점 줄고 원금 비중이 늘어납니다</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">계산에 포함되지 않는 요소</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li><strong>중도상환수수료:</strong> 조기 상환 시 발생하는 수수료 미반영</li>
                  <li><strong>우대금리 및 할인:</strong> 급여이체·자동이체 등 조건부 할인 미반영</li>
                  <li><strong>원금균등 방식:</strong> 이 계산기는 원리금균등 기준</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">결과를 어떻게 해석하나요?</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-900 mb-2">월 납입액 해석</h3>
                <p>월 소득 대비 월 납입액이 30%를 넘으면 DSR 기준에서 위험 구간입니다. 월 소득의 20% 이내로 유지하는 것이 안전합니다.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">총 이자 vs 총 상환액</h3>
                <p>총 이자가 원금의 50%를 넘는다면 대출 기간이 너무 길거나 금리가 높다는 신호입니다. 기간을 줄이거나 중도상환을 활용하면 이자를 크게 줄일 수 있습니다.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-semibold text-purple-900 mb-2">거치기간 사용 시 주의사항</h3>
                <p>거치기간을 쓰면 초기 월 부담은 줄지만 총 이자는 반드시 늘어납니다. 창업 초기나 소득이 불안정한 경우에만 선택적으로 활용하세요.</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">실제 대출과의 차이</h3>
                <p>실제 은행 상환 스케줄과 차이가 있을 수 있습니다. 대출 실행 전 반드시 금융기관에서 제공하는 <strong>대출 상환 계획서</strong>를 확인하세요.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">공식 출처 및 참고 자료</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">금융 당국 및 공공기관</h3>
                <ul className="space-y-1.5 ml-2">
                  <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> — 대출 상품 비교 및 금리 정보</li>
                  <li>• <a href="https://www.bok.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국은행</a> — 기준금리 및 금융통계</li>
                  <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> — 주택담보대출 안내</li>
                  <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> — 대출 금리 비교</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">시중 은행 대출 정보</h3>
                <ul className="space-y-1.5 ml-2">
                  <li>• <a href="https://www.kbanknow.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">KB국민은행</a> — 개인대출 상품 안내</li>
                  <li>• <a href="https://www.shinhan.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신한은행</a> — 대출금리 및 한도 조회</li>
                  <li>• <a href="https://www.wooribank.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">우리은행</a> — 주택담보대출 안내</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 bg-white rounded-lg p-3">※ 실제 대출 조건은 개인의 신용등급·소득·담보 가치 등에 따라 달라질 수 있습니다. 대출 실행 전 반드시 해당 금융기관에 직접 문의하시기 바랍니다.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
            <h3 className="font-semibold mb-3 text-gray-900">거치기간, 언제 사용하면 좋을까요?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-white p-3 rounded-xl">
                <p className="font-semibold text-green-700 mb-1">추천하는 경우</p>
                <ul className="space-y-1 text-gray-600 ml-2">
                  <li>• 초기 현금 흐름이 부족할 때 (창업 초기, 사업 안정화 전)</li>
                  <li>• 소득이 점진적으로 증가할 것으로 예상될 때</li>
                  <li>• 단기적으로 자금을 다른 곳에 투자하여 수익을 낼 수 있을 때</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <p className="font-semibold text-red-700 mb-1">신중해야 하는 경우</p>
                <ul className="space-y-1 text-gray-600 ml-2">
                  <li>• 안정적인 소득이 있고 원금 상환 여력이 충분할 때</li>
                  <li>• 총 이자 비용을 최소화하고 싶을 때</li>
                  <li>• 대출 기간이 짧거나 금리가 높을 때</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <DisclaimerNotice />
      </div>

      {/* 슬라이더 스타일 */}
      <style>{`
        input[type=range]{-webkit-appearance:none;outline:none;border-radius:9999px;height:6px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:white;border:3px solid #818cf8;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.25);transition:border-color .15s}
        input[type=range]::-webkit-slider-thumb:hover{border-color:#6366f1}
        input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:white;border:3px solid #818cf8;cursor:pointer}
      `}</style>
    </div>
  )
}
