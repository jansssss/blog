import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, BookOpen, ChevronRight } from 'lucide-react'
import DisclaimerNotice from '@/components/DisclaimerNotice'

export const metadata: Metadata = {
  title: '주택담보대출 준비 순서 가이드 | 한도·월납입액·DSR 한 번에 | ohyess',
  description:
    '주담대 받기 전 DSR 한도 확인부터 월 납입액 계산, 기존 부채 영향, 사전심사 체크리스트까지 7단계 순서로 완전 정리합니다.',
  alternates: { canonical: '/hub/mortgage-preparation' },
  openGraph: {
    title: '주택담보대출 준비 순서 가이드',
    description: 'DSR 한도·LTV·월납입액·부채 영향·갈아타기·사전심사까지 7단계 순서로 정리',
    type: 'website',
    locale: 'ko_KR',
  },
}

type Accent = 'indigo' | 'amber' | 'emerald' | 'blue'

const ACCENT: Record<Accent, { badge: string; tag: string; tip: string; btn: string; line: string }> = {
  indigo: {
    badge: 'bg-indigo-600 text-white',
    tag: 'bg-indigo-50 text-indigo-700',
    tip: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    line: 'bg-indigo-200',
  },
  amber: {
    badge: 'bg-amber-500 text-white',
    tag: 'bg-amber-50 text-amber-700',
    tip: 'bg-amber-50 border-amber-200 text-amber-800',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white',
    line: 'bg-amber-200',
  },
  emerald: {
    badge: 'bg-emerald-600 text-white',
    tag: 'bg-emerald-50 text-emerald-700',
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    line: 'bg-emerald-200',
  },
  blue: {
    badge: 'bg-blue-600 text-white',
    tag: 'bg-blue-50 text-blue-700',
    tip: 'bg-blue-50 border-blue-200 text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    line: 'bg-blue-200',
  },
}

const STEPS: {
  num: number
  accent: Accent
  tag: string
  title: string
  desc: string
  tip: string
  cta: string
  href: string
  isGuide?: boolean
}[] = [
  {
    num: 1,
    accent: 'indigo',
    tag: '계산기',
    title: 'DSR 기준 대출 한도 확인',
    desc: '연 소득과 기존 대출 월 납입액을 입력하면 DSR 40% 기준 최대 추가 대출 가능 금액을 역산합니다.',
    tip: 'DSR이 40%를 초과하면 은행에서 대출이 막힙니다. 가장 먼저 내 DSR 여유분을 파악하세요.',
    cta: 'DSR·DTI·LTV 계산기',
    href: '/calculator/dsr-dti-ltv',
  },
  {
    num: 2,
    accent: 'indigo',
    tag: '계산기',
    title: 'LTV·집값 기준 가능 금액 확인',
    desc: '매입 주택 가격 대비 LTV 한도(투기과열지구 40~50% / 조정대상 60~70% / 비규제 80%)로 실제 한도를 확인합니다.',
    tip: 'DSR 한도와 LTV 한도 중 더 낮은 쪽이 실제 한도입니다. 둘 다 확인해야 합니다.',
    cta: '대출 한도 시뮬레이터',
    href: '/calculator/loan-limit',
  },
  {
    num: 3,
    accent: 'indigo',
    tag: '계산기',
    title: '월 납입액 미리 계산',
    desc: '대출 금액·금리·기간을 입력해 원리금균등·원금균등 방식별 월 납입액과 총이자를 미리 확인합니다.',
    tip: '월 납입액이 월 소득의 30~35%를 초과하면 생활비 압박이 커집니다. 여유 있는 기간 설정을 권장합니다.',
    cta: '대출 이자 계산기',
    href: '/calculator/loan-interest',
  },
  {
    num: 4,
    accent: 'amber',
    tag: '확인 필수',
    title: '신용대출·자동차 할부 영향 확인',
    desc: '기존 신용대출, 자동차 할부, 카드론이 주담대 한도를 얼마나 줄이는지 DSR 계산기로 정확히 시뮬레이션합니다.',
    tip: '자동차 할부 월 50만원이면 주담대 대출 가능액이 약 1억원 줄어들 수 있습니다. 소액 부채도 반드시 입력하세요.',
    cta: 'DSR 계산기에서 기존 부채 입력',
    href: '/calculator/dsr-dti-ltv',
  },
  {
    num: 5,
    accent: 'indigo',
    tag: '계산기',
    title: '상환방식 비교',
    desc: '원리금균등과 원금균등 방식의 총이자·월납입액 차이를 실제 금액으로 비교해 내 현금흐름에 맞는 방식을 선택합니다.',
    tip: '원금균등은 초기 납입액이 높지만 총이자가 적습니다. 초기 여유 자금이 있다면 원금균등이 유리합니다.',
    cta: '상환방식 비교 계산기',
    href: '/calculator/repayment-compare',
  },
  {
    num: 6,
    accent: 'emerald',
    tag: '계산기',
    title: '중도상환·갈아타기 판단',
    desc: '기존 대출이 있다면 지금 갈아타는 게 유리한지, 중도상환수수료 포함 실제 절감액을 계산합니다.',
    tip: '금리 차이가 1%p 이상이어도 수수료와 잔여 기간에 따라 손익이 달라집니다. 계산 후 결정하세요.',
    cta: '갈아타기 손익 계산기',
    href: '/calculator/refinancing',
  },
  {
    num: 7,
    accent: 'blue',
    tag: '가이드',
    title: '은행 사전심사 전 체크리스트',
    desc: '사전심사 신청 전 놓치면 후회하는 10가지 항목 — 소득 증빙, 등기부등본, 재직 확인서, 신용 조회 순서 등을 최종 점검합니다.',
    tip: '사전심사는 신용 조회 기록이 남습니다. 한 곳에서 한도를 확인한 뒤 여러 은행을 동시에 비교하는 게 유리합니다.',
    cta: '대출 전 체크리스트 보기',
    href: '/guide/loan-checklist',
    isGuide: true,
  },
]

