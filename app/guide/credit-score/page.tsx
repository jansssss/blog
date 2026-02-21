import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'

export const metadata: Metadata = {
  title: '신용점수 완전 정리 — 점수 올리는 현실적인 방법과 대출 금리 영향 | ohyess 가이드',
  description:
    '신용점수 체계(KCB·NICE), 점수에 영향을 미치는 요소, 실제로 점수를 올리는 현실적인 방법, 점수별 대출 금리 차이를 직장인·자영업자 사례로 완전히 정리합니다.',
  openGraph: {
    title: '신용점수 완전 정리',
    description: '신용점수 올리는 방법과 대출 금리에 미치는 영향 완전 정리',
    type: 'article',
  },
}

const tocItems = [
  { id: 'system', label: '신용점수 체계 이해 — KCB vs NICE' },
  { id: 'factors', label: '신용점수에 영향을 미치는 요소' },
  { id: 'improve', label: '점수를 실제로 올리는 방법' },
  { id: 'cases', label: '실전 사례 2개' },
  { id: 'rates', label: '신용점수별 대출 금리 차이' },
]

const ctas = [
  {
    label: '대출 한도 시뮬레이터',
    href: '/calculator/loan-limit',
    description: '현재 신용점수·소득 기준 대출 한도 즉시 확인',
  },
  {
    label: '대출 이자 계산기',
    href: '/calculator/loan-interest',
    description: '신용점수 개선 후 금리로 이자 차이 계산',
  },
]

const relatedGuides = [
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '소득·자산 기준 실제 대출 한도 계산법',
  },
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '상환방식·금리 유형별 이자 계산법',
  },
  {
    title: '중도상환수수료 완전 정리',
    href: '/guide/early-repayment-fee',
    description: '대출 조기 상환 시 수수료 계산과 절약 전략',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인해야 할 항목',
  },
]

