'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, CheckCircle2, Info, ArrowLeft, ExternalLink, Wallet, Building2, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 소상공인 정책 데이터
interface SmallBizPolicy {
  id: string
  category: 'loan' | 'guarantee' | 'subsidy' | 'consulting'
  name: string
  provider: string
  description: string
  benefit: string
  eligibility: string[]
  howToApply: string
  link?: string
}

const SMALL_BIZ_POLICIES: SmallBizPolicy[] = [
  // 대출
  {
    id: 'sbiz-policy-fund',
    category: 'loan',
    name: '소상공인 정책자금',
    provider: '소상공인시장진흥공단',
    description: '소상공인 운전/시설 자금 지원',
    benefit: '연 2~3%대, 최대 2억원',
    eligibility: ['소상공인 기준 충족', '업력 제한 없음', '신용등급 7등급 이상'],
    howToApply: '소상공인시장진흥공단 홈페이지 신청',
    link: 'https://www.semas.or.kr'
  },
  {
    id: 'sbiz-emergency',
    category: 'loan',
    name: '긴급경영안정자금',
    provider: '소상공인시장진흥공단',
    description: '재해/재난 피해 소상공인 긴급 지원',
    benefit: '연 2% 이내, 최대 1억원',
    eligibility: ['재해/재난 피해 소상공인', '피해 확인서 발급', '업력 1년 이상'],
    howToApply: '소상공인시장진흥공단 지역센터',
    link: 'https://www.semas.or.kr'
  },
  {
    id: 'sbiz-special-loan',
    category: 'loan',
    name: '특별경영지원자금',
    provider: '소상공인시장진흥공단',
    description: '경영 위기 소상공인 특별 지원',
    benefit: '연 2~3%대, 최대 7천만원',
    eligibility: ['매출 감소 소상공인', '고용 유지 조건', '업력 6개월 이상'],
    howToApply: '소상공인시장진흥공단 온라인 신청',
    link: 'https://www.semas.or.kr'
  },
  // 보증
  {
    id: 'credit-guarantee',
    category: 'guarantee',
    name: '신용보증기금 소상공인 보증',
    provider: '신용보증기금',
    description: '담보 없이 신용으로 대출 보증',
    benefit: '보증비율 85~100%, 최대 5억원',
    eligibility: ['소상공인 기준 충족', '업력 3개월 이상', '신용평가 통과'],
    howToApply: '신용보증기금 지점 방문',
    link: 'https://www.kodit.co.kr'
  },
  {
    id: 'region-guarantee',
    category: 'guarantee',
    name: '지역신용보증재단 보증',
    provider: '지역신용보증재단',
    description: '지역 소상공인 맞춤형 보증',
    benefit: '보증비율 85~100%, 최대 3억원',
    eligibility: ['해당 지역 사업자', '업력 3개월 이상', '신용평가 통과'],
    howToApply: '지역 신용보증재단 방문',
    link: 'https://www.koreg.or.kr'
  },
  // 보조금/지원금
  {
    id: 'digital-voucher',
    category: 'subsidy',
    name: '디지털 전환 바우처',
    provider: '소상공인시장진흥공단',
    description: '디지털 기술 도입 비용 지원',
    benefit: '최대 400만원 (자부담 30%)',
    eligibility: ['소상공인', '디지털 기술 도입 희망', '중복 지원 제한'],
    howToApply: '소상공인마당 홈페이지',
    link: 'https://www.sbiz.or.kr'
  },
  {
    id: 'online-market-support',
    category: 'subsidy',
    name: '온라인 판로 지원',
    provider: '소상공인시장진흥공단',
    description: '온라인 쇼핑몰 입점/마케팅 지원',
    benefit: '입점 수수료 지원, 마케팅 비용',
    eligibility: ['제조/유통 소상공인', '온라인 판매 희망', '사업자등록증'],
    howToApply: '소상공인마당 홈페이지',
    link: 'https://www.sbiz.or.kr'
  },
  {
    id: 'employment-subsidy',
    category: 'subsidy',
    name: '고용유지지원금',
    provider: '고용노동부',
    description: '고용 유지 소상공인 인건비 지원',
    benefit: '휴업수당의 90% 지원',
    eligibility: ['매출 감소 사업장', '휴업/휴직 실시', '고용보험 가입'],
    howToApply: '고용24 홈페이지',
    link: 'https://www.work24.go.kr'
  },
  // 컨설팅
  {
    id: 'management-consulting',
    category: 'consulting',
    name: '경영개선 컨설팅',
    provider: '소상공인시장진흥공단',
    description: '전문가 1:1 경영 컨설팅',
    benefit: '무료 컨설팅 (연 2회)',
    eligibility: ['소상공인', '경영 개선 희망', '컨설팅 이력 확인'],
    howToApply: '소상공인시장진흥공단 신청',
    link: 'https://www.semas.or.kr'
  },
  {
    id: 'startup-coaching',
    category: 'consulting',
    name: '소상공인 창업교육',
    provider: '소상공인시장진흥공단',
    description: '예비/초기 창업자 교육 프로그램',
    benefit: '무료 교육 + 정책자금 가점',
    eligibility: ['예비 창업자', '업력 3년 이내', '교육 의지'],
    howToApply: '소상공인마당 홈페이지',
    link: 'https://www.sbiz.or.kr'
  }
]

