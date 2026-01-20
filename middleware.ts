import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 멀티사이트 접근 제어 미들웨어
 *
 * 원칙:
 * - 메인 사이트(ohyess.kr)에서만 /admin 라우트 접근 가능
 * - 서브사이트(sureline.kr 등)에서는 /admin 라우트 차단 (404)
 */

// 메인 사이트 도메인 목록 (관리 기능 허용)
const MAIN_SITE_DOMAINS = [
  'ohyess.kr',
  'www.ohyess.kr',
  'localhost',      // 개발 환경
  '127.0.0.1',      // 개발 환경
]

// 관리자 라우트 패턴
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
]

function normalizeDomain(host: string): string {
  return host
    .toLowerCase()
    .replace(/:\d+$/, '') // 포트 제거
    .trim()
}

function isMainSite(host: string): boolean {
  const normalized = normalizeDomain(host)
  return MAIN_SITE_DOMAINS.some(domain =>
    normalized === domain || normalized.endsWith(`.${domain}`)
  )
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 관리자 라우트가 아니면 통과
  if (!isAdminRoute(pathname)) {
    return NextResponse.next()
  }

  // host 헤더 확인 (x-forwarded-host 우선)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')
  const currentHost = forwardedHost || host || 'localhost'

  // 메인 사이트면 통과
  if (isMainSite(currentHost)) {
    return NextResponse.next()
  }

  // 서브사이트에서 admin 접근 시도 → 404 반환
  console.log(`[Middleware] Admin access blocked for ${currentHost} on ${pathname}`)

  // API 라우트는 JSON 에러 응답
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: '이 사이트에서는 관리 기능을 사용할 수 없습니다.' },
      { status: 404 }
    )
  }

  // 일반 라우트는 홈으로 리다이렉트
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // admin 라우트만 매칭
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
