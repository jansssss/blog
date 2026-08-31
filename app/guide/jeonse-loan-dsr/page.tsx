import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'

export const metadata: Metadata = {
  title: '전세대출 DSR 적용 계산 — 1주택자는 이자만 반영 | ohyess',
  description:
    '1주택자가 수도권·규제지역에서 전세대출을 받을 때 DSR에 들어가는 금액을 계산합니다. 무주택자·정책대출·기존 계약 예외와 2025년 10월 29일 시행 기준을 정리합니다.',
  alternates: { canonical: '/guide/jeonse-loan-dsr' },
  openGraph: {
    title: '전세대출 DSR 적용 계산 — 1주택자는 이자만 반영',
    description: '주택 수·임차 지역·신청일로 적용 여부를 판단하고 연 이자만 반영하는 계산법을 확인하세요.',
    type: 'article',
  },
}

const tocItems = [
  { id: 'answer', label: '즉답: 네 가지 조건을 모두 확인' },
  { id: 'who', label: '누가 전세대출 DSR 적용 대상인가' },
  { id: 'formula', label: '원금이 아니라 연 이자만 계산' },
  { id: 'examples', label: '소득·대출금별 현실적 예시' },
  { id: 'exceptions', label: '무주택자·정책대출·기존 계약 예외' },
  { id: 'checklist', label: '은행 상담 전 체크리스트' },
]

const ctas = [
  {
    label: 'DSR·DTI·LTV 계산기',
    href: '/calculator/dsr-dti-ltv',
    description: '전세대출 연 이자와 기존 대출을 합쳐 전체 DSR 확인',
  },
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '대출금과 금리로 월·연 이자 부담 확인',
  },
]

const relatedGuides = [
  {
    title: 'DSR·DTI·LTV 뜻과 차이',
    href: '/guide/dsr-dti-ltv',
    description: 'DSR 40%의 기본 공식과 대출 한도 구조',
  },
  {
    title: '전세대출 완전 정리',
    href: '/guide/jeonse-loan',
    description: '버팀목·HF·시중은행 전세대출의 조건과 절차',
  },
  {
    title: '대출 보증보험 완전 정리',
    href: '/guide/loan-guarantee',
    description: '전세대출 보증과 반환보증의 차이',
  },
  {
    title: '마이너스통장 DSR 계산법',
    href: '/guide/credit-line-dsr',
    description: '전세대출 외 기존 부채가 DSR에 들어가는 방식',
  },
]

