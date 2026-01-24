'use client'

import Link from 'next/link'
import { Car, Shield, ClipboardCheck, ArrowRight } from 'lucide-react'

const INSURANCE_TOOLS = [
  {
    icon: <Car className="w-6 h-6" />,
    title: '자동차보험 할인 진단',
    description: '할인 누락 방지',
    href: '/tools/auto-discount-check'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: '실손/건강 중복 점검',
    description: '중복 제거로 절약',
    href: '/tools/health-overlap-check'
  },
  {
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: '보험 리모델링 체크',
    description: '보장 최적화',
    href: '/tools/insurance-remodel'
  }
]

export default function InsuranceToolsSection() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">보험 점검 도구</h2>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {INSURANCE_TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="block">
            <div className="h-full p-4 bg-background border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {tool.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
              <p className="text-xs text-primary mt-2 font-medium group-hover:underline">
                바로 점검하기
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
