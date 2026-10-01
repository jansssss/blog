import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import EarlyRepaymentWidget from './EarlyRepaymentWidget'
import HubBacklink from '@/components/HubBacklink'

export const metadata: Metadata = {
  title: '중도상환수수료 계산·면제 조건 — 2026년 적용 기준 | ohyess',
  description:
    '계약 수수료율과 대출 실행일로 기간 체감 수수료를 계산하세요. 2025년 실비용 개편과 2026년 상호금융 적용, 면제일 확인 순서를 정리합니다.',
  openGraph: {
    title: '중도상환수수료 계산·면제 조건 — 2026년 기준',
    description: '계약 수수료율·실행일·부과기간으로 실제 수수료를 확인하는 순서',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/early-repayment-fee',
  },
}

const fscReformUrl = 'https://www.fsc.go.kr/po010102/83833'
const fscMutualFinanceUrl = 'https://www.fsc.go.kr/no010101/85455'
const hfFormsUrl = 'https://www.hf.go.kr/ko/sub04/sub04_10_01.do?article.offset=0&articleLimit=10&articleNo=600477&mode=view'

const tocItems = [
  { id: 'answer', label: '즉답: 계약서의 세 숫자부터 확인' },
  { id: 'what-is', label: '중도상환수수료란 무엇인가' },
  { id: 'formula', label: '수수료 계산 공식과 실제 금액' },
  { id: 'exemptions', label: '수수료 면제되는 조건' },
  { id: 'cases', label: '실전 사례 2개' },
  { id: 'decision', label: '중도상환 vs 유지 — 손익 판단법' },
]

const ctas = [
  {
    label: '중도상환수수료 계산기',
    href: '/calculator/prepayment-fee',
    description: '잔액·금리·잔여기간으로 수수료 즉시 계산',
  },
  {
    label: '대출 갈아타기 손익 계산기',
    href: '/calculator/refinancing',
    description: '수수료 빼고 실제 갈아타기 이득 계산',
  },
  {
    label: '중도상환 vs 유지 비교 계산기',
    href: '/calculator/prepayment-comparison',
    description: '중도상환 절감액과 수수료를 비교해 최적 선택',
  },
]

