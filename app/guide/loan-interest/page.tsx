import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: '대출이자 계산법 완전 정리 | ohyess 가이드',
  description:
    '원리금균등·원금균등·만기일시 상환 방식별 이자 계산 공식, 변동금리와 고정금리의 차이, 직장인·자영업자 실전 사례 2개로 대출이자 계산법을 완벽히 이해합니다.',
  openGraph: {
    title: '대출이자 계산법 완전 정리',
    description: '상환방식·금리 유형별 이자 계산법을 실전 사례로 완전 정리',
    type: 'article',
  },
}

const tocItems = [
  { id: 'basic-formula', label: '이자 계산의 기본 공식' },
  { id: 'loan-types', label: '신용대출 vs 담보대출, 금리 구조의 차이' },
  { id: 'rate-types', label: '변동금리 vs 고정금리' },
  { id: 'repayment-effect', label: '상환 방식별 총이자 차이' },
  { id: 'cases', label: '실전 사례 2개' },
  { id: 'strategies', label: '이자 부담 줄이는 3가지 전략' },
]

const ctas = [
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '원금·금리·기간으로 월납입액·총이자 즉시 계산',
  },
  {
    label: '금리 변동 영향 계산기',
    href: '/calculator/rate-change-impact',
    description: '금리 1%p 오를 때 추가 이자 부담 확인',
  },
]

const relatedGuides = [
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '소득·자산 기준 실제 대출 한도 계산법',
  },
  {
    title: '상환방식 완전 비교',
    href: '/guide/repayment-types',
    description: '원리금균등·원금균등·만기일시 총이자 비교',
  },
  {
    title: '중도상환수수료 완전 정리',
    href: '/guide/early-repayment-fee',
    description: '대출 일찍 갚을 때 내는 수수료 계산법',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인해야 할 항목',
  },
]

const faqs = [
  {
    question: '대출이자는 매달 동일하게 나오나요?',
    answer:
      '상환 방식에 따라 다릅니다. 원리금균등상환은 매달 납입 총액이 동일하지만, 초반에는 이자 비중이 높고 후반으로 갈수록 원금 비중이 커집니다. 원금균등상환은 원금이 매달 일정하게 줄기 때문에 이자도 함께 줄어 납입액이 감소합니다. 만기일시상환은 만기까지 이자만 납부하므로 매달 동일합니다.',
  },
  {
    question: '신용대출과 주택담보대출 금리 차이가 3~4%p씩 나는 이유는?',
    answer:
      '담보 유무의 차이입니다. 주택담보대출은 집을 담보로 제공하므로 은행 입장에서 리스크가 낮습니다. 채무자가 상환하지 못해도 담보물을 처분해 회수할 수 있기 때문입니다. 반면 신용대출은 담보 없이 신용도만으로 대출하므로 리스크가 높아 금리도 높게 책정됩니다.',
  },
  {
    question: '변동금리로 빌렸는데 기준금리가 1%p 오르면 이자가 얼마나 늘어나나요?',
    answer:
      '대출 잔액 1억 기준, 금리가 1%p 오르면 연 100만원(월 약 8.3만원)의 이자 부담이 늘어납니다. 2억이면 월 16.7만원, 3억이면 월 25만원 추가 부담입니다. 금리 변동 영향 계산기를 활용하면 현재 대출 조건에서 정확한 수치를 확인할 수 있습니다.',
  },
  {
    question: '총이자를 줄이려면 원금균등상환이 항상 유리한가요?',
    answer:
      '총이자 관점에서는 원금균등이 유리합니다. 같은 조건에서 원금균등은 원리금균등보다 총이자가 수십만~수백만원 적습니다. 다만 초기에 납입액이 더 많아 현금 흐름에 부담이 됩니다. 초기 부담을 감당할 수 있다면 원금균등이 장기적으로 더 경제적입니다.',
  },
  {
    question: '대출을 받은 뒤에도 금리를 낮출 수 있나요?',
    answer:
      '가능합니다. 첫째로 같은 은행에서 금리 인하 요구권을 행사하는 방법이 있습니다(신용점수 상승·소득 증가 등 조건 변화 시). 둘째로 더 낮은 금리를 제공하는 다른 금융사로 대환대출하는 방법입니다. 단, 대환 시 중도상환수수료와 새 대출의 부대비용을 꼭 비교해야 합니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-20"
    >
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

function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
  )
}

function CaseBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 border-l-4 border-blue-400 rounded-r-lg p-5 mb-6">
      <p className="font-semibold text-gray-900 mb-3 text-[15px]">{title}</p>
      {children}
    </div>
  )
}

