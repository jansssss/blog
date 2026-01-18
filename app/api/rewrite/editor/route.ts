/**
 * OpenAI 편집자 단계 API (1단계)
 * gpt-4o-mini로 팩트체크 및 교정
 *
 * NOTE: 핵심 로직은 lib/pipeline/editor.ts로 분리됨
 */

import { NextResponse } from 'next/server'
import { runEditor } from '@/lib/pipeline/editor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { draft } = body

    if (!draft || typeof draft !== 'string') {
      return NextResponse.json(
        { success: false, error: '초안(draft)이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 파이프라인 함수 호출
    const result = await runEditor(draft)

    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        error_stage: result.error?.stage || 'EDITOR',
        error_code: result.error?.code || 'UNKNOWN_ERROR',
        error: result.error?.message || '편집자 처리 실패',
        error_message: result.error?.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stage: 'EDITOR_DONE',
      cleanDraft: result.data.cleanDraft,
      editorNotes: result.data.editorNotes,
      calcChecks: result.data.calcChecks
    })

  } catch (error) {
    console.error('[EDITOR-API] 예상치 못한 오류:', error)
    return NextResponse.json({
      success: false,
      error_stage: 'EDITOR',
      error_code: 'UNEXPECTED_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
