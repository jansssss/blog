import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: '원리금균등·원금균등·만기일시 상환방식 완전 비교 | ohyess 가이드',
  description:
    '3가지 대출 상환 방식의 월납입액·총이자·현금흐름 차이를 실전 사례와 비교표로 완전히 정리합니다. 내 상황에 맞는 상환 방식 선택 기준을 제시합니다.',
  openGraph: {
    title: '대출 상환방식 완전 비교 — 원리금균등 vs 원금균등 vs 만기일시',
    description: '3가지 상환 방식의 총이자·월납입액·현금흐름 차이를 실전 사례로 완전 정리',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/repayment-types',
  },
}

const tocItems = [
  { id: 'equal-payment', label: '원리금균등상환 — 매달 같은 금액' },
  { id: 'principal-reduction', label: '원금균등상환 — 매달 줄어드는 납입액' },
  { id: 'bullet-repayment', label: '만기일시상환 — 이자만 내다 만기에 정산' },
  { id: 'grace-period', label: '거치기간 — 이자만 납부하는 구간' },
  { id: 'cases', label: '실전 사례 2개' },
  { id: 'selection', label: '내 상황에 맞는 상환 방식 선택' },
]

const ctas = [
  {
    label: '원리금 vs 원금균등 비교 계산기',
    href: '/calculator/repayment-compare',
    description: '내 대출 조건으로 두 방식의 총이자 즉시 비교',
  },
  {
    label: '월 상환 부담 체감 계산기',
    href: '/calculator/repayment-burden',
    description: '소득 대비 월납입 부담 비율 확인',
  },
]

const relatedGuides = [
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '이자 계산 공식과 금리 유형별 차이 정리',
  },
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '소득·자산 기준 실제 대출 한도 계산법',
  },
  {
    title: '중도상환수수료 완전 정리',
    href: '/guide/early-repayment-fee',
    description: '대출 일찍 갚을 때 수수료 계산 및 절약 전략',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인해야 할 항목',
  },
]

