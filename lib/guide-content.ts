const DAY_MS = 24 * 60 * 60 * 1000

export const NEW_GUIDE_WINDOW_DAYS = 21
export const HOME_GUIDE_LIMIT = 12

type GuideStyle = {
  cardBg: string
  borderAccent: string
  tagColor: string
  hoverBg: string
  hoverBorder: string
}

export type StaticGuide = GuideStyle & {
  title: string
  homeTitle?: string
  href: `/guide/${string}`
  description: string
  homeDescription?: string
  tag: string
  icon: string
  cluster: '대출 한도' | '주택담보대출' | '금리·상환' | '신용·심사' | '전세·보증'
  indexOrder: number
  publishedAt?: `${number}-${number}-${number}`
  reviewedAt?: `${number}-${number}-${number}`
  homeRank?: number
  featuredQuestion?: {
    rank: number
    question: string
    hint: string
    emoji: string
  }
}

const STYLES = {
  blue: {
    cardBg: 'bg-blue-50/60',
    borderAccent: 'border-l-blue-400',
    tagColor: 'bg-blue-100 text-blue-700',
    hoverBg: 'hover:bg-blue-100/60',
    hoverBorder: 'hover:border-l-blue-500',
  },
  purple: {
    cardBg: 'bg-purple-50/60',
    borderAccent: 'border-l-purple-400',
    tagColor: 'bg-purple-100 text-purple-700',
    hoverBg: 'hover:bg-purple-100/60',
    hoverBorder: 'hover:border-l-purple-500',
  },
  indigo: {
    cardBg: 'bg-indigo-50/60',
    borderAccent: 'border-l-indigo-400',
    tagColor: 'bg-indigo-100 text-indigo-700',
    hoverBg: 'hover:bg-indigo-100/60',
    hoverBorder: 'hover:border-l-indigo-500',
  },
  green: {
    cardBg: 'bg-green-50/60',
    borderAccent: 'border-l-green-400',
    tagColor: 'bg-green-100 text-green-700',
    hoverBg: 'hover:bg-green-100/60',
    hoverBorder: 'hover:border-l-green-500',
  },
  orange: {
    cardBg: 'bg-orange-50/60',
    borderAccent: 'border-l-orange-400',
    tagColor: 'bg-orange-100 text-orange-700',
    hoverBg: 'hover:bg-orange-100/60',
    hoverBorder: 'hover:border-l-orange-500',
  },
  teal: {
    cardBg: 'bg-teal-50/60',
    borderAccent: 'border-l-teal-400',
    tagColor: 'bg-teal-100 text-teal-700',
    hoverBg: 'hover:bg-teal-100/60',
    hoverBorder: 'hover:border-l-teal-500',
  },
  rose: {
    cardBg: 'bg-rose-50/60',
    borderAccent: 'border-l-rose-400',
    tagColor: 'bg-rose-100 text-rose-700',
    hoverBg: 'hover:bg-rose-100/60',
    hoverBorder: 'hover:border-l-rose-500',
  },
  emerald: {
    cardBg: 'bg-emerald-50/60',
    borderAccent: 'border-l-emerald-400',
    tagColor: 'bg-emerald-100 text-emerald-700',
    hoverBg: 'hover:bg-emerald-100/60',
    hoverBorder: 'hover:border-l-emerald-500',
  },
  amber: {
    cardBg: 'bg-amber-50/60',
    borderAccent: 'border-l-amber-400',
    tagColor: 'bg-amber-100 text-amber-700',
    hoverBg: 'hover:bg-amber-100/60',
    hoverBorder: 'hover:border-l-amber-500',
  },
  sky: {
    cardBg: 'bg-sky-50/60',
    borderAccent: 'border-l-sky-400',
    tagColor: 'bg-sky-100 text-sky-700',
    hoverBg: 'hover:bg-sky-100/60',
    hoverBorder: 'hover:border-l-sky-500',
  },
  violet: {
    cardBg: 'bg-violet-50/60',
    borderAccent: 'border-l-violet-400',
    tagColor: 'bg-violet-100 text-violet-700',
    hoverBg: 'hover:bg-violet-100/60',
    hoverBorder: 'hover:border-l-violet-500',
  },
  pink: {
    cardBg: 'bg-pink-50/60',
    borderAccent: 'border-l-pink-400',
    tagColor: 'bg-pink-100 text-pink-700',
    hoverBg: 'hover:bg-pink-100/60',
    hoverBorder: 'hover:border-l-pink-500',
  },
} satisfies Record<string, GuideStyle>

