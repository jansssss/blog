import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '대출 거절 이유와 극복 전략 완전 정리 | ohyess 가이드',
  description:
    '대출이 거절되는 5가지 핵심 이유, 거절 후 재신청 전략, 신용점수·DSR·LTV 개선 방법까지 실전 가이드로 완전 정리합니다.',
  openGraph: {
    title: '대출 거절 이유와 극복 전략',
    description: '거절 이유 파악부터 재신청 성공까지 완전 가이드',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/loan-rejection',
  },
}

const tocItems = [
  { id: 'reasons', label: '대출 거절의 5가지 핵심 이유' },
  { id: 'checkreason', label: '거절 이유 정확히 파악하는 법' },
  { id: 'credit', label: '신용점수 문제 해결 전략' },
  { id: 'dsr', label: 'DSR 초과 문제 해결 전략' },
  { id: 'income', label: '소득 증빙 강화 전략' },
  { id: 'alternatives', label: '은행 외 대안 대출 경로' },
  { id: 'cases', label: '실전 사례 2개' },
]

const ctas = [
  {
    label: '대출 한도 계산기',
    href: '/calculator/loan-limit',
    description: '현재 조건에서 가능한 대출 한도 미리 계산',
  },
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '상환 가능한 금액 역산 계산',
  },
]

