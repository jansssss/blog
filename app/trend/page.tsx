import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: '지금 핫한 이슈 전문가 분석 | 자본시장 정상화, 부동산 공화국 해체',
  description:
    '자본시장 정상화와 부동산 공화국 해체를 중심으로, 정책 변화와 시장 영향까지 핵심만 정리한 전문가 분석 허브입니다.',
  openGraph: {
    title: '지금 핫한 이슈 전문가 분석',
    description: '자본시장 정상화, 부동산 공화국 해체 테마 분석 허브',
    type: 'website',
  },
}

const TREND_ITEMS = [
  {
    href: '/trend/capital-market-shift',
    title: '자본시장 정상화, 부동산 공화국 해체: 돈의 흐름은 어디로 가나',
    description: '대출 규제와 양도세 이슈를 연결해 2026년 자산배분의 큰 축 변화를 분석합니다.',
    tag: '자산배분 전략',
    updatedAt: '2026.02.26',
  },
  {
    href: '/trend/multi-home-loan',
    title: '다주택자 대출 규제, 지금 어디까지 왔나',
    description: '스트레스 DSR, 주택 수별 대출 제한, 전세대출 규제를 한 번에 정리합니다.',
    tag: '대출 규제',
    updatedAt: '2026.02.21',
  },
  {
    href: '/trend/capital-gains-tax',
    title: '1가구 2주택 양도세, 지금 팔면 얼마를 내나',
    description: '비과세 요건, 중과세 기준, 실제 절세 전략을 케이스 중심으로 설명합니다.',
    tag: '부동산 세금',
    updatedAt: '2026.02.21',
  },
]

export default function TrendHubPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-4">
            <TrendingUp className="w-3 h-3" />
            HOT 이슈
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
            지금 핫한 이슈 전문가 분석
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-3xl">
            테마 주제: 자본시장 정상화, 부동산 공화국 해체.
            대출 규제와 양도세, 정책 변화가 개인의 의사결정에 미치는 영향을 실전 중심으로 읽어냅니다.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {TREND_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                  {item.tag}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-800">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {item.description}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                최신 업데이트: {item.updatedAt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
