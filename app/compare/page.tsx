import { TrendingUp, FileText, GitCompare, Landmark, Calculator, Users, Info, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import ToolCard from '@/components/ToolCard'

const COMPARISONS = [
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: '은행별 금리 비교',
    description: '주요 은행들의 대출 금리를 한눈에 비교해보세요',
    href: '/compare/bank-rates'
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: '대출 상품 비교',
    description: '다양한 대출 상품의 조건과 금리를 비교하세요',
    href: '/compare/loan-products'
  },
  {
    icon: <GitCompare className="w-6 h-6" />,
    title: '고정금리 vs 변동금리',
    description: '두 가지 금리 유형의 장단점을 비교해보세요',
    href: '/compare/fixed-vs-variable'
  },
  {
    icon: <Landmark className="w-6 h-6" />,
    title: '정책자금 비교',
    description: '정부 및 공공기관의 정책자금을 비교하세요',
    href: '/compare/policy-loans'
  }
]

const COMPARISON_TIPS = [
  {
    title: '금리만 보지 마세요',
    description: '중도상환수수료, 보증료, 인지세 등 부대비용도 함께 고려해야 합니다.'
  },
  {
    title: '우대금리 조건 확인',
    description: '광고 금리는 우대조건 충족 시 금리입니다. 실제 적용 금리를 확인하세요.'
  },
  {
    title: '동시 조회 주의',
    description: '여러 은행에 대출 조회하면 신용점수에 영향이 있을 수 있습니다.'
  }
]

const RATE_INFO = [
  { label: '신용대출', range: '4~8%', note: '신용도에 따라 상이' },
  { label: '전세대출', range: '3~5%', note: '보증기관별 상이' },
  { label: '주담대', range: '3~5%', note: '담보가치에 따라' },
  { label: '정책자금', range: '1~3%', note: '자격요건 충족 시' }
]

export default function ComparePage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <GitCompare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          금융 상품 비교
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          은행별, 상품별 금리와 조건을 한눈에 비교하세요
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-16">
        {COMPARISONS.map((comparison) => (
          <ToolCard
            key={comparison.href}
            icon={comparison.icon}
            title={comparison.title}
            description={comparison.description}
            href={comparison.href}
          />
        ))}
      </div>

      {/* 데스크톱용 추가 콘텐츠 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 금리 현황 및 팁 */}
          <div className="lg:col-span-2">
            {/* 금리 현황 요약 */}
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              2026년 1월 금리 현황
            </h2>
            <div className="grid sm:grid-cols-4 gap-4 mb-8">
              {RATE_INFO.map((info, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border text-center">
                  <p className="text-sm text-gray-500 mb-1">{info.label}</p>
                  <p className="text-xl font-bold text-primary">{info.range}</p>
                  <p className="text-xs text-gray-400 mt-1">{info.note}</p>
                </div>
              ))}
            </div>

            {/* 비교 팁 */}
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              금융 상품 비교 팁
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {COMPARISON_TIPS.map((tip, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-5 border">
                  <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>

            {/* 비교 가이드 */}
            <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                상품 비교 시 체크포인트
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>표면금리 vs 실제 적용금리 차이</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>고정금리 vs 변동금리 선택</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>대출 한도 및 상환 기간</span>
                  </li>
                </ul>
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>중도상환수수료 여부 및 면제 조건</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>우대금리 유지 조건</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>보증료, 인지세 등 부대비용</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 오른쪽: 관련 링크 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              함께 보면 좋은 정보
            </h2>
            <div className="space-y-3">
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
                href="/policy"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Landmark className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">정책 지원</p>
                    <p className="text-xs text-gray-500">정부 지원 제도 안내</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/policy/youth"
                className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary">청년 지원</p>
                    <p className="text-xs text-gray-500">청년 금융 지원 정책</p>
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

            {/* 면책 */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700">
                ⚠️ 금리 정보는 참고용이며, 실제 금리는 금융기관 및 개인 신용도에 따라 달라집니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
