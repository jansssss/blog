import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '전세대출 완전 정리 | ohyess 가이드',
  description:
    '전세대출 종류(버팀목·주금공·시중은행), 한도 계산, 보증 구조, 2026년 전세 사기 예방 체크리스트까지 완전 정리합니다.',
  openGraph: {
    title: '전세대출 완전 정리',
    description: '전세대출 종류·한도·보증·주의사항 완전 가이드',
    type: 'article',
  },
}

const tocItems = [
  { id: 'types', label: '전세대출 3가지 경로' },
  { id: 'limit', label: '한도 계산 구조' },
  { id: 'guarantee', label: '보증 기관 3곳 비교' },
  { id: 'process', label: '신청 절차 5단계' },
  { id: 'fraud', label: '전세 사기 예방 체크리스트' },
  { id: 'cases', label: '실전 사례 2개' },
]

const ctas = [
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '전세대출 이자 월납입액 즉시 계산',
  },
]

const relatedGuides = [
  { title: '주택담보대출 완전 정리', href: '/guide/mortgage-loan', description: '매매 전환 시 필요한 주담대 가이드' },
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', description: '대출 한도 결정 3가지 핵심 지표' },
  { title: '신용점수 완전 정리', href: '/guide/credit-score', description: '전세대출 금리를 낮추는 신용점수 관리법' },
  { title: '대출 전 필수 체크리스트', href: '/guide/loan-checklist', description: '대출 신청 전 반드시 확인해야 할 항목' },
]

const faqs = [
  {
    question: '전세대출은 세입자 명의로만 받을 수 있나요?',
    answer:
      '네, 전세대출은 임차인(세입자) 본인 명의로만 신청 가능합니다. 임대인(집주인)이 대출을 받아 전세금을 받는 구조가 아닙니다. 세입자가 은행에서 전세보증금을 빌려 집주인에게 지불하는 구조입니다.',
  },
  {
    question: '전세대출 이자는 주담대보다 낮은가요?',
    answer:
      '정책 전세대출(버팀목)은 연 1.8~2.9% 수준으로 시중은행 주담대보다 훨씬 낮습니다. 다만 소득·자산 조건이 있습니다. 시중은행 전세대출은 연 3.5~5.0% 수준으로 주담대와 비슷하거나 약간 높은 편입니다.',
  },
  {
    question: '전세 계약이 만료되면 대출은 어떻게 되나요?',
    answer:
      '전세 계약 종료 시 전세대출도 원칙적으로 함께 상환해야 합니다. 새 전세 계약으로 이사가는 경우 기존 대출을 상환하고 새 주소 기준으로 재신청하거나, 같은 주소에서 재계약할 경우 대출 연장이 가능합니다. 이사 전 은행에 미리 문의해 상환 일정을 조율하는 것이 중요합니다.',
  },
  {
    question: '전세보증보험은 반드시 가입해야 하나요?',
    answer:
      '법적 의무는 아니지만 강력히 권고됩니다. 집주인이 전세금을 돌려주지 못할 경우(역전세, 경매 등) 보증기관(HUG·HF)이 대신 반환해주는 안전장치입니다. 보증료는 연 0.1~0.2% 수준으로 보호 효과 대비 매우 저렴합니다.',
  },
  {
    question: '깡통 전세인지 어떻게 확인하나요?',
    answer:
      '전세보증금이 주택 시세의 70~80% 이상이면 위험 신호입니다. 등기부등본(대법원 인터넷등기소)으로 선순위 근저당·압류 여부를 확인하세요. [전세금 + 선순위 채권합계]가 주택가격의 80%를 초과한다면 계약을 재검토해야 합니다.',
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
function CaseBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 border-l-4 border-blue-400 rounded-r-lg p-5 mb-6">
      <p className="font-semibold text-gray-900 mb-3 text-[15px]">{title}</p>
      {children}
    </div>
  )
}
function WarnBox({ children }: { children: ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 text-sm text-red-800">
      {children}
    </div>
  )
}

