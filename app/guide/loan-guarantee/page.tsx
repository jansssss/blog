import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '대출 보증보험 완전 정리 | ohyess 가이드',
  description:
    'HUG·HF·SGI 보증 기관 비교, 보증료 계산법, 전세보증보험·대출보증서 활용 전략까지 완전 정리합니다.',
  openGraph: {
    title: '대출 보증보험 완전 정리',
    description: '보증 기관 비교·보증료 계산·활용 전략 완전 가이드',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/loan-guarantee',
  },
}

const tocItems = [
  { id: 'why', label: '보증이 왜 필요한가' },
  { id: 'institutions', label: '3대 보증 기관 비교 (HUG·HF·SGI)' },
  { id: 'jeonse-guarantee', label: '전세보증보험 완전 정리' },
  { id: 'loan-guarantee', label: '대출 보증서 활용법' },
  { id: 'fee', label: '보증료 계산과 절약 방법' },
  { id: 'tips', label: '실전 활용 전략' },
]

const ctas = [
  {
    label: '전세대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '전세대출 월납입 이자 계산',
  },
]

const relatedGuides = [
  { title: '전세대출 완전 정리', href: '/guide/jeonse-loan', description: '전세대출 종류·한도·절차 완전 가이드' },
  { title: '주택담보대출 완전 정리', href: '/guide/mortgage-loan', description: '주담대 한도·금리·절차 완전 가이드' },
  { title: '대출 전 필수 체크리스트', href: '/guide/loan-checklist', description: '대출 전 반드시 확인할 항목' },
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', description: '대출 한도 결정 3가지 핵심 지표' },
]

