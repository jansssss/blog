import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Site 타입 정의
export interface Site {
  id: string
  domain: string
  name: string
  description: string | null
  theme_json: SiteTheme
  is_main: boolean
  created_at: string
  updated_at: string
}

export interface SiteTheme {
  brand?: {
    backgroundColor?: string
    textColor?: string
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
  header?: {
    title?: string
    topLinks?: Array<{ label: string; href: string; requiresAdmin?: boolean }>
    categoryTabs?: Array<{ label: string; href: string }>
  }
  homepage?: {
    heroTitle?: string
    heroSubtitle?: string
    hotKeywordsLabel?: string
    hotKeywords?: string[]
    sectionTitleLatest?: string
  }
  footer?: {
    links?: Array<{ label: string; href: string }>
    disclaimer?: string
    copyright?: string
    builtWith?: string
  }
  features?: {
    adminEnabled?: boolean
    editorEnabled?: boolean
    commentsEnabled?: boolean
    searchEnabled?: boolean
  }
  meta?: {
    siteName?: string
    defaultTitle?: string
    defaultDescription?: string
    ogImage?: string
    keywords?: string[]
  }
  widget?: {
    // 위젯 타입: 'weather-stock' (날씨+코스피), 'interest-rate' (금리정보), 'insurance' (보험정보), 'custom'
    type?: 'weather-stock' | 'interest-rate' | 'insurance' | 'custom'
    // 배경 그라데이션 (기본: 밝은 파스텔)
    gradient?: string
    // 테두리 색상
    borderColor?: string
  }
}

// 기본 위젯 스타일 (밝은 파스텔 테마)
export const DEFAULT_WIDGET_STYLE = {
  gradient: 'from-slate-50 via-blue-50 to-indigo-50',
  borderColor: 'border-gray-200',
}

// Supabase 클라이언트 (서버용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * 도메인 정규화 (www 제거, 소문자 변환, 포트 제거)
 */
export function normalizeDomain(host: string): string {
  return host
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/:\d+$/, '') // 포트 제거
    .trim()
}

/**
 * 현재 요청의 host 헤더에서 도메인 추출
 * x-forwarded-host → host 순서로 확인
 */
export async function getHostFromRequest(): Promise<string> {
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const host = headersList.get('host')

  return forwardedHost || host || 'localhost'
}

/**
 * 도메인으로 사이트 조회
 */
export async function getSiteByDomain(domain: string): Promise<Site | null> {
  const supabase = getSupabaseAdmin()
  const normalizedDomain = normalizeDomain(domain)

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('domain', normalizedDomain)
    .single()

  if (error || !data) {
    // 도메인 매칭 실패 시 메인 사이트 반환 (개발 환경 대응)
    const { data: mainSite } = await supabase
      .from('sites')
      .select('*')
      .eq('is_main', true)
      .single()

    return mainSite || null
  }

  return data
}

/**
 * 현재 요청 컨텍스트에서 사이트 정보 조회
 * 서버 컴포넌트/API 라우트에서 사용
 */
export async function getCurrentSite(): Promise<Site | null> {
  const host = await getHostFromRequest()
  return getSiteByDomain(host)
}

/**
 * 현재 요청 컨텍스트에서 site_id만 조회
 * 서버 컴포넌트/API 라우트에서 사용
 */
export async function getCurrentSiteId(): Promise<string | null> {
  const site = await getCurrentSite()
  return site?.id || null
}

/**
 * 현재 사이트가 메인(관리) 사이트인지 확인
 */
export async function isMainSite(): Promise<boolean> {
  const site = await getCurrentSite()
  return site?.is_main === true
}

/**
 * 모든 사이트 목록 조회 (관리자용)
 */
export async function getAllSites(): Promise<Site[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('is_main', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('[Site] 사이트 목록 조회 실패:', error)
    return []
  }

  return data || []
}

/**
 * site_id로 사이트 조회
 */
export async function getSiteById(siteId: string): Promise<Site | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single()

  if (error) {
    console.error('[Site] 사이트 조회 실패:', error)
    return null
  }

  return data
}
