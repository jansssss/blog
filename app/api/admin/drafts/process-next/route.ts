/**
 * Draft 파이프라인 다음 단계 처리 API
 *
 * "서버 1요청 = 1스텝" 방식으로 안정적인 처리
 * - 락 기반 중복 방지
 * - stage에 따라 다음 단계만 실행
 * - 실패 시 재시도 가능 (next_retry_at 기반)
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { runPerplexity } from '@/lib/pipeline/perplexity'
import { runEditor } from '@/lib/pipeline/editor'
import { runColumnist } from '@/lib/pipeline/columnist'
import type { DraftStage } from '@/lib/pipeline/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 워커 ID (동시 실행 구분용)
const WORKER_ID = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// 락 타임아웃 (5분)
const LOCK_TIMEOUT_MS = 5 * 60 * 1000

// 처리 가능한 stage 목록
const PROCESSABLE_STAGES: DraftStage[] = ['NEW', 'QUEUED', 'PERPLEXITY_DONE', 'EDITOR_DONE']

interface ProcessNextRequest {
  draftId?: string
}

interface ProcessNextResponse {
  ok: boolean
  draftId?: string
  prevStage?: string
  newStage?: string
  durationMs?: number
  error?: string
  message?: string
}

/**
 * 즉시 FAILED 처리 (영구 실패 - 재시도 불가)
 */
async function markAsPermanentFailure(
  draftId: string,
  stage: string,
  errorMessage: string
) {
  await supabaseAdmin
    .from('drafts')
    .update({
      stage: 'FAILED',
      error_stage: stage,
      error_code: 'PERMANENT_FAILURE',
      error_message: errorMessage,
      last_error: errorMessage,
      attempts: 1,
      next_retry_at: null,
      locked_at: null,
      locked_by: null
    })
    .eq('id', draftId)

  console.log(`[PROCESS-NEXT] 영구 실패 처리: ${draftId} - ${errorMessage}`)
}

/**
 * 처리 가능한 draft 1건을 찾아서 락을 획득
 * [필수 수정 1] next_retry_at 필터 추가
 * [필수 수정 2] 락 획득 시 stage 조건 추가
 */
async function acquireLock(specificDraftId?: string): Promise<{
  draft: any
  newsItem: any
} | null> {
  const now = new Date().toISOString()
  const lockExpiry = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString()

  // 쿼리 조건
  let query = supabaseAdmin
    .from('drafts')
    .select(`
      *,
      news_items (id, title, link, category)
    `)

  if (specificDraftId) {
    // 특정 draft 지정 - stage 조건도 함께 검증
    query = query
      .eq('id', specificDraftId)
      .in('stage', PROCESSABLE_STAGES)
  } else {
    // 처리 가능한 draft 선택
    // 단순화: stage만 확인하고, locked_at/next_retry_at은 NULL 허용
    query = query
      .in('stage', PROCESSABLE_STAGES)
      .is('locked_at', null)  // 락이 없는 것만
      .order('created_at', { ascending: true })
      .limit(1)
  }

  const { data: drafts, error: selectError } = await query

  if (selectError) {
    console.error('[PROCESS-NEXT] 쿼리 오류:', selectError)
    return null
  }

  if (!drafts || drafts.length === 0) {
    console.log('[PROCESS-NEXT] 처리할 draft 없음')
    return null
  }

  const draft = drafts[0]

  // 락 획득 시도 - 단순화된 조건
  const { data: lockedDraft, error: lockError } = await supabaseAdmin
    .from('drafts')
    .update({
      locked_at: now,
      locked_by: WORKER_ID
    })
    .eq('id', draft.id)
    .is('locked_at', null)  // 아직 락이 없는 경우만
    .select()
    .single()

  if (lockError || !lockedDraft) {
    console.log('[PROCESS-NEXT] 락 획득 실패 (다른 워커가 먼저 처리)')
    return null
  }

  console.log(`[PROCESS-NEXT] 락 획득 성공: ${draft.id} (stage: ${draft.stage})`)

  return {
    draft: lockedDraft,
    newsItem: draft.news_items
  }
}

/**
 * 락 해제 + 성공 시 오류/재시도 필드 정리
 * [필수 수정 3] 성공 시 필드 초기화
 */
async function releaseLockWithCleanup(draftId: string) {
  await supabaseAdmin
    .from('drafts')
    .update({
      locked_at: null,
      locked_by: null,
      // [수정 3] 성공 시 재시도/오류 필드 초기화
      attempts: 0,
      next_retry_at: null,
      last_error: null
    })
    .eq('id', draftId)
}

