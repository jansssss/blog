/**
 * 핫이슈 트렌드 데이터 (단일 소스)
 * 새 이슈 추가 시 여기에만 추가하면 메인페이지 + /trend 페이지 동시 반영
 */

export interface TrendItem {
  href: string
  title: string
  description: string
  tag: string
  updatedAt: string
  badge: string
  badgeColor: string
  gradient: string
}

export const TREND_DATA: TrendItem[] = [
  {
    href: '/trend/us-iran-oil',
    badge: '지정학',
    badgeColor: 'bg-orange-600',
    title: '미국·이란 전쟁과 유가 급등: 한국 경제는 어떻게 흔들리나',
    description: '호르무즈 봉쇄 시나리오·역사적 오일쇼크 사례·산업별 영향 완전 분석',
    tag: '유가·지정학 리스크',
    gradient: 'from-orange-700 to-red-900',
    updatedAt: '2026.03.13',
  },
  {
    href: '/trend/capital-market-shift',
    badge: '핵심분석',
    badgeColor: 'bg-slate-700',
    title: '자본시장 정상화, 부동산 공화국 해체: 돈의 흐름은 어디로 가나',
    description: '대출 규제와 양도세 이슈를 연결해 2026년 자산배분의 변화 방향을 분석',
    tag: '자산배분 전략',
    gradient: 'from-slate-800 to-blue-700',
    updatedAt: '2026.02.26',
  },
  {
    href: '/trend/capital-gains-tax',
    badge: '양도세',
    badgeColor: 'bg-red-500',
    title: '1가구 2주택 양도세, 지금 팔면 얼마?',
    description: '비과세 요건·일시적 2주택 특례·중과세율 완전 분석',
    tag: '부동산 세금',
    gradient: 'from-red-600 to-orange-500',
    updatedAt: '2026.02.21',
  },
  {
    href: '/trend/multi-home-loan',
    badge: '대출규제',
    badgeColor: 'bg-blue-600',
    title: '다주택자 대출, 지금 어디까지 막혔나?',
    description: '스트레스 DSR 2단계·2주택 주담대 금지·갭투자 차단 현황',
    tag: '대출 정책',
    gradient: 'from-blue-700 to-indigo-600',
    updatedAt: '2026.02.21',
  },
]

/** 날짜 내림차순 정렬 */
export const getSortedTrends = () =>
  [...TREND_DATA].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

/** 메인페이지용 최신 N개 */
export const getLatestTrends = (count = 3) => getSortedTrends().slice(0, count)
