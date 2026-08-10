'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { SiteTheme } from '@/lib/site'

interface SubMenuItem {
  label: string
  href: string
  description?: string
}

interface NavItem {
  label: string
  href: string
  subItems?: SubMenuItem[]
}

interface HeaderProps {
  siteTheme?: SiteTheme
  siteName?: string
}

// ohyess 사이트용 네비게이션 (하위 메뉴 포함)
const OHYESS_NAV: NavItem[] = [
  {
    label: '금융 도구',
    href: '/calculator',
    subItems: [
      { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '예상 이자 계산' },
      { label: '월 상환 부담 계산기', href: '/calculator/repayment-burden', description: '소득 대비 상환 부담' },
      { label: '금리 변동 영향', href: '/calculator/rate-change-impact', description: '금리 변화 시뮬레이션' },
      { label: '중도상환 vs 유지 비교', href: '/calculator/prepayment-comparison', description: '절감액과 수수료 비교' },
      { label: '비상자금 계산기', href: '/calculator/emergency-fund', description: '권장 비상자금 확인' },
    ]
  },
  {
    label: '금융 비교',
    href: '/compare',
    subItems: [
      { label: '은행별 금리 비교', href: '/compare/bank-rates', description: '금감원 공시 실데이터' },
      { label: '고정 vs 변동금리', href: '/compare/fixed-vs-variable', description: '손익분기 계산' },
      { label: '대출 종류 고르기', href: '/compare/loan-products', description: '유형별 특징 안내' },
      { label: '정책자금 찾기', href: '/compare/policy-loans', description: '기관별 정부 지원 대출' },
    ]
  },
  {
    label: '정책 지원',
    href: '/policy',
    subItems: [
      { label: '청년 금융 지원', href: '/policy/youth', description: '청년 지원 정책' },
      { label: '소상공인 지원', href: '/policy/small-business', description: '소상공인·자영업자' },
      { label: '중소기업 정책자금', href: '/policy/sme', description: '중소기업 지원' },
      { label: '주거 지원', href: '/policy/housing', description: '전세·월세 지원' },
    ]
  },
  {
    label: '가이드',
    href: '/guide',
    subItems: [
      { label: '대출이자 계산법', href: '/guide/loan-interest', description: '이자 계산 공식 · 상환방식별 차이' },
      { label: 'DSR·DTI·LTV 정리', href: '/guide/dsr-dti-ltv', description: '대출 한도 결정 3가지 지표' },
      { label: '상환방식 완전 비교', href: '/guide/repayment-types', description: '원리금균등 vs 원금균등 vs 만기일시' },
      { label: '중도상환수수료', href: '/guide/early-repayment-fee', description: '수수료 계산 · 면제 조건' },
      { label: '신용점수 관리', href: '/guide/credit-score', description: '점수 올리는 방법 · 금리 영향' },
      { label: '대출 체크리스트', href: '/guide/loan-checklist', description: '신청 전 반드시 확인할 항목' },
    ],
  },
]

