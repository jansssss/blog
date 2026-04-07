'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

export default function ArticleToc() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('[data-article-content]')
    if (!article) return

    const headings = article.querySelectorAll('h2, h3')
    const tocItems: TocItem[] = []

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `section-${index}`
      }
      const text = heading.textContent?.trim() || ''
      if (text) {
        tocItems.push({
          id: heading.id,
          text,
          level: parseInt(heading.tagName[1]),
        })
      }
    })

    setItems(tocItems)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-10% 0% -75% 0%' }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  if (items.length < 2) return null

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">목차</span>
        </div>
        <nav>
          <ol className="space-y-1.5 border-l border-gray-100">
            {items.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: item.level === 3 ? '20px' : '12px' }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`block text-sm leading-snug transition-colors py-0.5 ${
                    activeId === item.id
                      ? 'text-blue-600 font-semibold border-l-2 border-blue-500 -ml-px pl-[11px]'
                      : 'text-gray-400 hover:text-gray-700'
                  } ${item.level === 3 ? 'text-xs' : ''}`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  )
}
