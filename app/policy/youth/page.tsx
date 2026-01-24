'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle2, AlertTriangle, Info, ArrowLeft, ExternalLink, Home, GraduationCap, Briefcase, Wallet } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 청년 정책 데이터
interface YouthPolicy {
  id: string
  category: 'housing' | 'finance' | 'job' | 'education'
  name: string
  provider: string
  description: string
  benefit: string
  eligibility: string[]
  howToApply: string
  deadline?: string
  link?: string
}

const YOUTH_POLICIES: YouthPolicy[] = [
  // 주거
  {
    id: 'youth-jeonse',
    category: 'housing',
    name: '청년전용 버팀목전세대출',
    provider: '주택도시기금',
    description: '청년층을 위한 저금리 전세자금 대출',
    benefit: '연 1.5~2.9% 금리, 최대 2억원',
    eligibility: ['만 19~34세', '무주택 세대주', '연소득 5천만원 이하', '순자산 3.45억원 이하'],
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    link: 'https://nhuf.molit.go.kr'
  },
  {
    id: 'youth-monthly-rent',
    category: 'housing',
    name: '청년 월세 지원',
    provider: '국토교통부',
    description: '저소득 청년의 월세 부담 경감',
    benefit: '월 최대 20만원, 최대 12개월',
    eligibility: ['만 19~34세', '독립거주 무주택 청년', '소득 기준 충족', '보증금 5천만원/월세 60만원 이하'],
    howToApply: '마이홈포털 또는 주민센터 신청',
    link: 'https://www.myhome.go.kr'
  },
  {
    id: 'youth-housing-fund',
    category: 'housing',
    name: '청년우대형 주택청약종합저축',
    provider: '은행권',
    description: '청년 대상 우대금리 주택청약저축',
    benefit: '연 최대 4.5% 금리 (일반 2.1%)',
    eligibility: ['만 19~34세', '무주택세대주', '연소득 3,600만원 이하'],
    howToApply: '시중은행 영업점 방문 가입',
  },
  // 금융
  {
    id: 'youth-hope-savings',
    category: 'finance',
    name: '청년희망적금',
    provider: '서민금융진흥원',
    description: '청년 자산형성 지원 적금',
    benefit: '정부 저축장려금 최대 36만원 + 비과세',
    eligibility: ['만 19~34세', '개인소득 3,600만원 이하', '가구소득 중위 180% 이하'],
    howToApply: '시중은행 앱/홈페이지 신청',
  },
  {
    id: 'youth-tomorrow-savings',
    category: 'finance',
    name: '청년내일저축계좌',
    provider: '보건복지부',
    description: '저소득 청년 자산형성 지원',
    benefit: '본인 저축액 대비 정부 매칭 (월 10만원 저축 시 30만원 지원)',
    eligibility: ['만 19~34세', '기준중위소득 100% 이하', '근로/사업소득 있는 자'],
    howToApply: '복지로 또는 주민센터 신청',
    link: 'https://www.bokjiro.go.kr'
  },
  {
    id: 'youth-dream-loan',
    category: 'finance',
    name: '햇살론 유스',
    provider: '서민금융진흥원',
    description: '사회초년생/대학생 긴급생활자금',
    benefit: '연 3.5% 이내, 최대 1,200만원',
    eligibility: ['만 19~34세', '대학(원)생 또는 사회초년생', '소득/신용 요건'],
    howToApply: '서민금융통합지원센터 또는 온라인 신청',
    link: 'https://www.kinfa.or.kr'
  },
  // 취업
  {
    id: 'youth-job-incentive',
    category: 'job',
    name: '청년일자리도약장려금',
    provider: '고용노동부',
    description: '청년 정규직 채용 기업 지원',
    benefit: '청년 1인당 최대 1,200만원 (2년간)',
    eligibility: ['만 15~34세 청년 채용 기업', '5인 이상 중소/중견기업', '정규직 6개월 이상 채용'],
    howToApply: '고용24 홈페이지 신청',
    link: 'https://www.work24.go.kr'
  },
  {
    id: 'youth-internship',
    category: 'job',
    name: '청년 취업지원 프로그램',
    provider: '고용노동부',
    description: '취업 역량 강화 및 취업 연계',
    benefit: '월 최대 50만원 수당 + 취업 연계',
    eligibility: ['만 18~34세', '미취업 청년', '취업 의지 있는 자'],
    howToApply: '고용센터 방문 또는 워크넷 신청',
    link: 'https://www.work.go.kr'
  },
  // 교육
  {
    id: 'icl-loan',
    category: 'education',
    name: '취업 후 상환 학자금대출 (ICL)',
    provider: '한국장학재단',
    description: '졸업 후 소득 발생 시 상환',
    benefit: '연 1.7% (2024년), 등록금+생활비',
    eligibility: ['대학(원)생', '학자금지원 8구간 이하', '만 35세 이하'],
    howToApply: '한국장학재단 홈페이지',
    link: 'https://www.kosaf.go.kr'
  },
  {
    id: 'national-scholarship',
    category: 'education',
    name: '국가장학금',
    provider: '한국장학재단',
    description: '등록금 부담 경감을 위한 장학금',
    benefit: '소득구간별 최대 전액 (연 700만원)',
    eligibility: ['대학생', '학자금지원 8구간 이하', '성적 기준 충족'],
    howToApply: '한국장학재단 홈페이지',
    link: 'https://www.kosaf.go.kr'
  }
]

