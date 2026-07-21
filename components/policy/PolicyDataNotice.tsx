import { ArrowRight, SearchCheck } from 'lucide-react'
import Link from 'next/link'

import { ACTIVE_POLICIES } from '@/lib/policy/data'

/**
 * 정책 목록 페이지 상단 고지 + 자격 확인기 유도.
 *
 * 기존 페이지들은 하단에 "2026년 1월 기준"이라고 단정해 두었으나 실제로는
 * 항목마다 확인 시점이 달랐다. (예: 학자금대출 금리는 2024년 값이었고,
 * 버팀목전세자금은 소득·순자산 요건까지 낡아 있었다)
 *
 * 일괄 기준일을 주장하는 대신, 항목별로 검증된 자격 확인기로 안내하고
 * 이 목록은 "제도 존재를 훑어보는 용도"임을 분명히 한다.
 */
export default function PolicyDataNotice({ scope }: { scope: string }) {
  return (
    <div className="mb-8 space-y-3">
      <Link
        href="/policy/eligibility"
        className="block rounded-2xl p-5 text-white group"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <SearchCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base mb-1">내 조건으로 자격을 확인해보세요</p>
            <p className="text-indigo-100 text-sm leading-relaxed">
              나이·소득·자산·무주택 여부를 입력하면 신청 가능한 제도를 찾아드립니다. 조건이 맞지 않으면
              무엇이 걸리는지도 알려드립니다.
            </p>
            <p className="text-indigo-200 text-xs mt-2 inline-flex items-center gap-1">
              공식 출처로 검증한 {ACTIVE_POLICIES.length}개 제도
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </Link>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>이 목록에 대하여</strong> — 아래는 {scope} 제도를 훑어보기 위한 개괄 목록입니다. 금리·한도·
          소득요건은 수시로 바뀌므로 이 목록의 수치는 참고용으로만 보시고,{' '}
          <Link href="/policy/eligibility" className="underline font-semibold">
            자격 확인기
          </Link>
          (기관 공식 페이지에서 확인한 조건과 확인 기준일 표기) 또는 각 기관 공식 사이트에서 최신 조건을 확인하세요.
        </p>
      </div>
    </div>
  )
}
