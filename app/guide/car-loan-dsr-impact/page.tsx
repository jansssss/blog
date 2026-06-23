import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import CarLoanCalcWidget from './CarLoanCalcWidget'

export const metadata: Metadata = {
  title: '자동차 할부가 주담대 한도를 줄이는 이유 — 완납해야 할까? | ohyess',
  description:
    '자동차 할부 월 50만원이 주담대 한도를 1억 이상 줄입니다. DSR에 포함되는 이유, 잔여기간 1년 미만 예외처리, 현금 매입 vs 할부 손익까지 — 다른 곳에서 안 알려주는 내용을 정리했습니다.',
  openGraph: {
    title: '자동차 할부가 주담대 한도를 줄이는 이유',
    description: '차 할부가 집 살 수 있는 가격을 1억 낮추는 구조와 완납 전략',
    type: 'article',
  },
  alternates: { canonical: '/guide/car-loan-dsr-impact' },
}

const tocItems = [
  { id: 'intro', label: '차 할부 하나가 집값을 1억 낮추는 이유' },
  { id: 'calc', label: '내 숫자로 직접 확인하기' },
  { id: 'why-included', label: '할부금융 / 오토론 / 리스 — DSR 반영 방식 차이' },
  { id: 'residual-period', label: '잔여기간 1년 미만이면 DSR에서 빠질 수도 있다' },
  { id: 'cash-vs-loan', label: '차를 현금으로 사면 주담대에 유리한가?' },
  { id: 'payoff-decision', label: '완납해야 할지 판단하는 기준' },
]

const ctas = [
  { label: 'DSR·DTI·LTV 계산기', href: '/calculator/dsr-dti-ltv', description: '자동차 할부 포함해서 내 DSR과 주담대 한도 확인' },
  { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '월 납입액과 총이자 즉시 계산' },
]

const relatedGuides = [
  { title: 'DSR·DTI·LTV 뜻과 차이 완전 정리', href: '/guide/dsr-dti-ltv', description: 'DTI란 무엇인지, DSR 계산 방식 완전 해설' },
  { title: '연봉 5,000만원 신용대출 있으면 주담대 한도는?', href: '/guide/mortgage-salary-5000', description: '기존 부채가 주담대 한도를 얼마나 줄이는지 계산' },
  { title: 'LTV는 남는데 DSR에서 막히는 이유', href: '/guide/ltv-ok-dsr-blocked', description: 'LTV가 충분해도 대출이 적게 나오는 이유' },
  { title: '주담대 금리 0.5% 차이, 총이자 얼마나 다를까', href: '/guide/rate-0p5-difference', description: '금리를 0.5% 낮추면 30년 동안 3,000만원이 달라진다' },
]

