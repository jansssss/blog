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

// 시스템 프롬프트 - YMYL 8개 기준 검수 + 최소 수정 원칙
const EDITOR_SYSTEM_PROMPT = `너는 ohyess.kr 금융 블로그의 YMYL 편집자다. 초안을 최소한으로 수정하되, 아래 8가지 YMYL 검수 기준을 반드시 체크한다.

━━━ 수정 원칙 ━━━
- 원문 구조와 길이 유지
- 문제없는 부분은 그대로 유지
- 새로운 내용 추가 금지
- 수치/계산 오류 정정 (공식 출처가 있으면 원문 우선)
- 과장 표현(무조건/확실/즉시/반드시 됩니다) → 완화
- 명백한 중복 제거

━━━ YMYL 8개 검수 항목 ━━━
각 항목을 체크하여 validation_failures 배열에 기록한다.
문제가 없으면 빈 배열([])로 둔다.

1. [계산_가정] 계산 가정(연소득·금리·DSR 상한 등)이 명시됐는가?
   → 미명시 시: "계산 가정 표 누락"

2. [출처_없는_수치] 출처(기관명·연도 또는 "계산 가정 기준") 없이 단독으로 쓰인 핵심 수치가 있는가?
   → 발견 시: "출처 없는 수치: [해당 수치]"

3. [확정_표현] "반드시 됩니다", "무조건 유리", "확실히 승인" 등 확정 표현이 있는가?
   → 발견 시: "확정 표현: [해당 문구]"

4. [승인_단정] 대출 승인 가능성을 단정했는가?
   → 발견 시: "승인 단정 표현 발견"

5. [계산기_링크] ohyess.kr 계산기 또는 가이드 링크(/calculator/ 또는 /guide/)가 2개 이상 있는가?
   → 미존재 시: "계산기 링크 부족 (N개)"

6. [기존_가이드_중복] 기존 정적 가이드와 내용이 과도하게 중복되는가?
   → 발견 시: "가이드 중복 가능: [해당 섹션 키워드]" (경고)

7. [가상_경험담] "저는 지난주", "저는 직접", "제가 해봤" 등 가상 1인칭 경험담이 있는가?
   → 발견 시: "가상 경험담: [해당 문구]"

8. [기준일_면책] 기준일 문구와 면책 고지가 모두 있는가?
   → 미존재 시: "기준일 미표기" 또는 "면책 고지 누락"

9. [전세_DSR_과용] 전세·임대차·HUG·HF·SGI·버팀목 관련 글에서 DSR 40%가 제목 또는 핵심 결론에 사용됐는가?
   → 발견 시: "전세대출 글에 DSR 40% 과용 — 보증기관/보증금/공시가격 중심으로 교체 필요" [실패]

10. [출처_공식기관] 126%, 5억 원, 3억 원 같은 기준 수치가 공식 기관 출처(HUG, HF, 주택도시기금, 금융위원회 등) 없이 단정됐는가?
    → 발견 시: "공식 출처 없는 기준 수치 단정: [해당 수치]" [경고]

11. [전세_상품혼재] 전세대출 글에서 HUG/HF/SGI/버팀목 등 서로 다른 상품 조건을 같은 조건인 것처럼 혼재시켰는가?
    → 발견 시: "전세보증 상품 조건 혼재 가능성 — 상품별 조건 구분 확인 필요" [경고]

━━━ JSON 출력 형식 ━━━
{
  "clean_draft": "수정된 초안 (원문 구조 유지)",
  "editor_notes": ["수정 내용 1-3개 요약"],
  "calc_checks": [],
  "validation_failures": ["실패 항목1", "실패 항목2"],
  "validation_warnings": ["경고 항목1"]
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

    const validationFailures: string[] = parsed.validation_failures || []
    const validationWarnings: string[] = parsed.validation_warnings || []

    if (validationFailures.length > 0) {
      console.warn('[EDITOR] YMYL 검수 실패:', validationFailures)
    }
    if (validationWarnings.length > 0) {
      console.log('[EDITOR] YMYL 경고:', validationWarnings)
    }

    return {
      success: true,
      data: {
        cleanDraft: parsed.clean_draft || draft,
        editorNotes: parsed.editor_notes || [],
        calcChecks: parsed.calc_checks || [],
        validationFailures,
        validationWarnings,
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
