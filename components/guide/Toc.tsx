'use client'

import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'

interface TocItem {
  id: string
  label: string
}

export default function Toc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id)
        if (el && el.offsetTop <= scrollY) {
          setActiveId(items[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  return (
    <nav className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">목차</span>
      </div>
      <ol className="space-y-2">
        {items.map((item, idx) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="text-blue-300 text-xs font-mono mt-0.5 w-5 shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <a
              href={`#${item.id}`}
              className={`text-sm leading-snug transition-colors hover:text-blue-700 ${
                activeId === item.id
                  ? 'text-blue-700 font-semibold'
                  : 'text-blue-600'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
