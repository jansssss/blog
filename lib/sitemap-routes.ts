import type { MetadataRoute } from 'next'

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

export interface StaticRoute {
  /** 루트 기준 경로. 예: '/guide/loan-interest' */
  path: string
  /** 콘텐츠가 실제로 바뀐 날 (YYYY-MM-DD). 생략하면 빌드 시각을 사용 — 피드성 페이지 전용 */
  lastModified?: string
  changeFrequency: ChangeFrequency
  priority: number
}

/**
 * 모든 사이트에 공통으로 존재하는 라우트.
 *
 * 이 저장소는 멀티사이트 구성이라 홈·블로그·약관류는 호스트와 무관하게 노출되고,
 * 금융 콘텐츠 섹션은 ohyess.kr에만 존재한다. 그 구분을 그대로 유지한다.
 */
export const COMMON_ROUTES: StaticRoute[] = [
  // 홈·목록 — 콘텐츠가 계속 추가되는 피드성 페이지
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },

  // 회사·정책 문서
  { path: '/about', lastModified: '2026-06-23', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', lastModified: '2026-04-21', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/editorial-policy', lastModified: '2026-03-25', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', lastModified: '2026-01-13', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terms', lastModified: '2025-12-16', changeFrequency: 'monthly', priority: 0.4 },
]

/**
 * ohyess.kr 전용 라우트 단일 출처.
 *
 * app/sitemap.ts가 이 목록만 보고 사이트맵을 만든다. 새 페이지를 추가하면
 * 여기에도 한 줄 추가해야 하며, 빠뜨리면 `npm run check:sitemap`이 잡아낸다.
 *
 * lastModified는 페이지 내용을 실제로 손본 날로 갱신한다. 손대지 않은 페이지의
 * 날짜를 올리면 크롤러에 잘못된 신선도 신호를 주게 되므로 그대로 두는 편이 낫다.
 */
export const OHYESS_ROUTES: StaticRoute[] = [
  // 섹션 인덱스
  { path: '/guide', lastModified: '2026-07-31', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/calculator', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/compare', lastModified: '2026-07-21', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/policy', lastModified: '2026-07-21', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/trend', lastModified: '2026-03-18', changeFrequency: 'weekly', priority: 0.8 },

  // 허브 (토픽 클러스터 진입점)
  { path: '/hub/dsr-guide', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/hub/refinancing-guide', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/hub/mortgage-preparation', lastModified: '2026-06-25', changeFrequency: 'monthly', priority: 0.8 },

  // 계산기
  { path: '/calculator/dsr-dti-ltv', lastModified: '2026-07-10', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/calculator/refinancing', lastModified: '2026-07-10', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/calculator/loan-interest', lastModified: '2026-07-10', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/calculator/loan-limit', lastModified: '2026-07-10', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/calculator/prepayment-fee', lastModified: '2026-07-10', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/calculator/repayment-compare', lastModified: '2026-07-10', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/calculator/emergency-fund', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/calculator/prepayment-comparison', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/calculator/rate-change-impact', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/calculator/repayment-burden', lastModified: '2026-07-01', changeFrequency: 'monthly', priority: 0.6 },

  // 가이드 — 2026-07-31 계산기 내부 링크 전면 재배선
  { path: '/guide/car-loan-dsr-impact', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/credit-score', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/dsr-dti-ltv', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/early-repayment-fee', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/jeonse-loan', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/loan-checklist', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/loan-guarantee', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/loan-interest', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/loan-rejection', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/loan-types-complete', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/ltv-ok-dsr-blocked', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/mortgage-loan', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/mortgage-salary-5000', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/rate-0p5-difference', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/rate-strategy', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guide/repayment-types', lastModified: '2026-07-31', changeFrequency: 'monthly', priority: 0.9 },

  // 비교 서비스
  { path: '/compare/bank-rates', lastModified: '2026-07-21', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/compare/fixed-vs-variable', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/compare/loan-products', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/compare/policy-loans', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.7 },

  // 정책지원
  { path: '/policy/eligibility', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/policy/housing', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/policy/youth', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/policy/small-business', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/policy/sme', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.7 },

  // 트렌드 — 시의성 콘텐츠라 에버그린 문서보다 낮게 둔다
  { path: '/trend/oil-shock-korea-strategy', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/trend/capital-market-shift', lastModified: '2026-04-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/trend/multi-home-loan', lastModified: '2026-04-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/trend/kospi-black-friday-june-2026', lastModified: '2026-06-08', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/trend/kospi-8300-ai-oil-investment', lastModified: '2026-05-28', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/trend/kospi-7800', lastModified: '2026-05-11', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/trend/capital-gains-tax', lastModified: '2026-04-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/trend/israel-iran-war', lastModified: '2026-04-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/trend/us-iran-oil', lastModified: '2026-04-21', changeFrequency: 'monthly', priority: 0.7 },
]

/**
 * 사이트맵에서 의도적으로 제외하는 라우트.
 * check:sitemap 스크립트가 "누락"으로 오탐하지 않도록 여기에 사유와 함께 남긴다.
 */
export const SITEMAP_EXCLUDED: Record<string, string> = {
  '/admin': '관리자 전용 — 비공개',
  '/search': '검색 결과 페이지 — 중복 콘텐츠라 색인 대상 아님',
}

export function toSitemapEntries(
  baseUrl: string,
  routes: StaticRoute[]
): MetadataRoute.Sitemap {
  return routes.map(({ path, lastModified, changeFrequency, priority }) => ({
    url: path === '/' ? baseUrl : `${baseUrl}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority,
  }))
}
