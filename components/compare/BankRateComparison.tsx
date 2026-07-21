'use client'

/**
 * 은행별 대출금리 실시간 비교표
 *
 * 금융감독원 공시 데이터를 조건에 맞춰 계산·정렬해 보여준다.
 * 핵심은 금리 나열이 아니라 **금리차를 월상환액·총이자로 환산**하는 것이다.
 * "연 4.1% vs 연 4.4%"는 체감되지 않지만 "총이자 2,300만원 차이"는 체감된다.
 */

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, ChevronDown, Info, Search, TrendingDown } from 'lucide-react'

import {
  RATE_BASIS_LABELS,
  REPAY_METHOD_LABELS,
  SORT_LABELS,
  buildComparison,
  collectFacets,
  filterOffers,
  type ComparisonRow,
  type RateBasis,
  type RepayMethod,
  type SortKey,
} from '@/lib/finlife/compare'
import { formatDisclosureMonth } from '@/lib/finlife/snapshot'
import { CREDIT_SCORE_BANDS, type LoanOffer, type LoanProductType } from '@/lib/finlife/types'

// ─── 표시 형식 ──────────────────────────────────────────────────────────────

/** 큰 금액을 억/만 단위 한국식으로 (예: 350000000 → "3억 5,000만원") */
function formatMoneyShort(value: number): string {
  const won = Math.round(value)
  if (won === 0) return '0원'
  const eok = Math.floor(won / 100_000_000)
  const man = Math.floor((won % 100_000_000) / 10_000)
  if (eok > 0) return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  if (man > 0) return `${man.toLocaleString()}만원`
  return `${won.toLocaleString()}원`
}

/** 원 단위까지 표시 (월상환액용) */
function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString()}원`
}

const PRODUCT_TABS: { type: LoanProductType; label: string; short: string }[] = [
  { type: 'mortgage', label: '주택담보대출', short: '주담대' },
  { type: 'rent', label: '전세자금대출', short: '전세' },
  { type: 'credit', label: '개인신용대출', short: '신용' },
]

/** 상품종류별 기본 조건 — 실제 이용 규모에 맞춘 초기값 */
const DEFAULTS: Record<LoanProductType, { amount: number; months: number }> = {
  mortgage: { amount: 300_000_000, months: 360 },
  rent: { amount: 200_000_000, months: 24 },
  credit: { amount: 30_000_000, months: 60 },
}

/** 상품종류별 금액 슬라이더 범위 */
const AMOUNT_RANGE: Record<LoanProductType, { min: number; max: number; step: number }> = {
  mortgage: { min: 50_000_000, max: 1_000_000_000, step: 10_000_000 },
  rent: { min: 20_000_000, max: 600_000_000, step: 10_000_000 },
  credit: { min: 5_000_000, max: 150_000_000, step: 5_000_000 },
}

const MONTH_RANGE: Record<LoanProductType, { min: number; max: number; step: number }> = {
  mortgage: { min: 60, max: 480, step: 12 },
  rent: { min: 12, max: 120, step: 6 },
  credit: { min: 12, max: 120, step: 6 },
}

// ─── 공용 소형 컴포넌트 ─────────────────────────────────────────────────────

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  unit,
  onChange,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  displayValue: string
  unit?: string
  onChange: (v: number) => void
  hint?: string
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

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm ${
        active
          ? 'bg-indigo-600 text-white border border-indigo-600'
          : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
      }`}
    >
      {children}
    </button>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

// ─── 비교표 행 ──────────────────────────────────────────────────────────────

