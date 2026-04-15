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
  badgeColor: string   // CSS 색상값 (인라인 스타일용)
  gradient: string     // CSS linear-gradient 값 (인라인 스타일용)
}

export const TREND_DATA: TrendItem[] = [
  {
    href: '/trend/oil-shock-korea-strategy',
    badge: '긴급분석',
    badgeColor: '#b45309',
    title: '이란-이스라엘-미국 확전: 유가·인플레이션 속 한국 생존 전략',
    description: '유가 폭등·글로벌 인플레이션 재점화가 내 가계를 흔드는 구조, 일본·중국 변수, 대출·자산·생활비 실전 대비 완전 분석',
    tag: '지정학·유가·가계경제',
    gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #dc2626 100%)',
    updatedAt: '2026.04.15',
  },
  {
    href: '/trend/israel-iran-war',
    badge: '전쟁·지정학',
    badgeColor: '#7c3aed',
    title: '이스라엘·이란 전쟁 장기화: 세계 경제는 어디로 가나',
    description: '네타냐후의 정치 위기 돌파·트럼프의 시선 돌리기·중동 전쟁이 한국 경제까지 흔드는 구조 완전 해부',
    tag: '중동 전쟁·세계경제',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #dc2626 100%)',
    updatedAt: '2026.03.30',
  },
  {
    href: '/trend/us-iran-oil',
    badge: '지정학',
    badgeColor: '#c2410c',
    title: '미국·이란 전쟁과 유가 급등: 한국 경제는 어떻게 흔들리나',
    description: '호르무즈 봉쇄 시나리오·역사적 오일쇼크 사례·산업별 영향 완전 분석',
    tag: '유가·지정학 리스크',
    gradient: 'linear-gradient(135deg, #c2410c 0%, #7f1d1d 100%)',
    updatedAt: '2026.03.13',
  },
  {
    href: '/trend/capital-market-shift',
    badge: '핵심분석',
    badgeColor: '#334155',
    title: '자본시장 정상화, 부동산 공화국 해체: 돈의 흐름은 어디로 가나',
    description: '대출 규제와 양도세 이슈를 연결해 2026년 자산배분의 변화 방향을 분석',
    tag: '자산배분 전략',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)',
    updatedAt: '2026.02.26',
  },
  {
    href: '/trend/capital-gains-tax',
    badge: '양도세',
    badgeColor: '#dc2626',
    title: '1가구 2주택 양도세, 지금 팔면 얼마?',
    description: '비과세 요건·일시적 2주택 특례·중과세율 완전 분석',
    tag: '부동산 세금',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
    updatedAt: '2026.02.21',
  },
  {
    href: '/trend/multi-home-loan',
    badge: '대출규제',
    badgeColor: '#2563eb',
    title: '다주택자 대출, 지금 어디까지 막혔나?',
    description: '스트레스 DSR 2단계·2주택 주담대 금지·갭투자 차단 현황',
    tag: '대출 정책',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
    updatedAt: '2026.02.21',
  },
]

/** 날짜 내림차순 정렬 */
export const getSortedTrends = () =>
  [...TREND_DATA].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

/** 메인페이지용 최신 N개 */
export const getLatestTrends = (count = 3) => getSortedTrends().slice(0, count)
