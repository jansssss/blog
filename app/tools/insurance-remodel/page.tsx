'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, AlertTriangle, CheckCircle2, Info, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import DisclaimerNotice from '@/components/DisclaimerNotice'

// 체크 항목
interface CheckItem {
  id: string
  question: string
  category: '보장' | '보험료' | '상품' | '생활'
  options: Array<{
    value: string
    label: string
    score: number
    interpretation: string
  }>
}

const CHECK_ITEMS: CheckItem[] = [
  {
    id: 'coverage-gap',
    question: '현재 보험으로 주요 질병(암, 뇌, 심장)이 충분히 보장되나요?',
    category: '보장',
    options: [
      { value: 'sufficient', label: '충분함 (진단비 3천만원 이상)', score: 0, interpretation: '주요 질병 보장 양호' },
      { value: 'moderate', label: '보통 (진단비 1~3천만원)', score: 1, interpretation: '보장 보강 검토 권장' },
      { value: 'insufficient', label: '부족함 (진단비 1천만원 미만)', score: 2, interpretation: '보장 보강 필요' },
      { value: 'unknown', label: '잘 모르겠음', score: 1, interpretation: '보장 내용 확인 필요' }
    ]
  },
  {
    id: 'old-product',
    question: '가입한 지 10년 이상 된 보험이 있나요?',
    category: '상품',
    options: [
      { value: 'none', label: '없음', score: 0, interpretation: '비교적 최신 상품' },
      { value: 'some', label: '일부 있음', score: 1, interpretation: '구 상품 보장 내용 점검 권장' },
      { value: 'most', label: '대부분 오래됨', score: 2, interpretation: '보장 현행화 검토 필요' }
    ]
  },
  {
    id: 'premium-burden',
    question: '현재 보험료가 월 소득 대비 부담되나요?',
    category: '보험료',
    options: [
      { value: 'comfortable', label: '적정함 (소득의 5% 이하)', score: 0, interpretation: '보험료 적정' },
      { value: 'moderate', label: '약간 부담 (소득의 5~10%)', score: 1, interpretation: '보험료 최적화 여지 있음' },
      { value: 'heavy', label: '많이 부담 (소득의 10% 초과)', score: 2, interpretation: '보험료 경감 검토 필요' }
    ]
  },
  {
    id: 'duplicate-coverage',
    question: '비슷한 보장의 보험에 여러 개 가입되어 있나요?',
    category: '보험료',
    options: [
      { value: 'no', label: '없음 (각각 다른 보장)', score: 0, interpretation: '보장 효율적 구성' },
      { value: 'maybe', label: '있을 수 있음', score: 1, interpretation: '중복 보장 점검 권장' },
      { value: 'yes', label: '있음 (실손 등 중복)', score: 2, interpretation: '중복 정리로 보험료 절감 가능' }
    ]
  },
  {
    id: 'life-change',
    question: '최근 생활 변화가 있었나요? (결혼, 출산, 은퇴 등)',
    category: '생활',
    options: [
      { value: 'no', label: '큰 변화 없음', score: 0, interpretation: '현재 보장 유지 가능' },
      { value: 'married', label: '결혼/이혼', score: 1, interpretation: '수익자, 보장 범위 점검 필요' },
      { value: 'child', label: '출산/자녀 독립', score: 1, interpretation: '가족 보장 구성 재검토 필요' },
      { value: 'retire', label: '은퇴/소득 변화', score: 2, interpretation: '보험료 부담, 보장 우선순위 재검토' }
    ]
  },
  {
    id: 'health-change',
    question: '건강 상태에 변화가 있었나요?',
    category: '생활',
    options: [
      { value: 'good', label: '건강함', score: 0, interpretation: '현재 보장 유지' },
      { value: 'minor', label: '경미한 질환 발생', score: 1, interpretation: '추가 보장 검토 가능' },
      { value: 'major', label: '주요 질환 발생', score: 1, interpretation: '기존 보장 활용, 신규 가입 제한될 수 있음' }
    ]
  },
  {
    id: 'guarantee-period',
    question: '보험의 보장 기간이 언제까지인지 알고 있나요?',
    category: '상품',
    options: [
      { value: 'lifetime', label: '종신 또는 100세', score: 0, interpretation: '장기 보장 확보' },
      { value: 'limited', label: '60~80세 만기', score: 1, interpretation: '만기 후 보장 공백 가능성' },
      { value: 'unknown', label: '잘 모르겠음', score: 1, interpretation: '보장 기간 확인 필요' }
    ]
  },
  {
    id: 'renewal-premium',
    question: '갱신형 보험의 보험료가 많이 올랐나요?',
    category: '보험료',
    options: [
      { value: 'no-renewal', label: '갱신형 없음 (모두 비갱신)', score: 0, interpretation: '보험료 안정적' },
      { value: 'stable', label: '갱신형 있지만 적정', score: 0, interpretation: '현재 수준 유지' },
      { value: 'increased', label: '많이 올라서 부담', score: 2, interpretation: '비갱신형 전환 검토' }
    ]
  }
]

