'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface AiReviewIssue {
  severity: 'fail' | 'warn' | 'info'
  category: string
  message: string
  evidence: string
  fix: string
}

// v1(4항목)·v2(9항목) 모두 허용
export type AiReviewScores = Record<string, number>

export interface AiReviewPublishGate {
  status: 'auto_ok' | 'human_review' | 'draft_reinforce' | 'regenerate'
  score?: number
  fail_count?: number
  warn_count?: number
  hard_fail?: string[]
  warnings?: string[]
  checks?: Record<string, boolean>
}

export interface AiReview {
  schema_version?: number
  total_score: number
  final_decision: '발행 가능' | '수정 후 발행' | '발행 보류'
  risk_level: 'low' | 'medium' | 'high'
  scores: AiReviewScores
  issues: AiReviewIssue[]
  suggestions: string[]
  title_suggestions: string[]
  human_checkpoints: string[]
  review_summary: string
  publish_gate?: AiReviewPublishGate
}

const DECISION_CONFIG = {
  '발행 가능':   { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  '수정 후 발행': { bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  '발행 보류':   { bg: 'bg-red-50',      text: 'text-red-800',     border: 'border-red-200',     dot: 'bg-red-500'     },
} as const

const SEVERITY_CONFIG = {
  fail: { Icon: AlertCircle,   color: 'text-red-500',   bg: 'bg-red-50 border-red-200',     label: '실패' },
  warn: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', label: '경고' },
  info: { Icon: Info,          color: 'text-blue-500',  bg: 'bg-blue-50 border-blue-200',   label: '참고' },
} as const

// v2(9항목) + v1(4항목) 라벨/배점
const SCORE_LABELS: Record<string, string> = {
  // v2
  title_search:       '제목 검색적합',
  answer_clarity:     '핵심답변',
  key_numbers:        '핵심숫자',
  calc_table:         '계산표',
  scenario_table:     '시나리오표',
  source_specificity: '출처 구체성',
  freshness_date:     '기준일',
  cta_restraint:      'CTA 절제',
  rendering:          '렌더링',
  // v1 (구버전 호환)
  title:       '제목',
  calculation: '계산',
  sources:     '출처',
  cta:         'CTA',
}

const SCORE_MAX_MAP: Record<string, number> = {
  title_search: 15, answer_clarity: 15, key_numbers: 15, calc_table: 15,
  scenario_table: 10, source_specificity: 10, freshness_date: 10,
  cta_restraint: 5, rendering: 5,
  // v1 기본 25
}

const GATE_CONFIG = {
  auto_ok:         { label: '자동 발행 가능',  cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  human_review:    { label: '사람 검토 후 발행', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  draft_reinforce: { label: '초안 보강 필요',   cls: 'bg-orange-50 text-orange-800 border-orange-200' },
  regenerate:      { label: '재생성 필요',      cls: 'bg-red-50 text-red-800 border-red-200' },
} as const

function ScoreBar({ score, max = 25, label }: { score: number; max?: number; label: string }) {
  const pct = Math.min(100, (score / max) * 100)
  const color = pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{score}/{max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** 글 목록 카드용 인라인 배지 */
export function AiReviewBadge({ review }: { review: AiReview | null | undefined }) {
  if (!review) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        AI검수 없음
      </span>
    )
  }
  const cfg = DECISION_CONFIG[review.final_decision] ?? DECISION_CONFIG['발행 보류']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      AI {review.final_decision} ({review.total_score}점)
    </span>
  )
}

interface AiReviewPanelProps {
  review: AiReview | null | undefined
  reviewedAt?: string | null
  defaultExpanded?: boolean
}

/** 접이식 AI 검수 리포트 패널 (관리자 전용) */
export function AiReviewPanel({ review, reviewedAt, defaultExpanded = false }: AiReviewPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (!review) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-400 text-center">
        AI 검수 리포트 없음 (자동 생성 글이 아닌 경우 정상)
      </div>
    )
  }

  const cfg = DECISION_CONFIG[review.final_decision] ?? DECISION_CONFIG['발행 보류']
  const failCount = review.issues.filter(i => i.severity === 'fail').length
  const warnCount = review.issues.filter(i => i.severity === 'warn').length

  return (
    <div className={`rounded-xl border ${cfg.border} overflow-hidden`}>
      {/* 헤더 — 항상 표시 */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${cfg.bg} hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-sm font-semibold ${cfg.text}`}>AI 검수: {review.final_decision}</span>
          <span className={`text-xs ${cfg.text} opacity-70`}>
            {review.total_score}점
            {failCount > 0 && ` · fail ${failCount}건`}
            {warnCount > 0 && ` · warn ${warnCount}건`}
          </span>
        </div>
        {expanded
          ? <ChevronUp className={`h-4 w-4 ${cfg.text}`} />
          : <ChevronDown className={`h-4 w-4 ${cfg.text}`} />}
      </button>

      {/* 본문 — 펼쳐짐 */}
      {expanded && (
        <div className="p-4 space-y-4 bg-white text-sm">

          {/* 검수 요약 */}
          {review.review_summary && (
            <p className="text-xs text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-3">
              {review.review_summary}
            </p>
          )}

          {/* 발행 게이트 (v2) */}
          {review.publish_gate && (() => {
            const g = review.publish_gate!
            const cfg = GATE_CONFIG[g.status] ?? GATE_CONFIG.regenerate
            return (
              <div className={`rounded-lg border p-3 space-y-1 ${cfg.cls}`}>
                <p className="text-xs font-semibold">발행 게이트: {cfg.label}</p>
                {g.hard_fail && g.hard_fail.length > 0 && (
                  <ul className="text-xs space-y-0.5">
                    {g.hard_fail.map((h, i) => (
                      <li key={i} className="flex gap-1.5"><span className="shrink-0">✕</span><span>{h}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })()}

          {/* 항목별 점수 */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">항목별 점수</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(review.scores).map(([k, v]) => (
                <ScoreBar key={k} score={v} max={SCORE_MAX_MAP[k] ?? 25} label={SCORE_LABELS[k] ?? k} />
              ))}
            </div>
          </div>

          {/* 이슈 */}
          {review.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">발견된 이슈</p>
              {review.issues.map((issue, i) => {
                const sev = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.info
                const { Icon } = sev
                return (
                  <div key={i} className={`rounded-lg border p-3 space-y-1 ${sev.bg}`}>
                    <div className="flex items-start gap-2">
                      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${sev.color}`} />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-semibold text-gray-700">
                          [{sev.label}·{issue.category}] {issue.message}
                        </p>
                        {issue.evidence && (
                          <p className="text-xs text-gray-500 italic truncate">"{issue.evidence}"</p>
                        )}
                        {issue.fix && (
                          <p className="text-xs text-gray-600">→ {issue.fix}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 제목 수정안 */}
          {review.title_suggestions?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">제목 수정안</p>
              <ul className="space-y-1">
                {review.title_suggestions.map((t, i) => (
                  <li key={i} className="text-xs text-gray-700 bg-gray-50 rounded px-2.5 py-1.5">
                    {i + 1}. {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 개선 제안 */}
          {review.suggestions?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">개선 제안</p>
              <ul className="space-y-0.5">
                {review.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 사람 체크포인트 */}
          {review.human_checkpoints?.length > 0 && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 space-y-1">
              <p className="text-xs font-semibold text-indigo-700">사람이 확인할 사항</p>
              <ul className="space-y-0.5">
                {review.human_checkpoints.map((c, i) => (
                  <li key={i} className="text-xs text-indigo-700 flex gap-1.5">
                    <span className="shrink-0">✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 검수 시각 */}
          {reviewedAt && (
            <p className="text-xs text-gray-400 text-right">
              검수: {new Date(reviewedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
