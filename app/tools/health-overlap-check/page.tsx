'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle2, Info, ArrowRight, FileText, Calculator } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 보험 상품 유형
interface InsuranceProduct {
  id: string
  name: string
  category: '실손' | '건강' | '암' | '질병'
  coverages: string[]
  description: string
  tip: string
}

const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'silson-standard',
    name: '실손의료보험 (표준형)',
    category: '실손',
    coverages: ['입원의료비', '통원의료비', '처방조제비'],
    description: '국민건강보험 적용 후 본인부담금 보장',
    tip: '실손은 1인 1개만 가입 권장. 중복 시 비례보상으로 보험료 낭비'
  },
  {
    id: 'silson-special',
    name: '실손의료보험 (특약형)',
    category: '실손',
    coverages: ['입원의료비', '통원의료비', '처방조제비', '비급여 특약'],
    description: '비급여 항목까지 추가 보장',
    tip: '표준형과 중복 시 비급여 부분만 추가 보장됨'
  },
  {
    id: 'health-comprehensive',
    name: '종합건강보험',
    category: '건강',
    coverages: ['입원일당', '수술비', '진단비', '통원비'],
    description: '다양한 질병/상해 보장 종합 상품',
    tip: '실손과 입원일당은 중복 청구 가능. 수술비도 정액이라 중복 가능'
  },
  {
    id: 'cancer-insurance',
    name: '암보험',
    category: '암',
    coverages: ['암진단비', '암수술비', '암입원일당', '암통원비'],
    description: '암 진단 시 정액 보장',
    tip: '정액형이라 여러 개 가입해도 각각 지급. 단, 보험료 부담 고려'
  },
  {
    id: 'ci-insurance',
    name: 'CI보험 (중대질병)',
    category: '질병',
    coverages: ['암진단비', '뇌졸중진단비', '급성심근경색진단비'],
    description: '중대 질병 진단 시 고액 보장',
    tip: '암보험과 암진단비 부분 중복 가능. 보장 범위 확인 필요'
  },
  {
    id: 'disease-insurance',
    name: '질병보험',
    category: '질병',
    coverages: ['질병입원일당', '질병수술비', '질병진단비'],
    description: '일반 질병에 대한 보장',
    tip: '종합건강보험과 보장 항목 중복 여부 확인 필요'
  }
]

// 보장 항목별 중복 체크 규칙
const OVERLAP_RULES: Record<string, { type: 'proportional' | 'duplicate' | 'ok'; message: string }> = {
  '입원의료비': { type: 'proportional', message: '실손 의료비는 비례보상. 여러 개 가입해도 실제 비용만 보장' },
  '통원의료비': { type: 'proportional', message: '통원 의료비도 비례보상 적용' },
  '처방조제비': { type: 'proportional', message: '처방조제비도 비례보상 적용' },
  '입원일당': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '수술비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '진단비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '통원비': { type: 'duplicate', message: '일부 상품 간 중복 가능성 있음' },
  '암진단비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '암수술비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '암입원일당': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '암통원비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '뇌졸중진단비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '급성심근경색진단비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '질병입원일당': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '질병수술비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '질병진단비': { type: 'ok', message: '정액형이라 중복 청구 가능' },
  '비급여 특약': { type: 'proportional', message: '비급여도 실손 원칙 적용' }
}

