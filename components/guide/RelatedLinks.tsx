import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedGuide {
  title: string
  href: string
  description: string
}

export default function RelatedLinks({ guides }: { guides: RelatedGuide[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {guides.map((guide) => (
        <Link
          key={guide.href}
          href={guide.href}
          className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                {guide.title}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{guide.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
          </div>
        </Link>
      ))}
    </div>
  )
}