const relatedGuides = [
  { title: '신용점수 완전 정리', href: '/guide/credit-score', description: '신용점수 올리는 현실적인 방법' },
  { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', description: 'DSR·DTI·LTV 규제 이해와 한도 계산' },
  { title: '대출 전 필수 체크리스트', href: '/guide/loan-checklist', description: '대출 신청 전 반드시 확인할 항목' },
  { title: '대출 종류 완전 가이드', href: '/guide/loan-types-complete', description: '내 상황에 맞는 대출 종류 찾기' },
]

const faqs = [
  {
    question: '대출 거절 이유를 은행에서 알려주지 않아도 되나요?',
    answer:
      '금융소비자보호법에 따라 은행은 거절 사유를 고객에게 알려야 합니다. 단, 구체적인 내부 심사 기준까지 공개할 의무는 없습니다. "신용점수 미달", "DSR 초과" 등 주요 사유는 통보 받을 수 있으니 반드시 확인하세요.',
  },
  {
    question: '여러 은행에 동시 신청하면 신용점수에 영향을 주나요?',
    answer:
      '단기간에 여러 곳에서 대출 조회(심사 목적)를 받으면 신용점수에 부정적인 영향을 줍니다. 다만 단순 금리 조회나 서비스 비교 목적 조회는 영향이 없습니다. 심사 신청은 최적 조건을 확인한 후 1~2곳으로 압축해서 진행하는 것이 좋습니다.',
  },
  {
    question: '거절 후 얼마나 지나면 재신청이 가능한가요?',
    answer:
      '법적 재신청 대기 기간은 없습니다. 다만 거절 직후 재신청은 같은 이유로 다시 거절될 가능성이 높습니다. 거절 사유를 개선(신용점수 향상, 부채 상환, 소득 증빙 강화 등)한 후 재신청하는 것이 효과적입니다. 통상 3~6개월 이상의 개선 기간이 필요합니다.',
  },
  {
    question: '인터넷은행이 시중은행보다 심사가 쉬운가요?',
    answer:
      '반드시 그렇지는 않습니다. 인터넷은행(카카오·토스·케이뱅크)은 자체 신용 모형을 사용하며, 일부 경우 시중은행보다 유연한 심사를 합니다. 하지만 DSR·LTV 규제는 동일하게 적용됩니다. 시중은행에서 거절된 경우 인터넷은행이나 지방은행을 대안으로 검토할 수 있습니다.',
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

export default function LoanRejectionPage() {
  return (
    <GuideLayout
      title="대출 거절 이유와 극복 전략 — 거절 후 재신청 성공 완전 가이드"
      description="대출 심사에서 거절되는 5가지 핵심 이유를 파악하고, 신용점수·DSR·소득 증빙을 개선해 재신청 성공률을 높이는 실전 전략을 완전 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <GeminiImage
        src="/images/guide/loan-rejection.png"
        placeholderColor="rose"
        alt="대출 거절 후 극복 전략 일러스트"
        className="mb-8"
        height={280}
      />

      <H2 id="reasons">대출 거절의 5가지 핵심 이유</H2>
      <P>
        은행이 대출을 거절하는 이유는 크게 5가지입니다. 어떤 이유인지 파악해야 올바른 해결책을 찾을 수 있습니다.
      </P>
      <div className="space-y-3 mb-6">
        {[
          { num: '1', title: '신용점수 미달', desc: '시중은행 기준 보통 KCB 700점, NICE 700점 이상 필요. 연체 이력, 다수 채무가 점수를 낮춤', color: 'bg-red-100 text-red-700' },
          { num: '2', title: 'DSR 초과', desc: '기존 대출 원리금 합계가 연소득의 40%를 초과하면 추가 대출 불가', color: 'bg-orange-100 text-orange-700' },
          { num: '3', title: '소득 증빙 불충분', desc: '프리랜서·자영업자·무직자의 경우 소득 서류 미비로 거절. 소득이 있어도 증빙이 없으면 인정 안 됨', color: 'bg-yellow-100 text-yellow-700' },
          { num: '4', title: 'LTV 초과 (담보 부족)', desc: '주담대의 경우 주택 감정가 × LTV 비율을 초과하는 금액 요청 시 거절', color: 'bg-blue-100 text-blue-700' },
          { num: '5', title: '자체 심사 기준 미달', desc: '연체 이력, 직업 안정성, 재직 기간, 부채 구성 등 은행 내부 기준 불충족', color: 'bg-purple-100 text-purple-700' },
        ].map(({ num, title, desc, color }) => (
          <div key={num} className="flex gap-3 p-4 border border-gray-200 rounded-lg">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>{num}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <H2 id="checkreason">거절 이유 정확히 파악하는 법</H2>
      <Ul>
        <li><strong className="font-semibold">은행 담당자에게 직접 문의:</strong> 법적으로 거절 사유 고지 의무 있음. "어떤 부분이 문제인가요?"라고 명확히 물어보세요</li>
        <li><strong className="font-semibold">신용점수 조회:</strong> KCB(올크레딧·카카오페이), NICE(나이스평가정보·토스)에서 무료 조회. 점수와 등급, 부정 요소 확인</li>
        <li><strong className="font-semibold">DSR 자체 계산:</strong> 기존 모든 대출의 월 원리금 합계 ÷ 월소득 × 100. 40% 초과 여부 직접 계산</li>
        <li><strong className="font-semibold">신용정보 열람:</strong> 금융거래 연체·연체 해제 이력, 채무 조정 이력 확인 (금융감독원 금융소비자정보포털)</li>
      </Ul>

      <H2 id="credit">신용점수 문제 해결 전략</H2>
      <WarnBox>
        신용점수는 단기간에 극적으로 올리기 어렵습니다. 최소 3~6개월의 꾸준한 관리가 필요합니다.
      </WarnBox>
      <H3>즉시 효과 (1~2개월)</H3>
      <Ul>
        <li>연체 즉시 상환: 5만원 이하 소액 연체도 큰 감점 요인. 즉시 상환</li>
        <li>체크카드·신용카드 사용액 정상 결제: 미납 없애기</li>
        <li>인터넷은행·핀테크 신용 데이터 제출: 토스·카카오페이 통신비·공과금 납부 이력 등록</li>
      </Ul>
      <H3>중기 효과 (3~6개월)</H3>
      <Ul>
        <li>신용카드 사용률 30% 이하 유지: 한도의 30% 이하 사용이 점수 최적화 포인트</li>
        <li>소액 신용대출 정기 납부: 소액이라도 정상 납부 이력이 쌓이면 점수 향상</li>
        <li>불필요한 대출 조회 자제: 심사 목적 조회는 단기간 집중 금지</li>
        <li>마이너스 통장 잔액 최소화: 한도 사용률이 낮을수록 신용도 유리</li>
      </Ul>

      <H2 id="dsr">DSR 초과 문제 해결 전략</H2>
      <P>
        DSR은 <strong className="font-semibold">모든 대출의 연간 원리금 합계 ÷ 연소득 × 100</strong>이며 40%가 상한입니다. 초과 시 두 가지 방향에서 해결할 수 있습니다.
      </P>
      <H3>방법 1: 기존 부채 줄이기</H3>
      <Ul>
        <li>소액 신용대출·카드론 우선 상환: 금액이 작아도 DSR 계산에 포함</li>
        <li>자동차 할부금 상환: 매월 납입액이 DSR에 직접 포함</li>
        <li>카드 할부 정리: 3~6개월 할부도 DSR 산정에 일부 반영</li>
      </Ul>
      <H3>방법 2: 소득 증가 (또는 배우자 소득 합산)</H3>
      <Ul>
        <li>배우자 소득 합산으로 공동 신청: DSR 분모(소득)가 커져 한도 증가</li>
        <li>겸업·부업 소득 증빙: 사업소득·임대소득 등 소득원 다각화 후 증빙 제출</li>
        <li>부채 상환 후 소득 증가 입증: 종합소득세 신고 이후 증빙 가능</li>
      </Ul>

      <H2 id="income">소득 증빙 강화 전략</H2>
      <P>
        프리랜서·자영업자는 소득이 있어도 증빙이 어렵다는 이유로 거절되는 경우가 많습니다.
      </P>
      <Ul>
        <li><strong className="font-semibold">종합소득세 신고 철저히:</strong> 소득세 신고 시 과소 신고하면 대출 한도가 줄어듭니다</li>
        <li><strong className="font-semibold">부가세 신고 내역 활용:</strong> 사업자의 경우 부가세 신고서가 소득 증빙 서류로 활용</li>
        <li><strong className="font-semibold">건강보험료 납부 기준 활용:</strong> 지역가입자 건강보험료를 기준으로 소득 역산 가능</li>
        <li><strong className="font-semibold">사업용 계좌 매출 실적 제출:</strong> 정기적인 매출 입금 내역이 소득 증빙 보완 자료로 활용</li>
      </Ul>

      <H2 id="alternatives">은행 외 대안 대출 경로</H2>
      <P>
        1금융권(시중은행) 거절 후 무턱대고 고금리 사금융으로 가는 것은 최악의 선택입니다. 아래 순서대로 검토하세요.
      </P>
      <div className="space-y-2 mb-5">
        {[
          { path: '인터넷은행 (카카오·케이뱅크·토스)', desc: '자체 신용 모형 사용. 시중은행 거절 후 1순위 대안', rate: '연 5~8%' },
          { path: '상호금융 (농협·수협·신협·새마을금고)', desc: '지역 밀착형, 개인 사정 반영 가능', rate: '연 6~10%' },
          { path: '저축은행', desc: '2금융권. 조건 완화되나 금리 상승', rate: '연 8~15%' },
          { path: '보증부 대출 (햇살론·사잇돌)', desc: '저신용·저소득자 정책대출. 보증재단 심사 통과 시 저금리', rate: '연 7~11%' },
          { path: 'P2P 대출', desc: '온투법 등록 업체 이용. 연체 시 신용 하락', rate: '연 8~18%' },
        ].map(({ path, desc, rate }) => (
          <div key={path} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">{path}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <span className="text-xs font-medium text-orange-600 shrink-0">{rate}</span>
          </div>
        ))}
      </div>
      <WarnBox>
        <strong>경고:</strong> 불법 사금융(미등록 대부업체)은 절대 이용 금지. 금융감독원 등록 여부(1332 신고센터) 반드시 확인.
      </WarnBox>

      <H2 id="cases">실전 사례 2개</H2>
      <CaseBox title="사례 1 — 신용점수 680점, 시중은행 주담대 거절 → 6개월 후 재신청 성공">
        <P>30대 직장인. 연소득 5천만원. 신용점수 680점(연체 이력 1건 있음). 주담대 거절.</P>
        <Ul>
          <li>원인: 과거 30만원 연체 이력(신용카드 미납 2개월) + 카드론 2,000만원 잔액</li>
          <li>1단계: 카드론 즉시 상환 (DSR 개선)</li>
          <li>2단계: 6개월간 카드 정상 납부, 사용률 25% 이하 유지</li>
          <li>3단계: 토스·카카오페이 통신비 납부 이력 등록</li>
          <li>6개월 후 신용점수 740점으로 회복</li>
          <li><strong>결론: 재신청 성공, 연 4.2% 주담대 실행. 꾸준한 관리가 답</strong></li>
        </Ul>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자, 소득 증빙 부족으로 거절 → 종합소득세 신고 후 재도전">
        <P>40대 자영업자. 실제 월매출 800만원이지만 세금 신고는 300만원. 대출 거절.</P>
        <Ul>
          <li>원인: 신고 소득 기준 DSR 계산 시 한도 초과. 실제 소득과 신고 소득 괴리</li>
          <li>해결책: 세무사 상담 후 종합소득세 수정 신고 + 이후 정기 성실 신고</li>
          <li>사업용 통장 매출 내역, 부가세 신고서 준비</li>
          <li>1년 후 신고 소득 기준 DSR 38% → 대출 가능 범위 내</li>
          <li><strong>결론: 장기적으로 성실 신고가 대출 한도를 높이는 유일한 방법</strong></li>
        </Ul>
      </CaseBox>
    </GuideLayout>
  )
}
