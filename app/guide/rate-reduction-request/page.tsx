import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'

export const metadata: Metadata = {
  title: '금리인하요구권 신청 방법 — 조건·서류·2026 자동신청 | ohyess',
  description:
    '취업·승진·소득 증가·부채 감소·신용점수 상승 후 금리인하요구권을 신청하는 방법을 정리합니다. 대상 대출, 증빙서류, 10영업일 통지, 거절 대응과 2026 마이데이터 자동신청까지 확인하세요.',
  alternates: { canonical: '/guide/rate-reduction-request' },
  openGraph: {
    title: '금리인하요구권 신청 방법 — 조건·서류·2026 자동신청',
    description: '내 대출이 대상인지 확인하고 수동 신청과 마이데이터 자동신청 중 맞는 방법을 선택하세요.',
    type: 'article',
  },
}

const tocItems = [
  { id: 'answer', label: '즉답: 신용상태 개선과 대출 금리 구조를 확인' },
  { id: 'eligibility', label: '신청 가능한 사유와 준비 서류' },
  { id: 'manual', label: '은행 앱·영업점 수동 신청 순서' },
  { id: 'automatic', label: '2026 마이데이터 자동신청 이용법' },
  { id: 'rejected', label: '거절 사유와 재신청 준비' },
  { id: 'savings', label: '금리 인하 시 이자 절감액 계산' },
  { id: 'checklist', label: '신청 전 최종 체크리스트' },
]

const ctas = [
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '현재 금리와 인하 예상 금리의 월납입액·총이자 비교',
  },
  {
    label: '금리 변동 영향 계산기',
    href: '/calculator/rate-change-impact',
    description: '금리가 0.1~1.0%p 달라질 때 부담 변화 확인',
  },
]

const relatedGuides = [
  {
    title: '금리 인상기 대출 전략',
    href: '/guide/rate-strategy',
    description: '금리인하요구·갈아타기·중도상환 중 맞는 대응 선택',
  },
  {
    title: '신용점수 완전 정리',
    href: '/guide/credit-score',
    description: '신용평점이 오르는 구조와 관리 방법',
  },
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '금리 차이가 월납입액과 총이자에 미치는 영향',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 계약 전 금리·우대조건·수수료 확인',
  },
]

const faqs = [
  {
    question: '금리인하요구권은 1년에 몇 번 신청할 수 있나요?',
    answer:
      '수동 신청은 법령상 연 2회 또는 6개월 간격으로 제한되지 않습니다. 금융위원회는 신용상태가 개선됐다면 신청 횟수와 신청 시점에 관계없이 권리를 행사할 수 있다고 설명합니다. 다만 2026년 마이데이터 자동신청은 서비스 운영상 정기 신청을 최대 월 1회 할 수 있습니다.',
  },
  {
    question: '모든 대출이 금리인하요구권 대상인가요?',
    answer:
      '아닙니다. 차주의 신용상태가 금리 산정에 영향을 주는 대출이어야 합니다. 신용상태와 무관하게 금리가 정해지는 상품은 대상이 아닐 수 있으므로 상품설명서와 금융회사 안내에서 대상 여부를 먼저 확인해야 합니다.',
  },
  {
    question: '신청하면 금융회사는 언제까지 답해야 하나요?',
    answer:
      '은행법 시행령상 은행은 요구를 받은 날부터 10영업일 이내에 수용 여부와 사유를 알려야 합니다. 금융회사가 자료 보완을 요청한 날부터 소비자가 자료를 제출한 날까지의 기간은 10영업일 계산에서 제외됩니다.',
  },
  {
    question: '거절되면 다시 신청할 수 있나요?',
    answer:
      '가능합니다. 대상 상품이 아님, 이미 최저 수준 금리 적용, 신용도 개선이 경미함 등 거절 사유를 먼저 확인하세요. 이후 소득 증가, 부채 감소, 신용평점 상승처럼 추가 개선이 생겼을 때 해당 자료를 갖춰 다시 신청하는 편이 효과적입니다.',
  },
  {
    question: '자동신청에 동의하면 무조건 금리가 내려가나요?',
    answer:
      '아닙니다. 마이데이터 사업자는 신청을 대신하지만 수용 여부와 인하 폭은 금융회사가 신용상태와 내부 금리 기준을 심사해 결정합니다. 불수용이면 대행 사업자가 구체적 사유와 개선 필요사항을 안내할 수 있습니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-20 border-b border-gray-100 pb-2 text-xl font-bold text-gray-900">
      {children}
    </h2>
  )
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-6 text-base font-semibold text-gray-800">{children}</h3>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[15px] leading-relaxed text-gray-700">{children}</p>
}

