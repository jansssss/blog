import Link from 'next/link'
import { Calculator, ArrowRight, Clock } from 'lucide-react'
import type { ReactNode } from 'react'
import Toc from './Toc'
import FAQ from './FAQ'
import RelatedLinks from './RelatedLinks'
import BithumbCTA from './BithumbCTA'

interface TocItem {
  id: string
  label: string
}

interface CtaItem {
  label: string
  href: string
  description?: string
}

interface RelatedGuide {
  title: string
  href: string
  description: string
}

interface FAQItem {
  question: string
  answer: string
}

interface GuideLayoutProps {
  title: string
  description: string
  tocItems: TocItem[]
  ctas: CtaItem[]
  relatedGuides: RelatedGuide[]
  faqs: FAQItem[]
  lastUpdated?: string
  children: ReactNode
}

export default function GuideLayout({
  title,
  description,
  tocItems,
  ctas,
  relatedGuides,
  faqs,
  lastUpdated = '2026년 2월',
  children,
}: GuideLayoutProps) {
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {title}
        </h1>
        <p className="text-gray-600 leading-relaxed mb-3 text-base">{description}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>최종 업데이트: {lastUpdated}</span>
        </div>
      </header>

      {/* 목차 */}
      <Toc items={tocItems} />

      {/* 본문 */}
      <article className="mb-10">{children}</article>

      <hr className="border-gray-200 mb-10" />

      {/* 빗썸 CTA */}
      <BithumbCTA />

      {/* 계산기 CTA */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">직접 계산해보세요</p>
              <p className="text-xs text-blue-600">가이드 내용을 숫자로 확인</p>
            </div>
          </div>
          <div className={`grid gap-3 ${ctas.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className="flex items-center justify-between p-3.5 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {cta.label}
                  </p>
                  {cta.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{cta.description}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors shrink-0 ml-3" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">자주 묻는 질문</h2>
        <FAQ items={faqs} />
      </section>

      {/* 관련 가이드 */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">관련 가이드</h2>
        <RelatedLinks guides={relatedGuides} />
      </section>
    </div>
  )
}