// 정적 가이드의 단일 관리 원본입니다. 새 가이드는 이 배열에 한 번만 등록합니다.
export const STATIC_GUIDES: readonly StaticGuide[] = [
  {
    title: '전세대출 DSR 적용 계산',
    homeTitle: '전세대출 DSR 적용',
    href: '/guide/jeonse-loan-dsr',
    description: '1주택자의 전세대출 이자가 DSR에 들어가는 조건과 무주택자·정책대출·기존 계약 예외를 계산합니다.',
    homeDescription: '1주택자 적용 조건·이자 계산·예외',
    tag: '전세 DSR',
    icon: '🔑',
    cluster: '전세·보증',
    indexOrder: 1,
    publishedAt: '2026-08-31',
    reviewedAt: '2026-08-31',
    ...STYLES.emerald,
  },
  {
    title: '마이너스통장 DSR 계산법',
    homeTitle: '마이너스통장 DSR 계산',
    href: '/guide/credit-line-dsr',
    description: '잔액이 0원이어도 약정 한도가 반영되는 이유와 주담대 한도 차이를 내 숫자로 계산합니다.',
    homeDescription: '잔액 0원·약정 한도 반영 방식',
    tag: '대출 한도',
    icon: '🏦',
    cluster: '대출 한도',
    indexOrder: 2,
    publishedAt: '2026-08-27',
    reviewedAt: '2026-08-27',
    homeRank: 3,
    ...STYLES.indigo,
  },
  {
    title: '연봉 5천 주택담보대출 한도 계산',
    homeTitle: '연봉 5천 주담대 한도',
    href: '/guide/mortgage-salary-5000',
    description: '연봉 5천만원 기준 DSR 여유와 기존 대출을 반영해 실제 주담대 한도를 계산합니다.',
    homeDescription: '소득·기존 부채별 한도 계산',
    tag: '소득별 한도',
    icon: '🏠',
    cluster: '주택담보대출',
    indexOrder: 3,
    featuredQuestion: {
      rank: 1,
      question: '월급 5천이면 주담대 얼마까지?',
      hint: '소득별 한도 + DSR 즉시 계산',
      emoji: '🏠',
    },
    ...STYLES.indigo,
  },
  {
    title: '자동차 할부가 주담대 한도에 미치는 영향',
    homeTitle: '자동차 할부 DSR 영향',
    href: '/guide/car-loan-dsr-impact',
    description: '자동차 할부 월 납입액이 DSR과 주택담보대출 가능 한도를 얼마나 줄이는지 계산합니다.',
    homeDescription: '할부가 대출 한도를 깎는 구조',
    tag: '기존 부채',
    icon: '🚗',
    cluster: '대출 한도',
    indexOrder: 4,
    homeRank: 8,
    featuredQuestion: {
      rank: 2,
      question: '자동차 할부, 주담대 한도 얼마나 깎여?',
      hint: '할부 금액별 감소분 계산',
      emoji: '🚗',
    },
    ...STYLES.orange,
  },
  {
    title: 'LTV는 되는데 DSR에서 막히는 이유',
    href: '/guide/ltv-ok-dsr-blocked',
    description: '담보가치는 충분하지만 소득과 기존 부채 때문에 실제 대출 한도가 줄어드는 과정을 비교합니다.',
    tag: '한도 진단',
    icon: '🔒',
    cluster: '대출 한도',
    indexOrder: 5,
    featuredQuestion: {
      rank: 3,
      question: 'LTV는 되는데 왜 대출이 안 될까?',
      hint: 'LTV·DSR 동시 비교 + 실제 한도',
      emoji: '🔒',
    },
    ...STYLES.violet,
  },
  {
    title: '금리 0.5% 차이 계산',
    href: '/guide/rate-0p5-difference',
    description: '대출금액과 기간별로 금리 0.5%p 차이가 월 납입액과 총이자를 얼마나 바꾸는지 계산합니다.',
    homeDescription: '금액·기간별 총이자 차이 비교',
    tag: '금리 비교',
    icon: '📊',
    cluster: '금리·상환',
    indexOrder: 6,
    homeRank: 9,
    featuredQuestion: {
      rank: 4,
      question: '금리 0.5% 차이, 실제로 얼마나 달라?',
      hint: '금액·기간별 총이자 비교 계산',
      emoji: '📊',
    },
    ...STYLES.blue,
  },
  {
    title: '대출이자 계산법 완전 정리',
    href: '/guide/loan-interest',
    description: '원리금균등·원금균등·만기일시 상환 방식별 이자 차이, 변동 vs 고정금리, 직장인·자영업자 실전 사례 2개.',
    homeDescription: '상환방식·금리 유형별 이자 차이',
    tag: '대출 기초',
    icon: '💰',
    cluster: '금리·상환',
    indexOrder: 7,
    homeRank: 4,
    ...STYLES.blue,
  },
  {
    title: 'DSR·DTI·LTV 완전 정리',
    href: '/guide/dsr-dti-ltv',
    description: '소득·자산 기준으로 실제 얼마까지 빌릴 수 있는지 3가지 지표로 계산하는 방법.',
    homeDescription: '대출 한도 결정 3가지 핵심 지표',
    tag: '대출 한도',
    icon: '📊',
    cluster: '대출 한도',
    indexOrder: 8,
    homeRank: 2,
    ...STYLES.purple,
  },
  {
    title: '상환방식 완전 비교',
    href: '/guide/repayment-types',
    description: '원리금균등·원금균등·만기일시 — 총이자와 월납입액 차이, 내 상황에 맞는 선택 기준.',
    homeDescription: '원리금균등 vs 원금균등 총이자 차이',
    tag: '상환 전략',
    icon: '🔄',
    cluster: '금리·상환',
    indexOrder: 9,
    homeRank: 5,
    ...STYLES.green,
  },
  {
    title: '중도상환수수료 완전 정리',
    homeTitle: '중도상환수수료 정리',
    href: '/guide/early-repayment-fee',
    description: '수수료 계산 공식, 면제 조건, 중도상환 vs 유지 손익 판단 기준 완전 정리.',
    homeDescription: '수수료 계산·면제 조건·절약 전략',
    tag: '비용 절약',
    icon: '✂️',
    cluster: '금리·상환',
    indexOrder: 10,
    homeRank: 6,
    ...STYLES.orange,
  },
  {
    title: '신용점수 완전 정리',
    href: '/guide/credit-score',
    description: '신용점수 올리는 현실적인 방법, 점수별 대출 금리 차이, 직장인·자영업자 회복 사례.',
    tag: '신용 관리',
    icon: '⭐',
    cluster: '신용·심사',
    indexOrder: 11,
    ...STYLES.teal,
  },
  {
    title: '대출 전 필수 체크리스트',
    homeTitle: '대출 전 체크리스트',
    href: '/guide/loan-checklist',
    description: '대출 신청 전 반드시 확인할 7가지 비교 포인트와 계약서 필수 확인 항목.',
    homeDescription: '놓치면 후회하는 10가지 확인 항목',
    tag: '실전 가이드',
    icon: '✅',
    cluster: '신용·심사',
    indexOrder: 12,
    homeRank: 7,
    ...STYLES.rose,
  },
  {
    title: '주택담보대출 완전 정리',
    href: '/guide/mortgage-loan',
    description: '주담대 종류부터 LTV·DSR·DTI 한도 계산, 금리 비교, 신청·실행 7단계 절차까지 2026년 기준 완전 정리.',
    homeDescription: '한도·금리·절차 한 번에 이해하기',
    tag: '주담대',
    icon: '🏠',
    cluster: '주택담보대출',
    indexOrder: 13,
    homeRank: 1,
    ...STYLES.indigo,
  },
  {
    title: '전세대출 완전 정리',
    href: '/guide/jeonse-loan',
    description: '버팀목·HF·시중은행 전세대출 비교, 보증 기관 선택법, 전세 사기 예방 체크리스트까지.',
    tag: '전세 대출',
    icon: '🔑',
    cluster: '전세·보증',
    indexOrder: 14,
    ...STYLES.emerald,
  },
  {
    title: '금리 인상기 대출 전략',
    href: '/guide/rate-strategy',
    description: '고정·변동금리 선택 기준, 대환대출 손익 계산, 금리 인하 요구권 활용법 실전 정리.',
    tag: '금리 전략',
    icon: '📈',
    cluster: '금리·상환',
    indexOrder: 15,
    ...STYLES.amber,
  },
  {
    title: '대출 종류 완전 가이드',
    href: '/guide/loan-types-complete',
    description: '신용대출·주담대·전세대출·사업자대출·정책금융까지 목적·금리·조건별 완전 비교.',
    tag: '대출 종류',
    icon: '📋',
    cluster: '신용·심사',
    indexOrder: 16,
    ...STYLES.sky,
  },
  {
    title: '대출 보증보험 완전 정리',
    href: '/guide/loan-guarantee',
    description: 'HUG·HF·SGI 3대 보증 기관 비교, 전세보증보험 가입법, 보증료 계산과 절약 전략.',
    tag: '보증 보험',
    icon: '🛡️',
    cluster: '전세·보증',
    indexOrder: 17,
    ...STYLES.violet,
  },
  {
    title: '대출 거절 극복 전략',
    href: '/guide/loan-rejection',
    description: '거절의 5가지 핵심 이유, 신용점수·DSR 개선 전략, 대안 대출 경로까지 재신청 성공 가이드.',
    tag: '거절 극복',
    icon: '💪',
    cluster: '신용·심사',
    indexOrder: 18,
    ...STYLES.pink,
  },
]

