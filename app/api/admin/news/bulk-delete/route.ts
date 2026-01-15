/**
 * 뉴스 아이템 일괄 삭제 API
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { newsItemIds } = body

    if (!newsItemIds || !Array.isArray(newsItemIds) || newsItemIds.length === 0) {
      return NextResponse.json(
        { error: '삭제할 뉴스 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log(`[BULK-DELETE] 뉴스 일괄 삭제 시작: ${newsItemIds.length}개`)

    const { error } = await supabaseAdmin
      .from('news_items')
      .delete()
      .in('id', newsItemIds)

    if (error) {
      console.error('[BULK-DELETE] 삭제 오류:', error)
      return NextResponse.json(
        { error: '삭제 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log(`[BULK-DELETE] 성공: ${newsItemIds.length}개 삭제`)

    return NextResponse.json({
      success: true,
      message: `${newsItemIds.length}개 뉴스가 삭제되었습니다.`,
      deletedCount: newsItemIds.length
    })

  } catch (error) {
    console.error('[BULK-DELETE] 예상치 못한 오류:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
