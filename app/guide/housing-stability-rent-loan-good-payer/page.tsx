import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import DisclaimerNotice from '@/components/DisclaimerNotice'

const path = '/guide/housing-stability-rent-loan-good-payer'
const url = `https://www.ohyess.kr${path}`
const title = '주거안정월세대출 성실납부자 우대금리 — 청년 버팀목 0.2%p 조건'
const description = '주거안정월세대출을 이용한 뒤 청년전용 버팀목전세자금에서 연 0.2%p 우대금리를 받기 위한 12회차·연체 30일·전액상환·2년 이내 조건과 절감액을 계산합니다.'

export const metadata: Metadata = {
  title: `${title} | ohyess`,
  description,
  keywords: ['주거안정월세대출 성실납부자', '청년 버팀목 우대금리', '월세대출 성실납부', '버팀목전세대출 0.2', '청년전용 버팀목 금리'],
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
    publishedTime: '2026-10-12T11:05:19+09:00',
    modifiedTime: '2026-10-12T11:05:19+09:00',
    tags: ['주거안정월세대출', '청년전용 버팀목', '성실납부자', '우대금리'],
  },
  twitter: { card: 'summary_large_image', title, description },
}

const nhufFaqUrl = 'https://nhuf.molit.go.kr/FP/FP08/FP0809/FP0809.jsp?currentPage=18'
const nhufYouthLoanUrl = 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020302.jsp'
const kbFundLoanUrl = 'https://obank.kbstar.com/quics?QSL=F&cc=b104363%3Ab104516&isNew=N&page=C103998&prcode=LN40000039'
const hfRentGuaranteeUrl = 'https://www.hf.go.kr/ko/sub02/sub02_01_06.do'

const tocItems = [
  { id: 'answer', label: '즉답: 4가지 조건' },
  { id: 'meaning', label: '어느 대출의 금리가 내려가나' },
  { id: 'decision', label: '자격 판정 순서' },
  { id: 'savings', label: '0.2%p 절감액 계산' },
  { id: 'documents', label: '증빙과 신청 절차' },
  { id: 'exceptions', label: '탈락하기 쉬운 예외' },
  { id: 'checklist', label: '신청 전 체크리스트' },
]