type CategoryType = 'all' | 'loan' | 'guarantee' | 'subsidy' | 'consulting'

const CATEGORY_LABELS: Record<CategoryType, { label: string; icon: React.ReactNode }> = {
  all: { label: '전체', icon: <Briefcase className="w-4 h-4" /> },
  loan: { label: '대출', icon: <Wallet className="w-4 h-4" /> },
  guarantee: { label: '보증', icon: <Shield className="w-4 h-4" /> },
  subsidy: { label: '보조금', icon: <TrendingUp className="w-4 h-4" /> },
  consulting: { label: '컨설팅', icon: <Building2 className="w-4 h-4" /> }
}

export default function SmallBusinessPolicyPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)

  const filteredPolicies = selectedCategory === 'all'
    ? SMALL_BIZ_POLICIES
    : SMALL_BIZ_POLICIES.filter(p => p.category === selectedCategory)

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
          <Briefcase className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          소상공인·자영업자 지원
        </h1>
        <p className="text-gray-600">
          소상공인과 자영업자를 위한 금융 지원 정책
        </p>
        <p className="text-xs text-gray-400 mt-2">
          2026년 1월 기준 · 세부 조건은 변경될 수 있습니다
        </p>
      </div>

      {/* 소상공인 기준 안내 */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-800 text-sm mb-2">소상공인 기준</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• 상시 근로자 5인 미만 (제조업·건설업·운수업·광업은 10인 미만)</li>
          <li>• 매출액 기준: 업종별 연 매출 10~120억원 미만</li>
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
                      <Briefcase className="w-4 h-4 text-gray-500" />
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
          소상공인 지원, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              정책자금 신청 순서
            </h3>
            <ol className="text-gray-600 text-sm space-y-2 list-decimal list-inside">
              <li>소상공인 자가진단 (홈페이지에서 자격 확인)</li>
              <li>필요 서류 준비 (사업자등록증, 재무제표 등)</li>
              <li>온라인 신청 또는 지역센터 방문</li>
              <li>서류 심사 및 현장 실사</li>
              <li>승인 및 자금 집행</li>
            </ol>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              보증 vs 직접대출
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 text-sm mb-1">신용보증 (간접대출)</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>✓ 보증기관이 보증 → 은행이 대출</li>
                  <li>✓ 담보 없이 신용으로 가능</li>
                  <li>✓ 보증료 발생 (0.5~2%)</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 text-sm mb-1">정책자금 (직접대출)</p>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>✓ 소진공에서 직접 대출</li>
                  <li>✓ 금리가 더 낮음</li>
                  <li>✓ 예산 한정, 경쟁 치열</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              가점 받는 방법
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">창업교육 이수:</strong> 소상공인 교육 수료 시 정책자금 가점</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">고용 창출:</strong> 신규 채용 실적이 있으면 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">혁신형 소상공인:</strong> 스마트상점, 온라인 진출 등</span>
              </li>
            </ul>
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
              <span className="text-gray-700">소상공인 기준 (상시 근로자, 매출액)을 충족하는지 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">사업자등록증, 재무제표, 부가세 신고서 등 서류 준비</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">신용등급 확인 (7등급 이상 필요한 경우 많음)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">기존 대출 현황 및 한도 확인</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">예산 잔액 및 신청 마감일 확인</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 유용한 링크 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">소상공인 지원 통합 조회</p>
            <ul className="text-blue-700 space-y-1">
              <li>• <a href="https://www.sbiz.or.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">소상공인마당</a> - 소상공인 정책 통합 정보</li>
              <li>• <a href="https://www.semas.or.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">소상공인시장진흥공단</a> - 정책자금 신청</li>
              <li>• <a href="https://www.kodit.co.kr" target="_blank" rel="noopener noreferrer" className="hover:underline">신용보증기금</a> - 신용보증 신청</li>
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
            href="/policy/sme"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">중소기업 정책자금</p>
              <p className="text-xs text-gray-500 mt-0.5">중소기업 지원</p>
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
