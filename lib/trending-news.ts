/**
 * 트렌딩 뉴스 수집 유틸리티
 * - 네이버 뉴스 인기순 스크래핑
 * - 구글 트렌드 키워드 가져오기
 */

import { load } from 'cheerio'

export interface TrendingNewsItem {
  title: string
  link: string
  source: string
  category: string
  rank?: number
}

export interface TrendKeyword {
  keyword: string
  rank: number
}

/**
 * 네이버 뉴스 인기순 스크래핑
 * 금융/대출 관련 인기 뉴스 가져오기
 */
export async function fetchNaverPopularNews(category: string = '금융/대출'): Promise<TrendingNewsItem[]> {
  const items: TrendingNewsItem[] = []

  try {
    // 네이버 경제 섹션 URL
    const url = 'https://news.naver.com/main/ranking/popularDay.naver?mid=etc&sid1=101'

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })

    if (!response.ok) {
      console.error(`[TRENDING] Naver fetch failed: ${response.status}`)
      return items
    }

    const html = await response.text()
    const $ = load(html)

    // 금융/대출 관련 통합 키워드 (대출, 금리, 보험, 세금, 정책 등 모두 포함)
    const financialKeywords = [
      '금융', '경제', '대출', '금리', '주택담보대출', 'DSR', 'LTV',
      '보험', '세금', '연금', '국세', '지방세', '소득세', '부가세', '종합소득', '연말정산',
      '건강보험', '자동차보험', '생명보험', '은행', '저축', '예금',
      '주식', '투자', '환율', '코스피', '코스닥', '증권', '펀드', '부동산',
      // 정책 관련 키워드
      '금융위원회', '금융위', '금감원', '금융감독원', 'FSC', '정책', '규제',
      '금융정책', '통화정책', '한국은행', '기준금리', '금융당국'
    ]

    // 랭킹 뉴스 아이템 파싱
    $('.rankingnews_list li, .ranking_list li').each((index, element) => {
      if (items.length >= 20) return false

      const $item = $(element)
      const $link = $item.find('a').first()
      const title = $link.text().trim() || $item.find('.list_title, .ranking_title').text().trim()
      const link = $link.attr('href')

      if (title && link) {
        // 키워드 필터링
        const isRelevant = financialKeywords.some(kw => title.includes(kw))

        if (isRelevant) {
          items.push({
            title,
            link: link.startsWith('http') ? link : `https://news.naver.com${link}`,
            source: 'NAVER',
            category,
            rank: index + 1
          })
        }
      }
    })

    console.log(`[TRENDING] Naver ${category}: ${items.length} items`)
    return items

  } catch (error) {
    console.error(`[TRENDING] Naver scraping error:`, error)
    return items
  }
}

/**
 * 구글 트렌드 실시간 검색어 가져오기
 * RSS 피드 활용
 */
export async function fetchGoogleTrends(): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = []

  try {
    // 구글 트렌드 한국 RSS
    const response = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.error(`[TRENDING] Google Trends fetch failed: ${response.status}`)
      return keywords
    }

    const xml = await response.text()
    const $ = load(xml, { xmlMode: true })

    $('item').each((index, element) => {
      if (keywords.length >= 20) return false

      const title = $(element).find('title').text().trim()
      if (title) {
        keywords.push({
          keyword: title,
          rank: index + 1
        })
      }
    })

    console.log(`[TRENDING] Google Trends: ${keywords.length} keywords`)
    return keywords

  } catch (error) {
    console.error(`[TRENDING] Google Trends error:`, error)
    return keywords
  }
}

/**
 * 트렌드 키워드로 뉴스 필터링
 * RSS에서 가져온 뉴스 중 트렌드 키워드와 매칭되는 것 우선
 */
export function filterByTrends<T extends { title: string }>(
  items: T[],
  trendKeywords: TrendKeyword[]
): T[] {
  if (trendKeywords.length === 0) return items

  const keywordSet = new Set(trendKeywords.map(k => k.keyword.toLowerCase()))

  // 트렌드 매칭 점수 계산
  const scored = items.map(item => {
    const titleLower = item.title.toLowerCase()
    let score = 0

    for (const trend of trendKeywords) {
      const kw = trend.keyword.toLowerCase()
      if (titleLower.includes(kw)) {
        // 순위가 높을수록 높은 점수 (1위 = 20점, 20위 = 1점)
        score += (21 - trend.rank)
      }
    }

    return { item, score }
  })

  // 점수순 정렬 (높은 점수 우선, 동점이면 원래 순서 유지)
  scored.sort((a, b) => b.score - a.score)

  return scored.map(s => s.item)
}

/**
 * 네이버 인기 뉴스와 RSS 뉴스 병합 (중복 제거)
 */
export function mergeNewsItems<T extends { title: string; link: string }>(
  naverItems: TrendingNewsItem[],
  rssItems: T[],
  maxItems: number = 10
): (TrendingNewsItem | T)[] {
  const seen = new Set<string>()
  const result: (TrendingNewsItem | T)[] = []

  // 네이버 인기 뉴스 먼저 추가 (최대 5개)
  for (const item of naverItems) {
    if (result.length >= Math.min(5, maxItems / 2)) break

    const key = item.title.slice(0, 30).toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }

  // RSS 뉴스 추가 (나머지)
  for (const item of rssItems) {
    if (result.length >= maxItems) break

    const key = item.title.slice(0, 30).toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }

  return result
}