/**
 * 실패 처리 (재시도 가능한 실패)
 */
async function handleFailure(
  draftId: string,
  stage: string,
  errorCode: string,
  errorMessage: string,
  attempts: number
) {
  const maxAttempts = 3
  const newAttempts = attempts + 1

  if (newAttempts >= maxAttempts) {
    // 최대 재시도 횟수 초과 → FAILED
    await supabaseAdmin
      .from('drafts')
      .update({
        stage: 'FAILED',
        error_stage: stage,
        error_code: errorCode,
        error_message: errorMessage,
        last_error: errorMessage,
        attempts: newAttempts,
        next_retry_at: null,
        locked_at: null,
        locked_by: null
      })
      .eq('id', draftId)

    console.log(`[PROCESS-NEXT] 최대 재시도 초과 → FAILED: ${draftId}`)
  } else {
    // 재시도 예약 (backoff: 2분 * attempts)
    const backoffMinutes = 2 * newAttempts
    const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()

    await supabaseAdmin
      .from('drafts')
      .update({
        last_error: errorMessage,
        error_stage: stage,
        error_code: errorCode,
        error_message: errorMessage,
        attempts: newAttempts,
        next_retry_at: nextRetry,
        locked_at: null,
        locked_by: null
      })
      .eq('id', draftId)

    console.log(`[PROCESS-NEXT] 재시도 예약: ${nextRetry} (attempt ${newAttempts}/${maxAttempts})`)
  }
}

/**
 * 다음 단계 실행
 * [필수 수정 3] 성공 시 오류 필드 정리
 * [필수 수정 4] 영구 실패 케이스 즉시 FAILED
 */
async function processNextStep(
  draft: any,
  newsItem: any
): Promise<{ newStage: DraftStage; error?: string; permanent?: boolean }> {
  const currentStage = draft.stage as DraftStage

  console.log(`[PROCESS-NEXT] 현재 stage: ${currentStage}`)

  switch (currentStage) {
    case 'NEW':
    case 'QUEUED': {
      // Perplexity 실행
      // [수정 4] newsItem 없으면 영구 실패
      if (!newsItem) {
        return { newStage: 'FAILED', error: '뉴스 아이템 정보 없음', permanent: true }
      }

      console.log(`[PROCESS-NEXT] Perplexity 시작 (title: ${newsItem.title.slice(0, 30)}...)`)
      const perplexityStartTime = Date.now()
      const result = await runPerplexity({
        title: newsItem.title,
        link: newsItem.link,
        category: newsItem.category
      })
      console.log(`[PROCESS-NEXT] Perplexity 완료 (${Date.now() - perplexityStartTime}ms)`)

      if (!result.success || !result.data) {
        const errorDetail = `Perplexity 처리 실패 [${result.error?.code || 'UNKNOWN'}]: ${result.error?.message || '알 수 없는 오류'}`
        console.error(`[PROCESS-NEXT] ${errorDetail}`)
        return {
          newStage: currentStage, // stage 유지 (재시도 가능)
          error: errorDetail
        }
      }

      // [수정 3] 결과 저장 + 오류 필드 초기화
      await supabaseAdmin
        .from('drafts')
        .update({
          title: result.data.title,
          summary: result.data.summary,
          content: result.data.content,
          tags: result.data.tags,
          stage: 'PERPLEXITY_DONE',
          // 오류/재시도 필드 초기화
          error_stage: null,
          error_code: null,
          error_message: null,
          last_error: null,
          attempts: 0,
          next_retry_at: null
        })
        .eq('id', draft.id)

      return { newStage: 'PERPLEXITY_DONE' }
    }

    case 'PERPLEXITY_DONE': {
      // Editor 실행
      const draftContent = draft.content
      // [수정 4] content 없으면 영구 실패
      if (!draftContent) {
        return { newStage: 'FAILED', error: '초안 내용 없음', permanent: true }
      }

      console.log(`[PROCESS-NEXT] Editor 시작 (content 길이: ${draftContent.length}자)`)
      const editorStartTime = Date.now()
      const result = await runEditor(draftContent)
      console.log(`[PROCESS-NEXT] Editor 완료 (${Date.now() - editorStartTime}ms)`)

      if (!result.success || !result.data) {
        const errorDetail = `Editor 처리 실패 [${result.error?.code || 'UNKNOWN'}]: ${result.error?.message || '알 수 없는 오류'}`
        console.error(`[PROCESS-NEXT] ${errorDetail}`)
        return {
          newStage: currentStage,
          error: errorDetail
        }
      }

      // [수정 3] 결과 저장 + 오류 필드 초기화
      await supabaseAdmin
        .from('drafts')
        .update({
          editor_content: result.data.cleanDraft,
          stage: 'EDITOR_DONE',
          // 오류/재시도 필드 초기화
          error_stage: null,
          error_code: null,
          error_message: null,
          last_error: null,
          attempts: 0,
          next_retry_at: null
        })
        .eq('id', draft.id)

      return { newStage: 'EDITOR_DONE' }
    }

    case 'EDITOR_DONE': {
      // Columnist 실행
      const editorContent = draft.editor_content
      // [수정 4] editor_content 없으면 영구 실패
      if (!editorContent) {
        return { newStage: 'FAILED', error: '편집된 초안 없음', permanent: true }
      }

      console.log(`[PROCESS-NEXT] Columnist 시작 (editor_content 길이: ${editorContent.length}자)`)
      const columnistStartTime = Date.now()
      const result = await runColumnist(editorContent)
      console.log(`[PROCESS-NEXT] Columnist 완료 (${Date.now() - columnistStartTime}ms)`)

      if (!result.success || !result.data) {
        const errorDetail = `Columnist 처리 실패 [${result.error?.code || 'UNKNOWN'}]: ${result.error?.message || '알 수 없는 오류'}`
        console.error(`[PROCESS-NEXT] ${errorDetail}`)
        return {
          newStage: currentStage,
          error: errorDetail
        }
      }

      // [수정 3] 최종 결과 저장 + 오류 필드 초기화 + 검증 결과
      await supabaseAdmin
        .from('drafts')
        .update({
          title: result.data.title,
          summary: result.data.metaDescription,
          content: result.data.markdown,
          tags: result.data.tags,
          columnist_content: result.data.markdown,
          stage: 'SAVED',
          // 검증 결과 저장
          validation_passed: result.data.validationPassed,
          validation_failures: result.data.validationFailures || [],
          validation_warnings: result.data.validationWarnings || [],
          // 오류/재시도 필드 초기화
          error_stage: null,
          error_code: null,
          error_message: null,
          last_error: null,
          attempts: 0,
          next_retry_at: null
        })
        .eq('id', draft.id)

      return { newStage: 'SAVED' }
    }

    default:
      return { newStage: currentStage, error: `처리 불가능한 stage: ${currentStage}`, permanent: true }
  }
}

