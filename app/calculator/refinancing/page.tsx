'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import MortgagePrepHubCTA from '@/components/MortgagePrepHubCTA'
import Link from 'next/link'

/* ── 원리금균등 월 납입액 ── */
function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function totalInterest(principal: number, annualRate: number, months: number): number {
  return Math.max(0, pmt(principal, annualRate, months) * months - principal)
}

/* ── 포맷 헬퍼 ── */
function fmt(n: number) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n))
}
function fmtShort(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_0000_0000) return `${sign}${(abs / 1_0000_0000).toFixed(1).replace(/\.0$/, '')}억`
  if (abs >= 1_000_0000) return `${sign}${(abs / 1_000_0000).toFixed(0)}천만`
  if (abs >= 10_000) return `${sign}${Math.round(abs / 10_000)}만`
  return `${sign}${fmt(abs)}`
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

/* ── KPI 카드 ── */
function KpiCard({
  label, value, sub, color = 'default',
}: {
  label: string; value: string; sub?: string
  color?: 'green' | 'red' | 'amber' | 'indigo' | 'default'
}) {
  const bg    = { green:'bg-emerald-50 border-emerald-100', red:'bg-red-50 border-red-100', amber:'bg-amber-50 border-amber-100', indigo:'bg-indigo-600 border-indigo-600', default:'bg-white border-gray-100 shadow-sm' }
  const val   = { green:'text-emerald-700', red:'text-red-700', amber:'text-amber-700', indigo:'text-white', default:'text-gray-900' }
  const lbl   = { green:'text-emerald-500', red:'text-red-400', amber:'text-amber-500', indigo:'text-indigo-200', default:'text-gray-400' }
  const sub_  = { green:'text-emerald-400', red:'text-red-300', amber:'text-amber-400', indigo:'text-indigo-200', default:'text-gray-400' }
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-1 border ${bg[color]}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${lbl[color]}`}>{label}</p>
      <p className={`text-lg font-extrabold leading-tight whitespace-nowrap ${val[color]}`}>{value}</p>
      {sub && <p className={`text-xs ${sub_[color]}`}>{sub}</p>}
    </div>
  )
}

/* ── 프리셋 ── */
const PRESETS = [
  { label: '🏠 주담대 갈아타기',  balance: 300_000_000, curR: 55, newR: 38, months: 240, feeR: 12, extra: 500_000 },
  { label: '💳 신용대출 갈아타기', balance:  50_000_000, curR: 70, newR: 50, months:  36, feeR: 15, extra: 200_000 },
  { label: '🏢 전세대출 갈아타기', balance: 200_000_000, curR: 45, newR: 32, months:  24, feeR:  0, extra: 100_000 },
]

/* ── 메인 페이지 ── */
export default function RefinancingCalculatorPage() {
  const [balance, setBalance] = useState(200_000_000)
  const [curR,    setCurR]    = useState(55)   // ×10 저장 → 실제 5.5%
  const [newR,    setNewR]    = useState(38)   // ×10
  const [months,  setMonths]  = useState(120)
  const [feeR,    setFeeR]    = useState(12)   // ×10
  const [extra,   setExtra]   = useState(300_000)

  const curRate  = curR / 10
  const newRate  = newR / 10
  const feeRate  = feeR / 10
  const rateDiff = curRate - newRate

  const result = useMemo(() => {
    const curMonthly    = pmt(balance, curRate, months)
    const newMonthly    = pmt(balance, newRate, months)
    const curInterest   = totalInterest(balance, curRate, months)
    const newInterest   = totalInterest(balance, newRate, months)
    const interestSaved = curInterest - newInterest
    const prepayFee     = balance * (feeRate / 100)
    const totalCost     = prepayFee + extra
    const netProfit     = interestSaved - totalCost
    const monthlySaving = curMonthly - newMonthly
    const breakEven     = monthlySaving > 0 ? Math.ceil(totalCost / monthlySaving) : Infinity
    return { curMonthly, newMonthly, curInterest, newInterest, interestSaved, prepayFee, totalCost, netProfit, monthlySaving, breakEven }
  }, [balance, curRate, newRate, months, feeRate, extra])

  const isProfit   = result.netProfit >= 0
  const bePct      = result.breakEven !== Infinity ? Math.min((result.breakEven / months) * 100, 100) : 100
  const beValid    = result.breakEven !== Infinity && result.breakEven <= months

  const chartData = [
    { name: '현재 대출 유지', value: Math.round(balance + result.curInterest), fill: '#94a3b8' },
    { name: '갈아타기 후',    value: Math.round(balance + result.newInterest + result.totalCost), fill: '#6366f1' },
  ]

  return (
    <div className="container max-w-6xl py-8">

      {/* ── 헤더 ── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">대출 갈아타기 손익 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">이자 절감액 − 중도상환수수료 − 부대비용 = 실제 순 손익</p>
      </div>

      {/* ── 2컬럼 레이아웃 ── */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">

        {/* ── 입력 패널 (sticky) ── */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 lg:mb-0">

            {/* 프리셋 */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setBalance(p.balance); setCurR(p.curR); setNewR(p.newR); setMonths(p.months); setFeeR(p.feeR); setExtra(p.extra) }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 슬라이더 */}
            <div className="space-y-7">
              <SliderInput
                label="현재 대출 잔액" value={balance}
                min={10_000_000} max={1_000_000_000} step={5_000_000}
                displayValue={fmtShort(balance)} onChange={setBalance}
                hint={`${fmt(balance)}원`}
              />
              <SliderInput
                label="현재 금리" unit="%" value={curR}
                min={10} max={200} step={1}
                displayValue={curRate.toFixed(1)} onChange={setCurR}
              />
              <SliderInput
                label="신규 금리" unit="%" value={newR}
                min={10} max={Math.max(10, curR - 1)} step={1}
                displayValue={newRate.toFixed(1)}
                onChange={v => setNewR(Math.min(v, curR - 1))}
                hint={`금리 차이 ${rateDiff.toFixed(1)}%p`}
              />
              <SliderInput
                label="잔여 상환 기간" unit="개월" value={months}
                min={6} max={360} step={6}
                displayValue={`${months}`} onChange={setMonths}
                hint={`${Math.floor(months / 12)}년 ${months % 12 > 0 ? `${months % 12}개월` : ''}`}
              />
              <SliderInput
                label="중도상환수수료율" unit="%" value={feeR}
                min={0} max={30} step={1}
                displayValue={feeRate.toFixed(1)} onChange={setFeeR}
                hint={`수수료 ${fmtShort(balance * feeRate / 100)}원`}
              />
              <SliderInput
                label="신규 부대비용" value={extra}
                min={0} max={3_000_000} step={50_000}
                displayValue={fmtShort(extra)} onChange={setExtra}
                hint="취급수수료·인지세·등기비용 합계"
              />
            </div>
          </div>
        </div>

        {/* ── 결과 영역 ── */}
        <div className="space-y-5 mt-8 lg:mt-0">

          {/* 히어로 카드 */}
          <div
            className="rounded-2xl p-6 sm:p-8 text-white"
            style={{ background: isProfit ? 'linear-gradient(135deg,#059669 0%,#10b981 100%)' : 'linear-gradient(135deg,#d97706 0%,#f59e0b 100%)' }}
          >
            <p className="text-white/70 text-sm mb-1">
              {isProfit ? '✅ 갈아타기 권장 — 순 절감액' : '⚠️ 신중 검토 필요 — 순 손실액'}
            </p>
            <p className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">
              {isProfit ? '+' : ''}{fmtShort(result.netProfit)}
            </p>
            <p className="text-white/60 text-xs">
              이자 절감 {fmtShort(result.interestSaved)} − 수수료 {fmtShort(result.prepayFee)} − 부대비용 {fmtShort(extra)}
            </p>
          </div>

          {/* KPI 4개 */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="이자 절감액" value={fmtShort(result.interestSaved)} sub={`${months}개월 누적`} color="green" />
            <KpiCard label="중도상환수수료" value={fmtShort(result.prepayFee)} sub={`잔액의 ${feeRate.toFixed(1)}%`} color="red" />
            <KpiCard
              label="월 납입 절감"
              value={`${fmt(Math.abs(result.monthlySaving))}원`}
              sub={result.monthlySaving > 0 ? '매월 절약' : '매월 증가'}
              color={result.monthlySaving > 0 ? 'green' : 'amber'}
            />
            <KpiCard
              label="손익분기점"
              value={beValid ? `${result.breakEven}개월` : '기간 초과'}
              sub={beValid ? `${result.breakEven}개월 후 순이익` : '갈아타기 비추천'}
              color={beValid && result.breakEven <= months / 2 ? 'indigo' : 'amber'}
            />
          </div>

          {/* 총 상환 비용 비교 차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-1">총 상환 비용 비교</h3>
            <p className="text-xs text-gray-400 mb-4">수수료·부대비용 포함한 실제 지출 총액</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 10000 ? `${Math.round(v / 10000)}만` : String(v)}
                  />
                  <Tooltip
                    formatter={(v: unknown) => [`${fmt(Number(v))}원`, '총 비용']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-400" /><span className="text-xs text-gray-500">현재 유지</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500" /><span className="text-xs text-gray-500">갈아타기 후</span></div>
            </div>
          </div>

          {/* 손익분기 타임라인 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">손익분기 타임라인</h3>
            <div className="relative h-7 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full flex items-center px-3 transition-all duration-700"
                style={{
                  width: `${bePct}%`,
                  background: beValid ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#fca5a5,#f87171)',
                }}
              >
                <span className="text-[10px] font-semibold text-amber-900 whitespace-nowrap">
                  {beValid ? '비용 회수 중' : '기간 내 손익분기 미달'}
                </span>
              </div>
              {beValid && (
                <div
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    left: `${bePct}%`,
                    right: 0,
                    background: 'linear-gradient(90deg,#6366f1,#818cf8)',
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span>갈아타기 시점</span>
              {beValid && <span className="text-indigo-500 font-medium">{result.breakEven}개월 → 순이익 시작</span>}
              <span>{months}개월 완납</span>
            </div>
          </div>

          {/* 월 납입 비교 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-4">월 납입액 비교 (원리금균등)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">현재 월 납입</p>
                <p className="text-xl font-extrabold text-gray-700">{fmt(result.curMonthly)}원</p>
                <p className="text-xs text-gray-400 mt-1">연 {curRate.toFixed(1)}%</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                <p className="text-xs text-indigo-400 mb-1">갈아타기 후 월 납입</p>
                <p className="text-xl font-extrabold text-indigo-700">{fmt(result.newMonthly)}원</p>
                <p className="text-xs text-indigo-400 mt-1">연 {newRate.toFixed(1)}%</p>
              </div>
            </div>
            {result.monthlySaving > 0 && (
              <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm text-emerald-700">
                  매월 <strong className="text-emerald-800">{fmt(result.monthlySaving)}원</strong> 절약
                  <span className="text-xs text-emerald-500 ml-2">· 연 {fmtShort(result.monthlySaving * 12)}원</span>
                </p>
              </div>
            )}
          </div>

          {/* 손익 계산 내역 */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-2">
            <p className="font-semibold text-gray-700 mb-2 text-xs">📌 손익 계산 내역</p>
            <div className="flex justify-between"><span>현재 대출 잔여 이자</span><span className="font-medium text-gray-800">{fmt(result.curInterest)}원</span></div>
            <div className="flex justify-between"><span>신규 대출 예상 이자</span><span className="font-medium text-gray-800">{fmt(result.newInterest)}원</span></div>
            <div className="flex justify-between text-emerald-700 font-semibold"><span>이자 절감액</span><span>+{fmt(result.interestSaved)}원</span></div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-red-600"><span>중도상환수수료</span><span>−{fmt(result.prepayFee)}원</span></div>
            <div className="flex justify-between text-red-500"><span>신규 부대비용</span><span>−{fmt(extra)}원</span></div>
            <div className={`border-t border-gray-300 pt-2 flex justify-between text-base font-bold ${isProfit ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span>순 손익</span>
              <span>{isProfit ? '+' : ''}{fmt(result.netProfit)}원</span>
            </div>
          </div>

        </div>{/* 결과 영역 끝 */}
      </div>{/* 2컬럼 끝 */}

      {/* ── 하단 가이드 (SEO, 풀 width) ── */}
      <div className="space-y-6 mt-10">

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">대출 갈아타기 손익 계산법</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-indigo-50 p-4 rounded-xl">
              <p className="font-semibold text-indigo-900 mb-1">핵심 공식: 순 손익 = 이자 절감액 − 중도상환수수료 − 부대비용</p>
              <p>금리가 낮아지더라도 수수료와 부대비용이 크면 실제 손해가 날 수 있습니다. 이 계산기는 세 항목을 모두 반영해 실질 손익을 계산합니다.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="font-semibold text-emerald-800 mb-1">① 이자 절감액</p>
                <p className="text-xs text-gray-600">잔여 기간 동안 현재 금리와 신규 금리의 이자 차이. 잔여 기간이 길고 금리 차이가 클수록 커집니다.</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="font-semibold text-red-800 mb-1">② 중도상환수수료</p>
                <p className="text-xs text-gray-600">대출 잔액 × 수수료율. 주담대 0~1.2%, 신용대출 0.5~2%. 대출 실행 후 3년 경과 시 면제되는 상품이 많습니다.</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl">
                <p className="font-semibold text-amber-800 mb-1">③ 신규 부대비용</p>
                <p className="text-xs text-gray-600">취급수수료·인지세·등기비용 등. 주담대는 50~150만 원, 신용대출은 10~30만 원 수준.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">갈아타기 유리한 경우 vs 불리한 경우</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-emerald-50 p-4 rounded-xl">
              <p className="font-semibold text-emerald-800 mb-2">✅ 갈아타기 유리</p>
              <ul className="space-y-1.5 text-gray-600">
                <li>• 금리 차이 1.5%p 이상 + 잔여 기간 3년 이상</li>
                <li>• 중도상환수수료 면제 기간 이미 경과</li>
                <li>• 손익분기점이 잔여 기간의 절반 이내</li>
                <li>• 부대비용이 월 절감액의 12개월치 미만</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
              <p className="font-semibold text-amber-800 mb-2">⚠️ 신중해야 하는 경우</p>
              <ul className="space-y-1.5 text-gray-600">
                <li>• 잔여 기간 1년 미만 (이자 절감 효과 미미)</li>
                <li>• 수수료 면제까지 6개월 이내 (기다리는 게 유리)</li>
                <li>• 금리 차이 0.5%p 미만</li>
                <li>• 신용·소득 변동으로 신규 금리 조건 불리 가능성</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">갈아타기 전 체크리스트</h2>
          <div className="space-y-2 text-sm">
            {([
              ['중도상환수수료 면제일 확인', '대출 계약서 또는 인터넷뱅킹 "중도상환수수료 안내"에서 면제 시점 확인'],
              ['신규 금리 사전 심사', '네이버페이·카카오페이 대출 비교 또는 각 금융기관 사전 심사로 실제 적용 금리 확인'],
              ['부대비용 항목 확인', '취급수수료, 인지세(대출금액별 차등 5만~35만원), 담보 있을 경우 등기비용'],
              ['DSR 재심사 가능 여부', '소득·부채 변동 시 기존과 다른 한도 적용될 수 있음'],
              ['금리 유형 재선택', '변동·혼합·고정 중 향후 금리 방향성 고려해 선택'],
            ] as [string, string][]).map(([title, desc]) => (
              <div key={title} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                <span className="text-indigo-500 font-bold mt-0.5 shrink-0">✓</span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
          <p>• 이자 절감액 = 원리금균등(PMT) 기준 총 이자 차이</p>
          <p>• 중도상환수수료 = 현재 잔액 × 수수료율</p>
          <p>• 손익분기 = 초기 비용(수수료+부대비용) ÷ 월 납입 절감액</p>
          <p className="text-xs text-gray-400 pt-1">※ 실제 금리·수수료는 금융기관마다 다릅니다. 반드시 해당 기관에 직접 확인하세요.</p>
        </div>

      </div>

      <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
          <div>
            <p className="text-sm font-bold text-gray-900">다음 단계로 — 관련 계산기</p>
            <p className="text-xs text-gray-400">갈아타기 결정 후 이어서 확인해보세요</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/calculator/prepayment-fee', emoji: '💸', title: '중도상환수수료 계산기', desc: '갈아타기 전 수수료를 정확히 계산' },
            { href: '/calculator/loan-interest', emoji: '📊', title: '대출 이자 계산기', desc: '갈아탄 후 새 조건으로 이자 확인' },
            { href: '/calculator/dsr-dti-ltv', emoji: '📋', title: 'DSR · DTI · LTV 계산기', desc: '새 대출의 DSR 한도 안에 드는지 확인' },
            { href: '/calculator/rate-change-impact', emoji: '📈', title: '금리 변동 영향 계산기', desc: '향후 금리 변동 시나리오도 대비' },
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
      <MortgagePrepHubCTA />
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
