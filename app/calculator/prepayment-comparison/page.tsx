'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
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
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}억원`
  if (abs >= 10_000) return `${sign}${Math.round(abs / 10_000).toLocaleString()}만원`
  return `${sign}${Math.round(abs).toLocaleString()}원`
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
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p style={{ color: payload[0].fill }} className="font-bold">{fmtWon(payload[0].value)}</p>
    </div>
  )
}

/* ─── 프리셋 ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: '💰 소액 상환',  balance: 30_000_000,  prepay: 10_000_000,  rate: 5.5, months: 60,  fee: 1.5 },
  { label: '🏠 주담대 일부', balance: 200_000_000, prepay: 50_000_000,  rate: 4.2, months: 240, fee: 1.2 },
  { label: '🔄 전액 상환',  balance: 100_000_000, prepay: 100_000_000, rate: 5.0, months: 120, fee: 1.0 },
]

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function PrepaymentComparisonCalculatorPage() {
  const [balance,  setBalance]  = useState(200_000_000)
  const [prepay,   setPrepay]   = useState(50_000_000)
  const [rate,     setRate]     = useState(4.2)
  const [months,   setMonths]   = useState(240)
  const [feeRate,  setFeeRate]  = useState(1.2)

  const result = useMemo(() => {
    const safePrepay  = Math.min(prepay, balance)
    const monthlyRate = rate / 12 / 100

    const remainingInterest = balance * monthlyRate * months
    const interestSaved     = safePrepay * monthlyRate * months
    const prepaymentFee     = safePrepay * (feeRate / 100)
    const netBenefit        = interestSaved - prepaymentFee

    return { remainingInterest, interestSaved, prepaymentFee, netBenefit }
  }, [balance, prepay, rate, months, feeRate])

  const isProfit = result.netBenefit >= 0

  const chartData = [
    { name: '유지 시 총 이자',  value: Math.round(result.remainingInterest), fill: '#94a3b8' },
    { name: '이자 절감액',      value: Math.round(result.interestSaved),     fill: '#10b981' },
    { name: '중도상환 수수료',  value: Math.round(result.prepaymentFee),     fill: '#ef4444' },
    { name: '순 차이',          value: Math.round(Math.abs(result.netBenefit)), fill: isProfit ? '#6366f1' : '#f59e0b' },
  ]

  const applyPreset = (p: typeof PRESETS[0]) => {
    setBalance(p.balance); setPrepay(p.prepay); setRate(p.rate)
    setMonths(p.months); setFeeRate(p.fee)
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* ── 헤더 ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">중도상환 vs 유지 비교 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          중도상환 시 이자 절감액과 수수료를 비교해 실제 유불리를 즉시 확인합니다
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
              <SliderInput label="남은 대출 잔액" value={balance} min={1_000_000} max={1_000_000_000} step={1_000_000}
                onChange={setBalance} displayValue={fmtWon(balance)} />
              <SliderInput label="중도상환 예정 금액" value={Math.min(prepay, balance)} min={1_000_000} max={balance} step={1_000_000}
                onChange={setPrepay} displayValue={fmtWon(Math.min(prepay, balance))} />
              <SliderInput label="현재 연 금리" value={rate} min={1} max={20} step={0.1}
                onChange={setRate} displayValue={`${rate.toFixed(1)}%`} />
              <SliderInput label="잔여 상환 기간" value={months} min={6} max={360} step={6}
                onChange={setMonths} displayValue={`${months / 12 >= 1 ? `${(months / 12).toFixed(months % 12 === 0 ? 0 : 1)}년` : ''} ${months % 12 !== 0 || months < 12 ? `${months % 12 || months}개월` : ''}`.trim()} />
              <SliderInput label="중도상환 수수료율" value={feeRate} min={0} max={3} step={0.1}
                onChange={setFeeRate} displayValue={`${feeRate.toFixed(1)}%`} />
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="space-y-5 mt-8 lg:mt-0">

          {/* 히어로: 순 차이 */}
          <div className="rounded-2xl p-6 sm:p-8 text-white" style={{
            background: isProfit
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          }}>
            <p className="text-white/70 text-sm mb-1">
              {isProfit ? '✅ 중도상환 권장 — 순 절감액' : '⚠️ 신중 검토 필요 — 순 손실액'}
            </p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-1">
              {isProfit ? '+' : '-'}{fmtWon(Math.abs(result.netBenefit))}
            </p>
            <p className="text-white/60 text-xs mt-3">
              이자 절감액 {fmtWon(result.interestSaved)} − 수수료 {fmtWon(result.prepaymentFee)}
            </p>
          </div>

          {/* 유지 vs 상환 비교 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">유지 시 남은 총 이자</p>
              <p className="text-lg font-bold text-gray-800 leading-tight">{fmtWon(result.remainingInterest)}</p>
            </div>
            <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-600 mb-1">이자 절감액</p>
              <p className="text-lg font-bold text-emerald-800 leading-tight">{fmtWon(result.interestSaved)}</p>
            </div>
            <div className="rounded-xl p-4 bg-red-50 border border-red-100">
              <p className="text-xs text-red-500 mb-1">중도상환 수수료</p>
              <p className="text-lg font-bold text-red-700 leading-tight">{fmtWon(result.prepaymentFee)}</p>
            </div>
            <div className={`rounded-xl p-4 border ${isProfit ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
              <p className={`text-xs mb-1 ${isProfit ? 'text-indigo-600' : 'text-amber-600'}`}>순 차이</p>
              <p className={`text-lg font-bold leading-tight ${isProfit ? 'text-indigo-800' : 'text-amber-800'}`}>
                {isProfit ? '+' : '-'}{fmtWon(Math.abs(result.netBenefit))}
              </p>
            </div>
          </div>

          {/* 바 차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">금액 비교 차트</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmt(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 계산식 */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
            <p>• 유지 시 이자 = 잔액 × 월금리 × 잔여개월</p>
            <p>• 이자 절감액 = 상환금액 × 월금리 × 잔여개월</p>
            <p>• 수수료 = 상환금액 × 수수료율</p>
            <p>• 순 차이 = 이자 절감액 − 수수료</p>
            <p className="text-xs text-gray-400 pt-1">※ 단순 이자 기준 — 원리금균등 복리 효과 미반영</p>
          </div>

        </div>
      </div>

      {/* ── 하단 가이드 ── */}
      <div className="space-y-6 mt-8">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">💡 중도상환 vs 유지, 언제 상환이 유리할까요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">중도상환이 유리한 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>순 차이가 플러스 — 절감액이 수수료보다 큰 경우</li>
                <li>고금리 대출 (7% 이상) — 이자 절감 효과가 큼</li>
                <li>잔여 기간이 긴 경우 — 절감 기간이 길어 효과 극대화</li>
                <li>수수료 면제 기간이 지난 경우 — 수수료 없이 상환 가능</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">신중히 검토해야 하는 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>순 차이가 마이너스 — 수수료가 절감액보다 큰 경우</li>
                <li>수수료 면제 기간이 임박 — 수개월 후 면제라면 기다리는 게 유리</li>
                <li>비상자금 부족 — 유동성이 충분한지 먼저 확인</li>
                <li>주담대 이자 소득공제 — 상환 후 세제 혜택 상실 고려</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">📊 중도상환 시 고려사항</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">장점</h3>
              <ul className="list-disc list-inside space-y-1 ml-2 text-green-800">
                <li>총 이자 부담 감소</li>
                <li>대출 기간 단축 가능</li>
                <li>심리적 부담 경감</li>
                <li>DSR 여력 확보</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl">
              <h3 className="font-semibold text-amber-900 mb-2">고려사항</h3>
              <ul className="list-disc list-inside space-y-1 ml-2 text-amber-800">
                <li>수수료 발생 가능</li>
                <li>비상자금 감소</li>
                <li>다른 투자 기회 비용</li>
                <li>세제 혜택 상실 여부</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="space-y-1.5 ml-2">
              <li>• <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회</a> — 중도상환수수료 폐지 및 규제 정책</li>
              <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> — 금융소비자보호 안내</li>
              <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> — 대출 상품 비교</li>
            </ul>
            <p className="text-xs text-gray-500 bg-white rounded-lg p-3 mt-2">※ 중도상환수수료는 대출 계약서에 명시된 내용을 직접 확인하거나 금융기관에 문의하세요.</p>
          </div>
        </div>

        <DisclaimerNotice message="본 계산 결과는 단순 이자 기준 예상치이며, 실제 중도상환 효과는 상환 방식·금리 조건·수수료 등에 따라 달라질 수 있습니다." />

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 중도상환 전 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>수수료 면제 기간 확인:</strong> 대출 실행 후 3~5년이 지났다면 수수료 없이 상환 가능할 수 있습니다.</li>
            <li>• <strong>일부 vs 전액 상환:</strong> 전액 상환 시 수수료율이 다를 수 있으니 계약서를 확인하세요.</li>
            <li>• <strong>비상자금 확보:</strong> 상환 후에도 3~6개월치 생활비는 비상자금으로 유지하세요.</li>
            <li>• <strong>세제 혜택 검토:</strong> 주담대 이자 소득공제를 받고 있다면 상환 후 영향을 먼저 확인하세요.</li>
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