const faqs = [
  {
    question: '자동차 리스는 DSR에 포함되나요?',
    answer: '운용 리스(서비스 형태)는 DSR 계산에서 제외되는 경우가 많습니다. 반면 금융 리스나 원금+이자 구조로 납입하는 할부금융은 포함됩니다. 정확한 반영 여부는 주담대를 신청할 금융기관에 직접 확인하세요.',
  },
  {
    question: '차 할부 완납 후 얼마 뒤 주담대 심사를 받아야 하나요?',
    answer: '완납 후 신용정보원 반영까지 보통 1~7 영업일이 걸립니다. 급하다면 완납 확인서를 발급받아 심사 시 제출하면 즉시 반영 처리를 요청할 수 있습니다. 여유가 있다면 완납 후 1~2주 뒤 심사를 받는 것이 안전합니다.',
  },
  {
    question: '차 할부를 일부만 상환하면 주담대 한도가 늘어나나요?',
    answer: 'DSR은 잔액이 아닌 월 납입액 기준입니다. 일부 상환 후 새로운 납입 스케줄이 설정되면 월 납입액이 줄고 DSR 여유분이 생깁니다. 다만 중간 상환 후 월 납입액이 자동으로 줄지 않는 상품도 있으므로 금융기관에 확인하세요.',
  },
  {
    question: '자동차 할부가 많이 남은 상태에서 집을 사고 싶다면?',
    answer: '① 부부합산 소득으로 DSR 한도 자체를 늘리거나, ② 주담대 상환기간을 20년에서 30년으로 늘려 월 납입액을 줄이거나, ③ 여러 은행에 사전심사를 넣어 잔여기간 처리 기준이 유리한 곳을 찾는 방법이 있습니다.',
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

export default function CarLoanDsrImpactPage() {
  return (
    <GuideLayout
      title="자동차 할부가 주담대 한도를 줄이는 이유 — 완납해야 할까?"
      description="차 할부 월 50만원이 주담대 한도를 1억 이상 낮추는 구조를 설명합니다. 잔여기간 예외처리, 현금 매입 vs 할부 손익, 완납 타이밍까지 — 내 숫자로 직접 계산해보세요."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 6월"
    >
      <H2 id="intro">차 할부 하나가 집값을 1억 낮추는 이유</H2>
      <P>
        집을 알아보다가 "자동차 할부도 DSR에 포함됩니다"라는 말을 처음 들으면 당황스럽습니다.
        차를 담보로 빌린 것도 아니고, 집을 담보로 빌리는 돈인데 왜 차 할부가 영향을 주는 건지.
        은행의 논리는 이렇습니다: <em>"이 사람은 매달 차 할부로 50만원을 내고 있다. 그 50만원이 빠지고 나서 주담대를 얼마나 더 감당할 수 있는지를 봐야 한다."</em>
      </P>
      <P>
        연봉 5,000만원 기준 DSR 40% 월 한도는 167만원입니다.
        차 할부 월 50만원이 있으면 주담대 납입 한도는 117만원으로 줄어들고,
        금리 4%, 30년 기준 주담대 한도가 <strong>약 1억 1,000만원 감소</strong>합니다.
      </P>

      <H2 id="calc">내 숫자로 직접 확인하기</H2>
      <P>
        아래 계산기에 연봉과 차 할부 월 납입액을 입력하면, 할부가 있을 때와 없을 때 주담대 한도 차이를 즉시 확인할 수 있습니다.
      </P>
      <CarLoanCalcWidget />

      <H2 id="why-included">할부금융 / 오토론 / 리스 — DSR 반영 방식 차이</H2>
      <P>
        모든 자동차 관련 납입이 DSR에 들어가는 건 아닙니다. 어떤 방식으로 차를 구매했느냐에 따라 달라집니다.
      </P>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">구분</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">DSR 반영</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">설명</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['캐피탈 할부금융', '반영 O', '가장 일반적인 자동차 구매 방식. 원금+이자 납입 구조라 DSR에 포함'],
              ['은행 오토론', '반영 O', '은행에서 직접 실행하는 자동차 담보대출. 신용대출과 동일하게 처리'],
              ['금융 리스', '반영 O (경우에 따라)', '원금+이자 납입 구조면 대출로 분류'],
              ['운용 리스 / 장기렌트', '반영 X (일반적)', '사용료·서비스비 성격으로 분류. 단 금융기관마다 기준이 다를 수 있음'],
              ['현금 매입', '반영 X', '부채 자체가 없으므로 DSR에 전혀 영향 없음'],
            ].map(([type, refl, desc], i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-800">{type}</td>
                <td className={`border border-gray-200 px-4 py-3 text-center font-bold text-sm ${refl.includes('O') ? 'text-red-600' : 'text-emerald-600'}`}>{refl}</td>
                <td className="border border-gray-200 px-4 py-3 text-xs text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        장기렌트는 DSR에서 제외되는 경우가 많지만, 이 역시 금융기관마다 다릅니다.
        렌트·리스를 이용 중이라면 주담대 심사 전 담당자에게 반영 여부를 직접 물어보는 것이 가장 확실합니다.
      </P>

      <H2 id="residual-period">잔여기간 1년 미만이면 DSR에서 빠질 수도 있다</H2>
      <P>
        이 내용은 많은 분들이 모르고 지나치는 부분입니다.
        일부 금융기관은 <strong>할부 잔여기간이 12개월 미만인 경우 DSR 계산에서 제외</strong>하는 기준을 적용합니다.
        차 할부가 거의 끝나가고 있다면, 완납하지 않아도 DSR에서 빠질 수 있다는 뜻입니다.
      </P>
      <Callout color="emerald">
        <strong>잔여기간 1년 미만 예외 — 은행에 꼭 확인하세요</strong><br />
        예시: 차 할부 잔여 납입 10개월 남은 상황 (월 50만원)<br />
        → A 은행: 잔여기간 1년 미만 기준으로 DSR 제외 → 주담대 한도 1억 1,000만원 증가<br />
        → B 은행: 잔여기간 기준 없이 그대로 DSR 포함 → 한도 그대로<br /><br />
        같은 사람인데 은행에 따라 한도가 1억 이상 다르게 나오는 이유 중 하나입니다.
        할부 잔여기간을 먼저 확인하고, 사전심사 시 적극적으로 어필하세요.
      </Callout>
      <P>
        이 기준은 금융기관마다 다르고 내부 심사 지침으로 운영되기 때문에 모든 은행에서 동일하게 적용되지는 않습니다.
        여러 곳에 사전심사를 넣어 비교해보는 것이 가장 확실한 방법입니다.
      </P>

      <H2 id="cash-vs-loan">차를 현금으로 사면 주담대에 유리한가?</H2>
      <P>
        결론부터: <strong>DSR 관점에서는 유리합니다.</strong> 하지만 그것이 항상 최선인지는 다른 문제입니다.
      </P>
      <Callout color="blue">
        <strong>3,000만원짜리 차 — 현금 매입 vs 할부 비교</strong><br />
        할부(5년, 금리 6%): 월 납입 58만원 → 주담대 한도 약 1억 2,700만원 감소<br />
        현금 매입: DSR 영향 0 → 주담대 한도 그대로 유지<br /><br />
        현금이 있다면 차를 현금으로 사는 게 주담대 관점에서는 유리합니다.
        단, 현금 3,000만원이 주담대 계약금·취득세 등 자금으로 필요한 상황이라면 오히려 역효과입니다.
      </Callout>
      <P>
        <strong>현금 매입이 유리한 경우:</strong> 현금 여유가 충분하고, 차 할부 금리(5~7%)가 주담대 금리(3~5%)보다 높아 이자 부담도 큰 경우.
      </P>
      <P>
        <strong>굳이 현금으로 안 사도 되는 경우:</strong> 현금을 써버리면 계약금·중도금을 감당하기 어려운 경우, 또는 주담대 한도가 LTV에 의해 먼저 결정되어 DSR이 여유가 충분한 경우.
      </P>
      <P>
        위 계산기로 내 상황에서 DSR이 실제로 한도를 막고 있는지 먼저 확인하고 결정하세요.
      </P>

      <H2 id="payoff-decision">완납해야 할지 판단하는 기준</H2>
      <P>
        중도상환수수료가 아까워서 고민되는 분들을 위한 판단 기준입니다.
      </P>
      <Callout color="emerald">
        <strong>완납이 확실히 유리한 경우</strong><br />
        ✓ 중도상환수수료(보통 잔액 × 0.5~1%)보다 늘어나는 주담대 한도의 가치가 압도적으로 클 때<br />
        ✓ 잔여 할부금이 적어 완납 부담이 작을 때<br />
        ✓ 완납 후에도 계약금·취득세 등 자금이 충분할 때<br />
        ✓ 주담대 한도가 DSR 때문에 실제로 제한되고 있을 때
      </Callout>
      <Callout color="amber">
        <strong>굳이 완납 안 해도 되는 경우</strong><br />
        △ 완납 후 주택 취득 비용을 감당하기 어려운 경우<br />
        △ 할부 잔여기간이 1년 미만이라 일부 은행에서 DSR 제외 처리가 되는 경우<br />
        △ LTV가 한도를 먼저 결정하고 있어 DSR 여유가 충분한 경우<br />
        △ 부부합산 소득으로 이미 DSR 여유가 충분한 경우
      </Callout>
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mt-6">
        <p className="font-semibold text-gray-700 mb-2 text-xs">📌 참고</p>
        <p>이 페이지의 계산은 기본 DSR·원리금균등 상환 기준의 참고용 추정치입니다. 자동차 할부 DSR 반영 여부 및 잔여기간 처리 방식은 금융기관마다 다를 수 있으므로 심사 전 반드시 확인하세요.</p>
      </div>
    </GuideLayout>
  )
}