export default function InsuranceRemodelPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showResult])

  const handleAnswer = (itemId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [itemId]: value }))
    setShowResult(false)
  }

  const handleCheck = () => {
    setShowResult(true)
  }

  const handleReset = () => {
    setAnswers({})
    setShowResult(false)
  }

  // 분석 결과 계산
  const analysisResult = useMemo(() => {
    const answeredItems = CHECK_ITEMS.filter(item => answers[item.id])
    let totalScore = 0
    const insights: Array<{
      category: string
      question: string
      answer: string
      interpretation: string
      score: number
    }> = []

    answeredItems.forEach(item => {
      const selectedOption = item.options.find(o => o.value === answers[item.id])
      if (selectedOption) {
        totalScore += selectedOption.score
        insights.push({
          category: item.category,
          question: item.question,
          answer: selectedOption.label,
          interpretation: selectedOption.interpretation,
          score: selectedOption.score
        })
      }
    })

    // 카테고리별 점수
    const categoryScores: Record<string, { score: number; count: number }> = {}
    insights.forEach(insight => {
      if (!categoryScores[insight.category]) {
        categoryScores[insight.category] = { score: 0, count: 0 }
      }
      categoryScores[insight.category].score += insight.score
      categoryScores[insight.category].count++
    })

    // 전체 평가
    const maxScore = answeredItems.length * 2
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

    let overallStatus: 'good' | 'moderate' | 'needs-review'
    let overallMessage: string

    if (scorePercentage <= 25) {
      overallStatus = 'good'
      overallMessage = '현재 보험 구성이 비교적 양호합니다'
    } else if (scorePercentage <= 50) {
      overallStatus = 'moderate'
      overallMessage = '일부 항목에서 개선 여지가 있습니다'
    } else {
      overallStatus = 'needs-review'
      overallMessage = '보험 리모델링 검토를 권장합니다'
    }

    // 우선 개선 항목
    const priorityItems = insights
      .filter(i => i.score >= 2)
      .sort((a, b) => b.score - a.score)

    return {
      answeredCount: answeredItems.length,
      totalScore,
      maxScore,
      scorePercentage,
      overallStatus,
      overallMessage,
      insights,
      categoryScores,
      priorityItems
    }
  }, [answers])

  const answeredCount = Object.keys(answers).length
  const totalQuestions = CHECK_ITEMS.length

  const categoryLabels: Record<string, string> = {
    '보장': '보장 분석',
    '보험료': '보험료 분석',
    '상품': '상품 분석',
    '생활': '생활 변화'
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    '보장': <CheckCircle2 className="w-4 h-4" />,
    '보험료': <TrendingDown className="w-4 h-4" />,
    '상품': <ClipboardCheck className="w-4 h-4" />,
    '생활': <TrendingUp className="w-4 h-4" />
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <ClipboardCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          보험 리모델링 체크
        </h1>
        <p className="text-gray-600">
          간단한 질문에 답하면 현재 보험의 개선 필요성을 진단해 드립니다
        </p>
      </div>

      {/* 진행 상태 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">진행률</span>
          <span className="font-medium">{answeredCount} / {totalQuestions} 문항</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 체크 항목 */}
      <div className="space-y-4 mb-6">
        {CHECK_ITEMS.map((item, index) => (
          <Card key={item.id} className={answers[item.id] ? 'border-primary/30' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {categoryLabels[item.category]}
                    </span>
                  </div>
                  <p className="font-medium">{item.question}</p>
                </div>
              </div>

              <div className="grid gap-2 pl-10">
                {item.options.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      answers[item.id] === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={item.id}
                      value={option.value}
                      checked={answers[item.id] === option.value}
                      onChange={() => handleAnswer(item.id, option.value)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="flex-1">{option.label}</span>
                    {answers[item.id] === option.value && option.score > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        option.score >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.score >= 2 ? '점검 필요' : '검토 권장'}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 진단 버튼 */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleCheck}
          disabled={answeredCount < 4}
          className="flex-1"
          size="lg"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          리모델링 필요성 진단
        </Button>
        <Button variant="outline" onClick={handleReset} size="lg">
          초기화
        </Button>
      </div>

      {answeredCount < 4 && (
        <p className="text-sm text-gray-500 text-center mb-6">
          최소 4개 이상의 문항에 답해주세요
        </p>
      )}

      {/* 분석 결과 */}
      {showResult && answeredCount >= 4 && (
        <div ref={resultRef}>
          <Card className="mb-6 border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <ClipboardCheck className="w-5 h-5" />
                리모델링 필요성 진단 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 전체 평가 */}
              <div className={`p-4 rounded-lg ${
                analysisResult.overallStatus === 'good'
                  ? 'bg-green-50 border border-green-200'
                  : analysisResult.overallStatus === 'moderate'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {analysisResult.overallStatus === 'good' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : analysisResult.overallStatus === 'moderate' ? (
                    <Minus className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                  <div>
                    <h4 className={`font-semibold ${
                      analysisResult.overallStatus === 'good'
                        ? 'text-green-800'
                        : analysisResult.overallStatus === 'moderate'
                          ? 'text-yellow-800'
                          : 'text-amber-800'
                    }`}>
                      {analysisResult.overallMessage}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {analysisResult.answeredCount}개 문항 중 {analysisResult.priorityItems.length}개 항목에서 개선 필요성 발견
                    </p>
                  </div>
                </div>
              </div>

              {/* 카테고리별 요약 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(analysisResult.categoryScores).map(([category, data]) => (
                  <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-1 text-primary">
                      {categoryIcons[category]}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {categoryLabels[category]}
                    </div>
                    <div className={`text-sm font-medium ${
                      data.score === 0
                        ? 'text-green-600'
                        : data.score <= data.count
                          ? 'text-yellow-600'
                          : 'text-amber-600'
                    }`}>
                      {data.score === 0 ? '양호' : data.score <= data.count ? '검토 권장' : '점검 필요'}
                    </div>
                  </div>
                ))}
              </div>

              {/* 우선 개선 항목 */}
              {analysisResult.priorityItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    우선 점검 항목
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.priorityItems.map((item, index) => (
                      <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-amber-100 px-2 py-0.5 rounded">
                            {categoryLabels[item.category]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          {item.question}
                        </p>
                        <p className="text-sm text-amber-600">
                          → {item.interpretation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 전체 응답 요약 */}
              <div>
                <h4 className="font-semibold mb-3">전체 응답 요약</h4>
                <div className="space-y-2">
                  {analysisResult.insights.map((insight, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      insight.score === 0
                        ? 'bg-green-50 border-green-200'
                        : insight.score === 1
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">{insight.question}</p>
                          <p className="text-sm font-medium">{insight.answer}</p>
                        </div>
                        {insight.score === 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                            insight.score >= 2 ? 'text-amber-600' : 'text-yellow-600'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 권장 사항 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">다음 단계 권장</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {analysisResult.priorityItems.length > 0 && (
                        <li>• 우선 점검 항목부터 확인해 보세요</li>
                      )}
                      <li>• 현재 보험 증권을 모아서 보장 내용을 정리해 보세요</li>
                      <li>• 필요시 보험 설계사와 상담을 받아보세요</li>
                      <li>• 보험 리모델링은 해지가 아닌 보강/조정이 우선입니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 면책 */}
          <DisclaimerNotice message="이 진단은 일반적인 기준에 따른 참고용 정보입니다. 실제 리모델링 필요성은 개인 상황에 따라 다르며, 보험 해지 전 반드시 전문가와 상담하세요." />
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
            href="/tools/health-overlap-check"
            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm text-gray-900 group-hover:text-primary">실손/건강 중복 점검</p>
              <p className="text-xs text-gray-500 mt-0.5">중복 보장 분석</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
