import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'
import CreditLineDsrWidget from './CreditLineDsrWidget'

export const metadata: Metadata = {
  title: '마이너스통장 DSR 계산법 — 잔액 0원이어도 한도가 잡힐까? | ohyess',
  description:
    '마이너스통장은 실제 사용액이 아니라 약정 한도가 DSR에 반영될 수 있습니다. 잔액 0원·일부 사용·한도 감액·해지 때 주담대 여력이 얼마나 달라지는지 직접 계산합니다.',
  alternates: { canonical: '/guide/credit-line-dsr' },
  openGraph: {
    title: '마이너스통장 DSR 계산법 — 잔액 0원이어도 한도가 잡힐까?',
    description: '마이너스통장 약정 한도가 주담대 한도에 미치는 영향을 직접 계산하고 정리합니다.',
    type: 'article',
  },
}

const tocItems = [
  { id: 'answer', label: '결론: 잔액 0원보다 약정 한도가 중요하다' },
  { id: 'formula', label: '마이너스통장이 DSR에 들어가는 방식' },
  { id: 'calculator', label: '내 조건으로 주담대 한도 차이 계산' },
  { id: 'cases', label: '잔액 0원·일부 사용·한도 감액·해지 비교' },
  { id: 'decision', label: '주담대 신청 전에 무엇을 정리할까' },
  { id: 'exceptions', label: '규제 DSR과 은행 내부 심사는 다르다' },
]

const ctas = [
  { label: 'DSR·DTI·LTV 계산기', href: '/calculator/dsr-dti-ltv', description: '기존 대출을 모두 넣어 전체 비율 확인' },
  { label: '대출 한도 시뮬레이터', href: '/calculator/loan-limit', description: '남은 DSR로 가능한 대출액 역산' },
]

const relatedGuides = [
  { title: 'DSR·DTI·LTV 뜻과 차이', href: '/guide/dsr-dti-ltv', description: '대출 한도를 결정하는 세 지표의 공식과 차이' },
  { title: '연봉 5,000만원이면 주담대 얼마까지?', href: '/guide/mortgage-salary-5000', description: '신용대출 유무에 따른 주담대 한도 비교' },
  { title: 'LTV는 되는데 DSR에서 막히는 이유', href: '/guide/ltv-ok-dsr-blocked', description: '담보가 충분해도 소득 규제에서 막히는 구조' },
  { title: '자동차 할부가 주담대 한도를 줄이는 이유', href: '/guide/car-loan-dsr-impact', description: '자동차 할부의 월 상환액이 DSR에 미치는 영향' },
]

const faqs = [
  {
    question: '마이너스통장 잔액이 0원이면 DSR에서 빠지나요?',
    answer: '계좌가 살아 있고 약정 한도가 남아 있다면 잔액이 0원이라는 이유만으로 빠진다고 단정할 수 없습니다. 금융위원회가 안내한 DSR 산식에서는 한도대출의 대출총액을 한도금액으로 적용합니다. 실제 심사 반영 방식은 거래 금융회사에 확인해야 합니다.',
  },
  {
    question: '마이너스통장 한도만 낮춰도 도움이 되나요?',
    answer: '한도대출은 약정 한도가 중요한 입력값이므로 한도 감액이 전산과 신용정보에 반영되면 DSR 부담을 줄이는 데 도움이 될 수 있습니다. 다만 필요한 생활 비상자금까지 없애지 않도록 감액 전후 사전심사 결과를 비교하는 편이 안전합니다.',
  },
  {
    question: '주담대 신청 당일 마이너스통장을 해지해도 되나요?',
    answer: '해지 사실이 심사 시스템에 즉시 반영된다고 가정하면 안 됩니다. 해지확인서나 한도변경 확인서를 준비하고, 주담대 담당자에게 어느 시점의 신용정보를 다시 조회하는지 확인하세요.',
  },
  {
    question: '총대출이 1억원 이하이면 마이너스통장을 신경 쓰지 않아도 되나요?',
    answer: '차주단위 규제 DSR 적용 여부와 금융회사의 자체 상환능력 심사는 별개입니다. 규제 기준에 직접 걸리지 않더라도 은행은 내부 여신심사에서 한도대출을 부채로 볼 수 있으므로 사전조회가 필요합니다.',
  },
  {
    question: '스트레스 DSR도 마이너스통장에 적용되나요?',
    answer: '스트레스 DSR은 기본 DSR과 구분해야 합니다. 금융위원회 안내상 신용대출은 전체 신용대출 잔액이 1억원을 초과하는 경우 스트레스 금리 적용 대상이 될 수 있습니다. 적용 금리와 범위는 시기별로 바뀔 수 있어 신청 시점의 공지와 금융회사 안내를 확인해야 합니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-20 border-b border-gray-100 pb-2 text-xl font-bold text-gray-900">
      {children}
    </h2>
  )
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-6 text-base font-semibold text-gray-800">{children}</h3>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[15px] leading-relaxed text-gray-700">{children}</p>
}