export default function MortgagePreparationHubPage() {
  return (
    <div className="container max-w-3xl py-8">

      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          🏠 주담대 준비 가이드
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight leading-snug">
          주택담보대출 받기 전<br className="sm:hidden" />{' '}
          한도·월 납입액·DSR 한 번에 확인하기
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          대출 신청 전 꼭 거쳐야 할 7단계를 순서대로 정리했습니다.
          각 단계에서 직접 계산하고 결과를 확인하세요.
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Vertical connector line (desktop) */}
        <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gray-100 hidden sm:block" />

        <div className="space-y-4">
          {STEPS.map((s, i) => {
            const a = ACCENT[s.accent]
            const isLast = i === STEPS.length - 1
            return (
              <div key={s.num} className="relative">
                {/* Connecting dot line between cards (mobile) */}
                {!isLast && (
                  <div className={`absolute left-5 top-[52px] w-0.5 h-4 ${a.line} sm:hidden`} />
                )}

                <div className="relative z-10 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Number badge */}
                    <div className={`w-10 h-10 rounded-full ${a.badge} flex items-center justify-center text-sm font-bold shrink-0 mt-0.5`}>
                      {s.num}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.tag}`}>
                          {s.tag}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">{s.title}</h2>
                      </div>

                      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{s.desc}</p>

                      {/* Tip */}
                      <div className={`rounded-lg border px-3 py-2 mb-4 text-xs leading-relaxed ${a.tip}`}>
                        💡 {s.tip}
                      </div>

                      {/* CTA button */}
                      <Link
                        href={s.href}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${a.btn}`}
                      >
                        {s.isGuide ? (
                          <BookOpen className="w-3.5 h-3.5" />
                        ) : (
                          <Calculator className="w-3.5 h-3.5" />
                        )}
                        {s.cta}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Related guides */}
      <div className="mt-10 rounded-2xl bg-gray-50 border border-gray-200 p-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">관련 가이드</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: '주택담보대출 완전 정리', href: '/guide/mortgage-loan' },
            { label: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv' },
            { label: '상환방식 비교 완전 정리', href: '/guide/repayment-types' },
            { label: '중도상환수수료 완전 정리', href: '/guide/early-repayment-fee' },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
            >
              {g.label}
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <DisclaimerNotice />
    </div>
  )
}