export default function Header({ siteTheme, siteName }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null)

  // 테마에서 값 추출
  const headerTitle = siteTheme?.header?.title || siteName || 'ohyess'

  const navItems: NavItem[] = OHYESS_NAV

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileSubmenuOpen(null)
  }

  /** 페이지가 바뀌면 시트를 닫는다 (Link 클릭 외 뒤로가기 등도 포함) */
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileSubmenuOpen(null)
  }, [pathname])

  /** 현재 보고 있는 섹션의 하위 메뉴는 펼친 상태로 연다 */
  useEffect(() => {
    if (!mobileMenuOpen) return
    const current = navItems.find(
      (item) => item.subItems && pathname.startsWith(item.href)
    )
    if (current) setMobileSubmenuOpen(current.label)
    // navItems 는 모듈 상수라 재생성되지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileMenuOpen, pathname])

  /** 전체화면 시트가 열려 있는 동안 배경 스크롤을 잠근다 */
  useEffect(() => {
    if (!mobileMenuOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileMenuOpen])

  /** ESC 로 닫기 */
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    /* 시트는 header 밖에 둔다. header 의 backdrop-filter 가 자손 fixed 요소의
     * 컨테이닝 블록이 되어, 안에 두면 top-16/bottom-0 이 64px 짜리 header 박스
     * 기준으로 계산돼 높이 0 이 된다(= 열려도 안 보임). */
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="ohyess-logo group" onClick={closeMobileMenu}>
          <svg className="pixel-o w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect className="px" x="10" y="2"  width="5" height="5" rx="1" fill="#8b7ad8" opacity="0.45"/>
            <rect className="px" x="16" y="2"  width="5" height="5" rx="1" fill="#8b7ad8" opacity="0.7"/>
            <rect className="px" x="22" y="2"  width="5" height="5" rx="1" fill="#6cb4ee" opacity="0.5"/>
            <rect className="px" x="4"  y="8"  width="5" height="5" rx="1" fill="#8b7ad8" opacity="0.8"/>
            <rect className="px" x="28" y="8"  width="5" height="5" rx="1" fill="#6cb4ee" opacity="0.85"/>
            <rect className="px" x="4"  y="14" width="5" height="5" rx="1" fill="#8b7ad8" opacity="1"/>
            <rect className="px" x="28" y="14" width="5" height="5" rx="1" fill="#7c9ee8" opacity="0.9"/>
            <rect className="px" x="4"  y="20" width="5" height="5" rx="1" fill="#9b8be0" opacity="0.75"/>
            <rect className="px" x="28" y="20" width="5" height="5" rx="1" fill="#6cb4ee" opacity="0.65"/>
            <rect className="px" x="10" y="26" width="5" height="5" rx="1" fill="#9b8be0" opacity="0.5"/>
            <rect className="px" x="16" y="26" width="5" height="5" rx="1" fill="#7c9ee8" opacity="0.6"/>
            <rect className="px" x="22" y="26" width="5" height="5" rx="1" fill="#6cb4ee" opacity="0.4"/>
            <rect className="gx" x="34" y="5"  width="3" height="3" rx="0.5" fill="#6cb4ee" opacity="0"/>
            <rect className="gx" x="-1" y="22" width="3" height="3" rx="0.5" fill="#8b7ad8" opacity="0"/>
            <rect className="gx" x="30" y="29" width="2.5" height="2.5" rx="0.5" fill="#6cb4ee" opacity="0"/>
          </svg>
          <span className="ohyess-wm text-lg sm:text-xl transition-all duration-300 group-hover:tracking-wide">
            {headerTitle}
          </span>
        </Link>

        {/* ── 데스크탑 네비게이션 ────────────────────────────────────
         *  드롭다운은 조건부 렌더가 아니라 CSS 로 감춘다. 조건부로 만들면
         *  하위 링크가 초기 HTML 에 아예 존재하지 않아 내부 링크로 세어지지
         *  않는다. */}
        <nav className="ml-auto hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.subItems && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : ''
                }`}
              >
                {item.label}
                {item.subItems && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                )}
              </Link>

              {item.subItems && (
                <div
                  className={`absolute top-full left-0 pt-1 z-50 transition-opacity duration-150 ${
                    openDropdown === item.label
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible pointer-events-none'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-lg border py-2 min-w-[220px]">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="block text-sm font-medium text-gray-900">
                          {subItem.label}
                        </span>
                        {subItem.description && (
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {subItem.description}
                          </span>
                        )}
                      </Link>
                    ))}
                    <div className="border-t my-1" />
                    <Link
                      href={item.href}
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="block text-sm font-medium text-primary">
                        전체 {item.label} 보기 →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 모바일 메뉴 버튼 — 44px 터치 타깃 */}
        <button
          className="ml-auto md:hidden -mr-2 w-11 h-11 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </header>

      {/* ── 모바일 전체화면 시트 ───────────────────────────────────
       *  닫혀 있어도 마크업은 그대로 남긴다. `hidden` 으로만 감추므로
       *  하위 링크 전부가 모든 페이지의 HTML 에 포함된다. */}
      <div
        id="mobile-nav"
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-background overflow-y-auto overscroll-contain ${
          mobileMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <nav
          className="container py-3 flex flex-col"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
        >
          {navItems.map((item) => {
            const expanded = mobileSubmenuOpen === item.label

            if (!item.subItems) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center min-h-[52px] px-3 text-base font-semibold rounded-xl transition-colors hover:bg-accent ${
                    isActive(item.href) ? 'text-primary' : 'text-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              )
            }

            return (
              <div key={item.label} className="border-b border-gray-100 last:border-0">
                <button
                  type="button"
                  onClick={() => setMobileSubmenuOpen(expanded ? null : item.label)}
                  aria-expanded={expanded}
                  className={`flex items-center justify-between w-full min-h-[52px] px-3 text-base font-semibold rounded-xl transition-colors hover:bg-accent ${
                    isActive(item.href) ? 'text-primary' : 'text-gray-800'
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>

                <div className={`pb-2 ${expanded ? 'block' : 'hidden'}`}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center min-h-[44px] pl-6 pr-3 text-sm font-semibold text-primary rounded-xl hover:bg-accent"
                  >
                    전체 {item.label} 보기 →
                  </Link>
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={closeMobileMenu}
                      className={`flex flex-col justify-center min-h-[48px] py-1.5 pl-6 pr-3 rounded-xl hover:bg-accent transition-colors ${
                        isActive(subItem.href) ? 'bg-accent' : ''
                      }`}
                    >
                      <span
                        className={`text-sm font-medium leading-snug ${
                          isActive(subItem.href) ? 'text-primary' : 'text-gray-700'
                        }`}
                      >
                        {subItem.label}
                      </span>
                      {subItem.description && (
                        <span className="text-xs text-gray-400 leading-snug mt-0.5">
                          {subItem.description}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </>
  )
}
