'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Building2, Info, ArrowLeft, ExternalLink, CheckCircle2, AlertTriangle, Search } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 금리 비교 사이트 목록
const COMPARISON_SITES = [
  {
    name: '금융감독원 금융상품 한눈에',
    url: 'https://finlife.fss.or.kr',
    description: '공식 금융상품 비교 사이트 (예금, 적금, 대출 금리 비교)',
    official: true
  },
  {
    name: '은행연합회 소비자포털',
    url: 'https://portal.kfb.or.kr',
    description: '은행별 금리, 수수료 비교 정보',
    official: true
  },
  {
    name: '네이버 금융',
    url: 'https://finance.naver.com',
    description: '대출 금리 비교, 금융 뉴스',
    official: false
  }
]

// 주요 은행 공식 사이트
const BANK_SITES = [
  { name: 'KB국민은행', url: 'https://www.kbstar.com' },
  { name: '신한은행', url: 'https://www.shinhan.com' },
  { name: '하나은행', url: 'https://www.kebhana.com' },
  { name: '우리은행', url: 'https://www.wooribank.com' },
  { name: 'NH농협은행', url: 'https://www.nonghyup.com' },
  { name: '카카오뱅크', url: 'https://www.kakaobank.com' },
  { name: '토스뱅크', url: 'https://www.tossbank.com' },
  { name: 'K뱅크', url: 'https://www.kbanknow.com' },
]

export default function BankRatesPage() {
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
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          은행별 금리 비교하는 방법
        </h1>
        <p className="text-gray-600">
          정확한 금리 정보를 확인하는 방법과 비교 시 주의사항을 안내합니다
        </p>
      </div>

      {/* 핵심 안내 */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-2">금리는 매일 변동됩니다</p>
              <p className="text-sm text-gray-600">
                은행 대출 금리는 기준금리, 시장 상황, 은행 정책에 따라 수시로 변경됩니다.
                정확한 금리는 <strong className="text-gray-900">금융감독원 공식 사이트</strong>나
                <strong className="text-gray-900"> 각 은행 홈페이지</strong>에서 실시간으로 확인하세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 공식 금리 비교 사이트 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          금리 비교 사이트
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
                  <p className="text-xs text-primary mt-1">{site.url}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 주요 은행 바로가기 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          주요 은행 공식 사이트
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BANK_SITES.map((bank) => (
            <a
              key={bank.name}
              href={bank.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
            >
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">
                {bank.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">바로가기</p>
            </a>
          ))}
        </div>
      </section>

      {/* 금리 비교 가이드 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          금리 비교, 이것만 알아두세요
        </h2>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">1</span>
              표시 금리 vs 실제 금리
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              은행에서 광고하는 금리는 <strong className="text-gray-900">최저 금리</strong>입니다.
              실제 적용 금리는 개인의 신용점수, 소득, 담보 가치 등에 따라 달라집니다.
              신용점수가 높을수록, 소득이 안정적일수록 낮은 금리를 받을 수 있습니다.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">2</span>
              우대금리 활용하기
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">급여이체:</strong> 해당 은행으로 급여를 받으면 0.1~0.3%p 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">자동이체:</strong> 공과금, 카드 결제 자동이체 시 추가 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">모바일뱅킹:</strong> 앱 설치 및 이용 시 우대금리 적용</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">기존 거래:</strong> 예적금 보유, 카드 사용 실적 등</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">3</span>
              인터넷은행 vs 시중은행
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 text-sm mb-2">인터넷은행</p>
                <p className="text-xs text-blue-600 mb-2">카카오뱅크, 토스뱅크, K뱅크</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>+ 비대면 심사로 빠른 승인</li>
                  <li>+ 상대적으로 낮은 금리</li>
                  <li>+ 24시간 신청 가능</li>
                  <li>- 대면 상담 불가</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800 text-sm mb-2">시중은행</p>
                <p className="text-xs text-gray-600 mb-2">KB, 신한, 하나, 우리, NH</p>
                <ul className="text-gray-700 text-xs space-y-1">
                  <li>+ 대면 상담 가능</li>
                  <li>+ 더 높은 한도 가능</li>
                  <li>+ 다양한 상품 선택</li>
                  <li>- 영업시간 내 방문 필요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주의사항 */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">금리 비교 시 주의사항</p>
            <ul className="text-amber-700 space-y-1">
              <li>• 금리만 보지 말고 <strong>중도상환수수료, 부대비용</strong>도 확인하세요</li>
              <li>• 여러 은행에 동시에 대출 조회하면 <strong>신용점수에 영향</strong>이 있을 수 있습니다</li>
              <li>• 우대금리 <strong>유지 조건</strong>을 꼼꼼히 확인하세요</li>
              <li>• 변동금리는 향후 <strong>금리 인상 위험</strong>이 있습니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <DisclaimerNotice message="본 페이지는 금리 비교 방법을 안내하며, 특정 금융상품을 추천하지 않습니다. 정확한 금리와 조건은 각 금융기관에 직접 확인하세요." />

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">관련 도구</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/calculator/loan-interest"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">대출 이자 계산기</p>
              <p className="text-xs text-gray-500 mt-0.5">예상 이자 계산</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/compare/fixed-vs-variable"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">고정 vs 변동금리</p>
              <p className="text-xs text-gray-500 mt-0.5">금리 유형 선택 가이드</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
