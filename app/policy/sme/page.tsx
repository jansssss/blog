'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, CheckCircle2, Info, ArrowLeft, ExternalLink, Wallet, Shield, Factory, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 중소기업 정책 데이터
interface SMEPolicy {
  id: string
  category: 'loan' | 'guarantee' | 'rd' | 'export'
  name: string
  provider: string
  description: string
  benefit: string
  eligibility: string[]
  howToApply: string
  link?: string
}

const SME_POLICIES: SMEPolicy[] = [
  // 대출
  {
    id: 'sme-innovation-fund',
    category: 'loan',
    name: '중소기업 혁신성장자금',
    provider: '중소벤처기업진흥공단',
    description: '혁신형 중소기업 성장 지원',
    benefit: '연 2~3%대, 최대 100억원',
    eligibility: ['중소기업 기준 충족', '혁신형 기업 (이노비즈, 메인비즈 등)', '성장성 평가 통과'],
    howToApply: '중소벤처기업진흥공단 홈페이지',
    link: 'https://www.kosmes.or.kr'
  },
  {
    id: 'sme-facility-fund',
    category: 'loan',
    name: '시설자금 대출',
    provider: '중소벤처기업진흥공단',
    description: '공장, 설비, 기계 등 시설투자',
    benefit: '연 2~3%대, 최대 60억원',
    eligibility: ['중소기업', '시설투자 계획', '담보/보증 요건'],
    howToApply: '중소벤처기업진흥공단 홈페이지',
    link: 'https://www.kosmes.or.kr'
  },
  {
    id: 'sme-startup-fund',
    category: 'loan',
    name: '창업기업 지원자금',
    provider: '중소벤처기업진흥공단',
    description: '창업 7년 이내 기업 지원',
    benefit: '연 2~3%대, 최대 10억원',
    eligibility: ['창업 7년 이내', '중소기업', '사업성 평가'],
    howToApply: '중소벤처기업진흥공단 홈페이지',
    link: 'https://www.kosmes.or.kr'
  },
  // 보증
  {
    id: 'kodit-guarantee',
    category: 'guarantee',
    name: '신용보증기금 일반보증',
    provider: '신용보증기금',
    description: '중소기업 신용보증 지원',
    benefit: '보증비율 최대 100%, 최대 30억원',
    eligibility: ['중소기업', '신용평가 통과', '업력 요건'],
    howToApply: '신용보증기금 지점 방문',
    link: 'https://www.kodit.co.kr'
  },
  {
    id: 'kibo-guarantee',
    category: 'guarantee',
    name: '기술보증기금 기술보증',
    provider: '기술보증기금',
    description: '기술력 기반 신용보증',
    benefit: '보증비율 최대 100%, 최대 30억원',
    eligibility: ['기술력 보유 중소기업', '기술평가 통과', 'R&D 실적'],
    howToApply: '기술보증기금 지점 방문',
    link: 'https://www.kibo.or.kr'
  },
  {
    id: 'venture-guarantee',
    category: 'guarantee',
    name: '벤처기업 특례보증',
    provider: '신용보증기금/기술보증기금',
    description: '벤처기업 우대 보증',
    benefit: '보증료 감면 (0.3%p), 한도 우대',
    eligibility: ['벤처기업 인증', '기술평가 통과', '성장성 입증'],
    howToApply: '각 보증기관 지점',
  },
  // R&D
  {
    id: 'rd-voucher',
    category: 'rd',
    name: 'R&D 바우처',
    provider: '중소벤처기업부',
    description: '중소기업 R&D 비용 지원',
    benefit: '최대 1억원 (자부담 25%)',
    eligibility: ['중소기업', 'R&D 수요', '기술개발 계획'],
    howToApply: '중소기업기술정보진흥원',
    link: 'https://www.tipa.or.kr'
  },
  {
    id: 'rd-shared',
    category: 'rd',
    name: '공동기술개발사업',
    provider: '중소벤처기업부',
    description: '대학/연구소와 공동 R&D',
    benefit: '최대 3억원 (정부 75%)',
    eligibility: ['중소기업', '공동연구 협약', '기술개발 계획'],
    howToApply: '중소기업기술정보진흥원',
    link: 'https://www.tipa.or.kr'
  },
  {
    id: 'innovation-certificate',
    category: 'rd',
    name: '이노비즈/메인비즈 인증',
    provider: '중소벤처기업부',
    description: '기술/경영혁신 기업 인증',
    benefit: '정책자금 우대, 보증 우대, 세제 혜택',
    eligibility: ['중소기업', '기술/경영 혁신 실적', '평가 통과'],
    howToApply: '이노비즈협회/메인비즈협회',
    link: 'https://www.innobiz.or.kr'
  },
  // 수출
  {
    id: 'export-voucher',
    category: 'export',
    name: '수출바우처',
    provider: 'KOTRA',
    description: '수출 역량 강화 비용 지원',
    benefit: '최대 1억원 (자부담 30%)',
    eligibility: ['수출 의지 중소기업', '수출 계획', '자부담 가능'],
    howToApply: 'KOTRA 수출바우처 플랫폼',
    link: 'https://www.exportvoucher.com'
  },
  {
    id: 'trade-insurance',
    category: 'export',
    name: '무역보험',
    provider: '한국무역보험공사',
    description: '수출 대금 미회수 위험 보장',
    benefit: '수출액의 95% 보상',
    eligibility: ['수출 중소기업', '신용조사 통과', '보험료 납부'],
    howToApply: '한국무역보험공사',
    link: 'https://www.ksure.or.kr'
  }
]

