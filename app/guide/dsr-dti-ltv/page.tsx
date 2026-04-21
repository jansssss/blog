import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: 'DSR·DTI·LTV 완전 정리 — 대출 한도 결정의 3가지 지표 | ohyess 가이드',
  description:
    'LTV(담보인정비율)·DTI(총부채상환비율)·DSR(총부채원리금상환비율)이 실제 대출 한도에 어떤 영향을 미치는지 공식과 실전 사례로 완전히 정리합니다.',
  openGraph: {
    title: 'DSR·DTI·LTV 완전 정리',
    description: '대출 한도를 결정하는 3가지 핵심 지표를 실전 사례로 완전 정리',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/dsr-dti-ltv',
  },
}

const tocItems = [
  { id: 'ltv', label: 'LTV — 담보물 가치 대비 대출 한도' },
  { id: 'dti', label: 'DTI — 소득 대비 연간 원리금 비율' },
  { id: 'dsr', label: 'DSR — 모든 대출의 총부채 원리금 비율' },
  { id: 'cases', label: '실전 사례: DSR로 대출 한도 계산하기' },
  { id: 'strategy', label: '규제를 고려한 현실적 대출 전략' },
]

const ctas = [
  {
    label: '대출 한도 시뮬레이터',
    href: '/calculator/loan-limit',
    description: '소득·부채·담보 입력으로 실제 한도 즉시 확인',
  },
]

const relatedGuides = [
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '상환방식·금리 유형별 이자 계산법 실전 정리',
  },
  {
    title: '상환방식 완전 비교',
    href: '/guide/repayment-types',
    description: '원리금균등·원금균등·만기일시 총이자 비교',
  },
  {
    title: '신용점수 완전 정리',
    href: '/guide/credit-score',
    description: '신용점수 올리는 현실적인 방법과 금리 영향',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인해야 할 항목',
  },
]

const faqs = [
  {
    question: 'DSR 40%가 정확히 무슨 뜻인가요?',
    answer:
      '연소득 대비 모든 금융권 대출(주택담보·신용·카드론·마이너스통장 등)의 연간 원리금 상환 합계가 40%를 넘으면 추가 대출이 불가하다는 의미입니다. 예를 들어 연봉 6천만원이라면 연간 원리금 상환 총액이 2,400만원(월 200만원)을 초과할 수 없습니다.',
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
  {
    question: 'LTV가 70%라면 5억짜리 아파트를 얼마까지 빌릴 수 있나요?',
    answer:
      '단순 계산으로는 5억 × 70% = 3.5억입니다. 그러나 실제로는 ①규제지역 여부(투기지역·투기과열지구·조정대상지역별 LTV 상이), ②무주택·1주택·다주택 여부, ③DSR 한도 여유분에 따라 3.5억보다 낮게 결정될 수 있습니다. LTV와 DSR 두 가지 모두 충족해야 합니다.',
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
      title="DSR·DTI·LTV 완전 정리 — 대출 한도를 결정하는 3가지 핵심 지표"
      description="LTV(담보인정비율), DTI(총부채상환비율), DSR(총부채원리금상환비율)이 실제 대출 한도에 어떤 영향을 미치는지, 공식과 실전 계산 사례로 완전히 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <H2 id="ltv">LTV — 담보물 가치 대비 대출 가능 금액</H2>
      <P>
        LTV(Loan To Value, 담보인정비율)는 담보물 감정가 대비 대출 가능 금액의 비율입니다.
        주택담보대출에서 가장 먼저 작용하는 한도 지표입니다.
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
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                구분
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">
                무주택자
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">
                1주택자
              </th>
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
              <td className="border border-gray-200 px-4 py-3 text-center text-blue-700 font-semibold">
                70%
              </td>
              <td className="border border-gray-200 px-4 py-3 text-center text-blue-700 font-semibold">
                60~70%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        LTV는 정부 부동산 정책에 따라 수시로 변경됩니다. 대출 신청 전 반드시 현재 기준을
        확인해야 하며, 선순위 채권(기존 담보대출 잔액)이 있으면 그만큼 차감됩니다.
      </P>

      <H2 id="dti">DTI — 소득 대비 연간 원리금 상환 비율</H2>
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

      <H2 id="dsr">DSR — 모든 금융권 대출의 총부채 원리금 비율</H2>
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
