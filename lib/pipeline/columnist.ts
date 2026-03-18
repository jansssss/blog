/**
 * Columnist AI 함수 (최종 글 작성)
 * claude-sonnet-4-6으로 사람다운 블로그 글 완성
 */

import Anthropic from '@anthropic-ai/sdk'
import { pickHumanPhrases } from '@/lib/ohyess/humanPhrases.v1'
import { buildColumnistPrompt, validateColumnistOutput } from '@/lib/prompts/columnist'
import type { PipelineResult, ColumnistResult } from './types'

// Anthropic 클라이언트
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 55000,
  maxRetries: 0
})

// 에러 코드
const ERROR_CODES = {
  QUOTA_EXCEEDED: 'ANTHROPIC_QUOTA_EXCEEDED',
  RATE_LIMIT: 'ANTHROPIC_RATE_LIMIT',
  API_ERROR: 'ANTHROPIC_API_ERROR',
  PARSE_ERROR: 'ANTHROPIC_PARSE_ERROR',
  UNKNOWN: 'COLUMNIST_UNKNOWN_ERROR'
}

/**
 * Anthropic 에러 분석
 */
function analyzeAnthropicError(error: unknown): { code: string; message: string } {
  if (error instanceof Anthropic.APIError) {
    const status = error.status
    const message = error.message || 'Anthropic API 오류'

    if (status === 429) {
      const isQuotaExceeded = message.toLowerCase().includes('quota') ||
                              message.toLowerCase().includes('exceeded') ||
                              message.toLowerCase().includes('billing')
      return {
        code: isQuotaExceeded ? ERROR_CODES.QUOTA_EXCEEDED : ERROR_CODES.RATE_LIMIT,
        message: isQuotaExceeded ? 'AI 사용 한도 초과' : 'AI 요청 제한 초과'
      }
    }

    return {
      code: ERROR_CODES.API_ERROR,
      message: `Anthropic API 오류 (${status})`
    }
  }

  return {
    code: ERROR_CODES.UNKNOWN,
    message: error instanceof Error ? error.message : 'Unknown error'
  }
}

/**
 * Columnist 단계 실행
 */
export async function runColumnist(cleanDraft: string): Promise<PipelineResult<ColumnistResult>> {
  let usedPhrases: string[] = []
  let phraseSeed: string = ''

  try {
    console.log('[COLUMNIST] 칼럼니스트 단계 시작...')
    console.log('[COLUMNIST] 초안 길이:', cleanDraft.length, '자')

    // 사람 문구풀에서 6~10개 랜덤 선택
    const { phrases, seed } = pickHumanPhrases(6, 10)
    usedPhrases = phrases
    phraseSeed = seed
    console.log(`[COLUMNIST] Human Phrase Pool: ${phrases.length}개 선택 (seed: ${seed})`)

    // 프롬프트 빌드 (v2: 변주 규칙 포함)
    const { systemPrompt, userPrompt, variationMeta } = buildColumnistPrompt({
      cleanDraft,
      humanPhrases: phrases
    })
    console.log(`[COLUMNIST] 변주: 아웃라인=${variationMeta.outlineId}, 도입부=${variationMeta.introId}`)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 4000,
    })

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    console.log('[COLUMNIST] 응답 길이:', content.length, '자')

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      console.error('[COLUMNIST] JSON 파싱 실패:', content.slice(0, 200))
      return {
        success: false,
        error: {
          code: ERROR_CODES.PARSE_ERROR,
          message: 'AI 응답 JSON 파싱 실패',
          stage: 'COLUMNIST'
        }
      }
    }

    const markdown = parsed.markdown || cleanDraft

    // 품질 검증 (실패 + 경고 분리)
    const validation = validateColumnistOutput(markdown)
    if (!validation.isValid) {
      console.warn('[COLUMNIST] 품질 검증 실패:', validation.failures)
    }
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('[COLUMNIST] 품질 검증 경고:', validation.warnings)
    }
    if (validation.isValid && (!validation.warnings || validation.warnings.length === 0)) {
      console.log('[COLUMNIST] 품질 검증 통과!')
    }

    console.log('[COLUMNIST] 완료!')

    return {
      success: true,
      data: {
        title: parsed.title || '제목 없음',
        metaDescription: parsed.meta_description || '',
        tags: parsed.tags || [],
        markdown: markdown,
        usedPhrases,
        phraseSeed,
        // 검증 결과 추가
        validationPassed: validation.isValid,
        validationFailures: validation.failures,
        validationWarnings: validation.warnings
      }
    }

  } catch (error) {
    console.error('[COLUMNIST] 오류:', error)
    const errorInfo = analyzeAnthropicError(error)

    return {
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        stage: 'COLUMNIST'
      }
    }
  }
}
