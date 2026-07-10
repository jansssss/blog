import { CalendarDays, ShieldCheck, ExternalLink } from 'lucide-react'
import { CALC_TRUST, formatKoreanDate } from '@/lib/regulations'

interface Source {
  label: string
  url: string
}

interface CalcMetaProps {
  /** 계산 기준일 — 계산에 쓰인 공식/규정의 적용 기준일 (ISO). 생략 시 표기 안 함 */
  asOf?: string
  /** 최종 검토일 (ISO). 기본값은 공통 검토일 */
  reviewedOn?: string
  /** 공식 출처 목록. 생략 시 공통 출처 사용 */
  sources?: readonly Source[]
}

/**
 * 계산기 신뢰 정보 표기 — 계산 기준일 · 공식 출처 · 최종 검토일을 일관된 형식으로 노출.
 * 가상의 전문가·경력 표현은 넣지 않는다(출처는 공식 기관 링크로만 표기).
 */
export default function CalcMeta({
  asOf,
  reviewedOn = CALC_TRUST.lastReviewed,
  sources = CALC_TRUST.sources,
}: CalcMetaProps) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40 p-4 text-xs text-gray-600 dark:text-gray-300">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {asOf && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">계산 기준일</span>
            {formatKoreanDate(asOf)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-200">최종 검토일</span>
          {formatKoreanDate(reviewedOn)}
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-semibold text-gray-700 dark:text-gray-200">공식 출처</span>
        {sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {s.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    </div>
  )
}
