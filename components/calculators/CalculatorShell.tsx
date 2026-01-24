import { ReactNode } from 'react'

interface CalculatorShellProps {
  title: string
  description?: string
  icon?: ReactNode
  children: {
    preset?: ReactNode
    input: ReactNode
    result?: ReactNode
    interpretation?: ReactNode
    disclaimer?: ReactNode
    related?: ReactNode
    extra?: ReactNode
  }
}

/**
 * 계산기 페이지 공통 레이아웃
 * - 타이틀, 설명, 입력/결과 섹션을 일관된 구조로 제공
 */
export default function CalculatorShell({
  title,
  description,
  icon,
  children
}: CalculatorShellProps) {
  return (
    <div className="container py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        {icon && (
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            {icon}
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600">
            {description}
          </p>
        )}
      </div>

      {/* 프리셋 */}
      {children.preset && (
        <div className="mb-6">
          {children.preset}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="mb-6">
        {children.input}
      </div>

      {/* 결과 영역 */}
      {children.result && (
        <div className="mb-6" id="result">
          {children.result}
        </div>
      )}

      {/* 해석 */}
      {children.interpretation && (
        <div className="mb-6">
          {children.interpretation}
        </div>
      )}

      {/* 면책 문구 */}
      {children.disclaimer && (
        <div className="mb-6">
          {children.disclaimer}
        </div>
      )}

      {/* 관련 도구 */}
      {children.related && (
        <div className="mb-6">
          {children.related}
        </div>
      )}

      {/* 추가 콘텐츠 */}
      {children.extra}
    </div>
  )
}
