/**
 * RSS 뉴스 수집 API + 트렌딩 뉴스
 * Vercel Cron: 매일 1회 실행 (무료 플랜)
 * GET /api/cron/news-fetch
 *
 * 수집 방식:
 * 1. 네이버 뉴스 인기순 (조회수 기반)
 * 2. 구글 트렌드 키워드로 RSS 뉴스 필터링
 * 3. 기존 RSS 피드 수집
 */

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  fetchNaverPopularNews,
  fetchGoogleTrends,
  filterByTrends,
  type TrendingNewsItem,
  type TrendKeyword
} from '@/lib/trending-news'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60초 타임아웃 (트렌딩 수집 포함)

const parser = new Parser()

// SHA-256 해시 생성 (중복 체크용)
function generateHash(title: string, link: string): string {
  return createHash('sha256').update(`${title}${link}`).digest('hex')
}

export async function GET(request: Request) {
  try {
    console.log('[NEWS-FETCH] Starting RSS fetch...')

    // Authorization 헤더 검증 (Vercel Cron 또는 관리자만)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 활성화된 RSS 소스 가져오기
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('news_sources')
      .select('*')
      .eq('active', true)

    if (sourcesError) {
      console.error('[NEWS-FETCH] Sources error:', sourcesError)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    if (!sources || sources.length === 0) {
      console.log('[NEWS-FETCH] No active sources found')
      return NextResponse.json({
        success: true,
        message: 'No active sources',
        stats: { total: 0, new: 0, duplicate: 0 }
      })
    }

    let totalItems = 0
    let newItems = 0
    let duplicateItems = 0
    let trendingItems = 0

    // 1. 구글 트렌드 키워드 가져오기 (모든 카테고리에 적용)
    console.log('[NEWS-FETCH] Fetching Google Trends...')
    const trendKeywords = await fetchGoogleTrends()
    console.log(`[NEWS-FETCH] Got ${trendKeywords.length} trend keywords`)

    // 테마(카테고리)별로 그룹화
    const sourcesByCategory: Record<string, typeof sources> = {}
    for (const source of sources) {
      const category = source.category || '기타'
      if (!sourcesByCategory[category]) {
        sourcesByCategory[category] = []
      }
      sourcesByCategory[category].push(source)
    }

    // 테마별 최대 수집 개수
    const maxItemsPerCategory = 10

    // 각 테마별로 처리
    for (const [category, categorySources] of Object.entries(sourcesByCategory)) {
      console.log(`[NEWS-FETCH] Processing category: ${category} (${categorySources.length} sources)`)
      let categoryItemCount = 0

      // 2. 네이버 인기 뉴스 먼저 수집 (카테고리별 최대 5개)
      if (category === '금융/경제' || category === '보험/세금') {
        console.log(`[NEWS-FETCH] Fetching Naver popular news for ${category}...`)
        const naverNews = await fetchNaverPopularNews(category as '금융/경제' | '보험/세금')

        for (const naverItem of naverNews) {
          if (categoryItemCount >= 5) break // 네이버 뉴스는 최대 5개

          totalItems++
          trendingItems++

          const hash = generateHash(naverItem.title, naverItem.link)

          const { data, error } = await supabaseAdmin
            .from('news_items')
            .upsert(
              {
                source_id: null, // 네이버 인기뉴스는 source_id 없음
                title: naverItem.title,
                link: naverItem.link,
                pub_date: new Date().toISOString(),
                category: category,
                hash: hash,
                is_trending: true // 트렌딩 플래그
              },
              {
                onConflict: 'hash',
                ignoreDuplicates: true
              }
            )
            .select()

          if (error) {
            if (error.code === '23505') {
              duplicateItems++
            } else {
              console.error('[NEWS-FETCH] Naver insert error:', error)
            }
          } else if (data && data.length > 0) {
            newItems++
            categoryItemCount++
            console.log(`[NEWS-FETCH] Trending: ${naverItem.title}`)
          } else {
            duplicateItems++
          }
        }
      }

      // 3. RSS 피드에서 나머지 수집 (트렌드 키워드로 우선순위 정렬)
      const allRssItems: Array<{
        title: string
        link: string
        pubDate?: string
        sourceId: string
        category: string
      }> = []

      // 해당 테마의 각 RSS 소스에서 아이템 수집
      for (const source of categorySources) {
        try {
          console.log(`[NEWS-FETCH] Fetching from: ${source.name}`)
          const feed = await parser.parseURL(source.url)

          if (!feed.items || feed.items.length === 0) {
            console.log(`[NEWS-FETCH] No items in feed: ${source.name}`)
            continue
          }

          for (const item of feed.items) {
            if (!item.title || !item.link) continue

            allRssItems.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              sourceId: source.id,
              category: source.category
            })
          }

          // 마지막 수집 시간 업데이트
          await supabaseAdmin
            .from('news_sources')
            .update({ last_fetched_at: new Date().toISOString() })
            .eq('id', source.id)

        } catch (feedError) {
          console.error(`[NEWS-FETCH] Error fetching ${source.name}:`, feedError)
        }
      }

      // 트렌드 키워드로 RSS 아이템 정렬
      const sortedRssItems = filterByTrends(allRssItems, trendKeywords)
      console.log(`[NEWS-FETCH] Sorted ${sortedRssItems.length} RSS items by trends`)

      // 남은 슬롯에 RSS 뉴스 추가
      for (const item of sortedRssItems) {
        if (categoryItemCount >= maxItemsPerCategory) {
          console.log(`[NEWS-FETCH] Category ${category} reached limit (${maxItemsPerCategory})`)
          break
        }

        totalItems++

        const hash = generateHash(item.title, item.link)
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()

        const { data, error } = await supabaseAdmin
          .from('news_items')
          .upsert(
            {
              source_id: item.sourceId,
              title: item.title,
              link: item.link,
              pub_date: pubDate.toISOString(),
              category: item.category,
              hash: hash
            },
            {
              onConflict: 'hash',
              ignoreDuplicates: true
            }
          )
          .select()

        if (error) {
          if (error.code === '23505') {
            duplicateItems++
          } else {
            console.error('[NEWS-FETCH] Insert error:', error)
          }
        } else if (data && data.length > 0) {
          newItems++
          categoryItemCount++
          console.log(`[NEWS-FETCH] New item: ${item.title}`)
        } else {
          duplicateItems++
        }
      }
    }

    const stats = {
      total: totalItems,
      new: newItems,
      duplicate: duplicateItems,
      trending: trendingItems,
      trendKeywords: trendKeywords.length,
      sources: sources.length
    }

    console.log('[NEWS-FETCH] Completed:', stats)

    return NextResponse.json({
      success: true,
      message: 'RSS fetch completed',
      stats
    })

  } catch (error) {
    console.error('[NEWS-FETCH] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
