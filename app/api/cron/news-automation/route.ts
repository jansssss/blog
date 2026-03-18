/**
 * [DEPRECATED] Vercel Cron이 GitHub Actions로 이전되었습니다.
 * .github/workflows/daily-post.yml 참조
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    { message: 'Cron job이 GitHub Actions로 이전되었습니다.' },
    { status: 410 }
  )
}
