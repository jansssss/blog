'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle2, AlertTriangle, Info, ArrowLeft, ExternalLink, Users, Home, Briefcase, Car } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 대출 상품 데이터
interface LoanProduct {
  id: string
  category: 'credit' | 'jeonse' | 'mortgage' | 'auto'
  name: string
  description: string
  interestRate: { min: number; max: number }
  maxAmount: string
  term: string
  requirements: string[]
  pros: string[]
  cons: string[]
  suitable: string[]
}

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'credit-worker',
    category: 'credit',
    name: '직장인 신용대출',
    description: '재직 중인 직장인을 위한 무담보 대출',
    interestRate: { min: 4.0, max: 8.0 },
    maxAmount: '최대 1억원',
    term: '1~10년',
    requirements: ['4대보험 가입', '재직 6개월 이상', '연소득 2,400만원 이상'],
    pros: ['담보 불필요', '빠른 심사', '자금 용도 제한 없음'],
    cons: ['금리가 높음', '한도 제한', '신용점수 영향'],
    suitable: ['긴급 자금 필요', '소액 단기 대출', '담보 없는 경우']
  },
  {
    id: 'credit-freelance',
    category: 'credit',
    name: '프리랜서/자영업자 신용대출',
    description: '소득 증빙이 가능한 개인사업자를 위한 대출',
    interestRate: { min: 5.0, max: 10.0 },
    maxAmount: '최대 5,000만원',
    term: '1~5년',
    requirements: ['사업자등록 1년 이상', '소득금액증명원', '부가세 신고 실적'],
    pros: ['4대보험 없이도 가능', '사업 자금 활용'],
    cons: ['직장인 대비 높은 금리', '서류 준비 번거로움'],
    suitable: ['자영업자', '프리랜서', '1인 사업자']
  },
  {
    id: 'jeonse-general',
    category: 'jeonse',
    name: '전세자금대출 (일반)',
    description: '전세보증금을 위한 주택금융공사 보증 대출',
    interestRate: { min: 3.5, max: 5.0 },
    maxAmount: '수도권 3억, 지방 2억',
    term: '2년 (연장 가능)',
    requirements: ['무주택세대주', '주택 시세의 80% 이내', '임대차계약서'],
    pros: ['상대적으로 낮은 금리', '장기 이용 가능'],
    cons: ['무주택 조건', '보증료 발생', '심사 기간 소요'],
    suitable: ['신혼부부', '사회초년생', '무주택 세대주']
  },
  {
    id: 'jeonse-youth',
    category: 'jeonse',
    name: '청년전세대출 (버팀목)',
    description: '청년층을 위한 정부 지원 전세대출',
    interestRate: { min: 1.5, max: 2.9 },
    maxAmount: '최대 2억원',
    term: '2년 (4회 연장, 최대 10년)',
    requirements: ['만 19~34세', '연소득 5천만원 이하', '무주택자'],
    pros: ['매우 낮은 금리', '정부 지원', '장기 이용'],
    cons: ['소득/나이 제한', '대기 시간', '보증금 한도'],
    suitable: ['사회초년생', '저소득 청년', '대학원생']
  },
  {
    id: 'mortgage-ltv',
    category: 'mortgage',
    name: '주택담보대출 (일반)',
    description: '주택을 담보로 한 장기 대출',
    interestRate: { min: 3.3, max: 5.0 },
    maxAmount: 'LTV 70% 이내',
    term: '10~40년',
    requirements: ['담보 주택', '소득 증빙', 'LTV/DTI 규제 충족'],
    pros: ['높은 한도', '장기 상환', '낮은 금리'],
    cons: ['주택 필요', '심사 복잡', '규제 영향'],
    suitable: ['주택 구입', '대환대출', '목돈 마련']
  },
  {
    id: 'mortgage-special',
    category: 'mortgage',
    name: '특례보금자리론',
    description: '무주택 실수요자를 위한 정책 대출',
    interestRate: { min: 3.3, max: 4.3 },
    maxAmount: '최대 5억원',
    term: '10~50년',
    requirements: ['무주택자 또는 1주택자', '주택가격 9억 이하', '소득 제한'],
    pros: ['낮은 고정금리', '장기 상환', '정부 보증'],
    cons: ['대상 제한', '주택가격 제한', '심사 기간'],
    suitable: ['생애최초 주택구입', '실거주 목적', '장기 안정 원하는 경우']
  },
  {
    id: 'auto-new',
    category: 'auto',
    name: '신차 할부/대출',
    description: '신차 구입을 위한 할부 금융',
    interestRate: { min: 4.0, max: 8.0 },
    maxAmount: '차량가의 100%',
    term: '12~72개월',
    requirements: ['운전면허', '소득 증빙', '신용평가'],
    pros: ['빠른 심사', '100% 할부 가능', '다양한 조건'],
    cons: ['차량 담보', '중도상환수수료', '보험 필수'],
    suitable: ['신차 구입', '법인/개인', '리스 비선호']
  },
  {
    id: 'auto-used',
    category: 'auto',
    name: '중고차 대출',
    description: '중고차 구입을 위한 대출',
    interestRate: { min: 5.0, max: 12.0 },
    maxAmount: '차량 시세의 80%',
    term: '12~60개월',
    requirements: ['운전면허', '차량 시세 확인', '소득 증빙'],
    pros: ['비교적 간편한 심사', '다양한 상품'],
    cons: ['신차 대비 높은 금리', '한도 제한'],
    suitable: ['중고차 구입', '저예산 차량 구입']
  }
]

