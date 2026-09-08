'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import {
  calculateStressDsr, DEFAULT_STRESS_INPUT, formatDsrMoney, RATE_TYPE_LABELS,
  STRESS_EXAMPLES, validateStressInput, type StressDsrInput, type MortgageRateType,
} from '@/lib/stress-dsr'

type NumericKey = Exclude<keyof StressDsrInput, 'region' | 'rateType'>
type FormState = Record<NumericKey, string> & Pick<StressDsrInput, 'region' | 'rateType'>

function toForm(input: StressDsrInput): FormState {
  return { ...input, income: String(input.income / 10000), principal: String(input.principal / 10000),
    existingAnnual: String(input.existingAnnual / 10000), existingStressExtra: String(input.existingStressExtra / 10000),
    rate: String(input.rate), years: String(input.years), fixedYears: String(input.fixedYears), dsrLimit: String(input.dsrLimit) }
}

function NumericField({ id, label, value, unit, min, max, step = 1, hint, onChange }: {
  id: string; label: string; value: string; unit: string; min: number; max: number; step?: number;
  hint?: string; onChange: (value: string) => void
}) {
  const amount = Number(value)
  const percent = max === min ? 0 : Math.max(0, Math.min(100, (amount - min) / (max - min) * 100))
  return <div className="space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-1.5">
        <input id={id} type="number" inputMode="decimal" min={min} step={step} value={value}
          onChange={e => onChange(e.target.value)} aria-describedby={hint ? `${id}-hint` : undefined}
          className="w-28 rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-right text-base font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
    <input type="range" aria-label={`${label} 슬라이더`} min={min} max={max} step={step}
      value={Number.isFinite(amount) ? Math.max(min, Math.min(max, amount)) : min}
      onChange={e => onChange(e.target.value)} className="h-2 w-full cursor-pointer rounded-full accent-indigo-600"
      style={{ background: `linear-gradient(to right, #6366f1 ${percent}%, #c7d2fe ${percent}%)` }} />
    {hint && <p id={`${id}-hint`} className="text-xs leading-relaxed text-gray-500">{hint}</p>}
  </div>
}

