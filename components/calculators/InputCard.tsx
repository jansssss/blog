import { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface InputCardProps {
  title?: string
  description?: string
  children: ReactNode
}

/**
 * 계산기 입력 폼을 담는 카드
 */
export default function InputCard({
  title = '정보 입력',
  description,
  children
}: InputCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
      </CardContent>
    </Card>
  )
}

interface InputFieldProps {
  label: string
  unit?: string
  helpText?: string
  optional?: boolean
  children: ReactNode
}

/**
 * 개별 입력 필드 래퍼
 */
export function InputField({
  label,
  unit,
  helpText,
  optional,
  children
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {label}
        {unit && <span className="text-gray-500 font-normal">({unit})</span>}
        {optional && (
          <span className="text-xs font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            선택
          </span>
        )}
      </label>
      {children}
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
}
