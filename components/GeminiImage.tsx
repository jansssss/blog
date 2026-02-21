'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GeminiImageProps {
  /** public/images/ 아래 정적 이미지 경로 (예: /images/guide/loan-interest.png)
   *  파일이 없으면 자동으로 그라데이션 플레이스홀더를 표시합니다. */
  src: string
  alt: string
  /** 이미지가 없을 때 플레이스홀더 배경 색상 키 */
  placeholderColor?: 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'rose' | 'indigo' | 'emerald' | 'amber' | 'sky' | 'violet' | 'pink' | 'slate'
  className?: string
  width?: number
  height?: number
}

const GRADIENTS: Record<string, string> = {
  blue:    'from-blue-600 to-indigo-700',
  purple:  'from-purple-600 to-violet-700',
  green:   'from-green-600 to-teal-700',
  orange:  'from-orange-500 to-amber-600',
  teal:    'from-teal-600 to-cyan-700',
  rose:    'from-rose-600 to-pink-700',
  indigo:  'from-indigo-600 to-blue-800',
  emerald: 'from-emerald-600 to-green-700',
  amber:   'from-amber-500 to-orange-600',
  sky:     'from-sky-500 to-blue-600',
  violet:  'from-violet-600 to-purple-700',
  pink:    'from-pink-500 to-rose-600',
  slate:   'from-slate-700 to-gray-900',
}

export default function GeminiImage({
  src,
  alt,
  placeholderColor = 'blue',
  className = '',
  width = 800,
  height = 400,
}: GeminiImageProps) {
  const [error, setError] = useState(false)
  const gradient = GRADIENTS[placeholderColor]
  const placeholderH = Math.round(height / 2.5)

  if (error) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} ${className}`}
        style={{ height: placeholderH }}
        aria-label={alt}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute right-1/4 top-1/3 w-12 h-12 bg-white/10 rounded-full" />
        <div className="flex items-end justify-start h-full p-4">
          <p className="text-white/50 text-xs">{alt}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}
