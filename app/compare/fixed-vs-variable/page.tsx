import { ArrowLeft, CheckCircle2, ExternalLink, Info, Lock, Unlock } from 'lucide-react'
import Link from 'next/link'

import DisclaimerNotice from '@/components/DisclaimerNotice'
import FixedVariableSimulator, { type MarketOption } from '@/components/compare/FixedVariableSimulator'
import snapshotJson from '@/data/finlife-offers.json'
import { computeMarketRates } from '@/lib/finlife/market'
import { formatDisclosureMonth, type OfferSnapshot } from '@/lib/finlife/snapshot'
import { LOAN_ENDPOINTS, type LoanProductType } from '@/lib/finlife/types'

const snapshot = snapshotJson as unknown as OfferSnapshot

/**
 * 고정·변동 금리유형이 모두 공시되는 상품만 대상으로 한다.
 * 개인신용대출은 FSS 공시에 금리유형 구분이 없어 제외한다.
 */
const TARGET_TYPES: LoanProductType[] = ['mortgage', 'rent']

const OPTIONS: MarketOption[] = TARGET_TYPES.map((productType) => ({
  productType,
  label: LOAN_ENDPOINTS[productType].label,
  market: computeMarketRates(snapshot.offers, productType),
  disclosureMonth: formatDisclosureMonth(snapshot.disclosureMonths[productType]),
})).filter((option) => option.market.fixed && option.market.variable)

export default function FixedVsVariablePage() {
  const primary = OPTIONS[0]
  const spread = primary?.market.spread

  return (
    <div className="container max-w-6xl py-8">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link href="/compare" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" />
          금융 비교
        </Link>
      </div>

      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
          ⚡ 금감원 공시 금리로 즉시 계산
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">고정금리 vs 변동금리</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {spread !== null && spread !== undefined ? (
            <>
              지금 변동금리가 <strong className="text-indigo-700">{spread}%p</strong> 쌉니다. 앞으로
              얼마나 올라야 이 할인폭이 사라지는지 계산합니다.
            </>
          ) : (
            '변동금리가 얼마나 올라야 고정금리보다 불리해지는지 계산합니다'
          )}
        </p>
      </div>

      {OPTIONS.length > 0 ? (
        <FixedVariableSimulator options={OPTIONS} />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          금리유형별 공시 데이터를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
        </div>
      )}

      {/* ── 하단 가이드 ─────────────────────────────────────────── */}
      <div className="space-y-6 mt-8">
        {/* 두 유형 요약 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">고정금리</h3>
                <p className="text-xs text-gray-500">만기까지 금리가 변하지 않음</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                <span>상환액이 일정해 장기 계획을 세우기 쉽습니다</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                <span>금리가 아무리 올라도 부담이 늘지 않습니다</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 text-center leading-4">
                  !
                </span>
                <span>대신 시작 금리가 변동금리보다 높습니다</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">변동금리</h3>
                <p className="text-xs text-gray-500">주기적으로 시장금리에 따라 조정</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                <span>시작 금리가 낮아 초기 부담이 적습니다</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                <span>금리가 내리면 이자도 함께 줄어듭니다</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 text-center leading-4">
                  !
                </span>
                <span>오르면 월 부담이 그대로 늘어납니다</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 판단 기준 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">이 계산 결과를 어떻게 쓰면 되나</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">손익분기 상승폭이 작다면</strong> — 변동금리를 골라
              얻는 할인폭이 얇다는 뜻입니다. 금리가 조금만 올라도 뒤집히므로, 상환 기간이 길다면
              고정금리 쪽이 안전합니다.
            </p>
            <p>
              <strong className="text-gray-900">손익분기 상승폭이 크다면</strong> — 그만큼 여유가
              있습니다. 다만 30년 대출에서 그 정도 상승이 한 번도 없을지는 별개의 판단입니다.
            </p>
            <p>
              <strong className="text-gray-900">상환 계획이 짧다면</strong> — 몇 년 안에 갚거나
              갈아탈 예정이면 초기 금리가 낮은 변동금리가 유리한 경우가 많습니다. 위 계산기에서
              대출기간을 실제 보유 예정 기간으로 줄여 보세요.
            </p>
            <p>
              <strong className="text-gray-900">혼합형(MIX)도 선택지입니다</strong> — 처음 3~5년은
              고정, 이후 변동으로 전환되는 상품입니다. 상승 시점을 고정 기간 종료 시점으로 맞춰
              계산하면 대략의 감을 잡을 수 있습니다.
            </p>
          </div>
        </div>

        {/* 체크포인트 */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-2">계약 전 반드시 확인할 것</p>
              <ul className="text-amber-700 space-y-1">
                <li>• 변동금리의 <strong>금리 변동 주기</strong> (3개월·6개월·1년)</li>
                <li>• 어떤 지표에 연동되는지 (COFIX·금융채 등)</li>
                <li>• <strong>중도상환수수료</strong> — 고정금리 쪽이 더 높은 경우가 많습니다</li>
                <li>• 변동 → 고정 <strong>전환 옵션</strong>이 있는지, 수수료는 얼마인지</li>
                <li>• 우대금리 조건(급여이체·카드실적)과 유지 기간</li>
              </ul>
            </div>
          </div>
        </div>

        <DisclaimerNotice message="본 계산기는 금융감독원 공시 금리를 기본값으로 사용하지만, 실제 적용 금리는 개인 신용도·담보·우대조건에 따라 달라집니다. 미래 금리 경로는 누구도 예측할 수 없으므로 결과는 참고용으로만 활용하세요." />

        {/* 관련 도구 */}
        <div className="bg-gray-50 rounded-2xl p-4 border">
          <p className="text-sm font-medium text-gray-700 mb-3">관련 도구</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { href: '/compare/bank-rates', title: '은행별 금리 비교', desc: '실제 공시 상품 비교' },
              { href: '/calculator/loan-interest', title: '대출 이자 계산기', desc: '상환액 상세 계산' },
              { href: '/calculator/rate-change-impact', title: '금리 변동 영향', desc: '인상 시 부담 변화' },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center justify-between p-3 bg-white rounded-xl border hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 group-hover:text-indigo-700">
                    {tool.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