function Callout({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'amber' | 'emerald' }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }

  return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[tone]}`}>{children}</div>
}

export default function RateReductionRequestPage() {
  return (
    <GuideLayout
      pageUrl="/guide/rate-reduction-request"
      title="금리인하요구권 신청 방법 — 직접 신청부터 2026 자동신청까지"
      description="연봉이 오르거나 대출을 갚고 신용점수가 좋아졌다면 기존 대출의 금리를 다시 심사해달라고 요구할 수 있습니다. 내 대출이 대상인지부터 증빙, 신청, 거절 대응까지 순서대로 확인하세요."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 9월"
      publishedAt="2026년 9월 1일"
      reviewedAt="2026년 9월 1일"
      referenceDate="2026년 9월 1일 기준"
      appliesTo="신용상태가 금리 산정에 반영되는 개인·개인사업자 대출"
      sources={[
        {
          label: '국가법령정보센터 — 은행법 시행령 제18조의4',
          href: 'https://law.go.kr/LSW/lumLsLinkPop.do?chrClsCd=010202&lspttninfSeq=151463',
        },
        {
          label: '금융위원회 — 금리인하요구제도 운영 개선방안',
          href: 'https://www.fsc.go.kr/po010101/76792',
        },
        {
          label: '금융위원회 — 금리인하요구제도 실효성 제고방안',
          href: 'https://www.fsc.go.kr/po010105/79410',
        },
        {
          label: '금융위원회 — 2026 마이데이터 자동 금리인하요구 서비스',
          href: 'https://www.fsc.go.kr/po010105/86329',
        },
      ]}
    >
      <H2 id="answer">즉답: 신용상태가 좋아졌고 그 변화가 대출 금리에 반영될 수 있어야 한다</H2>
      <P>
        금리인하요구권은 단순히 &ldquo;금리가 높다&rdquo;는 이유로 시장금리를 내려달라고 요청하는 제도가 아닙니다.
        대출을 받은 뒤 <strong>차주의 신용상태가 개선</strong>됐고, 그 신용상태가 이용 중인 대출의 금리 산정에
        영향을 주는 경우 금융회사에 금리를 다시 심사해달라고 요구하는 권리입니다.
      </P>
      <Callout tone="emerald">
        <strong>신청을 검토할 때:</strong> 취업·승진·이직으로 소득이 늘었거나, 대출을 상환해 부채가 줄었거나,
        개인신용평점이 상승했다면 현재 대출의 대상 여부와 증빙서류부터 확인하세요.
      </Callout>
      <P>
        요구했다고 반드시 금리가 내려가는 것은 아닙니다. 금융회사는 신용상태 개선이 자체 신용등급과 금리 산정에
        영향을 주는지 심사합니다. 반대로 상품명만 보고 대상이 아니라고 단정해서도 안 됩니다. 공식 안내는
        <strong> 신용상태가 금리에 영향을 주지 않는 경우를 제외한 대출</strong>을 대상으로 설명합니다.
      </P>

      <H2 id="eligibility">신청 가능한 사유와 준비 서류</H2>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">개선 사유</th>
              <th className="border-b border-gray-200 px-4 py-3">현실적인 사례</th>
              <th className="border-b border-gray-200 px-4 py-3">준비할 자료 예시</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">소득·직업</td>
              <td className="border-b border-gray-100 px-4 py-3">취업, 승진, 이직, 전문자격 취득, 소득 증가</td>
              <td className="border-b border-gray-100 px-4 py-3">재직·경력·자격 증명, 원천징수영수증, 소득금액증명</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">재산·부채</td>
              <td className="border-b border-gray-100 px-4 py-3">자산 증가, 다른 대출 일부·전액 상환</td>
              <td className="border-b border-gray-100 px-4 py-3">상환 확인 자료, 금융자산·재산 증빙</td>
            </tr>
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">신용도</td>
              <td className="border-b border-gray-100 px-4 py-3">개인신용평점 또는 금융회사 내부신용등급 상승</td>
              <td className="border-b border-gray-100 px-4 py-3">신용평점 확인 자료, 금융회사가 요청하는 추가 자료</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="px-4 py-3 font-semibold">개인사업자</td>
              <td className="px-4 py-3">매출·이익 증가, 재무상태 개선, 신용평점 상승</td>
              <td className="px-4 py-3">소득금액증명, 부가세 자료, 재무제표 등</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout tone="amber">
        표의 서류는 일반적인 예시입니다. 인정 항목과 제출 방식은 금융회사·상품마다 다르므로 앱이나 영업점에서
        필요한 자료를 먼저 확인한 뒤 발급하세요.
      </Callout>
      <P>
        신용평점 상승 여부와 관리 방법은{' '}
        <Link href="/guide/credit-score" className="font-semibold text-indigo-600 hover:underline">신용점수 가이드</Link>에서
        확인할 수 있습니다. 점수가 올랐다는 사실만으로 승인되는 것은 아니며, 금융회사의 내부신용등급이나 거래실적도
        함께 반영될 수 있습니다.
      </P>

      <H2 id="manual">은행 앱·영업점에서 직접 신청하는 순서</H2>
      <div className="mb-5 space-y-3">
        {[
          ['1. 대상 상품 확인', '대출 상품설명서나 앱에서 금리인하요구권 대상인지 확인합니다.'],
          ['2. 개선 사유 선택', '소득·재산 증가, 신용도 상승, 기타 사유 중 실제로 증명할 수 있는 항목을 고릅니다.'],
          ['3. 자료 제출', '은행 앱·인터넷뱅킹·영업점에서 금융회사가 요구하는 증빙을 제출합니다.'],
          ['4. 결과 확인', '금융회사는 원칙적으로 10영업일 이내 수용 여부와 사유를 알려야 합니다.'],
          ['5. 변경 금리 확인', '승인되면 변경 전후 금리와 적용 시점, 월납입액 변화를 확인합니다.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-1 text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-sm leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </div>
      <P>
        10영업일은 달력상 10일과 다릅니다. 주말·공휴일은 포함하지 않고, 금융회사가 자료 보완을 요구한 날부터
        소비자가 보완자료를 제출한 날까지도 법정 처리기간에서 제외됩니다.
      </P>
      <Callout tone="blue">
        <strong>횟수 제한을 오해하지 마세요.</strong> 연 2회는 금융회사가 차주에게 제도를 정기 안내하는 횟수이지,
        소비자의 법정 신청 한도가 아닙니다. 공식 운영기준은 신용상태 개선이 있다면 신청 횟수·시점과 관계없이
        권리를 행사할 수 있다고 안내합니다.
      </Callout>

      <H2 id="automatic">2026 마이데이터 자동신청: 한 번 동의하고 변화를 대신 확인</H2>
      <P>
        2026년 2월 26일부터 마이데이터 사업자가 소비자를 대신해 금리인하요구권을 행사하는 서비스가 시행됐습니다.
        이용자는 참여 사업자 중 한 곳에 가입해 자산을 연결하고, 보유 대출계좌를 선택해 대행에 동의합니다.
      </P>
      <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-950">
        <p className="mb-2 font-semibold">자동신청 이용 흐름</p>
        <p>마이데이터 사업자 선택 → 자산 연결 → 대상 대출 선택 → 최초 1회 대행 동의 → 신용상태 개선 탐지 → 자동 신청 → 결과·개선사항 확인</p>
      </div>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <tbody className="text-gray-700">
            <tr>
              <th className="w-40 border-b border-gray-100 bg-gray-50 px-4 py-3 text-left">시행일</th>
              <td className="border-b border-gray-100 px-4 py-3">2026년 2월 26일</td>
            </tr>
            <tr>
              <th className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-left">초기 참여</th>
              <td className="border-b border-gray-100 px-4 py-3">마이데이터 사업자 13개사, 금융회사 57개사</td>
            </tr>
            <tr>
              <th className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-left">정기 신청</th>
              <td className="border-b border-gray-100 px-4 py-3">대행 사업자가 최대 월 1회 신청 가능, 명확한 개선 사유가 있으면 수시 신청 가능</td>
            </tr>
            <tr>
              <th className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-left">사업자 변경</th>
              <td className="border-b border-gray-100 px-4 py-3">최초 동의일부터 90일이 지나야 다른 대행 사업자로 변경 가능</td>
            </tr>
            <tr>
              <th className="bg-gray-50 px-4 py-3 text-left">동의 재확인</th>
              <td className="px-4 py-3">대행 동의 의사를 연 1회 재확인</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        초기 참여 마이데이터 사업자는 비바리퍼블리카, 네이버페이, 카카오페이, 핀다, 뱅크샐러드, 나이스평가정보,
        기업·신한·우리·NH농협·KB국민은행, 롯데·삼성카드입니다. 참여 범위는 이후 달라질 수 있으므로 신청 화면과
        금융위원회 최신 공지를 기준으로 확인하세요.
      </P>

      <H2 id="rejected">거절 사유를 읽고 다음 신청을 준비하는 법</H2>
      <P>불수용 통지는 끝이 아니라 다음 행동을 정하는 자료입니다. 먼저 아래 세 유형 중 어디에 해당하는지 확인하세요.</P>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ['대상 상품 아님', '신용상태가 금리에 영향을 주지 않는 상품인지 상품설명서와 금융회사에 재확인'],
          ['이미 최저 수준 금리', '추가 인하 여지가 작은 상태이므로 우대금리 유지조건이나 갈아타기 비용을 비교'],
          ['개선 폭이 경미함', '내부신용등급에 반영된 정보와 부족한 항목을 확인하고 추가 개선 후 재신청'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </div>
      <P>
        금융위원회 개선안은 신청자가 원하면 신용도 평가에 활용된 정보 내역을 제공하도록 안내합니다. 막연히 다시
        신청하기보다 소득, 부채, 연체 여부, 거래실적 중 무엇이 실제 심사에 반영됐는지 확인하세요. 금리인하 여지가
        없다면{' '}
        <Link href="/calculator/refinancing" className="font-semibold text-indigo-600 hover:underline">갈아타기 손익 계산기</Link>로
        중도상환수수료와 부대비용을 뺀 순절감액을 비교할 수 있습니다.
      </P>

      <H2 id="savings">금리가 내려가면 얼마나 아끼는가</H2>
      <P>
        만기일시상환처럼 잔액이 그대로라면 연간 단순 절감액은 <strong>대출 잔액 × 인하 금리차</strong>로 빠르게
        계산할 수 있습니다. 원리금균등·원금균등은 매달 잔액이 줄기 때문에 실제 절감액이 단순 계산보다 작습니다.
      </P>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">대출 잔액</th>
              <th className="border-b border-gray-200 px-4 py-3">금리 인하폭</th>
              <th className="border-b border-gray-200 px-4 py-3">연간 단순 절감액</th>
              <th className="border-b border-gray-200 px-4 py-3">월 단순 환산</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3">1억원</td>
              <td className="border-b border-gray-100 px-4 py-3">0.3%p</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold text-emerald-700">30만원</td>
              <td className="border-b border-gray-100 px-4 py-3">2만5천원</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3">2억원</td>
              <td className="border-b border-gray-100 px-4 py-3">0.3%p</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold text-emerald-700">60만원</td>
              <td className="border-b border-gray-100 px-4 py-3">5만원</td>
            </tr>
            <tr>
              <td className="px-4 py-3">3억원</td>
              <td className="px-4 py-3">0.5%p</td>
              <td className="px-4 py-3 font-semibold text-emerald-700">150만원</td>
              <td className="px-4 py-3">12만5천원</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout tone="blue">
        표는 잔액이 1년 동안 변하지 않는 단순 참고값입니다. 실제 월납입액과 총이자는 상환 방식, 남은 기간,
        금리 변경 적용일에 따라 달라지므로 승인된 새 금리로 계산기를 다시 돌리세요.
      </Callout>

      <H2 id="checklist">신청 전 최종 체크리스트</H2>
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <ul className="space-y-3 text-[15px] text-gray-700">
          <li>□ 현재 대출이 금리인하요구권 대상인지 상품설명서에서 확인했다.</li>
          <li>□ 대출 실행 후 실제로 달라진 소득·재산·부채·신용평점 항목이 있다.</li>
          <li>□ 금융회사가 인정하는 증빙서류와 발급 기준일을 확인했다.</li>
          <li>□ 수동 신청과 마이데이터 자동신청 중 개인정보 제공 범위까지 비교했다.</li>
          <li>□ 10영업일 처리기간과 자료 보완 기간 제외 규칙을 이해했다.</li>
          <li>□ 거절되면 사유와 신용평가 활용 정보 내역을 확인할 계획이다.</li>
          <li>□ 승인되면 변경 금리·적용일·월납입액을 새 상환표로 확인한다.</li>
        </ul>
      </div>
      <Callout tone="amber">
        금리인하요구권은 심사를 요구할 권리이며 인하를 보장하는 제도는 아닙니다. 대상 상품, 증빙 인정 범위,
        인하 폭은 금융회사별 내부 기준에 따라 달라질 수 있습니다.
      </Callout>

      <HubBacklink hub="refinancing-guide" />
    </GuideLayout>
  )
}
