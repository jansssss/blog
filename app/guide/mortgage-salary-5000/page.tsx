import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import MortgageCalcWidget from './MortgageCalcWidget'

export const metadata: Metadata = {
  title: '연봉 5,000만원 신용대출 있으면 주담대 한도는? — DSR 계산 완전 해설 | ohyess',
  description:
    '연봉 5,000만원에 신용대출 3,000만원이 있을 때 주담대 한도가 생각보다 훨씬 적게 나오는 구조를 DSR로 설명합니다. 내 숫자를 직접 입력해 한도를 확인하고, 한도를 높이는 실제 방법을 알아보세요.',
  openGraph: {
    title: '연봉 5,000만원 신용대출 있으면 주담대 한도는?',
    description: '내 숫자로 직접 계산하는 주담대 한도 시뮬레이터 + DSR 구조 완전 해설',
    type: 'article',
  },
  alternates: { canonical: '/guide/mortgage-salary-5000' },
}

const tocItems = [
  { id: 'intro', label: '은행에서 한도가 왜 이렇게 적게 나왔을까' },
  { id: 'calc', label: '내 한도 직접 계산하기' },
  { id: 'income-trap', label: '은행이 "연봉"을 계산하는 방식 — 생각과 다를 수 있다' },
  { id: 'timing', label: '신용대출 상환 타이밍이 중요한 이유' },
  { id: 'options', label: '한도를 늘리는 실제 선택지' },
  { id: 'bank-strategy', label: '어느 은행에 먼저 가야 하나' },
]

const ctas = [
  { label: 'DSR·DTI·LTV 계산기', href: '/calculator/dsr-dti-ltv', description: '기존 대출 포함 전체 DSR·DTI 계산' },
  { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '월 납입액과 총이자 확인' },
]

const relatedGuides = [
  { title: 'DSR·DTI·LTV 뜻과 차이 완전 정리', href: '/guide/dsr-dti-ltv', description: 'DTI란 무엇인지, DSR과 DTI 차이, LTV 뜻까지' },
  { title: 'LTV는 남는데 DSR에서 막히는 이유', href: '/guide/ltv-ok-dsr-blocked', description: '은행에서 한도가 생각보다 적게 나온 진짜 이유' },
  { title: '자동차 할부가 주담대 한도를 줄이는 이유', href: '/guide/car-loan-dsr-impact', description: '차 할부 하나가 집 살 수 있는 가격을 1억 낮추는 구조' },
  { title: '주담대 금리 0.5% 차이, 총이자 얼마나 다를까', href: '/guide/rate-0p5-difference', description: '한도 확보 후 금리 협상이 중요한 이유' },
]