type CategoryType = 'all' | 'credit' | 'jeonse' | 'mortgage' | 'auto'

const CATEGORY_LABELS: Record<CategoryType, { label: string; icon: React.ReactNode }> = {
  all: { label: '전체', icon: <FileText className="w-4 h-4" /> },
  credit: { label: '신용대출', icon: <Users className="w-4 h-4" /> },
  jeonse: { label: '전세대출', icon: <Home className="w-4 h-4" /> },
  mortgage: { label: '주택담보', icon: <Briefcase className="w-4 h-4" /> },
  auto: { label: '자동차', icon: <Car className="w-4 h-4" /> }
}

export default function LoanProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  const filteredProducts = selectedCategory === 'all'
    ? LOAN_PRODUCTS
    : LOAN_PRODUCTS.filter(p => p.category === selectedCategory)

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
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          대출 상품 비교
        </h1>
        <p className="text-gray-600">
          용도별 대출 상품의 조건과 특징을 비교해보세요
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
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={`transition-all ${expandedProduct === product.id ? 'border-primary shadow-md' : ''}`}
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[product.category].label}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {product.interestRate.min}~{product.interestRate.max}%
                    </span>
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-gray-900">{product.maxAmount}</p>
                  <p className="text-xs text-gray-500">{product.term}</p>
                </div>
              </div>
            </CardHeader>

            {expandedProduct === product.id && (
              <CardContent className="pt-0 border-t">
                <div className="grid gap-4 mt-4">
                  {/* 자격 요건 */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Info className="w-4 h-4 text-gray-500" />
                      자격 요건
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-400" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* 장점 */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        장점
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {product.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 단점 */}
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        단점
                      </h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {product.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 추천 대상 */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">추천 대상</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.suitable.map((s, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
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
          대출 상품 선택 가이드
        </h2>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              용도에 맞는 상품 선택
            </h3>
            <div className="text-gray-600 text-sm space-y-2">
              <p>• <strong className="text-gray-900">긴급 자금:</strong> 신용대출이 빠르지만 금리가 높습니다</p>
              <p>• <strong className="text-gray-900">전세 자금:</strong> 전세대출은 금리가 낮고 정부 지원도 있습니다</p>
              <p>• <strong className="text-gray-900">주택 구입:</strong> 담보대출이 금리가 가장 낮지만 심사가 까다롭습니다</p>
              <p>• <strong className="text-gray-900">차량 구입:</strong> 할부/리스/렌트를 비교해보세요</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              정부 지원 대출 우선 확인
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              청년, 신혼부부, 저소득층 등 대상별로 <strong className="text-gray-900">정부 지원 대출</strong>이 있습니다.
              일반 대출보다 금리가 1~3%p 낮을 수 있으니 자격 조건을 먼저 확인하세요.
              주택금융공사, 한국주택금융공사, 서민금융진흥원 등에서 운영합니다.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              총비용으로 비교하기
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">금리:</strong> 표면금리뿐 아니라 실제 적용금리 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">수수료:</strong> 대출 실행 수수료, 인지세, 보증료 등</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">중도상환:</strong> 조기 상환 시 수수료 발생 여부</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">연장 비용:</strong> 만기 연장 시 추가 비용</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 체크리스트 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          대출 신청 전 체크리스트
        </h2>
        <div className="bg-gray-50 border rounded-lg p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">내 신용점수를 미리 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">DTI/DSR 등 대출 규제를 확인했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">여러 은행의 조건을 비교했는지</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">상환 계획을 세웠는지 (월 상환액 적정 여부)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">필요 서류를 미리 준비했는지</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 면책 */}
      <div className="mt-8">
        <DisclaimerNotice message="상품 정보는 일반적인 기준이며, 실제 조건은 금융기관마다 다릅니다. 정확한 내용은 각 금융기관에 문의하세요." />
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">관련 도구</p>
        <div className="grid gap-2 sm:grid-cols-2">
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
          <Link
            href="/compare/bank-rates"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">은행별 금리 비교</p>
              <p className="text-xs text-gray-500 mt-0.5">금리 한눈에 보기</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
