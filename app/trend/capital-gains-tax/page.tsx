import type { Metadata } from 'next'
import TrendLayout, {
  TrendH2, TrendH3, TrendP, TrendUl, TrendInsight, TrendWarn, TrendCaseBox
} from '@/components/trend/TrendLayout'
import GeminiImage from '@/components/GeminiImage'

export const metadata: Metadata = {
  title: '1가구 2주택 양도세 완전 정리 2026 | 비과세·중과세·절세 전략',
  description:
    '1가구 2주택 양도소득세 비과세 요건, 일시적 2주택 특례, 2026년 중과세 현황, 절세 전략을 전문 컬럼리스트 시각으로 완전 정리합니다.',
  openGraph: {
    title: '1가구 2주택 양도세 완전 정리 2026',
    description: '비과세 요건·중과세·절세 전략 전문가 분석',
    type: 'article',
  },
}

export default function CapitalGainsTaxPage() {
  const summary = [
    '1가구 1주택 비과세: 2년 보유(조정지역 2년 거주), 양도가 12억원 이하 시 비과세',
    '일시적 2주택 비과세 특례: 신규 주택 취득 후 3년 이내 기존 주택 처분 시 비과세 가능',
    '2025~2026년 다주택 중과세: 조정지역 1주택 초과분에 일반세율+20%p(2주택) 또는 +30%p(3주택 이상) 중과 적용',
    '중과세 한시 유예 종료: 2023년 말 한시 완화 종료 후 현재 원칙적 중과 재적용',
    '절세 핵심: 취득일·거주 요건·처분 순서가 세금 수천만원을 좌우한다',
  ]

  return (
    <TrendLayout
      title="1가구 2주택 양도세, 지금 팔면 얼마 내야 하나"
      subtitle="비과세 요건부터 중과세 폭탄까지 — 2026년 현재 기준으로 정확히 짚습니다"
      summary={summary}
      tag="부동산 세금"
      publishedAt="2026년 2월"
      updatedAt="2026년 2월 21일"
      relatedTrends={[
        { title: '자본시장 정상화 분석 2026', href: '/trend/capital-market-shift', desc: '부동산-금융 자금 이동과 가구별 전략' },
        { title: '다주택자 대출 규제 현황 2026', href: '/trend/multi-home-loan', desc: '스트레스 DSR·2주택 대출 제한 완전 분석' },
        { title: 'DSR·DTI·LTV 완전 정리', href: '/guide/dsr-dti-ltv', desc: '대출 한도 3가지 핵심 지표' },
        { title: '주택담보대출 완전 정리', href: '/guide/mortgage-loan', desc: '주담대 한도·금리·절차 가이드' },
      ]}
    >
      <GeminiImage
        src="/images/trend/capital-gains-tax.png"
        placeholderColor="slate"
        alt="1가구 2주택 양도세 개요 일러스트"
        className="mb-10 rounded-2xl shadow-lg"
        height={350}
      />

      <TrendH2 id="background">왜 지금 이 문제가 중요한가</TrendH2>
      <TrendP>
        2020년부터 2022년까지 급등한 부동산 가격은 많은 1주택자를 &apos;의도치 않은 2주택자&apos;로 만들었습니다. 청약에 당첨되어 이사 가기 전 기존 집을 팔아야 하는 상황, 부모님이 돌아가시면서 집 한 채를 상속받은 경우, 지방에 직장이 생겨 이사하면서 원래 집을 일시 보유하게 된 경우 등 — 이들 모두가 &apos;1가구 2주택&apos; 범주에 들어갑니다.
      </TrendP>
      <TrendP>
        문제는 이 상태에서 집을 팔면 양도세가 수천만원에서 수억원까지 나올 수 있다는 점입니다. 비과세 조건을 정확히 알지 못한 채 집을 팔았다가 나중에 예상 외의 세금 고지서를 받고 당혹스러워하는 사례가 매년 수만 건입니다. 양도세는 &apos;아는 만큼 아끼는&apos; 세금입니다. 지금부터 그 구조를 정확히 분해합니다.
      </TrendP>

      <TrendInsight>
        양도소득세는 부동산 세금 중 가장 복잡하고 금액이 큽니다. 취득일, 거주 기간, 처분 순서, 지역 지정 여부, 임대 등록 여부 — 이 다섯 가지 변수가 세금 수천만원의 차이를 만듭니다. 본인의 상황을 이 다섯 변수에 대입해 보세요.
      </TrendInsight>

      <TrendH2 id="nonexempt">1가구 1주택 비과세의 정확한 요건</TrendH2>
      <TrendP>
        집이 두 채이더라도 한 채를 팔 때 비과세를 받으려면 먼저 &apos;1가구 1주택 비과세&apos; 구조를 이해해야 합니다. 이 조건이 &apos;일시적 2주택 특례&apos;의 기준점이 되기 때문입니다.
      </TrendP>
      <TrendH3>비과세 3대 요건 (2026년 현재)</TrendH3>
      <TrendUl>
        <li><strong>보유 기간 2년 이상:</strong> 취득일부터 양도일까지 2년 이상 보유. 취득 시점은 잔금 지급일 또는 등기접수일 중 빠른 날</li>
        <li><strong>거주 요건 (조정대상지역 한정):</strong> 2021년 1월 1일 이후 취득한 조정대상지역 주택은 2년 이상 실거주 필수. 미충족 시 비과세 불가</li>
        <li><strong>양도가액 12억원 이하:</strong> 양도 당시 실거래가 12억원 초과분에 대해서는 세금 부과. 12억 이하면 전액 비과세</li>
      </TrendUl>
      <TrendWarn>
        조정대상지역 지정 여부는 &apos;취득 당시&apos; 기준입니다. 취득 시점에 조정지역이었다면, 이후 해제되더라도 2년 거주 요건이 그대로 적용됩니다. 반대로 취득 당시 비조정이었다면 이후 조정지역으로 지정돼도 거주 요건이 소급 적용되지 않습니다.
      </TrendWarn>

      <TrendH2 id="temp2house">일시적 2주택 비과세 특례 — 핵심 중의 핵심</TrendH2>
      <TrendP>
        1가구 2주택 보유자가 가장 많이 활용하는 비과세 경로입니다. 새 집을 사면서 잠시 두 채를 보유하는 &apos;이사 과정&apos;에 대한 과세 유예입니다.
      </TrendP>
      <TrendH3>일시적 2주택 특례 조건 (2026년 현재)</TrendH3>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="space-y-3 text-sm text-blue-900">
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span><strong>신규 주택 취득:</strong> 기존 주택 취득 후 1년 이상 경과한 시점에 신규 주택 취득</span>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span><strong>처분 기한:</strong> 신규 주택 취득일로부터 <strong>3년 이내</strong>에 기존 주택 양도</span>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span><strong>기존 주택 비과세 요건 충족:</strong> 기존 주택이 1주택 비과세 요건(보유 2년, 조정지역 거주 2년)을 갖춰야 함</span>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <span><strong>처분 순서:</strong> 반드시 &apos;기존 주택 먼저 처분&apos;. 신규 주택을 먼저 팔면 일시적 2주택 특례 적용 불가</span>
          </div>
        </div>
      </div>

      <TrendInsight>
        3년 처분 기한은 2022년 5월 이후 취득한 신규 주택부터 적용됩니다. 그 이전에 취득한 경우 1년(조정지역 간 이사)이었다가 2년, 3년으로 완화된 역사가 있습니다. 자신이 신규 주택을 언제 취득했는지 반드시 확인하세요.
      </TrendInsight>

      <TrendH2 id="heavy-tax">2주택 중과세 — 지금 얼마나 내야 하나</TrendH2>
      <TrendP>
        비과세 특례를 받지 못하는 1가구 2주택자가 조정대상지역 주택을 양도하면 중과세가 부과됩니다. 2023년 말까지는 한시적 완화가 있었지만, 2024년 이후부터는 원칙적 중과세율이 다시 적용됩니다.
      </TrendP>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">보유 주택 수</th>
              <th className="px-4 py-3 text-left font-semibold">지역</th>
              <th className="px-4 py-3 text-right font-semibold">적용 세율</th>
              <th className="px-4 py-3 text-right font-semibold">중과 세율</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-3">1주택 (비과세 미해당)</td>
              <td className="border border-gray-200 px-4 py-3">전국</td>
              <td className="border border-gray-200 px-4 py-3 text-right">기본세율 6~45%</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-500">중과 없음</td>
            </tr>
            <tr className="bg-orange-50">
              <td className="border border-gray-200 px-4 py-3 font-semibold text-orange-800">2주택</td>
              <td className="border border-gray-200 px-4 py-3 text-orange-700">조정대상지역</td>
              <td className="border border-gray-200 px-4 py-3 text-right font-semibold text-orange-800">기본세율 + 20%p</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-orange-600">최대 65%</td>
            </tr>
            <tr className="bg-red-50">
              <td className="border border-gray-200 px-4 py-3 font-semibold text-red-800">3주택 이상</td>
              <td className="border border-gray-200 px-4 py-3 text-red-700">조정대상지역</td>
              <td className="border border-gray-200 px-4 py-3 text-right font-semibold text-red-800">기본세율 + 30%p</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-red-600">최대 75%</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3">2주택 이상</td>
              <td className="border border-gray-200 px-4 py-3">비조정지역</td>
              <td className="border border-gray-200 px-4 py-3 text-right">기본세율 6~45%</td>
              <td className="border border-gray-200 px-4 py-3 text-right text-gray-500">중과 없음</td>
            </tr>
          </tbody>
        </table>
      </div>
      <TrendP>
        서울 강남구 아파트를 2주택 상태에서 양도차익 5억원이 발생했다면? 기본세율 42%(누진공제 적용)에 중과 20%p를 더한 최대 62%가 적용될 수 있습니다. 양도차익 5억원에서 세금이 3억원 이상 나올 수 있는 구조입니다. 이것이 처분 순서와 타이밍이 그토록 중요한 이유입니다.
      </TrendP>

      <TrendH2 id="long-term">장기보유특별공제 — 중과 시 사라지는 혜택</TrendH2>
      <TrendP>
        1주택 비과세 요건을 충족하더라도 양도가 12억원을 초과하는 경우, 또는 비과세가 되더라도 고가 주택 양도 이익에 세금이 붙는 경우 &apos;장기보유특별공제&apos;를 활용해 세금을 줄일 수 있습니다.
      </TrendP>
      <TrendH3>1주택 장기보유특별공제 (2026년 현재)</TrendH3>
      <TrendUl>
        <li><strong>보유 3년 이상:</strong> 연 8% 공제 (보유 기간별)</li>
        <li><strong>거주 2년 이상:</strong> 추가 연 4% 공제 (거주 기간별)</li>
        <li><strong>최대 공제율:</strong> 보유 10년 + 거주 10년 시 최대 80% 공제 가능</li>
        <li><strong>중과세 적용 시:</strong> 장기보유특별공제 완전 배제. 이것이 중과세의 또 다른 타격</li>
      </TrendUl>
      <TrendWarn>
        <strong>중과세 시 장기보유특별공제 불가:</strong> 조정대상지역 2주택 이상에서 중과세를 맞으면 보유 기간이 10년이든 20년이든 장기보유특별공제를 받지 못합니다. 비과세 특례나 1주택 지위 확보가 절세의 핵심인 이유가 바로 여기 있습니다.
      </TrendWarn>

      <TrendH2 id="special-cases">예외적 2주택 — 세금이 달라지는 상황들</TrendH2>
      <TrendH3>① 상속으로 인한 2주택</TrendH3>
      <TrendP>
        기존 1주택자가 부모 사망으로 주택을 상속받아 일시적으로 2주택이 된 경우, 상속 주택을 먼저 처분하거나 기존 주택을 처분할 때 중과세가 적용되지 않습니다. 단, 상속 주택이 조정대상지역에 있는 경우 상속 후 5년 이내에 처분해야 일반세율이 적용됩니다.
      </TrendP>
      <TrendH3>② 혼인으로 인한 2주택</TrendH3>
      <TrendP>
        결혼 전 각자 1주택을 보유한 부부가 혼인으로 2주택이 된 경우, 혼인 신고일로부터 5년 이내에 처분하면 1주택으로 간주해 비과세 특례를 받을 수 있습니다.
      </TrendP>
      <TrendH3>③ 농어촌 주택 보유</TrendH3>
      <TrendP>
        읍·면 소재 농어촌 주택(취득가 2억원 이하)을 포함한 2주택의 경우, 일반 주택 처분 시 농어촌 주택은 주택 수에서 제외합니다. 귀농·귀촌 목적 주택 취득자에게 유리한 규정입니다.
      </TrendP>

      <GeminiImage
        src="/images/trend/capital-gains-tax-strategy.png"
        placeholderColor="slate"
        alt="양도세 절세 전략 시나리오 일러스트"
        className="my-10 rounded-2xl shadow-lg"
        height={320}
      />

      <TrendH2 id="strategy">2026년 절세 전략 — 이것만 기억하세요</TrendH2>
      <TrendH3>전략 1: 처분 순서를 설계하라</TrendH3>
      <TrendP>
        일시적 2주택 특례를 활용하려면 반드시 &apos;기존 주택 → 신규 주택&apos; 순서로 처분해야 합니다. 신규 주택을 먼저 처분하면 특례 자격을 잃습니다. 처분 계획 전 반드시 취득일과 처분 기한 3년을 달력에 표시해두세요.
      </TrendP>
      <TrendH3>전략 2: 거주 요건을 채워라</TrendH3>
      <TrendP>
        조정대상지역 주택은 2년 실거주 요건이 필수입니다. 세입자가 있다면 임대차 계약 만료 후 직접 거주를 시작하는 시점을 역산해 처분 타이밍을 잡아야 합니다. 거주 요건 미충족 하나로 비과세가 과세로 전환되는 경우가 매우 많습니다.
      </TrendP>
      <TrendH3>전략 3: 비조정지역 이전 vs 처분 택일</TrendH3>
      <TrendP>
        규제지역(조정대상지역)에서 양도차익이 크다면 지역 해제 후 매도를 고려할 수 있습니다. 조정지역 해제 시 중과세가 사라지고 장기보유특별공제가 살아납니다. 다만 규제지역 해제는 시장 상황에 따라 예측이 어렵습니다.
      </TrendP>
      <TrendH3>전략 4: 1세대 범위를 정확히 파악하라</TrendH3>
      <TrendP>
        성인 자녀가 부모와 같은 세대로 묶이는 경우 세대 전체 주택 수가 합산됩니다. 30세 미만 자녀가 소득이 없으면 별도 세대를 구성할 수 없습니다. 세대 분리 가능 여부를 세무사와 확인하는 것이 중요합니다.
      </TrendP>

      <TrendInsight>
        양도세 절세의 황금률은 &apos;파는 타이밍&apos;이 아니라 &apos;취득 시 설계&apos;에 있습니다. 집을 살 때부터 취득일·거주 기간·처분 순서를 설계해두는 것이 가장 강력한 절세 전략입니다. 이미 2주택을 보유하고 있다면, 지금 당장 세무사에게 현재 상황을 정리한 문서를 들고 상담받는 것이 최선입니다.
      </TrendInsight>

      <TrendH2 id="cases">현실 사례 2가지</TrendH2>
      <TrendCaseBox title="사례 A — 청약 당첨 후 일시적 2주택 처리">
        <TrendP>
          서울 성동구 A아파트(2019년 9월 취득, 실거주 2년 이상)를 보유 중인 B씨. 2023년 6월 서울 마포구 신규 청약에 당첨돼 2024년 3월 입주했습니다. 현재 두 채 보유 중.
        </TrendP>
        <TrendUl>
          <li>신규 주택 취득(입주)일: 2024년 3월 → 처분 기한: 2027년 3월</li>
          <li>기존 A아파트: 보유 5년+, 실거주 2년+ → 비과세 요건 충족</li>
          <li><strong>전략: 2027년 3월 이내에 A아파트 처분 시 비과세 적용 가능</strong></li>
          <li>양도차익 3억원이라도 비과세 → 세금 0원. 기한 넘기면 중과세로 최대 수억원 세금</li>
        </TrendUl>
      </TrendCaseBox>
      <TrendCaseBox title="사례 B — 3년 기한 내 처분 실패, 중과세 발생">
        <TrendP>
          서울 강남구 아파트(2018년 취득, 취득가 6억)를 보유하던 C씨가 2021년 경기도 성남시에 신규 주택 취득(취득가 8억). 2024년 기한 도과 후 강남 아파트 처분 시 양도가 15억.
        </TrendP>
        <TrendUl>
          <li>처분 기한(2021년 취득 기준): 2024년 → 처분 기한 내 처분 미이행</li>
          <li>양도차익: 15억 - 6억 - 필요경비 = 약 8억 5천만원</li>
          <li>중과세 적용: 기본세율 45% + 중과 20%p = 65%</li>
          <li><strong>예상 세금: 약 3억~4억원 이상 (장기보유특별공제 배제)</strong></li>
          <li>비과세 특례 시 세금: 12억 초과분 일부만 과세 → 수천만원 수준</li>
          <li>차이: 수억원</li>
        </TrendUl>
      </TrendCaseBox>

      <TrendH2 id="checklist">처분 전 최종 체크리스트</TrendH2>
      <TrendUl>
        <li>☐ 처분하려는 주택이 조정대상지역인가 (취득 당시 기준)</li>
        <li>☐ 보유 기간 2년 이상 충족 여부</li>
        <li>☐ 거주 기간 2년 이상 충족 여부 (조정지역 취득 주택)</li>
        <li>☐ 일시적 2주택 처분 기한(3년) 초과 여부</li>
        <li>☐ 동일 세대 내 주택 수 합산 여부</li>
        <li>☐ 상속·혼인·농어촌 주택 예외 해당 여부</li>
        <li>☐ 양도 전 세무사 상담 → 예상 세금 계산 후 결정</li>
      </TrendUl>
      <TrendP>
        마지막으로 한 가지. 세법은 매년 바뀝니다. 이 글이 작성된 시점(2026년 2월)의 기준을 담았지만, 양도 전에는 반드시 세무사 또는 국세청 홈택스의 최신 기준을 확인하세요. 수억원짜리 결정을 인터넷 정보 하나만 믿고 하지 마세요.
      </TrendP>
    </TrendLayout>
  )
}