const faqs = [
  {
    question: 'KCB와 NICE 신용점수가 다른데, 어느 기관 점수를 봐야 하나요?',
    answer:
      '은행마다 활용하는 신용평가사가 다릅니다. KB국민·우리·신한은행은 주로 NICE를, 하나은행은 KCB를 참고합니다. 대출 신청 전 해당 은행이 어떤 기관을 사용하는지 확인하고, 그 기관 점수를 집중 관리하는 것이 효율적입니다.',
  },
  {
    question: '신용점수 조회를 많이 하면 점수가 떨어지나요?',
    answer:
      '아닙니다. 본인이 직접 조회하는 &apos;본인 조회&apos;는 신용점수에 영향을 주지 않습니다. 금융사가 대출 심사를 위해 조회하는 &apos;금융기관 조회&apos;는 단기간에 많이 조회되면 영향을 줄 수 있습니다. 카카오뱅크·뱅크샐러드 등 앱에서의 본인 조회는 자유롭게 해도 됩니다.',
  },
  {
    question: '신용카드를 해지하면 점수가 오를까요, 내릴까요?',
    answer:
      '일반적으로 내릴 수 있습니다. 오랫동안 사용한 카드를 해지하면 신용 이력이 짧아지고, 신용 한도 활용률이 높아져 점수에 부정적 영향을 줄 수 있습니다. 사용하지 않는 카드라도 해지보다는 휴면 상태로 두는 것이 점수 관리에 유리합니다.',
  },
  {
    question: '연체 기록은 얼마나 오래 남나요?',
    answer:
      '단기 연체(10만원 미만, 5영업일 미만)는 신용점수에 영향이 없습니다. 장기 연체(3개월 이상)는 연체 해소 후에도 최대 5년간 신용정보에 기록이 남습니다. 연체 기록이 있더라도 성실 상환 이력을 꾸준히 쌓으면 점수는 서서히 회복됩니다.',
  },
  {
    question: '신용점수 700점과 850점의 대출 금리 차이는 얼마나 나나요?',
    answer:
      '금융사마다 다르지만, 통상 신용점수 1등급 차이가 금리 0.2~0.5%p 차이를 만듭니다. 700점대(4~5등급)와 850점대(1~2등급)는 대략 1.5~2.5%p 금리 차이가 발생할 수 있습니다. 1억 대출 기준 연 1.5%p 차이는 연간 150만원, 10년이면 1,500만원 이상의 이자 차이가 됩니다.',
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

export default function CreditScoreGuidePage() {
  return (
    <GuideLayout
      title="신용점수 완전 정리 — 점수 올리는 현실적인 방법과 대출 금리 영향"
      description="신용점수 체계(KCB·NICE), 점수에 영향을 미치는 요소, 실제로 점수를 올리는 현실적인 방법, 신용점수별 대출 금리 차이를 직장인·자영업자 사례로 완전히 정리합니다."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
    >
      <P>
        신용점수는 단순한 숫자가 아닙니다. 10년간 대출 이자를 수천만원씩 줄여주는 핵심
        변수입니다. 신용점수 한 등급 차이가 금리 0.2~0.5%p 차이를 만들고, 이것이 장기 대출에서
        수백~수천만원의 이자 차이로 누적됩니다. 알아야 관리할 수 있습니다.
      </P>

      <H2 id="system">신용점수 체계 이해 — KCB vs NICE</H2>
      <P>
        국내에는 두 개의 주요 개인신용평가사가 있습니다. KCB(코리아크레딧뷰로)와
        NICE평가정보입니다. 둘 다 1~1000점 만점 체계를 사용하며, 점수가 높을수록
        신용도가 좋습니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">점수 구간</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">KCB 등급</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">신용 수준</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">대출 접근성</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50">
              <td className="border border-gray-200 px-4 py-3 font-semibold text-blue-700">900~1000점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">1등급</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">매우 우량</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">최저 금리 적용</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">800~899점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">2등급</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">우량</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">우대 금리 적용</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">700~799점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">3~4등급</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">일반</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">1금융 가능</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">600~699점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">5~6등급</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">주의</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">제한적 승인</td>
            </tr>
            <tr className="bg-red-50">
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">600점 미만</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">7등급 이하</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">위험</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-red-600">은행 대출 어려움</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        카카오뱅크·토스·뱅크샐러드 같은 핀테크 앱에서 무료로 본인 신용점수를 확인할 수
        있습니다. 본인 조회는 점수에 영향을 주지 않으므로 월 1회 정도 정기적으로 모니터링하는
        습관이 중요합니다.
      </P>

      <H2 id="factors">신용점수에 영향을 미치는 요소</H2>
      <P>
        신용점수는 복수의 요소를 가중치로 합산해 산출합니다. 정확한 알고리즘은 공개되지
        않지만, 주요 영향 요소는 알려져 있습니다.
      </P>
      <H3>점수를 높이는 요소 (긍정 요인)</H3>
      <Ul>
        <li>
          <strong className="font-semibold">신용 이력 길이</strong>: 오래된 신용 계좌 보유
          (오래된 카드 해지 금물)
        </li>
        <li>
          <strong className="font-semibold">성실한 납부 이력</strong>: 카드·대출 연체 없이
          꾸준히 납부
        </li>
        <li>
          <strong className="font-semibold">적정 신용 이용률</strong>: 카드 한도 대비 실제
          사용액 30% 이내 유지
        </li>
        <li>
          <strong className="font-semibold">다양한 신용 유형</strong>: 카드 + 대출 + 할부
          등 다양한 이력 보유
        </li>
      </Ul>
      <H3>점수를 낮추는 요소 (부정 요인)</H3>
      <Ul>
        <li>
          <strong className="font-semibold">연체 이력</strong>: 단 하루라도 연체되면
          영향 (특히 3개월 이상 장기 연체는 치명적)
        </li>
        <li>
          <strong className="font-semibold">단기간 다수 대출 신청</strong>: 3~6개월 내
          여러 금융사에 대출 신청
        </li>
        <li>
          <strong className="font-semibold">카드 현금서비스·카드론</strong>: 고금리 단기
          자금 이용 이력
        </li>
        <li>
          <strong className="font-semibold">높은 신용 이용률</strong>: 카드 한도의 70%
          이상 지속 사용
        </li>
      </Ul>

      <H2 id="improve">점수를 실제로 올리는 현실적인 방법</H2>
      <H3>1. 공과금·통신비 납부 이력 등록</H3>
      <P>
        전기·수도·가스요금과 통신비 납부 이력을 신용평가사에 등록하면 점수 상승에 도움이
        됩니다. KCB의 &apos;올크레딧&apos;과 NICE의 &apos;나이스지키미&apos; 앱에서 직접 등록할 수 있습니다.
        일반적으로 10~30점 상승 효과를 기대할 수 있습니다.
      </P>
      <H3>2. 카드 이용률 30% 이하로 관리</H3>
      <P>
        신용카드 한도의 30% 이하를 사용하는 것이 점수에 유리합니다. 한도 1백만원짜리
        카드를 매달 80만원씩 쓰는 것보다, 한도를 높여 이용률을 낮추는 것이 점수 관리에 효과적입니다.
        카드 실적을 채우면서도 이용률을 낮추려면 카드 한도 상향을 신청하세요.
      </P>
      <H3>3. 오래된 카드는 유지, 불필요한 대출은 정리</H3>
      <P>
        신용 이력이 오래될수록 점수에 유리합니다. 사용하지 않는 오래된 카드를 해지하면
        신용 이력이 짧아져 점수가 떨어질 수 있습니다. 반면 불필요한 소액 대출이나 카드론은
        정리해 부채 비율을 낮추는 것이 좋습니다.
      </P>
      <H3>4. 대출 신청 전 3개월 간 신규 대출 자제</H3>
      <P>
        단기간에 여러 금융사에 대출을 신청하면 &apos;긴급 자금이 필요한 상태&apos;로 평가되어 점수가
        하락할 수 있습니다. 큰 대출(주담대 등) 신청 계획이 있다면 최소 3~6개월 전부터 신규
        대출 신청을 자제하세요.
      </P>

      <H2 id="cases">실전 사례: 신용점수가 대출에 미치는 영향</H2>
      <CaseBox title="사례 1 — 직장인 I씨: 신용점수 720점 → 820점, 금리 차이 얼마?">
        <P>
          I씨는 연봉 5천만원의 직장인으로 신용점수가 720점이었습니다. 공과금 납부 이력 등록,
          카드 이용률 개선, 소액 대출 정리를 통해 12개월 만에 820점으로 올렸습니다.
        </P>
        <Ul>
          <li>720점 시 신용대출 3천만원 금리: 연 7.2%</li>
          <li>820점 달성 후 동일 금액 금리: 연 5.4%</li>
          <li>금리 차이: 1.8%p</li>
          <li>36개월 원리금균등 기준 총이자 절감: 약 980,000원</li>
        </Ul>
        <P>
          12개월의 관리로 약 100만원 절약 효과를 거뒀습니다. 만약 주택담보대출 3억이라면 같은
          1.8%p 금리 차이가 30년간 약 6,000만원 이상의 총이자 차이를 만듭니다.
        </P>
      </CaseBox>
      <CaseBox title="사례 2 — 자영업자 J씨: 연체 이력 정리 후 신용점수 회복">
        <P>
          자영업자 J씨는 코로나 시기 매출 급감으로 카드 결제를 2개월 연체한 이력이 있습니다.
          연체 해소 후 점수가 650점으로 떨어져 은행 대출이 어려운 상황이었습니다.
        </P>
        <Ul>
          <li>연체 해소 직후: 650점 → 1금융 대출 거절, 2금융만 가능</li>
          <li>6개월 성실 납부 후: 680점 → 일부 은행 소액 가능</li>
          <li>18개월 성실 납부 후: 730점 → 1금융 정상 심사 가능</li>
          <li>36개월 후: 780점 → 우대 금리 접근 시작</li>
        </Ul>
        <P>
          연체 이력은 즉시 해소할수록 회복이 빠릅니다. 연체 중 이자가 복리로 쌓이는 것도
          문제지만, 점수 하락으로 인한 고금리 대출 강제는 더 큰 장기 손실을 만듭니다.
          연체가 생기면 일부라도 즉시 납부해 연체 기간을 최소화하는 것이 핵심입니다.
        </P>
      </CaseBox>

      <H2 id="rates">신용점수별 대출 금리 차이 — 숫자로 확인</H2>
      <P>
        신용점수가 대출 금리에 미치는 영향을 구체적으로 살펴보겠습니다. 아래는 동일 조건(1억,
        10년, 신용대출)에서의 금리 비교 예시입니다.
      </P>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">신용점수</th>
              <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">대략 금리</th>
              <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">10년 총이자</th>
              <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">900점대 대비 추가 이자</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50">
              <td className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-700">900~1000점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">연 4.5%</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">약 2,520만원</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-blue-700">기준</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-900">800~899점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">연 5.2%</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">약 2,940만원</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">+420만원</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-900">700~799점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">연 6.5%</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">약 3,720만원</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">+1,200만원</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-900">600~699점</td>
              <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">연 8.5%</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-700">약 4,920만원</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-red-600">+2,400만원</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        신용점수 900점대와 600점대의 10년 총이자 차이가 2,400만원입니다. 신용점수 관리가
        단순한 습관이 아니라 수천만원의 재산을 지키는 전략임을 이 숫자가 증명합니다.
      </P>
    </GuideLayout>
  )
}
