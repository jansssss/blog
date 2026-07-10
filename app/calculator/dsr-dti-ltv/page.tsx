'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import MortgagePrepHubCTA from '@/components/MortgagePrepHubCTA'
import Link from 'next/link'
import { epiTotalInterest } from '@/lib/calculators'
import { DSR_REGULATION, dsrBasisLine, formatKoreanDate } from '@/lib/regulations'
import CalcMeta from '@/components/CalcMeta'

/* 가이드 예시: 3억·4.5% 주담대 상환기간 연장 시 총이자 증가분(공통 함수 산출) */
const exInterest240 = epiTotalInterest(300_000_000, 4.5, 240)
const exInterest360 = epiTotalInterest(300_000_000, 4.5, 360)
const exInterestGap = exInterest360 - exInterest240

/* ── 원리금균등 월 납입액 ── */
function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

/* ── 포맷 ── */
function fmt(n: number) { return new Intl.NumberFormat('ko-KR').format(Math.round(n)) }
function fmtShort(n: number) {
  if (n >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1).replace(/\.0$/, '')}억`
  if (n >= 1_000_0000)  return `${Math.round(n / 1_000_0000)}천만`
  if (n >= 10_000)      return `${Math.round(n / 10_000)}만`
  return fmt(n)
}

/* ── 비율 게이지 ── */
function RatioGauge({
  label, value, limit, color, subLabel,
}: {
  label: string; value: number; limit: number; color: string; subLabel: string
}) {
  const pct = Math.min((value / Math.max(limit * 1.5, 100)) * 100, 100)
  const limitPct = Math.min((limit / Math.max(limit * 1.5, 100)) * 100, 100)
  const safe = value <= limit * 0.7
  const warn = value > limit * 0.7 && value <= limit
  const over = value > limit

  const statusBg    = safe ? 'bg-emerald-100 text-emerald-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  const statusLabel = safe ? '안전' : warn ? '주의' : '초과'
  const barColor    = safe ? '#10b981' : warn ? '#f59e0b' : '#ef4444'

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900">{value.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBg}`}>{statusLabel}</span>
      </div>
      {/* 트랙 */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
        {/* 한도선 */}
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400"
          style={{ left: `${limitPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>0%</span>
        <span className="text-gray-600 font-medium">규제 한도 {limit}%</span>
        <span>{Math.max(limit * 1.5, 100).toFixed(0)}%</span>
      </div>
      {over && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
          한도 초과 {(value - limit).toFixed(1)}%p — 현재 조건으로 대출 승인 어려움
        </p>
      )}
    </div>
  )
}

/* ── SliderInput ── */
function SliderInput({
  label, unit, value, min, max, step, displayValue, onChange, hint,
}: {
  label: string; unit?: string; value: number; min: number; max: number; step: number
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
        style={{ background: `linear-gradient(to right,#6366f1 0%,#6366f1 ${pct}%,#c7d2fe ${pct}%,#c7d2fe 100%)` }}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

/* ── 프리셋 ── */
const PRESETS = [
  { label: '👤 직장인 주담대',    income: 50_000_000, existDebt: 300_000,  loanAmt: 300_000_000, rate: 40, months: 360, propVal: 500_000_000 },
  { label: '👩 맞벌이 아파트',   income: 90_000_000, existDebt: 500_000,  loanAmt: 400_000_000, rate: 38, months: 300, propVal: 700_000_000 },
  { label: '💳 신용대출 추가',    income: 40_000_000, existDebt: 600_000,  loanAmt:  30_000_000, rate: 65, months:  60, propVal:           0 },
]

/* ── 메인 ── */
export default function DsrDtiLtvCalculatorPage() {
  const [income,    setIncome]    = useState(60_000_000)   // 연 소득
  const [existDebt, setExistDebt] = useState(400_000)      // 기존 대출 월 원리금
  const [loanAmt,   setLoanAmt]   = useState(200_000_000)  // 신규 대출 금액
  const [rateX10,   setRateX10]   = useState(42)           // 금리 ×10
  const [months,    setMonths]    = useState(240)           // 상환 기간
  const [propVal,   setPropVal]   = useState(400_000_000)  // 담보 가치

  const rate = rateX10 / 10

  const result = useMemo(() => {
    const newMonthly  = pmt(loanAmt, rate, months)
    const newAnnual   = newMonthly * 12
    const existAnnual = existDebt * 12
    const dsr = income > 0 ? ((existAnnual + newAnnual) / income) * 100 : 0
    const dti = income > 0 ? ((newAnnual + existAnnual * 0.5) / income) * 100 : 0  // DTI: 신규 원리금 + 기타 이자
    const ltv = propVal > 0 ? (loanAmt / propVal) * 100 : 0

    // DSR 40% 기준 최대 추가 월 납입 가능액
    const maxMonthly  = (income / 12) * 0.4 - existDebt
    const dsrMaxLoan  = maxMonthly > 0
      ? maxMonthly * ((Math.pow(1 + rate/12/100, months) - 1) / (rate/12/100 * Math.pow(1 + rate/12/100, months)))
      : 0

    const stressRate = DSR_REGULATION.stressDsr.baseStressRate
    const stressNewMonthly = pmt(loanAmt, rate + stressRate, months)
    const stressDsr = income > 0 ? ((existDebt * 12 + stressNewMonthly * 12) / income) * 100 : 0

    return { newMonthly, dsr, dti, ltv, dsrMaxLoan, maxMonthly, stressDsr }
  }, [income, existDebt, loanAmt, rate, months, propVal])

  const chartData = [
    { name: 'DSR', value: parseFloat(result.dsr.toFixed(1)), limit: 40, fill: result.dsr > 40 ? '#ef4444' : result.dsr > 28 ? '#f59e0b' : '#10b981' },
    { name: 'DTI', value: parseFloat(result.dti.toFixed(1)), limit: 50, fill: result.dti > 50 ? '#ef4444' : result.dti > 35 ? '#f59e0b' : '#10b981' },
    ...(propVal > 0 ? [{ name: 'LTV', value: parseFloat(result.ltv.toFixed(1)), limit: 70, fill: result.ltv > 70 ? '#ef4444' : result.ltv > 50 ? '#f59e0b' : '#10b981' }] : []),
  ]

  return (
    <div className="container max-w-6xl py-8">

      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">DSR 계산기 — 내 소득과 기존 대출로 주담대 한도 계산</h1>
        <p className="text-muted-foreground text-sm sm:text-base">소득·기존 대출 월 납입액·신규 대출 조건을 입력하면 DSR·DTI·LTV와 최대 대출 한도를 즉시 계산합니다</p>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">

        {/* 입력 패널 */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 lg:mb-0">

            {/* 프리셋 */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {PRESETS.map(p => (
                <button key={p.label}
                  onClick={() => { setIncome(p.income); setExistDebt(p.existDebt); setLoanAmt(p.loanAmt); setRateX10(p.rate); setMonths(p.months); setPropVal(p.propVal) }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                >{p.label}</button>
              ))}
            </div>

            <div className="space-y-7">
              <SliderInput
                label="연 소득" value={income}
                min={10_000_000} max={500_000_000} step={1_000_000}
                displayValue={fmtShort(income)} onChange={setIncome}
                hint={`월 소득 ${fmtShort(income / 12)}원`}
              />
              <SliderInput
                label="기존 대출 월 원리금 합계" value={existDebt}
                min={0} max={5_000_000} step={50_000}
                displayValue={`${fmt(existDebt)}원`} onChange={setExistDebt}
                hint="현재 갚고 있는 모든 대출의 월 납입액 합계"
              />
              <SliderInput
                label="신규 대출 금액" value={loanAmt}
                min={1_000_000} max={1_500_000_000} step={5_000_000}
                displayValue={fmtShort(loanAmt)} onChange={setLoanAmt}
                hint={`${fmt(loanAmt)}원`}
              />
              <SliderInput
                label="신규 금리" unit="%" value={rateX10}
                min={10} max={200} step={1}
                displayValue={rate.toFixed(1)} onChange={setRateX10}
              />
              <SliderInput
                label="상환 기간" unit="개월" value={months}
                min={12} max={420} step={12}
                displayValue={`${months}`} onChange={setMonths}
                hint={`${Math.floor(months / 12)}년`}
              />
              <SliderInput
                label="담보(주택) 가치 — LTV용" value={propVal}
                min={0} max={3_000_000_000} step={10_000_000}
                displayValue={propVal > 0 ? fmtShort(propVal) : '담보 없음'} onChange={setPropVal}
                hint={propVal === 0 ? 'LTV 미적용 (신용대출 등)' : `${fmt(propVal)}원`}
              />
            </div>
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="space-y-5 mt-8 lg:mt-0">

          {/* 참고용 안내 */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
            이 결과는 기본 DSR·원리금균등 상환 기준의 <strong>참고용 추정치</strong>입니다.
            스트레스 DSR·지역 규제·소득 인정 방식·금융기관 내부 심사 기준은 반영되지 않습니다.
          </div>

          {/* 히어로: 핵심 비율 3개 */}
          <div
            className="rounded-2xl p-6 sm:p-8 text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
          >
            <p className="text-indigo-200 text-sm mb-3">신규 대출 후 나의 비율</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-indigo-300 text-xs mb-1">DSR</p>
                <p className="text-3xl font-bold">{result.dsr.toFixed(1)}<span className="text-lg">%</span></p>
                <p className={`text-xs mt-1 font-semibold ${result.dsr > 40 ? 'text-red-300' : 'text-indigo-200'}`}>
                  {result.dsr > 40 ? '한도초과' : `한도 ${(40 - result.dsr).toFixed(1)}%p 여유`}
                </p>
              </div>
              <div className="text-center border-x border-indigo-400/40">
                <p className="text-indigo-300 text-xs mb-1">DTI</p>
                <p className="text-3xl font-bold">{result.dti.toFixed(1)}<span className="text-lg">%</span></p>
                <p className={`text-xs mt-1 font-semibold ${result.dti > 50 ? 'text-red-300' : 'text-indigo-200'}`}>
                  {result.dti > 50 ? '한도초과' : `한도 ${(50 - result.dti).toFixed(1)}%p 여유`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-indigo-300 text-xs mb-1">LTV</p>
                <p className="text-3xl font-bold">
                  {propVal > 0 ? `${result.ltv.toFixed(1)}` : '—'}<span className="text-lg">{propVal > 0 ? '%' : ''}</span>
                </p>
                <p className={`text-xs mt-1 font-semibold ${result.ltv > 70 ? 'text-red-300' : 'text-indigo-200'}`}>
                  {propVal === 0 ? '담보 없음' : result.ltv > 70 ? '한도초과' : `한도 ${(70 - result.ltv).toFixed(1)}%p 여유`}
                </p>
              </div>
            </div>
          </div>

          {/* 게이지 3개 */}
          <RatioGauge label="DSR — 총부채원리금상환비율" value={result.dsr} limit={40} color="#6366f1" subLabel="모든 대출 원리금 ÷ 연 소득" />
          <RatioGauge label="DTI — 총부채상환비율" value={result.dti} limit={50} color="#3b82f6" subLabel="신규 원리금 + 기타 이자 ÷ 연 소득" />
          {propVal > 0 && (
            <RatioGauge label="LTV — 주택담보인정비율" value={result.ltv} limit={70} color="#8b5cf6" subLabel="대출금액 ÷ 담보가치" />
          )}

          {/* 비율 비교 바차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">규제 한도 대비 현재 비율</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                  <ReferenceLine y={40} stroke="#6366f1" strokeDasharray="4 2" label={{ value: 'DSR 40%', position: 'insideTopRight', fontSize: 10, fill: '#6366f1' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DSR 기준 최대 대출 한도 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">DSR 40% 기준 — 신규 대출 최대 한도</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                <p className="text-xs text-indigo-400 mb-1">최대 대출 가능액</p>
                <p className="text-xl font-extrabold text-indigo-700">
                  {result.dsrMaxLoan > 0 ? fmtShort(result.dsrMaxLoan) : '불가'}
                </p>
                <p className="text-xs text-indigo-300 mt-1">{rate.toFixed(1)}% · {months}개월 기준</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">신규 월 상환 가능액</p>
                <p className="text-xl font-extrabold text-gray-700">
                  {result.maxMonthly > 0 ? `${fmt(result.maxMonthly)}원` : '한도 없음'}
                </p>
                <p className="text-xs text-gray-400 mt-1">DSR 40% 기준 가능 금액</p>
              </div>
            </div>
            {result.dsrMaxLoan > 0 && loanAmt > result.dsrMaxLoan && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">
                신청 금액이 DSR 한도보다 <strong>{fmtShort(loanAmt - result.dsrMaxLoan)}</strong> 초과 — 한도 내로 줄이거나 소득 증빙을 강화하세요
              </div>
            )}
          </div>

          {/* 기본 DSR vs 스트레스 DSR */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-1">기본 DSR vs 스트레스 DSR</h3>
            <p className="text-xs text-gray-500 mb-4">은행 실제 심사는 스트레스 금리를 가산해 더 엄격하게 계산합니다</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">기본 DSR 추정치</p>
                <p className="text-2xl font-extrabold text-indigo-700">{result.dsr.toFixed(1)}%</p>
                <p className="text-xs text-indigo-400 mt-1">금리 {rate.toFixed(1)}% 적용</p>
              </div>
              <div className={`rounded-xl p-4 text-center border ${result.stressDsr > 40 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${result.stressDsr > 40 ? 'text-red-500' : 'text-amber-500'}`}>스트레스 DSR 추정</p>
                <p className={`text-2xl font-extrabold ${result.stressDsr > 40 ? 'text-red-700' : 'text-amber-700'}`}>{result.stressDsr.toFixed(1)}%</p>
                <p className={`text-xs mt-1 ${result.stressDsr > 40 ? 'text-red-400' : 'text-amber-500'}`}>금리 {(rate + DSR_REGULATION.stressDsr.baseStressRate).toFixed(1)}% 가산 적용</p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-800 leading-relaxed">
              ⚠️ 스트레스 DSR은 기본 DSR 추정치와 달리, 금융기관이 금리 인상 가능성을 반영해 실제 심사에 적용하는 가중 지표입니다. 이 계산기는 {DSR_REGULATION.stressDsr.stage}({formatKoreanDate(DSR_REGULATION.stressDsr.effectiveFrom)}~) 기본 스트레스 금리 <strong>{DSR_REGULATION.stressDsr.baseStressRate}%p</strong>(변동형 100% 기준)를 가산해 계산합니다. 실제 가산율은 {DSR_REGULATION.stressDsr.rateTypeNote}이며, {DSR_REGULATION.stressDsr.regional.label}은 {formatKoreanDate(DSR_REGULATION.stressDsr.regional.until)}까지 {DSR_REGULATION.stressDsr.regional.rate}%p가 한시 적용되는 등 지역·금리유형별로 달라 실제 심사 결과와 다를 수 있습니다.
            </div>
          </div>

          {/* 계산 내역 */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1.5">
            <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 내역</p>
            <div className="flex justify-between"><span>연 소득</span><span className="font-medium text-gray-800">{fmt(income)}원</span></div>
            <div className="flex justify-between"><span>기존 대출 연 원리금</span><span className="font-medium text-gray-800">{fmt(existDebt * 12)}원</span></div>
            <div className="flex justify-between"><span>신규 대출 연 원리금</span><span className="font-medium text-gray-800">{fmt(result.newMonthly * 12)}원</span></div>
            <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-800">
              <span>합산 원리금 / 연 소득</span>
              <span>{fmt(existDebt * 12 + result.newMonthly * 12)}원 / {fmt(income)}원</span>
            </div>
            <div className="flex justify-between text-indigo-700 font-bold">
              <span>= DSR</span>
              <span>{result.dsr.toFixed(2)}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* 하단 가이드 */}
      <div className="space-y-6 mt-10">

        {/* 1. DSR 높게 나왔을 때 실제 전략 */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1 text-gray-900">DSR이 40%를 넘었다면 — 실제로 낮추는 방법</h2>
          <p className="text-sm text-gray-500 mb-5">단순히 "대출 줄이거나 소득 올리면 된다"는 정보는 어디에나 있습니다. 실제로 어떤 선택이 DSR에 얼마나 영향을 주는지 살펴봅니다.</p>
          <div className="space-y-4 text-sm">
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-2">① 기존 대출 중 어떤 걸 먼저 갚아야 할까?</p>
              <p className="text-gray-600 leading-relaxed mb-3">DSR을 낮추는 데 효과적인 건 <strong className="text-indigo-700">원리금이 높은 대출</strong>을 먼저 상환하는 것입니다. 예를 들어 신용대출 2,000만원(60개월, 6.5%)의 월 납입액은 약 39만원인데, 이를 완납하면 DSR이 즉시 <strong>약 7.8%p</strong> 낮아집니다 (연 소득 6천만원 기준). 반면 잔액이 비슷하더라도 장기 주담대는 월 납입액이 낮아 효과가 작습니다.</p>
              <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-800">
                💡 DSR 개선 효과 = 상환하는 대출의 월 원리금 × 12 ÷ 연 소득 × 100. 월 납입액이 클수록 효과가 큽니다.
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-2">② 상환기간 늘리기 — 득실 계산</p>
              <p className="text-gray-600 leading-relaxed mb-3">3억원, 4.5% 주담대를 <strong>240개월(20년)</strong>로 하면 월 납입액 약 190만원, DSR 영향 38%p. 같은 조건에서 <strong>360개월(30년)</strong>로 늘리면 월 납입액 약 152만원, DSR 영향 30.4%p — 약 7.6%p 감소합니다. 단, 이렇게 하면 <strong>총 이자가 약 {fmtShort(exInterestGap)}원 더</strong> 납니다. 한도를 통과하기 위한 임시방편이지, 이자 절약 방법이 아닙니다.</p>
              <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800">
                ⚠️ 한도를 위해 기간을 늘렸다면, 여유 자금 생길 때마다 중도상환으로 기간을 줄이는 전략이 유리합니다.
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-gray-800 mb-2">③ 소득 증빙 — 어떤 소득이 인정되나</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs mt-2">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      <th className="text-left pb-2 font-medium">소득 유형</th>
                      <th className="text-left pb-2 font-medium">인정 방식</th>
                      <th className="text-left pb-2 font-medium">유의사항</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 space-y-1">
                    {[
                      ['근로소득', '원천징수영수증 전년도 기준', '2년 이상 재직 시 유리'],
                      ['사업소득', '종합소득세 신고 기준', '경비 차감 후 소득으로 낮아질 수 있음'],
                      ['프리랜서', '수입금액의 60~80% 인정', '은행마다 인정 비율 상이'],
                      ['임대소득', '임대차계약서 기준', '건보료 등 증빙 필요'],
                      ['배우자 소득', '합산 심사 가능', '공동 차주로 등재해야 인정'],
                    ].map(([t, m, n]) => (
                      <tr key={t} className="border-b border-gray-50">
                        <td className="py-1.5 font-semibold text-gray-700">{t}</td>
                        <td className="py-1.5">{m}</td>
                        <td className="py-1.5 text-gray-400">{n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 스트레스 DSR */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1 text-gray-900">스트레스 DSR — 왜 계산기보다 실제 한도가 더 낮을까?</h2>
          <p className="text-sm text-gray-500 mb-5">이 계산기에서 DSR 39%가 나왔는데 은행에서 한도 초과라고 한다면? 스트레스 DSR 때문입니다.</p>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="font-semibold text-red-800 mb-2">스트레스 DSR이란?</p>
              <p className="leading-relaxed">대출 신청 금리에 <strong>스트레스 금리(가산율)를 추가</strong>해서 DSR을 계산하는 규제로, {DSR_REGULATION.stressDsr.stage}가 {formatKoreanDate(DSR_REGULATION.stressDsr.effectiveFrom)}부터 시행 중입니다. 예를 들어 실제 금리가 4.5%이고 기본 스트레스 금리 {DSR_REGULATION.stressDsr.baseStressRate}%p(변동형 100% 기준)가 적용되면 <strong>{(4.5 + DSR_REGULATION.stressDsr.baseStressRate).toFixed(1)}% 기준으로 DSR을 계산</strong>합니다. 금리가 오를 상황을 미리 반영해 심사를 더 보수적으로 하는 것입니다. 적용 가산율은 금리유형·지역에 따라 달라집니다.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-2">일반 DSR 계산 (이 계산기)</p>
                <p className="text-sm text-gray-700">3억원 × 4.5% × 30년 기준</p>
                <p className="font-bold text-gray-900 mt-1">월 납입 152만원 → DSR 30.4%</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs font-bold text-red-500 mb-2">스트레스 DSR 계산 (은행 실제 심사)</p>
                <p className="text-sm text-gray-700">3억원 × {(4.5 + DSR_REGULATION.stressDsr.baseStressRate).toFixed(1)}% × 30년 기준</p>
                <p className="font-bold text-red-700 mt-1">월 납입 180만원 → DSR 36%</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">※ 스트레스 금리 가산율은 정책에 따라 변동됩니다. 변동금리 대출에 더 높은 가산율이 적용됩니다.</p>
          </div>
        </div>

        {/* 3. 은행마다 다른 이유 */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1 text-gray-900">A은행은 되고 B은행은 안 되는 이유</h2>
          <p className="text-sm text-gray-500 mb-5">같은 조건인데 은행마다 한도가 수천만원씩 차이 나는 현상은 흔합니다. 이유는 세 가지입니다.</p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3 p-4 border border-gray-100 rounded-xl">
              <span className="text-2xl shrink-0">📋</span>
              <div>
                <p className="font-bold text-gray-800 mb-1">소득 산정 방식의 차이</p>
                <p className="text-gray-600 leading-relaxed">프리랜서·사업자 소득은 은행마다 인정 비율이 다릅니다. 같은 종합소득세 신고 소득도 한 은행은 실소득 100%, 다른 은행은 60%만 인정하기도 합니다. 특히 최근 2년 소득 평균을 쓰는 곳과 직전 1년만 보는 곳이 달라, 소득이 올라가는 중이라면 최신 연도를 많이 보는 은행이 유리합니다.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 border border-gray-100 rounded-xl">
              <span className="text-2xl shrink-0">💳</span>
              <div>
                <p className="font-bold text-gray-800 mb-1">마이너스통장·카드론 처리 방식</p>
                <p className="text-gray-600 leading-relaxed">마이너스통장 한도 1,000만원 중 200만원만 사용 중이라도, 일부 은행은 <strong>한도 전액(1,000만원)을 대출로 간주</strong>해 DSR에 포함시킵니다. 반면 실제 사용액만 보는 은행도 있어, 마이너스통장 한도가 크다면 미리 한도를 줄이거나 닫고 신청하는 게 유리할 수 있습니다.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 border border-gray-100 rounded-xl">
              <span className="text-2xl shrink-0">⏱️</span>
              <div>
                <p className="font-bold text-gray-800 mb-1">기존 대출 상환 반영 타이밍</p>
                <p className="text-gray-600 leading-relaxed">신용대출을 완납했더라도 신용정보원 등록까지 <strong>수일~수주 지연</strong>되는 경우가 있습니다. 이 기간에 주담대를 신청하면 이미 갚은 대출이 DSR에 포함돼 한도 초과가 나올 수 있습니다. 상환 후 최소 1~2주 뒤 신청하거나, 상환 증빙 서류를 직접 제출하는 방법이 있습니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 계산 방식 */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
          <p>• DSR = (기존 연 원리금 + 신규 연 원리금) ÷ 연 소득 × 100</p>
          <p>• DTI = (신규 연 원리금 + 기존 연 이자 추정) ÷ 연 소득 × 100</p>
          <p>• LTV = 신규 대출금액 ÷ 담보가치 × 100</p>
          <p>• 최대 한도 = DSR 40% 기준 역산 (원리금균등 PMT 공식)</p>
          <p className="text-xs text-gray-400 pt-1">※ 실제 심사는 스트레스 DSR, 소득 산정 방식 등에 따라 다를 수 있습니다.</p>
        </div>

      </div>

      {/* 관련 계산기 */}
      <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
          <div>
            <p className="text-sm font-bold text-gray-900">다음 단계로 — 관련 계산기</p>
            <p className="text-xs text-gray-400">DSR 확인 후 이어서 계산해보세요</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/calculator/loan-interest', emoji: '📊', title: '대출 이자 계산기', desc: '한도 확인 후 — 월 납입액과 총이자 계산' },
            { href: '/calculator/repayment-compare', emoji: '⚖️', title: '상환방식 비교', desc: '원리금균등 vs 원금균등, 총이자 차이 확인' },
            { href: '/calculator/refinancing', emoji: '🔄', title: '갈아타기 손익 계산', desc: '더 낮은 금리로 갈아탈 때 실제 절감액' },
            { href: '/calculator/prepayment-fee', emoji: '💰', title: '중도상환수수료 계산기', desc: '조기 상환 시 수수료와 절감 이자 비교' },
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

      {/* 관련 가이드 */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-sm">📖</div>
          <div>
            <p className="text-sm font-bold text-gray-900">더 알아보기 — 관련 가이드</p>
            <p className="text-xs text-gray-400">계산 결과를 제대로 해석하는 법</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guide/dsr-dti-ltv', emoji: '📋', title: 'DSR·DTI·LTV 완전 정복', desc: 'DSR 40% 규제 구조와 실전 계산 방법 총정리' },
            { href: '/guide/mortgage-salary-5000', emoji: '🏠', title: '연봉 5000만원 주담대 한도', desc: '소득별 DSR 기준 실제 대출 가능 금액 계산' },
            { href: '/guide/ltv-ok-dsr-blocked', emoji: '🚧', title: 'LTV는 OK인데 DSR에 막힌다면', desc: 'LTV·DSR 동시 충족 전략과 해결 방법' },
            { href: '/guide/car-loan-dsr-impact', emoji: '🚗', title: '자동차 대출과 DSR 영향', desc: '카론이 주담대 한도에 미치는 실제 영향' },
          ].map(({ href, emoji, title, desc }) => (
            <Link key={href} href={href}
              className="group flex items-start gap-3 p-4 bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-xl shadow-sm transition-all">
              <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <span className="text-gray-300 group-hover:text-emerald-400 transition-colors shrink-0 mt-0.5">→</span>
            </Link>
          ))}
        </div>
      </div>

      <MortgagePrepHubCTA />
      <DisclaimerNotice basis={dsrBasisLine()} />
      <CalcMeta asOf={DSR_REGULATION.stressDsr.effectiveFrom} />

      <style>{`
        input[type=range]{-webkit-appearance:none;outline:none;border-radius:9999px;height:8px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2);transition:box-shadow .15s}
        input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 6px rgba(99,102,241,0.3)}
        input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>
    </div>
  )
}
