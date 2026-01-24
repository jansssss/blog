'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Landmark, CheckCircle2, AlertTriangle, Info, ArrowLeft, ExternalLink, Users, Home, Briefcase, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 정책자금 데이터
interface PolicyLoan {
  id: string
  category: 'housing' | 'business' | 'education' | 'living'
  name: string
  provider: string
  description: string
  interestRate: string
  maxAmount: string
  term: string
  eligibility: string[]
  features: string[]
  caution: string[]
  link?: string
}

const POLICY_LOANS: PolicyLoan[] = [
  // 주거
  {
    id: 'special-bogeumjari',
    category: 'housing',
    name: '특례보금자리론',
    provider: '한국주택금융공사',
    description: '무주택 실수요자를 위한 고정금리 장기 모기지',
    interestRate: '연 3.3~4.3%',
    maxAmount: '최대 5억원',
    term: '최대 50년',
    eligibility: ['무주택자 또는 1주택자 (처분 조건)', '주택가격 9억원 이하', '부부합산 연소득 1억원 이하'],
    features: ['고정금리로 안정적', '최대 50년 초장기', '중도상환수수료 면제'],
    caution: ['소득/주택가격 제한', '실거주 의무', '대출 한도 제한']
  },
  {
    id: 'youth-jeonse',
    category: 'housing',
    name: '청년전용 버팀목전세대출',
    provider: '주택도시기금',
    description: '청년층을 위한 저금리 전세자금 대출',
    interestRate: '연 1.5~2.9%',
    maxAmount: '최대 2억원 (수도권)',
    term: '2년 (최대 4회 연장, 10년)',
    eligibility: ['만 19~34세', '무주택 세대주', '연소득 5천만원 이하', '순자산 3.45억원 이하'],
    features: ['매우 낮은 금리', '장기 연장 가능', '보증료 지원'],
    caution: ['소득/나이 제한', '전세금 제한', '서류 준비 필요']
  },
  {
    id: 'newlywed-jeonse',
    category: 'housing',
    name: '신혼부부 전용 전세대출',
    provider: '주택도시기금',
    description: '신혼부부를 위한 우대금리 전세대출',
    interestRate: '연 1.5~2.7%',
    maxAmount: '최대 3억원 (수도권)',
    term: '2년 (최대 4회 연장, 10년)',
    eligibility: ['혼인 7년 이내 또는 예비 신혼부부', '무주택 세대주', '부부합산 연소득 6천만원 이하'],
    features: ['청년 대출보다 높은 한도', '다자녀 추가 우대', '출산 시 금리 인하'],
    caution: ['혼인 기간 제한', '소득 제한', '주택 규모 제한']
  },
  // 사업자
  {
    id: 'startup-guarantee',
    category: 'business',
    name: '창업기업 보증부 대출',
    provider: '신용보증기금/기술보증기금',
    description: '창업 초기 기업을 위한 정책 보증 대출',
    interestRate: '연 3~5%대',
    maxAmount: '최대 10억원',
    term: '최대 10년',
    eligibility: ['창업 7년 이내 기업', '사업자등록증', '사업계획서'],
    features: ['담보 없이 신용 대출', '정부 보증', '저금리'],
    caution: ['심사 기간 소요', '사업성 평가', '보증료 발생']
  },
  {
    id: 'small-biz-loan',
    category: 'business',
    name: '소상공인 정책자금',
    provider: '소상공인시장진흥공단',
    description: '소상공인을 위한 운전/시설 자금',
    interestRate: '연 2~3%대 (정책금리)',
    maxAmount: '업종별 1~2억원',
    term: '5~8년',
    eligibility: ['소상공인 기준 충족', '신용등급 7등급 이상', '업력 제한 없음'],
    features: ['초저금리', '거치 기간 제공', '다양한 자금 용도'],
    caution: ['예산 소진 시 조기 마감', '심사 까다로움', '필수 교육 이수']
  },
  // 교육
  {
    id: 'student-loan',
    category: 'education',
    name: '취업 후 상환 학자금대출 (ICL)',
    provider: '한국장학재단',
    description: '졸업 후 소득 발생 시 상환하는 학자금 대출',
    interestRate: '연 1.7% (2024년 기준)',
    maxAmount: '등록금 + 생활비 (연 400만원)',
    term: '졸업 후 소득 발생 시까지',
    eligibility: ['대학생/대학원생', '학자금지원 8구간 이하', '만 35세 이하'],
    features: ['취업 후 상환', '소득 연계 상환', '초저금리'],
    caution: ['소득구간 제한', '상환 기간 무기한', '상환 부담']
  },
  {
    id: 'general-student-loan',
    category: 'education',
    name: '일반 상환 학자금대출',
    provider: '한국장학재단',
    description: '재학 중 또는 졸업 후 일정 기간 상환하는 학자금 대출',
    interestRate: '연 2.7% (2024년 기준)',
    maxAmount: '등록금 전액 + 생활비',
    term: '최대 10~20년',
    eligibility: ['대학생/대학원생', '소득구간 제한 완화', '신용요건 충족'],
    features: ['높은 한도', '다양한 상환 방식', 'ICL보다 유연'],
    caution: ['ICL보다 높은 금리', '재학 중 이자 발생 가능', '신용 영향']
  },
  // 생활
  {
    id: 'sunflower-loan',
    category: 'living',
    name: '햇살론15',
    provider: '서민금융진흥원',
    description: '저소득 서민을 위한 소액 생활안정 대출',
    interestRate: '연 15.9% 이내',
    maxAmount: '최대 700만원',
    term: '최대 5년',
    eligibility: ['연소득 3,500만원 이하', '신용점수 하위 20%', '근로/사업소득자'],
    features: ['신용점수 낮아도 가능', '빠른 심사', '대안 금융'],
    caution: ['금리가 높은 편', '한도 제한', '상환 부담']
  },
  {
    id: 'miso-finance',
    category: 'living',
    name: '미소금융',
    provider: '미소금융중앙재단',
    description: '저소득/저신용자를 위한 창업/운영 자금',
    interestRate: '연 2~4.5%',
    maxAmount: '최대 7천만원',
    term: '최대 6년',
    eligibility: ['기초생활수급자', '차상위계층', '저신용자 등'],
    features: ['초저금리', '담보 불필요', '창업 지원'],
    caution: ['대상 제한', '심사 기간', '사후 관리']
  }
]

