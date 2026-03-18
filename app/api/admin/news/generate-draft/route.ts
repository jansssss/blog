/**
 * [DEPRECATED] 파이프라인이 GitHub Actions로 이전되었습니다.
 * scripts/main.py 참조
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    { success: false, error: '이 기능은 GitHub Actions 파이프라인으로 이전되었습니다.' },
    { status: 410 }
  )
}
