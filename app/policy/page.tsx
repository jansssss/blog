import { Users, Briefcase, Building2, Home } from 'lucide-react'
import Link from 'next/link'

const POLICIES = [
  {
    icon: <Users className="w-5 h-5" />,
    title: '청년 금융 지원',
    description: '청년을 위한 정부 및 공공기관의 금융 지원 제도',
    href: '/policy/youth'
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: '소상공인·자영업자 지원',
    description: '소상공인과 자영업자를 위한 금융 지원 정책',
    href: '/policy/small-business'
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: '중소기업 정책자금',
    description: '중소기업을 위한 정책자금 및 금융 지원',
    href: '/policy/sme'
  },
  {
    icon: <Home className="w-5 h-5" />,
    title: '주거 지원 (전세·월세)',
    description: '전세, 월세 등 주거 안정을 위한 금융 지원',
    href: '/policy/housing'
  }
]

export default function PolicyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-b from-blue-50/60 to-white border border-blue-100/60 px-8 py-12 text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-5">4가지 지원 정책</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">정책 지원</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">청년·소상공인·중소기업·주거 금융 지원 제도를 확인하세요</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {POLICIES.map((item) => (
          <Link key={item.href} href={item.href} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
              {item.icon}
            </div>
            <p className="font-semibold text-sm text-gray-900 leading-snug mb-1">{item.title}</p>
            <p className="text-xs text-gray-400 hidden sm:block leading-relaxed">{item.description}</p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">정책 정보는 변경될 수 있습니다. 정확한 내용은 각 기관에 문의하세요.</p>
    </div>
  )
}