type CategoryType = 'all' | 'housing' | 'business' | 'education' | 'living'

const CATEGORY_LABELS: Record<CategoryType, { label: string; icon: React.ReactNode; description: string }> = {
  all: { label: '전체', icon: <Landmark className="w-4 h-4" />, description: '모든 정책자금' },
  housing: { label: '주거', icon: <Home className="w-4 h-4" />, description: '전세, 주택구입' },
  business: { label: '사업', icon: <Briefcase className="w-4 h-4" />, description: '창업, 운영자금' },
  education: { label: '교육', icon: <GraduationCap className="w-4 h-4" />, description: '학자금' },
  living: { label: '생활', icon: <Users className="w-4 h-4" />, description: '생활안정 자금' }
}

export default function PolicyLoansPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)

  const filteredLoans = selectedCategory === 'all'
    ? POLICY_LOANS
    : POLICY_LOANS.filter(l => l.category === selectedCategory)

  return (
    <div className="container py-8 max-w-5xl">
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
          정책자금 비교
        </h1>
        <p className="text-gray-600">
          정부 및 공공기관의 저금리 정책자금을 한눈에 비교해보세요
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

      {/* 상품 목록 */}
      <div className="space-y-4 mb-8">
        {filteredLoans.map((loan) => (
          <Card
            key={loan.id}
            className={`transition-all ${expandedLoan === loan.id ? 'border-primary shadow-md' : ''}`}
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                      {CATEGORY_LABELS[loan.category].label}
                    </span>
                    <span className="text-xs text-gray-500">{loan.provider}</span>
                  </div>
                  <CardTitle className="text-lg">{loan.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{loan.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-primary">{loan.interestRate}</p>
                  <p className="text-xs text-gray-500">{loan.maxAmount}</p>
                </div>
              </div>
            </CardHeader>

            {expandedLoan === loan.id && (
              <CardContent className="pt-0 border-t">
                <div className="grid gap-4 mt-4">
                  {/* 기본 정보 */}
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">금리</p>
                      <p className="font-medium text-gray-900">{loan.interestRate}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">한도</p>
                      <p className="font-medium text-gray-900">{loan.maxAmount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">기간</p>
                      <p className="font-medium text-gray-900">{loan.term}</p>
                    </div>
                  </div>

                  {/* 자격 요건 */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      자격 요건
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {loan.eligibility.map((req, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-400" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* 특징 */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        주요 특징
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {loan.features.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 유의사항 */}
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        유의사항
                      </h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {loan.caution.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
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
          정책자금, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              정책자금의 장점
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">저금리:</strong> 시중 금리보다 1~3%p 낮은 금리</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">장기 상환:</strong> 최대 50년까지 장기 상환 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">정부 보증:</strong> 담보 부족해도 정부 보증으로 대출 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span><strong className="text-gray-900">수수료 면제:</strong> 중도상환수수료 등 각종 수수료 면제</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              신청 전 확인사항
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">자격 요건:</strong> 소득, 나이, 재산 등 자격 조건을 꼼꼼히 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">예산 확인:</strong> 정책자금은 예산 소진 시 조기 마감될 수 있음</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">필요 서류:</strong> 소득증명, 재직증명 등 서류 미리 준비</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">심사 기간:</strong> 시중 대출보다 심사 기간이 길 수 있음</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              주요 신청처
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 text-sm">주거 관련</p>
                <p className="text-blue-700 text-xs mt-1">한국주택금융공사, 주택도시기금</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 text-sm">창업/사업 관련</p>
                <p className="text-green-700 text-xs mt-1">신용보증기금, 소상공인시장진흥공단</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-800 text-sm">학자금 관련</p>
                <p className="text-purple-700 text-xs mt-1">한국장학재단</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="font-medium text-amber-800 text-sm">생활안정 관련</p>
                <p className="text-amber-700 text-xs mt-1">서민금융진흥원, 미소금융</p>
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
              <span className="text-gray-700">자격 요건 (소득, 나이, 재산)을 모두 충족하는지 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">필요한 서류를 미리 준비했는지 (소득증명, 주민등록등본 등)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">시중 대출과 금리/조건을 비교해봤는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">예산 잔액 및 신청 마감일을 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">상환 계획을 세웠는지 (거치 기간, 분할 상환 등)</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 주의사항 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">정책자금 활용 팁</p>
            <ul className="text-blue-700 space-y-1">
              <li>• 연초 또는 예산 배정 직후에 신청하면 승인 가능성이 높습니다</li>
              <li>• 여러 정책자금을 중복으로 신청할 수 있는지 확인하세요</li>
              <li>• 자격이 안 되면 시중 대출과 비교하여 유리한 조건을 찾으세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <div className="mt-6">
        <DisclaimerNotice message="정책자금 정보는 변경될 수 있습니다. 정확한 자격 요건과 신청 방법은 각 기관에 직접 문의하세요." />
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">관련 도구</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/compare/loan-products"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">대출 상품 비교</p>
              <p className="text-xs text-gray-500 mt-0.5">시중 대출과 비교</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/calculator/loan-limit"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">대출 한도 시뮬레이터</p>
              <p className="text-xs text-gray-500 mt-0.5">예상 한도 확인</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
