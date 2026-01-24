interface InterpretationProps {
  lines: string[]
}

/**
 * 결과 해석 블록 (중립적 참고 문구)
 */
export default function Interpretation({ lines }: InterpretationProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <p className="text-sm font-medium text-gray-700 mb-2">참고 사항</p>
      <ul className="space-y-1.5">
        {lines.map((line, idx) => (
          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">·</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
