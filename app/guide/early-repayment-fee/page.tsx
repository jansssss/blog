import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: '중도상환수수료 완전 정리 — 계산 공식·면제 조건·절약 전략 | ohyess 가이드',
  description:
    '대출을 만기 전에 갚을 때 발생하는 중도상환수수료의 계산 공식, 면제 조건, 수수료 없이 중도상환하는 방법과 중도상환 vs 유지 결정 기준을 완전히 정리합니다.',
  openGraph: {
    title: '중도상환수수료 완전 정리',
    description: '수수료 계산 공식·면제 조건·중도상환 vs 유지 판단 기준 완전 정리',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/early-repayment-fee',
  },
}

const tocItems = [
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
    label: '중도상환 vs 유지 비교 계산기',
    href: '/calculator/prepayment-comparison',
    description: '중도상환 절감액과 수수료를 비교해 최적 선택',
  },
]

const relatedGuides = [
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
      '통상 잔여 대출 잔액의 0.5~1.5% 수준입니다. 주택담보대출은 은행별로 0.5~1.2%, 신용대출은 0.8~1.5% 수준이 일반적입니다. 대출 잔액 2억에 수수료율 1%라면 200만원이 발생합니다. 단, 잔여 기간에 따라 수수료가 감소하는 구조가 많습니다.',
  },
  {
    question: '3년 경과 후에는 수수료가 없다고 하던데, 모든 대출이 그런가요?',
    answer:
      '아닙니다. 중도상환수수료 면제 기간은 대출 상품마다 다릅니다. 일부 상품은 3년, 일부는 5년이 지나야 면제됩니다. 주택담보대출의 경우 대출 실행일로부터 3년이 지나면 수수료 없이 상환이 가능한 경우가 많지만, 반드시 해당 금융사 약관을 확인해야 합니다.',
  },
  {
    question: '연간 부분 중도상환 한도 내에서는 수수료가 없다는 게 사실인가요?',
    answer:
      '네, 맞습니다. 대부분의 은행 대출은 연간 원금의 10~30% 이내에서 부분 중도상환을 수수료 없이 허용합니다. 예를 들어 대출 원금 2억에 연 20% 한도라면 매년 4천만원까지 수수료 없이 갚을 수 있습니다. 이 한도와 조건은 대출 계약서에서 반드시 확인하세요.',
  },
  {
    question: '대환대출을 하면 기존 대출에 중도상환수수료가 붙나요?',
    answer:
      '네, 대환대출은 기존 대출을 중도에 상환하는 것이므로 중도상환수수료가 발생합니다. 대환 절감 이자 > 중도상환수수료인 경우에만 대환이 유리합니다. 금리 차이가 크더라도 잔여 기간이 짧거나 대출 잔액이 적다면 손익분기점을 먼저 계산해야 합니다.',
  },
  {
    question: '중도상환수수료를 아예 안 내는 방법이 있나요?',
    answer:
      '있습니다. 첫째, 수수료 면제 기간(통상 3~5년)이 지난 후 상환합니다. 둘째, 연간 무수수료 한도 내에서 부분 상환합니다. 셋째, 처음 대출 계약 시 &apos;중도상환수수료 없음&apos; 조건(단, 금리가 약간 높을 수 있음)을 선택합니다. 특히 단기 대출이나 상환 시점을 예상할 수 있는 경우라면 수수료 없는 상품을 선택하는 것이 유리합니다.',
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
      title="중도상환수수료 완전 정리 — 계산 공식부터 면제 조건까지"
      description="대출을 만기 전에 갚을 때 발생하는 중도상환수수료의 계산 공식, 면제 조건, 수수료 없이 중도상환하는 방법, 그리고 중도상환 vs 유지의 현실적인 손익 판단법을 완전히 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <H2 id="what-is">중도상환수수료란 무엇인가</H2>
      <P>
        대출을 계약 만기 이전에 상환하면 금융사는 예상했던 이자 수익을 받지 못합니다. 이를
        보전하기 위해 부과하는 비용이 중도상환수수료입니다. 영어로는 &lsquo;조기상환수수료
        (Prepayment Penalty)&rsquo;라고 합니다.
      </P>
      <P>
        금융사 입장에서는 대출금을 장기로 조달해 이자를 받는 구조입니다. 차주가 중도에
        상환하면 해당 자금을 재운용하기까지 공백이 생기고, 재투자 금리가 기존보다 낮을 수도
        있습니다. 중도상환수수료는 이 손실을 보전하는 장치입니다.
      </P>
      <P>
        소비자 입장에서는 &ldquo;내 돈 일찍 갚는 데 왜 수수료를?&rdquo;이라는 억울함이 생기지만, 이는
        대출 계약 시 이미 약정된 조건입니다. 대출 신청 전 중도상환수수료율과 면제 조건을
        꼼꼼히 확인하는 것이 실질적인 대응책입니다.
      </P>

      <H2 id="formula">수수료 계산 공식과 실제 금액</H2>
      <P>중도상환수수료의 계산 방식은 금융사마다 다르지만, 가장 일반적인 공식은 다음과 같습니다.</P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        중도상환수수료 = 중도상환 원금 × 수수료율 × (잔여기간 / 대출기간)
      </div>
      <P>
        수수료율은 통상 주택담보대출 0.5~1.2%, 신용대출 0.8~1.5%입니다. 잔여기간이 길수록
        수수료가 많아지고, 만기에 가까울수록 줄어드는 구조입니다.
      </P>
      <H3>실제 계산 예시</H3>
      <Ul>
        <li>대출 원금: 2억원 / 수수료율 1.2% / 대출기간 20년 / 잔여기간 10년</li>
        <li>중도상환수수료 = 2억 × 1.2% × (10년 / 20년) = 1,200,000원</li>
        <li>잔여기간이 5년이라면 = 2억 × 1.2% × (5/20) = 600,000원</li>
      </Ul>
      <P>
        대출 실행일로부터 3년이 지나면 수수료 면제가 되는 상품도 많습니다. 이 경우 위
        공식에서 잔여기간을 (전체기간 - 면제기간 후 잔여기간)으로 조정해 계산합니다.
      </P>

      <H2 id="exemptions">수수료가 면제되는 조건</H2>
      <P>
        모든 중도상환에 수수료가 붙는 것은 아닙니다. 다음 상황에서는 수수료 없이 상환이
        가능합니다.
      </P>
      <H3>1. 면제 기간 경과 후 상환</H3>
      <P>
        대부분의 주택담보대출은 대출 실행일로부터 3년이 지나면 중도상환수수료가 면제됩니다.
        신용대출은 1~3년 내외입니다. 대출 약관에서 정확한 면제 시점을 확인하세요.
      </P>
      <H3>2. 연간 무수수료 한도 활용</H3>
      <P>
        은행 대출은 대부분 연간 원금의 10~30% 이내에서 부분 상환 시 수수료를 면제합니다.
        이 한도를 활용하면 매년 조금씩 원금을 줄여 총이자를 절약할 수 있습니다. 한도와
        조건은 대출 계약서에서 반드시 확인해야 합니다.
      </P>
      <H3>3. 금융사 정책에 따른 면제</H3>
      <Ul>
        <li>이사·이직 등 불가피한 사유로 담보물 매각 시</li>
        <li>금융사가 금리를 일방적으로 인상하는 경우</li>
        <li>상품 약관에 명시된 특정 사유 발생 시</li>
      </Ul>

      <H2 id="cases">실전 사례로 확인하는 중도상환 손익</H2>
      <CaseBox title="사례 1 — 직장인 G씨: 주담대 1.5억 잔액, 연 5.5% → 연 3.8% 대환 검토">
        <P>
          G씨는 3년 전 연 5.5%로 받은 주담대 잔액이 1.5억원 남아 있습니다(잔여기간 17년).
          현재 다른 은행에서 연 3.8%로 대환을 제안받았습니다.
        </P>
        <Ul>
          <li>중도상환수수료: 1.5억 × 1.0% × (17/20) = 1,275,000원</li>
          <li>대환 후 월납입 절감: 약 128,000원/월</li>
          <li>손익분기점: 1,275,000 ÷ 128,000 ≒ 10개월</li>
        </Ul>
        <P>
          10개월만 지나면 수수료 비용을 모두 회수하고 절감 효과가 시작됩니다. 잔여기간 17년을
          감안하면 총 절감액은 약 2,600만원. 명백히 대환이 유리합니다. 단, 새 대출의
          부대비용(인지세·등기 비용 등)까지 포함해 최종 계산해야 합니다.
        </P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 H씨: 신용대출 4천만원 잔액, 연 8.5%, 잔여 2년">
        <P>
          H씨는 3년 전 빌린 신용대출 잔액이 4천만원이고 잔여 기간이 2년입니다.
          사업 수익금 4천만원이 생겨 전액 중도상환을 고민 중입니다.
        </P>
        <Ul>
          <li>수수료율: 1.4% / 잔여기간 2년 / 전체기간 5년</li>
          <li>중도상환수수료: 4천만 × 1.4% × (2/5) = 224,000원</li>
          <li>남은 2년 이자(원리금균등 기준): 약 2,900,000원</li>
          <li>중도상환 시 절감: 2,900,000 - 224,000 = 2,676,000원</li>
        </Ul>
        <P>
          수수료 22만원을 내고 이자 290만원을 아끼는 구조로, 중도상환이 압도적으로 유리합니다.
          8.5%의 고금리 대출일수록 잔여 이자 절감액이 크기 때문에 여윳돈이 생기면 즉시 상환하는
          것이 최선입니다.
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
    </GuideLayout>
  )
}
