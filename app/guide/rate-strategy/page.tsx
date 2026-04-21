import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '금리 인상기 대출 전략 완전 정리 | ohyess 가이드',
  description:
    '금리 상승기에 변동·고정금리를 선택하는 기준, 대출 갈아타기 타이밍, 금리 인하 요구권 활용법까지 실전 전략을 완전 정리합니다.',
  openGraph: {
    title: '금리 인상기 대출 전략',
    description: '금리 변동에 따른 최적 대출 전략 완전 가이드',
    type: 'article',
  },
  alternates: {
    canonical: '/guide/rate-strategy',
  },
}

const tocItems = [
  { id: 'understanding', label: '금리 인상이 내 대출에 미치는 영향' },
  { id: 'fixed-vs-variable', label: '고정 vs 변동: 지금 선택 기준' },
  { id: 'refinancing', label: '대환대출 타이밍과 손익 계산' },
  { id: 'rate-reduction', label: '금리 인하 요구권 완전 활용법' },
  { id: 'prepayment', label: '중도상환으로 이자 부담 줄이기' },
  { id: 'cases', label: '실전 사례 2개' },
]

const ctas = [
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '금리 변동 시 이자 부담 변화 계산',
  },
  {
    label: '중도상환수수료 계산기',
    href: '/calculator/prepayment-fee',
    description: '갈아타기 전 수수료 먼저 계산하기',
  },
]

const relatedGuides = [
  { title: '대출이자 계산법 완전 정리', href: '/guide/loan-interest', description: '금리와 이자의 기본 계산 구조 이해' },
  { title: '상환방식 완전 비교', href: '/guide/repayment-types', description: '원리금균등·원금균등·만기일시 비교' },
  { title: '중도상환수수료 완전 정리', href: '/guide/early-repayment-fee', description: '중도상환 비용 계산과 면제 조건' },
  { title: '신용점수 완전 정리', href: '/guide/credit-score', description: '금리 인하 요구권 행사를 위한 신용 관리' },
]

const faqs = [
  {
    question: '변동금리 대출인데 금리가 갑자기 많이 올랐습니다. 지금 고정으로 바꿀 수 있나요?',
    answer:
      '대출 약관에 따라 다릅니다. 일부 상품은 중도 금리 유형 변경이 가능하지만, 대부분은 중도상환 후 재대출(대환) 형태로 변경합니다. 고정금리 전환 시 현재 고정금리가 기존 변동금리보다 높지 않다면 전환을 검토할 수 있습니다. 단, 중도상환수수료와 새 대출 부대비용을 포함한 총비용을 반드시 계산해야 합니다.',
  },
  {
    question: '금리 인하 요구권은 언제, 얼마나 자주 신청할 수 있나요?',
    answer:
      '법적으로 연 2회(6개월 간격) 신청할 수 있습니다. 신용점수 상승, 승진·소득 증가, 부채 감소, 우량 거래 실적 축적 등 신용도 개선 사유가 있어야 합니다. 성공 시 보통 0.1~0.5%p 인하 효과를 기대할 수 있습니다.',
  },
  {
    question: '금리 인하 사이클이 오면 변동금리가 유리한가요?',
    answer:
      '이론적으로는 그렇습니다. 기준금리 인하가 예상되는 시기에는 변동금리를 선택하면 자연히 이자가 줄어듭니다. 다만 금리 인하 시점과 폭은 예측이 어렵습니다. 가계 재정이 안정적이고 위험 감수 능력이 있다면 변동금리가 유리할 수 있지만, 현금 흐름이 빠듯하다면 안전한 고정금리를 선택하는 것이 바람직합니다.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-20">{children}</h2>
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>
}
function P({ children }: { children: ReactNode }) {
  return <p className="text-gray-700 leading-relaxed mb-4 text-[15px]">{children}</p>
}
function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 text-[15px]">{children}</ul>
}
function CaseBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 border-l-4 border-blue-400 rounded-r-lg p-5 mb-6">
      <p className="font-semibold text-gray-900 mb-3 text-[15px]">{title}</p>
      {children}
    </div>
  )
}