const faqs = [
  {
    question: '무주택자의 전세대출도 DSR에 포함되나요?',
    answer:
      '2026년 8월 31일 확인 기준, 금융위원회가 확정해 시행 중인 대상은 1주택자가 수도권·규제지역에서 신규로 받는 일반 전세대출입니다. 금융위원회는 2026년 1월 무주택자 고액 전세대출 등으로의 구체적 확대 방안은 확정되지 않았다고 설명했습니다. 신청 직전 최신 공지를 다시 확인하세요.',
  },
  {
    question: '전세대출 원금 전체가 DSR에 들어가나요?',
    answer:
      '아닙니다. 적용 대상 차주도 전세대출 원금은 넣지 않고 연간 이자상환분만 DSR 분자에 더합니다. 예를 들어 2억원을 연 4%로 빌리면 연 800만원이 반영되는 구조입니다.',
  },
  {
    question: '내가 가진 집이 지방이면 적용되지 않나요?',
    answer:
      '소유한 집의 지역은 관계없습니다. 1주택자인지가 먼저이고, 새로 임차하는 주택이 수도권 또는 규제지역에 있는지를 봅니다.',
  },
  {
    question: '버팀목 전세대출도 이자상환분이 DSR에 들어가나요?',
    answer:
      '금융위원회 공식 FAQ는 버팀목 전세대출과 은행·지방자치단체 협약 전세대출 같은 정책 목적 전세대출을 적용 대상에서 제외한다고 안내합니다. 상품명이 비슷할 수 있으므로 은행에 정책 목적 상품인지 확인하세요.',
  },
  {
    question: '기존 전세대출을 연장하면 새 규칙이 적용되나요?',
    answer:
      '2025년 10월 29일 전에 실행된 전세대출을 같은 집에서 증액 없이 연장하면 원칙적으로 적용하지 않습니다. 다만 연장하면서 금액을 늘리면 신규대출로 보아 적용될 수 있습니다.',
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

export default function JeonseLoanDsrPage() {
  return (
    <GuideLayout
      pageUrl="/guide/jeonse-loan-dsr"
      title="전세대출 DSR 적용 계산 — 1주택자는 원금이 아니라 이자만 반영"
      description="전세대출이 무조건 DSR에서 빠진다는 오래된 설명 대신, 주택 수·임차 지역·신청일·상품 성격으로 현재 적용 여부를 판단하고 실제 반영액을 계산합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 8월"
      publishedAt="2026년 8월 31일"
      reviewedAt="2026년 8월 31일"
      referenceDate="2026년 8월 31일 기준"
      appliesTo="1주택자의 수도권·규제지역 신규 전세대출"
      sources={[
        {
          label: '금융위원회 — 1주택자 전세대출 DSR 시행안',
          href: 'https://www.fsc.go.kr/po010101/85432?srchCtgry=1',
        },
        {
          label: '금융위원회 — 전세대출 DSR 공식 FAQ',
          href: 'https://www.fsc.go.kr/po020201/85518?curPage=1',
        },
        {
          label: '금융위원회 — DSR 적용 확대 미확정 설명',
          href: 'https://www.fsc.go.kr/no010102/86030',
        },
        {
          label: '금융위원회 — 2026년 가계부채 관리방안',
          href: 'https://www.fsc.go.kr/po010101/86606',
        },
      ]}
    >
      <H2 id="answer">즉답: 네 가지 조건을 모두 만족하면 연 이자가 DSR에 들어간다</H2>
      <P>
        2025년 10월 29일부터 <strong>1주택자</strong>가 <strong>수도권 또는 규제지역</strong>의 집을 빌리며
        <strong> 일반 전세대출을 신규로 받을 때</strong> 전세대출의 연 이자상환액이 DSR에 반영됩니다.
        소유한 집이 어디에 있는지는 관계없고, 빌려 들어갈 집의 지역이 기준입니다.
      </P>
      <Callout tone="emerald">
        <strong>전세대출 2억원 · 금리 연 4%</strong><br />
        DSR에 더하는 금액은 원금 2억원이 아니라 <strong>연 이자 800만원</strong>입니다. 연소득이 6,000만원이면
        전세대출만으로 DSR이 약 <strong>13.3%p</strong> 올라갑니다.
      </Callout>
      <P>
        무주택자, 버팀목 같은 정책 목적 전세대출, 시행 전 기존 계약에는 예외가 있습니다. 따라서
        “전세대출은 포함된다” 또는 “전부 제외된다”로 단정하지 말고 아래 순서로 확인해야 합니다.
      </P>

      <H2 id="who">누가 전세대출 DSR 적용 대상인가</H2>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">판단 순서</th>
              <th className="border-b border-gray-200 px-4 py-3">확인할 조건</th>
              <th className="border-b border-gray-200 px-4 py-3">현행 처리</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">1. 주택 수</td>
              <td className="border-b border-gray-100 px-4 py-3">차주가 1주택자인가</td>
              <td className="border-b border-gray-100 px-4 py-3">1주택자 대상</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">2. 임차 지역</td>
              <td className="border-b border-gray-100 px-4 py-3">새 전셋집이 수도권·규제지역인가</td>
              <td className="border-b border-gray-100 px-4 py-3">해당 지역이면 적용</td>
            </tr>
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">3. 상품 성격</td>
              <td className="border-b border-gray-100 px-4 py-3">버팀목·지자체 협약 등 정책 목적 상품인가</td>
              <td className="border-b border-gray-100 px-4 py-3">정책 목적 상품은 제외</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="px-4 py-3 font-semibold">4. 신규 여부</td>
              <td className="px-4 py-3">2025년 10월 29일 이후 신규·증액인가</td>
              <td className="px-4 py-3">신규·증액이면 적용</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout tone="amber">
        <strong>지역을 거꾸로 보면 안 됩니다.</strong><br />
        내가 소유한 집이 지방이어도 새로 임차하는 집이 서울·경기·인천 또는 규제지역이면 적용 대상이 될 수 있습니다.
      </Callout>
      <P>
        DSR 자체의 분자·분모와 은행권 40% 구조가 낯설다면
        {' '}<Link href="/guide/dsr-dti-ltv" className="font-semibold text-indigo-600 hover:underline">DSR·DTI·LTV 가이드</Link>를
        먼저 확인하세요. 전체 부채를 직접 넣을 때는
        {' '}<Link href="/calculator/dsr-dti-ltv" className="font-semibold text-indigo-600 hover:underline">DSR 계산기</Link>를 함께 쓰면 됩니다.
      </P>

      <H2 id="formula">계산법: 전세대출 원금이 아니라 연 이자만 더한다</H2>
      <P>적용 대상 전세대출의 추가 DSR 부담은 다음 두 단계로 계산합니다.</P>
      <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-7 text-indigo-950">
        <p><strong>① 연 이자상환액</strong> = 전세대출 원금 × 적용 금리</p>
        <p><strong>② 전세대출의 DSR 증가분</strong> = 연 이자상환액 ÷ 연소득 × 100</p>
        <p><strong>③ 전체 DSR</strong> = (기존 대출 연 원리금 + 전세대출 연 이자) ÷ 연소득 × 100</p>
      </div>
      <P>
        예를 들어 기존 대출의 연 원리금이 1,200만원이고, 전세대출 2억원의 금리가 연 4%라면 DSR 분자에는
        1,200만원과 800만원을 합친 2,000만원을 넣습니다. 실제 대출금리는 우대금리와 변동 주기에 따라 달라질 수
        있으므로 은행의 최종 금리로 다시 계산해야 합니다.
      </P>

      <H2 id="examples">소득·대출금별 현실적 예시</H2>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">연소득</th>
              <th className="border-b border-gray-200 px-4 py-3">전세대출·금리</th>
              <th className="border-b border-gray-200 px-4 py-3">반영 연 이자</th>
              <th className="border-b border-gray-200 px-4 py-3">DSR 증가분</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3">5,000만원</td>
              <td className="border-b border-gray-100 px-4 py-3">1억원 · 4.0%</td>
              <td className="border-b border-gray-100 px-4 py-3">400만원</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold text-indigo-700">8.0%p</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3">6,000만원</td>
              <td className="border-b border-gray-100 px-4 py-3">2억원 · 4.0%</td>
              <td className="border-b border-gray-100 px-4 py-3">800만원</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold text-indigo-700">13.3%p</td>
            </tr>
            <tr>
              <td className="px-4 py-3">8,000만원</td>
              <td className="px-4 py-3">3억원 · 4.5%</td>
              <td className="px-4 py-3">1,350만원</td>
              <td className="px-4 py-3 font-semibold text-indigo-700">16.9%p</td>
            </tr>
          </tbody>
        </table>
      </div>
      <H3>사례: 기존 DSR 30%인 연봉 6,000만원 차주</H3>
      <P>
        기존 대출 연 원리금이 1,800만원이면 DSR은 30%입니다. 여기에 전세대출 2억원·금리 4%의 연 이자
        800만원을 더하면 연 상환부담은 2,600만원, 전체 DSR은 약 43.3%가 됩니다. 은행권 40% 기준을 넘을 수
        있으므로 대출금 감액, 기존 부채 상환, 인정소득 보완 중 가능한 선택을 은행 사전심사에서 비교해야 합니다.
      </P>
      <Callout tone="blue">
        표의 값은 <strong>전세대출 때문에 늘어나는 비율만</strong> 보여주는 참고값입니다. 실제 심사는 기존 주담대·신용대출·
        마이너스통장·할부 등과 금융회사별 소득 인정 기준을 함께 봅니다.
      </Callout>

      <H2 id="exceptions">무주택자·정책대출·기존 계약은 예외를 먼저 확인</H2>
      <H3>무주택자</H3>
      <P>
        2026년 8월 31일 확인한 금융위원회 공식 자료상 시행 중인 조치는 1주택자의 수도권·규제지역 전세대출을
        대상으로 합니다. 금융위원회는 2026년 1월 무주택자 고액 전세대출 등으로의 구체적 확대 방안은 확정되지
        않았다고 설명했고, 2026년 가계부채 관리방안에서도 DSR 적용대상 확대를 향후 과제로 밝혔습니다.
      </P>
      <H3>정책 목적 전세대출</H3>
      <P>
        공식 FAQ는 버팀목 전세대출과 은행·지방자치단체 협약 전세대출 등을 적용 대상에서 제외합니다. 보증기관이
        붙는다는 사실만으로 판단하지 말고, 대출 상품이 정책 목적 상품인지 은행에 확인해야 합니다.
      </P>
      <H3>기존 계약과 연장</H3>
      <P>
        2025년 10월 28일까지 해당 주택의 최초 임대차계약을 체결했다면 종전 규정을 적용합니다. 시행 전에 받은
        전세대출을 같은 집에서 증액 없이 연장하는 경우도 원칙적으로 미적용이지만, 연장 때 금액을 늘리면 신규대출로
        보아 적용될 수 있습니다. 계약일·접수일·증액 여부를 증빙할 서류를 준비하세요.
      </P>

      <H2 id="checklist">은행 상담 전 체크리스트</H2>
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <ul className="space-y-3 text-[15px] text-gray-700">
          <li>□ 본인과 배우자를 포함한 주택 보유 수를 확인했다.</li>
          <li>□ 새 전셋집이 수도권 또는 현재 규제지역에 있는지 확인했다.</li>
          <li>□ 버팀목·지자체 협약 등 정책 목적 상품인지 상품설명서에서 확인했다.</li>
          <li>□ 최초 임대차계약일, 대출 접수일, 기존 대출 실행일을 정리했다.</li>
          <li>□ 연장이라면 증액 여부와 은행의 신규대출 판단 기준을 물었다.</li>
          <li>□ 예상 대출금 × 최종 적용금리로 연 이자를 계산했다.</li>
          <li>□ 기존 모든 대출의 연 원리금과 합쳐 전체 DSR을 다시 계산했다.</li>
        </ul>
      </div>
      <P>
        전세대출 상품과 보증기관 선택은
        {' '}<Link href="/guide/jeonse-loan" className="font-semibold text-indigo-600 hover:underline">전세대출 가이드</Link>,
        전세대출 보증과 보증금 반환보증의 차이는
        {' '}<Link href="/guide/loan-guarantee" className="font-semibold text-indigo-600 hover:underline">대출 보증보험 가이드</Link>에서
        이어서 확인할 수 있습니다.
      </P>
      <Callout tone="amber">
        이 페이지는 공식 발표를 이해하기 위한 참고 안내입니다. 규제지역 지정, DSR 적용대상, 은행 내부 심사와
        인정소득 기준은 신청 시점에 달라질 수 있으므로 계약 전에 금융회사와 금융위원회 최신 공지를 확인하세요.
      </Callout>

      <HubBacklink hub="dsr-guide" />
    </GuideLayout>
  )
}
