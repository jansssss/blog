import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import GuideLayout from '@/components/guide/GuideLayout'
import HubBacklink from '@/components/HubBacklink'

export const metadata: Metadata = {
  title: '주담대 방공제 계산 — MCI·MCG로 한도 보완하는 법 | ohyess',
  description:
    'LTV 계산보다 주택담보대출 한도가 적게 나오는 방공제의 뜻과 지역별 최우선변제금, MCI·MCG 차이, 보증료와 실제 한도 확인 순서를 정리합니다.',
  alternates: { canonical: '/guide/mortgage-mci-mcg' },
  openGraph: {
    title: '주담대 방공제 계산 — MCI·MCG 한도 보완',
    description: '서울 5,500만원 등 지역별 공제액과 MCI·MCG 선택 기준을 실제 숫자로 확인하세요.',
    type: 'article',
  },
}

const tocItems = [
  { id: 'answer', label: '즉답: LTV 한도에서 소액임차보증금을 빼는 이유' },
  { id: 'amounts', label: '2026 지역별 방공제 기준 금액' },
  { id: 'calculation', label: '방공제 전후 실제 한도 계산' },
  { id: 'mci-mcg', label: 'MCI와 MCG 차이·비용·한도' },
  { id: 'decision', label: '신청해도 유리하지 않은 경우' },
  { id: 'checklist', label: '잔금일 전 은행 확인 체크리스트' },
]

const ctas = [
  {
    label: '대출 한도 시뮬레이터',
    href: '/calculator/loan-limit',
    description: 'LTV·DSR 중 먼저 막히는 기본 한도 확인',
  },
  {
    label: 'DSR·DTI·LTV 계산기',
    href: '/calculator/dsr-dti-ltv',
    description: '방공제 전에 소득 기준 한도가 충분한지 확인',
  },
]

const relatedGuides = [
  {
    title: '주택담보대출 완전 정리',
    href: '/guide/mortgage-loan',
    description: '주담대 한도·금리·실행 절차 전체 흐름',
  },
  {
    title: 'LTV는 되는데 DSR에서 막히는 이유',
    href: '/guide/ltv-ok-dsr-blocked',
    description: '담보 한도와 소득 한도 중 실제 제한 요인 진단',
  },
  {
    title: '연봉 5천 주택담보대출 한도 계산',
    href: '/guide/mortgage-salary-5000',
    description: '기존 부채까지 넣어 DSR 한도 계산',
  },
  {
    title: '대출 전 필수 체크리스트',
    href: '/guide/loan-checklist',
    description: '잔금일 전 금리·비용·약정 조건 최종 확인',
  },
]

const faqs = [
  {
    question: '집에 세입자가 없어도 방공제를 하나요?',
    answer:
      '할 수 있습니다. 금융회사는 담보 처분 때 선순위로 보호될 수 있는 소액임차인이 생길 위험을 반영해 유효담보가액을 계산합니다. 다만 공제 여부와 적용 방 수는 주택 유형, 실제 임대차, 상품 규정에 따라 달라지므로 은행의 담보평가표를 확인해야 합니다.',
  },
  {
    question: '서울 아파트면 무조건 5,500만원이 줄어드나요?',
    answer:
      '무조건은 아닙니다. 5,500만원은 2026년 9월 기준 법령상 서울의 최우선변제액입니다. 실제 대출에서는 상품별 공제 대상 주택, 적용 방 수, 선순위 임대차, MCI·MCG 이용 여부, DSR과 상품 한도를 함께 적용하므로 결과가 달라질 수 있습니다.',
  },
  {
    question: 'MCI나 MCG를 쓰면 LTV보다 더 받을 수 있나요?',
    answer:
      '아닙니다. 두 제도는 소액임차보증금 공제로 줄어든 부분을 보완할 뿐 LTV 비율, DSR, 상품별 최대한도, 금융회사 심사를 완화하지 않습니다. 방공제를 없앤 뒤의 LTV 한도보다 더 빌리는 수단은 아닙니다.',
  },
  {
    question: 'MCI와 MCG 중 무엇을 선택해야 하나요?',
    answer:
      '먼저 이용 은행과 상품이 어느 제도를 취급하는지 확인해야 합니다. MCI는 은행이 보험을 붙이는 구조로 비용 부담과 대상 요건이 은행별로 다르고, MCG는 HF 보증으로 고객이 보증료를 부담합니다. 추가 확보액, 총 보증료, 금리, 중도상환 계획을 한 표로 받아 비교하세요.',
  },
  {
    question: 'MCG 보증료는 얼마인가요?',
    answer:
      'HF의 현행 안내는 우대가구 여부 등에 따라 연 0.05%~0.35%를 제시합니다. 실제 보증금액과 기간, 우대 여부에 따라 총액이 달라지므로 대출 실행 전 취급은행에 총 보증료와 중도상환 때 환급 기준을 확인하세요.',
  },
]

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-20 border-b border-gray-100 pb-2 text-xl font-bold text-gray-900">
      {children}
    </h2>
  )
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-6 text-base font-semibold text-gray-800">{children}</h3>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[15px] leading-relaxed text-gray-700">{children}</p>
}

