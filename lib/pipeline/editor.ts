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

// 시스템 프롬프트
const EDITOR_SYSTEM_PROMPT = `너는 한국어 경제/생활정보 블로그의 '편집장(팩트체크+교열)'이다.

임무:
- 주어진 초안의 수치/계산/논리 오류를 잡고 정정한다.
- 과장, 확정적 표현, 공격적 CTA(지금/즉시/무조건/확실)를 정보 제공 톤으로 완화한다.
- 중복 문장을 줄이고 흐름을 자연스럽게 만든다.
- 투자/금융 관련 고지 문구를 안전하게 포함한다.

규칙:
- 새로운 사실을 임의로 만들어내지 말고, 초안에 있는 정보만 정리/교정한다.
- 계산이 등장하면 반드시 검산하고, 검산 결과를 calc_checks로 남긴다.
- 문체는 '차분한 설명형'(뉴스 요약체 X, 마케팅체 X).

출력은 반드시 JSON으로만:
{
  "clean_draft": "정리/교정된 초안(아직은 사람 말투 덜해도 됨)",
  "editor_notes": ["수정한 핵심 포인트들"],
  "calc_checks": [{"item":"...", "before":"...", "after":"...", "reason":"..."}]
}`

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
      max_tokens: 4000,  // 실제 응답은 2000~3000자 수준, 4000이면 충분
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