const faqs = [
  {
    question: '부업 수입도 DSR 소득에 포함되나요?',
    answer: '증빙 가능한 소득은 포함됩니다. 다만 프리랜서·부업 소득은 최근 2년치 종합소득세 신고 내역이 있어야 인정받는 경우가 많고, 금융기관마다 인정 비율이 다릅니다. 근로소득 외 소득이 있다면 주담대 신청 전 해당 은행에 소득 인정 범위를 먼저 확인하세요.',
  },
  {
    question: '신용대출 완납 후 바로 주담대를 받을 수 있나요?',
    answer: '완납 후 금융기관 전산 반영까지 보통 1~3 영업일이 걸립니다. 사전심사 시 대출 완납 확인서를 함께 제출하면 반영이 빠릅니다. 급하다면 완납 직후 담당자에게 완납 사실을 알리고 재심사를 요청하세요.',
  },
  {
    question: '마이너스통장도 DSR에 포함되나요?',
    answer: '네, 마이너스통장은 잔액이 0원이어도 약정 한도의 일정 비율이 DSR에 반영됩니다. 쓰지 않는 마이너스통장이 있다면 주담대 신청 전 해지하는 것이 DSR 여유분을 확보하는 가장 쉬운 방법입니다.',
  },
  {
    question: '신용대출 일부만 갚으면 한도가 늘어나나요?',
    answer: 'DSR은 잔액이 아닌 월 납입액 기준입니다. 일부 상환 후 월 납입액이 재설정되면 그만큼 DSR 여유분이 생깁니다. 그러나 일부 상환은 만기를 단축시키지 않으면 월 납입액이 거의 변하지 않을 수 있습니다. 금융기관에 상환 후 월 납입액 변동 여부를 먼저 확인하세요.',
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
function Callout({ color = 'blue', children }: { color?: 'blue' | 'amber' | 'emerald'; children: ReactNode }) {
  const s = {
    blue:    'bg-blue-50 border-blue-200 text-blue-900',
    amber:   'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed mb-4 ${s[color]}`}>{children}</div>
}

export default function MortgageSalary5000Page() {
  return (
    <GuideLayout
      pageUrl="/guide/mortgage-salary-5000"
      title="연봉 5,000만원, 신용대출 있으면 주담대 한도는?"
      description="내 숫자를 직접 입력해 주담대 한도를 계산하고, 은행이 한도를 정하는 실제 구조와 한도를 높이는 현실적인 방법을 알아봅니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 6월"
    >
      <H2 id="intro">은행에서 한도가 왜 이렇게 적게 나왔을까</H2>
      <P>
        집을 알아보다가 은행에서 주담대 한도를 조회해봤는데 기대보다 훨씬 적게 나온 경험을 하는 분들이 많습니다.
        연봉 5,000만원이면 꽤 빌릴 수 있을 것 같았는데, 신용대출 하나 때문에 한도가 2억 가까이 줄어드는 것입니다.
      </P>
      <P>
        이 차이를 만드는 것은 <strong>DSR(총부채원리금상환비율)</strong> 규제입니다.
        은행은 신규 주담대만 보는 게 아니라, 신청자의 <strong>모든 금융 대출의 원리금 합계</strong>가
        연 소득의 40%를 넘으면 추가 대출을 줄 수 없습니다.
        신용대출 월 납입액이 이 40% 안에 포함되기 때문에, 신용대출이 있으면 주담대 가용 한도가 그만큼 줄어듭니다.
      </P>
      <Callout color="amber">
        <strong>신용대출 3,000만원(금리 5%, 3년) → 월 납입 약 90만원</strong><br />
        연봉 5,000만원 DSR 월 한도 167만원 – 신용대출 90만원 = 주담대 가용 77만원<br />
        → 금리 4%, 30년 역산 시 주담대 한도 <strong>약 1억 7천만원</strong>
        (신용대출 없을 때 3억 6,500만원 대비 약 2억 감소)
      </Callout>

      <H2 id="calc">내 한도 직접 계산하기</H2>
      <P>
        아래 계산기에 연 소득, 기존 대출 월 납입액, 희망 금리와 상환기간을 입력하면
        내 조건에서의 주담대 최대 한도를 즉시 확인할 수 있습니다.
        신용대출을 갚았을 때 얼마나 한도가 늘어나는지도 함께 보여줍니다.
      </P>
      <MortgageCalcWidget />

      <H2 id="income-trap">은행이 "연봉"을 계산하는 방식 — 생각과 다를 수 있다</H2>
      <P>
        계산기에 연봉을 입력할 때, 은행이 실제로 어떤 숫자를 사용하는지 알아야 정확한 결과를 볼 수 있습니다.
        은행은 실수령액이 아니라 <strong>세전 총급여</strong>를 기준으로 하지만, 그 인정 방식이 소득 종류마다 다릅니다.
      </P>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">소득 유형</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">인정 기준</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">주의사항</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['직장 근로소득', '근로소득원천징수영수증 총급여', '상여금·수당 포함 / 실수령액보다 높음'],
              ['사업·자영업 소득', '최근 2년 종합소득세 신고 기준', '인정소득 or 신고소득 중 선택 (은행별 상이)'],
              ['임대소득', '임대차계약서·확정일자 기준', '은행마다 인정 비율 60~100% 상이'],
              ['프리랜서·부업', '최근 2년 종합소득세 신고 내역', '신고 이력 없으면 인정 안 됨'],
            ].map(([type, std, note], i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-800">{type}</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{std}</td>
                <td className="border border-gray-200 px-4 py-3 text-xs text-gray-500">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout color="blue">
        <strong>올해 연봉이 올랐다면 — 심사 시점이 중요합니다</strong><br />
        은행은 보통 직전 연도 원천징수영수증을 기준으로 심사합니다.
        연초에 연봉이 인상됐다면 올해 급여명세서 3개월치와 재직증명서를 추가 제출해 올해 소득으로 인정받을 수 있는지
        사전에 확인하세요. 은행마다 인정 여부가 다릅니다.
      </Callout>

      <H2 id="timing">신용대출 상환 타이밍이 중요한 이유</H2>
      <P>
        "신용대출을 갚고 다음 날 바로 주담대 신청하면 되는 거 아닌가?"라고 생각하기 쉽습니다.
        실제로는 그렇지 않습니다. 완납이 DSR에 반영되기까지 시간이 걸립니다.
      </P>
      <Callout color="blue">
        <strong>완납 후 DSR 반영 흐름</strong><br />
        완납 → 금융기관 전산 반영 (1~3 영업일) → 신용정보원 CB 갱신 (주 1~2회 배치) → 주담대 심사 반영<br /><br />
        완납 후 최소 <strong>1주일 이상 여유</strong>를 두는 것이 안전합니다.
        급하다면 완납 확인서를 직접 제출해 즉시 반영 처리를 요청할 수 있습니다.
      </Callout>
      <H3>중도상환수수료 계산 — 갚는 게 맞는가?</H3>
      <P>
        신용대출 중도상환수수료는 보통 잔액 × 0.5~1% 수준(대출 후 3년 이내)입니다.
        잔액 3,000만원이라면 최대 30만원입니다.
        반면 완납 후 늘어나는 주담대 한도는 약 1억 9,000만원 수준입니다.
        수수료 30만원을 내고 1억 9천 한도가 생긴다면 수식은 단순합니다.
        수수료가 아깝다는 이유로 완납을 미루는 것은 대부분의 경우 득이 아닙니다.
      </P>

      <H2 id="options">한도를 늘리는 실제 선택지</H2>
      <H3>① 신용대출 완납 — 가장 효과적이나 현금 필요</H3>
      <P>
        완납하면 DSR 여유분 전액이 주담대로 전환됩니다.
        현금이 충분하고, 완납 후에도 계약금·취득세 등 주택 취득 비용을 감당할 수 있다면 가장 확실한 방법입니다.
        주담대 승인 후 마이너스통장을 새로 개설하는 방법도 있지만, 반드시 <strong>주담대 심사 이후</strong>에 개설해야 합니다.
      </P>
      <H3>② 상환기간 늘리기 — 현금 없이 월 납입액만 줄이기</H3>
      <P>
        3,000만원을 3년(월 90만원) 대신 5년(월 57만원)으로 바꾸면 DSR 여유분이 33만원 생기고
        주담대 한도가 약 7,200만원 늘어납니다.
        단, 상환기간 연장은 대출 재약정이 필요하고 금리 조건이 변경될 수 있습니다.
      </P>
      <H3>③ 마이너스통장 해지 — 잔액 0원이어도 DSR에 잡힌다</H3>
      <P>
        마이너스통장은 실제 인출액이 0원이어도 약정 한도의 일정 비율이 DSR에 반영됩니다.
        쓰지 않는 마이너스통장이 있다면 해지하는 것이 가장 간단하고 빠른 방법입니다.
        주담대 심사 전에 먼저 확인하고 정리하세요.
      </P>
      <H3>④ 부부합산 소득 — 가장 극적인 한도 변화</H3>
      <P>
        배우자가 있고 소득이 있다면 부부합산 소득으로 주담대를 신청할 수 있습니다.
        배우자 연봉 3,000만원이면 합산 8,000만원이 되어 DSR 월 한도가 267만원으로 늘어납니다.
        신용대출 90만원을 차감해도 주담대 가용 납입액이 177만원, 한도가 약 3억 8,000만원이 됩니다.
      </P>

      <H2 id="bank-strategy">어느 은행에 먼저 가야 하나</H2>
      <P>
        같은 조건이어도 은행마다 한도와 금리가 다르게 나오는 이유가 있습니다.
        소득 인정 방식, 기존 부채 처리 기준, 우대금리 조건이 모두 다르기 때문입니다.
      </P>
      <Callout color="emerald">
        <strong>사전심사 전략</strong><br />
        • 시중은행(KB·신한·하나·우리), 인터넷은행(카카오·토스·케이), 지방은행 최소 3곳에 넣어보세요<br />
        • 사전심사는 신용점수에 거의 영향 없음 (대출 조회와 달리 연조회로 처리)<br />
        • 가장 낮은 금리 제안을 받은 뒤, 다른 은행에 "더 낮은 곳이 있다"고 하면 추가 우대금리 협상 가능<br />
        • 신용대출이 있다면 <strong>완납 예정임을 미리 알리면</strong> 완납 조건부 한도를 조회해주는 은행도 있습니다
      </Callout>
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mt-6">
        <p className="font-semibold text-gray-700 mb-2 text-xs">📌 참고</p>
        <p>이 페이지의 계산은 기본 DSR·원리금균등 상환 기준의 참고용 추정치입니다. 스트레스 DSR 적용, 소득 인정 방식, 금융기관 내부 심사 기준에 따라 실제 한도는 달라질 수 있습니다.</p>
      </div>
    </GuideLayout>
  )
}
