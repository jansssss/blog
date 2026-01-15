/**
 * OpenAI 편집자 단계 API (1단계)
 * gpt-4o-mini로 팩트체크 및 교정
 */

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// OpenAI 에러 코드 정의
const ERROR_CODES = {
  QUOTA_EXCEEDED: 'OPENAI_QUOTA_EXCEEDED',
  RATE_LIMIT: 'OPENAI_RATE_LIMIT',
  API_ERROR: 'OPENAI_API_ERROR',
  PARSE_ERROR: 'OPENAI_PARSE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// OpenAI 에러 분석 함수
function analyzeOpenAIError(error: unknown): { code: string; message: string; isQuotaError: boolean } {
  if (error instanceof OpenAI.APIError) {
    const status = error.status
    const message = error.message || 'OpenAI API 오류'

    if (status === 429) {
      const isQuotaExceeded = message.toLowerCase().includes('quota') ||
                              message.toLowerCase().includes('exceeded') ||
                              message.toLowerCase().includes('billing')
      return {
        code: isQuotaExceeded ? ERROR_CODES.QUOTA_EXCEEDED : ERROR_CODES.RATE_LIMIT,
        message: isQuotaExceeded ? 'AI 사용 한도 초과' : 'AI 요청 제한 초과',
        isQuotaError: isQuotaExceeded
      }
    }

    return {
      code: ERROR_CODES.API_ERROR,
      message: `OpenAI API 오류 (${status})`,
      isQuotaError: false
    }
  }

  return {
    code: ERROR_CODES.UNKNOWN,
    message: error instanceof Error ? error.message : 'Unknown error',
    isQuotaError: false
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

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

    console.log('[EDITOR] 편집자 단계 시작...')
    console.log('[EDITOR] 초안 길이:', draft.length, '자')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EDITOR_SYSTEM_PROMPT },
        { role: 'user', content: `다음 초안을 편집해주세요:\n\n${draft}` }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || '{}'
    console.log('[EDITOR] 응답 길이:', content.length, '자')

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      console.error('[EDITOR] JSON 파싱 실패:', content.slice(0, 200))
      return NextResponse.json({
        success: false,
        error_stage: 'EDITOR',
        error_code: ERROR_CODES.PARSE_ERROR,
        error: 'AI 응답 파싱 실패',
        error_message: 'JSON 파싱 실패'
      }, { status: 500 })
    }

    console.log('[EDITOR] 편집자 완료!')

    return NextResponse.json({
      success: true,
      stage: 'EDITOR_DONE',
      cleanDraft: parsed.clean_draft || draft,
      editorNotes: parsed.editor_notes || [],
      calcChecks: parsed.calc_checks || []
    })

  } catch (error) {
    console.error('[EDITOR] 오류:', error)
    const errorInfo = analyzeOpenAIError(error)

    return NextResponse.json({
      success: false,
      error_stage: 'EDITOR',
      error_code: errorInfo.code,
      error: errorInfo.message,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
