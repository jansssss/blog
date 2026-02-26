import Link from 'next/link'
import { TrendingUp, ArrowRight, Flame } from 'lucide-react'

const TRENDING_ITEMS = [
  {
    href: '/trend/capital-market-shift',
    badge: '핵심분석',
    badgeColor: 'bg-slate-700',
    title: '자본시장 정상화, 부동산 공화국 해체: 돈의 흐름은 어디로 가나',
    desc: '대출 규제와 양도세 이슈를 연결해 2026년 자산배분의 변화 방향을 분석',
    tag: '자산배분 전략',
    gradient: 'from-slate-800 to-blue-700',
    updatedAt: '2026.02.26',
  },
  {
    href: '/trend/capital-gains-tax',
    badge: '양도세',
    badgeColor: 'bg-red-500',
    title: '1가구 2주택 양도세, 지금 팔면 얼마?',
    desc: '비과세 요건·일시적 2주택 특례·중과세율 완전 분석',
    tag: '부동산 세금',
    gradient: 'from-red-600 to-orange-500',
    updatedAt: '2026.02.21',
  },
  {
    href: '/trend/multi-home-loan',
    badge: '대출규제',
    badgeColor: 'bg-blue-600',
    title: '다주택자 대출, 지금 어디까지 막혔나?',
    desc: '스트레스 DSR 2단계·2주택 주담대 금지·갭투자 차단 현황',
    tag: '대출 정책',
    gradient: 'from-blue-700 to-indigo-600',
    updatedAt: '2026.02.21',
  },
]

export default function TrendingBanner() {
  const sortedTrendingItems = [...TRENDING_ITEMS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-red-500" />
        <span className="text-sm font-bold text-gray-900">지금 핫한 이슈</span>
        <span className="text-xs text-gray-400">최신 부동산·금융 정책 분석</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedTrendingItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl block"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-90`} />

            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 ${item.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
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
                {item.desc}
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