const faqs = [
  {
    question: '원리금균등과 원금균등 중 어떤 방식이 총이자가 더 적게 나오나요?',
    answer:
      '원금균등상환이 총이자가 더 적습니다. 원금균등은 매달 동일한 원금을 갚기 때문에 대출 잔액이 더 빨리 줄어들고, 그만큼 이자 계산의 기준이 되는 원금도 빨리 감소합니다. 같은 조건에서 원금균등은 원리금균등보다 총이자가 5~15% 정도 적게 나옵니다.',
  },
  {
    question: '원금균등상환의 초기 납입액이 얼마나 더 많은가요?',
    answer:
      '대출 첫 달 기준으로 원금균등이 원리금균등보다 5~8% 정도 더 많습니다. 예를 들어 원리금균등 월납입이 100만원이라면 원금균등 첫 달은 약 105~108만원 수준입니다. 이 차이는 시간이 지날수록 줄어들어 대출 후반부에는 원금균등 납입액이 더 적어집니다.',
  },
  {
    question: '만기일시상환은 어떤 경우에 선택하는 건가요?',
    answer:
      '주로 단기 브릿지론이나 사업 운전자금 대출에서 활용됩니다. 매달 이자만 내다가 만기에 원금 전체를 한 번에 갚는 구조로, 총이자는 가장 많지만 매달 현금 부담은 가장 적습니다. 개인 주택담보대출에서는 일반적으로 권장되지 않습니다.',
  },
  {
    question: '거치기간을 두면 좋은 점과 나쁜 점은 무엇인가요?',
    answer:
      '장점: 초기 현금 흐름 부담이 줄어들고, 사업 초기처럼 소득이 안정화될 시간이 필요한 상황에서 유용합니다. 단점: 거치기간 동안 원금이 전혀 줄지 않아 이 기간의 이자가 전부 비용으로 나갑니다. 거치기간이 길수록 총이자 부담이 늘어납니다.',
  },
  {
    question: '원리금균등으로 받은 대출을 나중에 원금균등으로 바꿀 수 있나요?',
    answer:
      '일반적으로 대출 실행 후 상환 방식을 변경하는 것은 어렵습니다. 변경하려면 대출을 완전히 상환하고 새로운 조건으로 재약정하거나 대환대출을 진행해야 합니다. 단, 일부 금융사에서는 재약정 절차를 통해 변경을 허용하기도 하므로 담당 지점에 문의해보는 것이 좋습니다.',
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

function Highlight({ children }: { children: ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-5 text-[15px] text-gray-700">
      {children}
    </div>
  )
}

export default function RepaymentTypesGuidePage() {
  return (
    <GuideLayout
      title="원리금균등·원금균등·만기일시 상환방식 완전 비교"
      description="3가지 대출 상환 방식의 월납입액·총이자·현금흐름 차이를 실전 사례와 비교표로 완전히 정리하고, 내 상황에 맞는 선택 기준을 제시합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <P>
        대출 상담을 받다 보면 창구 직원이 으레 묻습니다. &ldquo;원리금균등이요, 원금균등이요?&rdquo;
        이 질문이 단순해 보이지만, 선택에 따라 총 납입 이자가 수백만원씩 달라집니다. 세 가지
        방식의 구조를 정확히 이해하고 나면 답이 명확해집니다.
      </P>

      <H2 id="equal-payment">원리금균등상환 — 매달 같은 금액, 내부는 변한다</H2>
      <P>
        원리금균등상환은 대출 기간 동안 매달 납입 총액이 동일합니다. 편의성이 높아 가계
        예산 관리에 유리하고, 은행도 이 방식을 많이 권유합니다. 그러나 &ldquo;총액이 같다&rdquo;는 것이
        이자와 원금의 비율도 같다는 뜻은 아닙니다.
      </P>
      <P>
        초기에는 대출 잔액이 크므로 이자 비중이 높고 원금 상환 비중이 낮습니다. 시간이
        지날수록 원금이 조금씩 줄면서 이자 비중은 낮아지고 원금 비중이 높아집니다. 이른바
        &ldquo;원금은 나중에 갚는 구조&rdquo;입니다.
      </P>
      <Highlight>
        <strong className="font-semibold">예시:</strong> 1억원, 연 4.5%, 20년 원리금균등상환 시
        — 월납입 632,649원 고정. 첫 달 이자 375,000원(59%), 원금 257,649원(41%). 10년 후 이자
        245,000원(39%), 원금 387,649원(61%)으로 비율 역전.
      </Highlight>

      <H2 id="principal-reduction">원금균등상환 — 납입액은 줄어도 총이자는 적다</H2>
      <P>
        원금균등상환은 매달 동일한 금액의 원금을 상환하고, 여기에 남은 대출 잔액에 대한 이자를
        더해 납부합니다. 초기 납입액이 많지만 시간이 지날수록 납입액이 줄어드는 것이
        특징입니다.
      </P>
      <P>
        총이자가 원리금균등보다 적은 이유는 간단합니다. 매달 일정한 원금을 갚으므로 대출 잔액이
        더 빨리 줄어들고, 이자 계산의 기준이 되는 원금도 그만큼 빨리 감소하기 때문입니다.
      </P>
      <Highlight>
        <strong className="font-semibold">예시:</strong> 같은 조건(1억, 4.5%, 20년) 원금균등상환
        시 — 첫 달 납입 791,667원(원금 416,667 + 이자 375,000). 마지막 달 납입 417,823원. 총이자
        원리금균등 대비 약 580만원 절약.
      </Highlight>

      <H2 id="bullet-repayment">만기일시상환 — 이자만 내다 만기에 원금 한 번에</H2>
      <P>
        만기일시상환은 대출 기간 동안 이자만 납부하고, 만기일에 원금 전액을 일시에 상환하는
        방식입니다. 매달 납입 부담이 가장 적지만, 총이자는 세 방식 중 가장 많습니다.
      </P>
      <P>
        왜냐하면 원금이 전혀 줄지 않으므로 대출 기간 내내 이자 계산의 기준이 처음 원금
        그대로이기 때문입니다. 개인 주택담보대출보다는 기업 단기 자금 조달이나 브릿지론에서
        주로 활용됩니다.
      </P>
      <Highlight>
        <strong className="font-semibold">예시:</strong> 1억, 4.5%, 20년 만기일시상환 시 — 월납입
        375,000원(이자만). 총이자 9,000만원. 같은 기간 원리금균등 총이자 5,180만원보다 3,820만원
        더 많음.
      </Highlight>

      <H2 id="grace-period">거치기간 — 이자만 납부하는 구간의 함정</H2>
      <P>
        거치기간은 원금 상환 없이 이자만 납부하는 기간입니다. 6개월·1년·2년 등 다양하게 설정할
        수 있습니다. 거치기간이 끝나면 남은 기간 동안 원리금을 상환합니다.
      </P>
      <P>
        거치기간의 장점은 초기 현금 흐름 부담 완화입니다. 사업 초기라 매출이 안정화되지 않았거나,
        입주 전 이중 납입 부담을 피하고 싶을 때 활용합니다. 단, 거치기간에 낸 이자는 원금 감소에
        전혀 기여하지 않습니다.
      </P>
      <Ul>
        <li>거치기간 없음: 처음부터 원금 + 이자 납부 → 총이자 최소</li>
        <li>1년 거치: 이자만 12개월 → 총이자 증가 + 거치 후 납입액 상승</li>
        <li>
          3년 거치: 이자만 36개월 → 총이자 더 증가 + 거치 후 납입액 크게 상승
        </li>
      </Ul>
      <P>
        꼭 필요한 경우에만 최소 기간으로 거치를 활용하고, 현금 흐름이 허락하면 즉시 원금 상환에
        들어가는 것이 이자 절약에 유리합니다.
      </P>

      <H2 id="cases">실전 사례 2개</H2>
      <CaseBox title="사례 1 — 직장인 E씨: 주택담보대출 3억 · 연 3.8% · 30년">
        <P>부부 합산 연봉 8천만원의 맞벌이 E씨 부부는 아파트 구입을 위해 주담대 3억을 30년으로 신청했습니다. 원리금균등과 원금균등을 고민 중입니다.</P>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-white">
              <tr>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">구분</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-semibold text-gray-700">원리금균등</th>
                <th className="border border-gray-200 px-3 py-2 text-right font-semibold text-gray-700">원금균등</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2 text-gray-700">첫 달 납입액</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">약 1,400,000원</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">약 1,783,000원</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2 text-gray-700">20년 후 납입액</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">1,400,000원(고정)</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">약 1,182,000원</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2 text-gray-700">총 납입 이자</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-gray-700">약 2억 440만원</td>
                <td className="border border-gray-200 px-3 py-2 text-right font-semibold text-blue-700">약 1억 7,140만원</td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>원금균등 선택 시 총이자 약 3,300만원 절약입니다. 초기 납입액 차이가 월 38만원 정도인데, 이 부담을 감당할 수 있다면 30년 장기로는 원금균등이 훨씬 유리합니다.</P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 F씨: 사업자금 5천만원 · 연 5.5% · 5년 · 1년 거치">
        <P>창업 2년차 자영업자 F씨는 장비 구입을 위해 5천만원을 빌렸습니다. 매출 안정화까지 1년 거치를 요청했습니다.</P>
        <Ul>
          <li>거치기간(12개월): 월이자만 = 5천만원 × 5.5% ÷ 12 = 229,167원</li>
          <li>상환기간(48개월, 원리금균등): 월납입 약 1,159,000원</li>
          <li>총이자: 거치분(2,750,000) + 상환분 이자 ≒ 약 9,332,000원</li>
          <li>거치 없이 60개월 원리금균등 시 총이자: 약 7,540,000원</li>
        </Ul>
        <P>
          1년 거치로 인한 추가 이자는 약 1,790,000원입니다. 사업 초기 현금 흐름이 절박했다면
          감수할 수 있는 비용이지만, 거치기간을 6개월로 줄이는 것만으로도 약 900만원의 추가 이자를
          절반으로 줄일 수 있었습니다.
        </P>
      </CaseBox>

      <H2 id="selection">내 상황에 맞는 상환 방식 선택</H2>
      <H3>원리금균등이 유리한 경우</H3>
      <Ul>
        <li>매달 납입액을 일정하게 유지해 가계 예산 관리를 원하는 경우</li>
        <li>소득이 안정적이지만 초기 여유 자금이 많지 않은 경우</li>
        <li>단기(5년 이하) 대출로 총이자 차이가 크지 않은 경우</li>
      </Ul>
      <H3>원금균등이 유리한 경우</H3>
      <Ul>
        <li>장기 대출(10년 이상)로 총이자 절감 효과가 큰 경우</li>
        <li>초기 납입 부담을 감당할 소득 여유가 있는 경우</li>
        <li>대출 후반부에 납입액이 줄어 노후 대비를 염두에 두는 경우</li>
      </Ul>
      <H3>만기일시상환·거치기간이 불가피한 경우</H3>
      <Ul>
        <li>사업 초기 운전자금으로 현금 보유가 절대적으로 필요한 경우</li>
        <li>단기 자금 조달 후 빠른 상환을 계획하는 경우</li>
        <li>다른 투자 수익률이 대출이자보다 확실히 높은 경우</li>
      </Ul>
    </GuideLayout>
  )
}