const relatedGuides = [
  {
    title: '대출 청약철회권 14일',
    href: '/guide/loan-cooling-off',
    description: '대출 실행 직후라면 일반 중도상환과 비용·기록 비교',
  },
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '이자 계산 공식과 금리 유형별 차이 정리',
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
    question: '중도상환수수료는 얼마나 되나요?',
    answer:
      '고정된 업권 평균을 내 계약에 적용하면 안 됩니다. 중도상환금액, 계약 수수료율, 수수료 부과기간 중 남은 비율을 곱해 계산하며 금융회사와 계약 시점별로 다릅니다. 금융기관 앱의 오늘자 중도상환예상금액을 최종값으로 사용하세요.',
  },
  {
    question: '3년 경과 후에는 수수료가 없다고 하던데, 모든 대출이 그런가요?',
    answer:
      '모든 대출에 같은 문구를 적용할 수는 없습니다. 금융소비자보호법 적용 대출은 원칙적으로 수수료 부과가 금지되지만 대출일부터 3년 이내 상환 등에는 예외가 있습니다. 계약 시점, 상품, 적용 법령이 다를 수 있으므로 계약서의 부과 종료일을 확인해야 합니다.',
  },
  {
    question: '연간 부분 중도상환 한도 내에서는 수수료가 없다는 게 사실인가요?',
    answer:
      '상품별 약정에 그런 한도가 있을 수 있지만 공통 규칙은 아닙니다. “연간 몇 % 면제”가 계약서나 상품설명서에 적혀 있는지 확인하고, 한도 산정 기준이 최초 원금인지 현재 잔액인지도 함께 확인하세요.',
  },
  {
    question: '대환대출을 하면 기존 대출에 중도상환수수료가 붙나요?',
    answer:
      '네, 대환대출은 기존 대출을 중도에 상환하는 것이므로 중도상환수수료가 발생합니다. 대환 절감 이자 > 중도상환수수료인 경우에만 대환이 유리합니다. 금리 차이가 크더라도 잔여 기간이 짧거나 대출 잔액이 적다면 손익분기점을 먼저 계산해야 합니다.',
  },
  {
    question: '중도상환수수료를 아예 안 내는 방법이 있나요?',
    answer:
      '계약상 부과기간이 끝난 뒤 상환하거나, 상품에 명시된 무수수료 부분상환 한도를 활용하거나, 처음부터 수수료가 없는 상품을 선택하는 방법이 있습니다. 다만 기다리는 동안 내는 추가 이자가 줄어드는 수수료보다 클 수 있으므로 면제일까지 무조건 기다리면 안 됩니다.',
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

export default function EarlyRepaymentFeeGuidePage() {
  return (
    <GuideLayout
      pageUrl="/guide/early-repayment-fee"
      title="중도상환수수료 계산·면제 조건 — 2026년 적용 기준"
      description="계약 수수료율·대출 실행일·부과기간으로 기간 체감 수수료를 계산하고, 기다릴지 지금 갚을지 판단하는 순서를 확인하세요."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 10월 1일"
      publishedAt="2026년 4월"
      reviewedAt="2026년 10월 1일"
      referenceDate="2026년 10월 1일 확인 · 2025년 실비용 개편·2026년 상호금융 적용"
      appliesTo="은행·저축은행·보험사 및 2026년 이후 취급 상호금융 대출"
      sources={[
        { label: '금융위원회 — 2025년 중도상환수수료 실비용 개편', href: fscReformUrl },
        { label: '금융위원회 — 2026년 상호금융권 적용', href: fscMutualFinanceUrl },
        { label: '한국주택금융공사 — 보금자리론 신청 서식(2026.8.20)', href: hfFormsUrl },
      ]}
    >
      <section id="answer" className="scroll-mt-20 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 mb-6">
        <h2 className="mb-3 text-lg font-bold text-indigo-950">먼저 계약서에서 “중도상환 금액·수수료율·부과 종료일” 세 값을 확인하세요.</h2>
        <P>
          기간 체감식이면 <strong>중도상환금액 × 계약 수수료율 × 남은 부과기간 비율</strong>로 추정합니다.
          남은 대출 만기가 아니라 수수료 부과기간의 남은 비율을 써야 합니다. 2025년 1월 13일 이후 적용 대상 신규 계약은
          실비용 안에서만 수수료를 산정하고, 농협·수협·산림조합 등 상호금융은 2026년 1월 1일 이후 취급분부터 같은 원칙이 적용됩니다.
        </P>
        <div className="rounded-xl border border-indigo-100 bg-white p-4 text-sm leading-relaxed text-gray-700">
          <strong>가장 정확한 확인법:</strong> 금융기관 앱에서 오늘자 “중도상환예상금액”을 조회하고, 수수료·말소비용·대환 부대비용을 각각 분리해 기록합니다.
        </div>
      </section>
      <H2 id="what-is">중도상환수수료란 무엇인가</H2>
      <P>
        중도상환수수료는 대출 만기 전에 일부 또는 전액을 상환할 때 계약에 따라 부과될 수 있는 비용입니다.
        다만 금융소비자보호법 체계에서는 원칙적으로 수수료 부과가 금지되고, 대출일부터 3년 이내 상환 등 예외 범위에서만 허용됩니다.
      </P>
      <P>
        2025년 개편 이후 적용 대상 신규 계약은 자금운용 차질에 따른 손실비용과 대출 관련 행정·모집비용 등
        실제 비용 안에서만 수수료를 산정합니다. 금융회사는 이를 매년 재산정해 협회 홈페이지에 공시합니다.
      </P>
      <P>
        따라서 인터넷의 “보통 몇 %”를 그대로 넣기보다 내 계약의 수수료율과 부과기간을 확인해야 합니다.
        같은 금융회사라도 주담대·신용대출, 고정·변동금리, 계약 연도에 따라 다를 수 있습니다.
      </P>

      <H2 id="formula">수수료 계산 공식과 실제 금액</H2>
      <P>중도상환수수료의 계산 방식은 금융사마다 다르지만, 가장 일반적인 공식은 다음과 같습니다.</P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        중도상환수수료 = 중도상환 금액 × 계약 수수료율 × (남은 수수료 부과기간 / 전체 수수료 부과기간)
      </div>
      <P>
        여기서 “남은 수수료 부과기간”은 남은 대출 만기와 다릅니다. 계약서에 3년 체감식으로 적혀 있다면
        대출 실행일부터 3년까지의 남은 일수를 사용합니다. 상품에 체감식이 없거나 별도 면제 규정이 있다면 계약 산식이 우선합니다.
      </P>
      <H3>실제 계산 예시</H3>
      <Ul>
        <li>중도상환 금액: 1억원 / 계약 수수료율 0.6% / 부과기간 3년</li>
        <li>대출 실행 후 1년 경과 → 남은 부과기간 비율 2년 ÷ 3년</li>
        <li>추정 수수료 = 1억원 × 0.6% × (2/3) = 400,000원</li>
      </Ul>
      <P>
        실제 계약은 날짜 단위로 계산하고 윤년·상환일 처리도 달라질 수 있습니다. 계산기 결과와 금융기관 앱의 상환예상금액을 대조하세요.
      </P>

      <H2 id="exemptions">수수료가 면제되는 조건</H2>
      <P>
        모든 중도상환에 수수료가 붙는 것은 아닙니다. 다만 아래 조건은 상품별 약정이 우선입니다.
      </P>
      <H3>1. 계약상 수수료 부과기간이 끝난 뒤 상환</H3>
      <P>
        계약서의 부과 종료일 이후에는 해당 계약의 중도상환수수료가 0원이 되는지 확인합니다.
        법령상 3년 예외 범위와 내 계약의 실제 종료일을 같은 것으로 단정하지 말고 앱의 예상금액으로 재확인하세요.
      </P>
      <H3>2. 상품에 적힌 무수수료 부분상환 한도 활용</H3>
      <P>
        일부 상품은 연간 일정 금액이나 비율까지 수수료 없이 부분상환할 수 있습니다.
        공통 한도가 아니므로 최초 원금 기준인지 현재 잔액 기준인지, 한도 갱신일이 언제인지 계약서에서 확인하세요.
      </P>
      <H3>3. 상품·정책에 따른 면제</H3>
      <Ul>
        <li>정책금융상품의 별도 면제 또는 감면 조건</li>
        <li>금융회사가 공시한 무수수료 상품이나 이벤트 조건</li>
        <li>약관에 구체적으로 적힌 예외 사유가 발생한 경우</li>
      </Ul>

      <EarlyRepaymentWidget />

      <H2 id="cases">실전 사례로 확인하는 중도상환 손익</H2>
      <CaseBox title="사례 1 — 직장인 G씨: 주담대 1.5억 잔액, 실행 1년 후 대환 검토">
        <P>
          G씨는 1년 전 연 5.5%로 받은 주담대 잔액이 1.5억원 남아 있습니다(잔여기간 17년).
          계약 수수료율은 0.65%, 부과기간은 3년이고 다른 은행에서 연 3.8% 대환을 제안받았습니다.
        </P>
        <Ul>
          <li>중도상환수수료 추정: 1.5억 × 0.65% × (2년/3년) = 650,000원</li>
          <li>같은 17년 원리금균등 가정의 월납입 차이: 약 134,000원</li>
          <li>수수료만 본 손익분기점: 650,000 ÷ 134,000 ≒ 5개월</li>
        </Ul>
        <P>
          이 계산에는 새 대출의 인지세·근저당 설정·말소비용과 금리 변동 조건이 빠져 있습니다.
          실제 손익분기점은 모든 부대비용을 더하고 금융기관의 상환예상금액으로 다시 계산해야 합니다.
        </P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 H씨: 신용대출 4천만원 잔액, 부과기간 1년 남음">
        <P>
          H씨는 연 8.5% 신용대출 잔액이 4천만원이고 잔여 기간이 2년입니다.
          계약 수수료율은 0.5%, 3년 부과기간 중 1년이 남았습니다.
          사업 수익금 4천만원이 생겨 전액 중도상환을 고민 중입니다.
        </P>
        <Ul>
          <li>중도상환수수료 추정: 4천만원 × 0.5% × (1년/3년) ≒ 66,667원</li>
          <li>남은 2년 이자(원리금균등 재계산 참고값): 약 3,637,000원</li>
          <li>상환 후 비상자금과 사업 운전자금을 별도로 남길 수 있는지 확인</li>
        </Ul>
        <P>
          수수료만 보면 상환 쪽이 유리해 보이지만, 사업자는 현금 부족으로 다시 고금리 자금을 빌리면 절감 효과가 사라질 수 있습니다.
          실제 상환예상금액과 최소 운전자금을 함께 놓고 결정해야 합니다.
        </P>
      </CaseBox>

      <H2 id="decision">중도상환 vs 유지 — 현실적인 손익 판단법</H2>
      <P>
        중도상환 여부를 결정하는 핵심 공식은 하나입니다.
      </P>
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-5 text-[15px] text-gray-700">
        <strong className="font-semibold">잔여 이자 절감액 &gt; 중도상환수수료</strong>이면 상환,
        그렇지 않으면 유지
      </div>
      <H3>중도상환이 유리한 경우</H3>
      <Ul>
        <li>고금리 신용대출처럼 이자 부담이 큰 경우</li>
        <li>잔여기간이 충분히 남아 이자 절감 효과가 클 경우</li>
        <li>여윳돈의 대안 운용처(예금·투자)보다 대출 금리가 높은 경우</li>
        <li>심리적 부채 부담 해소가 중요한 경우</li>
      </Ul>
      <H3>유지가 나을 수 있는 경우</H3>
      <Ul>
        <li>잔여기간이 1년 이하로 이자 절감액이 수수료보다 작은 경우</li>
        <li>여윳돈을 더 높은 수익률 투자에 활용할 수 있는 경우</li>
        <li>유동성(비상자금)을 유지하는 것이 현실적으로 더 중요한 경우</li>
      </Ul>
      <P>
        중도상환 vs 유지 비교 계산기를 활용하면 본인 상황에서 수수료와 잔여 이자 절감액을
        즉시 비교할 수 있습니다.
      </P>
      <HubBacklink hub="refinancing-guide" />
    </GuideLayout>
  )
}