function publishedTime(guide: StaticGuide): number {
  return guide.publishedAt ? Date.parse(`${guide.publishedAt}T00:00:00+09:00`) : 0
}

export function isNewGuide(guide: StaticGuide, now: Date = new Date()): boolean {
  const published = publishedTime(guide)
  if (!published) return false

  const age = now.getTime() - published
  return age >= 0 && age < NEW_GUIDE_WINDOW_DAYS * DAY_MS
}

export function getGuideIndexItems(now: Date = new Date()): StaticGuide[] {
  return [...STATIC_GUIDES].sort((a, b) => {
    const aIsNew = isNewGuide(a, now)
    const bIsNew = isNewGuide(b, now)
    if (aIsNew !== bIsNew) return aIsNew ? -1 : 1

    const dateDifference = publishedTime(b) - publishedTime(a)
    return dateDifference || a.indexOrder - b.indexOrder
  })
}

export function getHomeGuideItems(
  now: Date = new Date(),
  limit: number = HOME_GUIDE_LIMIT,
): StaticGuide[] {
  const indexItems = getGuideIndexItems(now)
  const published = indexItems.filter((guide) => guide.publishedAt)
  const evergreen = STATIC_GUIDES
    .filter((guide) => guide.homeRank !== undefined)
    .sort((a, b) => (a.homeRank ?? Number.MAX_SAFE_INTEGER) - (b.homeRank ?? Number.MAX_SAFE_INTEGER))

  return [
    ...new Map([...published, ...evergreen, ...indexItems].map((guide) => [guide.href, guide])).values(),
  ].slice(0, limit)
}

export function getFeaturedQuestions() {
  return STATIC_GUIDES
    .filter((guide) => guide.featuredQuestion)
    .sort((a, b) => (a.featuredQuestion?.rank ?? 0) - (b.featuredQuestion?.rank ?? 0))
    .map((guide) => ({
      q: guide.featuredQuestion!.question,
      hint: guide.featuredQuestion!.hint,
      href: guide.href,
      emoji: guide.featuredQuestion!.emoji,
    }))
}