const faqs = [
  {
    question: '전세보증보험과 전세대출 보증은 어떻게 다른가요?',
    answer:
      '전세보증보험(반환보증)은 임차인이 가입해 집주인이 전세금을 돌려주지 못할 때 보증기관이 대신 지급하는 상품입니다. 전세대출 보증은 임차인이 은행에서 전세대출을 받을 때 보증기관이 대출 상환을 보증하는 상품입니다. 둘 다 HUG·HF에서 취급하며, 별도 신청해야 합니다.',
  },
  {
    question: '보증 신청이 거절될 수 있나요?',
    answer:
      '네, 보증 기관도 심사를 합니다. 신용점수가 너무 낮거나, 이미 보증 사고 이력이 있거나, 담보 주택의 권리 관계가 복잡한 경우 거절될 수 있습니다. HUG 기준 신용점수 최저 선이 있으며, 전세금이 시세 대비 과도하게 높은 경우(깡통 전세 의심)도 거절 사유가 됩니다.',
  },
  {
    question: '전세보증보험료는 세입자가 내야 하나요?',
    answer:
      '원칙적으로 세입자(임차인)가 부담합니다. 보증료는 보증금의 연 0.02~0.1% 수준으로, 2년 기준 보증금 3억원이면 약 12~60만원입니다. 2023년부터 보증료 지원 사업이 있어 저소득층은 최대 50% 지원을 받을 수 있습니다.',
  },
  {
    question: 'HUG 보증 사고가 나면 어떻게 되나요?',
    answer:
      '집주인이 전세금을 반환하지 못하면 HUG가 세입자에게 전세금을 대신 지급하고, 이후 HUG가 집주인에게 구상권을 행사합니다. 세입자는 보증금을 받은 후 HUG의 대위변제 동의서에 서명하고 해당 주택에서 퇴거해야 합니다.',
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

export default function LoanGuaranteePage() {
  return (
    <GuideLayout
      title="대출 보증보험 완전 정리 — HUG·HF·SGI 비교와 활용 전략"
      description="전세보증보험·대출보증서의 구조, HUG·HF·SGI 3대 보증 기관 비교, 보증료 계산법, 전세 사기 방어 활용법까지 2026년 기준으로 완전 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <GeminiImage
        src="/images/guide/loan-guarantee.png"
        placeholderColor="violet"
        alt="보증 기관 구조 일러스트"
        className="mb-8"
        height={280}
      />

      <H2 id="why">보증이 왜 필요한가</H2>
      <P>
        보증은 대출자 또는 임차인의 <strong className="font-semibold">채무 이행을 제3자(보증 기관)가 보장</strong>하는 장치입니다. 은행 입장에서는 채무자가 상환하지 못해도 보증 기관에서 회수할 수 있어 대출 위험이 낮아집니다. 세입자 입장에서는 집주인이 보증금을 돌려주지 못할 때 보증기관이 대신 지급해줍니다.
      </P>
      <P>
        2022~2023년 전국적으로 발생한 전세 사기 피해는 수만 건에 달하며, 피해 금액은 수조원에 이릅니다. 보증 가입 여부가 피해를 막는 핵심 방어 수단임이 다시 한번 확인되었습니다.
      </P>

      <H2 id="institutions">3대 보증 기관 비교 (HUG·HF·SGI)</H2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">기관</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">정식 명칭</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">주요 상품</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">보증료율(연)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-bold text-blue-700">HUG</td>
              <td className="border border-gray-200 px-3 py-3">주택도시보증공사</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">전세보증금반환보증, 전세대출보증</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">0.02~0.06%</td>
            </tr>
            <tr className="bg-green-50">
              <td className="border border-gray-200 px-3 py-3 font-bold text-green-700">HF</td>
              <td className="border border-gray-200 px-3 py-3">주택금융공사</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">정책금융보증, 전세대출보증</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">0.05~0.1%</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-bold text-purple-700">SGI</td>
              <td className="border border-gray-200 px-3 py-3">서울보증보험</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">전세대출보증, 이행보증</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">0.1~0.2%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <H3>기관별 선택 기준</H3>
      <Ul>
        <li><strong className="font-semibold">HUG:</strong> 전세보증금반환보증 전문. 전세 사기 방어 목적이면 HUG 우선. 보증료 가장 저렴</li>
        <li><strong className="font-semibold">HF:</strong> 버팀목·디딤돌 등 정책금융 이용 시 필수. 소득 조건 있는 정책 대출과 연계</li>
        <li><strong className="font-semibold">SGI:</strong> 소득·자산 조건 없어 고소득자나 정책금융 미해당자에게 유리. 보증료 다소 높음</li>
      </Ul>

      <H2 id="jeonse-guarantee">전세보증보험 완전 정리</H2>
      <P>
        정식 명칭은 <strong className="font-semibold">전세보증금반환보증</strong>입니다. 세입자가 가입해 집주인이 전세 만기에 보증금을 돌려주지 못하면 HUG가 대신 지급해주는 상품입니다.
      </P>
      <H3>가입 조건 (HUG 기준)</H3>
      <Ul>
        <li>계약 기간 1년 이상 임대차 계약</li>
        <li>전세보증금이 수도권 7억 이하, 지방 5억 이하</li>
        <li>전세보증금 ÷ 주택시세 ≤ 90% (전세가율 90% 이하)</li>
        <li>임대인의 세금 체납이 없어야 함</li>
        <li>계약 만료 6개월 전까지 가입 가능</li>
      </Ul>
      <H3>가입 절차</H3>
      <div className="space-y-2 mb-4">
        {[
          '전세 계약 체결 후 전입신고·확정일자 완료',
          'HUG 또는 연계 은행(국민·신한·우리 등) 방문 또는 앱 신청',
          '주택 시세 확인(KB시세·감정가 기준), 선순위 채권 확인',
          '보증료 납부 (전세금 × 보증료율 × 계약 기간)',
          '보증서 발급 → 이후 만기까지 보호',
        ].map((text, i) => (
          <div key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <H2 id="loan-guarantee">대출 보증서 활용법</H2>
      <P>
        전세대출을 받을 때 은행은 보증 기관의 보증서를 요구합니다. 보증서가 있어야 은행이 전세대출을 실행해 줍니다. 이 보증서는 은행 대출 상환을 보증하는 것으로, 전세보증금반환보증과 별개입니다.
      </P>
      <Ul>
        <li>HUG 보증: 은행이 HUG에 보증 신청 → 보증서 발급 → 전세대출 실행</li>
        <li>HF 보증: 정책 전세대출(버팀목 등)과 연계. HF 보증 후 은행 대출 실행</li>
        <li>SGI 보증: 별도 창구 방문 또는 연계 은행에서 신청. 소득 조건 없어 편리</li>
      </Ul>

      <H2 id="fee">보증료 계산과 절약 방법</H2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        보증료 = 전세보증금 × 연 보증료율 × 보증 기간(년)
      </div>
      <P>
        예시: 전세보증금 3억원, HUG 보증료율 0.04%, 2년 → 3억 × 0.04% × 2 = 24만원
      </P>
      <H3>보증료 절약 방법</H3>
      <Ul>
        <li>신용점수가 높을수록 보증료율 인하 (HUG 기준 800점 이상 우대)</li>
        <li>무주택자, 신혼부부, 청년 등 우대 대상 확인</li>
        <li>HUG 청년 전세보증: 만 34세 이하 청년 50% 보증료 지원 사업 확인</li>
      </Ul>

      <H2 id="tips">실전 활용 전략</H2>
      <Ul>
        <li><strong className="font-semibold">전세 계약 즉시 보증 가입:</strong> 잔금 지급일 이후 최대한 빠르게 전입신고 후 전세보증보험 신청</li>
        <li><strong className="font-semibold">전세대출 보증과 반환보증 동시 가입:</strong> 두 보증은 별개 상품. 대출 보증만 있으면 집주인 사정으로 보증금 미반환 시 보호받지 못함</li>
        <li><strong className="font-semibold">등기부등본 선순위 채권 확인:</strong> [전세금 + 선순위채권] ÷ 시세 ≤ 80%여야 안전권</li>
        <li><strong className="font-semibold">갱신 시 재가입 잊지 않기:</strong> 계약 연장 시 기존 보증은 자동 연장되지 않는 경우 있음. 반드시 확인</li>
      </Ul>
    </GuideLayout>
  )
}
