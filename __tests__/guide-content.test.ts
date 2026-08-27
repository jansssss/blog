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

  it('caps the homepage and does not duplicate a new evergreen guide', () => {
    const guides = getHomeGuideItems(new Date('2026-08-28T00:00:00Z'))
    expect(guides).toHaveLength(HOME_GUIDE_LIMIT)
    expect(new Set(guides.map((guide) => guide.href)).size).toBe(HOME_GUIDE_LIMIT)
    expect(guides[0].href).toBe('/guide/credit-line-dsr')
  })
})
