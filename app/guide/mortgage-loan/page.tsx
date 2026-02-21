import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '주택담보대출 완전 정리 | ohyess 가이드',
  description:
    '주택담보대출 종류·한도 계산(LTV·DTI·DSR)·금리 비교·신청 절차까지, 2026년 최신 규제 기준으로 완전 정리합니다.',
  openGraph: {
    title: '주택담보대출 완전 정리',
    description: '주담대 한도·금리·절차를 실전 사례로 완전 정리',
    type: 'article',
  },
}

const tocItems = [
  { id: 'types', label: '주담대 종류 한눈에 보기' },
  { id: 'limit', label: '실제 한도 계산법 (LTV·DSR·DTI)' },
  { id: 'rate', label: '금리 구조와 결정 요인' },
  { id: 'process', label: '신청부터 실행까지 7단계 절차' },
  { id: 'cases', label: '실전 사례 2개' },
  { id: 'tips', label: '한도·금리 올리는 실용 전략' },
]

const ctas = [
  {
    label: '주택담보대출 한도 계산기',
    href: '/calculator/loan-limit',
    description: 'LTV·DSR 기준 실제 대출 가능 금액 즉시 계산',
  },
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '원금·금리·기간으로 월납입액·총이자 계산',
  },
]

const relatedGuides = [
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', description: '3가지 지표로 실제 대출 한도 계산하는 법' },
  { title: '전세대출 완전 정리', href: '/guide/jeonse-loan', description: '전세대출 종류·조건·한도 완전 가이드' },
  { title: '상환방식 완전 비교', href: '/guide/repayment-types', description: '원리금균등·원금균등·만기일시 총이자 비교' },
  { title: '중도상환수수료 완전 정리', href: '/guide/early-repayment-fee', description: '중도상환 시 수수료 아끼는 법' },
]

const faqs = [
  {
    question: '주택담보대출 LTV 규제 기준은 어디서 확인하나요?',
    answer:
      '금융위원회·금융감독원이 지정한 조정대상지역·투기과열지구는 한국부동산원 홈페이지에서 확인 가능합니다. 2025년 현재 수도권 전반과 일부 지방 광역시가 규제지역으로 지정되어 있으며, 지역별 LTV 한도가 다르므로 대출 전 반드시 확인해야 합니다.',
  },
  {
    question: '같은 주택이라도 은행마다 한도가 다른 이유는 무엇인가요?',
    answer:
      '은행마다 자체 내부 신용 심사 기준이 다릅니다. 법정 LTV·DSR 최대치는 동일하지만, 은행이 자체적으로 더 엄격한 기준을 적용할 수 있습니다. 또한 감정가를 어떻게 산정하느냐에 따라 담보 가치가 달라지고, 이에 따라 한도도 차이가 납니다. 최소 2~3곳 비교가 필수입니다.',
  },
  {
    question: '주담대 받은 뒤 집값이 떨어지면 추가 담보 제공해야 하나요?',
    answer:
      '원칙적으로 가능합니다. 은행이 담보 가치 재평가 후 "담보 부족" 상태가 되면 추가 담보 제공이나 일부 상환을 요구할 수 있습니다(담보 유지 비율). 다만 실제 적용되는 경우는 드물며, 주로 담보 가치 하락폭이 크거나 연체가 발생한 경우입니다.',
  },
  {
    question: '전세를 끼고 구입한 경우 주담대 한도 계산이 달라지나요?',
    answer:
      '네, 다릅니다. 전세보증금(임차보증금)이 있는 경우 담보 주택 가치에서 전세보증금을 뺀 금액을 기준으로 LTV를 계산합니다. 이른바 "갭투자" 주택은 이 차이 때문에 주담대 한도가 크게 줄어들 수 있습니다.',
  },
  {
    question: '주담대 금리를 신청 후 낮출 수 있나요?',
    answer:
      '가능합니다. 신용점수 상승, 소득 증가 등 조건 변화가 있다면 "금리 인하 요구권"을 행사할 수 있습니다. 또한 다른 금융사의 더 낮은 금리로 대환대출(갈아타기)도 가능하지만, 중도상환수수료와 새 대출 부대비용을 먼저 비교해야 합니다.',
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
function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
}
function CaseBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 border-l-4 border-blue-400 rounded-r-lg p-5 mb-6">
      <p className="font-semibold text-gray-900 mb-3 text-[15px]">{title}</p>
      {children}
    </div>
  )
}
function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 text-sm text-amber-900">
      {children}
    </div>
  )
}