const faqs = [
  {
    question: '주거안정월세대출을 12개월 이용하면 자동으로 우대되나요?',
    answer: '자동 적용으로 단정하면 안 됩니다. 공식 FAQ는 월세대출 약정 후 12회차 이상 지급, 총 대출기간 중 연체일수 30일 이내, 전액 상환, 전액 상환 후 2년 이내 대상 버팀목대출 신청을 함께 요구합니다. 신청 시 수탁은행에 성실납부 이력 확인과 우대금리 반영을 요청하세요.',
  },
  {
    question: '12회차를 채웠지만 아직 월세대출 잔액이 남아 있으면 되나요?',
    answer: '공식 FAQ에는 대출을 전액 상환한 사람이라고 명시되어 있습니다. 12회차 지급만 충족하고 잔액이 남아 있다면 네 조건을 모두 충족한 것으로 보기 어렵습니다. 상환 처리일과 잔액 0원 여부를 수탁은행에서 확인하세요.',
  },
  {
    question: '연체가 한 번이라도 있으면 우대금리를 못 받나요?',
    answer: '연체 횟수가 아니라 총 대출기간 중 연체일수 30일 이내가 공식 기준입니다. 다만 실제 전산 집계일수와 해소 여부는 은행 기록으로 판단되므로 본인이 기억하는 날짜만으로 계산하지 말고 거래내역 확인을 요청하세요.',
  },
  {
    question: '전액 상환한 지 2년이 지나면 우대를 받을 수 있나요?',
    answer: '공식 FAQ는 전액 상환한 사람이 본건 대출을 2년 이내 신청하는 경우라고 안내합니다. 2년이 지났다면 이 우대항목은 충족하기 어렵지만, 다른 버팀목 우대항목이나 지방 소재 주택 금리 인하 적용 여부는 별도로 확인할 수 있습니다.',
  },
  {
    question: '0.2%p는 금리가 20% 내려간다는 뜻인가요?',
    answer: '아닙니다. 예를 들어 연 2.5%에서 0.2%p를 빼면 연 2.3%입니다. 원금 1억원이 1년 내내 유지된다는 단순 가정에서는 연 이자 약 20만원, 월평균 약 1만6,667원이 줄어듭니다.',
  },
  {
    question: '성실납부자이면 청년전용 버팀목 승인도 자동인가요?',
    answer: '아닙니다. 성실납부자 우대는 금리 항목일 뿐입니다. 청년전용 버팀목의 나이, 무주택, 소득, 순자산, 임차주택, 보증 심사 등 기본 대출요건을 별도로 통과해야 합니다.',
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

export default function HousingStabilityRentLoanGoodPayerGuide() {
  return (
    <GuideLayout
      pageUrl={path}
      title={title}
      description="주거안정월세대출을 잘 갚았다는 사실만으로 자동 적용되는 혜택은 아닙니다. 지급 회차, 누적 연체일수, 전액 상환일, 새 버팀목대출 신청일을 차례로 확인해야 합니다."
      publishedAt="2026-10-12"
      reviewedAt="2026-10-12"
      referenceDate="2026-10-12 확인 · 현행 주택도시기금 및 수탁은행 안내 기준"
      lastUpdated="2026년 10월 12일"
      appliesTo="주거안정월세대출 상환 후 청년전용 버팀목전세자금 신청자"
      sources={[
        { label: '주택도시기금 FAQ — 성실납부자 우대 기준', href: nhufFaqUrl },
        { label: '주택도시기금 — 청년전용 버팀목 신청·서류', href: nhufYouthLoanUrl },
        { label: 'KB국민은행 — 주택도시기금대출 현행 금리', href: kbFundLoanUrl },
        { label: '한국주택금융공사 — 월세자금보증', href: hfRentGuaranteeUrl },
      ]}
      tocItems={tocItems}
      faqs={faqs}
      ctas={[
        { label: '금리 변동 영향 계산기', href: '/calculator/rate-change-impact', description: '0.2%p 차이가 월 부담과 총이자에 미치는 영향 확인' },
        { label: '대출이자 계산기', href: '/calculator/loan-interest', description: '실제 신청금액·금리·기간으로 월 이자 계산' },
      ]}
      relatedGuides={[
        { title: '전세대출 완전 정리', href: '/guide/jeonse-loan', description: '버팀목·HF·시중은행 전세대출 구조와 신청 순서' },
        { title: '대출 보증보험 완전 정리', href: '/guide/loan-guarantee', description: '월세·전세자금 보증과 보증료 확인' },
        { title: '대출 전 필수 체크리스트', href: '/guide/loan-checklist', description: '신청 전 소득·자산·금리·서류 최종 점검' },
      ]}
    >
      <section id="answer" className="scroll-mt-20 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="mb-3 text-lg font-bold text-emerald-950">네 조건을 모두 충족하면 연 0.2%p 우대 대상입니다.</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-emerald-950">
          <li>주거안정월세대출 약정 후 <strong>12회차 이상</strong> 월세자금이 지급됐는지</li>
          <li>총 대출기간의 <strong>누적 연체일수가 30일 이내</strong>인지</li>
          <li>주거안정월세대출을 <strong>전액 상환</strong>했는지</li>
          <li>전액 상환 후 <strong>2년 이내</strong> 청년전용 버팀목전세자금을 신청하는지</li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-emerald-900">
          이 네 가지는 우대금리 판정 조건입니다. 청년전용 버팀목의 나이·무주택·소득·순자산·대상주택 요건과 보증 심사는 별도로 통과해야 합니다.
        </p>
      </section>

      <Section id="meaning" title="0.2%p 우대는 과거 월세대출이 아니라 새 버팀목대출에 적용됩니다">
        <p className={p}>
          이름 때문에 “주거안정월세대출의 금리를 깎아주는 혜택”으로 오해하기 쉽습니다. 공식 FAQ는 이 항목을
          <strong> 청년전용 버팀목전세자금의 우대금리</strong>로 안내합니다. 과거 월세대출 이용 이력이 새 전세자금대출의 금리를 낮추는 구조입니다.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[680px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>구분</th><th className={th}>역할</th><th className={th}>이번 판단에서 볼 것</th></tr></thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold`}>주거안정월세대출</th><td className={td}>월세 지급을 위한 과거 대출</td><td className={td}>12회차·연체일수·전액상환일</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>청년전용 버팀목전세자금</th><td className={td}>새로 신청하는 전세자금대출</td><td className={td}>기본 자격과 연 0.2%p 우대 반영 여부</td></tr>
              <tr><th scope="row" className={`${td} font-semibold`}>HF 월세자금보증</th><td className={td}>대출 실행을 돕는 보증</td><td className={td}>보증 가입만으로 성실납부 우대가 생기는 것은 아님</td></tr>
            </tbody>
          </table>
        </div>
        <p className={p}>
          현행 공식 안내의 청년전용 버팀목 기본금리는 연 2.2~3.3%, 한도는 최대 1억5천만원 이내로 안내됩니다. 실제 금리는 소득, 주택 소재지,
          다른 우대항목과 우대 상한, 자산심사 결과에 따라 달라지므로 <strong>기본금리에서 무조건 0.2%p만 빼면 최종금리</strong>라고 단정하면 안 됩니다.
        </p>
      </Section>

      <Section id="decision" title="은행에 가기 전 네 날짜와 숫자를 한 줄로 정리하세요">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900">1. 지급 회차</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">첫 약정일부터 개월 수를 세지 말고 실제 월세자금 지급내역이 12회차 이상인지 확인합니다.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900">2. 누적 연체일수</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">연체 횟수나 가장 긴 한 번이 아니라 대출 전체 기간에 기록된 연체일수 합계가 30일 이내인지 묻습니다.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900">3. 전액 상환 처리일</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">마지막 이체일과 은행 전산의 완제 처리일이 다를 수 있으므로 잔액 0원과 완제일을 확인합니다.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-gray-900">4. 새 대출 접수일</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">완제 처리일로부터 2년이 지나기 전에 기금e든든 또는 수탁은행의 접수가 완료되는지 역산합니다.</p>
          </div>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-950">
          <strong>은행에 요청할 문장</strong><br />
          “주거안정월세대출의 실제 지급 회차, 총 연체일수, 전액 상환 처리일을 확인하고 청년전용 버팀목의 성실납부자 연 0.2%p 우대가 반영됐는지 금리산정표에 표시해 주세요.”
        </div>
      </Section>

      <Section id="savings" title="0.2%p의 절감액은 대출잔액에 0.002를 곱해 가늠합니다">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-semibold text-indigo-700">단순 연 이자 절감액</p>
          <p className="mt-2 text-lg font-extrabold text-indigo-950">대출잔액 × 0.002</p>
          <p className="mt-2 text-sm leading-relaxed text-indigo-900">월평균 참고값은 위 결과를 12로 나눕니다. 원금이 1년 내내 유지된다는 단순 가정입니다.</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[620px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>대출잔액</th><th className={th}>연 0.2%p 절감액</th><th className={th}>월평균 참고값</th></tr></thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold`}>8천만원</th><td className={td}>약 16만원</td><td className={td}>약 1만3,333원</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>1억원</th><td className={td}>약 20만원</td><td className={td}>약 1만6,667원</td></tr>
              <tr><th scope="row" className={`${td} font-semibold`}>1억5천만원</th><td className={td}>약 30만원</td><td className={td}>약 2만5천원</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          실제 이자는 실행일, 일별 잔액, 상환방식과 금리 변경일에 따라 달라집니다. 이 표는 우대 누락 여부를 점검하기 위한 참고값이며 승인금액이나 확정 절감액이 아닙니다.
        </p>
      </Section>

      <Section id="documents" title="별도 서류명을 추측하지 말고 수탁은행에 이력 확인을 요청하세요">
        <p className={p}>
          주택도시기금의 청년전용 버팀목 안내는 주민등록등본, 재직·소득자료, 임대차계약서와 보증 관련 서류 등 기본 신청서류를 제시합니다.
          반면 성실납부 이력의 확인 방식은 수탁은행의 전산과 개별 심사에 따라 달라질 수 있으므로, 임의의 “성실납부 확인서”가 반드시 발급된다고 단정하면 안 됩니다.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li>기존 주거안정월세대출 수탁은행에서 계좌번호와 완제 처리일을 확인합니다.</li>
          <li>실제 지급 회차와 총 연체일수 확인이 가능한 거래내역 또는 은행 확인자료를 요청합니다.</li>
          <li>기금e든든 또는 취급은행에서 청년전용 버팀목을 접수할 때 성실납부자 우대 대상임을 먼저 알립니다.</li>
          <li>승인 전 금리산정내역에서 <strong>연 0.2%p 우대 항목</strong>이 실제 반영됐는지 확인합니다.</li>
          <li>다른 우대와 중복됐을 때 우대 상한 또는 최저금리 때문에 체감 인하폭이 줄어드는지도 묻습니다.</li>
        </ol>
      </Section>

      <Section id="exceptions" title="성실납부 이력과 새 대출 승인 자격은 따로 심사합니다">
        <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li><strong>12개월 경과와 12회차 지급은 다를 수 있습니다.</strong> 실행이 건너뛴 회차가 있다면 실제 지급건수로 확인하세요.</li>
          <li><strong>연체 30일은 누적 기준입니다.</strong> 여러 번의 짧은 연체도 합산될 수 있으므로 은행 기록을 우선합니다.</li>
          <li><strong>일부 상환은 전액 상환이 아닙니다.</strong> 잔액과 미납이자·비용까지 0원으로 처리됐는지 확인하세요.</li>
          <li><strong>2년 경계에서는 접수일이 중요합니다.</strong> 임대차계약 일정만 보지 말고 실제 대출접수 완료일을 은행에 확인하세요.</li>
          <li><strong>기본 자격 미충족을 보완하지 않습니다.</strong> 성실납부자라도 청년전용 버팀목의 무주택·소득·자산·연령 요건 등을 충족해야 합니다.</li>
          <li><strong>보증 승인은 별도입니다.</strong> HF 등 보증기관 요건을 충족해도 은행과 기금의 대출 심사 결과는 달라질 수 있습니다.</li>
        </ul>
      </Section>

      <Section id="checklist" title="신청 전에는 우대 대상과 최종금리를 둘 다 확인하세요">
        <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li>월세대출 실제 지급이 12회차 이상인지 확인했다.</li>
          <li>총 대출기간 누적 연체일수가 30일 이내인지 은행 기록으로 확인했다.</li>
          <li>전액 상환 처리일과 잔액 0원을 확인했다.</li>
          <li>새 버팀목대출 접수일이 완제일로부터 2년 이내인지 계산했다.</li>
          <li>청년전용 버팀목의 나이·무주택·소득·순자산·주택 요건을 별도로 확인했다.</li>
          <li>금리산정내역서에 성실납부자 연 0.2%p 우대가 표시됐는지 확인했다.</li>
          <li>다른 우대와의 중복, 우대 상한, 최저금리를 반영한 최종 적용금리를 받았다.</li>
        </ul>
        <Link
          href="/policy/housing"
          className="group mt-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 transition-colors hover:bg-emerald-100"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">주거 지원 허브</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 group-hover:text-emerald-800">청년 버팀목·주거안정월세대출 기본 자격 비교</p>
            <p className="mt-0.5 text-xs text-gray-600">전세·월세·주거급여 등 현재 선택 가능한 지원을 함께 확인</p>
          </div>
          <span className="text-lg text-emerald-700" aria-hidden="true">→</span>
        </Link>
        <DisclaimerNotice message="이 페이지의 금리와 자격은 2026년 10월 12일 확인 기준입니다. 기금 운용계획과 개별 심사에 따라 달라질 수 있으므로 실제 접수 전 주택도시기금과 수탁은행의 최신 안내를 확인하세요." />
      </Section>
    </GuideLayout>
  )
}
