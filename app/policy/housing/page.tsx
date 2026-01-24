'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, CheckCircle2, Info, ArrowLeft, ExternalLink, Key, Building, Wallet, Users } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 주거 정책 데이터
interface HousingPolicy {
  id: string
  category: 'jeonse' | 'monthly' | 'purchase' | 'public'
  name: string
  provider: string
  description: string
  benefit: string
  eligibility: string[]
  howToApply: string
  link?: string
}

const HOUSING_POLICIES: HousingPolicy[] = [
  // 전세
  {
    id: 'general-jeonse',
    category: 'jeonse',
    name: '버팀목전세대출',
    provider: '주택도시기금',
    description: '무주택 서민을 위한 전세자금 대출',
    benefit: '연 2.1~3.0%, 수도권 최대 3억원',
    eligibility: ['무주택세대주', '연소득 6천만원 이하', '순자산 3.61억원 이하'],
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행',
    link: 'https://nhuf.molit.go.kr'
  },
  {
    id: 'youth-jeonse',
    category: 'jeonse',
    name: '청년전용 버팀목전세대출',
    provider: '주택도시기금',
    description: '청년층 특별 우대 전세대출',
    benefit: '연 1.5~2.9%, 최대 2억원',
    eligibility: ['만 19~34세', '무주택', '연소득 5천만원 이하'],
    howToApply: '주택도시기금 홈페이지',
    link: 'https://nhuf.molit.go.kr'
  },
  {
    id: 'newlywed-jeonse',
    category: 'jeonse',
    name: '신혼부부전용 전세대출',
    provider: '주택도시기금',
    description: '신혼부부 우대 전세대출',
    benefit: '연 1.5~2.7%, 수도권 최대 3억원',
    eligibility: ['혼인 7년 이내', '무주택', '부부합산 연소득 6천만원 이하'],
    howToApply: '주택도시기금 홈페이지',
    link: 'https://nhuf.molit.go.kr'
  },
  {
    id: 'deposit-return-guarantee',
    category: 'jeonse',
    name: '전세보증금반환보증',
    provider: '주택도시보증공사(HUG)',
    description: '전세보증금 미반환 시 보증',
    benefit: '보증금 100% 보호 (수수료 0.115%~)',
    eligibility: ['전세 임차인', '적격 주택', '보증료 납부'],
    howToApply: '주택도시보증공사 또는 은행',
    link: 'https://www.khug.or.kr'
  },
  // 월세
  {
    id: 'youth-monthly-rent',
    category: 'monthly',
    name: '청년 월세지원',
    provider: '국토교통부',
    description: '저소득 청년 월세 지원',
    benefit: '월 최대 20만원, 12개월',
    eligibility: ['만 19~34세', '독립거주 무주택', '소득 기준 충족'],
    howToApply: '마이홈포털 또는 주민센터',
    link: 'https://www.myhome.go.kr'
  },
  {
    id: 'monthly-rent-loan',
    category: 'monthly',
    name: '주거안정 월세대출',
    provider: '주택도시기금',
    description: '저소득층 월세 대출',
    benefit: '월 60만원 이내, 연 1.5~2.5%',
    eligibility: ['무주택세대주', '연소득 5천만원 이하', '월세 60만원 이하'],
    howToApply: '주택도시기금 홈페이지',
    link: 'https://nhuf.molit.go.kr'
  },
  {
    id: 'housing-voucher',
    category: 'monthly',
    name: '주거급여',
    provider: '국토교통부',
    description: '저소득층 임차료/수선비 지원',
    benefit: '지역별 최대 51만원/월',
    eligibility: ['중위소득 47% 이하', '무주택 임차가구'],
    howToApply: '주민센터 신청',
    link: 'https://www.bokjiro.go.kr'
  },
  // 구입
  {
    id: 'special-bogeumjari',
    category: 'purchase',
    name: '특례보금자리론',
    provider: '한국주택금융공사',
    description: '실수요자 고정금리 장기 모기지',
    benefit: '연 3.3~4.3%, 최대 5억원',
    eligibility: ['무주택 또는 1주택자', '주택가격 9억 이하', '소득 요건'],
    howToApply: '한국주택금융공사 또는 은행',
    link: 'https://www.hf.go.kr'
  },
  {
    id: 'didimdol-loan',
    category: 'purchase',
    name: '디딤돌대출',
    provider: '주택도시기금',
    description: '서민 주택구입자금 대출',
    benefit: '연 2.45~3.55%, 최대 2.6억원',
    eligibility: ['무주택세대주', '연소득 6천만원 이하', '주택가격 5억 이하'],
    howToApply: '주택도시기금 홈페이지',
    link: 'https://nhuf.molit.go.kr'
  },
  {
    id: 'newlywed-purchase',
    category: 'purchase',
    name: '신혼부부전용 주택구입자금',
    provider: '주택도시기금',
    description: '신혼부부 주택구입 지원',
    benefit: '연 1.85~2.7%, 최대 4억원',
    eligibility: ['혼인 7년 이내', '무주택', '부부합산 연소득 8.5천만원 이하'],
    howToApply: '주택도시기금 홈페이지',
    link: 'https://nhuf.molit.go.kr'
  },
  // 공공주택
  {
    id: 'public-rental',
    category: 'public',
    name: '공공임대주택',
    provider: 'LH/SH 등',
    description: '시세 이하 공공임대 주택',
    benefit: '시세 30~80% 수준 임대료',
    eligibility: ['무주택세대구성원', '소득/자산 기준', '지역 거주 요건'],
    howToApply: 'LH청약센터',
    link: 'https://apply.lh.or.kr'
  },
  {
    id: 'happy-house',
    category: 'public',
    name: '행복주택',
    provider: 'LH',
    description: '청년/신혼부부 맞춤형 임대주택',
    benefit: '시세 60~80%, 최대 10년 거주',
    eligibility: ['청년/신혼부부/사회초년생', '소득 기준', '자산 기준'],
    howToApply: 'LH청약센터',
    link: 'https://apply.lh.or.kr'
  },
  {
    id: 'public-sale',
    category: 'public',
    name: '공공분양주택',
    provider: 'LH/지자체',
    description: '시세 이하 분양 주택',
    benefit: '시세 70~80% 분양가',
    eligibility: ['무주택세대구성원', '청약통장 가입', '소득/자산 기준'],
    howToApply: '청약홈',
    link: 'https://www.applyhome.co.kr'
  }
]

