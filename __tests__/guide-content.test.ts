import { describe, expect, it } from 'vitest'
import {
  HOME_GUIDE_LIMIT,
  NEW_GUIDE_WINDOW_HOURS,
  STATIC_GUIDES,
  getGuideIndexItems,
  getHomeGuideItems,
  isGscHitGuide,
  isNewGuide,
} from '../lib/guide-content'

const creditLineGuide = STATIC_GUIDES.find((guide) => guide.href === '/guide/credit-line-dsr')!
const incomeProofGuide = STATIC_GUIDES.find((guide) => guide.href === '/guide/dsr-income-proof')!
const loanGuaranteeGuide = STATIC_GUIDES.find((guide) => guide.href === '/guide/loan-guarantee')!

describe('guide content registry', () => {
  it('marks a guide as new for exactly 48 hours and expires the badge afterwards', () => {
    expect(NEW_GUIDE_WINDOW_HOURS).toBe(48)
    expect(isNewGuide(creditLineGuide, new Date('2026-08-28T14:59:59Z'))).toBe(true)
    expect(isNewGuide(creditLineGuide, new Date('2026-08-28T15:00:00Z'))).toBe(false)
  })

  it('uses the exact publication timestamp when it is available', () => {
    expect(isNewGuide(incomeProofGuide, new Date('2026-09-13T11:10:01+09:00'))).toBe(true)
    expect(isNewGuide(incomeProofGuide, new Date('2026-09-13T11:10:02+09:00'))).toBe(false)
  })

  it('marks only registry entries that clear the GSC click and CTR thresholds as hits', () => {
    expect(isGscHitGuide(loanGuaranteeGuide)).toBe(true)
    expect(isGscHitGuide(creditLineGuide)).toBe(false)
  })

  it('keeps every static guide route unique', () => {
    const hrefs = STATIC_GUIDES.map((guide) => guide.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('places new content first in the guide index', () => {
    const guides = getGuideIndexItems(new Date('2026-08-28T00:00:00Z'))
    expect(guides[0].href).toBe('/guide/credit-line-dsr')
  })

  it('shows 12 unique homepage guides while keeping overflow items in the guide index', () => {
    const now = new Date('2026-08-28T00:00:00Z')
    const homeGuides = getHomeGuideItems(now)
    const indexGuides = getGuideIndexItems(now)

    expect(HOME_GUIDE_LIMIT).toBe(12)
    expect(homeGuides).toHaveLength(HOME_GUIDE_LIMIT)
    expect(new Set(homeGuides.map((guide) => guide.href)).size).toBe(HOME_GUIDE_LIMIT)
    expect(homeGuides[0].href).toBe('/guide/credit-line-dsr')
    expect(indexGuides.length).toBeGreaterThan(homeGuides.length)
    expect(indexGuides.every((guide) => STATIC_GUIDES.includes(guide))).toBe(true)
  })

  it('promotes a GSC hit into the homepage guide set', () => {
    const homeGuides = getHomeGuideItems(new Date('2026-09-20T00:00:00+09:00'))
    expect(homeGuides.some((guide) => guide.href === loanGuaranteeGuide.href)).toBe(true)
  })
})
