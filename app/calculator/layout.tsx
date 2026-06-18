import CalculatorAd from '@/components/CalculatorAd'

/**
 * 계산기 섹션 공통 레이아웃.
 * 모든 계산기 페이지 하단에 광고를 일괄 적용한다(개별 페이지 수정 불필요).
 */
export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <CalculatorAd />
    </>
  )
}
