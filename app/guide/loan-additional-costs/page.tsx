import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'
import DisclaimerNotice from '@/components/DisclaimerNotice'

const path = '/guide/loan-additional-costs'
const url = `https://www.ohyess.kr${path}`
const title = '대출 인지세·주담대 부대비용 계산 — 누가 얼마 내나'
const description = '대출금액별 인지세와 주택담보대출의 국민주택채권 매입비용, 근저당 설정·말소비용, 감정평가료를 구분해 실행일에 준비할 현금을 계산합니다.'

export const metadata: Metadata = {
  title: `${title} | ohyess`,
  description,
  keywords: ['대출 인지세', '주담대 부대비용', '근저당 설정비용', '국민주택채권 매입비용', '대출 실행 비용'],
  alternates: { canonical: url },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title,
    description,
    url,
    type: 'article',
    locale: 'ko_KR',
    siteName: 'ohyess',
    publishedTime: '2026-09-29T11:07:34+09:00',
    modifiedTime: '2026-09-29T11:07:34+09:00',
    tags: ['대출 인지세', '주담대 부대비용', '국민주택채권', '근저당'],
  },
  twitter: { card: 'summary_large_image', title, description },
}

const stampTaxUrl = 'https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1031595801'
const stampTaxExemptionUrl = 'https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029615155'
const housingFundActUrl = 'https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&chrClsCd=010202&efYd=20260102&lsiSeq=281291&urlMode=lsInfoP'
const hfExplanationUrl = 'https://www.hf.go.kr/ko/sub04/sub04_10_01.do?article.offset=0&articleLimit=10&articleNo=600477&mode=view'

const tocItems = [
  { id: 'answer', label: '즉답: 실행일 현금 계산 순서' },
  { id: 'stamp-tax', label: '대출금액별 인지세 표' },
  { id: 'mortgage-costs', label: '주담대 비용과 부담 주체' },
  { id: 'formula', label: '실제 준비금 계산식' },
  { id: 'examples', label: '신용대출·주담대 예시' },
  { id: 'refinancing', label: '대환·청약철회 때 달라지는 비용' },
  { id: 'checklist', label: '실행 전 견적 체크리스트' },
]

const faqs = [
  {
    question: '대출금이 정확히 5천만원이면 인지세를 내나요?',
    answer: '현행 인지세법은 기재금액이 5천만원 이하인 금전소비대차 증서를 비과세합니다. 따라서 정확히 5천만원이면 비과세이고, 5천만원을 초과하면 다음 구간 세액이 적용됩니다. 판단 기준은 주택가격이 아니라 대출약정서의 기재금액입니다.',
  },
  {
    question: '1억원 대출의 고객 부담 인지세는 얼마인가요?',
    answer: '1억원은 5천만원 초과 1억원 이하 구간이므로 총 인지세는 7만원입니다. 한국주택금융공사 상품설명서처럼 금융기관과 고객이 각각 50%씩 부담하는 계약이라면 고객 몫은 3만5천원입니다. 실제 약정서의 부담 내역을 최종 확인하세요.',
  },
  {
    question: '근저당권 설정비용은 전부 고객이 내나요?',
    answer: '전부 고객 부담이라고 단정하면 안 됩니다. 한국주택금융공사 상품설명서는 근저당권 설정에 필요한 등록면허세·교육세·법무사수수료·임대차조사비용과 감정평가수수료를 금융기관 부담으로, 국민주택채권 매입비용과 근저당권 말소·감액비용을 고객 부담으로 구분합니다. 상품과 계약에 따라 예외가 있으므로 항목별 견적을 받으세요.',
  },
  {
    question: '국민주택채권 매입비용은 왜 당일에야 확정되나요?',
    answer: '근저당권 설정금액에 따라 매입해야 할 채권 액면액이 정해지고, 채권을 즉시 매도한다면 실제 현금비용은 매도일의 할인율에 따라 달라지기 때문입니다. 액면액과 실제 할인비용을 구분해 법무사나 금융기관에 당일 견적을 요청하세요.',
  },
  {
    question: '감정평가료는 항상 은행이 부담하나요?',
    answer: '공식 정책대출 설명서는 일반적인 감정평가수수료를 금융기관 또는 기금 부담으로 안내하지만, 가격정보나 분양가를 쓸 수 있는데도 고객이 감정가 적용을 요청하는 경우에는 고객 부담이 될 수 있다고 설명합니다. 일반 은행 상품도 약정서와 설명서에서 부담 주체를 확인해야 합니다.',
  },
  {
    question: '대출을 14일 안에 철회하면 부대비용도 모두 돌려받나요?',
    answer: '아닙니다. 청약철회 시 중도상환수수료는 없지만, 금융회사가 이미 제3자에게 지급한 인지세·근저당 설정비용 등에 해당하는 금액은 반환해야 할 수 있습니다. 실행 전 받은 비용명세서를 보관하고 철회 예상 반환액을 먼저 요청하세요.',
  },
]

