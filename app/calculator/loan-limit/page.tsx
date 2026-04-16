'use client'

import { useState, useMemo } from 'react'
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

/* ─── 슬라이더 컴포넌트 (라이트 버전) ─────────────────────── */
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
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="slider-light w-full h-2 rounded-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${pct}%, #c7d2fe ${pct}%, #c7d2fe 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}

/* ─── DSR 게이지 (그라디언트 반원 SVG) ──────────────────────── */
function DSRGauge({ dsr, limit }: { dsr: number; limit: number }) {
  const maxRange = Math.max(70, limit + 30)
  const pct = Math.min(dsr / maxRange, 1)

  const statusLabel = dsr <= limit * 0.65 ? '안전' : dsr <= limit ? '주의' : 'DSR 초과'
  const statusColor = dsr <= limit * 0.65 ? '#10b981' : dsr <= limit ? '#f59e0b' : '#ef4444'

  const W = 200, H = 108
  const cx = 100, cy = 106
  const ro = 86, ri = 58

  // SVG 좌표: x=cx+r·cos(θ), y=cy-r·sin(θ) (y축 반전)
  const pt = (deg: number, r: number) => ({
    x: +(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(2),
    y: +(cy - r * Math.sin((deg * Math.PI) / 180)).toFixed(2),
  })

  // 배경 반원 도넛 (180°→0°, 시계방향)
  const bgPath = (() => {
    const so = pt(180, ro), eo = pt(0, ro)
    const si = pt(180, ri), ei = pt(0, ri)
    return `M ${so.x} ${so.y} A ${ro} ${ro} 0 1 1 ${eo.x} ${eo.y} L ${ei.x} ${ei.y} A ${ri} ${ri} 0 1 0 ${si.x} ${si.y} Z`
  })()

  // 채움 도넛 (180°→fillEnd°, pct 비율)
  const fillEnd = 180 - pct * 180
  const large = pct >= 1 ? 1 : 0
  const fillPath = pct > 0.005 ? (() => {
    const so = pt(180, ro), eo = pt(fillEnd, ro)
    const si = pt(180, ri), ei = pt(fillEnd, ri)
    return `M ${so.x} ${so.y} A ${ro} ${ro} 0 ${large} 1 ${eo.x} ${eo.y} L ${ei.x} ${ei.y} A ${ri} ${ri} 0 ${large} 0 ${si.x} ${si.y} Z`
  })() : null

  return (
    <div className="flex flex-col items-center">
      {/* 숫자 + 상태 뱃지 — 게이지 위 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-extrabold text-gray-900">{dsr.toFixed(1)}%</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white leading-none"
          style={{ background: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {/* 그라디언트 게이지 */}
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="dsrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#10b981" />
            <stop offset="48%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* 배경 */}
        <path d={bgPath} fill="#e0e7ff" />
        {/* 채움 */}
        {fillPath && <path d={fillPath} fill="url(#dsrGrad)" />}
      </svg>

      <p className="text-xs text-gray-400 -mt-1">DSR 한도 {limit}% 기준</p>
    </div>
  )
}

/* ─── 월 소득 분배 바 ────────────────────────────────────────── */
function BudgetBar({
  monthlyIncome, existingDebt, available,
}: {
  monthlyIncome: number; existingDebt: number; available: number;
}) {
  const existPct = Math.min((existingDebt / monthlyIncome) * 100, 100)
  const availPct = Math.min((available / monthlyIncome) * 100, 100 - existPct)
  const restPct  = Math.max(0, 100 - existPct - availPct)

  return (
    <div className="w-full">
      <div className="flex h-9 rounded-xl overflow-hidden mb-3 border border-gray-100">
        {existingDebt > 0 && (
          <div
            className="flex items-center justify-center text-white text-[10px] font-semibold bg-amber-400"
            style={{ width: `${existPct}%` }}
          >
            {existPct > 10 ? '기존' : ''}
          </div>
        )}
        {available > 0 && (
          <div
            className="flex items-center justify-center text-white text-[10px] font-semibold bg-indigo-500"
            style={{ width: `${availPct}%` }}
          >
            {availPct > 10 ? '신규' : ''}
          </div>
        )}
        <div className="flex-1 bg-gray-100" />
      </div>
      {/* 범례 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600">
        {existingDebt > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-400 flex-shrink-0" />
            <span>기존 대출 {fmtWon(existingDebt)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 flex-shrink-0" />
          <span>신규 가능 {fmtWon(available)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 flex-shrink-0" />
          <span>DSR 한도 밖 {fmtWon(Math.max(0, monthlyIncome - existingDebt - available))}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── 프리셋 ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: '👤 청년 직장인',  income: 40_000_000, debt: 500_000,   rate: 4.5, period: 360, dsr: 40 },
  { label: '👨‍👩‍👧 맞벌이 부부', income: 80_000_000, debt: 1_000_000, rate: 4.2, period: 300, dsr: 40 },
  { label: '💼 고소득자',      income: 150_000_000,debt: 2_000_000, rate: 4.0, period: 240, dsr: 40 },
]

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function LoanLimitSimulatorPage() {
  const [income,       setIncome]       = useState(60_000_000)
  const [existingDebt, setExistingDebt] = useState(0)
  const [dsrLimit,     setDsrLimit]     = useState(40)
  const [rate,         setRate]         = useState(4.5)
  const [period,       setPeriod]       = useState(240)

  /* 실시간 계산 */
  const result = useMemo(() => {
    const monthlyIncome  = income / 12
    const maxMonthly     = monthlyIncome * (dsrLimit / 100)
    const available      = Math.max(0, maxMonthly - existingDebt)
    const r = rate / 12 / 100
    const loanLimit = r === 0
      ? available * period
      : available * (Math.pow(1 + r, period) - 1) / (r * Math.pow(1 + r, period))
    const currentDSR = monthlyIncome > 0
      ? ((existingDebt + available) / monthlyIncome) * 100
      : 0
    return { monthlyIncome, maxMonthly, available, loanLimit, currentDSR }
  }, [income, existingDebt, dsrLimit, rate, period])

  const applyPreset = (p: typeof PRESETS[0]) => {
    setIncome(p.income)
    setExistingDebt(p.debt)
    setRate(p.rate)
    setPeriod(p.period)
    setDsrLimit(p.dsr)
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* ─── 헤더 ──────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">대출 한도 시뮬레이터</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          소득과 조건을 입력하면 DSR 기반 대출 한도를 즉시 확인합니다
        </p>
      </div>

      {/* ─── 입력 패널 (라이트 그라디언트) ─────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8">
        {/* 프리셋 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 슬라이더 */}
        <div className="space-y-6">
          <SliderInput
            label="연 소득 (세전)"
            value={income} min={10_000_000} max={300_000_000} step={1_000_000}
            onChange={setIncome}
            displayValue={`${fmt(income)}원`}
          />
          <SliderInput
            label="기존 대출 월 상환액"
            value={existingDebt} min={0} max={5_000_000} step={100_000}
            onChange={setExistingDebt}
            displayValue={existingDebt === 0 ? '없음' : `${fmt(existingDebt)}원`}
          />

          {/* DSR 한도 토글 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">DSR 한도</span>
              <div className="flex gap-1.5">
                {[30, 40, 50].map(d => (
                  <button
                    key={d}
                    onClick={() => setDsrLimit(d)}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                      dsrLimit === d
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              주담대 9억 이하 → 40% / 기타 대출 → 40~50%
            </p>
          </div>

          <SliderInput
            label="예상 연 금리"
            value={rate} min={1} max={20} step={0.1}
            onChange={setRate}
            displayValue={`${rate.toFixed(1)}%`}
          />
          <SliderInput
            label="상환 기간"
            value={period} min={12} max={480} step={12}
            onChange={setPeriod}
            displayValue={`${period / 12}년 (${period}개월)`}
          />
        </div>
      </div>

      {/* ─── 결과 영역 ──────────────────────────────────────────── */}

      {/* 대출 한도 히어로 카드 */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-5 text-white"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
      >
        <p className="text-indigo-200 text-sm mb-1">예상 대출 가능 금액 (DSR 기준)</p>
        <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">
          {fmtWon(result.loanLimit)}
        </p>
        <p className="text-indigo-300 text-xs mt-3">
          원리금균등 상환 기준 &nbsp;·&nbsp; 금리 {rate.toFixed(1)}% &nbsp;·&nbsp; {period / 12}년
        </p>
      </div>

      {/* DSR 게이지 + 월 소득 분배 */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {/* DSR 게이지 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-700 mb-4">DSR 현황</h3>
          <DSRGauge dsr={result.currentDSR} limit={dsrLimit} />
        </div>

        {/* 월 소득 분배 바 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-700 mb-1">월 소득 활용 현황</h3>
          <p className="text-xs text-gray-400 mb-4">
            월 소득 <span className="font-semibold text-gray-600">{fmtWon(result.monthlyIncome)}</span>의 분배
          </p>
          <BudgetBar
            monthlyIncome={result.monthlyIncome}
            existingDebt={existingDebt}
            available={result.available}
          />
        </div>
      </div>

      {/* KPI 4개 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
          <p className="text-xs text-emerald-600 mb-1">월 소득</p>
          <p className="text-base font-bold text-emerald-800 leading-tight">
            {fmtWon(result.monthlyIncome)}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-100">
          <p className="text-xs text-indigo-600 mb-1">최대 월 상환 가능</p>
          <p className="text-base font-bold text-indigo-800 leading-tight">
            {fmtWon(result.maxMonthly)}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-600 mb-1">기존 대출 상환액</p>
          <p className="text-base font-bold text-amber-800 leading-tight">
            {existingDebt === 0 ? '없음' : fmtWon(existingDebt)}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-600 mb-1">신규 월 납입 가능</p>
          <p className="text-base font-bold text-blue-800 leading-tight">
            {fmtWon(result.available)}
          </p>
        </div>
      </div>

      {/* ─── 계산 공식 요약 ──────────────────────────────────────── */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-8 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
        <p>• DSR = (모든 대출 월 상환액) ÷ 월 소득 × 100</p>
        <p>• 최대 월 상환액 = 월 소득 × (DSR 한도 ÷ 100)</p>
        <p>• 신규 월 상환 가능액 = 최대 월 상환액 − 기존 대출 월 상환액</p>
        <p>• 대출 가능 금액 = 원리금균등 공식 역산</p>
      </div>

      {/* ─── 하단 가이드 카드 (원본 유지) ───────────────────────── */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">💡 언제 DSR 한도 계산이 필요할까요?</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. 주택 구매 전 대출 가능 금액 확인</h3>
              <p>내 집 마련을 준비할 때 실제로 얼마까지 대출을 받을 수 있는지 미리 확인하여 예산을 계획할 수 있습니다. DSR 규제로 인해 소득 대비 일정 비율 이상은 대출받을 수 없으므로, 주택 가격대를 결정하기 전에 한도를 파악하는 것이 중요합니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. 기존 대출이 있는 상태에서 추가 대출 검토</h3>
              <p>이미 신용대출이나 자동차할부가 있는 경우, 추가로 주택담보대출이나 전세자금대출을 받을 수 있는 여력이 얼마나 되는지 확인할 수 있습니다. DSR은 모든 대출의 상환액을 합산하므로, 기존 부채가 많을수록 신규 대출 한도가 줄어듭니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. 대출 상환 계획 수립</h3>
              <p>현재 소득 수준에서 안전하게 감당할 수 있는 대출 규모를 파악하여, 무리한 대출로 인한 재무 위험을 방지할 수 있습니다. 특히 맞벌이 부부의 경우 합산 소득으로 계산하면 한도가 늘어나지만, 한 사람의 소득이 줄어들 경우를 대비한 계획도 필요합니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📐 DSR 계산 방식과 가정</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">DSR 계산 공식</h3>
              <p className="mb-2"><strong>DSR (Debt Service Ratio, 총부채원리금상환비율)</strong>은 다음과 같이 계산됩니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>DSR = (모든 대출의 연간 원리금 상환액) ÷ (연 소득) × 100</li>
                <li>월 소득 = 연 소득 ÷ 12</li>
                <li>최대 월 상환액 = 월 소득 × (DSR 한도 ÷ 100)</li>
                <li>신규 대출 가능 월 상환액 = 최대 월 상환액 - 기존 대출 월 상환액</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">원리금균등 방식 역산</h3>
              <p className="mb-2">본 계산기는 <strong>원리금균등 상환 방식</strong>을 기준으로 대출 가능 금액을 역산합니다:</p>
              <p className="font-mono text-xs bg-white p-2 rounded">대출 가능 금액 = 월 상환액 × [(1+월금리)^개월수 - 1] ÷ [월금리 × (1+월금리)^개월수]</p>
              <p className="mt-2">이 방식은 매월 동일한 금액을 상환하는 가장 일반적인 대출 방식입니다.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 계산에 반영되지 않는 요소</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>LTV (주택담보인정비율):</strong> 주택 가격 대비 최대 대출 비율 (일반적으로 40~70%)</li>
                <li><strong>DTI (총부채상환비율):</strong> 일부 대출 상품에 추가 적용되는 규제</li>
                <li><strong>신용등급:</strong> 신용등급에 따라 금리 우대 및 한도가 달라질 수 있음</li>
                <li><strong>담보 가치:</strong> 주택담보대출의 경우 담보 평가액에 따라 한도가 제한됨</li>
                <li><strong>금융기관 내부 심사:</strong> 재직 기간, 업종, 연령 등 추가 심사 요소</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">DSR 규제 적용 기준</h3>
              <p>2024년 기준 주요 DSR 한도는 다음과 같습니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>주택담보대출 (9억 원 이하): 40%</li>
                <li>주택담보대출 (9억 원 초과): 규제 강화</li>
                <li>기타 가계대출 (신용대출 등): 40~50%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📊 결과를 어떻게 해석하나요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">예상 대출 한도 해석</h3>
              <p>계산 결과가 2억 원이라면, DSR 규제 기준으로 최대 2억 원까지 대출이 가능하다는 의미입니다. 다만 이는 <strong>이론적 최대치</strong>이며, 실제로는 다음 요소를 추가로 고려해야 합니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>주택담보대출의 경우 LTV 규제로 주택 가격의 40~70%까지만 가능</li>
                <li>신용등급이 낮으면 한도가 줄어들거나 금리가 높아질 수 있음</li>
                <li>소득 증빙이 어려운 경우 (프리랜서, 사업소득 등) 한도가 줄어들 수 있음</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">DSR 비율 해석</h3>
              <p>계산 결과에서 DSR이 40%로 표시되면, 소득의 40%를 대출 상환에 사용한다는 뜻입니다. 예를 들어:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>월 소득 500만 원, DSR 40% → 월 상환액 최대 200만 원</li>
                <li>DSR이 규제 한도에 근접할수록 추가 대출 여력이 줄어듦</li>
                <li>안전한 재무 관리를 위해서는 DSR 30% 이하를 권장</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">기존 대출과의 관계</h3>
              <p>기존 대출 월 상환액이 많을수록 신규 대출 한도가 줄어듭니다. 만약 추가 대출이 필요하다면:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>기존 대출 중 금리가 높은 것을 먼저 상환하여 DSR 여력 확보</li>
                <li>소득을 높이거나 맞벌이 소득을 합산하여 한도 증가</li>
                <li>대출 기간을 늘려 월 상환액을 줄이는 방법 고려 (단, 총 이자는 증가)</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 실제 은행 심사와의 차이</h3>
              <p>본 계산기는 DSR 규제만 반영한 예상치입니다. 실제 은행 심사에서는 추가로:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>신용등급별 차등 한도 적용 (1~3등급: 고한도, 4~6등급: 중한도, 7~10등급: 저한도)</li>
                <li>담보 가치 평가 (주택담보대출 시 감정평가 필수)</li>
                <li>재직 기간 및 소득 안정성 평가</li>
                <li>기존 금융 거래 이력 및 연체 여부 확인</li>
              </ul>
              <p className="mt-2"><strong>정확한 한도는 반드시 금융기관에 직접 문의하여 확인하세요.</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">금융 당국 및 규제 정보</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회</a> - DSR 규제 및 정책 발표</li>
                <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> - 대출 규제 안내 및 민원 상담</li>
                <li>• <a href="https://www.bok.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국은행</a> - 금융안정 보고서 및 통계</li>
                <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> - 주택담보대출 상품 안내</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">대출 한도 및 금리 비교</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> - 은행별 대출 상품 비교</li>
                <li>• <a href="https://www.kfb.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">은행연합회</a> - 대출 제도 및 이용 안내</li>
                <li>• <a href="https://www.credit4u.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신용회복위원회</a> - 신용 관리 및 채무 상담</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600">※ DSR 규제는 정책에 따라 변경될 수 있으며, 금융기관별로 세부 기준이 다를 수 있습니다. 대출 신청 전 반드시 최신 정보를 확인하시기 바랍니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DisclaimerNotice message="본 계산 결과는 DSR 규제 기준 예상치이며, 실제 대출 한도는 신용등급, 담보 가치, 금융기관 심사 기준, 소득 증빙 방식, 기타 부채 상황 등에 따라 크게 달라질 수 있습니다. 정확한 한도는 반드시 금융기관에 문의하세요." />

      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 DSR 규제 안내</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">DSR(총부채원리금상환비율)이란?</p>
              <p className="ml-4">모든 대출의 연간 원리금 상환액을 연 소득으로 나눈 비율입니다.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">일반적인 DSR 한도</p>
              <ul className="space-y-1 ml-4">
                <li>• 주택담보대출 (9억 이하): 40%</li>
                <li>• 주택담보대출 (9억 초과): 규제 강화</li>
                <li>• 기타 대출 (신용대출 등): 40~50%</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">실제 한도에 영향을 주는 요소</p>
              <ul className="space-y-1 ml-4">
                <li>• 신용등급 (1~10등급)</li>
                <li>• 담보 가치 (주택담보대출의 경우 LTV 규제)</li>
                <li>• 소득 증빙 방법 (근로소득, 사업소득, 기타소득)</li>
                <li>• 연령 및 재직 기간</li>
                <li>• 금융기관별 내부 심사 기준</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">⚠️ 주의사항</p>
              <ul className="space-y-1 ml-4">
                <li>• 본 계산기는 단순 DSR 기준만 고려합니다</li>
                <li>• LTV(주택담보인정비율), DTI(총부채상환비율) 등 다른 규제는 미반영</li>
                <li>• 실제 대출 심사에서는 추가 서류와 조건 확인 필요</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 슬라이더 스타일 ─────────────────────────────────────── */}
      <style jsx>{`
        .slider-light {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
        .slider-light::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
          transition: box-shadow 0.15s;
        }
        .slider-light::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3);
        }
        .slider-light::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  )
}