export default function JeonseLoangGuidePage() {
  return (
    <GuideLayout
      title="전세대출 완전 정리 — 종류·한도·보증·사기 예방까지"
      description="버팀목대출부터 시중은행 전세대출까지 3가지 경로 비교, 한도 계산 구조, 보증 기관 선택법, 전세 사기 예방 체크리스트를 2026년 기준으로 완전 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <GeminiImage
        src="/images/guide/jeonse-loan.png"
        placeholderColor="emerald"
        alt="전세대출 구조 일러스트"
        className="mb-8"
        height={280}
      />

      <H2 id="types">전세대출 3가지 경로</H2>
      <P>
        전세대출은 크게 <strong className="font-semibold">정책 전세대출(버팀목)</strong>, <strong className="font-semibold">주택금융공사(HF) 전세대출</strong>, <strong className="font-semibold">시중은행 전세대출</strong>로 나뉩니다.
      </P>
      <H3>① 버팀목 전세대출 (주택도시기금)</H3>
      <Ul>
        <li>대상: 무주택 세대주, 연 소득 5천만원 이하 (신혼 7천만원, 2자녀 이상 6천만원)</li>
        <li>금리: 연 1.8~2.9% (소득·보증금 구간별 차등)</li>
        <li>한도: 수도권 3억원, 지방 2억원 (전세금의 80% 이내)</li>
        <li>보증: 주택도시보증공사(HUG) 또는 주택금융공사(HF)</li>
      </Ul>
      <H3>② 주택금융공사(HF) 전세대출</H3>
      <Ul>
        <li>대상: 무주택자 (소득 제한 없음)</li>
        <li>금리: 연 3.2~4.5% (신용·소득에 따라 차등)</li>
        <li>한도: 수도권 2.2억원, 지방 1.8억원 (전세금의 80%)</li>
        <li>보증: HF 보증서 발급 → 시중은행에서 대출 실행</li>
      </Ul>
      <H3>③ 시중은행 자체 전세대출</H3>
      <Ul>
        <li>대상: 소득 조건 없음, 신용도 중심 심사</li>
        <li>금리: 연 3.5~5.5% (신용점수·주거래 실적 반영)</li>
        <li>한도: 전세금의 최대 80%, 은행별 상이</li>
        <li>보증: SGI서울보증 또는 HUG·HF 보증 선택 가능</li>
      </Ul>

      <H2 id="limit">한도 계산 구조</H2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        전세대출 한도 = Min(전세보증금 × 80%, 최대 한도, DSR 기준 상환 가능액)
      </div>
      <P>
        예를 들어 서울 전세보증금 3억원이라면: 3억 × 80% = 2.4억. 버팀목 기준 최대 3억이므로 한도 제약 없음. 단 DSR(연 소득 대비 상환액 40% 이하)을 초과하면 그 이하로 줄어듭니다.
      </P>
      <P>
        <strong className="font-semibold text-gray-900">중요한 포인트:</strong> 전세대출도 DSR 산정에 포함됩니다. 기존에 신용대출이나 주담대가 있다면 전세대출 추가로 DSR이 40%를 초과할 수 있습니다. 대출 신청 전 반드시 계산해야 합니다.
      </P>

      <H2 id="guarantee">보증 기관 3곳 비교</H2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">보증 기관</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">보증료율</th>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">특징</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-medium">HUG (주택도시보증공사)</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">연 0.02~0.05%</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">전세보증보험도 취급, 사고 시 직접 지급</td>
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-gray-200 px-3 py-3 font-medium text-blue-800">HF (주택금융공사)</td>
              <td className="border border-gray-200 px-3 py-3 text-blue-700">연 0.05~0.1%</td>
              <td className="border border-gray-200 px-3 py-3 text-blue-700">정책금융 보증 주력, 버팀목대출 보증</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-medium">SGI 서울보증</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">연 0.1~0.2%</td>
              <td className="border border-gray-200 px-3 py-3 text-gray-600">소득 제한 없어 고소득자도 이용 가능</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2 id="process">신청 절차 5단계</H2>
      <div className="space-y-3 mb-6">
        {[
          { step: '1', title: '임대차 계약 체결', desc: '전입신고·확정일자 기준일이 중요. 계약서에 "전세대출 이용" 특약 삽입 권고' },
          { step: '2', title: '보증 기관 선택 및 신청', desc: 'HUG·HF·SGI 중 조건에 맞는 보증 기관 선택 후 보증 신청' },
          { step: '3', title: '은행 대출 신청', desc: '보증서 or 확약서 지참해 은행에 전세대출 신청. 소득·신용 서류 제출' },
          { step: '4', title: '심사 및 승인 (3~5일)', desc: '보증 기관 + 은행 동시 심사. 집주인 동의서 필요한 경우 있음' },
          { step: '5', title: '대출 실행 (잔금일)', desc: '잔금일에 전세보증금 계좌로 입금. 이후 확정일자·전입신고 즉시 완료' },
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

      <H2 id="fraud">전세 사기 예방 체크리스트</H2>
      <WarnBox>
        <strong>주의:</strong> 전세 사기 피해는 수억원 손실로 이어질 수 있습니다. 계약 전 반드시 아래 항목을 확인하세요.
      </WarnBox>
      <Ul>
        <li>등기부등본 열람 — 근저당·가처분·압류 여부. [보증금 + 선순위채권] ÷ 시세 80% 이하인지 확인</li>
        <li>집주인 신원 확인 — 등기부 상 소유자와 계약자가 동일인인지 확인 (대리인 계약 시 위임장·인감증명서 필수)</li>
        <li>전입신고·확정일자 당일 완료 — 잔금 지급 당일 전입신고 및 확정일자 받아야 대항력 확보</li>
        <li>전세보증보험 가입 — HUG 전세보증금반환보증 가입 (보증료 연 0.1% 내외)</li>
        <li>공인중개사 자격증 확인 — 국가공간정보포털에서 면허 유효 여부 확인</li>
        <li>집주인 체납 국세·지방세 확인 — 집주인 동의하에 미납세금 열람 가능 (2023년부터 임차인 요구 시 의무 제공)</li>
      </Ul>

      <H2 id="cases">실전 사례 2개</H2>
      <CaseBox title="사례 1 — 신혼부부, 서울 전세 3억 5천만원 (버팀목 자격 해당)">
        <P>연 합산 소득 6,500만원 이하 신혼부부. 서울 전세 3억 5천만원 계약.</P>
        <Ul>
          <li>버팀목 신혼 금리: 연 2.1% (소득 구간 해당)</li>
          <li>한도: 3.5억 × 80% = 2.8억 → 버팀목 수도권 최대 3억 이내 → 2.8억 적용</li>
          <li>월 이자: 2.8억 × 2.1% ÷ 12 ≈ 49,000원</li>
          <li>2년 총이자: 약 1,176,000원 — 시중은행(4.5%) 대비 2.4억 절약 효과</li>
          <li><strong>결론: 버팀목 우선 신청, 잔여 부족분은 자체 저축으로 충당</strong></li>
        </Ul>
      </CaseBox>
      <CaseBox title="사례 2 — 직장인 A씨, 서울 전세 5억 (소득 초과로 버팀목 불가)">
        <P>연 소득 7,500만원. 서울 전세 5억원. 버팀목 소득 조건(5천만원) 초과.</P>
        <Ul>
          <li>시중은행 전세대출 신청: SGI 보증 활용</li>
          <li>한도: 5억 × 80% = 4억 → 은행 자체 한도 적용 시 최대 4억</li>
          <li>금리: 신용점수 840점 기준 연 3.8%</li>
          <li>월이자(4억 기준): 4억 × 3.8% ÷ 12 ≈ 127,000원</li>
          <li>자기자금 1.5억 + 대출 3.5억으로 구성 가능</li>
          <li><strong>결론: 자기자금 비중 높일수록 이자 절감. HF 전세대출도 병행 비교 추천</strong></li>
        </Ul>
      </CaseBox>
    </GuideLayout>
  )
}
