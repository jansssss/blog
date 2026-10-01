'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import MobileResultBar from '@/components/calculators/MobileResultBar'
import CalcMeta from '@/components/CalcMeta'
import Link from 'next/link'
import { calcPrepaymentFee } from '@/lib/calculators'

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

/* ─── 슬라이더 컴포넌트 ─────────────────────────────────────── */
import { useState } from 'react'

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
  { label: '💰 일부 상환',  balance: 50_000_000,  prepay: 10_000_000,  rate: 0.6, interest: 4.5, months: 120 },
  { label: '🔄 갈아타기',   balance: 200_000_000, prepay: 200_000_000, rate: 0.6, interest: 5.0, months: 180 },
  { label: '🎁 목돈 생김',  balance: 30_000_000,  prepay: 15_000_000,  rate: 0.3, interest: 7.5, months: 24  },
]

const fscReformUrl = 'https://www.fsc.go.kr/po010102/83833'
const fscMutualFinanceUrl = 'https://www.fsc.go.kr/no010101/85455'
const hfFormsUrl = 'https://www.hf.go.kr/ko/sub04/sub04_10_01.do?article.offset=0&articleLimit=10&articleNo=600477&mode=view'

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function PrepaymentFeeCalculatorPage() {
  const [balance,  setBalance]  = useState(50_000_000)
  const [prepay,   setPrepay]   = useState(10_000_000)
  const [feeRate,  setFeeRate]  = useState(0.6)
  const [interest, setInterest] = useState(4.5)
  const [months,   setMonths]   = useState(120)
  const [loanStart, setLoanStart] = useState('')
  const [chargeYears, setChargeYears] = useState(3)

  /* 약정상 수수료 부과기간의 남은 비율 계산 */
  const exemptionInfo = useMemo(() => {
    if (!loanStart || chargeYears <= 0) return null
    const [year, month, day] = loanStart.split('-').map(Number)
    const start = new Date(year, month - 1, day)
    if (isNaN(start.getTime())) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const chargeEnd = new Date(start)
    chargeEnd.setFullYear(chargeEnd.getFullYear() + chargeYears)
    const totalDays = Math.max(1, Math.round((chargeEnd.getTime() - start.getTime()) / 86400000))
    const daysElapsed = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000))
    const remainDays = Math.max(0, Math.ceil((chargeEnd.getTime() - today.getTime()) / 86400000))
    const isExempt = remainDays === 0
    const remainingChargeRatio = isExempt ? 0 : Math.min(1, remainDays / totalDays)
    return { daysElapsed, isExempt, remainDays, remainingChargeRatio }
  }, [loanStart, chargeYears])

  const feeFactor = chargeYears > 0 ? (exemptionInfo?.remainingChargeRatio ?? 1) : 1

  /* 실시간 계산 */
  const result = useMemo(() => {
    const safePrepay = Math.min(prepay, balance)
    const prepaymentFee   = calcPrepaymentFee(safePrepay, feeRate, feeFactor)
    const actualRepayment = safePrepay + prepaymentFee
    const remainingBalance = balance - safePrepay

    const monthlyRate = interest / 12 / 100
    const interestSavings =
      (balance * monthlyRate * months) -
      (remainingBalance * monthlyRate * months)
    const netSavings = interestSavings - prepaymentFee

    return { prepaymentFee, actualRepayment, remainingBalance, interestSavings, netSavings }
  }, [balance, prepay, feeRate, feeFactor, interest, months])

  const isProfit = result.netSavings >= 0

  const chartData = [
    { name: '중도상환수수료', value: Math.round(result.prepaymentFee),  fill: '#ef4444' },
    { name: '단순 이자 절감 상한', value: Math.round(result.interestSavings), fill: '#10b981' },
    { name: '수수료 차감 후 상한', value: Math.round(Math.abs(result.netSavings)),
      fill: isProfit ? '#6366f1' : '#f59e0b' },
  ]

  const applyPreset = (p: typeof PRESETS[0]) => {
    setBalance(p.balance)
    setPrepay(p.prepay)
    setFeeRate(p.rate)
    setInterest(p.interest)
    setMonths(p.months)
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* ─── 헤더 ──────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">중도상환 계산기 — 수수료·면제일 확인</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          계약 수수료율과 실행일을 넣어 체감 수수료를 계산하고, 단순 이자 절감 상한과 비교합니다
        </p>
      </div>

      {/* ─── 입력 패널 ───────────────────────────────────────────── */}
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
            label="현재 대출 잔액"
            value={balance} min={1_000_000} max={1_000_000_000} step={1_000_000}
            onChange={setBalance}
            displayValue={fmtWon(balance)}
          />
          <SliderInput
            label="조기상환 금액"
            value={Math.min(prepay, balance)} min={1_000_000} max={balance} step={1_000_000}
            onChange={setPrepay}
            displayValue={fmtWon(Math.min(prepay, balance))}
          />
          <SliderInput
            label="약정 중도상환수수료율"
            value={feeRate} min={0} max={3} step={0.1}
            onChange={setFeeRate}
            displayValue={`${feeRate.toFixed(1)}%`}
          />
          <SliderInput
            label="현재 연 금리"
            value={interest} min={1} max={20} step={0.1}
            onChange={setInterest}
            displayValue={`${interest.toFixed(1)}%`}
          />
          <SliderInput
            label="잔여 상환 기간"
            value={months} min={6} max={360} step={6}
            onChange={setMonths}
            displayValue={`${months / 12 >= 1 ? `${(months / 12).toFixed(months % 12 === 0 ? 0 : 1)}년` : ''} ${months % 12 !== 0 || months < 12 ? `${months % 12 || months}개월` : ''}`.trim()}
          />
        </div>

        {/* 대출 실행일 & 수수료 부과 기간 */}
        <div className="mt-6 border border-indigo-100 rounded-2xl p-4 bg-white">
          <p className="text-xs font-semibold text-indigo-600 mb-3">🗓 수수료 체감·면제 시점 확인 (선택)</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">대출 실행일</label>
              <input
                type="date"
                value={loanStart}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setLoanStart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-300 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">수수료 부과기간(계약서)</label>
              <select
                value={chargeYears}
                onChange={e => setChargeYears(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-300 bg-gray-50"
              >
                <option value={0}>기간 체감 없음(수수료율 그대로)</option>
                <option value={1}>1년</option>
                <option value={2}>2년</option>
                <option value={3}>3년</option>
              </select>
            </div>
          </div>
          {exemptionInfo && (
            <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${exemptionInfo.isExempt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {exemptionInfo.isExempt
                ? '✅ 입력한 부과기간 경과 — 계약상 실제 수수료가 0원인지 금융기관에서 최종 확인하세요.'
                : `⏳ 부과기간 종료까지 약 ${exemptionInfo.remainDays}일 · 계약 수수료율의 약 ${(exemptionInfo.remainingChargeRatio * 100).toFixed(1)}% 적용`}
            </div>
          )}
          {!loanStart && chargeYears > 0 && (
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              실행일을 입력하지 않으면 남은 부과기간 비율을 100%로 두어 수수료를 보수적으로 추정합니다.
            </p>
          )}
        </div>
      </div>

      {/* 면제 기간 경과 배너 */}
      {exemptionInfo?.isExempt && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-medium mb-5">
          ✅ 입력하신 대출 실행일 기준 면제 기간이 경과했습니다. 실제 수수료 부과 여부는 금융기관에 확인하세요.
        </div>
      )}

      {/* ─── 순 절감액 히어로 카드 ─────────────────────────────── */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-5 text-white"
        style={{
          background: isProfit
            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
            : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        }}
      >
        <p className="text-white/70 text-sm mb-1">
          {isProfit ? '수수료 차감 후 단순 이자 절감 상한' : '단순 계산상 수수료 초과액'}
        </p>
        <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">
          {isProfit ? '+' : '-'}{fmtWon(Math.abs(result.netSavings))}
        </p>
        <p className="text-white/60 text-xs mt-3">
          단순 이자 절감 상한 {fmtWon(result.interestSavings)} − 수수료 {fmtWon(result.prepaymentFee)}
        </p>
      </div>

      <MobileResultBar
        items={[
          {
            label: isProfit ? '단순 절감 상한' : '수수료 초과액',
            value: `${isProfit ? '+' : '-'}${fmtWon(Math.abs(result.netSavings))}`,
            tone: isProfit ? 'positive' : 'warning',
          },
          { label: '중도상환수수료', value: fmtWon(result.prepaymentFee), tone: 'danger' },
        ]}
      />

      {/* ─── KPI 카드 3개 ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-4 bg-red-50 border border-red-100">
          <p className="text-xs text-red-500 mb-1">중도상환수수료</p>
          <p className="text-lg font-bold text-red-700 leading-tight">{fmtWon(result.prepaymentFee)}</p>
        </div>
        <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">실제 상환 금액</p>
          <p className="text-lg font-bold text-gray-800 leading-tight">{fmtWon(result.actualRepayment)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">상환금 + 수수료</p>
        </div>
        <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-500 mb-1">상환 후 잔액</p>
          <p className="text-lg font-bold text-blue-700 leading-tight">{fmtWon(result.remainingBalance)}</p>
        </div>
      </div>

      {/* ─── 비교 차트 ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
        <h3 className="font-bold text-sm text-gray-700 mb-4">수수료 vs 단순 이자 절감 상한</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => fmt(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ─── 계산 방식 요약 ─────────────────────────────────────── */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-8 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
        <p>• 추정 수수료 = 중도상환 금액 × 계약 수수료율 × 남은 부과기간 비율</p>
        <p>• 남은 부과기간 비율 = 부과기간 종료일까지 남은 일수 ÷ 전체 부과기간 일수</p>
        <p>• 단순 이자 절감 상한 = 중도상환 금액 × 월금리 × 잔여 개월</p>
        <p className="text-xs text-gray-400 pt-1">※ 실제 이자 절감액은 원리금 상환 스케줄과 금융회사의 부분상환 처리방식에 따라 이 상한보다 작을 수 있습니다.</p>
        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 mt-1.5">⚠️ 앱·대출계약서의 오늘자 상환예상금액을 최종값으로 사용하세요.</p>
      </div>

      {/* ─── 하단 가이드 카드 ────────────────────────────────────── */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">💡 언제 중도상환수수료 계산이 필요할까요?</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. 대출 갈아타기 검토 시</h3>
              <p>현재 대출 금리가 높아 다른 금융기관으로 대출을 옮기려고 할 때, 중도상환수수료를 내더라도 장기적으로 이득인지 계산할 수 있습니다. 예를 들어 연 6%에서 4%로 갈아타면 이자가 절감되지만, 중도상환수수료가 크면 오히려 손해일 수 있습니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. 목돈이 생겨 조기 상환 고민 시</h3>
              <p>상여금, 퇴직금, 부동산 매각 등으로 목돈이 생겼을 때, 대출을 미리 갚으면 이자를 절감할 수 있습니다. 하지만 중도상환수수료를 내야 한다면, 수수료 대비 실제 절감액을 계산하여 상환 여부를 결정해야 합니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. 금리 인하 시 대환 대출 고려</h3>
              <p>시장 금리가 내려가면 기존 대출을 낮은 금리로 갈아탈 기회가 생깁니다. 이때 중도상환수수료와 신규 대출 취급 수수료, 그리고 향후 이자 절감액을 종합적으로 비교하여 대환 대출 실행 여부를 판단할 수 있습니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📐 중도상환수수료 계산 방식</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">계산 공식</h3>
              <p className="mb-2">계약서에 기간 체감식이 적혀 있다면 다음 순서로 계산합니다.</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>중도상환수수료 = 조기상환 금액 × 계약 수수료율 × 남은 부과기간 비율</li>
                <li>부과기간이 이미 끝났다면 남은 비율은 0</li>
                <li>실제 상환 금액 = 조기상환 금액 + 중도상환수수료</li>
                <li>갈아타기라면 새 대출의 인지세·등기비용 등도 별도 차감</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">2025·2026년 제도에서 달라진 점</h3>
              <p className="mb-2">금융위원회는 2025년 1월 13일 이후 신규 계약부터 중도상환 시 발생하는 실비용 안에서만 수수료를 부과하도록 개편했습니다.</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>은행·저축은행 등:</strong> 금융회사별 수수료율을 협회 홈페이지에 공시하고 매년 재산정</li>
                <li><strong>농협·수협·산림조합:</strong> 2026년 1월 1일 이후 취급 대출부터 같은 실비용 원칙 적용</li>
                <li><strong>기존 대출:</strong> 신규 계약 적용일 이전 약정은 당시 계약 조건을 먼저 확인</li>
                <li><strong>정책금융·예외:</strong> 상품별 면제·감면 조건이 다르므로 계약서와 상환예상금액 조회가 우선</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">이자 절감액 계산</h3>
              <p className="mb-2">조기 상환 시 절감되는 이자는 다음과 같이 계산됩니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>상환 전 월 이자 = 대출 잔액 × 월 금리</li>
                <li>상환 후 월 이자 = (대출 잔액 - 상환 금액) × 월 금리</li>
                <li>월 이자 절감액 = 상환 전 월 이자 - 상환 후 월 이자</li>
                <li>총 이자 절감액 = 월 이자 절감액 × 남은 개월 수</li>
              </ul>
              <p className="mt-2 text-xs">※ 이 방식은 원금이 줄지 않는다는 가정의 상한입니다. 원리금균등·원금균등 대출의 실제 절감액은 금융기관 상환 스케줄로 확인하세요.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 참고 사항</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>수수료율·부과기간·기간 체감 산식은 대출 상품과 계약 시점별로 다릅니다.</li>
                <li>“남은 대출 만기”와 “수수료 부과기간”은 서로 다른 값입니다.</li>
                <li>정확한 금액은 금융기관 앱의 중도상환예상금액 또는 상담 확인값을 사용하세요.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📊 중도상환, 언제 유리할까요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">중도상환이 유리한 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>금융기관 견적 기준 순절감액이 플러스:</strong> 실제 이자 절감액이 수수료와 부대비용보다 큰 경우</li>
                <li><strong>부과기간이 많이 지남:</strong> 같은 수수료율이라도 기간 체감으로 실제 수수료가 작아진 경우</li>
                <li><strong>남은 원금과 기간이 큼:</strong> 상환 뒤 줄어드는 이자 총액이 충분한 경우</li>
                <li><strong>비상자금이 남음:</strong> 상환 후에도 생활비·비상자금을 유지할 수 있는 경우</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 신중해야 하는 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>금융기관 견적 기준 순절감액이 마이너스:</strong> 수수료와 비용이 이자 절감액보다 큰 경우</li>
                <li><strong>부과기간 종료가 임박:</strong> 기다리는 동안 추가로 낼 이자와 종료 후 줄어드는 수수료를 비교해야 하는 경우</li>
                <li><strong>세제 혜택 상실:</strong> 주택담보대출 이자 소득공제를 받고 있다면 상환 후 혜택 상실 고려</li>
                <li><strong>유동성 위험:</strong> 비상자금이 부족한 상태에서 목돈을 상환에 쓰면 위험</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">실제 사례</h3>
              <p className="mb-2"><strong>사례: 5천만원 잔액 중 1천만원 상환, 계약 수수료율 0.6%</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>3년 부과기간 중 절반이 남았다면 수수료: 1천만원 × 0.6% × 50% = 3만원</li>
                <li>실행일을 빼면 기간 체감 전 최대 6만원으로 표시</li>
                <li>실제 이자 절감액은 상환 뒤 월납입액을 낮추는지 만기를 줄이는지에 따라 달라짐</li>
              </ul>
              <p className="mt-2 text-xs">※ 계산 결과를 금융기관 앱의 상환예상금액과 대조한 뒤 결정하세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">중도상환수수료 규제 및 정보</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href={fscReformUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회 — 2025년 중도상환수수료 개편</a></li>
                <li>• <a href={fscMutualFinanceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회 — 2026년 상호금융권 적용</a></li>
                <li>• <a href={hfFormsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">한국주택금융공사 — 보금자리론 최신 신청 서식</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">대출 상환 및 대환 정보</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> - 대출 상품 및 금리 비교</li>
                <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> - 주택담보대출 대환 안내</li>
                <li>• <a href="https://www.kfb.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">은행연합회</a> - 대출 이용 가이드</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600">※ 중도상환수수료는 대출 계약서에 명시되어 있으며, 금융기관별로 다를 수 있습니다. 반드시 본인의 대출 계약서를 확인하거나 금융기관에 직접 문의하세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 면책 문구 */}
      <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
          <div>
            <p className="text-sm font-bold text-gray-900">다음 단계로 — 관련 계산기</p>
            <p className="text-xs text-gray-400">수수료 확인 후 이어서 계산해보세요</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/calculator/refinancing', emoji: '🔄', title: '갈아타기 손익 계산기', desc: '수수료 내고 갈아타는 게 실제로 이득인지 확인' },
            { href: '/calculator/loan-interest', emoji: '📊', title: '대출 이자 계산기', desc: '갈아탄 후 새 조건으로 이자 계산' },
            { href: '/calculator/prepayment-comparison', emoji: '💰', title: '중도상환 vs 유지 비교', desc: '지금 갚는 게 이득인지 투자가 이득인지' },
            { href: '/calculator/dsr-dti-ltv', emoji: '📋', title: 'DSR · DTI · LTV 계산기', desc: '신규 대출 전 내 DSR 한도 확인' },
          ].map(({ href, emoji, title, desc }) => (
            <Link key={href} href={href} className="group flex items-start gap-3 p-4 bg-white hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl shadow-sm transition-all">
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
            <p className="text-xs text-gray-400">중도상환 전 꼭 알아야 할 것들</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guide/early-repayment-fee', emoji: '💡', title: '중도상환수수료 완전 정복', desc: '수수료 공식과 절약 전략 총정리' },
            { href: '/guide/loan-interest', emoji: '📊', title: '대출 이자 완전 정복', desc: '중도상환 후 남은 이자 절감 효과 계산법' },
            { href: '/guide/repayment-types', emoji: '⚖️', title: '상환 방식 선택 가이드', desc: '상환 방식에 따라 수수료 부담이 달라진다' },
            { href: '/guide/rate-strategy', emoji: '📈', title: '고정 vs 변동금리 전략', desc: '고정금리 중도상환수수료가 더 비싼 이유' },
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

      <DisclaimerNotice
        basis="2026-10-01 검토 · 금융위원회 중도상환수수료 실비용 원칙 · 계약상 부과기간 체감 산식"
        message="수수료는 계약 수수료율과 부과기간을 넣은 추정치이고, 이자 절감액은 단순 상한입니다. 실제 금액은 금융기관 앱의 중도상환예상금액과 상환 스케줄을 확인하세요."
      />
      <CalcMeta />

      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 중도상환 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>수수료 부과기간:</strong> 대출계약서의 시작일·종료일과 기간 체감 산식을 확인하세요.</li>
            <li>• <strong>일부 상환 vs 전액 상환:</strong> 수수료율이 다를 수 있으니 확인하세요.</li>
            <li>• <strong>변동금리 대출:</strong> 금리 인상이 예상되면 조기 상환이 더 유리할 수 있습니다.</li>
            <li>• <strong>세제 혜택:</strong> 주택담보대출의 경우 이자 소득공제를 받고 있다면 고려하세요.</li>
            <li>• <strong>유동성 확보:</strong> 비상자금을 충분히 남기고 상환 계획을 세우세요.</li>
          </ul>
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
