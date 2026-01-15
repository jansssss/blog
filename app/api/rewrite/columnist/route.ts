/**
 * OpenAI 칼럼니스트 단계 API (2단계)
 * gpt-4o로 최종 블로그 글 작성
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

const COLUMNIST_SYSTEM_PROMPT = `너는 한국어 블로그 '칼럼니스트'다.
입력으로 주어지는 clean_draft(이미 팩트체크 완료된 초안)를 바탕으로,
사람이 쓴 것처럼 자연스럽고 따뜻한 설명형 글로 재작성한다.

핵심 목표:
- 도입부 3문단: (1)독자 상황 공감 (2)이 글이 필요한 이유 (3)얻는 것
- 문장을 부드럽게, 설명을 친절하게
- 독자가 "나랑 무슨 상관?"을 초반 15줄 안에 해소
- 섹션 구조는 반드시 고정(아래 순서):
  1. H1 제목 (SEO)
  2. 도입부 3문단
  3. 한 줄 요약
  4. 이슈 배경
  5. 나에게 미치는 영향 (대상/변화/조건)
  6. 계산 예시 (정확한 수치)
  7. 사례 (가상 인물, 과장 금지)
  8. 실제 활용 방법 (1~3단계)
  9. FAQ (3개)
  10. 정리
  11. 주의사항 (투자/금융 고지)
  12. SEO 태그 3개

금지:
- 새로운 숫자/팩트 추가 금지
- 단정적 투자 권유 금지(정보 제공)
- 과도한 행동 유도 문구 금지

출력은 JSON으로만:
{
  "title": "SEO형 H1 제목",
  "meta_description": "150~170자 검색 설명",
  "tags": ["태그1","태그2","태그3"],
  "markdown": "최종 글(마크다운)"
}`

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

    console.log('[COLUMNIST] 칼럼니스트 단계 시작...')
    console.log('[COLUMNIST] 초안 길이:', cleanDraft.length, '자')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: COLUMNIST_SYSTEM_PROMPT },
        { role: 'user', content: `다음 초안을 블로그 글로 재작성해주세요:\n\n${cleanDraft}` }
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
        error_message: 'JSON 파싱 실패'
      }, { status: 500 })
    }

    console.log('[COLUMNIST] 칼럼니스트 완료!')

    return NextResponse.json({
      success: true,
      stage: 'COLUMNIST_DONE',
      title: parsed.title || '제목 없음',
      metaDescription: parsed.meta_description || '',
      tags: parsed.tags || [],
      markdown: parsed.markdown || cleanDraft
    })

  } catch (error) {
    console.error('[COLUMNIST] 오류:', error)
    const errorInfo = analyzeOpenAIError(error)

    return NextResponse.json({
      success: false,
      error_stage: 'COLUMNIST',
      error_code: errorInfo.code,
      error: errorInfo.message,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
