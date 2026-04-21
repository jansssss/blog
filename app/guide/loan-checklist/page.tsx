import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: '대출 신청 전 필수 체크리스트 — 놓치면 후회하는 10가지 | ohyess 가이드',
  description:
    '대출 신청 전 반드시 확인해야 할 신용·소득·한도 파악, 상품 비교 포인트, 계약서 필수 확인 항목을 직장인·자영업자 실전 사례와 함께 완전히 정리합니다.',
  openGraph: {
    title: '대출 신청 전 필수 체크리스트',
    description: '놓치면 후회하는 대출 전 10가지 확인사항을 실전 사례로 완전 정리',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/loan-checklist',
  },
}

const tocItems = [
  { id: 'preparation', label: '사전 준비 — 신용·소득·한도 현황 파악' },
  { id: 'comparison', label: '상품 비교 포인트 7가지' },
  { id: 'contract', label: '계약서에서 반드시 확인할 항목' },
  { id: 'cases', label: '실전 사례 2개' },
  { id: 'management', label: '대출 후 관리 전략' },
]

const ctas = [
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '금리·기간으로 월납입액·총이자 즉시 계산',
  },
  {
    label: '대출 한도 시뮬레이터',
    href: '/calculator/loan-limit',
    description: '소득·부채·담보 기준 실제 한도 확인',
  },
]

const relatedGuides = [
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '상환방식·금리 유형별 이자 계산법',
  },
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '대출 한도를 결정하는 3가지 핵심 지표',
  },
  {
    title: '신용점수 완전 정리',
    href: '/guide/credit-score',
    description: '신용점수 올리는 방법과 금리 영향',
  },
  {
    title: '상환방식 완전 비교',
    href: '/guide/repayment-types',
    description: '원리금균등·원금균등·만기일시 비교',
  },
]

