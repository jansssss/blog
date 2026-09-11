import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'
import DisclaimerNotice from '@/components/DisclaimerNotice'
import { JsonLd } from '@/components/JsonLd'
import StressDsrCalculator from './StressDsrCalculator'
import { calculateStressDsr, formatDsrMoney, STRESS_DSR_BASIS, STRESS_EXAMPLES } from '@/lib/stress-dsr'

const path = '/guide/stress-dsr'
const url = `https://www.ohyess.kr${path}`
const title = '스트레스 DSR 계산기 — 2026년 주담대 한도·연봉별 예시'
const description = '연봉·기존 대출·지역·금리 유형을 바꾸며 스트레스 DSR과 주담대 한도 감소액을 실시간 비교하세요. 2026년 하반기 수도권 3%p·지방 0.75%p, 혼합형·주기형 계산과 6가지 예시를 제공합니다.'

export const metadata: Metadata = {
  title: `${title} | ohyess`, description,
  keywords: ['스트레스 DSR', '스트레스 DSR 계산기', '스트레스 DSR 3단계', '주담대 한도 계산', '연봉 5000 대출 한도', '혼합형 주기형 차이'],
  alternates: { canonical: url },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { title, description, url, type: 'article', locale: 'ko_KR', siteName: 'ohyess',
    publishedTime: '2026-09-08T00:00:00+09:00', modifiedTime: '2026-09-08T00:00:00+09:00',
    tags: ['스트레스 DSR', '주택담보대출', '대출 한도', '금리 유형'],
    images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: '스트레스 DSR 계산기 — 소득·지역·금리 유형별 주담대 한도 비교' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [`${url}/opengraph-image`] },
}

const tocItems = [
  { id: 'answer', label: '스트레스 DSR이란? 즉답' },
  { id: 'calculator', label: '실시간 스트레스 DSR 계산기' },
  { id: 'rules', label: '2026년 지역별·유형별 적용 기준' },
  { id: 'examples', label: '연봉·기존 부채별 6가지 계산 예시' },
  { id: 'formula', label: 'DSR 계산식과 한도 역산 방법' },
  { id: 'exceptions', label: '신용대출·경과규정·계산 제외 조건' },
  { id: 'checklist', label: '한도가 부족할 때 확인할 순서' },
]

const faqs = [
  { question: '스트레스 DSR이 적용되면 실제 대출 이자도 오르나요?', answer: '아닙니다. 스트레스 금리는 상환능력을 심사할 때만 더합니다. 약정금리 4%에 스트레스 금리 3%p를 더해 7%로 심사해도, 실제 월 납입액은 약정금리 4%로 계산합니다. 다만 이후 변동금리 자체가 오르면 실제 이자는 달라집니다.' },
  { question: '2026년 하반기 스트레스 DSR 금리는 얼마인가요?', answer: '2026년 9월 8일 확인 기준, 이 계산기의 변동형 주담대 참고값은 수도권·규제지역 3%p, 지방 비규제지역 0.75%p입니다. 지방은 2026년 12월 31일까지 기본 적용비율 50%와 금리 유형별 2단계 비율을 적용합니다. 실행일과 경과규정에 따라 은행이 적용하는 값은 달라질 수 있습니다.' },
  { question: '5년 고정금리면 스트레스 DSR이 면제되나요?', answer: '상품 이름만으로 면제되지 않습니다. 30년 만기·5년 고정 혼합형은 수도권·규제지역에서 스트레스 금리의 80%, 5년 주기형은 40%를 반영합니다. 지방 비규제지역은 각각 60%와 30%입니다. 만기까지 금리가 고정되는 대출과 구분해야 합니다.' },
  { question: '연봉 5천만원이면 주담대를 얼마까지 받을 수 있나요?', answer: '기존 부채 없음, 은행 DSR 40%, 약정 4%, 30년 원리금균등이라는 가정에서 수도권 변동형의 DSR 기준 한도는 약 2억 5,051만원입니다. 같은 조건의 가산 전 한도는 약 3억 4,910만원입니다. 담보가치·주택가격별 총액 제한·방공제 등을 적용하면 최종 한도는 더 낮아질 수 있습니다.' },
  { question: '신용대출이 1억원 이하면 DSR에서 빠지나요?', answer: '아닙니다. 신용대출 총잔액 1억원 초과 여부는 신용대출에 스트레스 금리를 추가하는 조건입니다. 스트레스 금리가 붙지 않는 신용대출도 일반 DSR에는 반영될 수 있습니다. 차주단위 DSR 적용 여부와 별도로 확인해야 합니다.' },
  { question: '은행 상담 결과와 계산기 금액이 다른 이유는 무엇인가요?', answer: '이 계산기는 신규 주담대 1건의 원리금균등 상환과 사용자가 입력한 기존 부채 산입액만 계산합니다. 은행별 인정소득, 신용대출의 심사용 만기, 보유주택 수, LTV, 방공제, 주택가격별 한도, 정책대출 및 과거 계약의 예외는 자동 판정하지 않습니다.' },
]

