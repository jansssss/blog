import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { RelatedTool } from '@/lib/calculators/types'

interface RelatedToolsProps {
  items: RelatedTool[]
  title?: string
}

/**
 * 관련 계산기 내부 링크 목록
 */
export default function RelatedTools({
  items,
  title = '관련 계산기'
}: RelatedToolsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  )
}
