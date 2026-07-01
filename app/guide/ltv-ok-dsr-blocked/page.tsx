import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import LtvDsrCalcWidget from './LtvDsrCalcWidget'

export const metadata: Metadata = {
  title: 'LTV는 남는데 DSR에서 막히는 이유 — 스트레스 DSR까지 완전 해설 | ohyess',
  description:
    '"LTV 70%면 3.5억 빌릴 수 있는 거 아닌가요?"라는 의문에 답합니다. LTV와 DSR이 각각 다른 기준을 쓰는 이유, 스트레스 DSR 적용 구조, 은행마다 한도가 달라지는 이유를 설명합니다.',
  openGraph: {
    title: 'LTV는 남는데 DSR에서 막히는 이유',
    description: 'LTV 70%가 통과돼도 은행에서 한도가 적게 나오는 구조 완전 해설',
    type: 'article',
  },
  alternates: { canonical: '/guide/ltv-ok-dsr-blocked' },
}

const tocItems = [
  { id: 'intro', label: '"LTV 70%면 3.5억 아닌가요?" — 그 혼란의 이유' },
  { id: 'calc', label: '내 조건에서 LTV vs DSR 직접 비교' },
  { id: 'two-rules', label: 'LTV와 DSR이 보는 것이 완전히 다르다' },
  { id: 'stress-dsr', label: '스트레스 DSR — 실제보다 더 엄격한 계산이 적용된다' },
  { id: 'bank-diff', label: '같은 조건인데 은행마다 한도가 다른 이유' },
  { id: 'what-to-do', label: '한도를 높이려면 무엇을 해야 하나' },
]

const ctas = [
  { label: 'DSR·DTI·LTV 계산기', href: '/calculator/dsr-dti-ltv', description: '내 소득·기존 대출로 DSR 한도와 주담대 한도 계산' },
  { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '월 납입액과 총이자 확인' },
]

const relatedGuides = [
  { title: 'DSR·DTI·LTV 뜻과 차이 완전 정리', href: '/guide/dsr-dti-ltv', description: 'DTI란 무엇인지, DSR과 DTI 차이, LTV 뜻까지 완전 정리' },
  { title: '연봉 5,000만원 신용대출 있으면 주담대 한도는?', href: '/guide/mortgage-salary-5000', description: '기존 부채가 한도를 얼마나 줄이는지 구체적 계산' },
  { title: '자동차 할부가 주담대 한도를 줄이는 이유', href: '/guide/car-loan-dsr-impact', description: '차 할부 하나가 살 수 있는 집 가격을 1억 낮추는 구조' },
  { title: '주담대 금리 0.5% 차이, 총이자 얼마나 다를까', href: '/guide/rate-0p5-difference', description: '한도 확보 후 금리 협상이 중요한 이유' },
]

