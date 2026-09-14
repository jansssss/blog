import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'
import DisclaimerNotice from '@/components/DisclaimerNotice'

const path = '/guide/loan-rate-statement'
const url = `https://www.ohyess.kr${path}`
const title = '대출금리 산정내역서 읽는 법 — 기준·가산·우대금리'
const description = '광고 금리와 내 확정 금리가 다른 이유를 산정내역서에서 찾으세요. COFIX·금융채, 가산금리, 우대금리, 재산정 주기와 2026년 7월 은행법 개정 적용 범위를 정리합니다.'

export const metadata: Metadata = {
  title: `${title} | ohyess`,
  description,
  keywords: ['대출금리 산정내역서', '대출금리 계산법', '기준금리 가산금리', '우대금리', 'COFIX', '코픽스 금융채'],
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
    publishedTime: '2026-09-14T10:19:34+09:00',
    modifiedTime: '2026-09-14T10:19:34+09:00',
    tags: ['대출금리', '산정내역서', 'COFIX', '우대금리'],
  },
  twitter: { card: 'summary_large_image', title, description },
}

const bankActUrl = 'https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0030&lsiSeq=282001&urlMode=lsScJoRltInfoR'
const fscLawUrl = 'https://www.fsc.go.kr/po010102/87204'
const fscStatementUrl = 'https://www.fsc.go.kr/po010101/73610'
const cofixUrl = 'https://portal.kfb.or.kr/compare/cofix.php'
const kbCofixUrl = 'https://obank.kbstar.com/quics?page=C019206'

const tocItems = [
  { id: 'answer', label: '즉답: 최저금리보다 세 줄을 비교' },
  { id: 'formula', label: '기준·가산·우대금리 계산 구조' },
  { id: 'cofix', label: 'COFIX 종류와 실제 반영 시점' },
  { id: 'statement', label: '산정내역서에서 확인할 항목' },
  { id: 'law-2026', label: '2026년 7월 법적비용 제한' },
  { id: 'example', label: '두 은행 견적 비교 예시' },
  { id: 'checklist', label: '계약 전 질문·체크리스트' },
]

