import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import RateCompareWidget from './RateCompareWidget'

export const metadata: Metadata = {
  title: '주담대 금리 0.5% 차이, 총이자 얼마나 달라질까? — 협상 전략까지 | ohyess',
  description:
    '금리 0.5% 차이가 3억 30년 기준 총이자 3,100만원을 만듭니다. 내 대출 금액으로 직접 계산하고, 실제로 금리를 낮추는 우대금리 전략과 갈아타기 손익분기점 계산 방법까지 알아보세요.',
  openGraph: {
    title: '주담대 금리 0.5% 차이, 총이자 얼마나 달라질까?',
    description: '금리 차이 실시간 비교 계산기 + 실전 금리 협상 전략',
    type: 'article',
  },
  alternates: { canonical: '/guide/rate-0p5-difference' },
}

const tocItems = [
  { id: 'intro', label: '0.5%, 정말 별거 아닌가?' },
  { id: 'calc', label: '내 대출 금액으로 직접 비교하기' },
  { id: 'why-matters', label: '금리 차이가 기간에 따라 어떻게 누적되나' },
  { id: 'rate-negotiation', label: '실제로 금리를 낮추는 방법 — 협상 전략' },
  { id: 'real-discount', label: '우대금리 중 실제로 받기 어려운 것 vs 쉬운 것' },
  { id: 'switch', label: '이미 대출이 있다면 — 갈아타기 손익분기점' },
]

const ctas = [
  { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '금리·금액·기간 입력으로 월 납입액과 총이자 즉시 계산' },
  { label: 'DSR·DTI·LTV 계산기', href: '/calculator/dsr-dti-ltv', description: '내 소득·부채 기준 주담대 한도 확인' },
]

const relatedGuides = [
  { title: 'DSR·DTI·LTV 뜻과 차이 완전 정리', href: '/guide/dsr-dti-ltv', description: '대출 한도를 결정하는 3가지 규제 지표 완전 정리' },
  { title: 'LTV는 남는데 DSR에서 막히는 이유', href: '/guide/ltv-ok-dsr-blocked', description: '한도 확보 후 금리 협상이 중요한 이유' },
  { title: '연봉 5,000만원 신용대출 있으면 주담대 한도는?', href: '/guide/mortgage-salary-5000', description: 'DSR 기준 주담대 한도 실전 계산' },
  { title: '자동차 할부가 주담대 한도를 줄이는 이유', href: '/guide/car-loan-dsr-impact', description: '한도 확보 전에 알아야 할 기존 부채 영향' },
]