const faqs = [
  {
    question: '대출 신청 전 신용점수는 얼마나 미리 준비해야 하나요?',
    answer:
      '최소 3~6개월 전부터 준비하는 것이 좋습니다. 공과금 납부 이력 등록, 카드 이용률 조정 등의 효과가 반영되기까지 1~3개월이 소요됩니다. 또한 이 기간 동안 신규 대출 신청을 자제해야 점수 하락 없이 심사에 임할 수 있습니다.',
  },
  {
    question: '금리 비교는 어디서 하면 가장 정확한가요?',
    answer:
      '금융감독원의 &apos;금융상품 한눈에&apos; 사이트와 각 은행 앱에서 직접 금리 조회를 하는 것이 가장 정확합니다. 대출 비교 플랫폼(네이버 금융·카카오페이 등)을 활용하면 여러 금융사를 한번에 비교할 수 있습니다. 단, 금리는 개인 신용 조건에 따라 달라지므로 최종 확정 금리는 실제 심사를 받아야 알 수 있습니다.',
  },
  {
    question: '대출 계약서에서 가장 중요하게 봐야 할 항목은?',
    answer:
      '①확정 금리(광고 금리와 다를 수 있음), ②중도상환수수료율과 면제 기간, ③금리 변동 조건(변동금리라면 기준 금리와 가산금리 명시 여부), ④상환 방식(원리금균등·원금균등), ⑤연체 이자율이 핵심입니다. 특히 광고에서 강조한 &apos;최저 금리&apos;가 아닌 내가 실제 적용받는 금리를 계약서에서 직접 확인하세요.',
  },
  {
    question: '1금융(은행)과 2금융(저축은행·캐피탈) 대출의 차이가 뭔가요?',
    answer:
      '가장 큰 차이는 금리와 신용 영향입니다. 1금융은 금리가 낮고 2금융은 높습니다. 2금융 대출 이력은 신용점수에 부정적인 영향을 줄 수 있습니다. 또한 2금융 대출 이력이 있으면 이후 1금융 대출 심사에서 불이익을 받을 수 있습니다. 가능하면 1금융을 먼저 시도하고, 거절되는 경우에만 2금융을 고려하세요.',
  },
  {
    question: '대출 실행 후 후회하는 가장 흔한 실수는?',
    answer:
      '①금리 비교 없이 주거래 은행에서 바로 신청 (타 은행 대비 0.5~1%p 손해), ②중도상환수수료 확인 안 함 (나중에 대환 시 큰 비용 발생), ③상환 방식 고민 없이 기본값(원리금균등) 선택, ④변동금리 리스크 과소평가, ⑤부대비용(인지세·등기 비용·감정평가료) 미파악이 가장 흔한 실수입니다.',
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

function Ol({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal pl-5 space-y-3 mb-4 text-gray-700 text-[15px]">{children}</ol>
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

export default function LoanChecklistGuidePage() {
  return (
    <GuideLayout
      title="대출 신청 전 필수 체크리스트 — 놓치면 후회하는 10가지"
      description="대출 신청 전 반드시 확인해야 할 신용·소득·한도 파악, 상품 비교 포인트, 계약서 필수 확인 항목을 직장인·자영업자 실전 사례와 함께 완전히 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <P>
        대출 실행 후 가장 많이 듣는 말이 있습니다. &ldquo;조금만 더 알고 받았으면 좋았을 텐데.&rdquo; 금리
        비교만 제대로 해도 수십~수백만원을 아낄 수 있고, 중도상환수수료 하나 놓쳤다가 대환을
        못 하는 경우도 흔합니다. 대출 전 30분의 준비가 10년의 이자 부담을 바꿉니다.
      </P>

      <H2 id="preparation">사전 준비 — 신용·소득·한도 현황 파악</H2>
      <P>
        대출 상담 창구에 가기 전에 본인의 현재 상태를 파악해야 합니다. 모르면 은행 직원이
        제시하는 조건을 그대로 받아들이게 되고, 알면 협상 여지가 생깁니다.
      </P>
      <H3>체크 1: 신용점수 확인</H3>
      <P>
        카카오뱅크·토스·뱅크샐러드 앱에서 무료로 KCB·NICE 점수를 확인하세요. 주요 은행의
        신용대출 기준점(통상 700점)보다 낮다면 대출 신청 전 3~6개월 점수 관리에 먼저
        집중하는 것이 유리합니다.
      </P>
      <H3>체크 2: 기존 부채와 DSR 여유분 파악</H3>
      <P>
        현재 갚고 있는 모든 대출(카드론·마이너스통장·할부 포함)의 월 원리금을 합산하세요.
        여기에 신청할 대출의 예상 월납입액을 더해 연 환산한 뒤, 연소득의 40%를 초과하면
        은행 대출이 거절될 수 있습니다.
      </P>
      <H3>체크 3: 담보물이 있다면 LTV 계산</H3>
      <P>
        주택담보대출이라면 해당 주택의 공시가격·KB시세를 확인하고, 현재 규제 지역 여부에
        따른 LTV 한도를 미리 계산해두세요. 예상 한도를 먼저 알아야 부족분을 어떻게 채울지
        플랜B를 준비할 수 있습니다.
      </P>

      <H2 id="comparison">상품 비교 포인트 7가지</H2>
      <P>
        같은 조건이라도 금융사마다 금리·수수료·조건이 다릅니다. 반드시 2~3곳을 비교하고
        다음 7가지를 중심으로 비교하세요.
      </P>
      <Ol>
        <li>
          <strong className="font-semibold">확정 금리(실제 적용 금리)</strong>: 광고 금리가
          아닌 내 신용 조건 기준 실제 금리를 확인. 최저 금리는 최고 신용 등급에만 적용됩니다.
        </li>
        <li>
          <strong className="font-semibold">금리 유형</strong>: 변동금리 vs 고정금리.
          잔여 기간이 길고 금리 인상 가능성이 있다면 고정 유리.
        </li>
        <li>
          <strong className="font-semibold">중도상환수수료율·면제 기간</strong>: 3년 안에
          갚거나 대환 가능성이 있다면 수수료 없는 상품이 유리할 수 있음.
        </li>
        <li>
          <strong className="font-semibold">상환 방식 선택 가능 여부</strong>: 원리금균등
          vs 원금균등 중 선택 가능 상품인지 확인.
        </li>
        <li>
          <strong className="font-semibold">부대 비용</strong>: 주담대의 경우 감정평가료·인지세·
          등기 비용 등 부대 비용이 상당합니다. 총 비용 기준으로 비교하세요.
        </li>
        <li>
          <strong className="font-semibold">우대 금리 조건</strong>: 급여 이체·자동이체·
          카드 실적 등 우대 조건을 충족할 수 있는지 확인. 충족 불가한 우대금리는 허상입니다.
        </li>
        <li>
          <strong className="font-semibold">연체 이자율</strong>: 연체 시 적용되는 이자율
          (통상 약정금리 + 2~5%p). 비상 상황 대비용 확인 항목.
        </li>
      </Ol>

      <H2 id="contract">계약서에서 반드시 확인할 항목</H2>
      <P>
        구두 설명과 실제 계약서가 다른 경우가 있습니다. 서명 전 다음 항목을 직접 계약서에서
        눈으로 확인하세요.
      </P>
      <H3>반드시 확인해야 할 5가지</H3>
      <Ul>
        <li>
          <strong className="font-semibold">확정 금리 수치</strong>: 계약서에 명시된 금리가
          상담 시 안내받은 금리와 일치하는지
        </li>
        <li>
          <strong className="font-semibold">중도상환수수료율과 면제 시점</strong>: 정확한
          수수료율과 면제 시작일(대출 실행일로부터 몇 년 후인지)
        </li>
        <li>
          <strong className="font-semibold">금리 변경 조건(변동금리인 경우)</strong>: 어떤
          기준금리(COFIX 6개월물·12개월물)에 연동하는지, 가산금리는 얼마인지
        </li>
        <li>
          <strong className="font-semibold">상환 방식 명시</strong>: 원리금균등·원금균등
          등 약정한 방식이 계약서에 명확히 기재되어 있는지
        </li>
        <li>
          <strong className="font-semibold">부대 비용 내역</strong>: 인지세·저당권 설정비·
          감정평가료 등 부대 비용이 항목별로 명시되어 있는지
        </li>
      </Ul>
      <P>
        계약서를 꼼꼼히 읽는 것이 번거롭게 느껴질 수 있지만, 이 30분이 나중에 수십만~수백만원의
        불필요한 지출을 막아줍니다.
      </P>

      <H2 id="cases">실전 사례 2개</H2>
      <CaseBox title="사례 1 — 직장인 K씨: 금리 비교 하나로 240만원 절약">
        <P>
          K씨(연봉 6천만원)는 신용대출 5천만원이 필요했습니다. 기존 주거래 은행(A은행)에서
          연 6.8% 제안을 받았지만, 두 곳을 더 비교했습니다.
        </P>
        <Ul>
          <li>A은행(주거래): 연 6.8%, 36개월 원리금균등 → 총이자 약 5,750,000원</li>
          <li>B은행(비교): 연 5.9%, 동일 조건 → 총이자 약 4,960,000원</li>
          <li>C은행(비교): 연 5.3%(급여 이체 조건) → 총이자 약 4,440,000원</li>
        </Ul>
        <P>
          K씨는 C은행으로 급여 이체를 변경하고 5.3%로 대출받아 A은행 대비 총이자 1,310,000원을
          절약했습니다. 비교에 쓴 시간은 2시간. 시간당 65만원짜리 작업이었습니다.
        </P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 L씨: 중도상환수수료 미확인으로 손해 본 경우">
        <P>
          자영업자 L씨는 2년 전 사업자 담보대출 2억을 연 6.2%로 받았습니다. 최근 거래
          금융사에서 연 4.5%로 대환 제안을 받아 즉시 진행하려 했습니다.
        </P>
        <Ul>
          <li>현재 잔액: 1.8억 / 잔여기간 8년 / 수수료율 1.2%</li>
          <li>중도상환수수료: 1.8억 × 1.2% × (8/10) = 1,728,000원</li>
          <li>대환 후 월납입 절감: 약 156,000원/월</li>
          <li>손익분기점: 1,728,000 ÷ 156,000 ≒ 11개월</li>
          <li>잔여기간 8년(96개월) × 156,000 = 총 절감 14,976,000원</li>
        </Ul>
        <P>
          수수료를 내도 11개월 후부터 절감이 시작되어 총 1,500만원 절약이 가능했습니다.
          다행히 계산 후 진행했지만, 계약 당시 수수료 조건을 확인했더라면 대환 타이밍을
          더 정확하게 잡을 수 있었습니다.
        </P>
      </CaseBox>

      <H2 id="management">대출 후 관리 전략</H2>
      <P>
        대출을 받은 이후에도 관리가 필요합니다. 한 번 세팅하고 방치하면 더 좋은 조건을
        놓칠 수 있습니다.
      </P>
      <H3>연 1~2회: 금리 인하 요구권 행사</H3>
      <P>
        신용점수 상승, 소득 증가, 직장 변경(더 안정적인 곳) 등 조건이 개선되면 금융사에
        금리 인하를 요구하세요. 법적으로 보장된 권리이며, 연 1~2회 신청이 가능합니다. 수락되면
        0.1~0.5%p 인하 효과를 볼 수 있습니다.
      </P>
      <H3>연 1회: 시장 금리와 내 금리 비교</H3>
      <P>
        현재 시장 금리와 내 대출 금리를 연 1회 이상 비교하세요. 금리 차이가 0.5%p 이상이고
        중도상환수수료 면제 기간이 지났다면 대환을 적극 검토할 시점입니다.
      </P>
      <H3>여윳돈 생기면: 부분 중도상환</H3>
      <P>
        연말 성과급이나 인센티브가 생기면 연간 무수수료 한도(통상 원금의 10~30%) 범위에서
        부분 상환을 진행하세요. 원금이 줄면 이후 발생하는 이자도 함께 줄어듭니다.
      </P>
    </GuideLayout>
  )
}
