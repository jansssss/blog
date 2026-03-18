import Link from 'next/link'
import { TrendingUp, ArrowRight, Flame } from 'lucide-react'
import { getLatestTrends } from '@/lib/trendData'

export default function TrendingBanner() {
  const items = getLatestTrends(4)

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-red-500" />
        <span className="text-sm font-bold text-gray-900">지금 핫한 이슈</span>
        <span className="text-xs text-gray-400">최신 부동산·금융 정책 분석</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl block"
            style={{ background: item.gradient }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: item.badgeColor }}
                  >
                    <TrendingUp className="w-2.5 h-2.5" />
                    HOT
                  </span>
                  <span className="text-white/70 text-[10px]">{item.tag}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>

              <p className="text-white font-bold text-sm leading-snug mb-1.5 group-hover:text-yellow-100 transition-colors">
                {item.title}
              </p>

              <p className="text-white/75 text-[11px] leading-relaxed line-clamp-2">
                {item.description}
              </p>

              <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-white/80 group-hover:text-white transition-colors">
                <span>전문가 분석 읽기</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
