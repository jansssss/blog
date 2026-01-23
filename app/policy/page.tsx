import { Users, Briefcase, Building2, Home } from 'lucide-react'
import ToolCard from '@/components/ToolCard'

const POLICIES = [
  {
    icon: <Users className="w-6 h-6" />,
    title: '청년 금융 지원',
    description: '청년을 위한 정부 및 공공기관의 금융 지원 제도',
    href: '/policy/youth'
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: '소상공인·자영업자 지원',
    description: '소상공인과 자영업자를 위한 금융 지원 정책',
    href: '/policy/small-business'
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: '중소기업 정책자금',
    description: '중소기업을 위한 정책자금 및 금융 지원',
    href: '/policy/sme'
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: '주거 지원 (전세·월세)',
    description: '전세, 월세 등 주거 안정을 위한 금융 지원',
    href: '/policy/housing'
  }
]

export default function PolicyPage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 정책 & 지원 정보
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          정부 및 공공기관의 금융 지원 제도를 확인하세요
        </p>
      </div>

      {/* Policy Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {POLICIES.map((policy) => (
          <ToolCard
            key={policy.href}
            icon={policy.icon}
            title={policy.title}
            description={policy.description}
            href={policy.href}
          />
        ))}
      </div>
    </div>
  )
}