function Callout({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'amber' | 'emerald' }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50 text-blue-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  }

  return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[tone]}`}>{children}</div>
}

export default function MortgageMciMcgPage() {
  return (
    <GuideLayout
      pageUrl="/guide/mortgage-mci-mcg"
      title="주담대 방공제 계산 — MCI·MCG로 한도를 보완하는 법"
      description="집값에 LTV를 곱한 금액보다 은행의 주담대 한도가 수천만원 적다면 방공제가 반영됐을 수 있습니다. 지역별 기준액, 실제 계산 순서, MCI·MCG의 비용과 한계를 확인하세요."
      tocItems={tocItems}
      ctas={ctas}
      relatedGuides={relatedGuides}
      faqs={faqs}
      lastUpdated="2026년 9월 7일"
      publishedAt="2026-09-07"
      reviewedAt="2026-09-07"
      referenceDate="2026년 9월 7일 기준"
      appliesTo="주택 구입·보전용 주택담보대출의 소액임차보증금 공제와 MCI·MCG"
      sources={[
        {
          label: '국가법령정보센터 — 주택임대차보호법 시행령 제10·11조',
          href: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=130113',
        },
        {
          label: '한국주택금융공사 — 지역별 소액임차보증금',
          href: 'https://www.hf.go.kr/ko/small-lease-deposit.do',
        },
        {
          label: '한국주택금융공사 — 모기지신용보증(MCG)',
          href: 'https://www.hf.go.kr/ko/sub02/sub02_02_02.do',
        },
        {
          label: 'KB국민은행 — 주택담보대출 MCI 안내',
          href: 'https://obank.kbstar.com/quics?QSL=F&cc=b104363:b104516&isNew=Y&page=C103557&prcode=LN20001353',
        },
      ]}
    >
      <H2 id="answer">즉답: LTV 한도에서 소액임차보증금을 미리 빼는 절차다</H2>
      <P>
        방공제는 은행이 주택담보대출의 유효담보가액을 계산할 때, 경매 등 담보 처분 상황에서 은행보다 먼저 보호될 수 있는
        소액임차인의 최우선변제액을 반영해 한도를 줄이는 것을 뜻합니다. 현장에서 &ldquo;방 수만큼 공제한다&rdquo;고 설명하면서
        방공제라는 이름이 널리 쓰입니다.
      </P>
      <Callout tone="emerald">
        <strong>먼저 물어볼 한 문장:</strong> &ldquo;이 한도는 방공제 전인가요, 후인가요? 적용 방 수와 지역별 공제액,
        MCI·MCG 적용 가능 여부를 각각 적어 주세요.&rdquo; 같은 집과 소득이어도 이 네 가지가 빠지면 은행 제시액을 비교하기
        어렵습니다.
      </Callout>
      <P>
        방공제는 DSR과 다른 제한입니다. DSR은 소득으로 갚을 수 있는 금액을 보고, 방공제는 담보를 처분할 때 금융회사가
        회수할 수 있는 금액을 봅니다. 따라서 MCI나 MCG로 방공제를 보완해도 DSR 한도가 더 낮으면 실제 대출금은 늘지 않습니다.
      </P>

      <H2 id="amounts">2026 지역별 방공제 기준 금액</H2>
      <P>
        2026년 9월 현재 시행 중인 주택임대차보호법 시행령 제10조의 지역별 최우선변제액은 아래와 같습니다. 시행령은
        2026년 7월 1일부터 시행 중이지만, 이 금액 조항의 마지막 실질 개정은 2023년 2월 21일입니다.
      </P>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">지역</th>
              <th className="border-b border-gray-200 px-4 py-3">최우선변제액</th>
              <th className="border-b border-gray-200 px-4 py-3">소액임차인 보증금 상한</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3">서울특별시</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">5,500만원</td>
              <td className="border-b border-gray-100 px-4 py-3">1억 6,500만원 이하</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3">과밀억제권역(서울 제외), 세종·용인·화성·김포</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">4,800만원</td>
              <td className="border-b border-gray-100 px-4 py-3">1억 4,500만원 이하</td>
            </tr>
            <tr>
              <td className="border-b border-gray-100 px-4 py-3">일부 광역시, 안산·광주·파주·이천·평택</td>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">2,800만원</td>
              <td className="border-b border-gray-100 px-4 py-3">8,500만원 이하</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="px-4 py-3">그 밖의 지역</td>
              <td className="px-4 py-3 font-semibold">2,500만원</td>
              <td className="px-4 py-3">7,500만원 이하</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout tone="amber">
        <strong>두 금액을 혼동하지 마세요.</strong> 서울의 1억 6,500만원은 보호 대상이 되는 소액임차인의 보증금 상한이고,
        5,500만원은 그 임차인이 다른 담보권자보다 먼저 변제받을 수 있는 금액의 상한입니다. 방공제 계산에서 확인할 핵심은
        두 번째 금액입니다. 같은 시 안에서도 과밀억제권역 여부가 다를 수 있어 HF는 토지이음 확인을 권고합니다.
      </Callout>

      <H2 id="calculation">방공제 전후 실제 한도 계산</H2>
      <P>은행별 세부 산식은 다를 수 있지만, 상담 결과를 검산할 때는 다음 순서로 보면 이해하기 쉽습니다.</P>
      <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-950">
        <p className="mb-2 text-xs font-semibold text-indigo-700">단순 진단식</p>
        <p className="font-extrabold">방공제 후 담보 한도 ≈ 주택 담보평가액 × 적용 LTV − 선순위채권 − 지역별 공제액 × 적용 방 수</p>
        <p className="mt-2 text-xs leading-relaxed text-indigo-700">
          최종 대출액은 이 담보 한도와 DSR 한도, 상품별 최대한도, 실제 소요자금 중 가장 작은 금액 안에서 정해집니다.
        </p>
      </div>
      <H3>예시 1: 서울 아파트, DSR 여유가 충분한 경우</H3>
      <P>
        담보평가액 6억원, 적용 LTV 70%, 선순위채권 없음, 공제 방 수 1개라고 가정합니다. 방공제 전 LTV 한도는 4억
        2,000만원이고, 서울 최우선변제액 5,500만원을 빼면 단순 담보 한도는 3억 6,500만원입니다. 해당 상품에서 MCI나
        MCG 승인을 받아 공제를 보완한다면 최대 5,500만원의 차이가 생길 수 있지만, 실제 추가액은 다른 한도와 심사를 넘을 수
        없습니다.
      </P>
      <H3>예시 2: MCG를 써도 DSR이 먼저 막히는 경우</H3>
      <P>
        같은 집에서 신청자의 DSR 한도가 3억 5,000만원이라면 방공제 후 담보 한도 3억 6,500만원보다 DSR이 낮습니다.
        이 경우 방공제를 보완해 LTV 한도가 4억 2,000만원으로 회복돼도 최종 한도는 여전히 3억 5,000만원 수준입니다.
        보증료를 내기 전에 어느 규제가 최종 한도를 막는지 먼저 확인해야 하는 이유입니다.
      </P>
      <Callout>
        아파트·연립·다세대·단독주택의 적용 방 수와 실제 임대차 반영 방식은 같지 않습니다. HF의 정책모기지 예상조회도
        단독·연립·다세대는 소액임차보증금 차감을 별도로 안내합니다. 온라인 계산 결과에 지역 금액을 임의로 한 번 빼는 것만으로
        잔금 계획을 확정하지 마세요.
      </Callout>

      <H2 id="mci-mcg">MCI와 MCG 차이·비용·한도</H2>
      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[780px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">구분</th>
              <th className="border-b border-gray-200 px-4 py-3">MCI</th>
              <th className="border-b border-gray-200 px-4 py-3">MCG</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">성격</td>
              <td className="border-b border-gray-100 px-4 py-3">은행이 연계하는 모기지신용보험</td>
              <td className="border-b border-gray-100 px-4 py-3">한국주택금융공사의 모기지신용보증</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">신청</td>
              <td className="border-b border-gray-100 px-4 py-3">취급 은행의 대상 상품·담보 심사 때 확인</td>
              <td className="border-b border-gray-100 px-4 py-3">공사 방문 없이 취급은행에서 신청·심사·발급</td>
            </tr>
            <tr>
              <td className="border-b border-gray-100 px-4 py-3 font-semibold">비용</td>
              <td className="border-b border-gray-100 px-4 py-3">은행·상품별 부담 주체 확인. KB 현행 상품은 은행 부담 안내</td>
              <td className="border-b border-gray-100 px-4 py-3">고객 부담, HF 안내 연 0.05%~0.35%</td>
            </tr>
            <tr className="bg-gray-50/60">
              <td className="px-4 py-3 font-semibold">핵심 제한</td>
              <td className="px-4 py-3">은행별 취급 여부·주택 유형·담보 및 보험 심사</td>
              <td className="px-4 py-3">통합 3억원, MCG 1억원, 공제액×적용 방 수 등 중 최저 한도</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        HF의 일반 MCG 보증금액은 &ldquo;통합 보증한도 3억원에서 기존 보증잔액을 뺀 금액&rdquo;, &ldquo;MCG 한도
        1억원에서 기존 MCG 잔액을 뺀 금액&rdquo;, &ldquo;지역별 소액임차보증금 × 적용 방 수에서 동일 목적물의 기존 MCG
        잔액을 뺀 금액&rdquo; 중 가장 적은 금액입니다. 보증을 받았다는 이유만으로 공제액 전부가 항상 대출로 추가되는 것은
        아닙니다.
      </P>
      <Callout tone="amber">
        MCI·MCG 취급 여부는 영구 고정된 혜택이 아닙니다. 은행의 자금 운용, 상품 판매 조건, 보증·보험 심사에 따라 접수가
        제한될 수 있습니다. 사전상담 때 가능하다는 답을 들었더라도 대출 실행 예정일 기준으로 다시 확인하고, 약정서나
        상품설명서에 반영됐는지 확인하세요.
      </Callout>

      <H2 id="decision">신청해도 유리하지 않은 경우</H2>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {[
          ['DSR이 이미 더 낮을 때', '방공제를 보완해도 소득 기준 한도가 그대로라 추가 대출이 생기지 않습니다.'],
          ['상품 최대한도에 도달했을 때', '정책대출·은행 상품의 최대금액을 이미 채웠다면 담보 여유가 늘어도 받을 수 없습니다.'],
          ['필요 자금이 이미 충분할 때', '추가 한도가 불필요하면 MCG 보증료나 더 큰 원금의 장기 이자를 부담할 이유가 적습니다.'],
          ['곧 중도상환할 계획일 때', '추가 확보액의 사용기간과 보증료 환급 기준을 따져 총비용으로 비교해야 합니다.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </div>
      <P>
        반대로 잔금 부족액이 지역별 공제액과 비슷하고, DSR·LTV·상품한도에는 여유가 있으며, 더 비싼 신용대출로 부족분을
        채워야 하는 상황이라면 MCI·MCG 비교 가치가 큽니다. 이때도 추가 대출의 전체 기간 이자와 보증료를 합쳐 판단하세요.
      </P>

      <H2 id="checklist">잔금일 전 은행 확인 체크리스트</H2>
      <ol className="mb-5 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-gray-700">
        <li><strong className="text-gray-900">담보평가액과 LTV 한도</strong>를 먼저 받고 DSR·상품한도와 분리해 적습니다.</li>
        <li><strong className="text-gray-900">방공제 전·후 금액</strong>, 지역 구분, 적용 방 수, 실제 임대보증금 반영액을 요청합니다.</li>
        <li><strong className="text-gray-900">MCI·MCG 취급 가능 여부</strong>를 대출 실행 예정일 기준으로 확인합니다.</li>
        <li><strong className="text-gray-900">추가 확보액과 비용</strong>을 같은 표에 적습니다. MCG는 총 보증료와 환급 기준도 받습니다.</li>
        <li><strong className="text-gray-900">전입세대·임대차 조건</strong>과 실행일까지 필요한 퇴거·서류 조건을 확인합니다.</li>
        <li><strong className="text-gray-900">최종 승인 조건</strong>에 DSR, 선순위채권, 잔금일, 근저당 설정 순서가 반영됐는지 봅니다.</li>
      </ol>
      <Callout tone="emerald">
        잔금 계약은 &ldquo;예상 한도&rdquo;가 아니라 은행이 서면으로 제시한 방공제 후 승인금액을 기준으로 잡으세요. MCI·MCG가
        거절되거나 실행일에 제한되더라도 잔금을 치를 수 있는 예비자금까지 마련해야 계약금 손실 위험을 줄일 수 있습니다.
      </Callout>

      <HubBacklink hub="mortgage-preparation" />
    </GuideLayout>
  )
}
