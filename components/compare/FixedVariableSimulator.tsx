'use client'

import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MarketRates } from '@/lib/finlife/market'
import {
  buildScenarioCurve,
  findBreakEven,
  simulateFixed,
  simulateVariable,
} from '@/lib/finlife/rate-scenario'
import type { LoanProductType } from '@/lib/finlife/types'

// ─── 입력 데이터 ────────────────────────────────────────────────────────────

export interface MarketOption {
  productType: LoanProductType
  label: string
  market: MarketRates
  /** 공시월 표기 (예: "2026년 7월") */
  disclosureMonth: string | null
}

// ─── 표시 헬퍼 ──────────────────────────────────────────────────────────────

/** 원 단위를 억/만원 표기로 (예: 302410000 → "3억 241만원") */
function formatKRW(value: number): string {
  const won = Math.round(value)
  if (won === 0) return '0원'
  const sign = won < 0 ? '-' : ''
  const abs = Math.abs(won)
  const eok = Math.floor(abs / 100_000_000)
  const man = Math.floor((abs % 100_000_000) / 10_000)
  if (eok > 0) return `${sign}${eok}억${man > 0 ? ` ${man.toLocaleString()}만` : ''}원`
  if (man > 0) return `${sign}${man.toLocaleString()}만원`
  return `${sign}${abs.toLocaleString()}원`
}

function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString()}원`
}

// ─── 슬라이더 ───────────────────────────────────────────────────────────────

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  displayValue: string
  onChange: (v: number) => void
  hint?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <span className="text-indigo-700 font-bold text-base">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${pct}%, #c7d2fe ${pct}%, #c7d2fe 100%)`,
        }}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ─── 본체 ───────────────────────────────────────────────────────────────────

