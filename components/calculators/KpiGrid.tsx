import { KpiItem } from '@/lib/calculators/types'

interface KpiGridProps {
  items: KpiItem[]
  columns?: 2 | 3 | 4
}

/**
 * KPI 카드 그리드
 */
export default function KpiGrid({ items, columns = 3 }: KpiGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4'
  }

  return (
    <div className={`grid gap-3 ${gridCols[columns]}`}>
      {items.map((item, idx) => (
        <KpiCard key={idx} {...item} />
      ))}
    </div>
  )
}

function KpiCard({ label, value, subvalue, note, highlight }: KpiItem) {
  return (
    <div
      className={`p-4 rounded-lg ${
        highlight
          ? 'bg-primary/5 border border-primary/30'
          : 'bg-gray-50'
      }`}
    >
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-gray-900'}`}>
        {value}
      </p>
      {subvalue && (
        <p className="text-sm text-gray-500 mt-0.5">{subvalue}</p>
      )}
      {note && (
        <p className="text-xs text-gray-400 mt-1">{note}</p>
      )}
    </div>
  )
}

interface KpiCompareProps {
  label: string
  items: {
    name: string
    value: string
    color?: 'blue' | 'green' | 'amber'
  }[]
  diffLabel?: string
  diffValue?: string
}

/**
 * 두 값 비교용 KPI 카드
 */
export function KpiCompare({ label, items, diffLabel, diffValue }: KpiCompareProps) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900'
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${colorMap[item.color || 'blue']}`}
          >
            <p className="text-xs opacity-80 mb-0.5">{item.name}</p>
            <p className="text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </div>
      {diffLabel && diffValue && (
        <p className="text-xs text-gray-500 text-right">
          {diffLabel}: <span className="font-medium">{diffValue}</span>
        </p>
      )}
    </div>
  )
}
