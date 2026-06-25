import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function MortgagePrepHubCTA() {
  return (
    <Link
      href="/hub/mortgage-preparation"
      className="group flex items-center justify-between gap-4 mt-6 mb-2 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 px-5 py-4 transition-colors"
    >
      <div>
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">STEP BY STEP</p>
        <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
          주담대 준비 전체 순서 보기
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          한도 확인 → 월 납입액 → 부채 영향 → 사전심사 체크까지 7단계
        </p>
      </div>
      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors">
        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