type CategoryType = 'all' | 'housing' | 'finance' | 'job' | 'education'

const CATEGORY_LABELS: Record<CategoryType, { label: string; icon: React.ReactNode }> = {
  all: { label: '전체', icon: <Users className="w-4 h-4" /> },
  housing: { label: '주거', icon: <Home className="w-4 h-4" /> },
  finance: { label: '금융/저축', icon: <Wallet className="w-4 h-4" /> },
  job: { label: '취업/창업', icon: <Briefcase className="w-4 h-4" /> },
  education: { label: '교육', icon: <GraduationCap className="w-4 h-4" /> }
}

export default function YouthPolicyPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)

  const filteredPolicies = selectedCategory === 'all'
    ? YOUTH_POLICIES
    : YOUTH_POLICIES.filter(p => p.category === selectedCategory)

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
          <Users className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          청년 금융 지원
        </h1>
        <p className="text-gray-600">
          청년을 위한 정부 및 공공기관의 금융 지원 제도
        </p>
        <p className="text-xs text-gray-400 mt-2">
          2026년 1월 기준 · 세부 조건은 변경될 수 있습니다
        </p>
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
                      <Users className="w-4 h-4 text-gray-500" />
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
          청년 정책, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              청년 기준 확인
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              정책마다 <strong className="text-gray-900">'청년' 기준이 다릅니다.</strong>
              대부분 만 19~34세이지만, 일부는 만 15세부터, 일부는 만 39세까지 포함합니다.
              병역 이행자는 복무 기간만큼 연령을 추가로 인정받을 수 있습니다.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              소득 기준 확인
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">개인소득:</strong> 본인의 연간 총 소득 (근로+사업+기타)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">가구소득:</strong> 가구원 전체의 소득 합산 (중위소득 기준)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">순자산:</strong> 자산에서 부채를 뺀 금액 (주택, 전세금 포함)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              중복 수혜 확인
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              일부 정책은 <strong className="text-gray-900">중복 수혜가 불가능</strong>합니다.
              예를 들어, 청년희망적금과 청년내일저축계좌는 동시 가입이 제한될 수 있습니다.
              신청 전 중복 가능 여부를 반드시 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* 체크리스트 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          청년 정책 신청 전 체크리스트
        </h2>
        <div className="bg-gray-50 border rounded-lg p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">나이, 소득, 자산 등 자격 요건을 충족하는지 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">신청 기간과 예산 잔액을 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">필요한 서류를 미리 준비했는지 (소득증명, 주민등록등본 등)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">다른 정책과 중복 수혜 가능한지 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">유지 조건 (취업, 저축 등)을 지킬 수 있는지 확인했는지</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 유용한 링크 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">청년 정책 통합 조회</p>
            <ul className="text-blue-700 space-y-1">
              <li>• <a href="https://www.youthcenter.go.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">온라인청년센터</a> - 청년 정책 통합 정보</li>
              <li>• <a href="https://www.gov.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">정부24</a> - 나에게 맞는 정책 찾기</li>
              <li>• <a href="https://www.bokjiro.go.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">복지로</a> - 복지 서비스 통합 신청</li>
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
            href="/policy/housing"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">주거 지원</p>
              <p className="text-xs text-gray-500 mt-0.5">전세·월세 지원</p>
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
