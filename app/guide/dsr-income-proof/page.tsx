import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'
import DisclaimerNotice from '@/components/DisclaimerNotice'

const path = '/guide/dsr-income-proof'
const url = `https://www.ohyess.kr${path}`
const title = 'DSR 인정소득 계산 — 이직·사업자·프리랜서 소득증빙'
const description = '은행이 DSR에 넣는 연소득이 내 연봉과 다른 이유를 확인하세요. 증빙소득·인정소득·신고소득, 1년 미만 연환산, 2개년 평균, 배우자 합산과 준비서류를 정리합니다.'

export const metadata: Metadata = {
  title: `${title} | ohyess`,
  description,
  keywords: ['DSR 인정소득', 'DSR 소득 산정', '대출 소득증빙', '이직자 주담대', '프리랜서 DSR', '사업자 대출 소득'],
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
    publishedTime: '2026-09-11T00:00:00+09:00',
    modifiedTime: '2026-09-11T00:00:00+09:00',
    tags: ['DSR', '인정소득', '소득증빙', '주택담보대출'],
  },
  twitter: { card: 'summary_large_image', title, description },
}

const bankRuleUrl = 'https://www.law.go.kr/LSW/flDownload.do?bylClsCd=200201&flNm=%5B%EB%B3%84%ED%91%9C+18%5D+%EC%A3%BC%ED%83%9D%EA%B4%80%EB%A0%A8+%EB%8B%B4%EB%B3%B4%EB%8C%80%EC%B6%9C+%EB%93%B1%EC%97%90+%EB%8C%80%ED%95%9C+%EB%A6%AC%EC%8A%A4%ED%81%AC%EA%B4%80%EB%A6%AC+%EC%84%B8%EB%B6%80%EA%B8%B0%EC%A4%80&flSeq=159684175'
const hfRuleUrl = 'https://hf.go.kr/cms/etcResourceDown.do?key=$cms$AwRg+sBsHgTJwCsIAsA6ADgEwGZA&site=$cms$NYeyA'
const fscRuleUrl = 'https://www.fsc.go.kr/po010101/73369?curPage=&srchBeginDt=&srchCtgry=1&srchEndDt=&srchKey=sj&srchText=DSR'

const tocItems = [
  { id: 'answer', label: '즉답: 연봉보다 은행의 인정 연소득이 중요' },
  { id: 'types', label: '증빙·인정·신고소득 차이' },
  { id: 'short-history', label: '이직·신규취업·1년 미만 소득 계산' },
  { id: 'business', label: '사업자·프리랜서·부업 소득 준비' },
  { id: 'spouse', label: '배우자 소득 합산의 함정' },
  { id: 'examples', label: '인정소득에 따른 DSR 여력 예시' },
  { id: 'checklist', label: '은행 상담 전 서류 체크리스트' },
]

