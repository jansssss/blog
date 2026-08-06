'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * 모바일에서만 접히는 섹션.
 *
 * 데스크탑(lg 이상)에서는 토글 버튼 없이 내용이 항상 펼쳐진 상태로 보인다.
 * 모바일에서는 기본으로 접어 두고, 찾아보려는 사람만 열어보게 한다.
 *
 * 내용은 접혀 있어도 마크업에 그대로 남으므로(=`hidden` 만 적용) 내부 링크가
 * HTML 에서 사라지지 않는다. 홈에서 가이드 링크를 걷어내면 그 링크들이
 * 색인 대상에서 빠지는데, 이 방식은 그 손실 없이 화면만 정리한다.
 */
export default function MobileCollapse({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="lg:hidden w-full flex items-center gap-3 min-h-[56px] px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors"
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-bold text-gray-800 leading-snug">{title}</p>
          {hint && <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{hint}</p>}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`${open ? 'block mt-4' : 'hidden'} lg:block lg:mt-0`}>{children}</div>
    </section>
  )
}