const faqs = [
  {
    question: '고정금리와 변동금리 중 어느 쪽이 유리한가요?',
    answer: '금리 방향에 따라 달라집니다. 금리 하락이 예상되면 변동금리가, 불확실하거나 상승이 예상되면 고정금리가 안전합니다. 현재 고정과 변동 금리 차이가 0.5%p 미만이라면 리스크를 줄이는 관점에서 고정금리를 더 고려할 만합니다. 단, 스트레스 DSR 적용 시 변동금리 선택이 한도를 줄일 수 있다는 점도 감안하세요.',
  },
  {
    question: '금리 협상이 실제로 되나요?',
    answer: '됩니다. 여러 금융기관에 사전심사를 받은 뒤 더 낮은 금리를 받은 곳을 협상 카드로 사용하면 추가 우대금리를 적용해주는 경우가 있습니다. 단, "다른 데서 더 낮게 나왔다"는 말만으로는 부족하고, 실제 사전심사 결과서를 보여주는 것이 효과적입니다.',
  },
  {
    question: '중도상환수수료 없이 갈아탈 수 있는 경우가 있나요?',
    answer: '대출 후 일정 기간(보통 3년)이 지나면 중도상환수수료가 면제됩니다. 또한 일부 상품은 수수료 없는 대환을 조건으로 제공합니다. 기존 대출 약정서에서 수수료 적용 기간과 비율을 먼저 확인하세요.',
  },
  {
    question: '인터넷은행이 시중은행보다 항상 금리가 낮나요?',
    answer: '항상 그렇지는 않습니다. 인터넷은행은 점포 비용이 없어 금리 경쟁력이 있지만, 심사 기준이나 한도 산정 방식이 달라 같은 조건에서 시중은행보다 낮을 수도, 높을 수도 있습니다. 반드시 여러 곳을 비교해보세요.',
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
function Callout({ color = 'blue', children }: { color?: 'blue' | 'amber' | 'emerald' | 'red'; children: ReactNode }) {
  const s = {
    blue:    'bg-blue-50 border-blue-200 text-blue-900',
    amber:   'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    red:     'bg-red-50 border-red-200 text-red-900',
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed mb-4 ${s[color]}`}>{children}</div>
}
function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
}

function fmt(n: number) { return new Intl.NumberFormat('ko-KR').format(Math.round(n)) }
function pmt(p: number, r: number, n: number) {
  const rr = r / 12 / 100; if (rr === 0) return p / n
  return p * (rr * Math.pow(1 + rr, n)) / (Math.pow(1 + rr, n) - 1)
}

export default function Rate0p5DifferencePage() {
  const m40 = pmt(300_000_000, 4.0, 360)
  const m45 = pmt(300_000_000, 4.5, 360)
  const diff = Math.round((m45 * 360 - 300_000_000) - (m40 * 360 - 300_000_000))

  return (
    <GuideLayout
      pageUrl="/guide/rate-0p5-difference"
      title="주담대 금리 0.5% 차이, 총이자 얼마나 달라질까?"
      description="내 대출 금액으로 금리 차이를 실시간 비교하고, 실제로 금리를 낮추는 협상 전략과 갈아타기 손익분기점까지 알아봅니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 6월"
    >
      <H2 id="intro">0.5%, 정말 별거 아닌가?</H2>
      <P>
        두 은행에서 금리 제안을 받았을 때 0.5% 차이를 보고 "별거 아니겠지"라고 넘어가기 쉽습니다.
        연봉 기준으로 0.5%면 25만원이지만, 3억원 주담대 금리 0.5%는 이야기가 완전히 다릅니다.
      </P>
      <Callout color="amber">
        <strong>3억원, 30년 — 금리 4.0% vs 4.5%</strong><br />
        월 납입액 차이: {fmt(m45 - m40)}원/월<br />
        30년 총이자 차이: <strong>{fmt(diff / 10000)}만원</strong><br /><br />
        {fmt(diff / 10000)}만원은 중형 SUV 한 대 값입니다.
        "별거 아닌" 0.5%가 30년 동안 만드는 차이입니다.
      </Callout>

      <H2 id="calc">내 대출 금액으로 직접 비교하기</H2>
      <P>
        아래 계산기에서 대출 금액, 금리 A와 B, 상환기간을 입력하면
        두 금리의 월 납입액 차이와 총이자 차이를 실시간으로 비교할 수 있습니다.
      </P>
      <RateCompareWidget />

      <H2 id="why-matters">금리 차이가 기간에 따라 어떻게 누적되나</H2>
      <P>
        3억원 대출에서 금리 4.0% vs 4.5% 차이가 상환기간에 따라 얼마나 달라지는지 봅니다.
      </P>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">상환기간</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">4.0% 총이자</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">4.5% 총이자</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">차이</th>
            </tr>
          </thead>
          <tbody>
            {[10, 20, 30].map((years, i) => {
              const months = years * 12
              const i40 = Math.round(pmt(300_000_000, 4.0, months) * months - 300_000_000)
              const i45 = Math.round(pmt(300_000_000, 4.5, months) * months - 300_000_000)
              return (
                <tr key={years} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-800">{years}년</td>
                  <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">{fmt(i40 / 10000)}만원</td>
                  <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">{fmt(i45 / 10000)}만원</td>
                  <td className="border border-gray-200 px-4 py-3 text-center font-bold text-red-600">+{fmt((i45 - i40) / 10000)}만원</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <P>
        10년 상환에서 820만원이던 차이가 30년이 되면 3,100만원이 됩니다.
        주담대처럼 기간이 긴 대출일수록 금리 차이의 영향이 기하급수적으로 커집니다.
        <strong>주담대에서 금리 0.1%p도 허투루 넘어가면 안 되는 이유</strong>가 이것입니다.
      </P>

      <H2 id="rate-negotiation">실제로 금리를 낮추는 방법 — 협상 전략</H2>
      <H3>① 사전심사를 여러 곳에 넣고 비교 협상한다</H3>
      <P>
        가장 효과적인 방법입니다. 시중은행·인터넷은행·지방은행 3곳 이상에 사전심사를 넣어보면
        같은 조건에서 0.3~0.7%p 차이가 나는 경우가 흔합니다.
      </P>
      <Callout color="blue">
        <strong>협상 실전 스크립트</strong><br />
        "다른 은행에서 사전심사를 받아봤더니 이 금리로 나왔는데,
        여기서는 추가 우대금리 적용이 가능할까요?<br />
        급여 이체와 신용카드 실적도 여기서 유지할 생각입니다."<br /><br />
        구두로만 하지 말고 <strong>사전심사 결과서를 직접 보여주면</strong> 협상력이 높아집니다.
        담당자는 재량으로 0.1~0.2%p 추가 우대를 적용할 수 있는 경우가 있습니다.
      </Callout>
      <H3>② 우대금리를 최대한 챙긴다</H3>
      <P>
        주담대 우대금리 항목은 여러 가지가 있지만, 실제로 챙길 수 있는 것과 껍데기인 것이 다릅니다.
      </P>

      <H2 id="real-discount">우대금리 중 실제로 받기 어려운 것 vs 쉬운 것</H2>
      <P>
        우대금리 조건표를 보면 항목이 많지만, 실질적으로 적용받기 어렵거나 이미 기본 금리에 포함된 것들이 있습니다.
      </P>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">우대금리 항목</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">실효성</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">설명</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['급여 이체', '◎ 높음', '주거래 통장 급여 이체 시 0.1~0.3%p. 실행 즉시 적용'],
              ['신용카드 월 실적', '○ 보통', '특정 카드 월 30만원 이상 사용 시 0.1%p. 유지 조건 확인 필요'],
              ['자동이체 설정', '◎ 높음', '공과금·보험 자동이체 설정만으로 0.05~0.1%p'],
              ['청약통장·적금 연결', '○ 보통', '청약저축·적금 보유 시 0.1%p. 가입만 하면 됨'],
              ['특정 직군·공무원 우대', '△ 제한적', '해당 직군에만 적용. 내가 해당되는지 확인 필수'],
              ['"우량 고객" 별도 우대', '△ 협상 필요', '신용점수 900 이상, 자산 규모에 따라 추가 적용 가능'],
            ].map(([item, eff, desc], i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-800">{item}</td>
                <td className={`border border-gray-200 px-4 py-3 text-center font-bold text-sm ${eff.includes('◎') ? 'text-emerald-600' : eff.includes('○') ? 'text-blue-600' : 'text-gray-500'}`}>{eff}</td>
                <td className="border border-gray-200 px-4 py-3 text-xs text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        급여 이체 + 자동이체 설정만으로 0.2~0.4%p 우대금리를 받을 수 있습니다.
        이것만으로 30년 기준 1,600~3,200만원을 절약할 수 있습니다.
        대출 실행 전에 반드시 챙기세요.
      </P>

      <H2 id="switch">이미 대출이 있다면 — 갈아타기 손익분기점</H2>
      <P>
        현재 금리보다 더 낮은 상품으로 갈아타려면 중도상환수수료를 내야 합니다.
        갈아탈지 말지 결정하는 공식은 단순합니다.
      </P>
      <Callout color="blue">
        <strong>갈아타기 손익분기점 공식</strong><br />
        손익분기 기간 = 중도상환수수료 ÷ 연간 이자 절감액<br /><br />
        예시: 3억 대출, 4.5% → 4.0%로 갈아타기<br />
        • 연간 이자 절감액: 약 103만원 (계산기로 확인)<br />
        • 중도상환수수료: 잔액 × 1% = 300만원<br />
        • 손익분기 기간: 300 ÷ 103 ≈ <strong>약 2.9년</strong><br /><br />
        남은 대출 기간이 3년 이상이면 갈아타는 것이 유리합니다.
      </Callout>
      <H3>갈아타기 전 확인 체크리스트</H3>
      <Ul>
        <li>중도상환수수료 잔액과 비율 확인 (대출 약정서 또는 은행 앱)</li>
        <li>새 대출의 금리가 고정인지 변동인지 (변동이면 스트레스 DSR도 고려)</li>
        <li>갈아타기 시 새로운 우대금리 조건을 받을 수 있는지</li>
        <li>대환대출 수수료가 별도로 있는지 (보통 없으나 확인 필요)</li>
      </Ul>
      <P>
        최근에는 온라인 대환대출 플랫폼을 통해 여러 상품을 한 번에 비교할 수 있습니다.
        수수료와 절감액을 계산기로 먼저 구한 뒤, 갈아타기 여부를 결정하세요.
      </P>
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mt-6">
        <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
        <p>• 원리금균등 상환(PMT 공식) 기준 / 거치기간 없음<br />
        • 실제 총이자는 금리 변동(변동금리), 중도 상환 여부에 따라 다를 수 있습니다</p>
      </div>
    </GuideLayout>
  )
}
