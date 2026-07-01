import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'DSR 40% 완전 정복 — 내 대출 한도 계산법과 규제 전략 총정리 | ohyess',
  description:
    'DSR 40% 규제 구조, 스트레스 DSR 3단계, 내 DSR 직접 계산하는 방법, DSR 낮추는 전략 4가지까지. 2025년 현행 기준으로 실전 수치와 함께 정리합니다.',
  keywords: ['DSR 계산기', 'DSR 40%', '대출 한도 계산', '스트레스 DSR', '내 DSR 계산'],
  alternates: { canonical: '/hub/dsr-guide' },
  openGraph: {
    title: 'DSR 40% 완전 정복 — 내 대출 한도 계산하는 법',
    description: '스트레스 DSR 3단계 · 은행권 DSR 40% · 한도 역산 공식 · 규제 통과 전략',
    type: 'article',
    locale: 'ko_KR',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'DSR 40% 완전 정복 — 내 대출 한도 계산법과 규제 전략 총정리',
      description: 'DSR 40% 규제 구조, 스트레스 DSR 3단계, 내 DSR 직접 계산하는 방법, DSR 낮추는 전략 4가지',
      url: 'https://www.ohyess.kr/hub/dsr-guide',
      inLanguage: 'ko',
      publisher: { '@type': 'Organization', name: 'ohyess', url: 'https://www.ohyess.kr' },
      datePublished: '2026-07-01',
      dateModified: '2026-07-01',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'DSR 40%란 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DSR(총부채원리금상환비율)은 모든 대출의 연간 원리금 상환액을 연 소득으로 나눈 비율입니다. 은행권 기준 40% 이하여야 대출이 가능합니다. 예를 들어 연 소득 5,000만원이면 연간 원리금 합계가 2,000만원(월 약 167만원)을 넘으면 안 됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: '스트레스 DSR이란 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '스트레스 DSR은 변동금리 대출에 금리 상승 시나리오를 가산해 계산하는 방식입니다. 2025년 7월부터 3단계가 적용되어 은행권 변동금리 대출에는 최대 +1.5%p를 더한 금리로 DSR을 계산합니다.',
          },
        },
        {
          '@type': 'Question',
          name: 'DSR을 낮추는 방법은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '①기존 소액 대출 완전 상환, ②대출 만기 연장으로 월 원리금 감소, ③소득 증빙 강화(건강보험료·종합소득세 신고), ④부부 합산 DSR 적용이 있습니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: 'DSR 완전 정복 가이드', item: 'https://www.ohyess.kr/hub/dsr-guide' },
      ],
    },
  ],
}