export default function FixedVariableSimulator({ options }: { options: MarketOption[] }) {
  const [productIndex, setProductIndex] = useState(0)
  const active = options[productIndex]

  const [amount, setAmount] = useState(300_000_000)
  const [years, setYears] = useState(30)
  const [fixedRate, setFixedRate] = useState(active.market.fixed?.avg ?? 5)
  const [variableRate, setVariableRate] = useState(active.market.variable?.avg ?? 4.5)
  const [changeAfter, setChangeAfter] = useState(3)
  const [riseDelta, setRiseDelta] = useState(1)

  /** 시장 평균으로 되돌린다 — 사용자가 만진 뒤 기준으로 돌아올 수 있어야 한다 */
  function applyMarket(index: number) {
    const target = options[index]
    setProductIndex(index)
    if (target.market.fixed) setFixedRate(target.market.fixed.avg)
    if (target.market.variable) setVariableRate(target.market.variable.avg)
  }

  const months = years * 12
  /** 기간을 줄였을 때 상승 시점이 만기를 넘지 않도록 (슬라이더 값과 계산을 일치시킨다) */
  const changeAfterYears = Math.min(changeAfter, Math.max(0, years - 1))

  const result = useMemo(() => {
    const fixed = simulateFixed(amount, months, fixedRate)
    const flat = simulateFixed(amount, months, variableRate)
    const risen = simulateVariable(amount, months, variableRate, changeAfterYears, variableRate + riseDelta)
    const breakEven = findBreakEven(amount, months, fixedRate, variableRate, changeAfterYears)
    const curve = buildScenarioCurve(amount, months, fixedRate, variableRate, changeAfterYears, 3, 30)
    return { fixed, flat, risen, breakEven, curve }
  }, [amount, months, fixedRate, variableRate, changeAfterYears, riseDelta])

  /** 설정한 시나리오에서 변동금리가 고정금리보다 더 낸 금액 (음수면 이득) */
  const scenarioGap = result.risen.totalInterest - result.fixed.totalInterest
  const variableWins = scenarioGap < 0

  const { breakEven } = result
  const market = active.market

  return (
    <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">
      {/* ── 입력 ────────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-8">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 space-y-5">
          {/* 상품 탭 */}
          <div className="flex gap-2">
            {options.map((opt, i) => (
              <button
                key={opt.productType}
                onClick={() => applyMarket(i)}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  i === productIndex
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <SliderInput
            label="대출금액"
            value={amount}
            min={10_000_000}
            max={1_000_000_000}
            step={10_000_000}
            displayValue={formatKRW(amount)}
            onChange={setAmount}
            hint={`${(amount / 100_000_000).toFixed(1)}억원`}
          />

          <SliderInput
            label="대출기간"
            value={years}
            min={1}
            max={40}
            step={1}
            displayValue={`${years}년`}
            onChange={setYears}
            hint={`${months}개월 · 원리금균등 상환 기준`}
          />

          <div className="border-t border-indigo-100 pt-5 space-y-5">
            <SliderInput
              label="고정금리"
              value={fixedRate}
              min={1}
              max={12}
              step={0.01}
              displayValue={`연 ${fixedRate.toFixed(2)}%`}
              onChange={setFixedRate}
              hint={
                market.fixed
                  ? `공시 평균 ${market.fixed.avg}% · 범위 ${market.fixed.min}~${market.fixed.max}%`
                  : '공시 데이터 없음'
              }
            />

            <SliderInput
              label="변동금리 (현재)"
              value={variableRate}
              min={1}
              max={12}
              step={0.01}
              displayValue={`연 ${variableRate.toFixed(2)}%`}
              onChange={setVariableRate}
              hint={
                market.variable
                  ? `공시 평균 ${market.variable.avg}% · 범위 ${market.variable.min}~${market.variable.max}%`
                  : '공시 데이터 없음'
              }
            />

            <button
              onClick={() => applyMarket(productIndex)}
              className="w-full px-3 py-2 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              ↺ 금감원 공시 평균으로 되돌리기
            </button>
          </div>

          <div className="border-t border-indigo-100 pt-5 space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              변동금리 상승 가정
            </p>

            <SliderInput
              label="언제 오를까"
              value={changeAfterYears}
              min={0}
              max={Math.max(1, years - 1)}
              step={1}
              displayValue={changeAfterYears === 0 ? '지금 바로' : `${changeAfterYears}년 뒤`}
              onChange={setChangeAfter}
              hint="이후 만기까지 그 금리가 유지된다고 봅니다"
            />

            <SliderInput
              label="얼마나 오를까"
              value={riseDelta}
              min={0}
              max={5}
              step={0.05}
              displayValue={`+${riseDelta.toFixed(2)}%p`}
              onChange={setRiseDelta}
              hint={`${variableRate.toFixed(2)}% → ${(variableRate + riseDelta).toFixed(2)}%`}
            />
          </div>
        </div>

        {/* 데이터 출처 */}
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          기본 금리는 금융감독원 「금융상품 통합 비교공시」
          {active.disclosureMonth ? ` ${active.disclosureMonth}` : ''} 기준
          {market.fixed && market.variable
            ? ` 고정 ${market.fixed.count}건 · 변동 ${market.variable.count}건`
            : ''}
          의 상품 평균입니다.
        </p>
      </div>

      {/* ── 결과 ────────────────────────────────────────────────── */}
      <div className="space-y-6 mt-8 lg:mt-0">
        {/* 손익분기 히어로 */}
        <div
          className="rounded-2xl p-6 sm:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
        >
          <p className="text-indigo-200 text-sm mb-1">
            {changeAfterYears === 0 ? '지금' : `${changeAfterYears}년 뒤`} 변동금리가 이만큼 넘게 오르면
            고정금리가 유리해집니다
          </p>

          {breakEven.alreadyWorse ? (
            <>
              <p className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                지금도 고정금리가 유리
              </p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                변동금리(연 {variableRate.toFixed(2)}%)가 고정금리(연 {fixedRate.toFixed(2)}%)보다
                높습니다. 금리가 오르지 않아도 고정금리 쪽 총이자가 적습니다.
              </p>
            </>
          ) : breakEven.deltaPoints === null ? (
            <>
              <p className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">뒤집히지 않음</p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                남은 기간이 짧아, 변동금리가 크게 올라도 총이자가 고정금리를 넘지 않습니다.
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">
                +{breakEven.deltaPoints.toFixed(2)}%p
              </p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                변동금리가 연 {variableRate.toFixed(2)}% → <strong>{breakEven.breakEvenRate}%</strong>{' '}
                이상이 되는 순간부터, 만기까지 총이자가 고정금리(연 {fixedRate.toFixed(2)}%)보다
                많아집니다.
              </p>
            </>
          )}
        </div>

        {/* 지금 설정한 시나리오 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-700 mb-4">
            설정한 시나리오 — {changeAfterYears === 0 ? '지금 바로' : `${changeAfterYears}년 뒤`} +
            {riseDelta.toFixed(2)}%p 상승
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-2xl p-4 bg-indigo-600 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">
                고정 {fixedRate.toFixed(2)}%
              </p>
              <p className="text-lg font-extrabold leading-tight">
                {formatKRW(result.fixed.totalInterest)}
              </p>
              <p className="text-xs text-indigo-200 mt-1">
                월 {formatWon(result.fixed.monthlyBefore)} 고정
              </p>
            </div>

            <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                변동 · 안 오르면
              </p>
              <p className="text-lg font-extrabold leading-tight text-gray-900">
                {formatKRW(result.flat.totalInterest)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                월 {formatWon(result.flat.monthlyBefore)} 유지
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 border shadow-sm ${
                variableWins ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                변동 · 오르면
              </p>
              <p
                className={`text-lg font-extrabold leading-tight ${
                  variableWins ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatKRW(result.risen.totalInterest)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                월 {formatWon(result.risen.monthlyBefore)} → {formatWon(result.risen.monthlyAfter)}
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl p-4 text-center ${
              variableWins ? 'bg-emerald-600' : 'bg-red-500'
            } text-white`}
          >
            <p className="text-xs opacity-90 mb-1">
              이 시나리오에서 {variableWins ? '변동금리' : '고정금리'}가 유리합니다
            </p>
            <p className="text-2xl font-bold tracking-tight">
              총이자 {formatKRW(Math.abs(scenarioGap))} 차이
            </p>
            {!variableWins && (
              <p className="text-xs opacity-90 mt-1">
                금리 상승 후 월 부담이{' '}
                {formatWon(result.risen.monthlyAfter - result.risen.monthlyBefore)} 늘어납니다
              </p>
            )}
          </div>
        </div>

        {/* 곡선 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-700 mb-1">
            변동금리 상승폭에 따른 총이자
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            두 선이 만나는 지점이 손익분기입니다. 그 오른쪽은 고정금리가 유리한 구간입니다.
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={result.curve} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="delta"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => `+${v}%p`}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => `${Math.round(Number(v) / 100_000_000)}억`}
                width={40}
              />
              <Tooltip
                formatter={(value, name) => [formatKRW(Number(value)), String(name)]}
                labelFormatter={(label) => `변동금리 +${label}%p 상승 시`}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
              {breakEven.deltaPoints !== null && !breakEven.alreadyWorse && (
                <ReferenceLine
                  x={result.curve.reduce((best, p) =>
                    Math.abs(p.delta - (breakEven.deltaPoints as number)) <
                    Math.abs(best.delta - (breakEven.deltaPoints as number))
                      ? p
                      : best
                  ).delta}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: '손익분기', position: 'top', fill: '#f59e0b', fontSize: 11 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="fixed"
                name="고정금리"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="variable"
                name="변동금리"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 계산 방식 */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
          <p>• 두 유형 모두 원리금균등 상환으로 계산합니다</p>
          <p>
            • 변동금리는 설정한 시점에 한 번 오른 뒤 만기까지 유지된다고 가정합니다. 상승 시점에
            남은 잔액·잔여기간으로 월납입액을 다시 계산합니다 (실제 은행의 재산정 방식)
          </p>
          <p>• 손익분기는 두 유형의 만기까지 총이자가 같아지는 상승폭입니다</p>
          <p>
            • 중도상환수수료·인지세·근저당설정비 등 부대비용과 우대금리는 반영하지 않았습니다
          </p>
        </div>
      </div>

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
