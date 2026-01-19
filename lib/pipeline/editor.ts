/**
 * Editor AI 함수 (팩트체크/교정)
 * gpt-4o-mini로 초안 검수
 */

import OpenAI from 'openai'
import type { PipelineResult, EditorResult } from './types'

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: 55000,  // 55초 (Vercel 60초 제한에 여유 5초 확보)
  maxRetries: 0    // 재시도 없음 - Vercel 60초 내 완료 보장
})

// 에러 코드
const ERROR_CODES = {
  QUOTA_EXCEEDED: 'OPENAI_QUOTA_EXCEEDED',
  RATE_LIMIT: 'OPENAI_RATE_LIMIT',
  API_ERROR: 'OPENAI_API_ERROR',
  PARSE_ERROR: 'OPENAI_PARSE_ERROR',
  UNKNOWN: 'EDITOR_UNKNOWN_ERROR'
}

// 시스템 프롬프트 - 최소 수정 원칙
const EDITOR_SYSTEM_PROMPT = `너는 금융 블로그 편집자다. 초안을 최소한으로 수정한다.

수정 대상:
- 수치/계산 오류 → 정정
- 과장 표현(무조건/확실/즉시) → 완화
- 명백한 중복 → 제거

원칙:
- 원문 구조와 길이 유지
- 문제없는 부분은 그대로 유지
- 새로운 내용 추가 금지

JSON 출력:
{"clean_draft":"수정된 초안","editor_notes":["수정 포인트 1-3개"],"calc_checks":[]}`

/**
 * OpenAI 에러 분석
 */
function analyzeOpenAIError(error: unknown): { code: string; message: string } {
  if (error instanceof OpenAI.APIError) {
    const status = error.status
    const message = error.message || 'OpenAI API 오류'

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
      message: `OpenAI API 오류 (${status})`
    }
  }

  return {
    code: ERROR_CODES.UNKNOWN,
    message: error instanceof Error ? error.message : 'Unknown error'
  }
}

/**
 * Editor 단계 실행
 */
export async function runEditor(draft: string): Promise<PipelineResult<EditorResult>> {
  try {
    console.log('[EDITOR] 편집자 단계 시작...')
    console.log('[EDITOR] 초안 길이:', draft.length, '자')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EDITOR_SYSTEM_PROMPT },
        { role: 'user', content: `다음 초안을 편집해주세요:\n\n${draft}` }
      ],
      temperature: 0.3,
      max_tokens: 8000,  // JSON 응답이 잘리지 않도록 충분히 확보
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || '{}'
    console.log('[EDITOR] 응답 길이:', content.length, '자')

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (parseError) {
      console.error('[EDITOR] JSON 파싱 실패:', content.slice(0, 200))
      return {
        success: false,
        error: {
          code: ERROR_CODES.PARSE_ERROR,
          message: 'AI 응답 JSON 파싱 실패',
          stage: 'EDITOR'
        }
      }
    }

    console.log('[EDITOR] 완료!')

    return {
      success: true,
      data: {
        cleanDraft: parsed.clean_draft || draft,
        editorNotes: parsed.editor_notes || [],
        calcChecks: parsed.calc_checks || []
      }
    }

  } catch (error) {
    console.error('[EDITOR] 오류:', error)
    const errorInfo = analyzeOpenAIError(error)

    return {
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        stage: 'EDITOR'
      }
    }
  }
}
