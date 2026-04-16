'use client'

import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
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
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }} className="font-bold">{fmtWon(payload[0].value)}</p>
    </div>
  )
}

/* ─── 프리셋 ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: '💼 직장인 초급', income: 3_000_000, expenses: 800_000,   repayment: 500_000 },
  { label: '👔 직장인 중급', income: 5_000_000, expenses: 1_500_000, repayment: 1_000_000 },
  { label: '🏢 고소득자',    income: 10_000_000, expenses: 3_000_000, repayment: 2_000_000 },
]

const PIE_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#e5e7eb']

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function RepaymentBurdenCalculatorPage() {
  const [income,    setIncome]    = useState(5_000_000)
  const [expenses,  setExpenses]  = useState(1_500_000)
  const [repayment, setRepayment] = useState(1_000_000)

  const result = useMemo(() => {
    const ratio     = income > 0 ? (repayment / income) * 100 : 0
    const available = Math.max(0, income - expenses - repayment)
    const deficit   = Math.max(0, expenses + repayment - income)
    const status    = ratio < 30 ? 'stable' : ratio < 40 ? 'caution' : 'burden'
    return { ratio, available, deficit, status }
  }, [income, expenses, repayment])

  const heroGrad =
    result.status === 'stable'  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' :
    result.status === 'caution' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' :
                                  'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'

  const heroLabel =
    result.status === 'stable'  ? '✅ 안정 구간' :
    result.status === 'caution' ? '⚠️ 주의 구간' : '🚨 과부담 구간'

  const capExpenses  = Math.min(expenses, income)
  const capRepayment = Math.min(repayment, Math.max(0, income - capExpenses))
  const capAvailable = Math.max(0, income - capExpenses - capRepayment)

  const pieData = [
    { name: '고정지출',   value: capExpenses,  fill: '#f59e0b' },
    { name: '대출상환',   value: capRepayment, fill: '#ef4444' },
    { name: '가용소득',   value: capAvailable, fill: '#10b981' },
    ...(result.deficit > 0 ? [{ name: '초과분', value: result.deficit, fill: '#e5e7eb' }] : []),
  ]

  return (
    <div className="container max-w-6xl py-8">
      {/* ── 헤더 ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">월 상환 부담 체감 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          소득 대비 대출 상환 비중과 남은 가용 소득을 즉시 확인합니다
        </p>
      </div>

      {/* ── 2컬럼 ── */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">

        {/* ── 입력 패널 ── */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 lg:mb-0">
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => { setIncome(p.income); setExpenses(p.expenses); setRepayment(p.repayment) }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                  {p.label}
                </button>
              ))}
            </div>
            <div className="space-y-7">
              <SliderInput label="월 소득 (세후)" value={income} min={1_000_000} max={20_000_000} step={100_000}
                onChange={setIncome} displayValue={fmtWon(income)} />
              <SliderInput label="월 고정지출 (월세·관리비 등)" value={expenses} min={0} max={10_000_000} step={100_000}
                onChange={setExpenses} displayValue={expenses === 0 ? '없음' : fmtWon(expenses)} />
              <SliderInput label="월 대출 상환액" value={repayment} min={0} max={10_000_000} step={50_000}
                onChange={setRepayment} displayValue={fmtWon(repayment)} />
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="space-y-5 mt-8 lg:mt-0">

          {/* 히어로: 상환 비중 */}
          <div className="rounded-2xl p-6 sm:p-8 text-white" style={{ background: heroGrad }}>
            <p className="text-white/70 text-sm mb-1">{heroLabel} — 소득 대비 상환 비중</p>
            <p className="text-5xl font-bold tracking-tight mb-1">{result.ratio.toFixed(1)}%</p>
            <p className="text-white/60 text-xs mt-3">
              30% 미만: 안정 &nbsp;·&nbsp; 30~40%: 주의 &nbsp;·&nbsp; 40% 이상: 과부담
            </p>
          </div>

          {/* KPI 3개 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-600 mb-1">가용 소득</p>
              <p className="text-base font-bold text-emerald-800 leading-tight">{fmtWon(result.available)}</p>
            </div>
            <div className="rounded-xl p-4 bg-red-50 border border-red-100">
              <p className="text-xs text-red-500 mb-1">월 상환액</p>
              <p className="text-base font-bold text-red-700 leading-tight">{fmtWon(repayment)}</p>
            </div>
            <div className="rounded-xl p-4 bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-600 mb-1">고정지출</p>
              <p className="text-base font-bold text-amber-800 leading-tight">{fmtWon(expenses)}</p>
            </div>
          </div>

          {/* 파이 차트 — 소득 구성 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">월 소득 구성</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={70}
                      paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={600}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {pieData.filter(d => d.value > 0).map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.fill }} />
                    <span className="text-sm text-gray-500">{d.name}</span>
                    <span className="ml-auto font-bold text-gray-900 text-sm">{fmtWon(d.value)}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {income > 0 ? `${((d.value / income) * 100).toFixed(0)}%` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 부담 게이지 바 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-3">상환 부담 게이지</h3>
            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(result.ratio, 100)}%`,
                  background: result.status === 'stable' ? '#10b981' : result.status === 'caution' ? '#f59e0b' : '#ef4444',
                }} />
              <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-gray-400/60" />
              <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-gray-600/60" />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span className="text-green-600 font-semibold">30% 안정</span>
              <span className="text-amber-500 font-semibold">40% 주의</span>
              <span>100%</span>
            </div>
          </div>

          {/* 계산식 */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
            <p>• 상환 비중 = 월 상환액 ÷ 월 소득 × 100</p>
            <p>• 가용 소득 = 월 소득 − 고정지출 − 월 상환액</p>
          </div>

        </div>
      </div>

      {/* ── 하단 가이드 ── */}
      <div className="space-y-6 mt-8">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">💡 상환 부담 기준이 왜 중요한가요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">안정 구간 (30% 미만)</h3>
              <p>월 소득의 30% 미만을 대출 상환에 사용하는 경우입니다. 식비, 여가비, 저축 등 다른 지출에 충분한 여유가 있으며, 갑작스러운 소득 감소나 추가 지출이 생겨도 버틸 수 있는 수준입니다.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">주의 구간 (30~40%)</h3>
              <p>관리가 필요한 수준입니다. 지출 계획을 꼼꼼히 세우고 비상자금을 충분히 확보해야 합니다. 추가 대출은 신중하게 결정하세요.</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">과부담 구간 (40% 이상)</h3>
              <p>생활비 부담이 커지고 재무 리스크가 높은 수준입니다. 중도상환을 검토하거나, 대출 구조 조정 및 지출 절감 계획이 필요합니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">📐 상환 부담 줄이는 방법</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">대출 금리 낮추기</h3>
              <p>현재 대출 금리가 높다면 금리 비교 후 대환 대출을 고려하세요. 금리가 1%p 내려가도 월 상환액이 수만 원에서 수십만 원 차이가 날 수 있습니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-semibold text-purple-900 mb-2">상환 기간 조정</h3>
              <p>상환 기간을 늘리면 월 부담이 줄어들지만 총 이자는 증가합니다. 반대로 기간을 줄이면 월 부담은 크지만 이자를 절감할 수 있습니다. 현재 가용 소득 상황에 맞게 조정하세요.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">고정지출 점검</h3>
              <p>월세, 통신비, 보험료 등 고정지출을 정기적으로 점검하고 불필요한 항목을 정리하면 가용 소득이 늘어납니다. 가용 소득이 늘면 대출 조기 상환 여력도 생깁니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="space-y-1.5 ml-2">
              <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> — 가계부채 관리 안내</li>
              <li>• <a href="https://www.bok.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국은행</a> — 금융안정 보고서</li>
              <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> — 대출 금리 비교</li>
            </ul>
          </div>
        </div>

        <DisclaimerNotice message="본 계산 결과는 참고용 예상치이며, 실제 가계 재무 상황은 개인마다 다릅니다. 정확한 재무 계획은 전문 금융 상담사와 상담하세요." />

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 건강한 가계 재무 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>상환 비중 30% 이하:</strong> 월 소득의 30% 이내로 대출 상환액을 유지하세요.</li>
            <li>• <strong>비상자금 3~6개월치:</strong> 월 생활비의 3~6배를 비상자금으로 별도 보관하세요.</li>
            <li>• <strong>저축률 10% 이상:</strong> 상환 후에도 소득의 10% 이상은 저축·투자에 배분하세요.</li>
            <li>• <strong>고금리 대출 우선 상환:</strong> 여러 대출이 있다면 금리가 높은 것부터 상환하는 것이 유리합니다.</li>
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
