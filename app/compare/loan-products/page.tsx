'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileText, CheckCircle2, AlertTriangle, Info, ArrowLeft, ExternalLink, Users, Home, Briefcase, Car, Search, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 대출 유형별 안내
const LOAN_TYPES = [
  {
    id: 'credit',
    icon: <Users className="w-6 h-6" />,
    name: '신용대출',
    description: '담보 없이 신용으로 받는 대출',
    suitable: ['긴급 자금 필요', '소액 단기 대출', '담보 없는 경우'],
    checkPoints: ['금리가 상대적으로 높음', '신용점수에 영향', '한도 제한 있음'],
    color: 'blue'
  },
  {
    id: 'jeonse',
    icon: <Home className="w-6 h-6" />,
    name: '전세자금대출',
    description: '전세보증금 마련을 위한 대출',
    suitable: ['전세 계약 예정', '무주택 세대주', '청년·신혼부부'],
    checkPoints: ['정부 지원 상품 확인', '보증료 발생', '무주택 조건 확인'],
    color: 'green'
  },
  {
    id: 'mortgage',
    icon: <Briefcase className="w-6 h-6" />,
    name: '주택담보대출',
    description: '주택을 담보로 하는 장기 대출',
    suitable: ['주택 구입', '대환대출', '목돈 마련'],
    checkPoints: ['LTV·DTI·DSR 규제 확인', '장기 상환 계획', '고정/변동금리 선택'],
    color: 'purple'
  },
  {
    id: 'auto',
    icon: <Car className="w-6 h-6" />,
    name: '자동차대출',
    description: '차량 구입을 위한 할부/대출',
    suitable: ['신차·중고차 구입', '법인·개인'],
    checkPoints: ['할부/리스/렌트 비교', '중도상환수수료', '보험 필수 여부'],
    color: 'orange'
  }
]

// 정부 지원 대출 안내
const GOVERNMENT_LOANS = [
  { name: '청년전용 버팀목전세대출', target: '만 19~34세 무주택 청년', site: 'https://nhuf.molit.go.kr' },
  { name: '신혼부부 전세대출', target: '혼인 7년 이내 신혼부부', site: 'https://nhuf.molit.go.kr' },
  { name: '특례보금자리론', target: '무주택 또는 1주택 실수요자', site: 'https://www.hf.go.kr' },
  { name: '디딤돌대출', target: '무주택 서민·실수요자', site: 'https://www.hf.go.kr' },
]

// 공식 대출 비교 사이트
const COMPARISON_SITES = [
  {
    name: '금융감독원 금융상품 한눈에',
    url: 'https://finlife.fss.or.kr',
    description: '예금·적금·대출 상품 공식 비교',
    official: true
  },
  {
    name: '주택금융공사',
    url: 'https://www.hf.go.kr',
    description: '보금자리론, 디딤돌대출 등 주택금융',
    official: true
  },
  {
    name: '주택도시기금',
    url: 'https://nhuf.molit.go.kr',
    description: '전세자금, 주거안정 대출',
    official: true
  },
  {
    name: '서민금융진흥원',
    url: 'https://www.kinfa.or.kr',
    description: '서민·저소득층 금융지원',
    official: true
  }
]

export default function LoanProductsPage() {
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
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          대출 상품 선택 가이드
        </h1>
        <p className="text-gray-600">
          용도에 맞는 대출을 선택하는 방법을 안내합니다
        </p>
      </div>

      {/* 핵심 안내 */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-2">대출 선택의 핵심</p>
              <p className="text-sm text-gray-600">
                대출은 <strong className="text-gray-900">용도, 금리, 상환능력</strong>을 고려해 선택해야 합니다.
                특히 <strong className="text-gray-900">정부 지원 대출</strong>은 일반 대출보다 금리가 낮으니
                자격 조건을 먼저 확인하세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 대출 유형별 안내 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          어떤 대출이 필요하신가요?
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {LOAN_TYPES.map((type) => (
            <div key={type.id} className="bg-white rounded-lg border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full bg-${type.color}-100 flex items-center justify-center text-${type.color}-600`}>
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">이런 분께 적합:</p>
                <div className="flex flex-wrap gap-1">
                  {type.suitable.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">체크 포인트:</p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {type.checkPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 정부 지원 대출 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          정부 지원 대출 먼저 확인하세요
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-4">
          <p className="text-sm text-green-800 mb-4">
            정부 지원 대출은 일반 대출보다 <strong>1~3%p 낮은 금리</strong>가 적용됩니다.
            자격 조건에 해당하는지 먼저 확인하세요.
          </p>
          <div className="space-y-3">
            {GOVERNMENT_LOANS.map((loan, index) => (
              <a
                key={index}
                href={loan.site}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors group"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 group-hover:text-green-700">
                    {loan.name}
                  </p>
                  <p className="text-xs text-gray-500">{loan.target}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 공식 비교 사이트 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          대출 상품 비교 사이트
        </h2>
        <div className="space-y-3">
          {COMPARISON_SITES.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 group-hover:text-primary">
                      {site.name}
                    </span>
                    {site.official && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        공식
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{site.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 대출 선택 가이드 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          대출 상품 선택 가이드
        </h2>

        <div className="space-y-4">
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
              총비용으로 비교하기
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">금리:</strong> 표면금리뿐 아니라 실제 적용금리 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">수수료:</strong> 대출 실행 수수료, 인지세, 보증료 등</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">중도상환:</strong> 조기 상환 시 수수료 발생 여부</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">연장 비용:</strong> 만기 연장 시 추가 비용</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              상환 능력 확인
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              월 상환액이 <strong className="text-gray-900">월 소득의 30~40%</strong>를 넘지 않도록 계획하세요.
              DSR(총부채원리금상환비율) 규제로 인해 대출 한도가 제한될 수 있습니다.
            </p>
            <Link
              href="/calculator/loan-interest"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              대출 이자 계산기로 확인하기
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 주의사항 */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">대출 신청 전 체크리스트</p>
            <ul className="text-amber-700 space-y-1">
              <li>• 내 <strong>신용점수</strong>를 미리 확인했는지</li>
              <li>• <strong>DTI/DSR</strong> 등 대출 규제를 확인했는지</li>
              <li>• 여러 은행의 <strong>조건을 비교</strong>했는지</li>
              <li>• <strong>상환 계획</strong>을 세웠는지 (월 상환액 적정 여부)</li>
              <li>• <strong>필요 서류</strong>를 미리 준비했는지</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <DisclaimerNotice message="본 페이지는 대출 선택 방법을 안내하며, 특정 금융상품을 추천하지 않습니다. 정확한 조건은 각 금융기관에 직접 확인하세요." />

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
              <p className="text-xs text-gray-500 mt-0.5">금리 비교 방법 안내</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
