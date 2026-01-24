import { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ResultSectionProps {
  title?: string
  summary?: string
  children: ReactNode
}

/**
 * 결과 섹션 래퍼 - #result 앵커 제공
 */
export default function ResultSection({
  title = '계산 결과',
  summary,
  children
}: ResultSectionProps) {
  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">{title}</CardTitle>
        {summary && (
          <p className="text-sm text-gray-600 mt-1">{summary}</p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
