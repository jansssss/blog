'use client'

import Link from 'next/link'
import { useState } from 'react'
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
  isMainSite?: boolean
}

// ohyess 사이트용 네비게이션 (하위 메뉴 포함)
const OHYESS_NAV: NavItem[] = [
  {
    label: '계산기',
    href: '/calculator',
    subItems: [
      { label: '대출 이자 계산기', href: '/calculator/loan-interest', description: '예상 이자 계산' },
      { label: '원리금 vs 원금균등', href: '/calculator/repayment-compare', description: '상환 방식 비교' },
      { label: '대출 한도 시뮬레이터', href: '/calculator/loan-limit', description: '예상 한도 확인' },
      { label: '중도상환수수료', href: '/calculator/prepayment-fee', description: '조기 상환 수수료' },
    ]
  },
  {
    label: '금융 비교',
    href: '/compare',
    subItems: [
      { label: '은행별 금리 비교', href: '/compare/bank-rates', description: '주요 은행 금리' },
      { label: '대출 상품 비교', href: '/compare/loan-products', description: '상품별 조건 비교' },
      { label: '고정 vs 변동금리', href: '/compare/fixed-vs-variable', description: '금리 유형 비교' },
      { label: '정책자금 비교', href: '/compare/policy-loans', description: '정부 지원 대출' },
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
  { label: '가이드', href: '/guide' },
  { label: '소개', href: '/about' },
]

// sureline 사이트용 네비게이션
const SURELINE_NAV: NavItem[] = [
  {
    label: '보험 도구',
    href: '/tools/auto-discount-check',
    subItems: [
      { label: '자동차보험 할인 체크', href: '/tools/auto-discount-check', description: '할인 항목 확인' },
      { label: '실비보험 중복 체크', href: '/tools/health-overlap-check', description: '중복 보장 확인' },
      { label: '보험 리모델링 체크', href: '/tools/insurance-remodel', description: '보험 점검' },
    ]
  },
  { label: '가이드', href: '/guide' },
  { label: '소개', href: '/about' },
]

export default function Header({ siteTheme, siteName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null)

  // 테마에서 값 추출
  const headerTitle = siteTheme?.header?.title || siteName || 'ohyess'
  const primaryColor = siteTheme?.brand?.primaryColor || '#111827'
  const accentColor = siteTheme?.brand?.accentColor || '#2563EB'

  // 사이트별 네비게이션 선택
  const navItems: NavItem[] = siteName?.toLowerCase() === 'sureline' ? SURELINE_NAV : OHYESS_NAV

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileSubmenuOpen(null)
  }

  const handleMouseEnter = (label: string) => {
    setOpenDropdown(label)
  }

  const handleMouseLeave = () => {
    setOpenDropdown(null)
  }

  const toggleMobileSubmenu = (label: string) => {
    setMobileSubmenuOpen(mobileSubmenuOpen === label ? null : label)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="group flex items-center" onClick={closeMobileMenu}>
          <span
            className="text-xl sm:text-2xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'brightness(1.1) saturate(0.9)'
            }}
          >
            {headerTitle}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.subItems && handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent"
              >
                {item.label}
                {item.subItems && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                )}
              </Link>

              {/* Dropdown Menu */}
              {item.subItems && openDropdown === item.label && (
                <div className="absolute top-full left-0 pt-1 z-50">
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
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="ml-auto md:hidden p-2 hover:bg-accent rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleMobileSubmenu(item.label)}
                      className="flex items-center justify-between w-full text-sm font-medium transition-colors hover:text-primary py-3 px-2 rounded-md hover:bg-accent"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenuOpen === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileSubmenuOpen === item.label && (
                      <div className="pl-4 pb-2 space-y-1">
                        <Link
                          href={item.href}
                          className="block text-sm text-primary font-medium py-2 px-2 rounded-md hover:bg-accent"
                          onClick={closeMobileMenu}
                        >
                          전체 보기
                        </Link>
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block text-sm text-gray-600 py-2 px-2 rounded-md hover:bg-accent hover:text-gray-900"
                            onClick={closeMobileMenu}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block text-sm font-medium transition-colors hover:text-primary py-3 px-2 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
