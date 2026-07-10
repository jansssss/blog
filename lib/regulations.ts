/**
 * 금융 규정 상수 — 화면에 직접 하드코딩하지 말고 이 파일을 단일 출처로 사용한다.
 *
 * 수치는 반드시 금융위원회 공식 자료로 확인 후 갱신하고, 확인 근거(source)와
 * 검토일(verifiedOn)을 함께 기록한다. 확인할 수 없는 값은 추측해서 넣지 않는다.
 *
 * 최근 확인: 2026-07-10 — 금융위원회 「3단계 스트레스 DSR 시행방안」(2025.6. 발표)
 *   시행일 2025-07-01 / 기본 스트레스 금리 1.50%p(변동형 100% 기준)
 *   지방(서울·경기·인천 제외) 주담대 0.75% (2025년말까지 한시)
 *   신용대출은 잔액 1억원 초과 시에만 스트레스 금리 부과
 *   금리유형별 적용비율: 변동형 100% > 고정 혼합형·주기형은 고정기간 길수록 하향
 *   ※ 2026년 운영방향에서 지역·규제지역별 상·하한이 조정될 수 있어 재확인 필요.
 */

export interface StressDsrRegulation {
  /** 규제 단계 명칭 */
  stage: string
  /** 시행 기준일 (ISO) */
  effectiveFrom: string
  /** 기본 스트레스 금리(%p) — 변동형 100% 적용, 수도권·기본 기준 */
  baseStressRate: number
  /** 지방(비수도권) 주담대 한시 완화 스트레스 금리 */
  regional: { label: string; rate: number; until: string }
  /** 신용대출 스트레스 금리 부과 기준 잔액(원) */
  creditLoanThreshold: number
  /** 금리유형별 적용비율 요약 */
  rateTypeNote: string
  /** 계산기에서 반영하지 않은 조건 목록 */
  unappliedFactors: string[]
  /** 공식 출처 URL */
  source: string
  /** 출처 표기명 */
  sourceLabel: string
  /** 최종 확인일 (ISO) */
  verifiedOn: string
}

export const DSR_REGULATION = {
  /** 업권별 DSR 한도(%) */
  limits: { 은행권: 40, 제2금융권: 50 } as const,

  stressDsr: {
    stage: '3단계',
    effectiveFrom: '2025-07-01',
    baseStressRate: 1.5,
    regional: { label: '지방(서울·경기·인천 제외) 주담대', rate: 0.75, until: '2025-12-31' },
    creditLoanThreshold: 100_000_000,
    rateTypeNote:
      '변동형 100% 적용, 혼합형·주기형은 고정기간이 길수록 적용비율이 낮아짐(장기 고정형 일부 미적용)',
    unappliedFactors: [
      '지역·규제지역별 차등 및 금리유형별 적용비율',
      '금융기관별 소득 인정 방식·내부 심사 기준',
      'DSR 산정 제외 대출(전세자금·중도금 등)',
    ],
    source: 'https://www.fsc.go.kr/no010101/84617',
    sourceLabel: '금융위원회 「3단계 스트레스 DSR 시행방안」(2025.6.)',
    verifiedOn: '2026-07-10',
  } satisfies StressDsrRegulation,
} as const

/** 계산기 신뢰 정보 공통 기준 — 방법론/규정 검토 시점을 한 곳에서 관리 */
export const CALC_TRUST = {
  /** 계산 방식·규정을 마지막으로 검토·확인한 날짜 (ISO) */
  lastReviewed: '2026-07-10',
  /** 계산기 공통 공식 출처 */
  sources: [
    { label: '금융위원회', url: 'https://www.fsc.go.kr' },
    { label: '금융감독원', url: 'https://www.fss.or.kr' },
    { label: '한국주택금융공사', url: 'https://www.hf.go.kr' },
  ],
} as const

/** 날짜를 'YYYY년 M월 D일' 형태로 변환 */
export function formatKoreanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${y}년 ${m}월${d ? ` ${d}일` : ''}`
}

/** DisclaimerNotice의 basis 등에 넣을 스트레스 DSR 계산 기준 한 줄 문구 */
export function dsrBasisLine(): string {
  const s = DSR_REGULATION.stressDsr
  return (
    `스트레스 DSR ${s.stage} 적용(${formatKoreanDate(s.effectiveFrom)}~) · ` +
    `기본 스트레스 금리 ${s.baseStressRate}%p · ` +
    `업권별 DSR 한도 은행권 ${DSR_REGULATION.limits.은행권}%·2금융권 ${DSR_REGULATION.limits.제2금융권}% · ` +
    `${s.sourceLabel} 기준`
  )
}
