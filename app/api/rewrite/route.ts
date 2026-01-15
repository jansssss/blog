/**
 * OpenAI 2단계 재작성 API
 * 1차: 편집자 (팩트체크, 교정) - gpt-4o-mini (경량)
 * 2차: 칼럼니스트 (스토리, 가독성) - gpt-4o (고성능)
 */

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 최대 60초

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

    // 429 에러 처리 (Rate limit / Quota exceeded)
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

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// 월간 비용 제한 (약 $10)
// gpt-4o-mini: 입력 $0.15/1M, 출력 $0.60/1M
// gpt-4o: 입력 $2.50/1M, 출력 $10.00/1M
const MONTHLY_LIMIT = {
  editor: { maxTokens: 2000, model: 'gpt-4o-mini' },
  columnist: { maxTokens: 4000, model: 'gpt-4o' }
}

// 1차 편집자 프롬프트
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

// 2차 칼럼니스트 프롬프트
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

// 1차 편집자 단계
async function runEditorPass(draft: string): Promise<{
  cleanDraft: string
  editorNotes: string[]
  calcChecks: Array<{ item: string; before: string; after: string; reason: string }>
}> {
  const response = await openai.chat.completions.create({
    model: MONTHLY_LIMIT.editor.model,
    messages: [
      { role: 'system', content: EDITOR_SYSTEM_PROMPT },
      { role: 'user', content: `다음 초안을 편집해주세요:\n\n${draft}` }
    ],
    temperature: 0.3,
    max_tokens: MONTHLY_LIMIT.editor.maxTokens,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(content)
    return {
      cleanDraft: parsed.clean_draft || draft,
      editorNotes: parsed.editor_notes || [],
      calcChecks: parsed.calc_checks || []
    }
  } catch {
    console.error('[REWRITE] Editor JSON 파싱 실패:', content)
    return {
      cleanDraft: draft,
      editorNotes: ['JSON 파싱 실패'],
      calcChecks: []
    }
  }
}

// 2차 칼럼니스트 단계
async function runColumnistPass(cleanDraft: string): Promise<{
  title: string
  metaDescription: string
  tags: string[]
  markdown: string
}> {
  const response = await openai.chat.completions.create({
    model: MONTHLY_LIMIT.columnist.model,
    messages: [
      { role: 'system', content: COLUMNIST_SYSTEM_PROMPT },
      { role: 'user', content: `다음 초안을 블로그 글로 재작성해주세요:\n\n${cleanDraft}` }
    ],
    temperature: 0.5,
    max_tokens: MONTHLY_LIMIT.columnist.maxTokens,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(content)
    return {
      title: parsed.title || '제목 없음',
      metaDescription: parsed.meta_description || '',
      tags: parsed.tags || [],
      markdown: parsed.markdown || cleanDraft
    }
  } catch {
    console.error('[REWRITE] Columnist JSON 파싱 실패:', content)
    return {
      title: '제목 없음',
      metaDescription: '',
      tags: [],
      markdown: cleanDraft
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { draft, draftId } = body

    if (!draft || typeof draft !== 'string') {
      console.error('[REWRITE] 오류: draft가 없거나 문자열이 아님')
      return NextResponse.json(
        { error: '초안(draft)이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[REWRITE] 오류: OPENAI_API_KEY 환경변수 미설정')
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    console.log('[REWRITE] 1차 편집자 단계 시작...')
    console.log('[REWRITE] 초안 길이:', draft.length, '자')

    // 1차: 편집자 단계
    let editorResult
    try {
      editorResult = await runEditorPass(draft)
      console.log('[REWRITE] 편집자 노트:', editorResult.editorNotes)
      console.log('[REWRITE] 검산 결과:', editorResult.calcChecks)
    } catch (editorError) {
      console.error('[REWRITE] 편집자 단계 오류:', editorError)
      const errorInfo = analyzeOpenAIError(editorError)

      return NextResponse.json({
        success: false,
        stage: 'FAILED',
        error_stage: 'EDITOR',
        error_code: errorInfo.code,
        error: errorInfo.message,
        error_message: editorError instanceof Error ? editorError.message : 'Unknown error',
        // 중간 결과 없음
        editor_content: null,
        columnist_content: null
      }, { status: 500 })
    }

    // Rate Limit 방지를 위한 딜레이 (800~1500ms 랜덤)
    const delay = Math.floor(Math.random() * 700) + 800 // 800~1500ms
    console.log(`[REWRITE] Rate Limit 방지 딜레이: ${delay}ms`)
    await new Promise(resolve => setTimeout(resolve, delay))

    console.log('[REWRITE] 2차 칼럼니스트 단계 시작...')

    // 2차: 칼럼니스트 단계
    let columnistResult
    try {
      columnistResult = await runColumnistPass(editorResult.cleanDraft)
      console.log('[REWRITE] 칼럼니스트 완료!')
    } catch (columnistError) {
      console.error('[REWRITE] 칼럼니스트 단계 오류:', columnistError)
      const errorInfo = analyzeOpenAIError(columnistError)

      return NextResponse.json({
        success: false,
        stage: 'FAILED',
        error_stage: 'COLUMNIST',
        error_code: errorInfo.code,
        error: errorInfo.message,
        error_message: columnistError instanceof Error ? columnistError.message : 'Unknown error',
        // 편집자 결과는 반환 (부분 성공)
        editor_content: editorResult.cleanDraft,
        editorNotes: editorResult.editorNotes,
        columnist_content: null
      }, { status: 500 })
    }

    console.log('[REWRITE] 모든 단계 완료!')

    return NextResponse.json({
      success: true,
      stage: 'COLUMNIST_DONE',
      title: columnistResult.title,
      metaDescription: columnistResult.metaDescription,
      tags: columnistResult.tags,
      markdown: columnistResult.markdown,
      // 중간 결과물도 함께 반환
      editor_content: editorResult.cleanDraft,
      columnist_content: columnistResult.markdown,
      editorNotes: editorResult.editorNotes,
      calcChecks: editorResult.calcChecks
    })

  } catch (error) {
    console.error('[REWRITE] 예상치 못한 오류:', error)
    return NextResponse.json(
      {
        success: false,
        stage: 'FAILED',
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
