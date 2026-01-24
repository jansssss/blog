import { Users, Briefcase, Building2, Home, Landmark, Calculator, FileText, Info, CheckCircle2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
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

const POLICY_HIGHLIGHTS = [
  {
    title: '청년전용 버팀목전세대출',
    rate: '연 1.5~2.9%',
    target: '만 19~34세 무주택 청년',
    category: '청년'
  },
  {
    title: '소상공인 정책자금',
    rate: '연 2~3%대',
    target: '소상공인 기준 충족',
    category: '소상공인'
  },
  {
    title: '특례보금자리론',
    rate: '연 3.3~4.3%',
    target: '무주택 실수요자',
    category: '주거'
  },
  {
    title: '중소기업 혁신성장자금',
    rate: '연 2~3%대',
    target: '혁신형 중소기업',
    category: '중소기업'
  }
]

const USEFUL_LINKS = [
  { name: '온라인청년센터', url: 'https://www.youthcenter.go.kr', desc: '청년 정책 통합' },
  { name: '소상공인마당', url: 'https://www.sbiz.or.kr', desc: '소상공인 지원' },
  { name: '기업마당', url: 'https://www.bizinfo.go.kr', desc: '중소기업 지원' },
  { name: '마이홈포털', url: 'https://www.myhome.go.kr', desc: '주거 지원' }
]

export default function PolicyPage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Landmark className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 정책 & 지원 정보
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          정부 및 공공기관의 금융 지원 제도를 확인하세요
        </p>
      </div>

      {/* Policy Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-16">
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

      {/* 데스크톱용 추가 콘텐츠 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 주요 정책 하이라이트 */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              주요 정책 하이라이트
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {POLICY_HIGHLIGHTS.map((policy, index) => (
                <div key={index} className="bg-white rounded-lg p-5 border hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                      {policy.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{policy.title}</h3>
                  <p className="text-lg font-bold text-primary mb-1">{policy.rate}</p>
                  <p className="text-xs text-gray-500">{policy.target}</p>
                </div>
              ))}
            </div>

            {/* 정책 활용 가이드 */}
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              정책자금 활용 가이드
            </h2>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                정책자금 신청 전 체크포인트
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>자격 요건 (나이, 소득, 자산) 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>신청 기간 및 예산 잔액 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>필요 서류 미리 준비</span>
                  </li>
                </ul>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>중복 수혜 가능 여부 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>시중 대출과 조건 비교</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>상환 계획 수립</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 유용한 사이트 */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">정책 정보 통합 사이트</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                {USEFUL_LINKS.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-50 rounded-lg border hover:border-primary/50 transition-colors text-center"
                  >
                    <p className="font-medium text-sm text-gray-900">{link.name}</p>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 관련 도구 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              함께 보면 좋은 정보
            </h2>
            <div className="space-y-3">
              <Link
                href="/compare/policy-loans"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Landmark className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">정책자금 비교</p>
                    <p className="text-xs text-gray-500">정부 지원 대출 비교</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/calculator"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">금융 계산기</p>
                    <p className="text-xs text-gray-500">이자, 상환액 계산</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/compare/bank-rates"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">은행별 금리 비교</p>
                    <p className="text-xs text-gray-500">시중은행 금리 현황</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/guide"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">가이드</p>
                    <p className="text-xs text-gray-500">금융 관련 정보 모음</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* 팁 */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 text-sm mb-2">💡 정책자금 신청 팁</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• 연초 또는 예산 배정 직후에 신청</li>
                <li>• 필요 서류 미리 준비해두기</li>
                <li>• 자격 요건 꼼꼼히 확인하기</li>
              </ul>
            </div>

            {/* 면책 */}
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                ⚠️ 정책 정보는 변경될 수 있습니다. 정확한 내용은 각 기관에 문의하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
