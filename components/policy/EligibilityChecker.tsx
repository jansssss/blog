'use client'

/**
 * 지원정책 자격 확인기
 *
 * 이 화면의 가치는 "해당됩니다" 목록이 아니라 **왜 되는지/왜 안 되는지**에 있다.
 * 그래서 조건 미달 제도도 숨기지 않고 무엇이 걸리는지 함께 보여준다.
 * ("소득이 300만원만 낮았으면 됐다"는 정보가 실제로 가장 쓸모 있다)
 */

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronDown,
  ExternalLink,
  Info,
  X,
} from 'lucide-react'

import { ACTIVE_POLICIES, CLOSED_POLICIES } from '@/lib/policy/data'
import { formatMoney, isStale, matchAllPolicies } from '@/lib/policy/match'
import { medianIncomeRatio, MEDIAN_INCOME_YEAR } from '@/lib/policy/median-income'
import {
  CATEGORY_LABELS,
  MARITAL_LABELS,
  REGION_LABELS,
  type MaritalStatus,
  type PolicyMatch,
  type RegionType,
  type UserProfile,
} from '@/lib/policy/types'

// ─── 입력 컴포넌트 ──────────────────────────────────────────────────────────

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

// ─── 결과 카드 ──────────────────────────────────────────────────────────────

