import Link from 'next/link'
import type { ReactNode } from 'react'
import { TrendingUp, Clock, ArrowLeft, ArrowRight, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react'

interface RelatedTrend {
  title: string
  href: string
  desc: string
}

interface TrendLayoutProps {
  title: string
  subtitle: string
  summary: string[]
  tag: string
  publishedAt: string
  updatedAt: string
  relatedTrends?: RelatedTrend[]
  children: ReactNode
}

export function TrendInsight({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 mb-6 text-white shadow-md">
      <div className="flex gap-2 items-start">
        <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-yellow-300" />
        <div>
          <p className="text-xs font-bold text-blue-200 mb-1">전문가 인사이트</p>
          <div className="text-sm leading-relaxed text-white/95">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function TrendWarn({ children }: { children: ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-6">
      <div className="flex gap-2 items-start">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div className="text-sm text-amber-900 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function TrendH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl md:text-2xl font-bold text-gray-900 mt-12 mb-5 pb-3 border-b-2 border-blue-100 scroll-mt-20"
    >
      {children}
    </h2>
  )
}

export function TrendH3({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-bold text-gray-800 mt-7 mb-2.5">{children}</h3>
}

export function TrendP({ children }: { children: ReactNode }) {
  return <p className="text-gray-700 leading-[1.9] mb-5 text-[15.5px]">{children}</p>
}

export function TrendUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2.5 mb-5 text-gray-700 text-[15px] leading-relaxed">{children}</ul>
}

export function TrendCaseBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
      <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />
        {title}
      </p>
      {children}
    </div>
  )
}

export default function TrendLayout({
  title,
  subtitle,
  summary,
  tag,
  publishedAt,
  updatedAt,
  relatedTrends = [],
  children,
}: TrendLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 배너 */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            홈으로
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              HOT 이슈
            </span>
            <span className="text-blue-300 text-xs">{tag}</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
            {title}
          </h1>
          <p className="text-blue-200 text-base leading-relaxed mb-6">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              발행: {publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              최신 업데이트: {updatedAt}
            </span>
          </div>
        </div>
      </div>

      {/* 핵심 요약 박스 */}
      <div className="container max-w-3xl mx-auto px-4 -mt-6 mb-0 relative z-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-bold text-gray-900">이 글의 핵심 요약</p>
          </div>
          <ul className="space-y-2">
            {summary.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 본문 */}
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <article className="prose-like">{children}</article>

        <hr className="border-gray-200 my-12" />

        {/* 관련 이슈 */}
        {relatedTrends.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              관련 이슈 더 보기
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTrends.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 mb-0.5">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 ml-3" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