function Callout({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'amber' | 'emerald' }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }
  return <div className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[tone]}`}>{children}</div>
}

export default function CreditLineDsrPage() {
  return (
    <GuideLayout
      pageUrl="/guide/credit-line-dsr"
      title="마이너스통장 DSR 계산법 — 잔액 0원이어도 한도가 잡힐까?"
      description="마이너스통장을 거의 쓰지 않아도 주담대 한도가 줄 수 있는 이유를 공식 산식과 직접 계산으로 확인하고, 해지·한도 감액 전 체크할 순서를 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 8월"
      publishedAt="2026년 8월 27일"
      reviewedAt="2026년 8월 27일"
      referenceDate="2026년 8월 기준"
      appliesTo="은행·비은행권 가계대출 심사"
      sources={[
        {
          label: '금융위원회 — 차주단위 DSR 주요 문답',
          href: 'https://fsc.go.kr/po020201/76750',
        },
        {
          label: '금융위원회 — 차주단위 DSR 규정(은행 40%·비은행 50%)',
          href: 'https://www.fsc.go.kr/po040200/78428?srchCtgry=1',
        },
        {
          label: '금융위원회 — 2026년 가계부채·DSR 운영 점검',
          href: 'https://www.fsc.go.kr/no010101/86914',
        },
      ]}
    >
      <H2 id="answer">결론: 잔액 0원보다 약정 한도가 중요하다</H2>
      <P>
        마이너스통장 화면에 찍힌 사용 잔액이 0원이어도 계좌가 해지된 것은 아닙니다. 필요할 때 다시 꺼내 쓸 수 있는
        <strong> 약정 한도</strong>가 남아 있기 때문입니다. 금융위원회가 공개한 DSR 원리금상환액 산출 방식은
        한도대출의 대출총액을 <strong>약정 한도금액</strong>으로 적용한다고 안내합니다.
      </P>
      <Callout tone="amber">
        <strong>한도 3,000만원, 사용액 0원인 마이너스통장</strong><br />
        DSR 심사에서 항상 “부채 0원”으로 취급된다고 보면 안 됩니다. 핵심 확인값은 사용액이 아니라 약정 한도와
        금융회사의 심사 산식입니다.
      </Callout>
      <P>
        그래서 주택담보대출 사전조회에서 예상보다 한도가 적게 나오면 신용대출 잔액만 보지 말고, 사용하지 않는
        마이너스통장 한도와 카드론·자동차 할부 같은 다른 가계대출도 함께 확인해야 합니다.
        전체 개념은 <Link href="/guide/dsr-dti-ltv" className="font-semibold text-indigo-600 hover:underline">DSR·DTI·LTV 가이드</Link>에서
        먼저 볼 수 있습니다.
      </P>

      <H2 id="formula">마이너스통장이 DSR에 들어가는 방식</H2>
      <P>
        DSR은 연 소득 중 모든 가계대출의 연간 원리금 상환액이 차지하는 비율입니다. 차주단위 규제 DSR은
        총대출액이 기준을 넘는 차주에게 적용되며, 현재 금융위원회 규정 안내는 은행권 40%, 비은행권 50%를 기준으로
        설명합니다. 다만 예외 대출과 금융회사별 내부 심사는 별도로 확인해야 합니다.
      </P>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">확인 항목</th>
              <th className="border-b border-gray-200 px-4 py-3">기본 산식의 구조</th>
              <th className="border-b border-gray-200 px-4 py-3">실무상 주의</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">대출총액</td>
              <td className="border-b border-gray-100 px-4 py-3">한도대출은 약정 한도금액</td>
              <td className="border-b border-gray-100 px-4 py-3">현재 사용액만 보면 과소평가 가능</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">연간 원금</td>
              <td className="border-b border-gray-100 px-4 py-3">일시상환 신용대출은 5년 만기로 환산</td>
              <td className="border-b border-gray-100 px-4 py-3">인정되는 분할상환 대출은 실제 만기 적용 가능</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">연간 이자</td>
              <td className="px-4 py-3">실제 부담액을 반영하는 구조</td>
              <td className="px-4 py-3">스트레스 DSR 대상이면 심사용 가산금리 영향 가능</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout>
        예를 들어 약정 한도 3,000만원인 일시상환 마이너스통장을 5년 만기로 단순 환산하면,
        사용 잔액이 0원이어도 연간 원금 환산액은 600만원입니다. 사용액이 있으면 이자 부담도 더해질 수 있습니다.
        실제 은행 산출값을 대신하는 확정 수치가 아니라 한도가 줄어드는 원리를 이해하기 위한 예시입니다.
      </Callout>

      <H2 id="calculator">내 조건으로 주담대 한도 차이 계산</H2>
      <P>
        연 소득과 마이너스통장 한도·금리를 바꿔 보세요. 주담대 심사금리는 실제 대출금리와 같지 않을 수 있으므로,
        은행이 알려준 심사용 금리가 있다면 그 값으로 맞추는 편이 낫습니다.
      </P>
      <CreditLineDsrWidget />
      <P>
        이 계산으로 정리 대상의 크기를 먼저 파악한 뒤,
        <Link href="/calculator/dsr-dti-ltv" className="font-semibold text-indigo-600 hover:underline"> 전체 DSR 계산기</Link>에서
        자동차 할부와 다른 신용대출까지 함께 넣어 확인하세요. 한 가지 부채만 빼고 계산하면 실제 사전심사와 차이가 커질 수 있습니다.
      </P>

      <H2 id="cases">잔액 0원·일부 사용·한도 감액·해지 비교</H2>
      <H3>잔액 0원, 계좌 유지</H3>
      <P>
        사용액이 없어 이자는 거의 발생하지 않더라도, 다시 쓸 수 있는 한도가 열려 있습니다. DSR과 총대출액을 볼 때
        약정 한도가 반영될 수 있으므로 “안 썼으니 영향 없음”으로 단정하지 마세요.
      </P>
      <H3>한도 3,000만원 중 500만원 사용</H3>
      <P>
        생활비로 500만원만 사용했더라도 한도대출의 대출총액 기준은 약정 한도를 봅니다. 일반 신용대출의 잔액 개념과
        마이너스통장 한도 개념을 구분해야 하는 이유입니다.
      </P>
      <H3>한도를 3,000만원에서 1,000만원으로 감액</H3>
      <P>
        비상자금 계좌를 완전히 없애기 어렵다면 한도 감액을 검토할 수 있습니다. 다만 감액 사실이 심사에 반영됐는지
        한도변경 확인서와 재조회 결과로 확인해야 합니다. 미래에 다시 한도를 늘릴 때 같은 조건이 보장되지 않는 점도 고려하세요.
      </P>
      <H3>계좌 해지</H3>
      <P>
        약정 자체를 종료하면 한도대출을 정리했다는 근거가 가장 명확합니다. 그러나 주담대 승인 전에 비상 유동성을 모두
        없애는 결정이 항상 최선은 아닙니다. 먼저 해지 전·후 예상 한도를 사전조회하고, 계약금·취득세·이사비 등 남겨야 할
        현금을 계산한 뒤 결정해야 합니다.
      </P>

      <H2 id="decision">주담대 신청 전에 무엇을 정리할까</H2>
      <ol className="mb-5 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
        <li><strong>신용정보와 대출 약정 목록을 확인합니다.</strong> 잔액뿐 아니라 한도대출의 약정 한도를 적습니다.</li>
        <li><strong>현재 상태로 사전심사를 먼저 받습니다.</strong> 어떤 부채가 한도를 막는지 담당자에게 산출 근거를 요청합니다.</li>
        <li><strong>해지·감액 시나리오를 비교합니다.</strong> 늘어나는 주담대 한도와 잃는 비상자금 한도를 함께 봅니다.</li>
        <li><strong>변경 증빙을 준비합니다.</strong> 해지확인서·한도변경 확인서를 제출하고 신용정보 재조회 시점을 확인합니다.</li>
        <li><strong>승인 이후 새 신용대출을 섣불리 만들지 않습니다.</strong> 실행 전 부채 변동은 재심사 사유가 될 수 있어 담당자 확인이 필요합니다.</li>
      </ol>
      <Callout tone="emerald">
        목표는 무조건 마이너스통장을 없애는 것이 아니라, <strong>주담대 승인에 필요한 만큼만 DSR 여유를 확보하면서
        생활 비상자금도 남기는 것</strong>입니다. 정답은 해지가 아니라 사전심사 전후 숫자 비교에서 나옵니다.
      </Callout>

      <H2 id="exceptions">규제 DSR과 은행 내부 심사는 다르다</H2>
      <P>
        차주단위 규제 DSR의 적용 대상이 아니라고 해서 대출기관이 상환능력을 보지 않는 것은 아닙니다. 금융회사는
        자체 여신심사 기준으로 더 보수적인 한도나 소득 인정 방식을 적용할 수 있습니다. 반대로 정책금융상품·일부 소액대출 등은
        규제 DSR에서 예외가 될 수 있으므로 상품별 확인이 필요합니다.
      </P>
      <P>
        스트레스 DSR은 실제 납부 금리를 올리는 제도가 아니라, 미래 금리 상승 위험을 반영해 심사금리에 가산값을 넣는 제도입니다.
        금융위원회는 적용 금리와 범위를 주기적으로 조정하므로 오래된 기사 속 숫자를 그대로 사용하지 말고 신청 시점의 공지와
        은행 안내를 다시 확인하세요.
      </P>
      <Callout>
        이 페이지는 2026년 8월 27일 확인한 금융위원회 공개 자료를 기준으로 작성했습니다. 개인별 소득 인정액,
        대출 종류, 지역, 금리 유형과 금융회사 내부 기준에 따라 실제 결과가 달라질 수 있으며 대출 승인을 보장하지 않습니다.
      </Callout>

      <HubBacklink hub="dsr-guide" />
    </GuideLayout>
  )
}
