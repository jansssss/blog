'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Landmark, ArrowLeft, ExternalLink, CheckCircle2, Info, Users, Briefcase, Home, Search } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 정책자금 대출 종류
const POLICY_CATEGORIES = [
  {
    id: 'youth',
    icon: <Users className="w-6 h-6" />,
    name: '청년 지원',
    description: '만 19~39세 청년을 위한 금융 지원',
    examples: ['청년전용 버팀목 전세대출', '청년 창업 지원', '햇살론 Youth'],
    link: '/policy/youth'
  },
  {
    id: 'small-business',
    icon: <Briefcase className="w-6 h-6" />,
    name: '소상공인·자영업자',
    description: '소규모 사업자를 위한 운영자금 지원',
    examples: ['소상공인 정책자금', '소공인 특화자금', '긴급경영안정자금'],
    link: '/policy/small-business'
  },
  {
    id: 'sme',
    icon: <Briefcase className="w-6 h-6" />,
    name: '중소기업',
    description: '중소·중견기업 성장 지원',
    examples: ['정책자금 융자', '기술보증기금', '신용보증기금'],
    link: '/policy/sme'
  },
  {
    id: 'housing',
    icon: <Home className="w-6 h-6" />,
    name: '주거 지원',
    description: '무주택자·신혼부부 주거 안정',
    examples: ['디딤돌 대출', '보금자리론', '신혼부부 전세대출'],
    link: '/policy/housing'
  }
]

// 주요 정책자금 기관
const POLICY_INSTITUTIONS = [
  {
    name: '주택도시기금',
    url: 'https://nhuf.molit.go.kr',
    description: '전세자금, 주거안정 대출',
    official: true
  },
  {
    name: '주택금융공사',
    url: 'https://www.hf.go.kr',
    description: '보금자리론, 디딤돌대출',
    official: true
  },
  {
    name: '중소벤처기업진흥공단',
    url: 'https://www.kosmes.or.kr',
    description: '중소기업 정책자금',
    official: true
  },
  {
    name: '소상공인시장진흥공단',
    url: 'https://www.semas.or.kr',
    description: '소상공인 정책자금',
    official: true
  },
  {
    name: '서민금융진흥원',
    url: 'https://www.kinfa.or.kr',
    description: '서민·저소득층 금융지원',
    official: true
  },
  {
    name: '신용보증기금',
    url: 'https://www.kodit.co.kr',
    description: '중소기업 신용보증',
    official: true
  },
  {
    name: '기술보증기금',
    url: 'https://www.kibo.or.kr',
    description: '기술기업 보증지원',
    official: true
  }
]

export default function PolicyLoansPage() {
  return (
    <div className="container py-8 max-w-4xl">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link href="/compare" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" />
          금융 상품 비교
        </Link>
      </div>

      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Landmark className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          정책자금 찾는 방법
        </h1>
        <p className="text-gray-600">
          정부 지원 대출을 찾고 신청하는 방법을 안내합니다
        </p>
      </div>

      {/* 핵심 안내 */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-2">정책자금이란?</p>
              <p className="text-sm text-gray-600">
                정부와 공공기관이 <strong className="text-gray-900">특정 대상</strong>을 위해
                <strong className="text-gray-900"> 낮은 금리</strong>로 지원하는 대출입니다.
                일반 은행 대출보다 1~3%p 낮은 금리로 이용할 수 있으며, 자격 조건에 해당하면 반드시 확인해보세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 대상별 정책자금 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          나에게 맞는 정책자금 찾기
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {POLICY_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="bg-white rounded-lg border p-5 hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-700 mb-1">대표 상품:</p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {category.examples.map((example, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center text-sm text-primary mt-3">
                자세히 보기
                <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 주요 정책자금 기관 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary" />
          정책자금 신청 기관
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          대상별로 담당 기관이 다릅니다. 아래 기관 홈페이지에서 자세한 조건과 신청 방법을 확인하세요.
        </p>
        <div className="space-y-3">
          {POLICY_INSTITUTIONS.map((inst) => (
            <a
              key={inst.name}
              href={inst.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 group-hover:text-primary">
                      {inst.name}
                    </span>
                    {inst.official && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        공식
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{inst.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{inst.url}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 신청 가이드 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          정책자금 신청 가이드
        </h2>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              자격 조건 확인
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">나이:</strong> 청년 지원은 만 19~39세 등 연령 제한 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">소득:</strong> 연 소득 기준 (예: 5천만원 이하)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">자산:</strong> 무주택자, 1주택자 등 주택 보유 여부</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">업종:</strong> 사업자의 경우 업종 제한 확인</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              필요 서류 준비
            </h3>
            <p className="text-gray-600 text-sm mb-2">일반적으로 필요한 서류:</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• 신분증, 주민등록등본</li>
              <li>• 소득 증빙 (재직증명서, 소득금액증명원 등)</li>
              <li>• 주택: 임대차계약서, 등기부등본</li>
              <li>• 사업자: 사업자등록증, 부가세 신고서 등</li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              신청 및 심사
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              각 기관 홈페이지 또는 <strong className="text-gray-900">취급 은행</strong>에서 신청합니다.
              정책자금은 일반 대출보다 <strong className="text-gray-900">심사 기간이 1~2주</strong> 소요될 수 있으니
              여유있게 신청하세요.
            </p>
          </div>
        </div>
      </section>

      {/* 주의사항 */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">정책자금 신청 시 주의사항</p>
            <ul className="text-amber-700 space-y-1">
              <li>• 정책자금은 <strong>예산 소진 시 조기 마감</strong>될 수 있습니다</li>
              <li>• 동일한 목적으로 <strong>중복 지원이 불가능</strong>한 경우가 많습니다</li>
              <li>• 허위 서류 제출 시 <strong>형사 처벌</strong> 대상이 될 수 있습니다</li>
              <li>• 정책자금은 <strong>용도가 지정</strong>되어 있어 다른 용도로 사용 불가</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <DisclaimerNotice message="본 페이지는 정책자금 안내를 위한 것으로, 정확한 자격 조건과 금리는 각 기관 홈페이지에서 확인하세요. 정책은 수시로 변경될 수 있습니다." />

      {/* 관련 링크 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">대상별 정책 안내</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/policy/youth"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">청년 금융 지원</p>
              <p className="text-xs text-gray-500 mt-0.5">만 19~39세 청년 대상</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/policy/small-business"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">소상공인 지원</p>
              <p className="text-xs text-gray-500 mt-0.5">자영업자·소상공인 대상</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
