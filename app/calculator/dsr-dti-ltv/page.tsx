'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import DisclaimerNotice from '@/components/DisclaimerNotice'

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

    return { newMonthly, dsr, dti, ltv, dsrMaxLoan, maxMonthly }
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
                <p className="text-xs text-gray-400 mb-1">신규 월 납입액</p>
                <p className="text-xl font-extrabold text-gray-700">{fmt(result.newMonthly)}원</p>
                <p className="text-xs text-gray-400 mt-1">원리금균등 기준</p>
              </div>
            </div>
            {result.dsrMaxLoan > 0 && loanAmt > result.dsrMaxLoan && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">
                신청 금액이 DSR 한도보다 <strong>{fmtShort(loanAmt - result.dsrMaxLoan)}</strong> 초과 — 한도 내로 줄이거나 소득 증빙을 강화하세요
              </div>
            )}
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

      {/* 하단 가이드 (SEO) */}
      <div className="space-y-6 mt-10">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">DSR · DTI · LTV란 무엇인가?</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-indigo-50 p-4 rounded-xl">
              <p className="font-bold text-indigo-800 mb-2">DSR — 총부채원리금상환비율</p>
              <p className="text-gray-600 text-xs leading-relaxed">모든 대출의 연간 원리금 ÷ 연 소득 × 100. 2023년부터 1억 초과 대출에 40% 규제 적용. 소득 대비 갚아야 할 빚의 총량을 측정하는 가장 강력한 지표입니다.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="font-bold text-blue-800 mb-2">DTI — 총부채상환비율</p>
              <p className="text-gray-600 text-xs leading-relaxed">신규 주담대 원리금 + 기타 대출 이자 ÷ 연 소득 × 100. 수도권 50%, 지방 60% 적용. DSR보다 범위가 좁아 주담대 심사에 주로 사용됩니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="font-bold text-purple-800 mb-2">LTV — 주택담보인정비율</p>
              <p className="text-gray-600 text-xs leading-relaxed">대출금액 ÷ 담보(주택) 가치 × 100. 투기과열지구 40%, 조정대상지역 50%, 일반 70%. 소득이 아닌 담보 가치 기준으로 한도를 제한합니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">규제 기준표 — 어디까지 빌릴 수 있나</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-gray-500 font-medium">지표</th>
                  <th className="pb-2 text-gray-500 font-medium">한도</th>
                  <th className="pb-2 text-gray-500 font-medium">적용 대상</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {[
                  ['DSR', '40%', '1억 초과 대출 전체 (2023~)'],
                  ['DTI', '50%', '수도권 주택담보대출'],
                  ['DTI', '60%', '지방 주택담보대출'],
                  ['LTV', '40%', '투기과열지구 9억 이하'],
                  ['LTV', '50%', '조정대상지역 9억 이하'],
                  ['LTV', '70%', '일반지역 주택담보대출'],
                ].map(([g, l, d]) => (
                  <tr key={`${g}-${l}`} className="border-b border-gray-50">
                    <td className="py-2 font-semibold text-indigo-700">{g}</td>
                    <td className="py-2 font-bold">{l}</td>
                    <td className="py-2 text-gray-500 text-xs">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">※ 규제 기준은 정부 정책에 따라 변경될 수 있습니다. 최신 기준은 금융위원회·금융감독원에서 확인하세요.</p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">DSR이 40%를 넘으면 어떻게 되나?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="font-semibold text-red-800 mb-1">원칙적으로 대출 거절</p>
              <p className="text-gray-600">2023년부터 총 대출이 1억 원을 초과하면 금융기관이 DSR 40%를 초과하는 대출을 취급할 수 없습니다. 소득 증빙이 충분해도 DSR 한도가 우선입니다.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl">
              <p className="font-semibold text-amber-800 mb-1">해결 방법 4가지</p>
              <ul className="space-y-1 text-gray-600">
                <li>① <strong>대출 금액 줄이기</strong> — DSR 40% 이내 금액으로 조정</li>
                <li>② <strong>상환 기간 늘리기</strong> — 월 원리금↓ → DSR↓ (단, 총 이자 증가)</li>
                <li>③ <strong>기존 대출 상환</strong> — 기존 원리금 줄여 DSR 여유 확보</li>
                <li>④ <strong>소득 증빙 강화</strong> — 인정 소득 범위 확대 (부업·임대소득 등)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
          <p>• DSR = (기존 연 원리금 + 신규 연 원리금) ÷ 연 소득 × 100</p>
          <p>• DTI = (신규 연 원리금 + 기존 연 이자 추정) ÷ 연 소득 × 100</p>
          <p>• LTV = 신규 대출금액 ÷ 담보가치 × 100</p>
          <p>• 최대 한도 = DSR 40% 기준 역산 (원리금균등 PMT 공식)</p>
          <p className="text-xs text-gray-400 pt-1">※ 실제 심사는 스트레스 DSR, 소득 산정 방식 등에 따라 다를 수 있습니다.</p>
        </div>

      </div>

      <DisclaimerNotice />

      <style>{`
        input[type=range]{-webkit-appearance:none;outline:none;border-radius:9999px;height:8px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;box-shadow:0 0 0 4px rgba(99,102,241,0.2);transition:box-shadow .15s}
        input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 6px rgba(99,102,241,0.3)}
        input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:none;box-shadow:0 0 0 4px rgba(99,102,241,0.2)}
      `}</style>
    </div>
  )
}
