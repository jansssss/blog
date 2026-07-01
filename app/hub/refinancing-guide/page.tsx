import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: '주담대 갈아타기 완전 정복 — 언제, 어떻게, 얼마나 이득인지 총정리 | ohyess',
  description:
    '주담대 갈아타기 손익 계산 공식, 중도상환수수료와 이자 절감 비교, 손익분기점 월수 계산, 갈아타기 유리한 조건까지. 2025년 현행 기준으로 실전 수치와 함께 정리합니다.',
  keywords: ['주담대 갈아타기', '대출 갈아타기', '갈아타기 손익 계산', '중도상환수수료', '금리 갈아타기'],
  alternates: { canonical: '/hub/refinancing-guide' },
  openGraph: {
    title: '주담대 갈아타기 완전 정복 — 진짜 이득인지 3분 안에 확인',
    description: '중도상환수수료 vs 이자 절감 · 손익분기점 계산 · 갈아타기 유리한 조건 · 실전 시뮬레이션',
    type: 'article',
    locale: 'ko_KR',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: '주담대 갈아타기 완전 정복 — 언제, 어떻게, 얼마나 이득인지 총정리',
      description: '갈아타기 손익 계산, 중도상환수수료, 손익분기점, 갈아타기 유리한 조건',
      url: 'https://www.ohyess.kr/hub/refinancing-guide',
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
          name: '주담대 갈아타기가 유리한 조건은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '일반적으로 ①금리 차이가 0.5%p 이상이고, ②중도상환수수료 면제 기간이 경과했거나 수수료 금액보다 이자 절감액이 크고, ③잔여 대출 기간이 3년 이상 남아 있을 때 갈아타기가 유리합니다. 손익분기점 월수가 24개월 이내라면 갈아탈 가치가 있습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '갈아타기 손익 계산 공식은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '순절감액 = 이자 절감액(기존 대출 잔여 이자 - 신규 대출 이자) - 중도상환수수료입니다. 손익분기점 월수 = 중도상환수수료 ÷ 월 이자 절감액으로 계산합니다. 손익분기점 월수가 잔여 대출 기간보다 짧아야 갈아타기가 이득입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '갈아타기 시 중도상환수수료는 얼마인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '중도상환수수료 = 잔여대출액 × 수수료율 × (잔존기간/약정기간)입니다. 수수료율은 대출 종류와 금융기관에 따라 다르며 보통 0.5~1.5% 수준입니다. 대출 실행 후 3년이 지나면 수수료가 면제되는 경우가 많습니다.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://www.ohyess.kr' },
        { '@type': 'ListItem', position: 2, name: '주담대 갈아타기 완전 정복', item: 'https://www.ohyess.kr/hub/refinancing-guide' },
      ],
    },
  ],
}

