'use client'

import Link from 'next/link'
import { PieChart, Calculator, RefreshCcw, Target, ArrowRight, ChevronRight } from 'lucide-react'

const FEATURED = {
  icon: <PieChart className="w-7 h-7" />,
  badge: 'NEW',
  title: 'DSR · DTI · LTV 계산기',
  description: '연 소득과 대출 조건을 입력하면 DSR·DTI·LTV를 즉시 계산합니다. 규제 한도(40%)와 비교하고 최대 대출 가능 금액을 역산합니다.',
  cta: '내 비율 확인하기',
  href: '/calculator/dsr-dti-ltv',
  gradient: 'from-indigo-600 to-blue-600',
  iconBg: 'bg-white/20',
}

const SIDE_TOOLS = [
  {
    icon: <Calculator className="w-5 h-5" />,
    title: '대출 이자 계산기',
    desc: '금액·금리로 총이자 즉시 계산',
    href: '/calculator/loan-interest',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    badge: 'NEW',
    title: '갈아타기 손익 계산',
    desc: '수수료 제하고 실제 절감액 확인',
    href: '/calculator/refinancing',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: '대출 한도 시뮬레이터',
    desc: '소득 기반 예상 한도 역산',
    href: '/calculator/loan-limit',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
]

export default function QuickToolsSection() {
  return (
    <section className="mb-10">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-600 rounded-full" />
          <h2 className="text-base font-bold text-gray-900">계산기 도구</h2>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">10가지</span>
        </div>
        <Link
          href="/calculator"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors font-medium"
        >
          전체 보기 <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 카드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

        {/* 피처드 카드 — 좌측 2/5 */}
        <Link
          href={FEATURED.href}
          className={`md:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br ${FEATURED.gradient} p-5 flex flex-col justify-between min-h-[160px] shadow-md hover:shadow-lg hover:scale-[1.015] transition-all duration-200`}
        >
          {/* NEW 뱃지 */}
          <span className="absolute top-3.5 right-3.5 text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full tracking-wide">
            NEW
          </span>

          {/* 아이콘 */}
          <div className={`w-11 h-11 ${FEATURED.iconBg} rounded-xl flex items-center justify-center text-white mb-3`}>
            {FEATURED.icon}
          </div>

          {/* 텍스트 */}
          <div>
            <p className="text-white font-bold text-base leading-snug mb-1">{FEATURED.title}</p>
            <p className="text-white/75 text-xs leading-relaxed line-clamp-2 hidden sm:block">{FEATURED.description}</p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 mt-3 text-white font-semibold text-xs">
            {FEATURED.cta}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* 사이드 카드 3개 — 우측 3/5 */}
        <div className="md:col-span-3 flex flex-col gap-3">
          {SIDE_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center gap-3.5 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200"
            >
              {/* 컬러 아이콘 */}
              <div className={`w-10 h-10 ${tool.bg} rounded-xl flex items-center justify-center ${tool.color} flex-shrink-0`}>
                {tool.icon}
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-indigo-700 transition-colors truncate">{tool.title}</p>
                  {tool.badge && (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">{tool.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{tool.desc}</p>
              </div>

              {/* 화살표 */}
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
