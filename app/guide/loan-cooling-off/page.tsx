import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'

export const metadata: Metadata = {
  title: '대출 청약철회권 14일 — 중도상환과 비용 비교 | ohyess',
  description:
    '대출 실행 후 14일 안에 취소할 때 필요한 원금·사용 이자·부대비용과 신청 순서를 정리합니다. 청약철회와 중도상환 중 무엇이 유리한지 실제 숫자로 비교하세요.',
  alternates: { canonical: '/guide/loan-cooling-off' },
  openGraph: {
    title: '대출 청약철회권 14일 — 취소 비용과 신청 순서',
    description: '대출을 없던 일로 돌릴지 중도상환할지, 비용과 대출기록 차이로 판단하세요.',
    type: 'article',
  },
}

const tocItems = [
  { id: 'answer', label: '즉답: 14일 안에 돈까지 돌려줘야 완료' },
  { id: 'deadline', label: '14일을 세는 기준과 적용 대상' },
  { id: 'cost', label: '반환할 원금·이자·부대비용' },
  { id: 'compare', label: '청약철회 vs 중도상환 판단' },
  { id: 'examples', label: '신용대출·주담대 예시' },
  { id: 'steps', label: '신청부터 기록 확인까지 5단계' },
  { id: 'checklist', label: '마감 전 최종 체크리스트' },
]

const ctas = [
  {
    label: '중도상환수수료 계산기',
    href: '/calculator/prepayment-fee',
    description: '청약철회 반환비용과 비교할 중도상환수수료 계산',
  },
  {
    label: '대출 갈아타기 손익 계산기',
    href: '/calculator/refinancing',
    description: '다른 대출로 바꿀 때 수수료를 뺀 순절감액 확인',
  },
]

const relatedGuides = [
  {
    title: '중도상환수수료 완전 정리',
    href: '/guide/early-repayment-fee',
    description: '일반 중도상환의 수수료와 면제 조건 확인',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '계약 전 금리·비용·철회 조건 점검',
  },
  {
    title: '금리 인상기 대출 전략',
    href: '/guide/rate-strategy',
    description: '유지·중도상환·갈아타기 대응 비교',
  },
  {
    title: '금리인하요구권 신청 방법',
    href: '/guide/rate-reduction-request',
    description: '대출을 유지하면서 금리를 낮추는 방법',
  },
]

