import { Metadata } from 'next'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import DisclaimerNotice from '@/components/DisclaimerNotice'
import EligibilityChecker from '@/components/policy/EligibilityChecker'
import { ACTIVE_POLICIES } from '@/lib/policy/data'
import { MEDIAN_INCOME_YEAR } from '@/lib/policy/median-income'

export const metadata: Metadata = {
  title: `지원정책 자격 확인기 | 나이·소득·자산으로 받을 수 있는 제도 찾기 | ohyess`,
  description: `나이, 혼인 여부, 소득, 자산, 무주택 여부, 지역을 입력하면 신청 가능한 정부 지원제도를 찾아드립니다. ${ACTIVE_POLICIES.length}개 제도를 각 기관 공식 페이지에서 검증했으며, 조건이 맞지 않는 경우 무엇이 걸리는지도 알려드립니다.`,
  keywords: [
    '지원정책 자격확인',
    '정부지원금 자격',
    '청년 지원제도',
    '주거 지원 자격',
    '버팀목전세대출 자격',
    '디딤돌대출 자격',
    '주거급여 자격',
    '청년월세지원 자격',
  ],
  openGraph: {
    title: '지원정책 자격 확인기 — 내가 받을 수 있는 제도 찾기',
    description: '나이·소득·자산·무주택 여부를 입력하면 신청 가능한 정부 지원제도를 알려드립니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/policy/eligibility',
  },
}

/** 공식 정책 포털 — 이 도구가 다루지 않는 제도는 여기서 찾도록 안내한다 */
const OFFICIAL_PORTALS = [
  {
    name: '복지로',
    url: 'https://www.bokjiro.go.kr',
    description: '복지급여·수당 전반. 맞춤형 급여 모의계산 제공',
  },
  {
    name: '마이홈포털',
    url: 'https://www.myhome.go.kr',
    description: '주거복지 통합 포털. 공공임대 자격진단 제공',
  },
  {
    name: '주택도시기금',
    url: 'https://nhuf.molit.go.kr',
    description: '버팀목·디딤돌 등 기금 대출 상품 공식 안내',
  },
  {
    name: '온통청년',
    url: 'https://www.youthcenter.go.kr',
    description: '청년 정책 통합 검색. 지자체 정책까지 포함',
  },
]

export default function EligibilityPage() {
  return (
    <>
      <div className="container max-w-6xl pt-6">
        <Link href="/policy" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" />
          정책 지원
        </Link>
      </div>

      <EligibilityChecker />

      <div className="container max-w-6xl pb-12 space-y-8">
        {/* 공식 포털 안내 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">더 많은 제도 찾기</h2>
          <p className="text-sm text-gray-500 mb-4">
            이 도구는 조건을 직접 검증한 제도만 다룹니다. 지자체 정책이나 그 밖의 제도는 아래 공식 포털에서
            확인하세요.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {OFFICIAL_PORTALS.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 group-hover:text-primary">{portal.name}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">공식</span>
                    </div>
                    <p className="text-sm text-gray-600">{portal.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 자주 걸리는 조건 설명 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">신청 전에 알아두면 좋은 것</h2>
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">순자산과 소득인정액은 다릅니다</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                주택도시기금 대출은 <strong className="text-gray-900">순자산</strong>(자산 − 부채)을 봅니다. 반면
                주거급여 같은 복지급여는 <strong className="text-gray-900">소득인정액</strong>, 즉 소득에 재산을
                일정 비율로 환산해 더한 값을 씁니다. 그래서 소득이 같아도 재산이 많으면 복지급여에서는 탈락할 수
                있습니다.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">세대주 요건이 발목을 잡는 경우가 많습니다</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                전세·구입 자금 대출 대부분은 <strong className="text-gray-900">세대주 또는 예비 세대주</strong>를
                요구합니다. 부모님과 같은 세대로 등록되어 있으면 소득·자산 요건을 다 맞춰도 신청이 어렵습니다.
                청년월세 지원도 부모와 주민등록이 분리되어 있어야 합니다.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                기준 중위소득은 매년 바뀌고 가구원 수에 따라 달라집니다
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {MEDIAN_INCOME_YEAR}년 기준 중위소득은 1인 가구 월 256만원, 4인 가구 월 649만원입니다. 같은
                소득이라도 가구원 수가 많으면 중위소득 대비 비율이 낮아져 더 많은 제도에 해당될 수 있습니다.
                가구원 수를 정확히 입력하세요.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">모집 기간을 놓치면 1년을 기다립니다</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                기금 대출은 상시 접수지만, 청년월세 지원이나 자산형성 상품(청년미래적금)은{' '}
                <strong className="text-gray-900">연 1~2회 정해진 기간에만</strong> 접수합니다. 자격이 되더라도
                기간을 놓치면 다음 모집을 기다려야 하므로, 공고 일정을 미리 확인해두세요.
              </p>
            </div>
          </div>
        </section>

        <DisclaimerNotice
          basis={`각 제도 운영기관 공식 페이지 기준 (${ACTIVE_POLICIES.length}개 제도, 2026-07-21 확인)`}
          message="본 자격 확인 결과는 공개된 수치 요건만을 대조한 참고 정보이며, 실제 심사 결과나 지원 승인을 보장하지 않습니다. 세대 구성, 재직 요건, 대상주택 조건 등 서류로 확인되는 항목은 반영되지 않았습니다. 신청 전 반드시 각 제도의 공식 채널에서 최신 조건을 확인하시기 바랍니다."
        />
      </div>
    </>
  )
}
