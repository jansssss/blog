import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, BookOpen, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import DisclaimerNotice from '@/components/DisclaimerNotice'

export const metadata: Metadata = {
  title: '5억 주담대 전략 완전 정리 | 연봉 6천·부부합산 1억 실전 가이드 | ohyess',
  description:
    '연봉 6,000만원 단독 vs 부부합산 1억으로 5억 주택담보대출 최적 전략. DSR 계산, 상환방식 선택, 가족 구성, 은퇴 안정성별 맞춤 시뮬레이션으로 가장 이익이 되는 방법을 실전 수치로 정리합니다.',
  alternates: { canonical: '/hub/mortgage-preparation' },
  openGraph: {
    title: '5억 주담대, 내 조건에서 가장 이익이 되는 전략',
    description: '연봉 6천 단독 vs 부부합산 1억 — DSR·총이자·가족 구성·은퇴 전략까지 실전 가이드',
    type: 'article',
    locale: 'ko_KR',
  },
}

export default function MortgagePreparationHubPage() {
  return (
    <div className="container max-w-3xl py-8">

      {/* ===== HERO ===== */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          🏠 주담대 실전 전략 가이드
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight leading-snug">
          5억 주담대, 내 조건에서<br />가장 이익이 되는 방법
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
          연봉·가족 구성·은퇴 계획에 따라 전략이 달라집니다.<br />
          실제 수치로 내 케이스를 확인하세요.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: '연봉 6천 단독', href: '#solo', cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
            { label: '부부합산 1억', href: '#couple', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
            { label: '가족 구성·은퇴 전략', href: '#family', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
          ].map((c) => (
            <a key={c.href} href={c.href}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${c.cls}`}>
              {c.label} <ChevronRight className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* ===== 핵심 규칙 3가지 ===== */}
      <div className="mb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">먼저 알아야 할 핵심 규칙</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '📊', title: 'DSR 40%', desc: '연간 원리금 상환액 ÷ 연 소득이 40% 이하여야 대출이 나옵니다. 이 기준이 가장 큰 장벽입니다.' },
            { icon: '🏘️', title: 'LTV 규제', desc: '투기과열지구 40~50%, 조정대상 60~70%, 비규제 80%까지. 집값 대비 빌릴 수 있는 비율이 다릅니다.' },
            { icon: '📈', title: '고정 vs 변동', desc: '고금리 시기엔 고정금리가 안전합니다. 인하 기대가 크다면 혼합형(3~5년 고정 후 변동)도 고려하세요.' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="text-xl mb-2">{item.icon}</div>
              <p className="text-sm font-bold text-gray-800 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SCENARIO A: 연봉 6,000만원 ===== */}
      <section id="solo" className="mb-12 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden mb-4 border border-amber-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest mb-1">시나리오 A</p>
            <h2 className="text-white text-lg sm:text-xl font-bold leading-snug">연봉 6,000만원 단독 대출</h2>
            <p className="text-amber-100 text-xs mt-1">5억을 받고 싶지만 DSR이 문제입니다</p>
          </div>

          <div className="bg-white p-5">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5">
              <p className="text-xs font-bold text-amber-700 mb-2">📌 결론부터</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                연봉 6,000만원 단독으로는 <strong>5억 주담대가 DSR 초과</strong>입니다.
                4.0% 금리·30년 기준 최대 가능 한도는 약 <strong>4.2억원</strong>이며,
                5억을 받으려면 연봉 약 <strong>7,200만원 이상</strong>이 필요합니다.
              </p>
            </div>

            <p className="text-xs font-bold text-gray-500 mb-2">5억 대출 시 금리별 월 납입 vs DSR (30년 원리금균등)</p>
            <div className="rounded-xl overflow-hidden border border-gray-100 mb-2">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">금리</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">월 납입</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">DSR</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-500">가능 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { rate: '3.5%', payment: '약 225만원', dsr: '45.0%' },
                    { rate: '4.0%', payment: '약 239만원', dsr: '47.8%' },
                    { rate: '4.5%', payment: '약 253만원', dsr: '50.7%' },
                    { rate: '5.0%', payment: '약 268만원', dsr: '53.7%' },
                  ].map((row) => (
                    <tr key={row.rate} className="bg-white">
                      <td className="px-3 py-2.5 font-medium text-gray-700">{row.rate}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">{row.payment}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-red-500">{row.dsr}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-red-500 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3" /> 한도 초과
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mb-5">※ 월 소득 500만원 × DSR 40% = 월 200만원 상환 한도. 모든 금리에서 초과.</p>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-5">
              <p className="text-xs font-bold text-gray-600 mb-2">💡 현실적 한도 역산 (4.0% / 30년 기준)</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <p>• 월 소득 500만원 × DSR 40% = 월 <strong>200만원</strong> 상환 가능</p>
                <p>• 200만원으로 30년 원리금균등 시 빌릴 수 있는 원금: 약 <strong>4억 1,900만원</strong></p>
                <p>• 5억을 받으려면 월 납입이 약 239만원 → 연봉 <strong>약 7,170만원</strong> 이상 필요</p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-700 mb-3">그래도 5억 대출을 받고 싶다면?</p>
            <div className="space-y-3">
              {[
                {
                  num: '전략 1',
                  color: 'text-amber-600',
                  title: '기존 부채를 먼저 정리하세요 — 가장 확실합니다',
                  desc: '자동차 할부 월 40만원을 갚으면 DSR 여유가 생겨 주담대 한도가 약 1억원 증가합니다. 신용대출·카드론·할부 잔액을 모두 정리한 뒤 대출을 실행하세요.',
                  cta: 'DSR 계산기로 부채 영향 확인',
                  href: '/calculator/dsr-dti-ltv',
                },
                {
                  num: '전략 2',
                  color: 'text-amber-600',
                  title: '증빙 소득을 최대한 끌어올리세요',
                  desc: '근로소득 외 부업·임대·배당 수입을 증빙하면 DSR 계산 소득이 늘어납니다. 소득이 6,000만원→7,200만원으로 올라가면 5억 대출이 가능해집니다.',
                  cta: null,
                  href: null,
                },
                {
                  num: '전략 3',
                  color: 'text-amber-600',
                  title: '40년 분할 상환으로 월 납입 낮추기',
                  desc: '기간을 30년→40년으로 늘리면 월 납입이 약 209만원(DSR 41.8%)으로 줄어듭니다. 다른 부채를 일부 정리하면 DSR 40% 통과 가능합니다. 단, 총이자가 크게 늘어나는 단점이 있습니다.',
                  cta: '기간별 총이자 계산기',
                  href: '/calculator/loan-interest',
                },
              ].map((s) => (
                <div key={s.num} className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className={`text-[10px] font-bold mb-1 ${s.color}`}>{s.num}</p>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">{s.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{s.desc}</p>
                  {s.cta && s.href && (
                    <Link href={s.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800">
                      <Calculator className="w-3 h-3" /> {s.cta} <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link href="/calculator/dsr-dti-ltv"
          className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 px-5 py-4 transition-colors">
          <div>
            <p className="text-xs font-bold text-amber-700">내 정확한 한도 계산하기</p>
            <p className="text-[11px] text-amber-600 mt-0.5">소득과 기존 부채를 입력하면 DSR 기준 최대 한도를 역산해드립니다</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
        </Link>
      </section>

      {/* ===== SCENARIO B: 부부합산 1억 ===== */}
      <section id="couple" className="mb-12 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden mb-4 border border-emerald-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">시나리오 B</p>
            <h2 className="text-white text-lg sm:text-xl font-bold leading-snug">부부합산 연봉 1억 대출</h2>
            <p className="text-emerald-100 text-xs mt-1">5억은 충분히 가능합니다 — 전략에 따라 총이자 5,800만원 차이</p>
          </div>

          <div className="bg-white p-5">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-5">
              <p className="text-xs font-bold text-emerald-700 mb-2">📌 결론부터</p>
              <p className="text-sm text-emerald-800 leading-relaxed">
                부부합산 1억이면 DSR이 <strong>28.7%</strong>로 40%보다 크게 낮아 5억 대출이 가능합니다.
                이제 중요한 건 <strong>어떤 상환방식을 선택하느냐</strong>입니다.
                원금균등을 선택하면 30년 동안 총이자를 약 <strong>5,800만원 절약</strong>할 수 있습니다.
              </p>
            </div>

            <p className="text-xs font-bold text-gray-500 mb-2">5억 대출 DSR 현황 (4.0% / 30년 원리금균등)</p>
            <div className="rounded-xl overflow-hidden border border-gray-100 mb-5">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-50">
                  {[
                    { label: '부부합산 월 소득', value: '833만원', hi: false },
                    { label: 'DSR 40% 월 상환 한도', value: '333만원', hi: false },
                    { label: '5억·4.0%·30년 월 납입', value: '239만원', hi: false },
                    { label: '실제 DSR 비율', value: '28.7%', hi: true },
                    { label: '남은 DSR 여유', value: '94만원/월', hi: false },
                    { label: '추가 대출 가능 한도', value: '약 2억원', hi: false },
                  ].map((row) => (
                    <tr key={row.label} className={row.hi ? 'bg-emerald-50' : 'bg-white'}>
                      <td className="px-3 py-2.5 text-gray-600">{row.label}</td>
                      <td className={`px-3 py-2.5 text-right font-bold ${row.hi ? 'text-emerald-600' : 'text-gray-800'}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs font-bold text-gray-500 mb-2">상환방식별 비교 (5억 / 4.0% / 30년)</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">원리금균등</p>
                <p className="text-lg font-extrabold text-gray-800 leading-tight">239만원</p>
                <p className="text-[11px] text-gray-500 mb-3">매월 동일 (30년 내내)</p>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 mb-0.5">30년 총이자</p>
                  <p className="text-sm font-bold text-red-500">약 3억 6천만원</p>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">원금균등 ★</p>
                <p className="text-lg font-extrabold text-emerald-700 leading-tight">306만원</p>
                <p className="text-[11px] text-emerald-600 mb-3">초반 (말기 약 139만원)</p>
                <div className="pt-3 border-t border-emerald-200">
                  <p className="text-[10px] text-emerald-500 mb-0.5">30년 총이자</p>
                  <p className="text-sm font-bold text-emerald-700">약 3억 800만원</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 mb-5">
              <p className="text-xs text-emerald-800 leading-relaxed">
                💡 원금균등은 첫 달 납입이 306만원으로 높지만, 30년 총이자를 약 <strong>5,800만원</strong> 줄일 수 있습니다.
                부부합산 1억이라면 초기 월 납입 여유가 있으므로 원금균등을 적극 고려하세요.
              </p>
            </div>

            <p className="text-xs font-bold text-gray-700 mb-3">케이스별 추천 전략</p>
            <div className="space-y-3">
              {[
                {
                  icon: '⚡',
                  bg: 'bg-emerald-50 border-emerald-200',
                  tc: 'text-emerald-700',
                  title: '은퇴 걱정이 없다면 — 공격적 원금 상환',
                  desc: '국민연금 + 퇴직연금으로 은퇴가 안정적이라면, 원금균등 + 기간 20~25년으로 설정하세요. 월 납입이 높더라도 장기적으로 가장 이익입니다. 연봉 인상분을 연 1~2회 중도상환에 쏟으면 효과가 배가됩니다.',
                  cta: '상환방식 비교 계산기',
                  href: '/calculator/repayment-compare',
                },
                {
                  icon: '⚠️',
                  bg: 'bg-amber-50 border-amber-200',
                  tc: 'text-amber-700',
                  title: '한 명이 출산·육아휴직 예정이라면',
                  desc: '소득이 절반(월 417만원)으로 줄면 월 239만원 납입이 버거울 수 있습니다. 원리금균등 30년으로 설정해 월 납입을 고정하고, 비상금 6~12개월치(1,400~2,900만원)를 미리 확보하세요.',
                  cta: null,
                  href: null,
                },
                {
                  icon: '🔄',
                  bg: 'bg-indigo-50 border-indigo-200',
                  tc: 'text-indigo-700',
                  title: '갈아타기 기회를 놓치지 마세요',
                  desc: '현재 고정금리로 받았더라도 1~3년 후 금리가 하락하면 대환대출로 낮출 수 있습니다. 금리 차이 0.5%p만 줄어도 30년 기준 수천만원 절약 효과가 납니다.',
                  cta: '갈아타기 손익 계산기',
                  href: '/calculator/refinancing',
                },
              ].map((s) => (
                <div key={s.title} className={`rounded-xl border p-4 ${s.bg}`}>
                  <p className={`text-sm font-bold mb-1.5 ${s.tc}`}>{s.icon} {s.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{s.desc}</p>
                  {s.cta && s.href && (
                    <Link href={s.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800">
                      <Calculator className="w-3 h-3" /> {s.cta} <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link href="/calculator/repayment-compare"
          className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-5 py-4 transition-colors">
          <div>
            <p className="text-xs font-bold text-emerald-700">상환방식 직접 비교하기</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">원리금균등 vs 원금균등, 실제 총이자 차이를 숫자로 확인하세요</p>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
        </Link>
      </section>

      {/* ===== SECTION C: 가족 구성 + 은퇴 전략 ===== */}
      <section id="family" className="mb-12 scroll-mt-20">
        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">공통 체크포인트</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            가족 구성과 은퇴 계획에 따라<br />반드시 달라져야 할 것들
          </h2>
        </div>

        {/* 가족 구성별 체크 */}
        <p className="text-xs font-bold text-gray-500 mb-3">가족 구성원별 필수 확인 항목</p>
        <div className="space-y-3 mb-8">
          {[
            {
              icon: '👶',
              label: '신혼 / 자녀 예정',
              checks: [
                '신생아 특례대출(연 1.6~3.3%) 해당 여부를 먼저 확인하세요 — 시중 금리의 절반 이하입니다',
                '출생 후 2년 이내라면 디딤돌대출·신생아 특례를 시중은행과 반드시 비교하세요',
                '향후 출산·육아 비용을 감안해 DSR을 30% 이하로 유지하는 게 안전합니다',
              ],
            },
            {
              icon: '👨‍👩‍👧',
              label: '자녀 있는 가정',
              checks: [
                '교육비는 DSR에 직접 영향을 주지 않지만, 가처분 소득을 줄여 생활비 압박을 높입니다',
                '월 납입액 + 교육비 합산이 월 소득의 50%를 넘으면 비상 상황 시 매우 취약해집니다',
                '자녀 독립 시점(15~20년 후) 여유가 생기는 타이밍에 중도상환 계획을 미리 세워두세요',
              ],
            },
            {
              icon: '💼',
              label: '맞벌이 중 이직 / 프리랜서 전환 예정',
              checks: [
                '프리랜서 전환 시 최근 2년 평균 소득이 심사 기준 — 수입이 낮은 기간이 포함되면 한도가 줄어듭니다',
                '수습기간 중엔 소득 증빙이 어려워 대출 시기를 이직 전으로 조율하는 게 유리합니다',
                '소득이 변동적이라면 원리금균등 30년으로 월 납입을 최소화해 버퍼를 확보하세요',
              ],
            },
            {
              icon: '🏡',
              label: '부모님 동거 / 증여 지원',
              checks: [
                '부모님 증여는 10년간 5천만원(직계존속 기준) 한도 내에서 세금 없이 받을 수 있습니다',
                '부모님이 공동 차주 또는 보증인이 되면 부모님의 DSR도 함께 계산되어 복잡해집니다',
                '증여받은 자금으로 초기 부채를 줄여 DSR 여유를 만들어두는 방법이 가장 깔끔합니다',
              ],
            },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{item.icon}</span>
                <p className="text-sm font-bold text-gray-800">{item.label}</p>
              </div>
              <ul className="space-y-1.5">
                {item.checks.map((c, ci) => (
                  <li key={ci} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 은퇴 안정성별 전략 */}
        <p className="text-xs font-bold text-gray-500 mb-3">은퇴 안정성에 따른 상환 전략</p>
        <div className="space-y-3 mb-6">
          {[
            {
              badge: '안정형',
              badgeCls: 'bg-emerald-100 text-emerald-700',
              borderCls: 'border-emerald-200 bg-emerald-50',
              condition: '국민연금 + 퇴직연금 + 개인연금이 월 생활비를 충분히 커버하는 경우',
              title: '공격적으로 원금을 줄이세요',
              strategies: [
                '원금균등 방식으로 총이자 최소화',
                '대출 기간 20~25년으로 설정해 빠른 원금 감소',
                '연봉 인상분을 연 1~2회 중도상환에 집중 투입',
                '갈아타기 시 금리뿐 아니라 기간도 줄이는 방향으로 협상',
              ],
            },
            {
              badge: '보통형',
              badgeCls: 'bg-indigo-100 text-indigo-700',
              borderCls: 'border-indigo-200 bg-indigo-50',
              condition: '연금은 있지만 월 생활비의 70% 정도만 커버되는 경우',
              title: '균형을 잡으면서 유연하게',
              strategies: [
                '원리금균등 30년으로 월 납입 고정 (현금흐름 안정)',
                '비상금 6개월치(약 1,400만원) 먼저 확보',
                '여유 생길 때마다 연간 1천만원 이상 중도상환',
                '금리 하락 시 갈아타기 기회를 적극 활용',
              ],
            },
            {
              badge: '불안정형',
              badgeCls: 'bg-amber-100 text-amber-700',
              borderCls: 'border-amber-200 bg-amber-50',
              condition: '연금이 불충분하거나 노후 준비가 미흡한 경우',
              title: '현금 여유를 최우선으로',
              strategies: [
                '원리금균등 30년으로 월 납입 최소화',
                '비상금 12개월치(약 2,900만원) 우선 확보',
                'ISA·IRP 등 노후 준비 계좌를 대출과 병행 운용',
                '대출 금리 < 기대수익률이면 상환보다 자산 축적 우선도 전략',
              ],
            },
          ].map((p) => (
            <div key={p.badge} className={`rounded-2xl border p-4 ${p.borderCls}`}>
              <div className="flex items-start gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5 ${p.badgeCls}`}>{p.badge}</span>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-500 mb-1">{p.condition}</p>
                  <p className="text-sm font-bold text-gray-800 mb-2">{p.title}</p>
                  <ul className="space-y-1">
                    {p.strategies.map((s, si) => (
                      <li key={si} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                        <span className="text-gray-400 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 금리 선택 */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-700 mb-2">📌 고정 vs 변동 금리 선택 기준</p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>• <strong>고정금리</strong>: 현재 금리가 역사적 고점 수준이거나 향후 소득 변동이 예상될 때. 월 납입 예측이 최우선인 경우.</p>
            <p>• <strong>변동금리</strong>: 금리 하락이 뚜렷하게 예상되고 단기(3~5년) 내 상환·이사 계획이 있을 때.</p>
            <p>• <strong>혼합형(3~5년 고정 후 변동)</strong>: 가장 무난한 선택. 당장의 안정성과 중기 금리 하락 혜택을 모두 기대.</p>
          </div>
        </div>
      </section>

      {/* ===== 계산기 바로가기 ===== */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">직접 계산해보기</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'DSR·DTI·LTV 계산기', desc: '내 한도 역산', href: '/calculator/dsr-dti-ltv', guide: false },
            { label: '대출 한도 시뮬레이터', desc: 'LTV 기준 가능 금액', href: '/calculator/loan-limit', guide: false },
            { label: '대출 이자 계산기', desc: '월 납입·총이자 확인', href: '/calculator/loan-interest', guide: false },
            { label: '상환방식 비교', desc: '원리금균등 vs 원금균등', href: '/calculator/repayment-compare', guide: false },
            { label: '갈아타기 손익 계산기', desc: '중도상환수수료 포함 절감액', href: '/calculator/refinancing', guide: false },
            { label: '대출 전 체크리스트', desc: '사전심사 전 최종 점검', href: '/guide/loan-checklist', guide: true },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="group flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3.5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
                {item.guide
                  ? <BookOpen className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />
                  : <Calculator className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 관련 가이드 */}
      <div className="mb-8 rounded-2xl bg-gray-50 border border-gray-200 p-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">관련 가이드</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: '주택담보대출 완전 정리', href: '/guide/mortgage-loan' },
            { label: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv' },
            { label: '상환방식 비교 완전 정리', href: '/guide/repayment-types' },
            { label: '중도상환수수료 완전 정리', href: '/guide/early-repayment-fee' },
          ].map((g) => (
            <Link key={g.href} href={g.href}
              className="group flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-700 hover:border-indigo-200 transition-colors">
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