const faqs = [
  {
    question: 'LTV와 DSR을 둘 다 충족해야 하나요?',
    answer: '네, 둘 다 충족해야 합니다. LTV 기준 한도와 DSR 기준 한도 중 더 낮은 금액이 실제 대출 한도가 됩니다. LTV가 3.5억을 허용해도 DSR 기준으로 1.8억이면 1.8억만 빌릴 수 있습니다.',
  },
  {
    question: 'DTI와 DSR은 어떻게 다른가요?',
    answer: 'DTI는 신규 주담대 원리금과 기타 부채 이자만 합산하고, DSR은 모든 대출의 원금+이자를 합산합니다. DSR이 더 엄격한 기준으로, 현재 1억 원 이상 대출에는 DSR이 적용됩니다. DTI는 일부 지역 주담대에 병행 적용됩니다.',
  },
  {
    question: '스트레스 DSR이란 무엇인가요?',
    answer: '실제 대출 금리에 가산율(스트레스 금리)을 더해 DSR을 계산하는 방식입니다. 2024년부터 단계적으로 적용되었으며, 변동금리 대출일수록 더 높은 가산율이 붙습니다. 같은 대출이라도 스트레스 DSR 적용 시 한도가 줄어들 수 있습니다.',
  },
  {
    question: '은행마다 한도가 다르게 나오는 이유가 뭔가요?',
    answer: '소득 인정 방식(신고소득·인정소득 선택 기준), 기존 부채 잔여기간 처리 방식, 우대금리 적용 여부, 스트레스 DSR 가산율 적용 방식이 은행마다 다르기 때문입니다. 최소 3곳에 사전심사를 넣어 비교하는 것이 중요합니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-20">
      {children}
    </h2>
  )
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: ReactNode }) {
  return <p className="text-gray-700 leading-relaxed mb-4 text-[15px]">{children}</p>
}
function Callout({ color = 'blue', children }: { color?: 'blue' | 'amber' | 'emerald' | 'red'; children: ReactNode }) {
  const s = {
    blue:    'bg-blue-50 border-blue-200 text-blue-900',
    amber:   'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    red:     'bg-red-50 border-red-200 text-red-900',
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed mb-4 ${s[color]}`}>{children}</div>
}
function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
}

export default function LtvOkDsrBlockedPage() {
  return (
    <GuideLayout
      pageUrl="/guide/ltv-ok-dsr-blocked"
      title="LTV는 남는데 DSR에서 막히는 이유"
      description="'LTV 70%면 3.5억은 빌릴 수 있다고 했는데 왜 은행에서 1.8억이 한도라고 하나요?' 이 질문의 답, 스트레스 DSR 적용 구조, 은행마다 한도가 달라지는 이유를 완전히 설명합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 6월"
    >
      <H2 id="intro">"LTV 70%면 3.5억 아닌가요?" — 그 혼란의 이유</H2>
      <P>
        5억짜리 집을 보고 있었습니다. LTV 70%로 계산하니 최대 3억 5천만원을 빌릴 수 있을 것 같았습니다.
        그런데 은행에 가봤더니 한도가 1억 8천만원이라고 합니다.
      </P>
      <P>
        이 상황에서 "은행이 틀린 건가?", "내가 뭔가 잘못 알고 있는 건가?" 하고 혼란스러워하는 분들이 많습니다.
        둘 다 아닙니다. <strong>LTV와 DSR은 서로 독립적으로 한도를 제한하고, 둘 중 낮은 금액이 실제 한도</strong>가 됩니다.
        LTV가 3.5억을 허용해도 DSR 기준으로 1.8억밖에 안 되면, 1.8억이 한도입니다.
      </P>

      <H2 id="calc">내 조건에서 LTV vs DSR 직접 비교</H2>
      <P>
        아래 계산기에서 연 소득, 기존 부채, 주택 가격, LTV 비율을 입력하면
        LTV 기준 한도와 DSR 기준 한도를 동시에 보여주고, 어느 쪽이 내 대출을 막고 있는지 알 수 있습니다.
      </P>
      <LtvDsrCalcWidget />

      <H2 id="two-rules">LTV와 DSR이 보는 것이 완전히 다르다</H2>
      <P>
        LTV와 DSR이 왜 동시에 통과해야 하는지 이해하려면, 각각이 무엇을 측정하는지를 분리해서 봐야 합니다.
      </P>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">LTV — 집 기준</p>
          <p className="font-bold text-blue-900 mb-2">"이 담보가 얼마를 버틸 수 있나?"</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            집값 × 규제 비율(40~70%) = LTV 한도.<br />
            집이 경매에 넘어갔을 때 은행이 회수할 수 있는 최대 금액을 의미합니다.
            개인 소득과는 무관합니다.
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">DSR — 소득 기준</p>
          <p className="font-bold text-indigo-900 mb-2">"이 사람 소득으로 얼마를 감당할 수 있나?"</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            연 소득 × 40% = 연간 원리금 상한선.<br />
            신청자가 매달 갚을 수 있는 금액이 얼마인지를 봅니다.
            집값과는 무관합니다.
          </p>
        </div>
      </div>
      <P>
        비유하자면 이렇습니다. 신용카드 한도(LTV)는 카드사가 부여한 한도지만,
        그 한도를 전부 쓸 수 있는지는 내 월급(DSR)이 결정합니다.
        둘 다 충족해야 실제로 쓸 수 있습니다.
      </P>
      <H3>어떤 경우 LTV가 먼저 막히고, 어떤 경우 DSR이 먼저 막히나</H3>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">상황</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">한도를 막는 주요 요인</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['고소득자 + 부채 없음 + 투기과열지구 LTV 40%', 'LTV'],
              ['일반 직장인 + 신용대출·차 할부 있음 + 비규제지역 LTV 70%', 'DSR'],
              ['연봉 3,000만원 이하 + 기존 부채 많음 + 집값 높음', 'DSR (극단적으로 빡빡)'],
              ['연봉 1억 이상 + 부채 없음 + 어느 지역이나', 'LTV (DSR 여유 충분)'],
            ].map(([situation, blocker], i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{situation}</td>
                <td className={`border border-gray-200 px-4 py-3 text-center font-bold ${blocker === 'LTV' ? 'text-amber-600' : 'text-red-600'}`}>{blocker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        수도권 비규제지역(LTV 70%)에서 집을 사는 일반적인 경우라면,
        연봉이 최소 8,000만원 이상은 되어야 LTV가 DSR보다 먼저 한도를 제한합니다.
        대부분의 직장인은 <strong>DSR이 먼저 막히는 경우</strong>에 해당합니다.
      </P>

      <H2 id="stress-dsr">스트레스 DSR — 실제보다 더 엄격한 계산이 적용된다</H2>
      <P>
        2024년부터 단계적으로 도입된 <strong>스트레스 DSR</strong>은 많은 분들이 모르고 지나치는 중요한 변경 사항입니다.
      </P>
      <Callout color="amber">
        <strong>스트레스 DSR이란?</strong><br />
        실제 대출 금리에 <strong>가산율(스트레스 금리)</strong>을 더해서 DSR을 계산하는 방식입니다.<br /><br />
        예시: 실제 금리 4.0%, 스트레스 가산율 1.5%<br />
        → DSR 계산에는 <strong>5.5% 금리</strong>를 기준으로 월 납입액을 산정<br />
        → 실제 한도가 기존 DSR 계산보다 더 줄어듦<br /><br />
        변동금리 대출일수록 가산율이 높고, 고정금리는 가산율이 낮거나 없습니다.
        같은 조건이라도 금리 유형 선택에 따라 한도가 달라질 수 있습니다.
      </Callout>
      <P>
        스트레스 DSR은 은행 창구 담당자도 계산기를 돌려봐야 정확히 알 수 있을 만큼 복잡합니다.
        위 계산기는 기본 DSR 기준이며, 실제 심사에서는 스트레스 DSR이 적용되어 한도가 더 낮게 나올 수 있습니다.
      </P>

      <H2 id="bank-diff">같은 조건인데 은행마다 한도가 다른 이유</H2>
      <P>
        동일한 소득과 부채를 가진 사람이 A 은행에서 2억, B 은행에서 2억 5천만원 한도를 받는 경우가 실제로 발생합니다.
        이유는 다음과 같습니다.
      </P>
      <Callout color="blue">
        <strong>은행마다 한도가 달라지는 4가지 이유</strong><br /><br />
        <strong>① 소득 인정 방식</strong> — 자영업·프리랜서 소득을 신고소득으로 볼지 인정소득으로 볼지 은행마다 다름<br />
        <strong>② 기존 부채 잔여기간 처리</strong> — 잔여기간 1년 미만 할부 제외 여부가 다름<br />
        <strong>③ 스트레스 DSR 가산율</strong> — 은행별 가산율 적용 방식이 약간씩 다름<br />
        <strong>④ 마이너스통장 반영 비율</strong> — 한도 전액 반영 vs 일부만 반영하는 은행도 있음
      </Callout>
      <P>
        이 때문에 <strong>최소 3곳에 사전심사를 넣어 비교</strong>하는 것이 필수입니다.
        사전심사는 신용점수에 거의 영향을 주지 않습니다.
        어느 은행이 내 상황에 유리한 기준을 적용하는지는 직접 비교해봐야 알 수 있습니다.
      </P>

      <H2 id="what-to-do">한도를 높이려면 무엇을 해야 하나</H2>
      <H3>DSR 한도를 높이는 방법 — 소득 늘리기 or 부채 줄이기</H3>
      <Ul>
        <li><strong>신용대출·차 할부 완납</strong> — 월 납입액이 줄어드는 만큼 주담대 가용 금액이 증가</li>
        <li><strong>마이너스통장 해지</strong> — 잔액 0원이어도 DSR에 반영되는 한도를 없애는 가장 쉬운 방법</li>
        <li><strong>부부합산 소득 신청</strong> — DSR 월 한도 자체가 늘어남</li>
        <li><strong>고정금리 선택</strong> — 스트레스 DSR 가산율이 낮아 같은 금리라도 한도가 더 나올 수 있음</li>
        <li><strong>상환기간 늘리기</strong> — 같은 월 납입 가용액으로 더 많이 빌릴 수 있으나 총이자 증가</li>
      </Ul>
      <H3>LTV 한도를 높이는 방법 — 지역·물건 선택</H3>
      <Ul>
        <li><strong>비규제지역 물건</strong> — LTV 70%가 적용되어 집값 대비 더 많이 빌릴 수 있음</li>
        <li><strong>무주택자 자격 유지</strong> — 1주택자보다 LTV가 더 넓게 허용되는 경우</li>
        <li><strong>선순위 채권 정리</strong> — 기존 담보대출 잔액이 있으면 LTV 한도에서 차감되므로 먼저 정리</li>
      </Ul>
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mt-6">
        <p className="font-semibold text-gray-700 mb-2 text-xs">📌 참고</p>
        <p>이 페이지의 계산은 기본 DSR 기준의 참고용 추정치입니다. 스트레스 DSR 적용, 지역 규제 변경, 소득 인정 방식, 금융기관 내부 심사 기준에 따라 실제 한도는 달라질 수 있습니다.</p>
      </div>
    </GuideLayout>
  )
}