export default function LoanInterestGuidePage() {
  return (
    <GuideLayout
      title="대출이자 계산법 완전 정리 — 왜 이자가 다르게 나올까"
      description="원리금균등·원금균등·만기일시 상환 방식별 이자 계산 공식, 변동금리와 고정금리의 차이, 직장인과 자영업자의 실전 사례 2개를 통해 대출이자 계산의 구조를 완전히 이해합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <H2 id="basic-formula">이자 계산의 기본 공식</H2>
      <P>
        은행이 이자를 계산하는 원리는 단순합니다. 대부분의 대출은{' '}
        <strong className="font-semibold text-gray-900">연이율(연 금리)</strong>을 기준으로
        하며, 이를 12로 나누어 월이자를 산출합니다. 공식은 다음과 같습니다.
      </P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 font-mono text-sm text-blue-900">
        월이자 = 대출 잔액 × 연이율 ÷ 12
      </div>
      <P>
        예를 들어 3천만원을 연 6%로 빌렸다면 첫 달 이자는{' '}
        <strong className="font-semibold">3,000만원 × 0.06 ÷ 12 = 15만원</strong>입니다. 실제
        대출 실행일이 월 중간에 걸리면 일할 계산(연이율 ÷ 365 × 일수)이 적용되지만, 정기
        납입분은 월할 계산이 기준입니다.
      </P>
      <P>
        여기서 핵심은{' '}
        <strong className="font-semibold text-gray-900">
          이자 계산의 기준이 되는 &apos;대출 잔액&apos;
        </strong>
        입니다. 상환이 이루어지면 잔액이 줄고, 줄어든 잔액에 금리를 곱하므로 시간이 지날수록
        이자액도 변합니다. 이 메커니즘을 이해하면 상환 방식별 이자 차이가 왜 발생하는지
        자연스럽게 납득됩니다.
      </P>

      <H2 id="loan-types">신용대출 vs 담보대출, 금리 구조가 다른 이유</H2>
      <P>
        같은 1억원을 빌려도 신용대출 금리는 연 6~10%, 주택담보대출은 연 3~5% 수준으로 큰 차이가
        납니다. 이 차이는 은행의 리스크 관리 방식에서 비롯됩니다.
      </P>
      <H3>신용대출 금리를 결정하는 요소</H3>
      <Ul>
        <li>
          <strong className="font-semibold">신용점수(KCB/NICE 기준)</strong>: 점수가 높을수록
          우대금리 폭이 커짐
        </li>
        <li>소득과 직업 안정성: 대기업·공무원은 은행권 최저 금리 접근 가능</li>
        <li>주거래 은행 실적: 급여 이체·적금·청약 보유 여부가 금리에 반영</li>
        <li>기존 부채 수준(DSR): 기존 빚이 적을수록 더 낮은 금리 제시</li>
      </Ul>
      <P>
        담보대출은 여기에 더해 담보물의 가치(LTV)가 금리에 직접 영향을 미칩니다. 아파트를
        담보로 제공하면 은행은 채무 불이행 시 담보를 처분해 원금을 회수할 수 있으므로 그만큼
        금리를 낮춰줍니다.
      </P>
      <P>
        실무적으로 중요한 포인트는{' '}
        <strong className="font-semibold text-gray-900">
          같은 담보물이라도 은행마다 금리 차이가 최대 1~1.5%p
        </strong>{' '}
        난다는 점입니다. 주택담보대출이라도 반드시 2~3개 금융사를 비교해야 합니다.
      </P>

      <H2 id="rate-types">변동금리 vs 고정금리 — 어떤 이자가 더 쌀까</H2>
      <P>
        변동금리는 시장 기준금리(COFIX·코픽스)에 연동됩니다. 한국은행이 기준금리를 올리면
        COFIX도 오르고 내 대출 금리도 따라 오릅니다. 반대로 기준금리가 내려가면 이자 부담도
        줄어듭니다. 금리 변화의 혜택과 리스크를 동시에 부담하는 구조입니다.
      </P>
      <P>
        고정금리는 대출 실행 시 약정한 금리를 만기까지 유지합니다. 금리가 올라도 내 금리는
        그대로이지만, 반대로 금리가 내려가도 혜택을 받지 못합니다. 통상 고정금리는 약정 시점에
        변동금리보다 0.3~0.8%p 높게 책정됩니다.
      </P>
      <H3>고정금리가 유리한 상황</H3>
      <Ul>
        <li>기준금리 인상 사이클이 시작되는 시점</li>
        <li>대출 기간이 10년 이상인 장기 대출</li>
        <li>소득이 고정되어 금리 변동 리스크를 감당하기 어려운 경우</li>
        <li>가계 예산 계획을 일정하게 유지하고 싶은 경우</li>
      </Ul>
      <P>
        반대로 기준금리 인하가 예상되거나 단기(3~5년 이하) 대출이라면 변동금리가 유리할 수
        있습니다. 다만 금리 예측은 전문가도 틀리는 영역이므로, 본인의 리스크 허용 범위에 맞게
        선택하는 것이 가장 현명합니다.
      </P>

      <H2 id="repayment-effect">상환 방식이 총이자에 미치는 영향</H2>
      <P>
        같은 원금·금리·기간이라도 상환 방식에 따라 총 납입 이자는 크게 달라집니다. 아래 표는
        3천만원, 연 6%, 36개월 기준 비교입니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                상환 방식
              </th>
              <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">
                초기 월납입액
              </th>
              <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">
                총이자
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                원리금균등
              </td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">
                약 912,000원 (고정)
              </td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">
                약 2,832,000원
              </td>
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                원금균등
              </td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">
                약 983,000원 → 감소
              </td>
              <td className="border border-gray-200 px-4 py-3 text-right font-semibold text-blue-700">
                약 2,295,000원
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                만기일시
              </td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">
                150,000원 (이자만)
              </td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">
                약 5,400,000원
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        원금균등상환은 원리금균등보다 총이자가 약 537,000원 적습니다. 만기일시상환은 매달
        이자만 내다가 만기에 원금을 한 번에 상환하므로 총이자가 가장 많습니다. 초기 납입
        부담을 감당할 수 있다면 원금균등이 장기적으로 가장 경제적입니다.
      </P>

      <H2 id="cases">실전 사례로 직접 계산해보기</H2>
      <CaseBox title="사례 1 — 직장인 A씨: 신용대출 3천만원 · 연 6.5% · 36개월 원리금균등">
        <P>
          월급 350만원을 받는 대기업 직원 A씨는 전세 자금 부족분을 채우기 위해 신용대출
          3천만원을 받기로 했습니다.
        </P>
        <Ul>
          <li>월 납입액: 약 918,000원 (36개월 고정)</li>
          <li>첫 달 이자: 3천만원 × 6.5% ÷ 12 = 162,500원</li>
          <li>첫 달 원금 상환: 918,000 - 162,500 = 755,500원</li>
          <li>36개월 총 납입: 33,048,000원</li>
          <li>총이자: 약 3,048,000원</li>
        </Ul>
        <P>
          월 소득 350만원에서 918,000원 납입은 DSR 26.2% 수준입니다. 향후 주택 구입을
          계획한다면 이 신용대출이 DSR 계산에 포함되어 주담대 한도를 줄입니다. 주택 대출 전에
          신용대출을 최대한 상환해두는 것이 유리합니다.
        </P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 B씨: 사업자금 1억 · 연 5.8% · 5년 · 1년 거치">
        <P>
          매출이 불규칙한 자영업자 B씨는 사업 초기 운전자금 확보를 위해 1억을 사업자 담보대출로
          받았습니다. 매출 안정화까지 1년 거치를 선택했습니다.
        </P>
        <Ul>
          <li>거치 기간(12개월): 월이자만 = 1억 × 5.8% ÷ 12 = 483,333원</li>
          <li>상환 기간(48개월, 원리금균등): 월납입 약 2,340,000원</li>
          <li>총 납입 이자: 거치(5,800,000) + 상환분 이자 ≒ 약 17,120,000원</li>
        </Ul>
        <P>
          거치 없이 처음부터 원리금균등 상환을 선택했다면 총이자는 약 15,500,000원으로
          1,620,000원이 절약됩니다. 초기 현금 흐름이 절박하다면 거치가 도움이 되지만, 이자
          부담이 늘어난다는 점을 반드시 계산해두어야 합니다.
        </P>
      </CaseBox>

      <H2 id="strategies">이자 부담을 줄이는 3가지 실용 전략</H2>
      <H3>1. 금리 인하 요구권 활용</H3>
      <P>
        신용점수가 올랐거나 소득이 늘었거나 자산이 증가했다면 금융사에 금리 인하를 요구할 수
        있습니다. 법적으로 보장된 권리이며 거절되더라도 불이익이 없습니다. 연 1~2회 신청
        가능하고, 통상 0.1~0.5%p 인하 효과를 기대할 수 있습니다.
      </P>
      <H3>2. 대환대출로 금리 낮추기</H3>
      <P>
        금리 차이가 0.5%p 이상이라면 대환대출을 검토하세요. 단, 중도상환수수료(통상 잔액의
        0.5~1.4%)를 먼저 확인해야 합니다. 수수료가 이자 절감액보다 크면 대환이 오히려 손해가
        됩니다. 계산기로 손익분기점을 먼저 확인하는 것이 좋습니다.
      </P>
      <H3>3. 여윳돈 생기면 부분 중도상환</H3>
      <P>
        연말 성과급, 인센티브, 세금 환급금이 생기면 원금 일부를 미리 갚으세요. 남은 원금이
        줄면 이후 발생하는 이자도 함께 줄어듭니다. 수수료 없는 중도상환 한도(통상 연 최대
        20~30%)를 활용하면 별도 비용 없이 이자를 절약할 수 있습니다.
      </P>
    </GuideLayout>
  )
}
