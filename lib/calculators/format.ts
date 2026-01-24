// 계산기 숫자 포맷 유틸리티

/**
 * 숫자를 한국식 원화 표기로 변환
 * @param num 변환할 숫자
 * @param withUnit 원 단위 포함 여부
 */
export function formatKRW(num: number, withUnit = true): string {
  const formatted = new Intl.NumberFormat('ko-KR').format(Math.round(num))
  return withUnit ? `${formatted}원` : formatted
}

/**
 * 숫자를 천단위 콤마로 포맷
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(num))
}

/**
 * 콤마가 포함된 문자열을 숫자로 변환
 */
export function parseNumberInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * 숫자를 지정 범위로 제한
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 소수점 자릿수 반올림
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * 입력값을 콤마 포함 문자열로 변환 (입력 필드용)
 */
export function formatInputValue(value: string): string {
  const num = parseNumberInput(value)
  if (num === 0 && value === '') return ''
  return formatNumber(num)
}
