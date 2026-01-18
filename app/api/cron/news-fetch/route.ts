/**
 * RSS 뉴스 수집 API
 * Vercel Cron: 30분마다 실행
 * GET /api/cron/news-fetch
 */

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // 각 RSS 소스 처리
    for (const source of sources) {
      try {
        console.log(`[NEWS-FETCH] Fetching from: ${source.name}`)

        const feed = await parser.parseURL(source.url)

        if (!feed.items || feed.items.length === 0) {
          console.log(`[NEWS-FETCH] No items in feed: ${source.name}`)
          continue
        }

        // 각 피드 아이템 처리 (소스당 최대 10개)
        const maxItemsPerSource = 10
        let sourceItemCount = 0

        for (const item of feed.items) {
          if (!item.title || !item.link) continue
          if (sourceItemCount >= maxItemsPerSource) break

          totalItems++
          sourceItemCount++

          const hash = generateHash(item.title, item.link)
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()

          // 중복 체크 및 삽입 (upsert)
          const { data, error } = await supabaseAdmin
            .from('news_items')
            .upsert(
              {
                source_id: source.id,
                title: item.title,
                link: item.link,
                pub_date: pubDate.toISOString(),
                category: source.category,
                hash: hash
              },
              {
                onConflict: 'hash',
                ignoreDuplicates: true
              }
            )
            .select()

          if (error) {
            if (error.code === '23505') { // Unique violation
              duplicateItems++
            } else {
              console.error('[NEWS-FETCH] Insert error:', error)
            }
          } else if (data && data.length > 0) {
            newItems++
            console.log(`[NEWS-FETCH] New item: ${item.title}`)
          } else {
            duplicateItems++
          }
        }

        // 마지막 수집 시간 업데이트
        await supabaseAdmin
          .from('news_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)

      } catch (feedError) {
        console.error(`[NEWS-FETCH] Error fetching ${source.name}:`, feedError)
        // 개별 소스 에러는 무시하고 계속 진행
      }
    }

    const stats = {
      total: totalItems,
      new: newItems,
      duplicate: duplicateItems,
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