function OfferRow({ row, rank }: { row: ComparisonRow; rank: number }) {
  const [open, setOpen] = useState(false)
  const { offer } = row
  const isBest = rank === 1

  const details: { label: string; value: string | null }[] = [
    { label: '대출한도', value: offer.loanLimit },
    { label: '중도상환수수료', value: offer.earlyRepayFee },
    { label: '부대비용', value: offer.incidentalExpense },
    { label: '연체이자율', value: offer.delinquentRate },
    { label: '가입방법', value: offer.joinWay.length ? offer.joinWay.join(', ') : null },
  ].filter((d) => d.value)

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isBest ? 'border-indigo-300 bg-indigo-50/40' : 'border-gray-100 bg-white hover:border-indigo-200'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isBest ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* 은행·상품명 */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-gray-900">{offer.companyName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {offer.finGroupName}
            </span>
            {isBest && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-semibold">
                최저
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 truncate">{offer.productName}</p>

          {/* 조건 태그 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {[offer.rateType, offer.repayType, offer.collateralType, offer.creditProductType]
              .filter(Boolean)
              .map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">
                  {tag}
                </span>
              ))}
          </div>

          {/* 수치 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-[10px] text-gray-400">적용 금리</p>
              <p className="font-bold text-indigo-700 text-sm">연 {row.rate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">
                월 {row.repayMethod === 'bullet' ? '이자' : '상환액'}
              </p>
              <p className="font-bold text-gray-900 text-sm">{formatWon(row.monthly)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">총이자</p>
              <p className="font-bold text-gray-900 text-sm">{formatMoneyShort(row.totalInterest)}</p>
            </div>
          </div>

          {/* 1위 대비 차액 */}
          {row.extraInterestVsBest > 0 && (
            <p className="mt-2 text-xs text-red-500 font-medium">
              최저 상품보다 총이자 +{formatMoneyShort(row.extraInterestVsBest)}
              <span className="text-gray-400 font-normal">
                {' '}
                (월 +{formatWon(row.extraMonthlyVsBest)})
              </span>
            </p>
          )}
        </div>

        {details.length > 0 && (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && details.length > 0 && (
        <div className="px-4 pb-4 pt-0 space-y-2 border-t border-gray-100 mt-1">
          {details.map((d) => (
            <div key={d.label} className="pt-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{d.label}</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{d.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 메인 ───────────────────────────────────────────────────────────────────

export default function BankRateComparison({
  offers,
  disclosureMonths,
}: {
  offers: LoanOffer[]
  disclosureMonths: Partial<Record<LoanProductType, string>>
}) {
  const [productType, setProductType] = useState<LoanProductType>('mortgage')
  const [amount, setAmount] = useState(DEFAULTS.mortgage.amount)
  const [months, setMonths] = useState(DEFAULTS.mortgage.months)
  const [creditScore, setCreditScore] = useState(750)
  const [rateBasis, setRateBasis] = useState<RateBasis>('min')
  const [sortKey, setSortKey] = useState<SortKey>('totalInterest')
  const [repayOverride, setRepayOverride] = useState<RepayMethod | 'auto'>('auto')
  const [rateTypeFilter, setRateTypeFilter] = useState<string>('')
  const [collateralFilter, setCollateralFilter] = useState<string>('')
  const [creditTypeFilter, setCreditTypeFilter] = useState<string>('')
  const [groupFilter, setGroupFilter] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(20)

  /** 상품종류 전환 시 조건을 그 상품에 맞는 기본값으로 되돌린다 */
  function switchProduct(type: LoanProductType) {
    setProductType(type)
    setAmount(DEFAULTS[type].amount)
    setMonths(DEFAULTS[type].months)
    setRateTypeFilter('')
    setCollateralFilter('')
    setCreditTypeFilter('')
    setGroupFilter([])
    setQuery('')
    setLimit(20)
  }

  const typeOffers = useMemo(
    () => offers.filter((o) => o.productType === productType),
    [offers, productType]
  )

  const facets = useMemo(() => collectFacets(typeOffers), [typeOffers])

  const filtered = useMemo(
    () =>
      filterOffers(typeOffers, {
        finGroupCodes: groupFilter,
        rateType: rateTypeFilter || undefined,
        collateralType: collateralFilter || undefined,
        creditProductType: creditTypeFilter || undefined,
        query: query || undefined,
      }),
    [typeOffers, groupFilter, rateTypeFilter, collateralFilter, creditTypeFilter, query]
  )

  const result = useMemo(
    () =>
      buildComparison(
        filtered,
        {
          productType,
          amount,
          months,
          rateBasis,
          creditScore: productType === 'credit' ? creditScore : undefined,
          repayMethod: repayOverride === 'auto' ? undefined : repayOverride,
        },
        sortKey
      ),
    [filtered, productType, amount, months, rateBasis, creditScore, repayOverride, sortKey]
  )

  const rows = result.rows
  const best = rows[0]
  const worst = rows[rows.length - 1]

  /**
   * 총이자 상하위 격차 — 이 페이지가 전하려는 핵심 메시지.
   *
   * 반드시 **같은 상환방식끼리만** 비교한다. 만기일시상환은 원금을 만기까지 들고 가므로
   * 총이자가 구조적으로 크다. 원리금균등 상품과 섞어 격차를 내면 상환구조 차이를
   * "은행 간 금리 차이"로 잘못 돌리게 된다.
   */
  const spread = useMemo(() => {
    if (rows.length < 2) return null
    const method = rows[0].repayMethod
    const sameMethod = rows.filter((r) => r.repayMethod === method)
    if (sameMethod.length < 2) return null

    const sorted = [...sameMethod].sort((a, b) => a.totalInterest - b.totalInterest)
    const low = sorted[0]
    const high = sorted[sorted.length - 1]
    if (high.totalInterest <= low.totalInterest) return null

    return { low, high, method, gap: high.totalInterest - low.totalInterest }
  }, [rows])

  /** 표에 상환방식이 섞여 있는지 — 섞이면 총이자 정렬이 공정하지 않다 */
  const mixedRepayMethods = useMemo(() => {
    const methods = new Set(rows.map((r) => r.repayMethod))
    return methods.size > 1 ? Array.from(methods) : null
  }, [rows])

  /** 차트: 총이자 기준 상위 10개 */
  const chartData = useMemo(
    () =>
      [...rows]
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 10)
        .map((r) => ({
          name:
            r.offer.companyName.length > 6
              ? r.offer.companyName.replace(/(주식회사|㈜|은행)/g, '').slice(0, 6)
              : r.offer.companyName,
          rate: Number(r.rate.toFixed(2)),
          fullName: r.offer.companyName,
          product: r.offer.productName,
        })),
    [rows]
  )

  const monthLabel = formatDisclosureMonth(disclosureMonths[productType])
  const amountRange = AMOUNT_RANGE[productType]
  const monthRange = MONTH_RANGE[productType]
  const currentBand = CREDIT_SCORE_BANDS.find(
    (b) => creditScore >= b.min && creditScore <= b.max
  )

  return (
    <div className="container max-w-6xl py-8">
      {/* ── 헤더 ── */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 금융감독원 공시 데이터 · 조건 조작 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">은행별 대출금리 비교</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {offers.length}개 상품의 실제 공시 금리를 내 조건의 월상환액·총이자로 환산해 비교합니다
        </p>
      </div>

      {/* ── 상품종류 탭 ── */}
      <div className="flex justify-center gap-2 mb-6">
        {PRODUCT_TABS.map((tab) => {
          const count = offers.filter((o) => o.productType === tab.type).length
          const active = productType === tab.type
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => switchProduct(tab.type)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              <span className={`ml-1.5 text-xs ${active ? 'text-indigo-200' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">
        {/* ── 좌: 조건 입력 ── */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 space-y-5">
            <SliderInput
              label="대출 금액"
              value={amount}
              min={amountRange.min}
              max={amountRange.max}
              step={amountRange.step}
              displayValue={formatMoneyShort(amount)}
              onChange={setAmount}
              hint={`${formatMoneyShort(amountRange.min)} ~ ${formatMoneyShort(amountRange.max)}`}
            />

            <SliderInput
              label="대출 기간"
              value={months}
              min={monthRange.min}
              max={monthRange.max}
              step={monthRange.step}
              displayValue={months % 12 === 0 ? `${months / 12}` : `${months}`}
              unit={months % 12 === 0 ? '년' : '개월'}
              onChange={setMonths}
              hint={`${monthRange.min / 12 >= 1 ? `${monthRange.min / 12}년` : `${monthRange.min}개월`} ~ ${monthRange.max / 12}년`}
            />

            {productType === 'credit' && (
              <SliderInput
                label="내 신용점수"
                value={creditScore}
                min={350}
                max={1000}
                step={10}
                displayValue={String(creditScore)}
                unit="점"
                onChange={setCreditScore}
                hint={
                  currentBand
                    ? `공시 구간: ${currentBand.label} — 이 구간의 실제 취급금리로 비교합니다`
                    : undefined
                }
              />
            )}

            {/* 금리 기준 */}
            {productType !== 'credit' && (
              <FieldGroup label="금리 기준">
                {(Object.keys(RATE_BASIS_LABELS) as RateBasis[]).map((basis) => (
                  <Pill key={basis} active={rateBasis === basis} onClick={() => setRateBasis(basis)}>
                    {RATE_BASIS_LABELS[basis]}
                  </Pill>
                ))}
              </FieldGroup>
            )}

            {/* 상환 방식 */}
            <FieldGroup label="상환 방식">
              <Pill active={repayOverride === 'auto'} onClick={() => setRepayOverride('auto')}>
                공시 기준
              </Pill>
              <Pill active={repayOverride === 'epi'} onClick={() => setRepayOverride('epi')}>
                원리금균등
              </Pill>
              <Pill active={repayOverride === 'ep'} onClick={() => setRepayOverride('ep')}>
                원금균등
              </Pill>
              <Pill active={repayOverride === 'bullet'} onClick={() => setRepayOverride('bullet')}>
                만기일시
              </Pill>
            </FieldGroup>

            {/* 금융권역 */}
            {facets.finGroups.length > 1 && (
              <FieldGroup label="금융권역">
                <Pill active={groupFilter.length === 0} onClick={() => setGroupFilter([])}>
                  전체
                </Pill>
                {facets.finGroups.map((g) => (
                  <Pill
                    key={g.code}
                    active={groupFilter.includes(g.code)}
                    onClick={() =>
                      setGroupFilter((prev) =>
                        prev.includes(g.code) ? prev.filter((c) => c !== g.code) : [...prev, g.code]
                      )
                    }
                  >
                    {g.name}
                  </Pill>
                ))}
              </FieldGroup>
            )}

            {/* 금리 유형 */}
            {facets.rateTypes.length > 0 && (
              <FieldGroup label="금리 유형">
                <Pill active={rateTypeFilter === ''} onClick={() => setRateTypeFilter('')}>
                  전체
                </Pill>
                {facets.rateTypes.map((t) => (
                  <Pill key={t} active={rateTypeFilter === t} onClick={() => setRateTypeFilter(t)}>
                    {t}
                  </Pill>
                ))}
              </FieldGroup>
            )}

            {/* 담보 유형 */}
            {facets.collateralTypes.length > 0 && (
              <FieldGroup label="담보 유형">
                <Pill active={collateralFilter === ''} onClick={() => setCollateralFilter('')}>
                  전체
                </Pill>
                {facets.collateralTypes.map((t) => (
                  <Pill key={t} active={collateralFilter === t} onClick={() => setCollateralFilter(t)}>
                    {t}
                  </Pill>
                ))}
              </FieldGroup>
            )}

            {/* 신용대출 종류 */}
            {facets.creditProductTypes.length > 0 && (
              <FieldGroup label="대출 종류">
                <Pill active={creditTypeFilter === ''} onClick={() => setCreditTypeFilter('')}>
                  전체
                </Pill>
                {facets.creditProductTypes.map((t) => (
                  <Pill key={t} active={creditTypeFilter === t} onClick={() => setCreditTypeFilter(t)}>
                    {t}
                  </Pill>
                ))}
              </FieldGroup>
            )}

            {/* 검색 */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">은행·상품명 검색</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예: 카카오, 전세"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* 데이터 출처 */}
          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">📌 데이터 출처</p>
            <p>• 금융감독원 「금융상품 통합 비교공시」 공시자료</p>
            {monthLabel && <p>• 공시 기준: {monthLabel}</p>}
            <p>• 공시 금리는 전월 취급 실적 기준이며 실제 적용 금리와 다를 수 있습니다</p>
          </div>
        </div>

        {/* ── 우: 결과 ── */}
        <div className="space-y-6 mt-8 lg:mt-0">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-500 text-sm mb-2">조건에 맞는 상품이 없습니다.</p>
              <p className="text-gray-400 text-xs">
                {result.excludedByCreditScore > 0
                  ? `신용점수 ${creditScore}점 구간을 취급하는 상품이 없습니다. 점수 조건을 조정해보세요.`
                  : '필터를 줄이거나 검색어를 지워보세요.'}
              </p>
            </div>
          ) : (
            <>
              {/* 히어로: 최저금리 상품 */}
              <div
                className="rounded-2xl p-6 sm:p-8 text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
              >
                <p className="text-indigo-200 text-sm mb-1">
                  {sortKey === 'rate' ? '최저 금리' : '총이자 최저'} 상품
                </p>
                <p className="text-3xl sm:text-4xl font-bold mb-1 tracking-tight">
                  연 {best.rate.toFixed(2)}%
                </p>
                <p className="text-indigo-100 text-sm font-medium">
                  {best.offer.companyName} · {best.offer.productName}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/20">
                  <div>
                    <p className="text-indigo-200 text-[11px] uppercase tracking-wider font-bold mb-1">
                      월 {best.repayMethod === 'bullet' ? '이자' : '상환액'}
                    </p>
                    <p className="text-xl font-bold">{formatWon(best.monthly)}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-[11px] uppercase tracking-wider font-bold mb-1">
                      총이자
                    </p>
                    <p className="text-xl font-bold">{formatMoneyShort(best.totalInterest)}</p>
                  </div>
                </div>
              </div>

              {/* 핵심 인사이트: 상하위 격차 */}
              {spread && spread.gap > 0 && (
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-800 mb-1">
                        어디서 빌리냐에 따라 총이자가{' '}
                        <span className="text-amber-600">{formatMoneyShort(spread.gap)}</span> 차이납니다
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {formatMoneyShort(amount)}을 {months % 12 === 0 ? `${months / 12}년` : `${months}개월`},{' '}
                        <strong className="text-gray-600">{REPAY_METHOD_LABELS[spread.method]}</strong> 조건으로
                        맞췄을 때 최저({spread.low.rate.toFixed(2)}% · {spread.low.offer.companyName})와 최고(
                        {spread.high.rate.toFixed(2)}% · {spread.high.offer.companyName})의 만기까지 총이자
                        차이입니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 금리 분포 차트 */}
              {chartData.length > 1 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-sm text-gray-700 mb-4">금리 낮은 순 상위 10개</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        domain={['dataMin - 0.5', 'dataMax + 0.3']}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(value) => [`연 ${String(value)}%`, '금리']}
                        labelFormatter={(_, payload) => {
                          const item = payload?.[0]?.payload as
                            | { fullName?: string; product?: string }
                            | undefined
                          return item ? `${item.fullName} · ${item.product}` : ''
                        }}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? '#4f46e5' : '#c7d2fe'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* 상환방식이 섞여 있을 때의 경고 — 총이자 정렬이 공정하지 않다 */}
              {mixedRepayMethods && sortKey === 'totalInterest' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-amber-800 leading-relaxed">
                      <p className="font-semibold mb-1">상환방식이 다른 상품이 섞여 있습니다</p>
                      <p className="mb-2">
                        만기일시상환은 원금을 만기까지 그대로 들고 가므로 월 부담은 적지만 총이자가 구조적으로
                        큽니다. 지금 총이자 순으로 정렬하면 금리와 무관하게 만기일시 상품이 뒤로 밀립니다.
                      </p>
                      <button
                        type="button"
                        onClick={() => setRepayOverride('epi')}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                      >
                        원리금균등으로 통일해 비교하기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 정렬 + 결과 수 */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{rows.length}개</span> 상품 비교 중
                  {result.excludedByCreditScore > 0 && (
                    <span className="text-xs text-gray-400">
                      {' '}
                      (신용점수 구간 미취급 {result.excludedByCreditScore}개 제외)
                    </span>
                  )}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <Pill key={key} active={sortKey === key} onClick={() => setSortKey(key)}>
                      {SORT_LABELS[key]}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* 비교표 */}
              <div className="space-y-2">
                {rows.slice(0, limit).map((row, i) => (
                  <OfferRow key={row.offer.id} row={row} rank={i + 1} />
                ))}
              </div>

              {limit < rows.length && (
                <button
                  type="button"
                  onClick={() => setLimit((v) => v + 20)}
                  className="w-full py-3 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors"
                >
                  {Math.min(20, rows.length - limit)}개 더 보기 (총 {rows.length}개)
                </button>
              )}

              {/* 계산 방식 */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
                <p>
                  • 월상환액·총이자는 공시 금리를 입력하신 금액·기간에 적용해 계산한 값입니다
                </p>
                <p>• 원리금균등: 매월 같은 금액 상환 / 원금균등: 원금 균등분할, 이자는 점차 감소</p>
                <p>• 만기일시: 매월 이자만 내고 만기에 원금 상환 (전세대출에 주로 해당)</p>
                {productType === 'credit' ? (
                  <p>
                    • 신용대출은 입력한 신용점수 구간의 실제 공시 취급금리를 사용합니다. 해당 구간을
                    취급하지 않는 상품은 비교에서 제외됩니다
                  </p>
                ) : (
                  <p>
                    • {RATE_BASIS_LABELS[rateBasis]} 기준입니다. 최저금리는 최우량 신용자 기준이므로
                    평균금리도 함께 확인하세요
                  </p>
                )}
                <p className="text-gray-400 text-xs pt-1">
                  • 우대금리·부대비용·중도상환수수료는 계산에 반영되지 않았습니다
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 최저금리 해석 주의 */}
      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">이 표를 읽을 때 주의할 점</p>
            <ul className="text-blue-800 text-xs space-y-1.5 leading-relaxed">
              <li>
                • <strong>공시 금리는 전월에 실제 취급된 금리</strong>입니다. 오늘 신청 시 금리는 다를 수
                있습니다.
              </li>
              <li>
                • <strong>최저금리는 최우량 신용자 기준</strong>입니다. 본인 조건에서는 평균금리에 가까운
                경우가 많습니다.
              </li>
              <li>
                • 금리가 낮아도 <strong>중도상환수수료·부대비용</strong>이 크면 총부담이 역전될 수 있습니다.
                각 상품을 눌러 조건을 확인하세요.
              </li>
              <li>
                • 여러 금융회사에 동시에 대출을 조회하면 <strong>신용점수에 영향</strong>이 있을 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
