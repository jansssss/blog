/**
 * 초안 이어하기 (Resume) API
 * 실패하거나 중간 단계에서 멈춘 초안을 이어서 처리
 * - PERPLEXITY_DONE: 2단계(편집자)부터 시작
 * - EDITOR_DONE 또는 editor_content 있음: 3단계(칼럼니스트)부터 시작
 * - columnist_content 있음: 저장만 재시도
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { draftId } = body

    if (!draftId) {
      return NextResponse.json(
        { error: '초안 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log(`[RESUME] 이어하기 시작: ${draftId}`)

    // 초안 조회
    const { data: draft, error: fetchError } = await supabaseAdmin
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (fetchError || !draft) {
      console.error('[RESUME] 초안 조회 실패:', fetchError)
      return NextResponse.json(
        { error: '초안을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현재 상태 확인 및 시작 단계 결정
    const { stage, content, editor_content, columnist_content } = draft
    let startStage: 'editor' | 'columnist' | 'save' = 'editor'

    // 칼럼니스트 결과가 있으면 저장만 재시도
    if (columnist_content) {
      startStage = 'save'
      console.log('[RESUME] 저장 단계부터 재시도')
    }
    // 편집자 결과가 있으면 칼럼니스트부터 시작
    else if (editor_content || stage === 'EDITOR_DONE') {
      startStage = 'columnist'
      console.log('[RESUME] 칼럼니스트 단계부터 재시도')
    }
    // 그 외에는 편집자부터 시작
    else {
      startStage = 'editor'
      console.log('[RESUME] 편집자 단계부터 재시도')
    }

    // 에러 정보 초기화
    await supabaseAdmin
      .from('drafts')
      .update({
        error_stage: null,
        error_code: null,
        error_message: null
      })
      .eq('id', draftId)

    // 저장만 재시도하는 경우
    if (startStage === 'save') {
      console.log('[RESUME] 저장 재시도...')

      // columnist_content에서 제목/요약/태그 추출 시도 (이미 저장된 값 사용)
      const { error: saveError } = await supabaseAdmin
        .from('drafts')
        .update({
          content: columnist_content,
          stage: 'SAVED',
          error_stage: null,
          error_code: null,
          error_message: null
        })
        .eq('id', draftId)

      if (saveError) {
        console.error('[RESUME] 저장 실패:', saveError)
        await supabaseAdmin
          .from('drafts')
          .update({
            stage: 'FAILED',
            error_stage: 'SAVE',
            error_code: 'SAVE_ERROR',
            error_message: saveError.message
          })
          .eq('id', draftId)

        return NextResponse.json({
          success: false,
          error: '저장 실패',
          details: saveError.message
        }, { status: 500 })
      }

      console.log('[RESUME] 저장 완료!')
      return NextResponse.json({
        success: true,
        stage: 'SAVED',
        message: '저장 완료'
      })
    }

    // rewrite API 호출
    const draftContent = startStage === 'columnist' ? editor_content : content

    console.log(`[RESUME] /api/rewrite 호출 (startStage: ${startStage})`)

    const rewriteResponse = await fetch(new URL('/api/rewrite', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draft: draftContent,
        draftId,
        skipEditor: startStage === 'columnist' // 칼럼니스트부터 시작하는 경우
      })
    })

    const rewriteData = await rewriteResponse.json()

    if (!rewriteResponse.ok || !rewriteData.success) {
      console.error('[RESUME] rewrite API 실패:', rewriteData)

      // 에러 정보 저장
      await supabaseAdmin
        .from('drafts')
        .update({
          stage: 'FAILED',
          error_stage: rewriteData.error_stage || null,
          error_code: rewriteData.error_code || null,
          error_message: rewriteData.error_message || rewriteData.error || null,
          editor_content: rewriteData.editor_content || editor_content || null,
          columnist_content: rewriteData.columnist_content || null
        })
        .eq('id', draftId)

      return NextResponse.json({
        success: false,
        error: rewriteData.error || '처리 실패',
        error_stage: rewriteData.error_stage,
        error_code: rewriteData.error_code
      }, { status: 500 })
    }

    // 최종 저장
    console.log('[RESUME] 최종 저장...')

    const { error: updateError } = await supabaseAdmin
      .from('drafts')
      .update({
        title: rewriteData.title,
        summary: rewriteData.metaDescription,
        content: rewriteData.markdown,
        tags: rewriteData.tags,
        stage: 'SAVED',
        editor_content: rewriteData.editor_content || editor_content || null,
        columnist_content: rewriteData.columnist_content || null,
        error_stage: null,
        error_code: null,
        error_message: null
      })
      .eq('id', draftId)

    if (updateError) {
      console.error('[RESUME] 최종 저장 실패:', updateError)

      await supabaseAdmin
        .from('drafts')
        .update({
          stage: 'FAILED',
          error_stage: 'SAVE',
          error_code: 'SAVE_ERROR',
          error_message: updateError.message,
          editor_content: rewriteData.editor_content || editor_content || null,
          columnist_content: rewriteData.columnist_content || null
        })
        .eq('id', draftId)

      return NextResponse.json({
        success: false,
        error: '저장 실패',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('[RESUME] 완료!')

    return NextResponse.json({
      success: true,
      stage: 'SAVED',
      message: '이어하기 완료'
    })

  } catch (error) {
    console.error('[RESUME] 예상치 못한 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