function MatchCard({ match, defaultOpen }: { match: PolicyMatch; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const { policy, verdict, passed, failed, isOpenNow, nextPeriod } = match
  const stale = isStale(policy.asOf)

  const tone =
    verdict === 'ineligible'
      ? { border: 'border-gray-200', bg: 'bg-white', badge: 'bg-gray-100 text-gray-500', label: '조건 미달' }
      : isOpenNow
        ? { border: 'border-indigo-300', bg: 'bg-indigo-50/40', badge: 'bg-indigo-600 text-white', label: '해당 가능' }
        : { border: 'border-amber-200', bg: 'bg-amber-50/40', badge: 'bg-amber-500 text-white', label: '신청기간 아님' }

  return (
    <div className={`rounded-xl border ${tone.border} ${tone.bg} transition-colors`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full text-left p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-gray-900">{policy.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${tone.badge}`}>{tone.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {CATEGORY_LABELS[policy.category]}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {policy.provider} · {policy.summary}
          </p>

          {/* 미달 사유를 접기 전에도 보여준다 — 이게 핵심 정보다 */}
          {failed.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {failed.map((f) => (
                <span
                  key={f.label}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100"
                >
                  {f.label} 미달
                </span>
              ))}
            </div>
          )}

          {verdict !== 'ineligible' && !isOpenNow && (
            <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
              <CalendarClock className="w-3 h-3" />
              {nextPeriod
                ? `다음 신청: ${nextPeriod.start} ~ ${nextPeriod.end}${nextPeriod.label ? ` (${nextPeriod.label})` : ''}`
                : '현재 신청 기간이 아닙니다'}
            </p>
          )}

          {verdict !== 'ineligible' && policy.volatile.benefit && (
            <p className="text-xs text-gray-600 mt-1.5 font-medium">{policy.volatile.benefit}</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* 조건 판정 내역 */}
          <div className="space-y-1.5">
            {failed.map((c) => (
              <div key={c.label} className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-700">{c.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
            {passed.map((c) => (
              <div key={c.label} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{c.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 직접 확인해야 하는 조건 */}
          {verdict !== 'ineligible' && policy.manualChecks.length > 0 && (
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <p className="text-[11px] font-bold text-gray-700 mb-1.5">직접 확인이 필요한 조건</p>
              <ul className="space-y-1">
                {policy.manualChecks.map((check) => (
                  <li key={check} className="text-xs text-gray-600 leading-relaxed">
                    • {check}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 금리·한도 — 기준일과 함께 */}
          {(policy.volatile.rate || policy.volatile.limit || policy.volatile.limitByRegion) && (
            <div className="rounded-lg bg-white border border-gray-200 p-3 space-y-1">
              <p className="text-[11px] font-bold text-gray-700 mb-1">지원 조건</p>
              {policy.volatile.rate && (
                <p className="text-xs text-gray-600">
                  <span className="text-gray-400">금리</span> {policy.volatile.rate}
                </p>
              )}
              {policy.volatile.limit && (
                <p className="text-xs text-gray-600">
                  <span className="text-gray-400">한도</span> {policy.volatile.limit}
                </p>
              )}
              {policy.volatile.limitByRegion &&
                Object.entries(policy.volatile.limitByRegion).map(([region, limit]) => (
                  <p key={region} className="text-xs text-gray-600">
                    <span className="text-gray-400">{REGION_LABELS[region as RegionType]}</span> {limit}
                  </p>
                ))}
              <p className="text-[11px] text-amber-600 pt-1">
                ⚠ 금리·한도는 수시로 바뀝니다. 반드시 공식 페이지에서 최신 값을 확인하세요.
              </p>
            </div>
          )}

          {/* 신청 방법 + 출처 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-semibold text-gray-700">신청</span> {policy.howToApply}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <a
                href={policy.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {policy.source.name} <ExternalLink className="w-3 h-3" />
              </a>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${stale ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                {policy.asOf} 확인
                {stale && ' · 오래됨'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 메인 ───────────────────────────────────────────────────────────────────

export default function EligibilityChecker() {
  const [age, setAge] = useState(30)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single')
  const [annualIncome, setAnnualIncome] = useState(40_000_000)
  const [netAssets, setNetAssets] = useState(50_000_000)
  const [isHomeless, setIsHomeless] = useState(true)
  const [region, setRegion] = useState<RegionType>('capital')
  const [householdSize, setHouseholdSize] = useState(1)
  const [showUnmatched, setShowUnmatched] = useState(false)

  const profile: UserProfile = useMemo(
    () => ({ age, maritalStatus, annualIncome, netAssets, isHomeless, region, householdSize }),
    [age, maritalStatus, annualIncome, netAssets, isHomeless, region, householdSize]
  )

  const summary = useMemo(() => matchAllPolicies(ACTIVE_POLICIES, profile), [profile])
  const incomeRatio = medianIncomeRatio(annualIncome, householdSize)

  const openNow = summary.matched.filter((m) => m.isOpenNow)
  const notOpen = summary.matched.filter((m) => !m.isOpenNow)

  return (
    <div className="container max-w-6xl py-8">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 입력 즉시 판정 · 공식 출처 검증 데이터
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">지원정책 자격 확인기</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          내 조건을 입력하면 받을 수 있는 제도와, 안 되는 제도는 무엇이 걸리는지 알려드립니다
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start">
        {/* 좌: 입력 */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 space-y-5">
            <SliderInput
              label="만 나이"
              value={age}
              min={19}
              max={70}
              step={1}
              displayValue={String(age)}
              unit="세"
              onChange={setAge}
              hint="만 19~34세면 청년 전용 제도 대상이 됩니다"
            />

            <FieldGroup label="혼인 상태">
              {(Object.keys(MARITAL_LABELS) as MaritalStatus[]).map((m) => (
                <Pill key={m} active={maritalStatus === m} onClick={() => setMaritalStatus(m)}>
                  {MARITAL_LABELS[m]}
                </Pill>
              ))}
            </FieldGroup>

            <SliderInput
              label={maritalStatus === 'single' ? '연소득' : '부부합산 연소득'}
              value={annualIncome}
              min={0}
              max={150_000_000}
              step={1_000_000}
              displayValue={formatMoney(annualIncome)}
              onChange={setAnnualIncome}
              hint={`${MEDIAN_INCOME_YEAR}년 기준 중위소득의 약 ${incomeRatio}% (${householdSize}인 가구)`}
            />

            <SliderInput
              label="순자산"
              value={netAssets}
              min={0}
              max={800_000_000}
              step={5_000_000}
              displayValue={formatMoney(netAssets)}
              onChange={setNetAssets}
              hint="보유 자산에서 부채를 뺀 금액입니다"
            />

            <SliderInput
              label="가구원 수"
              value={householdSize}
              min={1}
              max={7}
              step={1}
              displayValue={String(householdSize)}
              unit="인"
              onChange={setHouseholdSize}
              hint="본인 포함. 중위소득 기준 판정에 사용됩니다"
            />

            <FieldGroup label="주택 보유">
              <Pill active={isHomeless} onClick={() => setIsHomeless(true)}>
                무주택
              </Pill>
              <Pill active={!isHomeless} onClick={() => setIsHomeless(false)}>
                주택 보유
              </Pill>
            </FieldGroup>

            <FieldGroup label="거주 지역">
              {(Object.keys(REGION_LABELS) as RegionType[]).map((r) => (
                <Pill key={r} active={region === r} onClick={() => setRegion(r)}>
                  {REGION_LABELS[r]}
                </Pill>
              ))}
            </FieldGroup>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">📌 판정 기준</p>
            <p>• 각 제도 운영기관의 공식 페이지에서 확인한 조건을 사용합니다</p>
            <p>• 제도마다 확인 기준일을 표기하며, 6개월이 지나면 경고를 띄웁니다</p>
            <p>• 중위소득 기준은 {MEDIAN_INCOME_YEAR}년 보건복지부 고시를 따릅니다</p>
          </div>
        </div>

        {/* 우: 결과 */}
        <div className="space-y-6 mt-8 lg:mt-0">
          {/* 요약 */}
          <div
            className="rounded-2xl p-6 sm:p-7 text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
          >
            <p className="text-indigo-200 text-sm mb-1">지금 신청할 수 있는 제도</p>
            <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">{openNow.length}개</p>
            <p className="text-indigo-100 text-sm">
              전체 {ACTIVE_POLICIES.length}개 중 조건이 맞는 제도 {summary.matched.length}개
              {notOpen.length > 0 && ` (신청기간이 아닌 제도 ${notOpen.length}개 포함)`}
            </p>
          </div>

          {/* 지금 신청 가능 */}
          {openNow.length > 0 && (
            <section>
              <h2 className="font-bold text-sm text-gray-800 mb-3">지금 신청 가능</h2>
              <div className="space-y-2">
                {openNow.map((m) => (
                  <MatchCard key={m.policy.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {/* 자격은 되지만 기간이 아님 */}
          {notOpen.length > 0 && (
            <section>
              <h2 className="font-bold text-sm text-gray-800 mb-1">조건은 맞지만 지금은 신청 기간이 아님</h2>
              <p className="text-xs text-gray-500 mb-3">
                다음 모집 공고를 기다려야 합니다. 기관별로 연 1~2회 모집하는 경우가 많습니다.
              </p>
              <div className="space-y-2">
                {notOpen.map((m) => (
                  <MatchCard key={m.policy.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {openNow.length === 0 && notOpen.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-500 text-sm mb-2">조건에 맞는 제도를 찾지 못했습니다.</p>
              <p className="text-gray-400 text-xs">
                아래 &lsquo;조건이 맞지 않는 제도&rsquo;에서 무엇이 걸리는지 확인해보세요.
              </p>
            </div>
          )}

          {/* 조건 미달 — 왜 안 되는지가 핵심 */}
          {summary.unmatched.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setShowUnmatched((v) => !v)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">
                  조건이 맞지 않는 제도 {summary.unmatched.length}개 — 무엇이 걸리는지 보기
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${showUnmatched ? 'rotate-180' : ''}`}
                />
              </button>
              {showUnmatched && (
                <div className="space-y-2 mt-2">
                  {summary.unmatched.map((m) => (
                    <MatchCard key={m.policy.id} match={m} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 종료된 제도 안내 */}
          {CLOSED_POLICIES.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="font-bold text-sm text-gray-700 mb-1">신규 신청이 종료된 제도</h2>
              <p className="text-xs text-gray-500 mb-3">
                검색으로 많이 찾지만 지금은 신청할 수 없는 제도입니다. 후속 제도를 확인하세요.
              </p>
              <div className="space-y-2">
                {CLOSED_POLICIES.map((policy) => {
                  const next = policy.supersededBy
                    ? ACTIVE_POLICIES.find((p) => p.id === policy.supersededBy)
                    : undefined
                  return (
                    <div key={policy.id} className="rounded-lg bg-white border border-gray-200 p-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-gray-500 line-through">{policy.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-semibold">
                          종료
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{policy.closedReason}</p>
                      {next && (
                        <p className="text-xs text-indigo-600 font-medium mt-1.5">→ 후속 제도: {next.name}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 해석 주의 */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">이 결과를 읽을 때</p>
                <ul className="text-blue-800 text-xs space-y-1.5 leading-relaxed">
                  <li>
                    • 이 도구는 <strong>공개된 수치 요건만</strong> 대조합니다. 세대주 여부, 재직 기간, 대상주택
                    조건 등 서류로 확인하는 항목은 판정에 포함되지 않습니다.
                  </li>
                  <li>
                    • 따라서 &lsquo;해당 가능&rsquo;은 <strong>1차 요건을 충족한다</strong>는 뜻이며 승인을
                    보장하지 않습니다. 각 제도의 &lsquo;직접 확인이 필요한 조건&rsquo;을 꼭 읽어보세요.
                  </li>
                  <li>
                    • 소득은 세전 기준이며, 주거급여 등 일부 제도는 재산을 소득으로 환산한{' '}
                    <strong>소득인정액</strong>을 사용해 실제 판정과 다를 수 있습니다.
                  </li>
                  <li>• 최종 확인은 반드시 각 제도의 공식 페이지나 담당 기관에서 하세요.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 검증 안내 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>수록 범위</strong> — 현재 공식 출처로 조건을 검증한 {ACTIVE_POLICIES.length}개 제도만
                판정에 사용합니다. 확인하지 못한 제도는 틀린 판정을 내리는 것보다 빼두는 편이 낫다고 판단해
                포함하지 않았습니다. 공공임대·행복주택·보금자리론 등은 순차적으로 검증해 추가할 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
