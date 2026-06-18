'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

type AdFormat = 'fluid' | 'auto' | 'autorelaxed'

interface AdUnitProps {
  /** AdSense 광고 단위 ID (data-ad-slot). 미설정 시 아무것도 렌더하지 않음 */
  slot?: string
  /** 광고 포맷. 인아티클=fluid, 멀티플렉스=autorelaxed, 일반=auto */
  format?: AdFormat
  /** fluid 인아티클 레이아웃 키 */
  layout?: string
  className?: string
}

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-6676446565175753'

/**
 * 수동 배치 애드센스 광고 단위.
 * - slot이 비어 있으면 null 반환 → 빈/깨진 광고 박스가 절대 노출되지 않음
 * - slot ID는 AdSense 콘솔에서 "광고 단위" 생성 후 발급받아 환경변수로 주입
 */
export default function AdUnit({
  slot,
  format = 'fluid',
  layout = 'in-article',
  className,
}: AdUnitProps) {
  useEffect(() => {
    if (!slot) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // 광고 차단기 등으로 인한 실패는 무시
    }
  }, [slot])

  if (!slot) return null

  const insProps: Record<string, string> = {
    'data-ad-client': ADSENSE_CLIENT,
    'data-ad-slot': slot,
    'data-ad-format': format,
    'data-full-width-responsive': 'true',
  }
  if (format === 'fluid') {
    insProps['data-ad-layout'] = layout
  }

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block', textAlign: 'center' }}
      {...insProps}
    />
  )
}
