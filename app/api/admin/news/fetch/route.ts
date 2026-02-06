/**
 * 관리자용 뉴스 수집 API
 * POST /api/admin/news/fetch
 *
 * 뉴스 관리 페이지에서 수동으로 뉴스를 수집할 때 사용
 */

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  fetchNaverPopularNews,
  fetchGoogleTrends,
  filterByTrends
} from '@/lib/trending-news'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const parser = new Parser()

function generateHash(title: string, link: string): string {
  return createHash('sha256').update(`${title}${link}`).digest('hex')
}

export async function POST() {
  try {
    console.log('[ADMIN-NEWS-FETCH] Starting manual news fetch...')

    // 활성화된 RSS 소스 가져오기
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('news_sources')
      .select('*')
      .eq('active', true)

    if (sourcesError) {
      console.error('[ADMIN-NEWS-FETCH] Sources error:', sourcesError)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    if (!sources || sources.length === 0) {
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

    // 구글 트렌드 키워드 가져오기
    console.log('[ADMIN-NEWS-FETCH] Fetching Google Trends...')
    const trendKeywords = await fetchGoogleTrends()
    console.log(`[ADMIN-NEWS-FETCH] Got ${trendKeywords.length} trend keywords`)

    // 테마(카테고리)별로 그룹화
    const sourcesByCategory: Record<string, typeof sources> = {}
    for (const source of sources) {
      const category = source.category || '기타'
      if (!sourcesByCategory[category]) {
        sourcesByCategory[category] = []
      }
      sourcesByCategory[category].push(source)
    }

    const maxItemsPerCategory = 20

    // 각 테마별로 처리
    for (const [category, categorySources] of Object.entries(sourcesByCategory)) {
      console.log(`[ADMIN-NEWS-FETCH] Processing category: ${category}`)
      let categoryItemCount = 0

      // 금융 카테고리인 경우 금융위원회에서 3~5개 먼저 수집
      if (category === '금융') {
        const fscSource = categorySources.find(s => s.name?.includes('금융위원회'))
        if (fscSource) {
          console.log('[ADMIN-NEWS-FETCH] Fetching from FSC (금융위원회)...')
          try {
            const feed = await parser.parseURL(fscSource.url)
            const fscItemsToCollect = Math.min(5, feed.items?.length || 0)

            for (let i = 0; i < fscItemsToCollect; i++) {
              const item = feed.items[i]
              if (!item.title || !item.link) continue

              totalItems++
              const hash = generateHash(item.title, item.link)
              const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()

              const { data, error } = await supabaseAdmin
                .from('news_items')
                .upsert(
                  {
                    source_id: fscSource.id,
                    title: item.title,
                    link: item.link,
                    pub_date: pubDate.toISOString(),
                    category: fscSource.category,
                    hash: hash,
                    is_trending: true // 금융위원회 자료는 중요도 높음
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
                  console.error('[ADMIN-NEWS-FETCH] FSC Insert error:', error)
                }
              } else if (data && data.length > 0) {
                newItems++
                categoryItemCount++
              } else {
                duplicateItems++
              }
            }

            await supabaseAdmin
              .from('news_sources')
              .update({ last_fetched_at: new Date().toISOString() })
              .eq('id', fscSource.id)

            console.log(`[ADMIN-NEWS-FETCH] FSC: collected ${categoryItemCount} items`)
          } catch (fscError) {
            console.error('[ADMIN-NEWS-FETCH] FSC fetch error:', fscError)
          }
        }
      }

      // 네이버 인기 뉴스 수집 (최대 10개)
      const naverNews = await fetchNaverPopularNews(category)

      for (const naverItem of naverNews) {
        if (categoryItemCount >= 10) break

        totalItems++
        trendingItems++

        const hash = generateHash(naverItem.title, naverItem.link)

        const { data, error } = await supabaseAdmin
          .from('news_items')
          .upsert(
            {
              source_id: null,
              title: naverItem.title,
              link: naverItem.link,
              pub_date: new Date().toISOString(),
              category: category,
              hash: hash,
              is_trending: true
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
            console.error('[ADMIN-NEWS-FETCH] Insert error:', error)
          }
        } else if (data && data.length > 0) {
          newItems++
          categoryItemCount++
        } else {
          duplicateItems++
        }
      }

      // RSS 피드에서 수집
      const allRssItems: Array<{
        title: string
        link: string
        pubDate?: string
        sourceId: string
        category: string
      }> = []

      for (const source of categorySources) {
        try {
          const feed = await parser.parseURL(source.url)

          if (!feed.items || feed.items.length === 0) continue

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

          await supabaseAdmin
            .from('news_sources')
            .update({ last_fetched_at: new Date().toISOString() })
            .eq('id', source.id)

        } catch (feedError) {
          console.error(`[ADMIN-NEWS-FETCH] Error fetching ${source.name}:`, feedError)
        }
      }

      // 트렌드 키워드로 정렬
      const sortedRssItems = filterByTrends(allRssItems, trendKeywords)

      for (const item of sortedRssItems) {
        if (categoryItemCount >= maxItemsPerCategory) break

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
            console.error('[ADMIN-NEWS-FETCH] Insert error:', error)
          }
        } else if (data && data.length > 0) {
          newItems++
          categoryItemCount++
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

    console.log('[ADMIN-NEWS-FETCH] Completed:', stats)

    return NextResponse.json({
      success: true,
      message: 'News fetch completed',
      stats
    })

  } catch (error) {
    console.error('[ADMIN-NEWS-FETCH] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
