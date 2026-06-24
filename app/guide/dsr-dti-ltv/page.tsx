import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: 'DTI란? DSR·DTI·LTV 뜻과 차이 완전 정리 | ohyess 가이드',
  description:
    'DTI란 무엇인지, DSR과 DTI의 차이는 무엇인지, LTV 뜻까지 대출 한도를 결정하는 3가지 지표를 공식과 실전 사례로 완전 정리합니다. LTV는 남는데 DSR에서 막히는 이유도 설명합니다.',
  openGraph: {
    title: 'DTI란? DSR·DTI·LTV 뜻과 차이 완전 정리',
    description: 'DTI·DSR·LTV 뜻과 차이, 실제 대출 한도를 먼저 막는 지표가 무엇인지 사례로 정리',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/dsr-dti-ltv',
  },
}

const tocItems = [
  { id: 'ltv', label: 'LTV란? — 담보 가치 기준 대출 한도' },
  { id: 'dti', label: 'DTI란 무엇인가?' },
  { id: 'dsr', label: 'DSR이란? — 가장 강력한 대출 규제' },
  { id: 'dsr-vs-dti', label: 'DSR과 DTI의 차이' },
  { id: 'ltv-ok-dsr-blocked', label: 'LTV는 남는데 DSR에서 막히는 이유' },
  { id: 'which-blocks-first', label: '실제 한도를 먼저 막는 것은?' },
  { id: 'cases', label: '실전 사례' },
  { id: 'strategy', label: '현실적 대출 전략' },
]

const ctas = [
  {
    label: 'DSR 계산기',
    href: '/calculator/dsr-dti-ltv',
    description: '내 소득·대출 조건으로 DSR·DTI·LTV 즉시 계산',
  },
  {
    label: '대출 한도 시뮬레이터',
    href: '/calculator/loan-limit',
    description: '소득·부채·담보 입력으로 실제 한도 즉시 확인',
  },
]

const relatedGuides = [
  {
    title: '연봉 5,000만원 신용대출 3,000만원 있으면 주담대 한도는?',
    href: '/guide/mortgage-salary-5000',
    description: '신용대출 월 납입액별·금리별 주담대 한도 실전 비교',
  },
  {
    title: 'LTV는 남는데 DSR에서 막히는 이유',
    href: '/guide/ltv-ok-dsr-blocked',
    description: 'LTV와 DSR이 각각 어떻게 대출 한도를 제한하는지 사례로 설명',
  },
  {
    title: '자동차 할부 월 50만원, 주담대 한도가 얼마나 줄어들까?',
    href: '/guide/car-loan-dsr-impact',
    description: '자동차 할부가 DSR에 미치는 영향과 한도 감소 계산',
  },
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '상환방식·금리 유형별 이자 계산법 실전 정리',
  },
]

const faqs = [
  {
    question: 'DSR 40%가 정확히 무슨 뜻인가요?',
    answer:
      '연소득 대비 모든 금융권 대출(주택담보·신용·카드론·마이너스통장 등)의 연간 원리금 상환 합계가 40%를 넘으면 추가 대출이 불가하다는 의미입니다. 예를 들어 연봉 6천만원이라면 연간 원리금 상환 총액이 2,400만원(월 200만원)을 초과할 수 없습니다.',
  },
  {
    question: 'DTI란 무엇이고 DSR과 어떻게 다른가요?',
    answer:
      'DTI(총부채상환비율)는 신규 주담대 원리금에 기타 대출 이자만 더해 소득과 비교합니다. DSR(총부채원리금상환비율)은 기타 대출도 원리금 전액을 포함합니다. 따라서 신용대출·자동차 할부가 있는 경우 DSR이 DTI보다 높게 나오며, 실질적으로 DSR이 더 엄격한 기준입니다.',
  },
  {
    question: 'LTV가 충분한데 왜 대출이 적게 나오나요?',
    answer:
      'LTV는 집값 기준 상한선을 정하고, DSR은 소득 기준 상한선을 정합니다. 두 가지를 모두 충족해야 하므로 실제 한도는 둘 중 더 낮은 금액이 됩니다. 소득에 비해 기존 대출이 많으면 LTV가 넉넉해도 DSR에서 막힙니다.',
  },
  {
    question: '전세자금대출도 DSR에 포함되나요?',
    answer:
      '보증기관(HUG·SGI·HF) 보증 전세자금대출은 DSR 산정에서 제외됩니다. 다만 개인 전세대출(비보증)은 DSR에 포함될 수 있습니다. 본인 대출의 보증 여부를 금융사에서 확인하는 것이 좋습니다.',
  },
  {
    question: '마이너스통장도 DSR 계산에 들어가나요?',
    answer:
      '네, 마이너스통장(한도대출)도 DSR에 포함됩니다. 실제 사용 잔액이 아닌 약정 한도 전체가 포함되는 경우가 많아, 사용하지 않아도 DSR을 높이는 주범이 됩니다. 마이너스통장 한도를 줄이거나 해지하면 DSR 여유분이 늘어 주담대 한도를 높일 수 있습니다.',
  },
  {
    question: '자영업자는 소득을 어떻게 인정받나요?',
    answer:
      '자영업자는 종합소득세 신고 소득(사업소득)을 기준으로 합니다. 신고 소득이 낮으면 DSR 계산 시 불리합니다. 일부 은행은 카드매출·매입세금계산서 등을 활용한 추정 소득을 인정하기도 합니다. 최소 1~2년치 소득 신고 이력이 있어야 심사에 유리합니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-20"
    >
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

function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
  )
}

function CaseBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 border-l-4 border-blue-400 rounded-r-lg p-5 mb-6">
      <p className="font-semibold text-gray-900 mb-3 text-[15px]">{title}</p>
      {children}
    </div>
  )
}

export default function DsrDtiLtvGuidePage() {
  return (
    <GuideLayout
      title="DTI란? DSR·DTI·LTV 뜻과 차이 — 대출 한도를 결정하는 3가지 지표 완전 정리"
      description="DTI란 무엇인지, DSR과 DTI의 차이는 무엇인지, LTV 뜻까지 대출 한도를 결정하는 3가지 지표를 공식과 실전 계산 사례로 완전히 정리합니다. LTV는 남는데 DSR에서 막히는 이유도 설명합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 6월"
      publishedAt="2026년 3월"
      reviewedAt="2026년 6월"
      referenceDate="2026년 6월 기준"
      appliesTo="주택담보대출·신용대출·DSR 규제 적용 대출"
      sources={[
        { label: '금융위원회 — DSR 규제 고시', href: 'https://www.korea.kr/policy/financialView.do?newsId=148930490' },
        { label: '금융감독원 — 가계대출 건전성 관리', href: 'https://www.fss.or.kr/fss/main/contents.do?menuNo=200465' },
      ]}
    >
      <H2 id="ltv">LTV란? — 담보 가치 기준 대출 한도</H2>
      <P>
        LTV(Loan To Value, 담보인정비율)는 담보물 감정가 대비 대출 가능 금액의 비율입니다.
        주택담보대출에서 가장 먼저 확인하는 한도 지표입니다.
      </P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        LTV = 대출금액 ÷ 담보물 감정가 × 100(%)
      </div>
      <P>
        예를 들어 10억짜리 아파트를 담보로 LTV 70%까지 인정된다면 최대 7억까지 빌릴 수
        있습니다. 다만 규제 지역과 주택 보유 수에 따라 LTV 한도가 달라집니다.
      </P>
      <H3>규제 지역별 주요 LTV 한도 (2024년 기준)</H3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">구분</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">무주택자</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">1주택자</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-3 text-gray-900">투기과열지구</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">40~50%</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">30~40%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-gray-900">조정대상지역</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">50~60%</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">40~50%</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3 text-gray-900">비규제지역</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-blue-700 font-semibold">70%</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-blue-700 font-semibold">60~70%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        LTV는 정부 부동산 정책에 따라 수시로 변경됩니다. 대출 신청 전 반드시 현재 기준을
        확인해야 하며, 선순위 채권(기존 담보대출 잔액)이 있으면 그만큼 차감됩니다.
      </P>

      <H2 id="dti">DTI란 무엇인가? — 소득 대비 연간 원리금 상환 비율</H2>
      <P>
        DTI(Debt To Income, 총부채상환비율)는 연소득 대비 해당 주택담보대출의 연간 원리금
        상환액과 기타 대출 이자의 합산 비율입니다.
      </P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        DTI = (해당 주담대 연 원리금 + 기타 대출 연 이자) ÷ 연소득 × 100(%)
      </div>
      <P>
        DTI는 DSR보다 범위가 좁습니다. 해당 주담대의 원리금은 전액 반영하지만, 기타 대출은
        이자만 반영합니다. 이 때문에 DSR이 도입된 이후에도 병행 적용됩니다.
      </P>
      <P>
        수도권 DTI 규제는 통상 40~50% 수준이며, 비규제 지역은 60~70%까지 허용됩니다. DTI
        한도 내에서도 DSR 40%를 동시에 충족해야 하므로 둘 중 더 엄격한 기준이 실질적으로
        적용됩니다.
      </P>

      <H2 id="dsr">DSR이란? — 모든 금융권 대출의 원리금을 합산하는 가장 강력한 규제</H2>
      <P>
        DSR(Debt Service Ratio, 총부채원리금상환비율)은 현재 가장 핵심적인 대출 규제 지표입니다.
        주담대뿐만 아니라 신용대출·카드론·마이너스통장·자동차 할부 등 모든 금융권 대출의 연간
        원리금을 합산해 소득 대비 비율을 계산합니다.
      </P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        DSR = 모든 대출 연간 원리금 합산 ÷ 연소득 × 100(%)
      </div>
      <P>
        2023년 이후 1금융권(은행)은 DSR 40%, 2금융권(저축은행·캐피탈 등)은 50% 한도가
        적용됩니다. DSR을 초과하면 사실상 추가 대출이 불가능합니다.
      </P>
      <H3>DSR 계산에 포함되는 항목</H3>
      <Ul>
        <li>주택담보대출 원리금</li>
        <li>신용대출·개인사업자 대출 원리금</li>
        <li>카드론·리볼빙 원리금</li>
        <li>마이너스통장(약정 한도 × 일정 비율)</li>
        <li>자동차 할부금·학자금 대출 원리금</li>
      </Ul>
      <P>
        전세자금대출(보증기관 보증 시)과 햇살론·새희망홀씨 등 일부 정책 서민 대출은 DSR
        산정에서 제외됩니다. 이 점을 활용해 정책 대출을 먼저 받고 은행 대출 여력을 확보하는
        전략도 있습니다.
      </P>

      <H2 id="dsr-vs-dti">DSR과 DTI의 차이는 무엇인가?</H2>
      <P>
        DSR과 DTI는 모두 소득 대비 부채 비율을 측정하지만, 기타 대출을 처리하는 방식이 다릅니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">구분</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">분자 (상환 부담)</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">규제 한도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-3 font-semibold text-blue-700">DTI</td>
              <td className="border border-gray-200 px-4 py-3 text-gray-700">주담대 원리금 + <strong>기타 대출 이자만</strong></td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">수도권 50%, 지방 60%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 font-semibold text-indigo-700">DSR</td>
              <td className="border border-gray-200 px-4 py-3 text-gray-700">모든 대출 <strong>원리금 전액</strong> (신용·할부 포함)</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">1금융 40%, 2금융 50%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        핵심 차이는 기타 대출의 반영 범위입니다. DTI는 기타 대출의 이자만 반영하지만,
        DSR은 기타 대출의 <strong>원금까지 포함한 전체 원리금</strong>을 반영합니다.
        신용대출·자동차 할부가 있는 경우 DSR이 DTI보다 훨씬 높게 나오는 이유입니다.
      </P>
      <P>
        실질적으로 더 엄격한 기준은 DSR입니다. 대부분의 경우 DSR 40%가 DTI보다 먼저 걸리며,
        두 기준을 모두 충족해야 대출이 승인됩니다.
      </P>

      <H2 id="ltv-ok-dsr-blocked">LTV는 남는데 DSR에서 막히는 이유</H2>
      <P>
        "LTV 70%면 3.5억은 빌릴 수 있다고 했는데 실제 심사에서 1.8억밖에 안 나왔다"는 경우가
        많습니다. 이것은 LTV와 DSR이 각각 다른 축에서 대출 한도를 제한하기 때문입니다.
      </P>
      <Ul>
        <li><strong>LTV는 담보(집값)를 기준</strong>으로 최대 빌릴 수 있는 금액의 상한선을 제시합니다.</li>
        <li><strong>DSR은 소득을 기준</strong>으로 매달 갚을 수 있는 원리금의 상한선을 제시합니다.</li>
      </Ul>
      <P>
        실제 대출 한도는 이 두 기준을 모두 충족하는 금액, 즉 <strong>LTV 한도와 DSR 한도 중
        더 낮은 금액</strong>이 됩니다.
      </P>
      <CaseBox title="사례 — 집값 5억, LTV 충분하지만 DSR에서 막히는 경우">
        <Ul>
          <li>집값: 5억원 / 비규제지역 LTV 70% 적용 → LTV 기준 최대 <strong>3억 5천만원</strong></li>
          <li>연봉: 4,000만원</li>
          <li>기존 신용대출 월 납입 40만원 + 자동차 할부 월 35만원 = 기존 월 원리금 <strong>75만원</strong></li>
        </Ul>
        <P>
          DSR 40% 허용 월 원리금: 4,000만원 × 40% ÷ 12 = 133.3만원<br />
          주담대에 쓸 수 있는 월 원리금: 133.3 - 75 = <strong>58.3만원</strong><br />
          금리 4%, 30년 기준 주담대 최대 한도: <strong>약 1억 2,200만원</strong>
        </P>
        <P>
          LTV로는 3.5억이 가능하지만 DSR 기준으로는 1.2억밖에 안 됩니다.
          기존 부채(신용대출 + 자동차 할부)가 DSR 여유분을 대부분 소진했기 때문입니다.
        </P>
      </CaseBox>

      <H2 id="which-blocks-first">DSR·DTI·LTV 중 실제 대출 한도를 먼저 막는 것은?</H2>
      <P>
        결론부터 말하면, 대부분의 경우 <strong>DSR이 가장 먼저 한도를 제한합니다.</strong>
      </P>
      <Ul>
        <li>DSR 40%는 지역·주택 유형과 무관하게 1억 초과 대출 전체에 무조건 적용됩니다.</li>
        <li>LTV는 비규제지역 70%까지 허용돼 여유가 있는 경우가 많습니다.</li>
        <li>DTI는 기타 대출 반영 범위가 좁아 대체로 DSR보다 낮게 나옵니다.</li>
      </Ul>
      <P>
        예외가 있습니다. 투기과열지구처럼 LTV가 40%까지 낮아지는 규제 지역에서는 소득이 높아
        DSR에 여유가 있어도 LTV가 먼저 한도를 제한할 수 있습니다. 고가 주택(9억 초과)에서는
        LTV 규제가 더 촘촘하게 적용됩니다.
      </P>
      <P>
        실무에서는 세 가지를 모두 계산해보고, 가장 낮은 한도를 제시하는 지표를 따라야 합니다.
        DSR 계산기로 소득 기준 한도를 먼저 확인한 뒤 LTV와 비교하는 순서가 효율적입니다.
      </P>

      <H2 id="cases">실전 사례: DSR로 실제 대출 한도 계산하기</H2>
      <CaseBox title="사례 1 — 연봉 5천만원 직장인, 아파트 주담대 신청">
        <P>직장인 C씨(연봉 5천만원)는 기존 신용대출 3천만원(월 납입 90만원)이 있는 상태에서 아파트 구입을 위해 주담대를 신청했습니다.</P>
        <Ul>
          <li>DSR 40% 한도: 5천만원 × 40% = 연 2,000만원 = 월 166.7만원</li>
          <li>기존 신용대출 월 원리금: 90만원</li>
          <li>주담대에 할당 가능한 월 원리금: 166.7 - 90 = 76.7만원</li>
          <li>연 3.5%, 30년 기준 주담대 한도: 약 1억 6,800만원</li>
        </Ul>
        <P>
          신용대출이 없었다면 월 166.7만원을 전부 주담대에 쓸 수 있어 약 3억 7천만원까지
          빌릴 수 있었습니다. 기존 부채가 대출 한도에 미치는 영향이 얼마나 큰지 보여주는
          사례입니다.
        </P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 D씨, 종합소득세 신고 소득으로 DSR 계산">
        <P>
          연 매출 2억의 자영업자 D씨는 종합소득세 신고 소득이 5천만원입니다. 기존 사업자
          대출 5천만원(월 원리금 85만원)이 있습니다.
        </P>
        <Ul>
          <li>인정 소득: 종소세 신고 소득 5천만원 (매출 아님)</li>
          <li>DSR 40% 한도: 월 166.7만원</li>
          <li>기존 사업자 대출 월 원리금: 85만원</li>
          <li>추가 대출 가능 월 원리금: 81.7만원</li>
          <li>연 5%, 20년 기준 추가 한도: 약 1억 200만원</li>
        </Ul>
        <P>
          자영업자는 매출이 높아도 세금 신고 소득이 낮으면 DSR 계산에서 불리합니다. 대출
          신청 전 2~3년치 소득 신고 실적을 쌓고 신고 소득을 현실화하는 것이 한도를 늘리는
          근본적인 방법입니다.
        </P>
      </CaseBox>

      <H2 id="strategy">규제를 고려한 현실적 대출 전략</H2>
      <H3>1. 마이너스통장 한도부터 줄여라</H3>
      <P>
        마이너스통장은 실제 잔액이 0원이어도 DSR 계산에 한도의 일정 비율(통상 2~3%를 월
        상환액으로 계산)이 반영됩니다. 사용하지 않는 마이너스통장 한도를 줄이거나 해지하면
        DSR 여유분이 생겨 주담대 한도를 늘릴 수 있습니다.
      </P>
      <H3>2. 비규제 지역 물건은 LTV 여유 활용</H3>
      <P>
        투기과열지구의 LTV 40%와 달리 비규제 지역은 70%까지 가능합니다. 같은 가격의 아파트라도
        비규제 지역이라면 훨씬 큰 레버리지를 쓸 수 있습니다. 단, DSR 한도는 지역에 관계없이
        동일하게 적용됩니다.
      </P>
      <H3>3. 정책 대출로 DSR 여유분 확보</H3>
      <P>
        청년·신혼부부 대상 정책 대출(특례보금자리론·디딤돌대출 등)은 DSR 산정에서 제외되거나
        별도 기준이 적용됩니다. 자격 요건에 해당된다면 정책 대출을 먼저 활용해 이자 부담을
        낮추고 DSR 여유분을 남겨두는 전략이 유효합니다.
      </P>
    </GuideLayout>
  )
}