function Section({ id, title: heading, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className="mt-10 scroll-mt-20 space-y-4">
    <h2 className="border-b border-gray-100 pb-3 text-xl font-bold text-gray-900">{heading}</h2>
    {children}
  </section>
}
const p = 'text-[15px] leading-relaxed text-gray-700'
const th = 'border-b border-gray-200 px-3 py-3 text-left font-semibold'
const td = 'border-b border-gray-100 px-3 py-3'

export default function StressDsrGuide() {
  return <GuideLayout title={title} description="같은 연봉인데 왜 대출 한도가 다를까요? 실제 월 납입액과 은행의 심사용 금리를 분리하고, 내 조건에서 한도가 줄어드는 이유를 숫자로 확인하세요."
    pageUrl={path} publishedAt="2026-09-08" reviewedAt={STRESS_DSR_BASIS.reviewedAt} referenceDate="2026-09-08 · 하반기 운영기준"
    lastUpdated="2026년 9월 8일" appliesTo="일반 주담대 · 원리금균등 · 비거치 · 만기 1~30년"
    sources={[...STRESS_DSR_BASIS.sources]} tocItems={tocItems} faqs={faqs}
    ctas={[{ label: 'LTV와 DSR 함께 확인', href: '/calculator/loan-limit', description: '소득 한도 다음에는 담보 기준과 비교하세요.' }]}
    relatedGuides={[
      { title: 'DSR·DTI·LTV 뜻과 차이', href: '/guide/dsr-dti-ltv', description: '소득 기준과 담보 기준이 서로 다른 이유' },
      { title: 'LTV는 남는데 DSR에서 막히는 이유', href: '/guide/ltv-ok-dsr-blocked', description: '두 한도 중 무엇이 먼저 막는지 점검' },
      { title: '마이너스통장 DSR 계산', href: '/guide/credit-line-dsr', description: '사용하지 않은 한도도 영향을 줄 수 있는 이유' },
      { title: '주담대 방공제·MCI·MCG', href: '/guide/mortgage-mci-mcg', description: 'DSR 밖에서 담보 한도가 더 줄어드는 조건' },
    ]}>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', '@id': `${url}#calculator`,
      name: '스트레스 DSR 주담대 한도 계산기', url: `${url}#calculator`, description,
      applicationCategory: 'FinanceApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
      inLanguage: 'ko-KR', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
      featureList: ['연봉별 DSR 한도 비교', '지역·금리 유형별 스트레스 금리 반영', '실제 월 납입액과 심사용 원리금 분리'],
    }} />

    <section id="answer" className="scroll-mt-20 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <h2 className="mb-3 text-lg font-bold text-indigo-950">스트레스 DSR은 이자를 올리는 규제가 아니라, 한도를 보수적으로 계산하는 방식입니다.</h2>
      <p className={p}>금리가 오를 가능성에 대비해 약정금리에 가산폭을 얹고 연간 원리금을 다시 계산합니다. 소득은 그대로인데 심사용 원리금이 커지므로 대출 가능 원금이 줄어듭니다. <strong>실제 납입액은 약정금리, 대출 한도는 심사금리</strong>로 나누어 확인하세요.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="#calculator" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">내 한도 바로 계산 ↓</a>
        <a href="#examples" className="rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700">연봉별 예시 보기</a>
      </div>
    </section>

    <Section id="calculator" title="스트레스 DSR 계산기 — 조건을 바꾸면 즉시 반영">
      <p className={p}>예시 버튼으로 시작한 뒤 소득·신청액·부채를 조정하세요. 결과의 한도는 DSR만 고려한 참고값이며, 신용대출 신규 한도나 정책대출 한도를 계산하는 도구는 아닙니다.</p>
      <StressDsrCalculator />
      <noscript><p className={p}>입력값 변경 계산에는 자바스크립트가 필요합니다. 아래 6가지 예시와 계산식은 자바스크립트 없이도 읽을 수 있습니다.</p></noscript>
    </Section>

    <Section id="rules" title="2026년 하반기 스트레스 DSR: 지역과 금리 유형을 함께 확인">
      <p className={p}>금융위원회 2026년 7월 1일 행정지도는 수도권·규제지역 주담대의 스트레스 금리 하한을 3%로 두고, 그 밖의 대출은 1.5~3% 범위로 정합니다. 지방 비규제지역 주담대는 2026년 12월 31일까지 기본 적용비율 50%와 유형별 2단계 비율을 유지합니다. 아래는 3%·1.5%를 사용한 하반기 참고 계산입니다.</p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[580px] text-sm text-gray-700">
          <caption className="bg-gray-50 px-3 py-3 text-left text-xs text-gray-500">30년 만기 · 혼합형/주기형은 5년 고정/주기 · 단위 %p</caption>
          <thead><tr><th className={th} scope="col">유형</th><th className={th} scope="col">수도권·규제지역</th><th className={th} scope="col">지방 비규제지역</th></tr></thead>
          <tbody>{[
            ['변동형', '3 × 100% = 3.00', '1.5 × 50% × 100% = 0.75'],
            ['5년 혼합형', '3 × 80% = 2.40', '1.5 × 50% × 60% = 0.45'],
            ['5년 주기형', '3 × 40% = 1.20', '1.5 × 50% × 30% = 0.225'],
            ['만기까지 고정', '0', '0'],
          ].map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th key={i} scope="row" className={`${td} text-left font-medium`}>{cell}</th> : <td key={i} className={td}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className={p}><strong>혼합형</strong>은 최초 일정 기간 고정 후 변동금리로 전환하고, <strong>주기형</strong>은 일정 주기마다 금리가 재설정됩니다. 둘 다 만기까지 고정된 상품과는 다릅니다. 고정기간·주기가 5년 미만이면 100%를 반영하고, 5년 이상이면 만기 대비 비중에 따라 차등 반영합니다. 비중이 70% 이상이면 가산하지 않습니다.</p>
      <p className="text-sm text-gray-500">예: 5년 주기라도 30년 만기와 10년 만기의 비중은 다릅니다. 위 표를 모든 만기에 복사해 적용하지 마세요. 계산기는 입력한 만기로 비중을 다시 계산합니다. 반기 이후에는 새 고시와 실행일 기준을 다시 확인해야 합니다.</p>
    </Section>

    <Section id="examples" title="연봉 5천·7천·1억원과 기존 대출: 6가지 예시">
      <p className={p}>모두 은행 DSR 40%, 약정금리 4%, 30년 원리금균등을 가정한 계산입니다. 기존 부채 스트레스 추가액은 0원으로 두었습니다. 표의 금액은 만원 단위 반올림이며, 신청액에 따른 실제 월 납입액과 가능한 최대 원금은 서로 다른 값입니다.</p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[740px] text-sm text-gray-700">
          <caption className="bg-gray-50 px-3 py-3 text-left text-xs text-gray-500">신청액: 연봉 5천 3억원 / 연봉 7천 4억원 / 연봉 1억 5억원. LTV·방공제·총액 제한 미반영</caption>
          <thead><tr>{['가정', '가산 전 한도', '스트레스 한도', '신청액의 DSR', '실제 월 납입'].map(label => <th key={label} className={th} scope="col">{label}</th>)}</tr></thead>
          <tbody>{STRESS_EXAMPLES.map(example => {
            const result = calculateStressDsr(example.input)
            return <tr key={example.id}><th scope="row" className={`${td} text-left font-medium`}>{example.label}</th><td className={td}>{formatDsrMoney(result.normalLimit)}</td><td className={`${td} font-bold text-indigo-700`}>{formatDsrMoney(result.stressLimit)}</td><td className={td}>{result.stressDsr.toFixed(2)}%</td><td className={td}>{formatDsrMoney(result.actualMonthly)}</td></tr>
          })}</tbody>
        </table>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="mb-2 font-bold text-amber-950">사례 1. 일반 DSR은 통과했는데 한도가 부족</h3><p className={p}>연봉 5천만원·3억원·4%·30년이면 실제 월 납입은 약 143만원입니다. 가산 전 DSR은 약 34.37%지만 수도권 변동형 심사금리 7%로 보면 약 47.90%가 됩니다. 실제 이자가 올라서가 아니라, 심사에 사용하는 상환액이 달라서 기준을 넘습니다.</p></div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><h3 className="mb-2 font-bold text-indigo-950">사례 2. 월 50만원 부채가 남아 있다면</h3><p className={p}>기존 부채의 DSR 산입액이 연 600만원이면 연봉 5천만원의 연 상환예산 2천만원 중 신규 대출에 쓸 수 있는 금액은 1,400만원입니다. 같은 수도권 변동형 조건의 한도는 약 1억 7,536만원으로 줄어듭니다. 실제 월 납입이 50만원이라는 사실만으로 산입액을 확정하지는 마세요.</p></div>
      </div>
    </Section>

    <Section id="formula" title="스트레스 DSR 계산식과 한도 역산 과정">
      <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
        <li><strong>가산폭</strong> = 반기 스트레스 금리 × 기본 적용비율 × 금리 유형별 반영비율.</li>
        <li><strong>심사금리</strong> = 실제 약정금리 + 가산폭. 4% + 3%p = 7%이며, 4%의 3%를 더하는 계산이 아닙니다.</li>
        <li><strong>스트레스 DSR</strong> = (신규 대출의 심사용 월 원리금 × 12 + 기존 연 원리금 + 기존 부채 추가 반영액) ÷ 인정 연소득 × 100.</li>
        <li><strong>남은 연 상환예산</strong> = 인정 연소득 × DSR 기준 − 기존 부채의 심사상 연 원리금. 0원 이하면 추가 원금 한도도 0원입니다.</li>
      </ol>
      <div className="rounded-xl bg-gray-100 p-4 text-sm leading-relaxed text-gray-700">
        <p>원리금균등 월 납입액 = P × r ÷ [1 − (1+r)<sup>−n</sup>]</p>
        <p className="mt-2">P는 원금, r은 연 금리÷12÷100, n은 개월 수입니다. 한도 원금은 월 상환예산 × [1 − (1+r)<sup>−n</sup>] ÷ r로 역산합니다. 금리가 0%이면 월 납입은 P÷n, 한도는 월 예산×n입니다.</p>
      </div>
      <p className={p}>예를 들어 연봉 5천만원·기존 부채 없음·DSR 40%라면 월 상환예산은 약 166.7만원입니다. 이 예산으로 30년간 상환할 수 있는 원금은 심사금리 4%일 때 약 3억 4,910만원, 7%일 때 약 2억 5,051만원입니다. 금리 유형 비교는 같은 약정금리를 가정하므로 은행의 상품별 금리 견적을 다시 넣어 판단하세요.</p>
    </Section>

    <Section id="exceptions" title="신용대출·기존 계약·정책대출은 별도 확인">
      <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
        <li><strong>신용대출:</strong> 총잔액이 1억원을 초과할 때 스트레스 금리를 적용합니다. 만기 5년 이상 고정금리는 미적용, 3년 이상 5년 미만 고정금리는 60%, 그 밖에는 100%입니다. 이 페이지의 금리 유형 선택은 주담대 전용입니다.</li>
        <li><strong>기존 부채:</strong> 신용대출·한도대출 등은 실제 상환일정과 다른 심사용 만기를 사용할 수 있습니다. 기존 부채란에는 은행이 산출한 연 원리금을 입력하고, 스트레스 추가액을 중복 반영하지 마세요.</li>
        <li><strong>과거 계약:</strong> 2025년 10월 15일까지 매매계약과 계약금 납부 증빙을 갖춘 대출이나 입주자모집공고 등 요건을 갖춘 잔금대출은 종전 규정이 적용될 수 있습니다. 이전 단계의 경과규정도 있어 실행일 하나만으로 판단할 수 없습니다.</li>
        <li><strong>정책대출·전세대출:</strong> DSR 적용 제외와 스트레스 금리 미적용은 다른 개념입니다. 상품별 예외와 <Link className="text-indigo-700 underline" href="/guide/jeonse-loan-dsr">1주택자 전세대출의 이자 반영 조건</Link>을 확인하세요.</li>
        <li><strong>상환방식:</strong> 원금균등·만기일시·거치기간·중도상환·소득의 장래 증가를 자동 반영하지 않습니다. 해당 상품은 은행의 상환표와 산출내역으로 별도 비교하세요.</li>
      </ul>
    </Section>

    <Section id="checklist" title="주담대 한도가 부족할 때, 은행에 확인할 5가지">
      <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
        <li><Link className="text-indigo-700 underline" href="/guide/dsr-income-proof">인정소득과 증빙 방식</Link>, 기존 부채의 DSR 산입액을 각각 받습니다. 연봉과 통장 출금액만으로 계산한 값과 비교합니다.</li>
        <li>담보주택의 수도권·규제지역 여부, 실행일, 계약일에 따른 경과규정을 확인합니다.</li>
        <li>변동형·혼합형·주기형별 실제 약정금리와 가산폭을 받아 같은 만기로 비교합니다.</li>
        <li>기존 부채 상환이나 한도 축소 전후를 계산합니다. 상환에 쓴 돈만큼 잔금 자기자금도 줄어드는 점을 함께 봅니다.</li>
        <li>최종 승인액에는 LTV·방공제·주택가격별 한도·은행 취급 조건을 적용합니다. DSR 한도를 그대로 잔금 계획에 넣지 않습니다.</li>
      </ol>
      <DisclaimerNotice basis="2026-09-08 검토 · 2026년 하반기 행정지도 · 주담대 원리금균등 참고 계산" />
      <nav aria-label="주제별 바로가기" className="flex flex-wrap gap-2 text-xs text-indigo-700">
        {[['#answer', '#스트레스DSR'], ['#calculator', '#DSR계산기'], ['#rules', '#스트레스DSR3단계'], ['#examples', '#연봉별대출한도']].map(([href, label]) => <a key={href} href={href} className="rounded-full bg-indigo-50 px-3 py-2 hover:bg-indigo-100">{label}</a>)}
      </nav>
    </Section>
    <HubBacklink hub="dsr-guide" />
  </GuideLayout>
}