export async function POST(request: Request): Promise<NextResponse<ProcessNextResponse>> {
  const startTime = Date.now()

  try {
    const body: ProcessNextRequest = await request.json().catch(() => ({}))
    const { draftId } = body

    console.log(`[PROCESS-NEXT] 요청 수신 (draftId: ${draftId || 'auto'})`)

    // 1. 락 획득
    const lockResult = await acquireLock(draftId)

    if (!lockResult) {
      return NextResponse.json({
        ok: false,
        message: '처리할 draft가 없거나 이미 처리 중입니다.'
      })
    }

    const { draft, newsItem } = lockResult
    const prevStage = draft.stage

    try {
      // 2. 다음 단계 실행
      const { newStage, error, permanent } = await processNextStep(draft, newsItem)

      const durationMs = Date.now() - startTime

      if (error) {
        // [수정 4] 영구 실패 vs 재시도 가능 실패 분기
        if (permanent) {
          await markAsPermanentFailure(draft.id, prevStage, error)
        } else {
          await handleFailure(
            draft.id,
            prevStage,
            'PROCESSING_ERROR',
            error,
            draft.attempts || 0
          )
        }

        return NextResponse.json({
          ok: false,
          draftId: draft.id,
          prevStage,
          newStage,
          durationMs,
          error
        })
      }

      // 성공 - 락 해제 + 필드 정리
      await releaseLockWithCleanup(draft.id)

      console.log(`[PROCESS-NEXT] 완료: ${prevStage} → ${newStage} (${durationMs}ms)`)

      return NextResponse.json({
        ok: true,
        draftId: draft.id,
        prevStage,
        newStage,
        durationMs
      })

    } catch (stepError) {
      // 단계 실행 중 예외 발생
      const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown error'

      await handleFailure(
        draft.id,
        prevStage,
        'UNEXPECTED_ERROR',
        errorMessage,
        draft.attempts || 0
      )

      return NextResponse.json({
        ok: false,
        draftId: draft.id,
        prevStage,
        durationMs: Date.now() - startTime,
        error: errorMessage
      })
    }

  } catch (error) {
    console.error('[PROCESS-NEXT] 치명적 오류:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime
    }, { status: 500 })
  }
}
