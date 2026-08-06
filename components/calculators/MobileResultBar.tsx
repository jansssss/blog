'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * 모바일 전용 하단 고정 결과바.
 *
 * 계산기 페이지는 데스크탑에서 `lg:grid-cols-[2fr_3fr]` + `lg:sticky` 로
 * 입력과 결과를 나란히 두기 때문에 슬라이더를 만지면 결과가 바로 보인다.
 * 모바일은 단일 컬럼이라 결과가 화면 밖으로 밀려나 "조작 → 확인"이 끊긴다.
 *
 * 이 컴포넌트를 결과 KPI 블록 **바로 뒤**에 두면, 사용자가 아직 결과까지
 * 스크롤하지 않은 동안에만 하단에 핵심 수치를 띄워 그 흐름을 이어준다.
 * 결과가 화면에 들어오면 스스로 사라지므로 같은 숫자가 두 번 보이지 않고,
 * 그 아래 SEO 본문·광고 영역을 가리지도 않는다.
 */

export interface MobileResultItem {
  label: string
  value: string
  /** 값 색상 — 손익/경고를 색으로 구분해야 할 때 */
  tone?: 'default' | 'positive' | 'warning' | 'danger'
}

const TONE_CLASS: Record<NonNullable<MobileResultItem['tone']>, string> = {
  default: 'text-white',
  positive: 'text-emerald-300',
  warning: 'text-amber-300',
  danger: 'text-red-300',
}

export default function MobileResultBar({
  items,
  ariaLabel = '결과 요약 — 눌러서 자세히 보기',
}: {
  /** 2개 권장, 최대 3개. 값은 짧은 표기(예: 1,036,384원 대신 104만원)를 쓸 것 */
  items: MobileResultItem[]
  ariaLabel?: string
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 센티널이 뷰포트 "아래"에 있을 때만 노출한다.
        // 위로 지나간 경우(= 결과를 이미 보고 본문을 읽는 중)에는 띄우지 않는다.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top > 0)
      },
      { threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollToResult = () => {
    sentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const cols = items.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        // 결과가 보이는 동안에는 하단 콘텐츠 터치를 가로막지 않는다
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <button
          type="button"
          onClick={scrollToResult}
          aria-label={ariaLabel}
          aria-hidden={!visible}
          tabIndex={visible ? 0 : -1}
          className="w-full text-left shadow-[0_-4px_20px_rgba(15,23,42,0.18)]"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="container flex items-center gap-3 py-3">
            <div className={`grid ${cols} gap-3 flex-1 min-w-0`}>
              {items.slice(0, 3).map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 truncate">
                    {item.label}
                  </p>
                  <p
                    className={`text-base font-extrabold leading-tight tabular-nums truncate ${
                      TONE_CLASS[item.tone ?? 'default']
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-indigo-100">
              자세히
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </button>
      </div>
    </>
  )
}
