'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DisclaimerNotice from '@/components/DisclaimerNotice'

/* ─── 유틸 ─────────────────────────────────────────────────── */
function fmt(v: number) {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`
  if (v >= 10_000) return `${Math.round(v / 10_000)}만`
  return v.toLocaleString()
}
function fmtWon(v: number) {
  const abs = Math.abs(v)
  if (abs >= 100_000_000) return `${(v / 100_000_000).toFixed(2)}억원`
  if (abs >= 10_000) return `${Math.round(v / 10_000).toLocaleString()}만원`
  return `${Math.round(v).toLocaleString()}원`
}

/* ─── 타입 ─────────────────────────────────────────────────── */
interface ScheduleRow {
  month: number
  totalPayment: number
  interest: number
  principal: number
}
interface EPIResult {
  monthly: number
  totalInterest: number
  totalPayment: number
  schedule: ScheduleRow[]
}
interface EPResult {
  firstPayment: number
  lastPayment: number
  totalInterest: number
  totalPayment: number
  schedule: ScheduleRow[]
}

/* ─── 계산 함수 ─────────────────────────────────────────────── */
function calcEPI(principal: number, annualRate: number, months: number): EPIResult | null {
  if (!principal || !annualRate || !months) return null
  const r = annualRate / 12 / 100
  const monthly = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  let balance = principal
  let totalInterest = 0
  const schedule: ScheduleRow[] = []
  for (let m = 1; m <= months; m++) {
    const interest = balance * r
    const princ = monthly - interest
    balance -= princ
    totalInterest += interest
    schedule.push({ month: m, totalPayment: monthly, interest, principal: princ })
  }
  return { monthly, totalInterest, totalPayment: principal + totalInterest, schedule }
}

function calcEP(principal: number, annualRate: number, months: number): EPResult | null {
  if (!principal || !annualRate || !months) return null
  const r = annualRate / 12 / 100
  const princ = principal / months
  let balance = principal
  let totalInterest = 0
  const schedule: ScheduleRow[] = []
  for (let m = 1; m <= months; m++) {
    const interest = balance * r
    const total = princ + interest
    balance -= princ
    totalInterest += interest
    schedule.push({ month: m, totalPayment: total, interest, principal: princ })
  }
  return {
    firstPayment: schedule[0].totalPayment,
    lastPayment: schedule[schedule.length - 1].totalPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
    schedule,
  }
}

/* ─── 슬라이더 컴포넌트 ──────────────────────────────────────── */
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
        className="slider-rc w-full h-2 rounded-full cursor-pointer appearance-none"
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

/* ─── 프리셋 ─────────────────────────────────────────────────── */
const PRESETS = [
  { label: '아파트 담보', amount: 500_000_000, rate: 4.5, period: 360 },
  { label: '빌라 담보',   amount: 200_000_000, rate: 4.8, period: 240 },
  { label: '사업자대출', amount: 150_000_000, rate: 5.5, period: 180 },
]

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function RepaymentComparePage() {
  const [amount, setAmount]  = useState(300_000_000)
  const [rate,   setRate]    = useState(4.5)
  const [period, setPeriod]  = useState(240)
  const [showSchedule, setShowSchedule] = useState(false)

  const epi = useMemo(() => calcEPI(amount, rate, period), [amount, rate, period])
  const ep  = useMemo(() => calcEP(amount,  rate, period), [amount, rate, period])

  /* 차트 데이터 */
  const lineData = useMemo(() => {
    if (!epi || !ep) return []
    const step = period <= 60 ? 3 : period <= 120 ? 6 : 12
    const data: { month: string; '원리금균등': number; '원금균등': number }[] = []
    for (let i = 0; i < period; i += step) {
      data.push({
        month: `${i + 1}개월`,
        '원리금균등': Math.round(epi.schedule[i].totalPayment),
        '원금균등':   Math.round(ep.schedule[i].totalPayment),
      })
    }
    return data
  }, [epi, ep, period])

  const barData = useMemo(() => {
    if (!epi || !ep) return []
    return [
      { name: '원리금균등', value: Math.round(epi.totalInterest), fill: '#6366f1' },
      { name: '원금균등',   value: Math.round(ep.totalInterest),  fill: '#10b981' },
    ]
  }, [epi, ep])

  const saved     = epi && ep ? epi.totalInterest - ep.totalInterest : 0
  const firstDiff = epi && ep ? ep.firstPayment - epi.monthly : 0

  return (
    <div className="container max-w-5xl py-8">
      {/* ─── 헤더 ──────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 슬라이더 조작 즉시 비교
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">상환 방식 비교 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          원리금균등 vs 원금균등 — 어느 방식이 나에게 유리할까?
        </p>
      </div>

      {/* ─── 다크 슬라이더 패널 ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8">
        {/* 프리셋 */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setAmount(p.amount); setRate(p.rate); setPeriod(p.period) }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {p.label}
              <span className="text-indigo-400 ml-1">{fmt(p.amount)} / {p.rate}% / {p.period/12}년</span>
            </button>
          ))}
        </div>

        {/* 슬라이더 */}
        <div className="space-y-6">
          <SliderInput
            label="대출 금액"
            value={amount} min={10_000_000} max={1_000_000_000} step={10_000_000}
            onChange={setAmount}
            displayValue={`${fmt(amount)}원`}
          />
          <SliderInput
            label="연 금리"
            value={rate} min={1} max={20} step={0.1}
            onChange={setRate}
            displayValue={`${rate.toFixed(1)}%`}
          />
          <SliderInput
            label="대출 기간"
            value={period} min={12} max={480} step={12}
            onChange={setPeriod}
            displayValue={`${period / 12}년 (${period}개월)`}
          />
        </div>
      </div>

      {epi && ep && (
        <>
          {/* ─── 파이터 카드 ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* 원리금균등 */}
            <div
              className="rounded-2xl p-5 border-2 border-blue-500/50"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)' }}
            >
              <div className="text-[11px] font-bold text-blue-200 mb-3 uppercase tracking-widest">원리금균등</div>
              <div className="text-xs text-blue-300 mb-0.5">월 상환액 (매달 고정)</div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-4 leading-tight">
                {fmtWon(epi.monthly)}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-blue-200">
                  <span>총 이자</span>
                  <span className="font-semibold">{fmtWon(epi.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-blue-200">
                  <span>총 상환액</span>
                  <span className="font-semibold">{fmtWon(epi.totalPayment)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-400/30 text-[11px] text-blue-300">
                ✓ 매달 동일 납부 · 예산 관리 쉬움
              </div>
            </div>

            {/* 원금균등 */}
            <div
              className="rounded-2xl p-5 border-2 border-emerald-500/50"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
            >
              <div className="text-[11px] font-bold text-emerald-200 mb-3 uppercase tracking-widest">원금균등</div>
              <div className="text-xs text-emerald-300 mb-0.5">첫 달 → 마지막 달</div>
              <div className="text-lg sm:text-xl font-bold text-white mb-4 leading-tight">
                {fmtWon(ep.firstPayment)}
                <span className="text-emerald-400 mx-1">→</span>
                {fmtWon(ep.lastPayment)}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-emerald-200">
                  <span>총 이자</span>
                  <span className="font-semibold text-yellow-300">{fmtWon(ep.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-emerald-200">
                  <span>총 상환액</span>
                  <span className="font-semibold">{fmtWon(ep.totalPayment)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-400/30 text-[11px] text-emerald-300">
                ✓ 총 이자 절감 · 시간이 지날수록 부담↓
              </div>
            </div>
          </div>

          {/* ─── 인사이트 배너 ────────────────────────────────────── */}
          <div
            className="rounded-2xl p-4 mb-8 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)' }}
          >
            <div className="text-3xl flex-shrink-0">💰</div>
            <div>
              <p className="text-white font-bold text-sm sm:text-base">
                원금균등 선택 시 이자{' '}
                <span className="text-yellow-300">{fmtWon(saved)}</span> 절감!
              </p>
              <p className="text-purple-200 text-xs mt-0.5">
                단, 첫 달 납부액이{' '}
                <span className="font-semibold text-white">{fmtWon(firstDiff)}</span> 더 높습니다
              </p>
            </div>
          </div>

          {/* ─── 월 납입액 변화 (Line Chart) ─────────────────────── */}
          <div className="rounded-3xl p-5 sm:p-6 mb-5 bg-white shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-0.5">월 납입액 변화</p>
            <p className="text-xs text-gray-400 mb-5">
              기간별 월 납입액 — 원리금균등(파란선)은 수평, 원금균등(초록선)은 우하향
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={v => `${Math.round(v / 10_000)}만`}
                  width={50}
                />
                <Tooltip formatter={(v: unknown) => `${fmtWon(Number(v))}`} />
                <Legend wrapperStyle={{ color: '#6b7280', fontSize: 12, paddingTop: 8 }} />
                <Line
                  type="monotone" dataKey="원리금균등"
                  stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone" dataKey="원금균등"
                  stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ─── 총 이자 비교 (Bar Chart) ─────────────────────────── */}
          <div className="rounded-3xl p-5 sm:p-6 mb-8 bg-white shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-0.5">총 이자 비교</p>
            <p className="text-xs text-gray-400 mb-5">
              두 방식의 총 이자 차이 — 낮을수록 유리
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 13 }} />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={v =>
                    v >= 100_000_000
                      ? `${(v / 100_000_000).toFixed(1)}억`
                      : `${Math.round(v / 10_000)}만`
                  }
                  width={55}
                />
                <Tooltip formatter={(v: unknown) => `${fmtWon(Number(v))}`} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ─── 상환 스케줄 토글 ─────────────────────────────────── */}
          <div className="text-center mb-4">
            <Button
              variant="outline" size="sm"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              {showSchedule ? '상환 스케줄 숨기기' : '상환 스케줄 보기'}
            </Button>
          </div>

          {showSchedule && (
            <div className="overflow-x-auto border rounded-xl mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-800">
                    <th className="py-2 px-3 text-left font-semibold text-muted-foreground">회차</th>
                    <th className="py-2 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">원리금균등</th>
                    <th className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">원금균등</th>
                    <th className="py-2 px-3 text-right font-semibold text-muted-foreground">차이</th>
                  </tr>
                </thead>
                <tbody>
                  {epi.schedule.slice(0, 12).map((item, idx) => {
                    const epItem = ep.schedule[idx]
                    const diff = item.totalPayment - epItem.totalPayment
                    return (
                      <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground">{item.month}개월</td>
                        <td className="py-2 px-3 text-right">{fmtWon(item.totalPayment)}</td>
                        <td className="py-2 px-3 text-right">{fmtWon(epItem.totalPayment)}</td>
                        <td className={`py-2 px-3 text-right font-medium ${diff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {diff > 0 ? '+' : '-'}{fmtWon(Math.abs(diff))}
                        </td>
                      </tr>
                    )
                  })}
                  {period > 12 && (
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-center text-muted-foreground text-xs">
                        … 중간 생략 …
                      </td>
                    </tr>
                  )}
                  {period > 12 && epi.schedule.slice(-6).map((item, idx) => {
                    const actualIdx = period - 6 + idx
                    const epItem = ep.schedule[actualIdx]
                    const diff = item.totalPayment - epItem.totalPayment
                    return (
                      <tr key={`last-${idx}`} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground">{item.month}개월</td>
                        <td className="py-2 px-3 text-right">{fmtWon(item.totalPayment)}</td>
                        <td className="py-2 px-3 text-right">{fmtWon(epItem.totalPayment)}</td>
                        <td className={`py-2 px-3 text-right font-medium ${diff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {diff > 0 ? '+' : '-'}{fmtWon(Math.abs(diff))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── 하단 가이드 카드 (원본 유지) ───────────────────────── */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">💡 언제 상환 방식 비교가 필요할까요?</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. 주택담보대출 실행 전 상환 방식 선택</h3>
              <p>주택을 구매하면서 대출을 받을 때, 은행에서 원리금균등과 원금균등 중 선택하라고 합니다. 초기 월 부담과 총 이자 부담을 비교하여 본인의 재무 상황에 맞는 방식을 선택할 수 있습니다. 일반적으로 안정적인 소득이 있다면 원금균등이, 초기 현금 흐름이 중요하다면 원리금균등이 유리합니다.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. 대출 전환 또는 갈아타기 검토</h3>
              <p>기존 대출을 다른 금융기관으로 갈아탈 때, 상환 방식을 변경하는 것도 고려할 수 있습니다. 예를 들어 소득이 증가했다면 원리금균등에서 원금균등으로 바꿔 총 이자를 줄이거나, 반대로 월 부담을 줄이기 위해 원금균등에서 원리금균등으로 변경할 수 있습니다.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. 장기 재무 계획 수립</h3>
              <p>대출 기간이 20~30년으로 길 경우, 초기 몇 년과 후반부의 월 상환액 차이를 미리 확인하여 장기 재무 계획을 세울 수 있습니다. 특히 은퇴 시점이 가까워질수록 월 상환 부담이 줄어드는 원금균등 방식이 유리할 수 있습니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📐 두 가지 상환 방식의 계산 원리</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">원리금균등 상환 방식</h3>
              <p className="mb-2"><strong>매월 동일한 금액(원금 + 이자)</strong>을 상환하는 방식입니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>초기: 이자 비중이 높고 원금 상환은 적음</li>
                <li>후반부: 이자 비중이 줄고 원금 상환이 많아짐</li>
                <li>월 상환액이 일정하여 예산 관리가 용이함</li>
                <li>총 이자는 원금균등보다 많이 발생함</li>
              </ul>
              <p className="mt-2 font-mono text-xs bg-white p-2 rounded">월 상환액 = 대출원금 × [월금리 × (1+월금리)^개월수] / [(1+월금리)^개월수 - 1]</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">원금균등 상환 방식</h3>
              <p className="mb-2"><strong>매월 동일한 원금 + 감소하는 이자</strong>를 상환하는 방식입니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>원금: 매월 동일한 금액 상환 (대출원금 ÷ 총 개월수)</li>
                <li>이자: 남은 원금에 비례하여 매월 감소</li>
                <li>초기 월 상환액이 높지만 점점 줄어듦</li>
                <li>총 이자는 원리금균등보다 적게 발생함</li>
              </ul>
              <p className="mt-2 font-mono text-xs bg-white p-2 rounded">월 원금 = 대출원금 / 개월수<br/>월 이자 = 남은 원금 × 월금리</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 두 방식의 주요 차이</h3>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border">
                  <thead className="bg-white">
                    <tr>
                      <th className="border p-2">구분</th>
                      <th className="border p-2">원리금균등</th>
                      <th className="border p-2">원금균등</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2 font-semibold">월 상환액</td><td className="border p-2">일정함</td><td className="border p-2">점점 감소</td></tr>
                    <tr><td className="border p-2 font-semibold">초기 부담</td><td className="border p-2">낮음</td><td className="border p-2">높음</td></tr>
                    <tr><td className="border p-2 font-semibold">총 이자</td><td className="border p-2">많음</td><td className="border p-2">적음</td></tr>
                    <tr><td className="border p-2 font-semibold">예산 관리</td><td className="border p-2">쉬움</td><td className="border p-2">초기 어려움</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">📊 어떤 방식을 선택해야 할까요?</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">원리금균등을 선택하면 좋은 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>월 소득이 일정한 직장인:</strong> 매월 같은 금액을 상환하므로 예산 관리가 편리</li>
                <li><strong>초기 현금 흐름이 중요한 경우:</strong> 첫 달 상환액이 원금균등보다 낮아 부담이 적음</li>
                <li><strong>장기 대출:</strong> 30년 이상 장기 대출에서는 월 부담을 일정하게 유지하는 것이 유리</li>
                <li><strong>다른 투자 계획이 있는 경우:</strong> 초기 여유 자금을 다른 곳에 투자할 수 있음</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">원금균등을 선택하면 좋은 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>초기 상환 능력이 충분한 경우:</strong> 보너스, 퇴직금 등으로 초기 높은 부담을 감당 가능</li>
                <li><strong>총 이자 비용을 최소화하고 싶을 때:</strong> 원금을 빨리 갚아 이자 부담을 줄임</li>
                <li><strong>은퇴가 가까운 경우:</strong> 시간이 지날수록 월 부담이 줄어 은퇴 후 부담 감소</li>
                <li><strong>변동금리 대출:</strong> 원금이 빨리 줄어 금리 인상 시 이자 증가폭이 작음</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">실제 사례 비교</h3>
              <p className="mb-2"><strong>사례: 2억 원, 4.5% 금리, 20년 대출</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>원리금균등: 매월 약 126만 원 고정, 총 이자 약 3,060만 원</li>
                <li>원금균등: 첫 달 약 159만 원 → 마지막 달 약 84만 원, 총 이자 약 2,280만 원</li>
                <li>차이: 총 이자 약 780만 원 절감 가능 (원금균등 선택 시)</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 상환 방식 변경</h3>
              <p>대부분의 금융기관은 대출 실행 후 상환 방식 변경을 허용하지 않습니다. 일부 은행에서는 변경을 허용하지만 수수료가 발생할 수 있으므로, <strong>대출 실행 전에 신중하게 선택</strong>해야 합니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🔗 공식 출처 및 참고 자료</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">대출 상환 방식 안내</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> - 대출 상환 방식 비교 가이드</li>
                <li>• <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">주택금융공사</a> - 주택담보대출 상환 방식 설명</li>
                <li>• <a href="https://finlife.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융상품통합비교공시</a> - 은행별 상환 조건 비교</li>
                <li>• <a href="https://www.kfb.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">은행연합회</a> - 대출 상품 이용 안내</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">대출 계산 및 시뮬레이션</h3>
              <ul className="space-y-2 ml-4">
                <li>• <a href="https://www.kbanknow.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">KB국민은행</a> - 대출 상환 시뮬레이터</li>
                <li>• <a href="https://www.shinhan.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">신한은행</a> - 원리금 계산기</li>
                <li>• <a href="https://www.wooribank.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">우리은행</a> - 대출 상환 스케줄 조회</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600">※ 실제 상환 방식과 금액은 금융기관별 약관 및 조건에 따라 다를 수 있습니다. 대출 실행 전 반드시 금융기관에서 제공하는 상환 계획서를 확인하세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DisclaimerNotice />

      {/* ─── 슬라이더 스타일 ─────────────────────────────────────── */}
      <style jsx>{`
        .slider-rc {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
        .slider-rc::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
          transition: box-shadow 0.15s;
        }
        .slider-rc::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3);
        }
        .slider-rc::-moz-range-thumb {
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
