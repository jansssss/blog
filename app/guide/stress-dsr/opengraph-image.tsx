import { ImageResponse } from 'next/og'

export const alt = '스트레스 DSR 계산기 — 연봉·지역·금리 유형별 주담대 한도 비교'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 코드로 생성하는 공유 이미지. 외부 폰트·이미지 API 의존 없이 렌더링합니다.
export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px', color: '#ffffff', background: 'linear-gradient(120deg, #312e81, #2563eb)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 27, color: '#c7d2fe' }}><span>ohyess.kr</span><span>2026 · LOAN CALCULATOR</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><span style={{ fontSize: 86, fontWeight: 700 }}>STRESS DSR</span><span style={{ fontSize: 34, color: '#e0e7ff' }}>Your income. Your rate. Your loan limit.</span></div>
      <div style={{ display: 'flex', gap: 20, fontSize: 26 }}>
        {['6 EXAMPLES', 'LIVE COMPARISON', 'FREE'].map(label => <div key={label} style={{ display: 'flex', border: '1px solid #a5b4fc', borderRadius: 16, padding: '16px 22px' }}>{label}</div>)}
      </div>
    </div>, size,
  )
}
