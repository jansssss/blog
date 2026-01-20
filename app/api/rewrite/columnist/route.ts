/**
 * OpenAI 칼럼니스트 단계 API (2단계)
 * gpt-4o로 최종 블로그 글 작성
 *
 * NOTE: 핵심 로직은 lib/pipeline/columnist.ts로 분리됨
 */

import { NextResponse } from 'next/server'
import { runColumnist } from '@/lib/pipeline/columnist'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cleanDraft } = body

    if (!cleanDraft || typeof cleanDraft !== 'string') {
      return NextResponse.json(
        { success: false, error: '편집된 초안(cleanDraft)이 필요합니다.' },
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
    const result = await runColumnist(cleanDraft)

    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        error_stage: result.error?.stage || 'COLUMNIST',
        error_code: result.error?.code || 'UNKNOWN_ERROR',
        error: result.error?.message || '칼럼니스트 처리 실패',
        error_message: result.error?.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stage: 'COLUMNIST_DONE',
      title: result.data.title,
      metaDescription: result.data.metaDescription,
      tags: result.data.tags,
      markdown: result.data.markdown,
      // 품질 검증 결과
      validationPassed: result.data.validationPassed,
      validationFailures: result.data.validationFailures || [],
      validationWarnings: result.data.validationWarnings || [],
      // 디버깅용
      used_phrases: result.data.usedPhrases,
      phrase_seed: result.data.phraseSeed,
      phrase_count: result.data.usedPhrases.length
    })

  } catch (error) {
    console.error('[COLUMNIST-API] 예상치 못한 오류:', error)
    return NextResponse.json({
      success: false,
      error_stage: 'COLUMNIST',
      error_code: 'UNEXPECTED_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