const faqs = [
  {
    question: '연봉계약서의 연봉을 그대로 DSR 소득으로 쓰나요?',
    answer: '항상 그렇지는 않습니다. 은행권 기준은 원천징수영수증·소득금액증명원 같은 객관적인 증빙소득을 우선합니다. 계약서상 연봉, 실수령액, 최근 급여가 서로 다르면 재직기간과 소득 지속성 서류를 더 확인할 수 있습니다.',
  },
  {
    question: '이직한 지 3개월이어도 주담대 소득을 인정받을 수 있나요?',
    answer: '가능할 수 있습니다. 현행 은행권 기준은 1년 미만 증빙소득을 연환산할 수 있고, 한국주택금융공사 기준은 현재 유지 중인 소득원이 최소 1개월 이상임을 입증하도록 합니다. 신규입사 등 불가피한 사유나 상시소득임을 입증한 경우 10% 차감을 하지 않을 수 있지만, 실제 적용은 상품과 은행 내규를 확인해야 합니다.',
  },
  {
    question: '건강보험료로 추정한 소득은 100% 인정되나요?',
    answer: '일반적인 인정소득은 추정액의 95%, 최대 5천만원이 기본입니다. 다만 은행권 세부기준은 직장가입자의 인정소득에 대해 은행 내규에 반영한 경우 5천만원 한도 없이 추정액의 100%를 인정할 수 있도록 합니다. “가능” 규정이므로 상담 은행의 적용 여부를 확인해야 합니다.',
  },
  {
    question: '프리랜서는 매출이나 입금액 전부가 소득인가요?',
    answer: '아닙니다. 소득금액증명원 등 증빙자료가 우선이며, 매출액을 신고소득으로 추정할 때도 업종별 단순경비율이나 이익률을 반영합니다. 통장 입금 총액을 그대로 연소득으로 넣으면 한도를 과대평가할 수 있습니다.',
  },
  {
    question: '배우자 소득을 합치면 대출 한도가 무조건 늘어나나요?',
    answer: '아닙니다. 배우자 소득을 합산하면 배우자 명의의 금융부채도 함께 합산해야 합니다. 은행권 기준은 합산할 수 있는 배우자 소득 유형에도 제한을 두며, 신청자가 인정소득을 쓰는 경우 배우자 소득을 합산할 수 없는 조건이 있습니다.',
  },
  {
    question: '소득이 최근 크게 올랐으면 최근 연도만 적용하나요?',
    answer: '최근 2개년 증빙소득 차이가 20%를 초과하면 2개년 평균이 원칙입니다. 다만 승진·고정급 인상·계속되는 사업계약처럼 증가분이 지속 가능한 상시소득임을 서류로 입증하면 최근 1개년 소득을 적용할 수 있습니다.',
  },
  {
    question: '이 페이지의 인정소득으로 대출 한도가 확정되나요?',
    answer: '아닙니다. 이 페이지는 소득 산정 구조를 이해하기 위한 참고 자료입니다. 실제 한도에는 기존 부채, 스트레스 금리, LTV, 방공제, 주택가격별 제한, 상품 요건과 금융회사 내부 심사가 함께 적용됩니다.',
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

export default function DsrIncomeProofGuide() {
  return (
    <GuideLayout
      pageUrl={path}
      title={title}
      description="DSR 계산기의 소득 칸에는 연봉계약서 숫자가 아니라 은행이 서류로 인정한 연소득이 들어갑니다. 이직·사업·부업처럼 소득 이력이 짧거나 여러 개인 경우 무엇을 준비해야 하는지 확인하세요."
      publishedAt="2026-09-11"
      reviewedAt="2026-09-11"
      referenceDate="2026-09-11 확인 · 현행 은행권·HF 소득 산정기준"
      lastUpdated="2026년 9월 11일"
      appliesTo="은행권 주담대 DSR 심사 · 보금자리론 소득 산정 참고"
      sources={[
        { label: '국가법령정보센터 — 은행권 주택담보대출 위험관리 세부기준', href: bankRuleUrl },
        { label: '한국주택금융공사 — 보금자리론 업무처리기준', href: hfRuleUrl },
        { label: '금융위원회 — DSR 소득 산정방식 개선', href: fscRuleUrl },
      ]}
      tocItems={tocItems}
      faqs={faqs}
      ctas={[
        { label: 'DSR·DTI·LTV 계산기', href: '/calculator/dsr-dti-ltv', description: '은행이 인정한 연소득과 기존 부채로 비율 확인' },
        { label: '대출 한도 계산기', href: '/calculator/loan-limit', description: '남은 연 상환여력으로 대출 원금 역산' },
      ]}
      relatedGuides={[
        { title: '스트레스 DSR 계산기', href: '/guide/stress-dsr', description: '인정소득에 심사용 금리를 적용해 주담대 한도 비교' },
        { title: '연봉 5천 주담대 한도', href: '/guide/mortgage-salary-5000', description: '같은 연봉도 기존 부채에 따라 한도가 달라지는 과정' },
        { title: 'LTV는 되는데 DSR에서 막히는 이유', href: '/guide/ltv-ok-dsr-blocked', description: '담보 한도와 소득 한도 중 낮은 값을 찾는 법' },
        { title: '마이너스통장 DSR 계산', href: '/guide/credit-line-dsr', description: '소득 다음으로 확인할 약정한도와 기존 부채' },
      ]}
    >
      <section id="answer" className="scroll-mt-20 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h2 className="mb-3 text-lg font-bold text-indigo-950">DSR 한도의 출발점은 “내 연봉”이 아니라 “은행이 인정한 연소득”입니다.</h2>
        <p className={p}>
          은행은 <strong>증빙소득을 우선</strong>하고, 객관적인 증빙이 어려울 때 인정소득이나 신고소득을 사용할 수 있습니다.
          1년 미만 소득은 연환산할 수 있지만 10% 차감 여부를 확인해야 하고, 배우자 소득을 더하면 배우자 부채도 함께 더합니다.
          계산기에는 급여계약서나 통장 입금액이 아니라 <strong>사전심사에서 확인한 인정 연소득</strong>을 넣는 것이 안전합니다.
        </p>
        <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-4 text-sm leading-relaxed text-gray-700">
          <strong>은행에 먼저 물을 한 문장</strong><br />
          “제 소득은 증빙·인정·신고소득 중 무엇으로, 얼마가 DSR 연소득에 입력됐고 1년 미만 차감이나 2개년 평균이 적용됐나요?”
        </div>
      </section>

      <Section id="types" title="증빙소득·인정소득·신고소득: 서류의 강도가 다릅니다">
        <p className={p}>
          현행 은행권 세부기준은 최근 소득이 현재도 유지되는지 재직증명서나 사업자등록상태로 함께 확인하도록 합니다.
          따라서 서류에 숫자가 있다는 것과 그 숫자 전부를 DSR 소득으로 인정받는 것은 같은 뜻이 아닙니다.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[720px] text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr><th className={th}>구분</th><th className={th}>대표 서류·자료</th><th className={th}>기본 처리</th><th className={th}>주의</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>증빙소득</th><td className={td}>근로소득원천징수영수증, 소득금액증명원, 사업소득원천징수영수증, 연금증서</td><td className={td}>객관적 자료를 우선 사용</td><td className={td}>최근 2개년 차이와 현재 지속 여부 확인</td></tr>
              <tr className="bg-gray-50/60"><th scope="row" className={`${td} font-semibold text-indigo-800`}>인정소득</th><td className={td}>국민연금·건강보험료 납부내역 등 공공기관 자료</td><td className={td}>추정액의 95%, 최대 5천만원이 기본</td><td className={td}>직장가입자는 은행 내규에 따라 100%·한도 예외 가능</td></tr>
              <tr><th scope="row" className={`${td} font-semibold text-indigo-800`}>신고소득</th><td className={td}>임대료·금융소득·매출·카드 사용액·저축액 등</td><td className={td}>추정액의 90%, 최대 5천만원이 기본</td><td className={td}>산식과 허용 상품을 은행 내부지침으로 운영</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          인정·신고 자료 2가지 이상으로 소득을 확인하면 최대 7천만원까지 인정할 수 있지만, 확인 금액이 다르면 낮은 금액을 사용합니다.
          두 금액을 더한다는 뜻이 아니며, 해당 산정방식이 금융회사 내규에 반영돼 있어야 합니다.
        </p>
      </Section>

      <Section id="short-history" title="이직·신규취업·복직: 1년 미만 소득은 연환산부터 확인">
        <p className={p}>
          은행권 기준은 최근 2년 증빙소득을 확인해 최근 1개년을 사용하되, 두 해의 차이가 20%를 넘으면 평균을 사용합니다.
          증가한 급여가 계속될 상시소득임을 입증하면 최근 1개년을 적용할 수 있습니다. 1년 미만 소득만 있으면 연환산 후 10% 차감이
          기본이지만, 신규입사·복직처럼 불가피하게 1년치가 없거나 소득 지속성을 입증한 경우에는 차감하지 않을 수 있습니다.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <h3 className="mb-2 font-bold text-indigo-950">월 400만원을 3개월 받은 이직자</h3>
            <p className={p}>단순 연환산은 400만원 × 12 = <strong>4,800만원</strong>입니다. 10% 차감이 적용되면 인정 연소득은 <strong>4,320만원</strong>입니다.</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="mb-2 font-bold text-emerald-950">상시소득 입증에 필요한 것</h3>
            <p className={p}>재직증명서·건강보험자격득실확인서, 근로계약서, 정상 급여가 찍힌 급여명세와 입금내역을 함께 준비합니다. 은행이 인정한 최종 금액을 받아 확인하세요.</p>
          </div>
        </div>
        <p className={p}>
          한국주택금융공사 기준은 현재 유지 중인 소득원이 원칙적으로 최소 1개월 이상임을 입증하도록 합니다. 사업소득은 계절성이 있어
          연환산이 오히려 왜곡을 만들면 연환산 여부를 달리 볼 수 있습니다. 일반 은행대출과 정책모기지의 세부 적용은 상품별로 다를 수 있습니다.
        </p>
      </Section>

      <Section id="business" title="사업자·프리랜서·부업: 매출이 아니라 소득을 증명합니다">
        <p className={p}>
          사업자와 프리랜서는 소득금액증명원, 사업소득 원천징수영수증, 세무사가 확인한 종합소득세 신고자료가 우선입니다.
          사업자등록증은 사업을 계속하고 있다는 사실을 확인하는 서류이지, 매출 전부를 소득으로 인정하는 서류가 아닙니다.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li><strong>신고가 끝난 소득:</strong> 소득금액증명원과 종합소득세 신고자료의 연도·금액을 맞춥니다.</li>
          <li><strong>3.3% 원천징수 프리랜서:</strong> 사업소득 원천징수영수증과 현재 계약이 계속됨을 보여주는 위촉·고용계약서를 준비합니다.</li>
          <li><strong>신규 사업자:</strong> 아직 세무 증빙이 발급되지 않는지 확인하고, 사업자등록상태·매출자료·업종을 함께 제시합니다.</li>
          <li><strong>부업·임대·금융소득:</strong> 과세 자료와 입금 내역을 준비하되, 기존 급여에 전액 합산된다고 가정하지 않습니다.</li>
        </ol>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          신고소득으로 매출액을 추정할 때도 업종별 단순경비율이나 이익률을 반영합니다. “연 매출 1억원이니 DSR 소득도 1억원”으로 계산하면
          잔금 계획이 틀어질 수 있습니다.
        </div>
      </Section>

      <Section id="spouse" title="배우자 소득 합산: 소득과 부채가 한 묶음으로 들어갑니다">
        <p className={p}>
          은행은 배우자 소득을 합산할 수 있지만, 그 경우 배우자 명의 금융부채도 함께 DSR에 반영해야 합니다.
          은행권 세부기준상 배우자 소득은 증빙소득과 신고소득으로 제한되며, 신청자의 연소득을 인정소득으로 산정할 때는 배우자 소득을
          합산할 수 없습니다. 공동차주 여부와 상품 구조까지 상담 단계에서 확인하세요.
        </p>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <strong>단순 예시:</strong> 본인 5천만원, 배우자 3천만원이면 은행 DSR 40% 가정의 연 상환예산은 2천만원에서 3,200만원으로 늘어납니다.
          그러나 배우자의 기존 대출 연 원리금이 1,200만원이라면 늘어난 예산 1,200만원을 그대로 소진합니다. 배우자 소득만 더하고 부채를 빼면 안 됩니다.
        </div>
      </Section>

      <Section id="examples" title="인정 연소득이 바뀌면 DSR 상환여력도 바로 달라집니다">
        <p className={p}>아래는 은행 DSR 40%를 가정해 소득만 비교한 참고 예시입니다. 실제 신규 대출 원금은 심사금리·만기·상환방식과 기존 부채를 넣어 다시 계산해야 합니다.</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[620px] text-sm text-gray-700">
            <thead className="bg-gray-50"><tr><th className={th}>인정 연소득</th><th className={th}>연 상환예산 40%</th><th className={th}>월 환산</th><th className={th}>4,800만원 대비 차이</th></tr></thead>
            <tbody>
              {[
                ['4,320만원', '1,728만원', '144만원', '-16만원/월'],
                ['4,800만원', '1,920만원', '160만원', '기준'],
                ['5,000만원', '2,000만원', '약 166.7만원', '+약 6.7만원/월'],
                ['7,000만원', '2,800만원', '약 233.3만원', '+약 73.3만원/월'],
              ].map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row" className={`${td} font-semibold`}>{cell}</th> : <td key={cell} className={td}>{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <p className={p}>
          연 상환예산 = 인정 연소득 × 적용 DSR 비율, 신규 대출에 남는 예산 = 연 상환예산 − 기존 부채의 심사상 연 원리금입니다.
          은행에서 받은 인정 연소득을 <Link href="/calculator/dsr-dti-ltv" className="font-semibold text-indigo-700 underline">DSR·DTI·LTV 계산기</Link>에 넣고,
          이후 <Link href="/guide/stress-dsr" className="font-semibold text-indigo-700 underline">스트레스 DSR</Link>과 담보 한도를 함께 확인하세요.
        </p>
      </Section>

      <Section id="checklist" title="은행 상담 전: 소득 유형별로 한 묶음씩 준비하세요">
        <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
          <li><strong>공통:</strong> 최근 2개년 소득자료, 재직증명서 또는 사업자등록상태, 현재 소득이 계속된다는 계약·지급 자료</li>
          <li><strong>근로자:</strong> 원천징수영수증·소득금액증명원, 최근 급여명세, 건강보험자격득실확인서</li>
          <li><strong>이직·복직자:</strong> 입사일·복직일이 보이는 서류, 1개월 이상 급여내역, 연환산과 10% 차감 적용 여부</li>
          <li><strong>사업자·프리랜서:</strong> 소득금액증명원·사업소득 원천징수영수증·세무 신고자료, 사업·위촉계약과 사업자 상태</li>
          <li><strong>인정소득:</strong> 국민연금 가입내역 또는 건강·장기요양보험료 납부확인서와 자격득실확인서</li>
          <li><strong>배우자 합산:</strong> 배우자의 같은 소득자료와 전체 금융부채 목록</li>
        </ul>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-950">
          소득서류를 준비하기 전에 계약금·잔금일을 확정하지 마세요. 같은 사람도 증빙 방식, 은행 내규, 정책모기지 여부에 따라 인정 연소득이 달라질 수 있습니다.
          사전심사 결과에서 <strong>인정 연소득·기존 부채 연 원리금·적용 DSR 비율</strong> 세 값을 받아 비교하는 것이 핵심입니다.
        </div>
        <DisclaimerNotice basis="2026-09-11 검토 · 은행업 감독업무시행세칙 위험관리 세부기준 · 한국주택금융공사 보금자리론 업무처리기준" />
      </Section>

      <HubBacklink hub="dsr-guide" />
    </GuideLayout>
  )
}
