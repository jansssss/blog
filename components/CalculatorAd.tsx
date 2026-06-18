'use client'

import AdUnit from '@/components/AdUnit'

const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR

/**
 * 계산기 페이지 하단 공통 광고.
 * slot 미설정 시 라벨/컨테이너까지 통째로 렌더하지 않음 → 빈 박스 없음.
 */
export default function CalculatorAd() {
  if (!SLOT) return null

  return (
    <div className="container max-w-6xl px-4 pb-10">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          광고
        </p>
        <AdUnit slot={SLOT} format="auto" />
      </div>
    </div>
  )
}
