import { AlertCircle, BookOpen } from 'lucide-react'

interface DisclaimerNoticeProps {
  message?: string
  basis?: string
}

export default function DisclaimerNotice({
  message = '본 계산 결과는 참고용이며, 실제 금융 상품의 조건은 개인의 신용도, 소득, 담보 등에 따라 상이할 수 있습니다. 정확한 정보는 반드시 금융기관에 문의하시기 바랍니다.',
  basis,
}: DisclaimerNoticeProps) {
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-2">
      {basis && (
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            <span className="text-blue-500 font-semibold mr-1">📌 계산 기준</span>
            {basis}
          </p>
        </div>
      )}
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}