export default function MortgageLoanGuidePage() {
  return (
    <GuideLayout
      title="주택담보대출 완전 정리 — 한도·금리·절차 한 번에 이해하기"
      description="주택담보대출의 종류부터 실제 대출 한도 계산(LTV·DSR·DTI), 은행별 금리 비교 방법, 신청·실행 7단계 절차까지 2026년 기준으로 완전 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <GeminiImage
        src="/images/guide/mortgage-loan.png"
        placeholderColor="blue"
        alt="주택담보대출 개요 일러스트"
        className="mb-8"
        height={300}
      />

      <H2 id="types">주담대 종류 한눈에 보기</H2>
      <P>
        주택담보대출은 크게 <strong className="font-semibold text-gray-900">은행권 주담대</strong>와{' '}
        <strong className="font-semibold text-gray-900">정책 주담대</strong>로 나뉩니다. 두 경로의 한도·금리·조건이 상이하므로, 자신에게 유리한 경로를 먼저 파악하는 것이 중요합니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">구분</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">대표 상품</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">금리 수준</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">주요 조건</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-medium">시중은행</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">일반 주담대</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">연 3.5~5.5%</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">신용점수·소득 반영</td>
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-gray-200 px-3 py-3 font-medium text-blue-800">정책금융</td>
              <td className="border border-gray-200 px-3 py-3 text-blue-700">보금자리론·디딤돌</td>
              <td className="border border-gray-200 px-3 py-3 text-blue-700">연 2.65~3.95%</td>
              <td className="border border-gray-200 px-3 py-3 text-blue-700">소득 7천만원 이하 등</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-medium">인터넷은행</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">카카오·케이뱅크</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">연 3.2~4.8%</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">비대면, 빠른 심사</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-medium">저축은행·캐피탈</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">후순위 담보</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">연 6~12%</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">은행권 거절 시 대안</td>
            </tr>
          </tbody>
        </table>
      </div>
      <InfoBox>
        <strong>정책 주담대 우선 검토:</strong> 소득·자산 기준을 충족한다면 보금자리론·디딤돌대출이 시중은행보다 0.5~1.5%p 저렴합니다. 먼저 정책금융 자격 여부를 확인하세요.
      </InfoBox>

      <H2 id="limit">실제 한도 계산법 (LTV·DSR·DTI)</H2>
      <P>
        주담대 한도는 세 가지 규제 중 가장 엄격한 기준에 의해 결정됩니다. 어느 하나라도 초과하면 대출이 불가능합니다.
      </P>
      <H3>① LTV (담보인정비율) — 집값 대비 얼마까지</H3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 font-mono text-sm text-blue-900">
        LTV = 대출금 ÷ 주택 감정가 × 100
      </div>
      <P>
        2026년 현재 규제지역(조정대상지역) 무주택자 기준 LTV 최대 70%가 적용됩니다. 6억짜리 아파트라면 최대 4억 2천만원까지 담보가치로 인정됩니다. 1주택자는 60%, 다주택자는 더 낮거나 대출이 제한됩니다.
      </P>
      <H3>② DSR (총부채원리금상환비율) — 소득 대비 전체 부채 상환액</H3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 font-mono text-sm text-blue-900">
        DSR = 연간 모든 대출 원리금 상환액 ÷ 연소득 × 100 ≤ 40%
      </div>
      <P>
        은행권 기준 DSR 40% 상한이 적용됩니다. 연 소득 5천만원이라면 기존 대출 포함 연간 총 상환액이 2천만원(월 167만원)을 초과할 수 없습니다. 이미 신용대출이나 자동차 할부가 있다면 그만큼 주담대 한도가 줄어듭니다.
      </P>
      <H3>③ DTI (총부채상환비율) — 소득 대비 신규 대출 상환액</H3>
      <P>
        DTI는 신규 주담대 원리금 + 기타 대출 이자를 연소득으로 나눈 비율입니다. 조정대상지역 기준 40~50% 상한이 적용됩니다. DSR이 더 포괄적이므로, 현재 실무에서는 DSR이 사실상 핵심 규제입니다.
      </P>

      <H2 id="rate">금리 구조와 결정 요인</H2>
      <GeminiImage
        src="/images/guide/mortgage-loan-rates.png"
        placeholderColor="indigo"
        alt="주담대 금리 구조 차트"
        className="mb-6"
        height={250}
      />
      <P>
        주담대 금리는 <strong className="font-semibold">기준금리(COFIX 또는 금융채) + 가산금리 - 우대금리</strong> 구조로 결정됩니다.
      </P>
      <Ul>
        <li><strong className="font-semibold">COFIX 기준:</strong> 변동금리 주담대의 대표 기준. 시중은행 자금조달 비용 반영. 6개월 또는 12개월 단위 변동</li>
        <li><strong className="font-semibold">금융채 기준:</strong> 고정금리 주담대에 주로 사용. 5년물 은행채 금리 기준</li>
        <li><strong className="font-semibold">가산금리:</strong> 은행 수익 + 운영비 + 리스크 프리미엄. 보통 1.0~2.0%p</li>
        <li><strong className="font-semibold">우대금리:</strong> 급여이체·적금·카드 실적 따라 최대 0.5~0.8%p 할인</li>
      </Ul>
      <P>
        같은 은행에서 같은 날 신청해도 우대금리 적용 여부에 따라 최대 0.8%p 차이가 납니다. 주거래 은행 지정, 급여 이체, 자동이체 설정 등으로 우대금리를 최대한 챙기는 것이 중요합니다.
      </P>

      <H2 id="process">신청부터 실행까지 7단계 절차</H2>
      <P>
        주담대 신청 후 실행까지 보통 2~4주가 소요됩니다. 각 단계에서 준비해야 할 서류와 주의사항을 정리했습니다.
      </P>
      <div className="space-y-3 mb-6">
        {[
          { step: '1', title: '사전 심사 (1~2일)', desc: '금융사 앱 또는 방문 — 소득·신용·담보 기초 심사. 예상 한도·금리 확인 단계' },
          { step: '2', title: '대출 신청 (1일)', desc: '신청서 작성, 소득 서류(근로소득원천징수영수증·건강보험료 납부확인서) 제출' },
          { step: '3', title: '담보 감정 (3~5일)', desc: '은행 지정 감정평가사가 주택 가치 평가. 감정가가 매매가보다 낮을 수 있음' },
          { step: '4', title: '심사 및 승인 (3~7일)', desc: 'DSR·DTI·LTV 종합 심사. 추가 서류 요청 가능' },
          { step: '5', title: '대출 약정 체결 (1일)', desc: '금리·상환 방식·기간 최종 확정. 인지세·근저당 설정비 납부' },
          { step: '6', title: '근저당 설정 등기 (3~5일)', desc: '법무사가 주택에 근저당 설정. 등록면허세·법무사 수수료 발생' },
          { step: '7', title: '대출 실행 (1일)', desc: '잔금 지급일 또는 약정일에 대출금 입금' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex gap-3">
            <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {step}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-gray-600 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <H2 id="cases">실전 사례로 직접 계산해보기</H2>
      <CaseBox title="사례 1 — 직장인 부부, 서울 아파트 6억 구입 (조정대상지역)">
        <P>연 합산 소득 8,000만원. 기존 대출 없음. 보유 현금 2억원.</P>
        <Ul>
          <li>LTV 70% 적용: 6억 × 70% = 4.2억 → 최대 담보한도 4.2억</li>
          <li>DSR 40%: 연 소득 8천만원 × 40% = 3,200만원/년 → 월 267만원까지 상환 가능</li>
          <li>3억 5천만원, 연 4.0%, 30년 원리금균등 → 월납입 약 167만원 → DSR 25% 적정</li>
          <li>자기자금 2억 + 대출 3.5억 + 기타비용 5천만원 충당 가능</li>
          <li><strong>결론: 3억 5천~4억 수준 대출 실행 가능</strong></li>
        </Ul>
      </CaseBox>
      <CaseBox title="사례 2 — 1주택자, 실거주 주택을 담보로 사업 자금 조달">
        <P>서울 아파트 시세 8억 (1주택). 기존 주담대 잔액 2억. 추가 자금 필요.</P>
        <Ul>
          <li>1주택자 추가 대출: 기존 대출 포함 LTV 60% → 8억 × 60% = 4.8억</li>
          <li>이미 2억 대출 중 → 추가 한도 최대 2.8억</li>
          <li>DSR: 기존 대출 월납 포함 전체 상환액이 소득의 40% 이하여야 함</li>
          <li>연소득 6천만원 → 월 상환 한도 200만원 → 기존 납입분 제외 추가 가능액 산출 필요</li>
          <li><strong>결론: DSR이 더 엄격한 제한이 될 수 있어 은행 상담 필수</strong></li>
        </Ul>
      </CaseBox>

      <H2 id="tips">한도·금리 올리는 실용 전략</H2>
      <H3>1. 주거래 은행 집중하기</H3>
      <P>
        급여 이체·적금·신용카드를 한 은행에 집중하면 우대금리가 최대 0.5~0.8%p 적용됩니다. 1억 대출 기준 0.5%p 차이는 연 50만원, 30년이면 1,500만원 이상의 이자 차이입니다.
      </P>
      <H3>2. 배우자 소득 합산 신청</H3>
      <P>
        배우자가 소득이 있다면 부부 합산 소득으로 DSR을 계산해 한도를 늘릴 수 있습니다. 단, 배우자도 공동 채무자가 되므로 신용점수에 영향을 미칩니다.
      </P>
      <H3>3. 기존 부채 정리 후 신청</H3>
      <P>
        신용대출, 카드론, 자동차 할부 등이 있다면 DSR 계산에 포함됩니다. 신청 전 소액 부채를 정리하면 주담대 한도를 늘리고 금리도 낮출 수 있습니다.
      </P>
      <H3>4. 신용점수 관리 선행</H3>
      <P>
        신용점수 700점대 초반과 800점대 초반은 대출 금리 차이가 0.3~0.8%p까지 납니다. 대출 신청 6개월 전부터 카드 연체 없애기, 신용카드 사용률 30% 이하 유지, 불필요한 대출 조회 자제 등으로 점수를 관리하세요.
      </P>
    </GuideLayout>
  )
}