export default function DsrGuideHubPage() {
  return (
    <div className="container max-w-3xl py-8">
      <JsonLd data={jsonLd} />

      {/* HERO */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          📋 DSR 규제 완전 정복 가이드
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight leading-snug">
          DSR 40%, 내 대출 한도가<br />막히는 진짜 이유
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
          규제 구조를 이해하면 한도를 예측하고, 통과 전략도 세울 수 있습니다.<br />
          실전 수치로 내 케이스를 확인하세요.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: 'DSR 기본 개념', href: '#concept', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
            { label: '스트레스 DSR', href: '#stress', cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
            { label: '한도 역산 방법', href: '#limit', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
            { label: 'DSR 낮추는 전략', href: '#strategy', cls: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' },
          ].map((c) => (
            <a key={c.href} href={c.href}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${c.cls}`}>
              {c.label} <ChevronRight className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* 핵심 숫자 3가지 */}
      <div className="mb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">먼저 알아야 할 핵심 숫자</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🏦', title: '은행권 DSR 40%', desc: '시중은행·지방은행·인터넷은행. 모든 대출 원리금 합계가 연 소득의 40% 이하여야 대출 가능.' },
            { icon: '🏢', title: '2금융권 DSR 50%', desc: '저축은행·카드사·캐피털·보험사. 한도가 10%p 더 완화되지만 금리가 높습니다.' },
            { icon: '⚡', title: '스트레스 DSR 3단계', desc: '2025년 7월부터 변동금리에 최대 +1.5%p 가산 계산. 한도가 더 줄어듭니다.' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="text-xl mb-2">{item.icon}</div>
              <p className="text-sm font-bold text-gray-800 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DSR 기본 개념 */}
      <section id="concept" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-indigo-100">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">개념 정리</p>
            <h2 className="text-white text-lg font-bold">DSR vs DTI vs LTV — 세 가지 규제 한눈에 보기</h2>
          </div>
          <div className="bg-white p-5 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-bold text-gray-600 border border-gray-100">구분</th>
                    <th className="p-3 text-left font-bold text-gray-600 border border-gray-100">계산식</th>
                    <th className="p-3 text-left font-bold text-gray-600 border border-gray-100">기준</th>
                    <th className="p-3 text-left font-bold text-gray-600 border border-gray-100">영향</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'DSR', formula: '(모든 대출 원리금 합계) ÷ 연 소득', limit: '은행 40% / 2금융 50%', impact: '대출 가능 금액 결정' },
                    { name: 'DTI', formula: '(신규 원리금 + 기존 이자) ÷ 연 소득', limit: '투기과열 40%, 기타 60%', impact: '일부 지역·상품만 적용' },
                    { name: 'LTV', formula: '대출금액 ÷ 담보 가치', limit: '지역별 40~80%', impact: '담보 대비 한도 결정' },
                  ].map((row) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-indigo-700 border border-gray-100">{row.name}</td>
                      <td className="p-3 text-gray-600 border border-gray-100">{row.formula}</td>
                      <td className="p-3 text-gray-600 border border-gray-100">{row.limit}</td>
                      <td className="p-3 text-gray-600 border border-gray-100">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
              <p className="text-xs font-bold text-indigo-700 mb-2">💡 실전 포인트</p>
              <p className="text-xs text-indigo-800 leading-relaxed">
                LTV는 담보 여력, DSR은 소득 여력을 봅니다. 집값이 충분해도 소득이 부족하면 DSR에서 막히고,
                소득이 충분해도 집값이 낮으면 LTV에서 막힙니다. <strong>보통 DSR이 더 자주 병목</strong>이 됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 스트레스 DSR */}
      <section id="stress" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-amber-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest mb-1">2025년 7월~ 적용</p>
            <h2 className="text-white text-lg font-bold">스트레스 DSR 3단계 — 변동금리 한도가 더 줄었다</h2>
          </div>
          <div className="bg-white p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { step: '1단계', period: '2024.2~', rate: '+0.38%p', cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { step: '2단계', period: '2024.9~', rate: '+0.75%p', cls: 'bg-orange-50 border-orange-200 text-orange-700' },
                { step: '3단계', period: '2025.7~', rate: '+1.5%p', cls: 'bg-red-50 border-red-200 text-red-700' },
              ].map((s) => (
                <div key={s.step} className={`rounded-xl border p-4 ${s.cls}`}>
                  <p className="text-[10px] font-bold mb-1">{s.step}</p>
                  <p className="text-xs text-gray-500 mb-2">{s.period}</p>
                  <p className="text-lg font-extrabold">{s.rate}</p>
                  <p className="text-[10px] mt-1">가산 적용</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-bold text-amber-700 mb-2">📌 실제 영향 예시</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                변동금리 3.5% 대출, 스트레스 DSR 3단계 적용 시 <strong>3.5% + 1.5% = 5.0%</strong>로 DSR을 계산합니다.
                실제 납부 금리보다 높은 금리로 한도를 계산하므로 대출 가능 금액이 줄어듭니다.
                <strong>고정금리는 스트레스 DSR 미적용</strong> — 같은 소득으로 더 높은 한도가 나올 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 한도 역산 */}
      <section id="limit" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-emerald-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">직접 계산</p>
            <h2 className="text-white text-lg font-bold">내 DSR 한도 역산하는 법</h2>
          </div>
          <div className="bg-white p-5 space-y-4">
            <div className="space-y-3">
              {[
                { step: '1', title: '연 소득 확인', desc: '근로소득자: 근로소득원천징수영수증 기준. 사업자: 최근 2년 평균 종합소득세 신고액.' },
                { step: '2', title: '기존 대출 원리금 합산', desc: '신용대출, 자동차 할부, 학자금대출 등 모든 대출의 연간 원리금 상환액을 더합니다.' },
                { step: '3', title: '잔여 한도 계산', desc: '연 소득 × 40% — 기존 원리금 합계 = 신규 대출에 쓸 수 있는 연간 원리금 한도' },
                { step: '4', title: '대출 금액 역산', desc: '잔여 원리금 한도를 월로 나눈 뒤, 원리금균등 PMT 공식으로 최대 대출금액을 계산합니다.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-extrabold flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/calculator/dsr-dti-ltv"
              className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors group">
              <div>
                <p className="text-sm font-bold text-emerald-800">DSR·대출한도 계산기로 바로 계산하기</p>
                <p className="text-xs text-emerald-600 mt-0.5">소득과 기존 대출 입력 → DSR 비율과 최대 한도 즉시 산출</p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* DSR 낮추는 전략 */}
      <section id="strategy" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-rose-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest mb-1">실전 전략</p>
            <h2 className="text-white text-lg font-bold">DSR에 막혔을 때 — 4가지 해결 전략</h2>
          </div>
          <div className="bg-white p-5">
            <div className="space-y-4">
              {[
                {
                  rank: '① 추천',
                  title: '소액 대출부터 완전 상환',
                  badge: '즉각 효과',
                  badgeColor: 'bg-emerald-100 text-emerald-700',
                  desc: '카드론, 신용대출, 자동차 할부 등 잔액이 적은 대출을 먼저 다 갚으세요. 특히 신용대출은 상환기간이 짧아 같은 금액 대비 DSR 기여가 커서 먼저 상환할수록 한도가 많이 늘어납니다.',
                },
                {
                  rank: '② 추천',
                  title: '대출 만기 연장 협의',
                  badge: '한도 증가',
                  badgeColor: 'bg-blue-100 text-blue-700',
                  desc: '기존 대출의 만기를 늘리면 월 원리금이 줄어 DSR이 낮아집니다. 단, 총이자는 더 많이 내게 됩니다. 임시방편으로 활용한 뒤 빠르게 상환하는 전략이 유효합니다.',
                },
                {
                  rank: '③ 상황별',
                  title: '소득 증빙 강화',
                  badge: '소득 인정 확대',
                  badgeColor: 'bg-indigo-100 text-indigo-700',
                  desc: '프리랜서·사업자는 건강보험료 부과 소득 또는 종합소득세 신고 소득 2년 평균을 활용합니다. 임대소득 등 부수입도 증빙하면 인정 소득이 늘어납니다.',
                },
                {
                  rank: '④ 부부 활용',
                  title: '부부 합산 DSR 적용',
                  badge: '소득 합산',
                  badgeColor: 'bg-violet-100 text-violet-700',
                  desc: '배우자와 공동 명의로 신청하면 두 사람의 소득을 합산해 DSR을 계산합니다. 단, 배우자의 기존 부채도 함께 합산되므로 사전에 부부 합산 시뮬레이션이 필요합니다.',
                },
              ].map((item) => (
                <div key={item.rank} className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400">{item.rank}</span>
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 관련 계산기 & 가이드 */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">이어서 확인하세요</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/calculator/dsr-dti-ltv', emoji: '📋', title: 'DSR·DTI·LTV 계산기', desc: '소득과 기존 부채 → 내 DSR 비율과 대출 한도 즉시 계산', type: 'calc' },
            { href: '/calculator/loan-limit', emoji: '💰', title: '대출 한도 계산기', desc: 'DSR 40% 역산 — 내가 받을 수 있는 최대 대출 금액', type: 'calc' },
            { href: '/guide/dsr-dti-ltv', emoji: '📚', title: 'DSR·DTI·LTV 완전 정복', desc: '계산 구조부터 2025년 스트레스 DSR까지 상세 가이드', type: 'guide' },
            { href: '/guide/ltv-ok-dsr-blocked', emoji: '🚧', title: 'LTV는 OK인데 DSR에 막힌다면', desc: '두 규제를 동시에 충족하는 실전 전략', type: 'guide' },
            { href: '/guide/mortgage-salary-5000', emoji: '🏠', title: '연봉 5000만원 주담대 한도', desc: '소득별 DSR 기준 실제 대출 가능 금액 시뮬레이션', type: 'guide' },
            { href: '/guide/car-loan-dsr-impact', emoji: '🚗', title: '자동차 대출과 DSR 영향', desc: '카론이 주담대 한도에 미치는 실제 영향 수치', type: 'guide' },
          ].map(({ href, emoji, title, desc, type }) => (
            <Link key={href} href={href}
              className="group flex items-start gap-3 p-4 bg-white hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl shadow-sm transition-all">
              <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${type === 'calc' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {type === 'calc' ? '계산기' : '가이드'}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </div>

      <DisclaimerNotice basis="스트레스 DSR 3단계 적용(2025년 7월~) · 금융위원회 고시 기준 · 은행권 DSR 40%, 2금융권 50%" />
    </div>
  )
}