export default function HealthOverlapCheckPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showResult])

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
    setShowResult(false)
  }

  const handleCheck = () => {
    setShowResult(true)
  }

  const handleReset = () => {
    setSelectedProducts([])
    setShowResult(false)
  }

  // 중복 분석 결과 계산
  const analysisResult = useMemo(() => {
    const selected = INSURANCE_PRODUCTS.filter(p => selectedProducts.includes(p.id))

    // 보장 항목별 중복 카운트
    const coverageCount: Record<string, string[]> = {}
    selected.forEach(product => {
      product.coverages.forEach(coverage => {
        if (!coverageCount[coverage]) {
          coverageCount[coverage] = []
        }
        coverageCount[coverage].push(product.name)
      })
    })

    // 중복 항목 분석
    const overlaps: Array<{
      coverage: string
      products: string[]
      type: 'proportional' | 'duplicate' | 'ok'
      message: string
    }> = []

    Object.entries(coverageCount).forEach(([coverage, products]) => {
      if (products.length > 1) {
        const rule = OVERLAP_RULES[coverage] || { type: 'duplicate', message: '중복 여부 확인 필요' }
        overlaps.push({
          coverage,
          products,
          type: rule.type,
          message: rule.message
        })
      }
    })

    // 실손보험 중복 체크
    const silsonProducts = selected.filter(p => p.category === '실손')
    const hasSilsonOverlap = silsonProducts.length > 1

    // 문제되는 중복 (비례보상 항목)
    const problematicOverlaps = overlaps.filter(o => o.type === 'proportional')

    // 괜찮은 중복 (정액형)
    const okOverlaps = overlaps.filter(o => o.type === 'ok')

    return {
      selectedCount: selected.length,
      totalCoverages: Object.keys(coverageCount).length,
      overlaps,
      problematicOverlaps,
      okOverlaps,
      hasSilsonOverlap,
      silsonProducts
    }
  }, [selectedProducts])

  // 카테고리별 그룹화
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, InsuranceProduct[]> = {}
    INSURANCE_PRODUCTS.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = []
      }
      grouped[product.category].push(product)
    })
    return grouped
  }, [])

  const categoryLabels: Record<string, string> = {
    '실손': '실손의료보험',
    '건강': '건강보험',
    '암': '암보험',
    '질병': '질병/CI보험'
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          실손/건강보험 중복 점검
        </h1>
        <p className="text-gray-600">
          가입한 보험 상품을 선택하면 중복 보장 여부를 분석해 드립니다
        </p>
      </div>

      {/* 보험 상품 선택 */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            가입한 보험 상품 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(productsByCategory).map(([category, products]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-2">
                {products.map(product => (
                  <label
                    key={product.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProducts.includes(product.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.coverages.map(coverage => (
                          <span key={coverage} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {coverage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleCheck}
              disabled={selectedProducts.length < 2}
              className="flex-1"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              중복 분석하기
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              초기화
            </Button>
          </div>

          {selectedProducts.length < 2 && (
            <p className="text-sm text-gray-500 text-center">
              2개 이상의 보험을 선택해주세요
            </p>
          )}
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {showResult && selectedProducts.length >= 2 && (
        <div ref={resultRef}>
          <Card className="mb-6 border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Calculator className="w-5 h-5" />
                중복 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 요약 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysisResult.selectedCount}개
                  </div>
                  <div className="text-xs text-gray-500 mt-1">선택한 보험</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {analysisResult.totalCoverages}개
                  </div>
                  <div className="text-xs text-gray-500 mt-1">보장 항목</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {analysisResult.problematicOverlaps.length}개
                  </div>
                  <div className="text-xs text-amber-600 mt-1">점검 필요</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResult.okOverlaps.length}개
                  </div>
                  <div className="text-xs text-green-600 mt-1">중복 가능</div>
                </div>
              </div>

              {/* 실손 중복 경고 */}
              {analysisResult.hasSilsonOverlap && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">
                        실손보험 중복 가입 감지
                      </h4>
                      <p className="text-sm text-red-700 mb-2">
                        실손의료보험은 비례보상 원칙이 적용되어, 여러 개 가입해도 실제 발생한 의료비만 보장받습니다.
                        보험료만 이중으로 납입하게 될 수 있습니다.
                      </p>
                      <p className="text-sm text-red-600 font-medium">
                        중복 상품: {analysisResult.silsonProducts.map(p => p.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 점검 필요 항목 */}
              {analysisResult.problematicOverlaps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    점검이 필요한 중복 항목
                  </h4>
                  <div className="space-y-3">
                    {analysisResult.problematicOverlaps.map((overlap, index) => (
                      <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm bg-amber-100 px-2 py-0.5 rounded font-medium">
                            {overlap.coverage}
                          </span>
                          <span className="text-sm text-amber-700">
                            {overlap.products.length}개 상품에서 중복
                          </span>
                        </div>
                        <p className="text-sm text-amber-600">{overlap.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          해당 상품: {overlap.products.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 중복 가능 항목 */}
              {analysisResult.okOverlaps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    중복 청구 가능한 항목 (정액형)
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.okOverlaps.map((overlap, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm bg-green-100 px-2 py-0.5 rounded font-medium">
                            {overlap.coverage}
                          </span>
                          <span className="text-sm text-green-700">
                            {overlap.products.length}개 상품
                          </span>
                        </div>
                        <p className="text-sm text-green-600">{overlap.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 해석 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">결과 해석</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {analysisResult.hasSilsonOverlap && (
                        <li>• 실손보험이 중복되어 있어 보험료 낭비 가능성이 있습니다</li>
                      )}
                      {analysisResult.problematicOverlaps.length > 0 && (
                        <li>• 비례보상 항목 {analysisResult.problematicOverlaps.length}개는 중복 시 효율이 떨어집니다</li>
                      )}
                      {analysisResult.okOverlaps.length > 0 && (
                        <li>• 정액형 {analysisResult.okOverlaps.length}개 항목은 중복 청구가 가능합니다</li>
                      )}
                      <li>• 실제 보장 내용은 각 보험사 약관을 확인하세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 면책 */}
          <DisclaimerNotice message="이 분석은 일반적인 보험 상품 구조를 기반으로 한 참고 정보입니다. 실제 보장 내용은 각 보험사 약관과 상품별로 다를 수 있으며, 정확한 중복 여부는 보험 설계사 또는 보험사에 확인하세요." />
        </div>
      )}

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-lg p-4 border mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">관련 점검 도구</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/tools/auto-discount-check"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">자동차보험 할인 진단</p>
              <p className="text-xs text-gray-500 mt-0.5">할인 항목 누락 체크</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
          <Link
            href="/tools/insurance-remodel"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">보험 리모델링 체크</p>
              <p className="text-xs text-gray-500 mt-0.5">보장 최적화 진단</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>

      {/* 보험 중복 가이드 */}
      <Card className="mt-6 bg-emerald-50 border-emerald-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-gray-900">보험 중복, 이것만 알아두세요</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-red-800 mb-2">실손보험 중복의 문제점</p>
              <p className="text-gray-600">
                실손의료보험은 <strong>비례보상 원칙</strong>이 적용됩니다.
                2개 이상 가입해도 실제 발생한 의료비만 보상받으며,
                보험료만 이중으로 납부하게 됩니다.
                실손보험은 1개만 유지하는 것이 효율적입니다.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-green-800 mb-2">중복 청구 가능한 보험</p>
              <p className="text-gray-600">
                암진단비, 수술비, 입원일당 같은 <strong>정액형 보험</strong>은
                여러 개 가입해도 각각 보험금을 받을 수 있습니다.
                단, 보험료 부담을 고려하여 적정 수준으로 가입하세요.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">실손 vs 정액의 차이</p>
              <ul className="text-gray-600 space-y-1 mt-2">
                <li>• <strong>실손형:</strong> 실제 쓴 의료비만큼 보상 (중복 시 나눠서 보상)</li>
                <li>• <strong>정액형:</strong> 약관에 정해진 금액 지급 (중복 시 각각 지급)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보험 정리 팁 */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">보험 정리 전 확인할 것</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>기존 보험의 보장 내용을 정확히 파악하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>가입 시기가 오래된 보험은 보장 조건이 유리할 수 있으니 신중하게 판단하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>해지 전 새 보험 가입이 완료되었는지 확인하세요 (공백 기간 주의)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>건강 상태가 변했다면 새 보험 가입이 어려울 수 있습니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span>중요한 결정은 보험 전문가와 상담 후 진행하세요</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
