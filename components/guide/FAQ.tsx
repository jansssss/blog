import { ChevronDown, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQ({ items, emitSchema = true }: { items: FAQItem[]; emitSchema?: boolean }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      {emitSchema && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <details key={idx} className="group border border-gray-200 rounded-lg overflow-hidden">
            <summary
              className="w-full flex cursor-pointer list-none items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden"
            >
              <span className="flex items-start gap-2.5 flex-1">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-gray-900">{item.question}</span>
              </span>
              <ChevronDown
                className="w-4 h-4 text-gray-400 shrink-0 transition-transform mt-0.5 group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed pl-7">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
