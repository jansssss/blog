'use client'

import { useMemo } from 'react'
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
  { label: '💰 일부 상환',  balance: 50_000_000,  prepay: 10_000_000,  rate: 1.5, interest: 4.5, months: 120 },
  { label: '🔄 갈아타기',   balance: 200_000_000, prepay: 200_000_000, rate: 1.2, interest: 5.0, months: 180 },
  { label: '🎁 목돈 생김',  balance: 30_000_000,  prepay: 15_000_000,  rate: 2.0, interest: 7.5, months: 24  },
]

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function PrepaymentFeeCalculatorPage() {
  const [balance,  setBalance]  = useState(50_000_000)
  const [prepay,   setPrepay]   = useState(10_000_000)
  const [feeRate,  setFeeRate]  = useState(1.5)
  const [interest, setInterest] = useState(4.5)
  const [months,   setMonths]   = useState(120)

  /* 실시간 계산 */
  const result = useMemo(() => {
    const safePrepay = Math.min(prepay, balance)
    const prepaymentFee   = safePrepay * (feeRate / 100)
    const actualRepayment = safePrepay + prepaymentFee
    const remainingBalance = balance - safePrepay

    const monthlyRate = interest / 12 / 100
    const interestSavings =
      (balance * monthlyRate * months) -
      (remainingBalance * monthlyRate * months)
    const netSavings = interestSavings - prepaymentFee

    return { prepaymentFee, actualRepayment, remainingBalance, interestSavings, netSavings }
  }, [balance, prepay, feeRate, interest, months])

  const isProfit = result.netSavings >= 0

  const chartData = [
    { name: '중도상환수수료', value: Math.round(result.prepaymentFee),  fill: '#ef4444' },
    { name: '이자 절감액',    value: Math.round(result.interestSavings), fill: '#10b981' },
    { name: '순 절감액',      value: Math.round(Math.abs(result.netSavings)),
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">중도상환수수료 계산기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          조기 상환 시 발생하는 수수료와 실제 절감액을 즉시 확인합니다
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
            label="중도상환수수료율"
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
      </div>

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
          {isProfit ? '✅ 중도상환 권장 — 순 절감액' : '⚠️ 신중 검토 필요 — 순 손실액'}
        </p>
        <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">
          {isProfit ? '+' : '-'}{fmtWon(Math.abs(result.netSavings))}
        </p>
        <p className="text-white/60 text-xs mt-3">
          이자 절감액 {fmtWon(result.interestSavings)} − 수수료 {fmtWon(result.prepaymentFee)}
        </p>
      </div>

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
        <h3 className="font-bold text-sm text-gray-700 mb-4">수수료 vs 절감액 비교</h3>
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
        <p>• 중도상환수수료 = 조기상환 금액 × 수수료율</p>
        <p>• 이자 절감액 = (기존 잔액 × 월금리 × 개월) − (상환 후 잔액 × 월금리 × 개월)</p>
        <p>• 순 절감액 = 이자 절감액 − 중도상환수수료</p>
        <p className="text-xs text-gray-400 pt-1">※ 단순 이자 기준 — 원리금균등 복리 효과 미반영</p>
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
              <p className="mb-2">중도상환수수료는 일반적으로 다음과 같이 계산됩니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>중도상환수수료 = 조기상환 금액 × 수수료율</li>
                <li>실제 상환 금액 = 조기상환 금액 + 중도상환수수료</li>
                <li>순 절감액 = 향후 이자 절감액 - 중도상환수수료</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">수수료율 기준</h3>
              <p className="mb-2">중도상환수수료율은 대출 종류와 시점에 따라 다릅니다:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>주택담보대출:</strong> 일반적으로 0.5~1.5% (대출 실행 후 3년 이내)</li>
                <li><strong>신용대출:</strong> 1.0~2.0% (대출 실행 후 1~2년 이내)</li>
                <li><strong>정책자금:</strong> 상품에 따라 수수료 면제 또는 낮은 수수료율 적용</li>
                <li><strong>수수료 면제:</strong> 대부분 3년 또는 5년 후 면제</li>
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
              <p className="mt-2 text-xs">※ 본 계산기는 단순 이자 기준이며, 실제로는 원리금균등 방식의 복리 효과를 고려해야 합니다.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 법적 규제</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>2021년 7월부터 <strong>신규 주택담보대출</strong>은 중도상환수수료가 폐지되었습니다.</li>
                <li>신용대출 등 일반 가계대출은 여전히 중도상환수수료가 적용됩니다.</li>
                <li>수수료율 상한: 법적으로 연간 원금의 2% 이내로 제한됩니다.</li>
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
                <li><strong>순 절감액이 플러스:</strong> 수수료를 내더라도 향후 이자 절감액이 더 큰 경우</li>
                <li><strong>고금리 대출:</strong> 금리가 7% 이상인 고금리 대출은 조기 상환이 유리</li>
                <li><strong>남은 기간이 긴 경우:</strong> 잔여 상환 기간이 3년 이상 남았다면 이자 절감 효과가 큼</li>
                <li><strong>대환 대출 금리 차이가 큰 경우:</strong> 기존 금리보다 2%p 이상 낮은 대출로 갈아탈 수 있는 경우</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ 신중해야 하는 경우</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>순 절감액이 마이너스:</strong> 수수료가 이자 절감액보다 큰 경우</li>
                <li><strong>수수료 면제 기간이 임박:</strong> 3개월~6개월 후 수수료 면제라면 기다리는 것이 유리</li>
                <li><strong>세제 혜택 상실:</strong> 주택담보대출 이자 소득공제를 받고 있다면 상환 후 혜택 상실 고려</li>
                <li><strong>유동성 위험:</strong> 비상자금이 부족한 상태에서 목돈을 상환에 쓰면 위험</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">실제 사례</h3>
              <p className="mb-2"><strong>사례: 5천만 원 잔액, 연 7% 금리, 잔여 10년</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>1천만 원 조기 상환 시 중도상환수수료(1.5%): 15만 원</li>
                <li>향후 10년간 이자 절감액: 약 700만 원</li>
                <li>순 절감액: 약 685만 원 (조기 상환 권장)</li>
              </ul>
              <p className="mt-2 text-xs">※ 위 사례는 단순 이자 기준이며, 실제로는 원리금균등 방식의 복리 효과로 절감액이 다를 수 있습니다.</p>
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
                <li>• <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융위원회</a> - 중도상환수수료 폐지 및 규제 정책</li>
                <li>• <a href="https://www.fss.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">금융감독원</a> - 금융소비자보호법 및 민원 상담</li>
                <li>• <a href="https://www.law.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">국가법령정보센터</a> - 대부업법, 금융소비자보호법</li>
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
      <DisclaimerNotice message="본 계산 결과는 단순 이자 기준 예상치이며, 실제 중도상환수수료는 대출 종류, 금융기관, 계약 조건에 따라 다를 수 있습니다. 정확한 수수료는 반드시 대출 계약서를 확인하거나 금융기관에 문의하세요." />

      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">💡 중도상환 체크리스트</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>수수료 면제 기간:</strong> 많은 대출 상품이 3년 또는 5년 후 수수료 면제를 제공합니다.</li>
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
