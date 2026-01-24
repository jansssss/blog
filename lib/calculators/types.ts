// 계산기 공통 타입 정의

export interface Preset {
  id: string
  label: string
  description: string
  values: Record<string, string | number>
}

export interface KpiItem {
  label: string
  value: string
  subvalue?: string
  note?: string
  highlight?: boolean
}

export interface RelatedTool {
  title: string
  href: string
  description?: string
}