export default function RateStrategyGuidePage() {
  return (
    <GuideLayout
      title="금리 인상기 대출 전략 — 고정·변동 선택부터 갈아타기까지"
      description="금리가 오를 때 내 대출에 미치는 영향, 고정·변동금리 선택 기준, 대환대출 타이밍과 손익 계산, 금리 인하 요구권 활용법을 실전 사례로 완전 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <GeminiImage
        src="/images/guide/rate-strategy.png"
        placeholderColor="orange"
        alt="금리 인상 영향 일러스트"
        className="mb-8"
        height={280}
      />

      <H2 id="understanding">금리 인상이 내 대출에 미치는 영향</H2>
      <P>
        한국은행이 기준금리를 0.25%p 올릴 때마다 변동금리 대출자는 실질적인 이자 부담이 늘어납니다. 1억원 대출 기준으로 계산하면 이 영향이 명확해집니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-3 py-3 text-left font-semibold">대출금액</th>
              <th className="border border-gray-200 px-3 py-3 text-right font-semibold">+0.25%p 시 월추가 이자</th>
              <th className="border border-gray-200 px-3 py-3 text-right font-semibold">+1.0%p 시 월추가 이자</th>
              <th className="border border-gray-200 px-3 py-3 text-right font-semibold">+1.0%p 시 연추가 이자</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-3">1억원</td>
              <td className="border border-gray-200 px-3 py-3 text-right">+2,083원</td>
              <td className="border border-gray-200 px-3 py-3 text-right">+8,333원</td>
              <td className="border border-gray-200 px-3 py-3 text-right">+100,000원</td>
            </tr>
            <tr className="bg-orange-50">
              <td className="border border-gray-200 px-3 py-3 font-medium">3억원</td>
              <td className="border border-gray-200 px-3 py-3 text-right">+6,250원</td>
              <td className="border border-gray-200 px-3 py-3 text-right font-semibold text-orange-700">+25,000원</td>
              <td className="border border-gray-200 px-3 py-3 text-right font-semibold text-orange-700">+300,000원</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-3 py-3 font-medium">5억원</td>
              <td className="border border-gray-200 px-3 py-3 text-right">+10,417원</td>
              <td className="border border-gray-200 px-3 py-3 text-right font-semibold text-red-700">+41,667원</td>
              <td className="border border-gray-200 px-3 py-3 text-right font-semibold text-red-700">+500,000원</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        3억원 변동금리 대출자가 금리 1%p 인상을 경험하면 월 2.5만원, 연간 30만원의 추가 부담이 발생합니다. 금리가 2%p 오르면 연간 60만원 추가로 납부해야 합니다.
      </P>

      <H2 id="fixed-vs-variable">고정 vs 변동: 지금 선택 기준</H2>
      <P>
        "어떤 금리가 유리한가"는 미래 금리 방향에 달려 있습니다. 하지만 전문가도 금리 방향을 정확히 예측하기 어렵습니다. 대신 자신의 상황에 맞는 선택 기준을 갖추는 것이 더 현실적입니다.
      </P>
      <H3>고정금리가 유리한 조건</H3>
      <Ul>
        <li>현재 변동금리보다 고정금리가 0.3%p 이하의 차이일 때</li>
        <li>대출 기간 10년 이상 장기 대출</li>
        <li>소득 변동이 크거나 현금 흐름이 빠듯한 경우</li>
        <li>금리 상승 사이클 초입(기준금리 인상이 막 시작된 시점)</li>
      </Ul>
      <H3>변동금리가 유리한 조건</H3>
      <Ul>
        <li>고정금리와 변동금리 차이가 1%p 이상 날 때</li>
        <li>단기(3~5년 이하) 대출이거나 조기 상환 계획이 있는 경우</li>
        <li>금리 인하 사이클 진입이 명확히 예상되는 시점</li>
        <li>금리 변동 리스크를 수용할 수 있는 여유 자금 보유자</li>
      </Ul>
      <P>
        <strong className="font-semibold text-gray-900">실용적 조언:</strong> 장기 주담대라면 고정금리 안정성을 선택하고, 단기 신용대출이나 전세대출은 변동이 더 유연합니다. 금리 유형보다 중요한 것은 상환 가능한 범위 내에서 대출을 받는 것입니다.
      </P>

      <H2 id="refinancing">대환대출 타이밍과 손익 계산</H2>
      <P>
        금리 차이가 생겼다고 무조건 갈아타는 것은 현명하지 않습니다. 대환 시 발생하는 비용을 꼼꼼히 계산해야 합니다.
      </P>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 text-sm text-blue-900">
        <strong>대환 손익분기점 공식:</strong><br />
        중도상환수수료 + 새 대출 부대비용 ÷ (월 절감 이자) = 손익분기 개월 수<br />
        <span className="text-blue-600 text-xs mt-1 block">결과가 대출 잔여 기간보다 짧아야 대환이 유리</span>
      </div>
      <H3>대환 시 발생하는 비용 항목</H3>
      <Ul>
        <li><strong className="font-semibold">중도상환수수료:</strong> 잔여 대출금의 0.5~1.4% (은행권 기준, 3년 이내 상환 시)</li>
        <li><strong className="font-semibold">근저당 말소·설정 비용:</strong> 주담대 대환 시 약 30~80만원 (법무사 비용 포함)</li>
        <li><strong className="font-semibold">취급 수수료:</strong> 새 금융사에 따라 0~20만원</li>
        <li><strong className="font-semibold">인지세:</strong> 대출금액에 따라 15만~35만원</li>
      </Ul>
      <P>
        예시: 3억 대출, 중도상환수수료 1.0%, 주담대 → 총비용 약 400만원. 월 이자 절감액이 20만원이라면 20개월(약 1.7년) 후 손익분기. 잔여 기간이 10년 이상이라면 충분히 유리합니다.
      </P>

      <H2 id="rate-reduction">금리 인하 요구권 완전 활용법</H2>
      <P>
        금리 인하 요구권은 금융소비자보호법에 명시된 법적 권리입니다. 신용 상태가 개선되면 은행에 금리 인하를 요구할 수 있고, 은행은 10영업일 이내 심사 결과를 통보해야 합니다.
      </P>
      <H3>금리 인하 요구 가능 사유</H3>
      <Ul>
        <li>신용점수 상승 (보통 50점 이상 상승 시 효과적)</li>
        <li>소득 증가 (근로소득·사업소득 증가 확인서 제출)</li>
        <li>부채 감소 (기존 대출 상환으로 DSR 개선)</li>
        <li>취업·승진·정규직 전환 (직업 안정성 향상)</li>
        <li>담보 가치 상승 (주택 가격 상승 감정서 제출)</li>
      </Ul>
      <H3>신청 방법 (3단계)</H3>
      <div className="space-y-2 mb-4">
        {['은행 앱 또는 영업점 방문 → "금리 인하 요구권 신청" 메뉴 선택', '소득 증가 증빙 서류 또는 신용점수 확인서 첨부', '10영업일 이내 결과 수령. 인하 거절 시 사유 서면 통보 의무'].map((text, i) => (
          <div key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <H2 id="prepayment">중도상환으로 이자 부담 줄이기</H2>
      <P>
        금리가 높은 시기일수록 원금을 빠르게 줄이는 것이 이자를 낮추는 가장 확실한 방법입니다. 연말 성과급, 인센티브, 세금 환급금이 생기면 중도상환을 적극 활용하세요.
      </P>
      <Ul>
        <li><strong className="font-semibold">연 10~20% 중도상환 면제:</strong> 대부분의 주담대는 연간 대출 잔액의 10~20% 한도 내 무수수료 중도상환 허용</li>
        <li><strong className="font-semibold">3년 후 전액 상환:</strong> 중도상환수수료 면제 기간(보통 3년) 이후에는 수수료 없이 전액 상환 가능</li>
        <li><strong className="font-semibold">이자 절감 효과:</strong> 5억 대출, 연 4.5%, 잔여 20년 기준 — 1억 중도상환 시 총이자 약 9,000만원 절감</li>
      </Ul>

      <H2 id="cases">실전 사례 2개</H2>
      <CaseBox title="사례 1 — 변동금리 대출자, 금리 1.5%p 인상 후 대응 전략">
        <P>주담대 3억, 변동금리 연 3.2% → 4.7%로 인상. 잔여 기간 18년.</P>
        <Ul>
          <li>월납입 증가분: 3억 × 1.5% ÷ 12 = 월 37,500원 추가</li>
          <li>고정금리 대환 검토: 현재 고정금리 4.3% 제안 → 변동(4.7%) 대비 0.4%p 낮음</li>
          <li>대환 비용 계산: 중도상환수수료(1%) 300만 + 부대비용 50만 = 350만원</li>
          <li>월 절감액: 3억 × 0.4% ÷ 12 = 1만원 → 손익분기 350개월(29년) → 대환 비효율</li>
          <li><strong>결론: 금리 인하 요구권 신청 후 소득 증빙으로 0.2%p 인하 달성이 더 효과적</strong></li>
        </Ul>
      </CaseBox>
      <CaseBox title="사례 2 — 연말 성과급 5천만원, 중도상환 활용 전략">
        <P>신용대출 7,000만원(연 6.5%) + 주담대 2억(연 4.2%) 보유. 성과급 5천만원 수령.</P>
        <Ul>
          <li>신용대출 7천만원 먼저 상환: 연이자 455만원 → 전액 소멸</li>
          <li>잔여 성과급 없음 → 주담대는 유지</li>
          <li>DSR 개선 효과: 신용대출 상환으로 DSR 15%p 감소</li>
          <li>이후 금리 인하 요구권 신청: 부채 감소 사유로 0.3%p 인하 요청</li>
          <li><strong>결론: 고금리 부채 우선 상환이 항상 최우선 전략</strong></li>
        </Ul>
      </CaseBox>
    </GuideLayout>
  )
}