const faqs = [
  {
    question: '대출금이 들어온 날부터 무조건 14일인가요?',
    answer:
      '법은 계약서류를 받은 날을 기준으로 하고, 계약서류가 제공되지 않은 경우에는 계약체결일을 기준으로 합니다. 다만 실제 대출금 지급이 그보다 늦으면 지급일부터 14일을 계산합니다. 금융회사와 더 긴 기간을 약정했다면 그 기간이 적용될 수 있으므로 계약서와 앱의 정확한 마감일을 확인하세요.',
  },
  {
    question: '14일 안에 전화만 하면 청약철회가 끝나나요?',
    answer:
      '아닙니다. 대출성 상품은 철회 의사를 서면이나 인정되는 전자적 방법으로 표시하고, 원금·실제 사용기간 이자·금융회사가 제3자에게 지급한 비용까지 반환해야 효력이 발생합니다. 금융회사에 접수 방법과 당일 상환계좌·정산금액을 받아 기한 안에 모두 처리하세요.',
  },
  {
    question: '청약철회에도 비용이 드나요?',
    answer:
      '중도상환수수료나 위약금은 청구할 수 없지만 비용이 완전히 0원인 것은 아닙니다. 대출금을 쓴 기간의 약정이자와 인지세 등 제세공과금, 저당권 설정 등에 따른 등기비용처럼 금융회사가 제3자에게 이미 지급한 비용은 소비자가 반환해야 합니다.',
  },
  {
    question: '대출금 일부를 먼저 갚았어도 철회할 수 있나요?',
    answer:
      '철회 기간 안이라면 남은 원금과 법정 반환항목을 모두 정산하는 방식으로 처리할 수 있습니다. 법에 따라 금융회사는 철회 정산 후 소비자로부터 이미 받은 수수료 등을 3영업일 이내 반환해야 하므로, 앞선 일부상환 때 낸 수수료가 있다면 반환 대상과 시점을 함께 확인하세요.',
  },
  {
    question: '모든 대출에 청약철회권이 적용되나요?',
    answer:
      '대출성 상품은 원칙적으로 대상이지만 예외가 있습니다. 재화를 이미 받은 리스·할부금융·연불판매, 온라인투자연계금융업법상 연계대출, 철회기간에 담보증권이 처분된 증권 신용공여 등은 제외될 수 있습니다. 상품설명서에서 대상 여부를 확인하세요.',
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
    blue: 'border-blue-200 bg-blue-50 text-blue-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  }

  return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[tone]}`}>{children}</div>
}

export default function LoanCoolingOffPage() {
  return (
    <GuideLayout
      pageUrl="/guide/loan-cooling-off"
      title="대출 청약철회권 14일 — 중도상환보다 유리한지 판단하는 법"
      description="대출금을 받은 뒤 더는 필요 없거나 더 나은 조건을 찾았다면 14일 안에 계약을 철회할 수 있습니다. 다만 의사표시만으로 끝나지 않습니다. 기한, 반환금액, 중도상환과의 차이를 숫자로 확인하세요."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 9월"
      publishedAt="2026년 9월 4일"
      reviewedAt="2026년 9월 4일"
      referenceDate="2026년 9월 4일 기준"
      appliesTo="청약철회 대상인 일반금융소비자의 대출성 상품"
      sources={[
        {
          label: '국가법령정보센터 — 금융소비자보호법 제46조',
          href: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031294329',
        },
        {
          label: '국가법령정보센터 — 금융소비자보호법 시행령 제37조',
          href: 'https://law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=166931',
        },
        {
          label: '금융위원회 — 금융상품 거래단계별 소비자 체크리스트',
          href: 'https://www.fsc.go.kr/po010105/75631',
        },
      ]}
    >
      <H2 id="answer">즉답: 14일 안에 의사표시와 반환을 모두 끝내야 한다</H2>
      <P>
        대출 청약철회권은 단순한 중도상환이 아니라 계약을 소급해 취소하는 권리입니다. 현행 금융소비자보호법상
        일반금융소비자는 대상 대출성 상품의 계약서류를 받은 날부터 14일 안에 청약을 철회할 수 있습니다. 대출금이
        나중에 지급됐다면 그 지급일부터 계산합니다.
      </P>
      <Callout tone="emerald">
        <strong>가장 중요한 차이:</strong> 기한 안에 &ldquo;취소하겠다&rdquo;고 알리기만 해서는 부족합니다. 금융회사가
        안내한 방식으로 철회 의사를 표시하고, <strong>원금 + 실제 사용 이자 + 반환할 부대비용</strong>을 모두 돌려줘야
        대출성 상품의 철회 효력이 발생합니다.
      </Callout>
      <P>
        청약철회에는 중도상환수수료나 위약금이 붙지 않지만, 언제나 가장 싼 선택인 것은 아닙니다. 담보대출처럼
        인지세·등기비용이 발생했고 일반 중도상환수수료는 면제되는 경우라면 중도상환이 비용 면에서 더 나을 수 있습니다.
      </P>

      <H2 id="deadline">14일을 세는 기준과 적용 대상</H2>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">상황</th>
              <th className="border-b border-gray-200 px-4 py-3">14일 계산 시작 기준</th>
              <th className="border-b border-gray-200 px-4 py-3">확인할 증거</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3">계약서류를 정상 제공받음</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">계약서류 제공일</td>
              <td className="border-b border-gray-100 px-4 py-3">앱·이메일·문자 수신일, 교부 확인서</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3">계약서류 제공이 면제되거나 없었음</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">계약체결일</td>
              <td className="border-b border-gray-100 px-4 py-3">약정 완료 화면·계약 일시</td>
            </tr>
            <tr>
              <td className="px-4 py-3">대출금 지급이 위 기준일보다 늦음</td>
              <td className="px-4 py-3 font-semibold">실제 대출금 지급일</td>
              <td className="px-4 py-3">입금내역·대출 실행 확인서</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout tone="amber">
        달력만 보고 마지막 날까지 기다리지 마세요. 금융회사마다 접수 채널의 마감시각과 상환계좌 확인 절차가 다를 수
        있습니다. 계약서나 앱에서 표시하는 철회 만료일을 확인하고 가능하면 하루 이상 여유를 두고 정산하세요.
      </Callout>
      <H3>대상인지 먼저 확인해야 하는 예외</H3>
      <P>
        대출성 상품은 원칙적으로 적용되지만 시행령상 예외가 있습니다. 철회기간 안에 재화를 이미 받은 리스·할부금융·
        연불판매, 온라인투자연계금융업법상 연계대출, 담보증권이 이미 처분된 증권 신용공여 등이 대표적입니다. 금융위원회도
        신용카드 등 일부 계약은 예외가 될 수 있다고 안내합니다. 상품명만으로 단정하지 말고 상품설명서의
        &ldquo;청약철회권&rdquo; 항목을 확인하세요.
      </P>

      <H2 id="cost">반환할 돈: 원금 + 사용 이자 + 제3자 비용</H2>
      <P>철회를 실행하기 전 금융회사에 같은 날짜 기준의 정확한 정산금액을 요청하세요. 기본 구조는 다음과 같습니다.</P>
      <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center text-sm text-indigo-950">
        <p className="mb-2 text-xs font-semibold text-indigo-700">청약철회에 필요한 소비자 반환액</p>
        <p className="font-extrabold">남은 대출원금 + 실제 사용기간 약정이자 + 금융회사가 제3자에게 지급한 비용</p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ['원금', '이미 일부 상환했다면 철회일에 남아 있는 원금을 전부 정산'],
          ['사용 이자', '대출금 지급일부터 돌려주는 날까지 약정금리로 계산'],
          ['제3자 비용', '인지세 등 제세공과금, 저당권 설정 등기비용과 이에 준하는 비용'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </div>
      <P>
        금융회사는 청약철회에 따른 손해배상·위약금을 요구할 수 없습니다. 반대로 소비자가 위 금액을 반환한 뒤에는
        금융회사가 해당 대출과 관련해 이미 받은 수수료 등을 원칙적으로 3영업일 이내 돌려줘야 합니다. 입금액과 환급액이
        서로 다르므로 &ldquo;내가 보낼 총액&rdquo;과 &ldquo;나중에 돌려받을 금액&rdquo;을 구분해 서면으로 받는 것이 안전합니다.
      </P>

      <H2 id="compare">청약철회 vs 중도상환: 비용과 기록을 함께 비교</H2>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">비교 항목</th>
              <th className="border-b border-gray-200 px-4 py-3">대출 청약철회</th>
              <th className="border-b border-gray-200 px-4 py-3">일반 중도상환</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">가능 시기</td>
              <td className="border-b border-gray-100 px-4 py-3">법정 철회기간 안</td>
              <td className="border-b border-gray-100 px-4 py-3">만기 전 계약 조건에 따라 가능</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">중도상환수수료</td>
              <td className="border-b border-gray-100 px-4 py-3 text-emerald-700">없음</td>
              <td className="border-b border-gray-100 px-4 py-3">상품·경과기간에 따라 발생 또는 면제</td>
            </tr>
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">제3자 부대비용</td>
              <td className="border-b border-gray-100 px-4 py-3">금융회사 부담분을 반환할 수 있음</td>
              <td className="border-b border-gray-100 px-4 py-3">철회용 반환항목은 아님</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="px-4 py-3 font-semibold">대출기록</td>
              <td className="px-4 py-3">계약이 소급 취소돼 관련 대출정보 삭제 대상</td>
              <td className="px-4 py-3">상환 이력이 남음</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout tone="blue">
        <strong>판단 공식:</strong> 청약철회 때 돌려줄 제3자 비용과 일반 중도상환수수료를 같은 날짜 기준으로 비교하세요.
        기록 삭제가 중요한지도 별도로 판단합니다. 수수료가 면제된 대출은 청약철회보다 중도상환의 현금비용이 작을 수
        있습니다.
      </Callout>
      <P>
        중도상환수수료는 상품별 계산식과 면제 조건이 다릅니다. 먼저{' '}
        <Link href="/calculator/prepayment-fee" className="font-semibold text-indigo-600 hover:underline">
          중도상환수수료 계산기
        </Link>
        로 참고값을 구한 뒤 금융회사에서 실제 상환예상액을 받아 비교하세요.
      </P>

      <H2 id="examples">숫자로 보는 두 가지 사례</H2>
      <H3>사례 1 — 부대비용이 거의 없는 신용대출</H3>
      <P>
        5천만원을 연 6.0%로 받아 7일 사용했고 금융회사가 확인한 제3자 비용은 0원이라고 가정합니다. 단순 일할 이자는
        약 57,534원(5천만원 × 6.0% × 7 ÷ 365)입니다. 같은 날의 중도상환수수료 안내액이 28만원이라면 청약철회가
        약 22만원 저렴합니다. 실제 일수 계산과 정산단위는 금융회사 안내를 따릅니다.
      </P>
      <H3>사례 2 — 중도상환수수료가 면제된 담보대출</H3>
      <P>
        3억원을 연 4.2%로 받아 10일 사용했고 반환할 인지세·등기비용 등 제3자 비용이 90만원이라고 가정합니다. 단순
        일할 이자는 약 345,205원입니다. 일반 중도상환수수료가 0원이라면 청약철회는 중도상환보다 제3자 비용 90만원을
        더 부담할 수 있습니다. 다만 중도상환은 대출 이력이 남으므로 비용만으로 결론 내리지 마세요.
      </P>
      <Callout tone="amber">
        두 사례는 구조를 보여주는 참고 계산입니다. 실제 반환 대상 비용, 이자 일수, 수수료 면제 여부는 계약과 금융회사
        정산서에 따라 달라집니다.
      </Callout>

      <H2 id="steps">신청부터 대출기록 확인까지 5단계</H2>
      <div className="mb-5 space-y-3">
        {[
          ['1. 마감일과 대상 여부 확인', '계약서류 제공일·계약일·실행일을 대조하고 상품설명서에서 철회 대상인지 확인합니다.'],
          ['2. 두 가지 정산표 요청', '같은 상환 예정일 기준으로 청약철회 반환액과 일반 중도상환액을 각각 요청합니다.'],
          ['3. 공식 채널로 의사표시', '앱·영업점·이메일 등 금융회사가 인정하는 방법으로 철회 의사를 표시하고 접수증을 보관합니다.'],
          ['4. 원금·이자·비용 전액 반환', '안내받은 계좌와 마감시각을 확인해 정산금을 전부 보내고 처리 완료 여부를 확인합니다.'],
          ['5. 환급과 기록 삭제 확인', '금융회사가 돌려줄 수수료, 담보 말소 절차, 신용정보 반영 여부를 각각 확인합니다.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-1 text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-sm leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </div>
      <P>
        더 낮은 금리의 대출로 바꾸려는 목적이라면 새 대출 실행 가능성을 먼저 확인하되, 기존 대출 철회를 새 대출 승인보다
        앞서 확정하지 마세요. 자금 공백과 잔금일 차질을 피하려면{' '}
        <Link href="/hub/refinancing-guide" className="font-semibold text-indigo-600 hover:underline">
          대출 갈아타기 허브
        </Link>
        에서 실행 순서와 손익 구조를 함께 확인하세요.
      </P>

      <H2 id="checklist">마감 전 최종 체크리스트</H2>
      <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
        <ul>
          <li>□ 금융회사가 표시한 청약철회 만료일과 접수 마감시각을 확인했다.</li>
          <li>□ 내 상품이 법령·상품설명서상 청약철회 대상인지 확인했다.</li>
          <li>□ 같은 날짜 기준 청약철회 반환액과 일반 중도상환액을 모두 받았다.</li>
          <li>□ 원금뿐 아니라 사용 이자와 제3자 비용까지 보낼 자금을 준비했다.</li>
          <li>□ 철회 의사표시 접수증과 정산금 이체 증빙을 보관했다.</li>
          <li>□ 수수료 환급, 담보 말소, 대출정보 삭제 확인 방법을 물었다.</li>
        </ul>
      </div>
      <P>
        14일이 지났거나 청약철회 대상이 아니라면 일반 중도상환·갈아타기·금리인하요구권 중 가능한 수단을 비교해야 합니다.
        대출을 받기 전이라면{' '}
        <Link href="/guide/loan-checklist" className="font-semibold text-indigo-600 hover:underline">
          대출 전 필수 체크리스트
        </Link>
        에서 철회 조건과 중도상환수수료를 계약 전에 확인하세요.
      </P>
      <HubBacklink hub="refinancing-guide" />
    </GuideLayout>
  )
}