function Section({ id, title: heading, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-20 space-y-4">
      <h2 className="border-b border-gray-100 pb-3 text-xl font-bold text-gray-900">{heading}</h2>
      {children}
    </section>
  )
}

const p = 'text-[15px] leading-relaxed text-gray-700'
const th = 'border-b border-gray-200 px-3 py-3 text-left font-semibold'
const td = 'border-b border-gray-100 px-3 py-3 align-top'

export default function LoanAdditionalCostsGuide() {
  return (
    <GuideLayout
      pageUrl={path}
      title={title}
      description="대출 실행일에는 이자 외에도 인지세와 담보 관련 비용이 생길 수 있습니다. 법정 세액, 금융기관 부담, 고객 부담, 상품별 변동비용을 분리해야 필요한 현금을 과대·과소 계산하지 않습니다."
      publishedAt="2026-09-29"
      reviewedAt="2026-09-29"
      referenceDate="2026-09-29 확인 · 현행 인지세법과 공식 상품설명서 기준"
      lastUpdated="2026년 9월 29일"
      appliesTo="금융기관 신용대출·주택담보대출 약정과 주담대 대환"
      sources={[
        { label: '국가법령정보센터 — 인지세법 제3조', href: stampTaxUrl },
        { label: '국가법령정보센터 — 인지세법 제6조', href: stampTaxExemptionUrl },
        { label: '국가법령정보센터 — 주택도시기금법 시행령', href: housingFundActUrl },
        { label: '한국주택금융공사 — 보금자리론 신청 서식(2026.8.20)', href: hfExplanationUrl },
      ]}
      tocItems={tocItems}
      faqs={faqs}
      ctas={[
        { label: '갈아타기 손익 계산기', href: '/calculator/refinancing', description: '새 대출 부대비용을 넣어 순절감액과 손익분기점 계산' },
        { label: '중도상환수수료 계산기', href: '/calculator/prepayment-fee', description: '기존 대출을 닫을 때 별도로 드는 수수료 계산' },
      ]}
      relatedGuides={[
        { title: '대출금리 산정내역서 읽는 법', href: '/guide/loan-rate-statement', description: '금리와 비용을 분리해 두 은행 견적 비교' },
        { title: '대출 전 체크리스트', href: '/guide/loan-checklist', description: '서명 전 금리·수수료·상환조건 최종 점검' },
        { title: '대출 청약철회권 14일', href: '/guide/loan-cooling-off', description: '철회 시 돌려줄 제3자 비용과 중도상환 비교' },
        { title: '중도상환수수료 완전 정리', href: '/guide/early-repayment-fee', description: '대환·조기상환 때 기존 대출 비용 계산' },
      ]}
    >
      <section id="answer" className="scroll-mt-20 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h2 className="mb-3 text-lg font-bold text-indigo-950">대출금만 보지 말고 고객 부담 비용명세서의 합계를 준비하세요.</h2>
        <p className={p}>
          실행일 준비금은 <strong>고객 부담 인지세 + 국민주택채권 실제 할인비용 + 고객 부담으로 적힌 감정·보험·보증 비용 + 기존 담보 말소비용</strong>으로
          잡습니다. 근저당권 설정 관련 비용처럼 금융기관이 부담하는 항목을 다시 더하지 말고, 반대로 당일 할인율이 적용되는 국민주택채권 비용을 고정액으로
          단정하지 않는 것이 핵심입니다.
        </p>
        <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-4 text-sm leading-relaxed text-gray-700">
          <strong>금융기관에 요청할 한 문장</strong><br />
          “실행일 기준 고객 부담 비용과 금융기관 부담 비용을 나누고, 국민주택채권은 액면액과 실제 할인비용을 따로 적은 견적서를 주세요.”
        </div>
      </section>

      <Section id="stamp-tax" title="인지세는 대출약정서 기재금액 구간으로 계산합니다">
        <p className={p}>
          현행 인지세법 제3조는 금융·보험기관과 작성하는 금전소비대차 증서에 금액 구간별 세액을 적용합니다. 제6조는
          <strong>기재금액 5천만원 이하</strong>를 비과세합니다. 전자약정도 과세대상 전자문서에 포함될 수 있으므로 종이 서류가 없다는 이유로 면제되는 것은 아닙니다.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[700px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>대출약정 기재금액</th><th className={th}>법정 인지세 총액</th><th className={th}>50% 분담 시 고객 부담</th><th className={th}>경계 확인</th></tr></thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold`}>5천만원 이하</th><td className={td}>비과세</td><td className={td}>0원</td><td className={td}>5천만원 정확히 포함</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>5천만원 초과~1억원 이하</th><td className={td}>7만원</td><td className={td}>3만5천원</td><td className={td}>1억원 정확히 포함</td></tr>
              <tr><th scope="row" className={`${td} font-semibold`}>1억원 초과~10억원 이하</th><td className={td}>15만원</td><td className={td}>7만5천원</td><td className={td}>10억원 정확히 포함</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>10억원 초과</th><td className={td}>35만원</td><td className={td}>17만5천원</td><td className={td}>상한 없음</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          50% 분담액은 한국주택금융공사 상품설명서의 고객·금융기관 분담 방식입니다. 법정 세액과 실제 계약상 분담 주체는 구분해 보고,
          최종 고객 부담액은 대출약정서와 상품설명서에서 확인하세요.
        </p>
      </Section>

      <Section id="mortgage-costs" title="주담대 비용은 설정·채권·말소·감정을 서로 나눠 봅니다">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[760px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>비용</th><th className={th}>공식 설명서의 일반적 부담</th><th className={th}>실행 전 확인할 숫자</th></tr></thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>근저당권 설정</th><td className={td}>등록면허세·교육세·법무사수수료·임대차조사비용은 금융기관 부담으로 안내</td><td className={td}>고객 부담으로 전가된 항목이 없는지</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold text-indigo-800`}>국민주택채권</th><td className={td}>채무자 또는 설정자 부담</td><td className={td}>근저당권 설정금액, 채권 액면액, 당일 할인비용</td></tr>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>감정평가</th><td className={td}>일반 감정은 금융기관 부담, 고객이 별도 감정을 요청하면 예외 가능</td><td className={td}>누가 요청했고 누가 부담하는지</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold text-indigo-800`}>근저당권 말소·감액</th><td className={td}>전액·일부 상환 뒤 고객 부담으로 안내</td><td className={td}>기존 담보 말소 법무사·등기 비용</td></tr>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>보험·보증료</th><td className={td}>상품 가입 여부와 보증기관에 따라 달라짐</td><td className={td}>1회 비용인지 매년 비용인지, 환급 조건</td></tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>국민주택채권 액면액과 실제 현금비용은 다릅니다.</strong> 채권을 즉시 매도한다면 고객이 체감하는 비용은 액면액 전체가 아니라
          매입가와 매도가의 차이입니다. 할인율은 변하므로 실행일 견적을 받아야 합니다.
        </div>
      </Section>

      <Section id="formula" title="비용명세서를 받은 뒤 이 식으로 준비금을 합산합니다">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold text-emerald-700">실행일 고객 준비금</p>
          <p className="mt-2 text-base font-extrabold leading-relaxed text-emerald-950">
            고객 부담 인지세 + 국민주택채권 실제 할인비용 + 고객 부담 감정·보험·보증료 + 기존 근저당 말소비용
          </p>
        </div>
        <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li><strong>대출약정 금액</strong>으로 인지세 총액과 고객 부담분을 확정합니다.</li>
          <li><strong>근저당권 설정금액</strong>이 대출원금과 같은지, 채권최고액 비율이 얼마인지 받습니다.</li>
          <li>국민주택채권의 <strong>액면액과 당일 즉시매도 할인비용</strong>을 분리합니다.</li>
          <li>감정평가·보험·보증·법무사 항목마다 <strong>고객 또는 금융기관</strong> 부담을 표시합니다.</li>
          <li>대환이면 기존 대출의 중도상환수수료와 근저당 말소비용을 별도로 더합니다.</li>
        </ol>
        <p className={p}>
          이 계산은 주택 취득세·소유권이전등기비처럼 <strong>집을 사는 비용</strong>과 대출을 실행하기 위해 생기는 비용을 분리합니다.
          매매 잔금표에서는 두 묶음을 각각 소계로 만들어야 같은 비용을 중복 계산하지 않습니다.
        </p>
      </Section>

      <Section id="examples" title="신용대출과 주담대는 준비할 비용의 종류가 다릅니다">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900">예시 1 — 8천만원 신용대출</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
              <li>인지세 총액: 7만원 구간</li>
              <li>50% 분담 계약의 고객 몫: 3만5천원</li>
              <li>담보가 없으므로 국민주택채권·근저당 비용: 없음</li>
              <li>최종 준비금: 상품설명서에 다른 고객 부담 수수료가 없다면 3만5천원</li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900">예시 2 — 3억원 주택담보대출</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
              <li>인지세 고객 몫: 7만5천원(50% 분담 가정)</li>
              <li>국민주택채권 실제 할인비용: 실행일 견적 42만원 가정</li>
              <li>고객 부담 보험료: 6만원 가정</li>
              <li>준비금 예시: 55만5천원</li>
            </ul>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          두 예시는 계산 구조를 보여주기 위한 참고값입니다. 특히 채권 할인비용·보험료·보증료·법무사 비용은 담보, 상품, 실행일과 지역에 따라 달라지므로
          실제 비용명세서를 우선합니다.
        </p>
      </Section>

      <Section id="refinancing" title="대환과 청약철회는 새 대출 비용 외에 한 묶음을 더 봅니다">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[720px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>상황</th><th className={th}>추가 확인 비용</th><th className={th}>판단 방법</th></tr></thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold`}>신규 대출</th><td className={td}>인지세, 채권 할인비용, 상품별 보험·보증료</td><td className={td}>실행일 준비 현금 확인</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>대환대출</th><td className={td}>신규 비용 + 기존 대출 중도상환수수료 + 기존 근저당 말소비용</td><td className={td}>이자 절감액에서 모든 초기비용을 빼기</td></tr>
              <tr><th scope="row" className={`${td} font-semibold`}>14일 내 청약철회</th><td className={td}>사용 이자 + 금융회사가 제3자에게 지급한 인지세·등기비용 등</td><td className={td}>중도상환수수료 면제와 반환비용을 비교</td></tr>
            </tbody>
          </table>
        </div>
        <p className={p}>
          대환은 <Link href="/calculator/refinancing" className="font-semibold text-indigo-700 underline">갈아타기 손익 계산기</Link>의 신규 부대비용 칸에
          인지세·채권 할인비용·말소비용 견적을 합산해 넣습니다. 실행 직후 취소를 고민한다면
          <Link href="/guide/loan-cooling-off" className="ml-1 font-semibold text-indigo-700 underline">대출 청약철회권 가이드</Link>에서 반환비용과 일반 중도상환을 먼저 비교하세요.
        </p>
      </Section>

      <Section id="checklist" title="실행 전날에는 금액·부담 주체·환급 여부까지 적어 받으세요">
        <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li>대출약정 기재금액과 인지세 구간, 고객 부담분이 맞는지 확인합니다.</li>
          <li>근저당권 설정금액과 대출원금이 다르면 그 이유와 채권최고액 비율을 묻습니다.</li>
          <li>국민주택채권은 액면액·즉시매도 할인율·실제 현금비용을 나눠 받습니다.</li>
          <li>등록면허세·교육세·법무사·임대차조사·감정평가 비용의 부담 주체를 항목별로 표시합니다.</li>
          <li>보험료·보증료가 1회성인지 매년 부과되는지, 중도상환 때 환급되는지 확인합니다.</li>
          <li>대환이면 기존 근저당 말소비용과 중도상환수수료를 새 대출 비용과 분리합니다.</li>
          <li>청약철회 때 반환해야 할 제3자 비용 예상액을 실행 전에 요청합니다.</li>
          <li>최종 비용명세서와 영수증은 대출약정서·산정내역서와 함께 보관합니다.</li>
        </ul>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-950">
          금리가 낮아 보여도 초기비용이 크면 단기 대환은 손해가 될 수 있습니다. 먼저
          <Link href="/guide/loan-rate-statement" className="mx-1 font-semibold underline">금리 산정내역서</Link>와 비용명세서를 같은 날짜 기준으로 받은 뒤 순비용을 비교하세요.
        </div>
        <DisclaimerNotice basis="2026-09-29 검토 · 인지세법 제3조·제6조 · 주택도시기금법 시행령 · 한국주택금융공사 보금자리론 신청 서식" />
      </Section>

      <HubBacklink hub="refinancing-guide" />
    </GuideLayout>
  )
}