export default function StressDsrCalculator() {
  const [form, setForm] = useState<FormState>(() => toForm(DEFAULT_STRESS_INPUT))
  const input = useMemo<StressDsrInput>(() => {
    const num = (key: NumericKey) => form[key].trim() === '' ? NaN : Number(form[key])
    return { ...form, income: num('income') * 10000, principal: num('principal') * 10000,
      existingAnnual: num('existingAnnual') * 10000, existingStressExtra: num('existingStressExtra') * 10000,
      rate: num('rate'), years: num('years'), fixedYears: num('fixedYears'), dsrLimit: num('dsrLimit') }
  }, [form])
  const error = validateStressInput(input)
  const result = useMemo(() => error ? null : calculateStressDsr(input), [error, input])
  const comparisons = useMemo(() => error ? [] : (Object.keys(RATE_TYPE_LABELS) as MortgageRateType[])
    .map(rateType => ({ label: RATE_TYPE_LABELS[rateType], ...calculateStressDsr({ ...input, rateType }) })), [input, error])

  function change(key: NumericKey, value: string) {
    setForm(previous => ({ ...previous, [key]: value,
      ...(key === 'years' && Number(value) >= 1 && Number(previous.fixedYears) > Number(value)
        ? { fixedYears: value } : {}) }))
  }

  return <div className="my-5 space-y-5 not-prose">
    <div className="flex flex-wrap gap-2" aria-label="계산 예시 선택">
      {STRESS_EXAMPLES.map(example => <button key={example.id} type="button"
        onClick={() => setForm(toForm(example.input))}
        className="rounded-full border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-indigo-600">
        {example.label}
      </button>)}
    </div>
    <div className="sticky top-2 z-10 rounded-xl border border-indigo-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur md:hidden" aria-label="모바일 실시간 결과">
      {result ? <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-[11px] text-gray-500">DSR만 고려한 한도</p><p className="text-xl font-extrabold text-indigo-700">{formatDsrMoney(result.stressLimit)}</p></div>
        <div className="text-right"><p className="text-[11px] text-gray-500">스트레스 DSR</p><p className="text-lg font-bold text-gray-800">{result.stressDsr.toFixed(2)}%</p></div>
      </div> : <p className="text-xs text-amber-800">{error}</p>}
    </div>
    <div className="grid items-start gap-5 md:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-gray-900"><SlidersHorizontal size={17} /> 내 대출 조건</h3>
          <button type="button" onClick={() => setForm(toForm(DEFAULT_STRESS_INPUT))}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-gray-600 hover:bg-indigo-100"><RotateCcw size={13} /> 초기화</button>
        </div>
        <NumericField id="stress-income" label="인정 연소득" unit="만원" value={form.income} min={100} max={20000} step={100} onChange={v => change('income', v)} hint="세전 연봉 중 은행이 인정하는 소득. 큰 금액·세부 값은 직접 입력하세요." />
        <NumericField id="stress-principal" label="신청 대출금액" unit="만원" value={form.principal} min={0} max={100000} step={100} onChange={v => change('principal', v)} />
        <NumericField id="stress-rate" label="실제 약정금리" unit="%" value={form.rate} min={0} max={10} step={0.05} onChange={v => change('rate', v)} />
        <NumericField id="stress-years" label="대출 만기" unit="년" value={form.years} min={1} max={30} onChange={v => change('years', v)} hint="거치 없는 원리금균등, 최대 30년 범위의 참고 계산입니다." />
        <div className="space-y-2">
          <label htmlFor="stress-region" className="block text-sm font-semibold text-gray-700">담보주택 지역</label>
          <select id="stress-region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value as FormState['region'] })}
            className="w-full rounded-lg border border-indigo-200 bg-white p-2.5 text-sm">
            <option value="capital">수도권 또는 규제지역</option><option value="regional">지방 비규제지역</option>
          </select>
          <p className="text-xs text-gray-500">서울·경기·인천은 수도권입니다. 지방도 규제지역이면 위 항목을 선택하세요.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="stress-type" className="block text-sm font-semibold text-gray-700">금리 유형</label>
          <select id="stress-type" value={form.rateType} onChange={e => setForm({ ...form, rateType: e.target.value as MortgageRateType })}
            className="w-full rounded-lg border border-indigo-200 bg-white p-2.5 text-sm">
            {Object.entries(RATE_TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <NumericField id="stress-fixed" label="고정기간 / 금리변동주기" unit="년" value={form.fixedYears} min={1} max={Math.max(1, Number(form.years) || 30)}
          onChange={v => change('fixedYears', v)} hint="혼합형·주기형 및 아래 유형 비교에 사용합니다. 변동형·만기까지 고정의 계산에는 영향이 없습니다." />
        <NumericField id="stress-existing" label="기존 대출 연 원리금" unit="만원" value={form.existingAnnual} min={0} max={3000} step={10}
          onChange={v => change('existingAnnual', v)} hint="일반 DSR 산입액. 단순 월 납입액×12와 다를 수 있어 은행 계산서를 우선하세요." />
        <details className="rounded-xl border border-indigo-100 bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-indigo-700">기존 부채 스트레스 추가액·DSR 기준 설정</summary>
          <div className="mt-4 space-y-5">
            <NumericField id="stress-extra" label="기존 부채 연 추가 반영액" unit="만원" value={form.existingStressExtra} min={0} max={1000} step={10}
              onChange={v => change('existingStressExtra', v)} hint="은행이 기존 부채에 추가 산입하는 스트레스 원리금 차액만 입력. 이미 위 금액에 포함했다면 중복 입력하지 마세요. 0원 기본값은 추가 영향 미반영 가정입니다." />
            <NumericField id="stress-threshold" label="DSR 비교 기준" unit="%" value={form.dsrLimit} min={1} max={100}
              onChange={v => change('dsrLimit', v)} hint="규제 대상 은행권 40%, 제2금융권 50%를 일반 비교 기준으로 사용합니다. 임의 변경은 규제 완화를 뜻하지 않습니다." />
          </div>
        </details>
      </div>

      <div className="space-y-4 md:sticky md:top-6">
        {error || !result ? <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error}</p> : <>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-5 text-white sm:p-6" role="status" aria-live="polite" aria-atomic="true">
            <p className="text-sm text-indigo-100">스트레스 DSR만 고려한 예상 한도</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatDsrMoney(result.stressLimit)}</p>
            <p className="mt-3 flex items-center gap-1 text-sm text-indigo-100"><ArrowDown size={15} /> 가산 전보다 {formatDsrMoney(result.limitReduction)} 감소</p>
            <p className="mt-4 border-t border-white/20 pt-3 text-xs leading-relaxed text-indigo-100">LTV·방공제·지역/주택가격별 총액 한도는 미반영. 최종 승인금액이 아닙니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">가산 전 DSR</p><p className="mt-1 text-2xl font-bold text-gray-800">{result.ordinaryDsr.toFixed(2)}%</p></div>
            <div className={`rounded-xl border p-4 ${result.stressDsr > input.dsrLimit ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}><p className="text-xs text-gray-600">스트레스 DSR</p><p className="mt-1 text-2xl font-bold text-gray-900">{result.stressDsr.toFixed(2)}%</p></div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <p className="font-semibold text-gray-900">{result.stressDsr > input.dsrLimit ? `설정 기준 ${input.dsrLimit}% 초과` : `설정 기준 ${input.dsrLimit}% 이내`}</p>
            <p className="mt-2 leading-relaxed text-gray-600">{result.shortfall > 0 ? `신청액 대비 부족액은 약 ${formatDsrMoney(result.shortfall)}입니다. 필요 원금을 낮추거나 기존 부채·인정소득을 재점검하세요.` : '이 계산 조건에서는 DSR 여력이 있습니다. 담보·상품·총액 한도와 은행 심사는 별도로 확인하세요.'}</p>
          </div>
          <dl className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-gray-600">신규 대출 실제 월 납입액</dt><dd className="font-bold text-gray-900">{Math.round(result.actualMonthly).toLocaleString('ko-KR')}원</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-600">심사용 월 원리금</dt><dd className="font-semibold text-gray-700">{Math.round(result.assessmentMonthly).toLocaleString('ko-KR')}원</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-600">약정금리 → 심사금리</dt><dd className="font-semibold text-indigo-700">{input.rate}% → {result.assessmentRate.toFixed(3)}%</dd></div>
            <div className="border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">심사용 원리금은 실제 청구액이 아닙니다. 월 납입액은 입력한 약정금리가 유지된다는 가정입니다.</div>
          </dl>
          <div className="rounded-xl bg-gray-100 p-4 text-xs leading-relaxed text-gray-600">
            가산폭: {result.base}%p × 기본 {result.stageFactor * 100}% × 유형 {Math.round(result.typeFactor * 100)}% = <strong>{result.stressRate.toFixed(3)}%p</strong><br />
            연간 잔여 상환여력: {formatDsrMoney(result.remainingAnnual)}<br />
            2026.7.1~12.31 운영기준 참고값 · 경과규정 자동 판정 제외
          </div>
        </>}
      </div>
    </div>

    {result && <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5" aria-label="금리 유형별 실시간 비교">
      <h3 className="font-bold text-gray-900">내 조건 그대로, 금리 유형만 바꾸면?</h3>
      <p className="mb-4 mt-2 text-xs leading-relaxed text-gray-500">혼합형·주기형은 {input.fixedYears}년 고정/주기, {input.years}년 만기. 모든 상품의 약정금리가 {input.rate}%로 같다는 가정입니다. 실제 상품금리·수수료 차이는 별도로 비교하세요.</p>
      <div className="space-y-4">
        {comparisons.map(row => <div key={row.label} className="space-y-1.5">
          <div className="flex flex-wrap justify-between gap-1 text-sm"><span className="font-medium text-gray-700">{row.label} <span className="text-xs text-gray-500">+{row.stressRate.toFixed(3)}%p</span></span><span className="font-bold text-indigo-700">{formatDsrMoney(row.stressLimit)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-indigo-50" aria-hidden="true"><div className="h-full rounded-full bg-indigo-500 transition-[width] motion-reduce:transition-none" style={{ width: `${Math.max(0, Math.min(100, row.stressLimit / (result.normalLimit || 1) * 100))}%` }} /></div>
        </div>)}
      </div>
    </section>}
    <p className="text-xs leading-relaxed text-gray-500">무료 · 로그인 불필요 · 계산은 브라우저 안에서 처리합니다. 입력 금액을 서버로 제출하거나 저장하지 않습니다.</p>
  </div>
}