type CategoryType = 'all' | 'jeonse' | 'monthly' | 'purchase' | 'public'

const CATEGORY_LABELS: Record<CategoryType, { label: string; icon: React.ReactNode }> = {
  all: { label: '전체', icon: <Home className="w-4 h-4" /> },
  jeonse: { label: '전세', icon: <Key className="w-4 h-4" /> },
  monthly: { label: '월세', icon: <Wallet className="w-4 h-4" /> },
  purchase: { label: '주택구입', icon: <Building className="w-4 h-4" /> },
  public: { label: '공공주택', icon: <Users className="w-4 h-4" /> }
}

export default function HousingPolicyPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)

  const filteredPolicies = selectedCategory === 'all'
    ? HOUSING_POLICIES
    : HOUSING_POLICIES.filter(p => p.category === selectedCategory)

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
          <Home className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          주거 지원 (전세·월세)
        </h1>
        <p className="text-gray-600">
          전세, 월세 등 주거 안정을 위한 금융 지원
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
                      <Home className="w-4 h-4 text-gray-500" />
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
          주거 지원, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              전세대출 vs 월세지원
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 text-sm mb-1">전세대출</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>✓ 보증금을 대출받아 전세 입주</li>
                  <li>✓ 금리만 부담 (월세보다 저렴)</li>
                  <li>✓ 보증보험 가입 필수</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 text-sm mb-1">월세지원</p>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>✓ 월세 일부를 지원금으로</li>
                  <li>✓ 상환 부담 없음</li>
                  <li>✓ 소득 기준 엄격</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              전세보증보험 필수!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              전세계약 시 <strong className="text-gray-900">전세보증금반환보증</strong> 가입을 강력히 권장합니다.
              집주인이 보증금을 돌려주지 못하는 경우, 보증기관에서 대신 지급해줍니다.
            </p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">HUG:</strong> 전세금 5억원 이하, 보증료 0.115%~</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">SGI:</strong> 다양한 보증 상품</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              우대금리 받는 방법
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">청년:</strong> 청년전용 상품 (최대 1%p 우대)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">신혼부부:</strong> 신혼부부전용 상품</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">다자녀:</strong> 자녀 수에 따라 추가 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">저소득:</strong> 소득이 낮을수록 금리 우대</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 체크리스트 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          주거 지원 신청 전 체크리스트
        </h2>
        <div className="bg-gray-50 border rounded-lg p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">무주택 세대주/세대원 요건을 충족하는지 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">소득 기준 (개인/부부합산)과 자산 기준 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">전세/월세 금액이 지역별 한도 이내인지 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">임대차계약서, 주민등록등본 등 서류 준비</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">전세보증보험 가입 가능 여부 확인</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 유용한 링크 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">주거 지원 통합 조회</p>
            <ul className="text-blue-700 space-y-1">
              <li>• <a href="https://www.myhome.go.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">마이홈포털</a> - 주거 지원 통합 정보</li>
              <li>• <a href="https://nhuf.molit.go.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">주택도시기금</a> - 전세/구입 대출</li>
              <li>• <a href="https://apply.lh.or.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">LH청약센터</a> - 공공주택 청약</li>
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
            href="/policy/youth"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">청년 지원</p>
              <p className="text-xs text-gray-500 mt-0.5">청년 금융 지원</p>
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
