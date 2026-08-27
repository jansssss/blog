import { describe, expect, it } from 'vitest'
import {
  HOME_GUIDE_LIMIT,
  STATIC_GUIDES,
  getGuideIndexItems,
  getHomeGuideItems,
  isNewGuide,
} from '../lib/guide-content'

const creditLineGuide = STATIC_GUIDES.find((guide) => guide.href === '/guide/credit-line-dsr')!

describe('guide content registry', () => {
  it('marks a guide as new for 21 days and expires the badge afterwards', () => {
    expect(isNewGuide(creditLineGuide, new Date('2026-09-16T00:00:00Z'))).toBe(true)
    expect(isNewGuide(creditLineGuide, new Date('2026-09-18T00:00:00Z'))).toBe(false)
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
})
