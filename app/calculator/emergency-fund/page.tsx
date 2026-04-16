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

/* ─── 프리셋 ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: '👤 1인 가구',    expenses: 1_500_000 },
  { label: '👫 2인 가구',    expenses: 3_000_000 },
  { label: '👨‍👩‍👧 가족 (3~4인)', expenses: 5_000_000 },
]

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function EmergencyFundCalculatorPage() {
  const [expenses, setExpenses] = useState(3_000_000)

  const result = useMemo(() => ({
    three:  expenses * 3,
    six:    expenses * 6,
    twelve: expenses * 12,
  }), [expenses])

  const tiers = [
    { label: '3개월', value: result.three,  color: '#6366f1', bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-800', sub: '최소 권장' },
    { label: '6개월', value: result.six,    color: '#10b981', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800', sub: '일반 권장' },
    { label: '12개월', value: result.twelve, color: '#f59e0b', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-800', sub: '자영업자 권장' },
  ]

  return (
    <div className="container max-w-6xl py-8">
      {/* ── 헤더 ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">비상자금 필요 금액 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          월 생활비를 입력하면 권장 비상자금 금액을 즉시 확인합니다
        </p>
      </div>

      {/* ── 2컬럼 ── */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">

        {/* ── 입력 패널 ── */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 lg:mb-0">
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => setExpenses(p.expenses)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                  {p.label}
                </button>
              ))}
            </div>
            <SliderInput
              label="월 생활비 (고정지출 포함)"
              value={expenses} min={500_000} max={10_000_000} step={100_000}
              onChange={setExpenses} displayValue={fmtWon(expenses)}
            />
            <p className="text-xs text-gray-400 mt-3 text-center">주거비 · 식비 · 통신비 · 보험료 등 매월 필수 지출 합계</p>

            {/* 비상자금 설명 박스 */}
            <div className="mt-6 rounded-2xl bg-white border border-indigo-100 p-4 space-y-2 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs">🛡️ 비상자금이란?</p>
              <p>실직, 질병, 갑작스러운 지출 등 예상치 못한 상황에 대비해 즉시 인출 가능한 형태로 보관하는 예비 자금입니다.</p>
              <p className="text-xs text-gray-400">재무 전문가들은 3~6개월치 생활비를 권장합니다.</p>
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="space-y-5 mt-8 lg:mt-0">

          {/* 히어로: 6개월 권장 */}
          <div className="rounded-2xl p-6 sm:p-8 text-white"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
            <p className="text-white/70 text-sm mb-1">🛡️ 일반 권장 비상자금 (6개월)</p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-1">{fmtWon(result.six)}</p>
            <p className="text-white/60 text-xs mt-3">월 생활비 {fmtWon(expenses)} × 6개월</p>
          </div>

          {/* 3단계 카드 */}
          <div className="grid grid-cols-3 gap-3">
            {tiers.map(t => (
              <div key={t.label} className={`rounded-xl p-4 border ${t.bg}`}>
                <p className={`text-xs font-semibold mb-1 ${t.text.replace('800', '600')}`}>{t.label}</p>
                <p className={`text-base font-bold leading-tight ${t.text}`}>{fmtWon(t.value)}</p>
                <p className={`text-[11px] mt-1 ${t.text.replace('800', '500')}`}>{t.sub}</p>
              </div>
            ))}
          </div>

          {/* 목표 달성 진행 바 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">비상자금 단계별 목표</h3>
            <div className="space-y-4">
              {tiers.map(t => {
                const pct = (t.value / result.twelve) * 100
                return (
                  <div key={t.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{t.label} ({t.sub})</span>
                      <span className="font-bold text-gray-900">{fmtWon(t.value)}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: t.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 월별 저축 시나리오 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-3">6개월 목표 달성까지</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: '6개월 달성', monthly: Math.ceil(result.six / 6) },
                { label: '12개월 달성', monthly: Math.ceil(result.six / 12) },
                { label: '24개월 달성', monthly: Math.ceil(result.six / 24) }].map(s => (
                <div key={s.label} className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-center">
                  <p className="text-xs text-indigo-600 mb-1">{s.label}</p>
                  <p className="text-sm font-bold text-indigo-800">{fmtWon(s.monthly)}<span className="text-xs font-normal">/월</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* 계산식 */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
            <p>• 3개월 권장 = 월 생활비 × 3</p>
            <p>• 6개월 권장 = 월 생활비 × 6</p>
            <p>• 12개월 권장 = 월 생활비 × 12 (자영업자·프리랜서)</p>
          </div>

        </div>
      </div>

      {/* ── 하단 가이드 ── */}
      <div className="space-y-6 mt-8">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">💡 비상자금이 꼭 필요한 이유</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">1. 갑작스러운 실직 또는 소득 중단</h3>
              <p>직장을 잃거나 사업이 어려워질 경우, 재취업하거나 회복하는 데 수개월이 걸릴 수 있습니다. 비상자금이 없다면 생활비를 마련하기 위해 고금리 대출을 받아야 할 수도 있습니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">2. 예상치 못한 의료비·수리비</h3>
              <p>큰 병원비, 자동차 고장, 집 수리 등 예측 불가능한 큰 지출이 생길 수 있습니다. 비상자금이 있으면 투자 계획이나 대출 상환 계획에 영향을 주지 않고 대응할 수 있습니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-semibold text-purple-900 mb-2">3. 심리적 안정과 더 나은 의사결정</h3>
              <p>재정적 완충이 있으면 급하게 잘못된 결정을 내리지 않을 수 있습니다. 비상자금이 충분하면 불리한 조건의 긴급 대출을 피하고, 더 좋은 조건을 기다릴 여유가 생깁니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">📐 비상자금 적정 규모와 보관 방법</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-indigo-50 p-4 rounded-xl">
              <h3 className="font-semibold text-indigo-900 mb-2">직장인 — 3~6개월</h3>
              <p>안정적인 급여 소득이 있는 직장인은 3~6개월치가 적당합니다. 재취업 시장이 빠르고 직군이 안정적일수록 3개월, 특수 직군이거나 경쟁이 치열한 분야라면 6개월을 목표로 하세요.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">자영업자·프리랜서 — 6~12개월</h3>
              <p>소득이 불규칙한 경우 최소 6개월, 가능하면 12개월치 비상자금을 목표로 하세요. 비수기가 있는 업종이라면 그 기간을 고려해 더 넉넉하게 준비하는 것이 좋습니다.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">보관 방법</h3>
              <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                <li><strong>즉시 인출 가능:</strong> 파킹통장, 수시입출금식 예금 등 언제든 꺼낼 수 있어야 합니다.</li>
                <li><strong>예금자 보호:</strong> 1금융권 또는 예금자 보호 상품에 보관하세요.</li>
                <li><strong>생활비와 분리:</strong> 주거래 통장과 별도 계좌에 보관해 사용 유혹을 줄이세요.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="space-y-1.5 ml-2">
              <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> — 금융소비자 교육 자료</li>
              <li>• <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회</a> — 가계 재무 건전성 가이드</li>
              <li>• <a href="https://www.credit4u.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신용회복위원회</a> — 재무 상담 안내</li>
            </ul>
            <p className="text-xs text-gray-500 bg-white rounded-lg p-3 mt-2">※ 적정 비상자금 규모는 개인의 직업 안정성, 가족 구성, 지출 패턴에 따라 다를 수 있습니다.</p>
          </div>
        </div>

        <DisclaimerNotice message="본 계산 결과는 참고용 예상치이며, 개인의 재무 상황에 따라 필요한 비상자금 규모는 달라질 수 있습니다. 자세한 재무 계획은 전문 금융 상담사와 상담하세요." />

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 비상자금 마련 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>목표 금액 설정:</strong> 월 생활비 × 3~6개월을 목표로 세우세요.</li>
            <li>• <strong>별도 계좌 개설:</strong> 생활비 계좌와 분리된 비상자금 전용 계좌를 만드세요.</li>
            <li>• <strong>자동이체 설정:</strong> 월급날 자동으로 일정 금액이 이체되도록 설정하면 쉽게 모을 수 있습니다.</li>
            <li>• <strong>정기 점검:</strong> 생활비 변동 시 비상자금 목표도 함께 조정하세요.</li>
            <li>• <strong>사용 원칙 정하기:</strong> 어떤 상황에서만 쓸 것인지 미리 기준을 세워두세요.</li>
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
