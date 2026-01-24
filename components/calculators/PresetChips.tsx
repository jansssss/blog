import { Preset } from '@/lib/calculators/types'
import { Button } from '@/components/ui/button'

interface PresetChipsProps {
  presets: Preset[]
  onSelect: (preset: Preset) => void
  title?: string
}

/**
 * 빠른 시작 예시 칩 버튼들
 */
export default function PresetChips({
  presets,
  onSelect,
  title = '빠른 시작 예시'
}: PresetChipsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            onClick={() => onSelect(preset)}
            variant="outline"
            className="bg-white h-auto py-2.5 px-3 flex flex-col items-start gap-0.5 hover:bg-gray-50"
          >
            <span className="font-medium text-sm text-gray-900">{preset.label}</span>
            <span className="text-xs text-gray-500">{preset.description}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
