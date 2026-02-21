import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '대출 종류 완전 가이드 | ohyess 가이드',
  description:
    '신용대출·주담대·전세대출·사업자대출·정책대출까지 한국의 모든 대출 종류를 목적·금리·조건별로 완전 정리합니다.',
  openGraph: {
    title: '대출 종류 완전 가이드',
    description: '모든 대출 종류를 목적·금리·조건별로 한눈에 비교',
    type: 'article',
  },
}

const tocItems = [
  { id: 'overview', label: '대출의 기본 분류 체계' },
  { id: 'credit', label: '신용대출 완전 정리' },
  { id: 'mortgage', label: '담보대출 완전 정리' },
  { id: 'policy', label: '정책금융 대출 완전 정리' },
  { id: 'business', label: '사업자·프리랜서 대출' },
  { id: 'selection', label: '내 상황에 맞는 대출 선택법' },
]

const ctas = [
  {
    label: '대출 한도 계산기',
    href: '/calculator/loan-limit',
    description: 'DSR·LTV 기준 대출 가능 금액 계산',
  },
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '금리·기간별 총이자 즉시 계산',
  },
]

const relatedGuides = [
  { title: '주택담보대출 완전 정리', href: '/guide/mortgage-loan', description: '주담대 한도·금리·절차 상세 가이드' },
  { title: '전세대출 완전 정리', href: '/guide/jeonse-loan', description: '전세대출 종류·보증·사기 예방 완전 가이드' },
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', description: '대출 한도 결정 3가지 핵심 지표' },
  { title: '신용점수 완전 정리', href: '/guide/credit-score', description: '대출 금리를 낮추는 신용점수 관리법' },
]

const faqs = [
  {
    question: '신용대출과 마이너스통장은 어떻게 다른가요?',
    answer:
      '신용대출은 특정 금액을 일시에 빌려 분할 상환하는 방식입니다. 마이너스통장(한도대출)은 한도 내에서 자유롭게 인출·상환하는 방식으로, 실제 사용 금액에 대해서만 이자가 붙습니다. 마이너스통장은 유동성이 좋지만 금리가 일반 신용대출보다 0.3~0.5%p 높을 수 있습니다.',
  },
  {
    question: '정책대출과 시중은행 대출, 무엇이 먼저인가요?',
    answer:
      '조건이 맞는다면 정책대출을 먼저 검토해야 합니다. 정책대출(디딤돌·보금자리론·버팀목 등)은 시중은행 대비 0.5~1.5%p 낮은 금리를 제공합니다. 단, 소득·자산·주택가격 등 자격 요건이 있으므로 조건 충족 여부를 먼저 확인하세요.',
  },
  {
    question: '대출 여러 개를 동시에 받을 수 있나요?',
    answer:
      'DSR(총부채원리금상환비율) 40% 한도 내에서라면 여러 종류의 대출을 동시에 보유할 수 있습니다. 단, 모든 대출의 원리금 상환액 합계가 연소득의 40%를 초과하면 추가 대출이 제한됩니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-20">{children}</h2>
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: ReactNode }) {
  return <p className="text-gray-700 leading-relaxed mb-4 text-[15px]">{children}</p>
}
function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
}

