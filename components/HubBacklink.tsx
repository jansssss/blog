import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * 허브(토픽 클러스터 진입점)로 되돌아가는 링크.
 *
 * 허브는 하위 문서를 가리키는데 하위 문서가 되돌아오지 않으면 클러스터가
 * 한쪽 방향으로만 연결돼 검색엔진이 묶인 주제로 인식하지 못한다.
 * 클러스터에 속한 가이드·계산기 본문 하단에 이 컴포넌트를 둔다.
 */
const HUBS = {
  'mortgage-preparation': {
    href: '/hub/mortgage-preparation',
    eyebrow: 'STEP BY STEP',
    title: '주담대 준비 전체 순서 보기',
    description: '한도 확인 → 월 납입액 → 부채 영향 → 사전심사 체크까지 7단계',
  },
  'dsr-guide': {
    href: '/hub/dsr-guide',
    eyebrow: 'DSR 총정리',
    title: 'DSR 40% 완전 정복 — 전체 흐름 보기',
    description: '규제 구조부터 한도 계산, 막혔을 때 뚫는 순서까지 한 번에',
  },
  'refinancing-guide': {
    href: '/hub/refinancing-guide',
    eyebrow: '갈아타기 총정리',
    title: '주담대 갈아타기 완전 정복 — 전체 흐름 보기',
    description: '언제 갈아탈지, 수수료 빼고 실제로 얼마 남는지 판단 순서대로',
  },
} as const

export type HubKey = keyof typeof HUBS

export default function HubBacklink({ hub }: { hub: HubKey }) {
  const { href, eyebrow, title, description } = HUBS[hub]

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 mt-6 mb-2 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 px-5 py-4 transition-colors"
    >
      <div>
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">
          {eyebrow}
        </p>
        <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors">
        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
