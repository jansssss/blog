'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, Building2, Info, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 은행별 금리 데이터 (2026년 1월 기준 예시)
interface BankRate {
  bank: string
  logo?: string
  creditLoan: { min: number; max: number }
  jeonse: { min: number; max: number }
  mortgage: { min: number; max: number }
  note?: string
}

const BANK_RATES: BankRate[] = [
  {
    bank: 'KB국민은행',
    creditLoan: { min: 4.5, max: 7.8 },
    jeonse: { min: 3.8, max: 5.2 },
    mortgage: { min: 3.5, max: 4.8 },
    note: '급여이체 시 0.1%p 우대'
  },
  {
    bank: '신한은행',
    creditLoan: { min: 4.3, max: 7.5 },
    jeonse: { min: 3.7, max: 5.0 },
    mortgage: { min: 3.4, max: 4.6 },
    note: '신한쏠 이용 시 0.2%p 우대'
  },
  {
    bank: '하나은행',
    creditLoan: { min: 4.4, max: 7.6 },
    jeonse: { min: 3.9, max: 5.3 },
    mortgage: { min: 3.6, max: 4.9 },
    note: '하나멤버스 포인트 우대'
  },
  {
    bank: '우리은행',
    creditLoan: { min: 4.6, max: 7.9 },
    jeonse: { min: 4.0, max: 5.4 },
    mortgage: { min: 3.7, max: 5.0 },
    note: '우리WON뱅킹 우대'
  },
  {
    bank: 'NH농협은행',
    creditLoan: { min: 4.7, max: 8.0 },
    jeonse: { min: 3.8, max: 5.1 },
    mortgage: { min: 3.5, max: 4.7 },
    note: '조합원 우대금리 적용'
  },
  {
    bank: '카카오뱅크',
    creditLoan: { min: 4.0, max: 7.2 },
    jeonse: { min: 3.5, max: 4.8 },
    mortgage: { min: 3.3, max: 4.5 },
    note: '비대면 간편 심사'
  },
  {
    bank: '토스뱅크',
    creditLoan: { min: 3.9, max: 7.0 },
    jeonse: { min: 3.6, max: 4.9 },
    mortgage: { min: 3.4, max: 4.6 },
    note: '실시간 금리 비교'
  },
  {
    bank: 'K뱅크',
    creditLoan: { min: 4.1, max: 7.3 },
    jeonse: { min: 3.7, max: 5.0 },
    mortgage: { min: 3.5, max: 4.7 },
    note: '비대면 신청 가능'
  }
]

type LoanType = 'creditLoan' | 'jeonse' | 'mortgage'

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  creditLoan: '신용대출',
  jeonse: '전세자금대출',
  mortgage: '주택담보대출'
}

export default function BankRatesPage() {
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType>('creditLoan')
  const [sortBy, setSortBy] = useState<'min' | 'max'>('min')

  // 정렬된 데이터
  const sortedRates = [...BANK_RATES].sort((a, b) => {
    const aRate = a[selectedLoanType][sortBy]
    const bRate = b[selectedLoanType][sortBy]
    return aRate - bRate
  })

  // 최저/최고 금리 은행
  const lowestRate = sortedRates[0]
  const highestRate = sortedRates[sortedRates.length - 1]

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
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          은행별 금리 비교
        </h1>
        <p className="text-gray-600">
          주요 은행들의 대출 금리를 한눈에 비교해보세요
        </p>
        <p className="text-xs text-gray-400 mt-2">
          2026년 1월 기준 · 실제 금리는 개인 신용도에 따라 달라집니다
        </p>
      </div>

      {/* 대출 유형 선택 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {(Object.keys(LOAN_TYPE_LABELS) as LoanType[]).map((type) => (
          <Button
            key={type}
            variant={selectedLoanType === type ? 'default' : 'outline'}
            onClick={() => setSelectedLoanType(type)}
            size="sm"
          >
            {LOAN_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      {/* 정렬 옵션 */}
      <div className="flex justify-end gap-2 mb-4">
        <span className="text-sm text-gray-500 self-center">정렬:</span>
        <Button
          variant={sortBy === 'min' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('min')}
        >
          최저금리순
        </Button>
        <Button
          variant={sortBy === 'max' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('max')}
        >
          최고금리순
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">최저 금리</span>
            </div>
            <p className="text-xl font-bold text-green-800">
              {lowestRate[selectedLoanType].min}%
            </p>
            <p className="text-sm text-green-600">{lowestRate.bank}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">최고 금리</span>
            </div>
            <p className="text-xl font-bold text-amber-800">
              {highestRate[selectedLoanType].max}%
            </p>
            <p className="text-sm text-amber-600">{highestRate.bank}</p>
          </CardContent>
        </Card>
      </div>

      {/* 금리 테이블 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {LOAN_TYPE_LABELS[selectedLoanType]} 금리 비교
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">은행</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">최저금리</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">최고금리</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 hidden sm:table-cell">비고</th>
                </tr>
              </thead>
              <tbody>
                {sortedRates.map((rate, index) => (
                  <tr key={rate.bank} className={`border-b ${index === 0 ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rate.bank}</span>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            최저
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-semibold ${index === 0 ? 'text-green-600' : ''}`}>
                        {rate[selectedLoanType].min}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      {rate[selectedLoanType].max}%
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-xs hidden sm:table-cell">
                      {rate.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 가이드 콘텐츠 */}
      <section className="border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          금리 비교, 이것만 알아두세요
        </h2>

        <div className="space-y-6">
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
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">급여이체:</strong> 해당 은행으로 급여를 받으면 0.1~0.3%p 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">자동이체:</strong> 공과금, 카드 결제 자동이체 시 추가 우대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-gray-900">모바일뱅킹:</strong> 앱 설치 및 이용 시 우대금리 적용</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
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
                <p className="font-medium text-blue-800 text-sm mb-1">인터넷은행 (카카오뱅크, 토스뱅크 등)</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>✓ 비대면 심사로 빠른 승인</li>
                  <li>✓ 상대적으로 낮은 금리</li>
                  <li>✓ 24시간 신청 가능</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800 text-sm mb-1">시중은행 (KB, 신한, 하나 등)</p>
                <ul className="text-gray-700 text-xs space-y-1">
                  <li>✓ 대면 상담 가능</li>
                  <li>✓ 더 높은 한도 가능</li>
                  <li>✓ 다양한 상품 선택</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주의사항 */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">금리 비교 시 주의사항</p>
            <ul className="text-amber-700 space-y-1">
              <li>• 금리만 보지 말고 중도상환수수료, 부대비용도 확인하세요</li>
              <li>• 여러 은행에 동시에 대출 조회하면 신용점수에 영향이 있을 수 있습니다</li>
              <li>• 우대금리 조건을 꼼꼼히 확인하세요 (유지 조건 포함)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <div className="mt-6">
        <DisclaimerNotice message="본 금리 정보는 참고용이며, 실제 금리는 은행 및 개인 신용도에 따라 달라집니다. 정확한 금리는 각 은행에 직접 문의하세요." />
      </div>

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
              <p className="text-xs text-gray-500 mt-0.5">금리 유형 비교</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