export default function LoanTypesCompletePage() {
  return (
    <GuideLayout
      title="대출 종류 완전 가이드 — 목적·금리·조건별 한눈에 비교"
      description="신용대출·주택담보대출·전세대출·사업자대출·정책금융까지 한국의 모든 대출 종류를 목적, 금리 수준, 자격 조건별로 완전 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <GeminiImage
        src="/images/guide/loan-types-complete.png"
        placeholderColor="sky"
        alt="대출 종류 분류 체계 일러스트"
        className="mb-8"
        height={280}
      />

      <H2 id="overview">대출의 기본 분류 체계</H2>
      <P>
        대출은 크게 <strong className="font-semibold">담보 유무</strong>와 <strong className="font-semibold">재원 출처</strong>로 분류합니다. 담보가 있으면 금리가 낮고, 정책 재원이면 민간보다 저렴합니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">분류</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">대표 상품</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">금리 수준</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">특징</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-200 px-3 py-2">신용대출</td><td className="border border-gray-200 px-3 py-2 text-gray-600">마이너스통장, 직장인 대출</td><td className="border border-gray-200 px-3 py-2 text-red-600">연 5~15%</td><td className="border border-gray-200 px-3 py-2 text-gray-600">빠른 실행, 담보 불필요</td></tr>
            <tr className="bg-blue-50"><td className="border border-gray-200 px-3 py-2 text-blue-800">주담대</td><td className="border border-gray-200 px-3 py-2 text-blue-700">아파트·오피스텔 담보</td><td className="border border-gray-200 px-3 py-2 text-blue-700">연 3~5.5%</td><td className="border border-gray-200 px-3 py-2 text-blue-700">낮은 금리, 장기 대출 가능</td></tr>
            <tr><td className="border border-gray-200 px-3 py-2">전세대출</td><td className="border border-gray-200 px-3 py-2 text-gray-600">버팀목, 시중은행 전세</td><td className="border border-gray-200 px-3 py-2 text-green-600">연 2~5%</td><td className="border border-gray-200 px-3 py-2 text-gray-600">전세보증금 한도 내</td></tr>
            <tr className="bg-green-50"><td className="border border-gray-200 px-3 py-2 text-green-800">정책금융</td><td className="border border-gray-200 px-3 py-2 text-green-700">디딤돌, 보금자리론</td><td className="border border-gray-200 px-3 py-2 text-green-700">연 2.65~3.95%</td><td className="border border-gray-200 px-3 py-2 text-green-700">소득 조건, 저금리</td></tr>
            <tr><td className="border border-gray-200 px-3 py-2">사업자대출</td><td className="border border-gray-200 px-3 py-2 text-gray-600">운전자금, 시설자금</td><td className="border border-gray-200 px-3 py-2 text-orange-600">연 4~12%</td><td className="border border-gray-200 px-3 py-2 text-gray-600">사업자등록 필요</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="credit">신용대출 완전 정리</H2>
      <H3>① 일반 신용대출</H3>
      <P>담보 없이 신용도(신용점수·소득·직업)만으로 대출합니다. 최대 한도는 연 소득의 1.5~2.5배 수준이며, 신용점수 900점 이상이면 시중은행에서 최저금리(연 5~6%) 적용이 가능합니다.</P>
      <H3>② 마이너스통장 (한도대출)</H3>
      <P>통장에 마이너스 한도를 설정해 필요할 때마다 인출·상환하는 방식입니다. 실제 사용 금액에만 이자가 붙어 유동성 관리에 유리하지만, 금리가 일반 신용대출보다 0.3~0.5%p 높습니다.</P>
      <H3>③ 직장인 전용 대출</H3>
      <P>대기업·공무원·공공기관 직원을 대상으로 일반 신용대출보다 우대 금리를 제공합니다. 급여이체 실적과 재직 기간이 주요 심사 기준입니다.</P>

      <H2 id="mortgage">담보대출 완전 정리</H2>
      <H3>① 주택담보대출 (주담대)</H3>
      <P>아파트·빌라·단독주택 등 부동산을 담보로 제공하고 빌리는 대출입니다. 규제지역 LTV 최대 70%, DSR 40% 한도 내에서 실행됩니다. 금리는 신용대출보다 2~3%p 낮습니다.</P>
      <H3>② 아파트 담보 신용대출 (아파트론)</H3>
      <P>주담대와 달리 생활자금 목적으로 아파트를 담보로 추가 대출합니다. 주담대와 동일한 담보물에 후순위로 설정되며, 금리는 주담대보다 0.5~1%p 높습니다.</P>
      <H3>③ 전세자금 반환 보증 담보 대출</H3>
      <P>임대인(집주인)이 전세보증금 반환 의무를 담보로 대출받는 상품입니다. 갱신·만기 시 보증금 반환 자금 확보가 어려울 때 활용됩니다.</P>

      <H2 id="policy">정책금융 대출 완전 정리</H2>
      <P>정부·주택도시기금이 재원을 공급하는 저금리 정책 대출입니다. 자격 조건이 있지만 해당된다면 시중은행 대비 1~1.5%p 저렴합니다.</P>
      <Ul>
        <li><strong className="font-semibold">디딤돌대출:</strong> 무주택 서민 주택 구입. 연소득 6천만원 이하. 금리 연 2.65~3.95%</li>
        <li><strong className="font-semibold">보금자리론:</strong> 장기 고정금리 주담대. 연소득 7천만원 이하(신혼 8.5천만원). 금리 연 3%대</li>
        <li><strong className="font-semibold">버팀목 전세대출:</strong> 무주택 세대주 전세. 연소득 5천만원 이하. 금리 연 1.8~2.9%</li>
        <li><strong className="font-semibold">청년 전세대출:</strong> 만 19~34세 청년. 연소득 5천만원 이하. 금리 연 1.5~2.1%</li>
      </Ul>

      <H2 id="business">사업자·프리랜서 대출</H2>
      <H3>사업자 대출 종류</H3>
      <Ul>
        <li><strong className="font-semibold">운전자금 대출:</strong> 원자재 구입·임금 지급 등 일상적인 영업 자금</li>
        <li><strong className="font-semibold">시설자금 대출:</strong> 기계·설비·건물 구입 등 장기 투자 자금</li>
        <li><strong className="font-semibold">매출채권 담보:</strong> 외상매출금·어음을 담보로 단기 유동성 확보</li>
      </Ul>
      <H3>프리랜서·자영업자 대출 특이점</H3>
      <P>
        사업소득이 있는 자영업자·프리랜서는 종합소득세 신고 소득 기준으로 DSR이 계산됩니다. 근로소득자보다 소득 증빙이 어려워 한도가 작을 수 있습니다. 사업용 통장의 매출 실적, 부가세 신고 내역을 적극 활용하세요.
      </P>

      <H2 id="selection">내 상황에 맞는 대출 선택법</H2>
      <div className="space-y-3 mb-6">
        {[
          { situation: '주택 구입 자금 부족', recommend: '정책금융(디딤돌·보금자리론) → 시중은행 주담대 순서로 검토' },
          { situation: '전세 보증금 부족', recommend: '버팀목·청년 전세대출(조건 해당 시) → 시중은행 전세대출' },
          { situation: '급전 필요 (소액, 단기)', recommend: '마이너스통장 또는 신용대출 (한도 내 최소한으로)' },
          { situation: '사업 운영 자금', recommend: '사업자 대출 우선. 소진공 보증 활용 시 금리 절감 가능' },
          { situation: '고금리 대출 정리', recommend: '대환대출로 금리 낮추기. 중도상환수수료 포함 총비용 계산 필수' },
        ].map(({ situation, recommend }) => (
          <div key={situation} className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">📌 {situation}</p>
            <p className="text-xs text-gray-600">{recommend}</p>
          </div>
        ))}
      </div>
    </GuideLayout>
  )
}
