import { Calendar, RefreshCw, Clock, FileText, ExternalLink } from 'lucide-react'

export interface TrustSource {
  label: string
  href: string
}

export interface ContentTrustHeaderProps {
  publishedAt?: string
  reviewedAt?: string
  referenceDate?: string
  appliesTo?: string
  sources?: TrustSource[]
}

// 허용된 공식 기관 도메인
const ALLOWED_DOMAINS = [
  'fss.or.kr',      // 금융감독원
  'korea.kr',       // 금융위원회
  'nhuf.molit.go.kr', // 주택도시기금
  'hug.go.kr',      // 주택도시보증공사 HUG
  'hf.go.kr',       // 한국주택금융공사 HF
  'bok.or.kr',      // 한국은행
  'molit.go.kr',    // 국토교통부
  'mss.go.kr',      // 중소벤처기업부
  'sbiz.or.kr',     // 소상공인시장진흥공단
  'semas.or.kr',    // 소상공인시장진흥공단
  'kvic.or.kr',     // 한국벤처투자
  'kodit.or.kr',    // 신용보증기금
  'kibo.or.kr',     // 기술보증기금
  'myhome.go.kr',   // 마이홈포털
]

function isOfficialSource(href: string): boolean {
  try {
    const url = new URL(href)
    return ALLOWED_DOMAINS.some(domain => url.hostname.endsWith(domain))
  } catch {
    return false
  }
}

export default function ContentTrustHeader({
  publishedAt,
  reviewedAt,
  referenceDate,
  appliesTo,
  sources = [],
}: ContentTrustHeaderProps) {
  const validSources = sources.filter(s => isOfficialSource(s.href))

  const hasAnyMeta = publishedAt || reviewedAt || referenceDate || appliesTo || validSources.length > 0
  if (!hasAnyMeta) return null

  return (
    <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
        {publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">작성일</span>
            <span className="font-medium text-gray-700">{publishedAt}</span>
          </span>
        )}
        {reviewedAt && (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">최종검토</span>
            <span className="font-medium text-gray-700">{reviewedAt}</span>
          </span>
        )}
        {referenceDate && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">기준일</span>
            <span className="font-medium text-gray-700">{referenceDate}</span>
          </span>
        )}
        {appliesTo && (
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">적용상품</span>
            <span className="font-medium text-gray-700">{appliesTo}</span>
          </span>
        )}
      </div>

      {validSources.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-indigo-100 pt-2">
          <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">공식출처</span>
          {validSources.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              {s.label}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