const faqs = [
  {
    question: '한국은행 기준금리가 내리면 내 대출금리도 바로 내려가나요?',
    answer: '바로 내려간다고 단정할 수 없습니다. 계약에 적힌 COFIX·금융채 등 기준금리와 금리 재산정 주기를 먼저 봐야 합니다. 기준금리가 내려도 다음 재산정일까지 기존 금리가 유지될 수 있고, 가산금리와 우대금리 조건도 최종 적용금리에 영향을 줍니다.',
  },
  {
    question: '신규취급액 COFIX와 신잔액 COFIX 중 낮은 것을 고르면 되나요?',
    answer: '현재 지수만 비교하면 부족합니다. 신규취급액 기준은 최근 조달비용을 빠르게 반영하고 신잔액 기준은 더 넓은 조달자금 잔액을 반영하지만, 은행이 붙이는 가산금리와 우대금리, 선택 가능한 상품, 재산정 주기가 다릅니다. 같은 날짜의 최종 적용금리와 조건 유지 후 금리를 함께 비교하세요.',
  },
  {
    question: '대출금리 산정내역서는 언제 받을 수 있나요?',
    answer: '은행권은 대출 신규·갱신·연장 때 산정내역서를 제공하도록 운영하고 있습니다. 신규 대출은 조건이 확정된 뒤, 기존 대출은 은행 안내에 따라 이메일·문자 등 수령 방법을 선택할 수 있습니다. 받지 못했다면 영업점이나 고객센터에 산정내역서 제공을 요청하세요.',
  },
  {
    question: '2026년 7월 은행법 개정으로 기존 대출금리도 자동 인하되나요?',
    answer: '아닙니다. 금융위원회는 2026년 7월 1일 이후 은행과 대출계약을 체결하거나 갱신하는 경우부터 적용된다고 안내합니다. 기존 계약의 금리를 일괄 소급 인하하는 규정은 아니며, 비은행 금융회사에는 은행법 조항이 그대로 적용되지 않습니다.',
  },
  {
    question: '우대금리 조건을 놓치면 언제 금리가 오르나요?',
    answer: '상품 약정에 따라 다릅니다. 급여이체·카드실적·자동이체 같은 조건의 확인 주기와 미충족 시 반영 시점을 상품설명서에서 확인해야 합니다. 최초 우대금리뿐 아니라 내가 실제로 계속 충족할 수 있는 조건만 남긴 금리도 받아 비교하세요.',
  },
  {
    question: '가산금리가 높으면 부당한 금리인가요?',
    answer: '가산금리에는 신용위험, 업무원가, 유동성·자본비용, 목표이익률 등 여러 요소가 들어가므로 높다는 사실만으로 부당하다고 판단할 수 없습니다. 다만 산정내역서의 소득·담보·신용정보가 잘못됐거나 적용 근거가 설명되지 않으면 은행에 정정을 요청하고, 해결되지 않으면 금융감독원 1332 상담을 이용할 수 있습니다.',
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

export default function LoanRateStatementGuide() {
  return (
    <GuideLayout
      pageUrl={path}
      title={title}
      description="광고의 최저금리 대신 내 산정내역서에서 기준금리, 가산금리, 우대·전결금리와 재산정 주기를 확인해야 두 대출을 같은 조건으로 비교할 수 있습니다."
      publishedAt="2026-09-14"
      reviewedAt="2026-09-14"
      referenceDate="2026-09-14 확인 · 2026-07-01 개정 은행법 시행 반영"
      lastUpdated="2026년 9월 14일"
      appliesTo="은행 신규·갱신·연장 대출의 금리 산정내역서"
      sources={[
        { label: '국가법령정보센터 — 은행법 제30조의3', href: bankActUrl },
        { label: '금융위원회 — 2026년 7월 대출금리 법적비용 제한', href: fscLawUrl },
        { label: '금융위원회 — 대출금리 산정내역서 제공', href: fscStatementUrl },
        { label: '은행연합회 소비자포털 — COFIX 공시', href: cofixUrl },
        { label: 'KB국민은행 — COFIX 적용 시점 안내', href: kbCofixUrl },
      ]}
      tocItems={tocItems}
      faqs={faqs}
      ctas={[
        { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '확정 적용금리로 월납입액과 총이자 계산' },
        { label: '금리 변동 영향 계산기', href: '/calculator/rate-change-impact', description: '다음 재산정 때 금리가 바뀌는 경우 부담 비교' },
      ]}
      relatedGuides={[
        { title: '대출이자 계산법', href: '/guide/loan-interest', description: '확정 금리를 상환방식별 월납입액으로 바꾸는 법' },
        { title: '금리 0.5% 차이 계산', href: '/guide/rate-0p5-difference', description: '금리 차이가 총이자에 미치는 영향 확인' },
        { title: '금리인하요구권 신청', href: '/guide/rate-reduction-request', description: '소득·신용상태 개선 후 가산금리 재심사 요청' },
        { title: '대출 전 체크리스트', href: '/guide/loan-checklist', description: '금리 외 수수료·상환방식·계약 조건까지 점검' },
      ]}
    >
      <section id="answer" className="scroll-mt-20 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h2 className="mb-3 text-lg font-bold text-indigo-950">최저금리 한 줄보다 산정내역서의 세 줄을 비교하세요.</h2>
        <p className={p}>
          대출금리는 보통 <strong>기준금리 + 가산금리 − 우대·전결금리</strong>로 설명할 수 있습니다.
          기준금리 이름과 수치, 가산금리, 실제 유지 가능한 우대금리, 금리 재산정 주기를 같은 날짜 기준으로 받아야 합니다.
          최초 적용금리가 같아도 우대조건이 사라지거나 기준금리 반영 주기가 다르면 이후 부담은 달라집니다.
        </p>
        <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-4 text-sm leading-relaxed text-gray-700">
          <strong>은행에 먼저 물을 한 문장</strong><br />
          “오늘 기준 적용금리를 기준·가산·우대금리로 나눠 주시고, 우대조건 미충족 시 금리와 다음 재산정일도 알려주세요.”
        </div>
      </section>

      <Section id="formula" title="대출금리는 기준금리 + 가산금리 − 우대·전결금리입니다">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[720px] text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr><th className={th}>구성</th><th className={th}>무엇이 들어가나</th><th className={th}>비교할 질문</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>기준금리</th><td className={td}>COFIX, 금융채, CD 등 조달비용이나 시장금리 지표</td><td className={td}>어떤 지표의 어느 만기이며 언제 다시 바뀌나?</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold text-indigo-800`}>가산금리</th><td className={td}>업무원가, 신용·유동성·자본 위험, 목표이익률 등</td><td className={td}>내 신용·담보·거래조건이 정확히 입력됐나?</td></tr>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>우대·전결금리</th><td className={td}>급여이체·카드·자동이체 등 조건 할인과 은행의 조정</td><td className={td}>유지 가능한 조건만 남기면 실제 할인은 얼마인가?</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold text-indigo-800`}>최종 적용금리</th><td className={td}>세 항목을 가감해 계약에 적용되는 금리</td><td className={td}>광고 최저금리가 아닌 내 확정 금리인가?</td></tr>
            </tbody>
          </table>
        </div>
        <p className={p}>
          금융위원회는 은행별 금리를 비교할 때도 기준금리·가산금리·우대금리를 나눠 보도록 공시체계를 운영합니다.
          기준금리가 낮은 은행이 가산금리는 높을 수 있으므로 한 항목만으로 유리한 상품을 고르면 안 됩니다.
        </p>
      </Section>

      <Section id="cofix" title="COFIX는 공시일이 아니라 내 계약의 재산정일에 반영됩니다">
        <p className={p}>
          COFIX는 은행연합회가 공시하는 자금조달비용지수입니다. <strong>신규취급액 기준</strong>은 정보제공은행이 한 달 동안 새로 조달한 자금의 금리를,
          <strong>잔액 기준</strong>은 월말 조달자금 잔액의 금리를 가중평균합니다. <strong>신잔액 기준</strong>은 결제성자금 등을 포함해 더 넓은 조달자금 잔액을 반영합니다.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['신규취급액', '최근 조달비용 변화가 상대적으로 빠르게 드러나지만 변동 폭도 확인해야 합니다.'],
            ['잔액', '기존 조달자금 전체의 영향이 섞여 변화가 상대적으로 완만할 수 있습니다.'],
            ['신잔액', '결제성자금 등 더 넓은 재원을 포함합니다. 지수가 낮아 보여도 최종 가산금리를 함께 봐야 합니다.'],
          ].map(([heading, body]) => (
            <div key={heading} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 font-bold text-gray-900">{heading}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{body}</p>
            </div>
          ))}
        </div>
        <p className={p}>
          은행연합회가 새 지수를 공시했다고 모든 대출금리가 그날 동시에 바뀌는 것은 아닙니다. 은행 공식 안내처럼 실제 대출은 약정한
          금리 재산정 주기가 도래할 때 직전 공시 지수와 우대조건을 반영합니다. 계약서에서 <strong>지표 이름·변동 주기·다음 변경일</strong>을 확인하세요.
        </p>
        <p className="text-sm leading-relaxed text-gray-500">
          현재 COFIX 수치는 <a href={cofixUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">은행연합회 소비자포털</a>에서 확인하세요.
          이 페이지는 바뀌는 월별 수치를 고정해 적지 않고 비교 방법만 설명합니다.
        </p>
      </Section>

      <Section id="statement" title="산정내역서는 숫자보다 입력정보와 조건을 먼저 확인합니다">
        <p className={p}>
          은행권은 신규·갱신·연장 때 대출금리 산정내역서를 제공하도록 운영합니다. 금융위원회 안내에 따르면 내역서에는 소득·담보 등
          차주가 제공한 기초정보와 기준금리, 가산금리, 우대·전결금리가 구분돼 표시됩니다.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li><strong>기초정보:</strong> 소득, 직업, 담보가치, 신용정보와 대출용도·기간이 신청 내용과 같은지 봅니다.</li>
          <li><strong>기준금리:</strong> COFIX·금융채 등 지표 이름, 기준일, 만기와 재산정 주기를 적습니다.</li>
          <li><strong>가산금리:</strong> 견적마다 수치가 다른 이유를 묻고 입력정보 오류가 없는지 확인합니다.</li>
          <li><strong>우대금리:</strong> 항목별 할인 폭, 실적 확인 주기, 미충족 시 회복 방법을 표시합니다.</li>
          <li><strong>최종 조건:</strong> 실행일 확정 금리와 첫 변경일, 중도상환수수료를 함께 보관합니다.</li>
        </ol>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          사전조회 금리와 실행일 금리가 다르면 먼저 기준금리의 기준일이 바뀌었는지 확인하세요. 그다음 가산금리와 우대조건 변경분을 나누면
          차이가 시장지표 때문인지 개인 조건 때문인지 구분할 수 있습니다.
        </div>
      </Section>

      <Section id="law-2026" title="2026년 7월 1일부터 은행 신규·갱신 대출의 법적비용 반영이 제한됩니다">
        <p className={p}>
          현행 은행법 제30조의3은 은행이 대출금리에 지급준비금, 예금보험료, 서민금융진흥원 출연금과 교육세 인상분을 반영하지 못하도록 합니다.
          기술보증기금·신용보증기금·지역신용보증재단·주택금융신용보증기금 등 출연금도 50% 이상 반영하지 못하도록 제한합니다.
          은행은 준수 여부를 연 2회 이상 점검하고 기록·관리해야 합니다.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="mb-2 font-bold text-emerald-950">적용되는 경우</h3>
            <p className={p}>2026년 7월 1일 이후 은행과 새 대출계약을 체결하거나 기존 계약을 갱신하는 경우입니다.</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <h3 className="mb-2 font-bold text-rose-950">자동 인하로 오해하면 안 되는 경우</h3>
            <p className={p}>시행 전 기존 계약, 비은행 대출, 가산금리 전체입니다. 법은 특정 비용 반영을 제한할 뿐 개인별 최종금리를 동일하게 만들지 않습니다.</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          계약일이나 갱신일이 경계에 걸리면 은행에 개정 은행법 적용 여부와 가산금리 구성의 설명을 요청하세요. 이 페이지는 분쟁의 법률 판단을 대신하지 않습니다.
        </p>
      </Section>

      <Section id="example" title="두 은행의 최초 금리가 같아도 유지 금리는 달라질 수 있습니다">
        <p className={p}>아래 수치는 구조를 보여주는 가상 예시입니다. 같은 날 받은 3억원 주담대 견적이라고 가정합니다.</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[700px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>항목</th><th className={th}>A은행</th><th className={th}>B은행</th><th className={th}>판단</th></tr></thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold`}>기준금리</th><td className={td}>3.20%</td><td className={td}>3.45%</td><td className={td}>지표와 재산정 주기 확인</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>가산금리</th><td className={td}>+1.55%p</td><td className={td}>+1.15%p</td><td className={td}>기준금리만 보면 A가 유리해 보이는 착시</td></tr>
              <tr><th scope="row" className={`${td} font-semibold`}>우대금리</th><td className={td}>−0.45%p</td><td className={td}>−0.20%p</td><td className={td}>A는 카드실적 0.25%p 포함 가정</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold`}>최초 적용금리</th><td className={td}><strong>4.30%</strong></td><td className={td}><strong>4.40%</strong></td><td className={td}>첫 금리는 A가 0.10%p 낮음</td></tr>
              <tr><th scope="row" className={`${td} font-semibold`}>유지 가능한 금리</th><td className={td}><strong>4.55%</strong></td><td className={td}><strong>4.40%</strong></td><td className={td}>카드조건을 못 지키면 B가 0.15%p 낮음</td></tr>
            </tbody>
          </table>
        </div>
        <p className={p}>
          3억원 잔액에서 0.15%p 차이는 첫해 단순 이자 기준 약 <strong>45만원</strong>입니다(3억원 × 0.0015).
          실제 분할상환 이자는 잔액이 줄어들므로 <Link href="/calculator/loan-interest" className="font-semibold text-indigo-700 underline">대출 이자 계산기</Link>에
          유지 가능한 금리와 상환방식을 넣어 비교해야 합니다.
        </p>
      </Section>

      <Section id="checklist" title="계약 전에는 같은 날짜·같은 조건으로 두 장을 받으세요">
        <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li>광고 최저금리가 아니라 내 심사 후 <strong>최종 적용금리</strong>를 받습니다.</li>
          <li>기준금리의 이름·수치·기준일·만기와 <strong>다음 재산정일</strong>을 적습니다.</li>
          <li>가산금리와 우대·전결금리를 분리하고, 우대조건별 할인 폭을 받습니다.</li>
          <li>우대조건을 하나도 못 지킬 때와 실제 지킬 조건만 남겼을 때 금리를 각각 계산합니다.</li>
          <li>중도상환수수료, 인지세·담보비용, 고정기간 종료 후 조건을 금리와 함께 비교합니다.</li>
          <li>신규·갱신·연장이라면 산정내역서를 받고 기초정보 오류와 2026년 은행법 적용 여부를 확인합니다.</li>
        </ul>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-950">
          최종 선택은 <strong>유지 가능한 적용금리 + 재산정 위험 + 갈아타기 비용</strong>의 합으로 판단하세요.
          이미 대출이 있다면 <Link href="/calculator/refinancing" className="font-semibold underline">갈아타기 손익 계산기</Link>로 수수료를 뺀 순절감액을 먼저 확인합니다.
        </div>
        <DisclaimerNotice basis="2026-09-14 검토 · 은행법 제30조의3 · 금융위원회 대출금리 산정내역서 안내 · 은행연합회 COFIX 공시" />
      </Section>

      <HubBacklink hub="refinancing-guide" />
    </GuideLayout>
  )
}