type CategoryType = 'all' | 'loan' | 'guarantee' | 'rd' | 'export'

const CATEGORY_LABELS: Record<CategoryType, { label: string; icon: React.ReactNode }> = {
  all: { label: '전체', icon: <Building2 className="w-4 h-4" /> },
  loan: { label: '정책자금', icon: <Wallet className="w-4 h-4" /> },
  guarantee: { label: '보증', icon: <Shield className="w-4 h-4" /> },
  rd: { label: 'R&D', icon: <Lightbulb className="w-4 h-4" /> },
  export: { label: '수출', icon: <Factory className="w-4 h-4" /> }
}

export default function SMEPolicyPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)

  const filteredPolicies = selectedCategory === 'all'
    ? SME_POLICIES
    : SME_POLICIES.filter(p => p.category === selectedCategory)

  return (
    <div className="container py-8 max-w-5xl">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link href="/policy" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" />
          정책 지원 정보
        </Link>
      </div>

      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          중소기업 정책자금
        </h1>
        <p className="text-gray-600">
          중소기업을 위한 정책자금 및 금융 지원
        </p>
        <p className="text-xs text-gray-400 mt-2">
          2026년 1월 기준 · 세부 조건은 변경될 수 있습니다
        </p>
      </div>

      {/* 중소기업 기준 안내 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">중소기업 기준 (업종별 상이)</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 제조업: 상시 근로자 300인 미만 또는 자본금 80억원 이하</li>
          <li>• 서비스업: 상시 근로자 300인 미만 또는 매출 300억원 이하</li>
          <li>• 세부 기준은 업종별로 다르니 중기부 확인 필요</li>
        </ul>
      </div>

      {/* 카테고리 선택 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
            size="sm"
            className="flex items-center gap-1.5"
          >
            {CATEGORY_LABELS[cat].icon}
            {CATEGORY_LABELS[cat].label}
          </Button>
        ))}
      </div>

      {/* 정책 목록 */}
      <div className="space-y-4 mb-8">
        {filteredPolicies.map((policy) => (
          <Card
            key={policy.id}
            className={`transition-all ${expandedPolicy === policy.id ? 'border-primary shadow-md' : ''}`}
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                      {CATEGORY_LABELS[policy.category].label}
                    </span>
                    <span className="text-xs text-gray-500">{policy.provider}</span>
                  </div>
                  <CardTitle className="text-lg">{policy.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{policy.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-primary">{policy.benefit.split(',')[0]}</p>
                </div>
              </div>
            </CardHeader>

            {expandedPolicy === policy.id && (
              <CardContent className="pt-0 border-t">
                <div className="grid gap-4 mt-4">
                  {/* 혜택 */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 mb-1">지원 내용</h4>
                    <p className="text-sm text-green-700">{policy.benefit}</p>
                  </div>

                  {/* 자격 요건 */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      자격 요건
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {policy.eligibility.map((req, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 신청 방법 */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">신청 방법</h4>
                    <p className="text-sm text-blue-700">{policy.howToApply}</p>
                    {policy.link && (
                      <a
                        href={policy.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        바로가기
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* 가이드 콘텐츠 */}
      <section className="border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          중소기업 정책자금, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              정책자금 유형
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800 text-sm mb-1">운전자금</p>
                <p className="text-gray-600 text-xs">원자재, 인건비, 운영비 등 일상 경영 자금</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800 text-sm mb-1">시설자금</p>
                <p className="text-gray-600 text-xs">공장, 기계, 설비 등 시설투자 자금</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800 text-sm mb-1">창업자금</p>
                <p className="text-gray-600 text-xs">창업 7년 이내 기업 성장 지원</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800 text-sm mb-1">R&D자금</p>
                <p className="text-gray-600 text-xs">기술개발, 연구 비용 지원</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              기업 인증 활용
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">이노비즈:</strong> 기술혁신형 중소기업, 정책자금 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">메인비즈:</strong> 경영혁신형 중소기업, 보증 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">벤처기업:</strong> 기술평가 우수 기업, 세제 혜택</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">강소기업:</strong> 성장 잠재력 기업, 종합 지원</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              보증기관 선택
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 text-sm mb-1">신용보증기금</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>✓ 일반 중소기업 신용보증</li>
                  <li>✓ 유동화 보증, 이행보증</li>
                  <li>✓ 전국 지점 운영</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 text-sm mb-1">기술보증기금</p>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>✓ 기술력 기반 보증</li>
                  <li>✓ R&D, 특허 보유 기업 우대</li>
                  <li>✓ 기술평가 전문</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 체크리스트 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          정책자금 신청 전 체크리스트
        </h2>
        <div className="bg-gray-50 border rounded-lg p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">중소기업 기준 (업종별 근로자 수, 매출액)을 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">재무제표, 사업계획서, 기술자료 등 서류 준비</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">기업 인증 (이노비즈, 벤처 등) 취득 여부 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">기존 대출/보증 현황 및 잔여 한도 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">담보 또는 연대보증인 준비 여부 확인</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 유용한 링크 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">중소기업 지원 통합 조회</p>
            <ul className="text-blue-700 space-y-1">
              <li>• <a href="https://www.kosmes.or.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">중소벤처기업진흥공단</a> - 정책자금 신청</li>
              <li>• <a href="https://www.bizinfo.go.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">기업마당</a> - 중소기업 지원사업 통합</li>
              <li>• <a href="https://www.mss.go.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">중소벤처기업부</a> - 정책 정보</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <div className="mt-6">
        <DisclaimerNotice message="정책 정보는 변경될 수 있습니다. 정확한 자격 요건과 신청 방법은 각 기관에 직접 문의하세요." />
      </div>

      {/* 관련 페이지 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">다른 정책 지원</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/policy/small-business"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">소상공인 지원</p>
              <p className="text-xs text-gray-500 mt-0.5">소상공인·자영업자</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/compare/policy-loans"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">정책자금 비교</p>
              <p className="text-xs text-gray-500 mt-0.5">정부 지원 대출 비교</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