export default function RefinancingGuideHubPage() {
  return (
    <div className="container max-w-3xl py-8">
      <JsonLd data={jsonLd} />

      {/* HERO */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          🔄 대출 갈아타기 완전 정복 가이드
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight leading-snug">
          주담대 갈아타기,<br />진짜 이득인지 3분 안에 확인
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
          수수료보다 절감 이자가 크면 이득, 작으면 손해입니다.<br />
          손익분기점을 먼저 계산하고 결정하세요.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: '갈아타기 체크리스트', href: '#checklist', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
            { label: '손익 계산 공식', href: '#formula', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
            { label: '실전 시뮬레이션', href: '#simulation', cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
            { label: '갈아타기 유의사항', href: '#caution', cls: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' },
          ].map((c) => (
            <a key={c.href} href={c.href}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${c.cls}`}>
              {c.label} <ChevronRight className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* 핵심 판단 기준 */}
      <div className="mb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">갈아타기 유불리 판단 기준</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '📉', title: '금리 차이 0.5%p 이상', desc: '금리 차이가 0.5%p 미만이면 제반 비용(인지세, 근저당 설정비 등)을 고려했을 때 이득이 미미합니다.' },
            { icon: '⏰', title: '잔여 기간 3년 이상', desc: '대출 만기가 얼마 남지 않았다면 갈아타기로 절감하는 이자보다 수수료와 부대비용이 클 수 있습니다.' },
            { icon: '🎯', title: '손익분기점 24개월 이내', desc: '중도상환수수료 ÷ 월 이자 절감액이 24개월 이하라면 갈아탈 가치가 있습니다.' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="text-xl mb-2">{item.icon}</div>
              <p className="text-sm font-bold text-gray-800 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 갈아타기 체크리스트 */}
      <section id="checklist" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-indigo-100">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">갈아타기 전 확인</p>
            <h2 className="text-white text-lg font-bold">갈아타기 체크리스트 — 5가지 먼저 확인</h2>
          </div>
          <div className="bg-white p-5 space-y-3">
            {[
              { ok: true, title: '중도상환수수료 면제 기간 경과 여부', desc: '보통 대출 실행 후 3년이 지나면 수수료 면제. 면제 전이라면 수수료율을 먼저 확인하세요.' },
              { ok: true, title: '신규 대출 금리와 현재 금리 차이 계산', desc: '단순 금리 비교가 아니라 총이자(잔여기간 동안)를 비교해야 합니다.' },
              { ok: true, title: '신규 대출 상품의 DSR 충족 여부 확인', desc: '갈아타려는 은행에서 새로 심사를 받아야 합니다. 소득·신용점수가 달라졌다면 한도가 다를 수 있습니다.' },
              { ok: false, title: '비용 없이 갈아탈 수 있다는 착각', desc: '인지세, 근저당 설정·말소 비용, 취급 수수료 등 부대비용이 발생합니다. 총 비용으로 계산하세요.' },
              { ok: false, title: '단순히 금리가 낮으면 무조건 이득이라는 착각', desc: '금리가 낮더라도 남은 기간이 짧거나 수수료가 크면 오히려 손해일 수 있습니다.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50">
                <span className={`text-base shrink-0 mt-0.5 ${item.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                  {item.ok ? '✓' : '✗'}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 손익 계산 공식 */}
      <section id="formula" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-emerald-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">핵심 공식</p>
            <h2 className="text-white text-lg font-bold">갈아타기 손익 계산 — 이 공식 하나면 됩니다</h2>
          </div>
          <div className="bg-white p-5 space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
              <p className="text-xs text-emerald-600 mb-2 font-semibold">순절감액 계산식</p>
              <p className="text-sm font-extrabold text-emerald-900 leading-relaxed">
                순절감액 = 이자 절감액 — 중도상환수수료 — 부대비용
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2 border border-emerald-100">
                  <p className="font-bold text-emerald-700">이자 절감액</p>
                  <p className="text-gray-500 mt-1">기존 총이자 — 신규 총이자</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-100">
                  <p className="font-bold text-amber-600">중도상환수수료</p>
                  <p className="text-gray-500 mt-1">잔액 × 수수료율 × (잔존/약정)</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-100">
                  <p className="font-bold text-gray-600">부대비용</p>
                  <p className="text-gray-500 mt-1">인지세 + 근저당 비용</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-700 mb-2">📌 손익분기점 계산</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                손익분기점(월) = (중도상환수수료 + 부대비용) ÷ 월 이자 절감액<br />
                <span className="text-gray-400">이 숫자가 잔여 대출 기간(개월)보다 작아야 갈아타기가 이득입니다.</span>
              </p>
            </div>
            <Link href="/calculator/refinancing"
              className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors group">
              <div>
                <p className="text-sm font-bold text-emerald-800">갈아타기 손익 계산기로 바로 계산하기</p>
                <p className="text-xs text-emerald-600 mt-0.5">기존·신규 금리 입력 → 순절감액과 손익분기점 즉시 산출</p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* 실전 시뮬레이션 */}
      <section id="simulation" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-amber-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest mb-1">실전 수치</p>
            <h2 className="text-white text-lg font-bold">케이스별 갈아타기 시뮬레이션</h2>
          </div>
          <div className="bg-white p-5 space-y-4">
            {[
              {
                title: '케이스 A — 금리 1%p 차이, 잔여 기간 10년',
                detail: '잔액 3억, 기존 5.5% → 신규 4.5%, 잔여 10년, 수수료 1%',
                items: [
                  { label: '이자 절감액', value: '약 1,820만원', color: 'text-emerald-700' },
                  { label: '중도상환수수료', value: '300만원 (잔액 × 1%)', color: 'text-amber-600' },
                  { label: '순절감액', value: '약 1,520만원 이익', color: 'text-emerald-700 font-extrabold' },
                  { label: '손익분기점', value: '약 20개월', color: 'text-gray-600' },
                ],
                verdict: '✓ 갈아타기 유리',
                verdictColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
              },
              {
                title: '케이스 B — 금리 0.3%p 차이, 잔여 기간 2년',
                detail: '잔액 1억, 기존 4.5% → 신규 4.2%, 잔여 2년, 수수료 0.5%',
                items: [
                  { label: '이자 절감액', value: '약 28만원', color: 'text-emerald-700' },
                  { label: '중도상환수수료', value: '50만원 (잔액 × 0.5%)', color: 'text-amber-600' },
                  { label: '순절감액', value: '약 22만원 손해', color: 'text-red-500 font-extrabold' },
                  { label: '손익분기점', value: '약 29개월 (잔여 24개월 초과)', color: 'text-red-500' },
                ],
                verdict: '✗ 갈아타기 불리',
                verdictColor: 'bg-red-50 border-red-200 text-red-600',
              },
            ].map((sim) => (
              <div key={sim.title} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <p className="text-sm font-bold text-gray-800">{sim.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sim.detail}</p>
                </div>
                <div className="p-4 space-y-2">
                  {sim.items.map((item) => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={item.color}>{item.value}</span>
                    </div>
                  ))}
                  <div className={`mt-3 rounded-lg border px-3 py-2 text-xs font-bold text-center ${sim.verdictColor}`}>
                    {sim.verdict}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 갈아타기 유의사항 */}
      <section id="caution" className="mb-10 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-rose-200">
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest mb-1">주의사항</p>
            <h2 className="text-white text-lg font-bold">갈아타기 전 꼭 알아야 할 함정</h2>
          </div>
          <div className="bg-white p-5">
            <div className="space-y-3">
              {[
                { icon: '⚠️', title: '금리만 보고 갈아타면 손해', desc: '낮은 금리에도 잔여 기간이 짧거나 수수료가 크면 손해입니다. 반드시 손익 계산 후 결정하세요.' },
                { icon: '⚠️', title: '변동금리로 갈아타면 금리 리스크 발생', desc: '금리가 다시 오르면 월 납입액이 늘어납니다. 갈아타는 시점의 금리 방향성을 함께 고려하세요.' },
                { icon: '⚠️', title: '새 대출 심사가 부결될 수 있다', desc: '소득 변화, 신용점수 하락, DSR 초과 등으로 새 대출이 거절될 수 있습니다. 사전 한도 조회로 확인하세요.' },
                { icon: '💡', title: '갈아타기 없이도 금리 인하를 요구할 수 있다', desc: '금리인하요구권을 활용하면 기존 대출 은행에서도 금리를 낮출 수 있습니다. 갈아타기 전에 먼저 시도해보세요.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-gray-50 items-start">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
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
            { href: '/calculator/refinancing', emoji: '🔄', title: '갈아타기 손익 계산기', desc: '기존·신규 금리 입력 → 순절감액과 손익분기점 즉시 산출', type: 'calc' },
            { href: '/calculator/prepayment-fee', emoji: '💰', title: '중도상환수수료 계산기', desc: '잔액·수수료율·잔여기간으로 정확한 수수료 계산', type: 'calc' },
            { href: '/calculator/loan-interest', emoji: '📊', title: '대출 이자 계산기', desc: '갈아탄 후 신규 금리로 월 납입액과 총이자 확인', type: 'calc' },
            { href: '/guide/early-repayment-fee', emoji: '💡', title: '중도상환수수료 완전 정복', desc: '수수료 공식, 면제 조건, 절약 전략 상세 가이드', type: 'guide' },
            { href: '/guide/rate-strategy', emoji: '📈', title: '고정 vs 변동금리 전략', desc: '갈아탈 때 어떤 금리 유형으로 갈아탈지 기준', type: 'guide' },
            { href: '/guide/loan-interest', emoji: '📚', title: '대출 이자 완전 정복', desc: '금리별 이자 차이와 상환 방식별 총비용 비교', type: 'guide' },
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

      <DisclaimerNotice basis="이자 절감액 - 중도상환수수료 = 순절감액 기준 · 잔액 × 수수료율 × (잔존기간/약정기간) 공식" />
    </div>
  )
}
