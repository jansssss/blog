import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, TrendingUp } from 'lucide-react'
import { getSortedTrends } from '@/lib/trendData'

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

export default function TrendHubPage() {
  const sortedTrendItems = getSortedTrends()

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
          {sortedTrendItems.map((item) => (
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
