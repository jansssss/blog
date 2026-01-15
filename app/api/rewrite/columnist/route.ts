/**
 * OpenAI 칼럼니스트 단계 API (2단계)
 * gpt-4o로 최종 블로그 글 작성
 *
 * v2: 사람 문구풀(Human Phrase Pool)을 랜덤 주입하여
 *     더 자연스럽고 풍성한 본문 생성
 */

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { pickHumanPhrases } from '@/lib/ohyess/humanPhrases.v1'
import { buildColumnistPrompt, validateColumnistOutput } from '@/lib/prompts/columnist'

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

export async function POST(request: Request) {
  // 랜덤 선택된 문구 (디버깅용으로 응답에 포함)
  let usedPhrases: string[] = []
  let phraseSeed: string = ''

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

    console.log('[COLUMNIST] 칼럼니스트 단계 시작...')
    console.log('[COLUMNIST] 초안 길이:', cleanDraft.length, '자')

    // 사람 문구풀에서 6~10개 랜덤 선택
    const { phrases, seed } = pickHumanPhrases(6, 10)
    usedPhrases = phrases
    phraseSeed = seed
    console.log(`[COLUMNIST] Human Phrase Pool: ${phrases.length}개 선택 (seed: ${seed})`)
    console.log('[COLUMNIST] 선택된 문구:', phrases.slice(0, 3).map(p => p.slice(0, 20) + '...'))

    // 프롬프트 빌드
    const { systemPrompt, userPrompt } = buildColumnistPrompt({
      cleanDraft,
      humanPhrases: phrases
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || '{}'
    console.log('[COLUMNIST] 응답 길이:', content.length, '자')

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      console.error('[COLUMNIST] JSON 파싱 실패:', content.slice(0, 200))
      return NextResponse.json({
        success: false,
        error_stage: 'COLUMNIST',
        error_code: ERROR_CODES.PARSE_ERROR,
        error: 'AI 응답 파싱 실패',
        error_message: 'JSON 파싱 실패',
        used_phrases: usedPhrases,
        phrase_seed: phraseSeed
      }, { status: 500 })
    }

    const markdown = parsed.markdown || cleanDraft

    // 결과물 품질 검증 (경고만, 실패로 처리하지 않음)
    const validation = validateColumnistOutput(markdown)
    if (!validation.isValid) {
      console.warn('[COLUMNIST] 품질 검증 경고:', validation.failures)
      // 검증 실패해도 결과물은 반환 (로그만 남김)
    } else {
      console.log('[COLUMNIST] 품질 검증 통과!')
    }

    console.log('[COLUMNIST] 칼럼니스트 완료!')

    return NextResponse.json({
      success: true,
      stage: 'COLUMNIST_DONE',
      title: parsed.title || '제목 없음',
      metaDescription: parsed.meta_description || '',
      tags: parsed.tags || [],
      markdown: markdown,
      // 디버깅용 정보
      used_phrases: usedPhrases,
      phrase_seed: phraseSeed,
      phrase_count: usedPhrases.length,
      // 품질 검증 결과 (경고용)
      validation_passed: validation.isValid,
      validation_warnings: validation.failures
    })

  } catch (error) {
    console.error('[COLUMNIST] 오류:', error)
    const errorInfo = analyzeOpenAIError(error)

    return NextResponse.json({
      success: false,
      error_stage: 'COLUMNIST',
      error_code: errorInfo.code,
      error: errorInfo.message,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      used_phrases: usedPhrases,
      phrase_seed: phraseSeed
    }, { status: 500 })
  }
}
