/**
 * Columnist AI 함수 (최종 글 작성)
 * claude-sonnet-4-6으로 구조화된 블로그 글 생성 후 HTML로 변환
 * Blogger 스타일 참고: summary_points + sections + action_tips
 */

import Anthropic from '@anthropic-ai/sdk'
import { pickHumanPhrases } from '@/lib/ohyess/humanPhrases.v1'
import { buildColumnistPrompt } from '@/lib/prompts/columnist'
import type { PipelineResult, ColumnistResult } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  timeout: 50000,
  maxRetries: 0
})

const ERROR_CODES = {
  QUOTA_EXCEEDED: 'ANTHROPIC_QUOTA_EXCEEDED',
  RATE_LIMIT: 'ANTHROPIC_RATE_LIMIT',
  API_ERROR: 'ANTHROPIC_API_ERROR',
  PARSE_ERROR: 'ANTHROPIC_PARSE_ERROR',
  UNKNOWN: 'COLUMNIST_UNKNOWN_ERROR'
}

// ───────────────────────────────────────────
// 구조화된 기사 데이터 타입
// ───────────────────────────────────────────
interface ArticleSection {
  heading: string
  paragraphs: string[]
  expert_insight?: string
}

interface StructuredArticle {
  title: string
  meta_description: string
  subtitle: string
  tags: string[]
  summary_points: string[]
  sections: ArticleSection[]
  action_tips: string[]
}

// ───────────────────────────────────────────
// HTML 빌더 (Blogger 스타일)
// ───────────────────────────────────────────
function buildHtml(data: StructuredArticle): string {
  const font = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"

  // 핵심 요약 박스
  const summaryItems = data.summary_points
    .map(p => `<li style="font-family:${font};font-size:15px;color:#2a3a5c;line-height:1.75;margin-bottom:8px;word-break:keep-all;">${esc(p)}</li>`)
    .join('\n')

  const summaryHtml = `
<div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin:0 0 32px;">
  <div style="font-family:${font};font-size:13px;font-weight:700;color:#3268ff;margin-bottom:10px;letter-spacing:0.04em;">✅ 핵심 요약</div>
  <ul style="margin:0;padding-left:20px;">${summaryItems}</ul>
</div>`

  // 본문 섹션들
  const sectionsHtml = data.sections.map(section => {
    const paragraphsHtml = section.paragraphs
      .map(p => `<p style="font-family:${font};font-size:16px;color:#3a4a62;margin:0 0 14px;line-height:1.9;word-break:keep-all;">${esc(p)}</p>`)
      .join('\n')

    const insightHtml = section.expert_insight
      ? `<div style="background:#f0f4ff;border-left:4px solid #3268ff;border-radius:0 8px 8px 0;padding:14px 18px;margin:4px 0 20px;">
  <div style="font-family:${font};font-size:12px;font-weight:700;color:#3268ff;margin-bottom:6px;letter-spacing:0.04em;">💡 핵심 포인트</div>
  <p style="font-family:${font};font-size:15px;color:#2a3a5c;margin:0;line-height:1.75;word-break:keep-all;">${esc(section.expert_insight)}</p>
</div>`
      : ''

    return `<section>
<h2 style="font-family:${font};font-size:22px;font-weight:800;color:#1c2741;margin:40px 0 14px;padding-bottom:8px;border-bottom:2px solid #eef2f7;letter-spacing:-0.02em;line-height:1.4;word-break:keep-all;">${esc(section.heading)}</h2>
${paragraphsHtml}${insightHtml}</section>`
  }).join('\n')

  // 지금 바로 할 수 있는 것 (action tips)
  const tipsHtml = data.action_tips
    .map(tip => `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:#fff;border:1.5px solid #ffcfc9;color:#cc3a28;font-size:13px;font-weight:600;line-height:1.5;margin:0 4px 6px 0;">${esc(tip)}</span>`)
    .join('\n')

  const actionHtml = `
<div style="background:#fff8f6;border-radius:12px;padding:20px 24px;margin:36px 0 28px;">
  <div style="font-family:${font};font-size:13px;font-weight:700;color:#cc3a28;margin-bottom:12px;letter-spacing:0.04em;">🎯 지금 바로 확인할 것</div>
  <div>${tipsHtml}</div>
</div>`

  return summaryHtml + '\n' + sectionsHtml + '\n' + actionHtml
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ───────────────────────────────────────────
// 에러 분석
// ───────────────────────────────────────────
function analyzeAnthropicError(error: unknown): { code: string; message: string } {
  if (error instanceof Anthropic.APIError) {
    const status = error.status
    const message = error.message || 'Anthropic API 오류'

    if (status === 401) {
      return { code: ERROR_CODES.API_ERROR, message: 'Anthropic API 키가 유효하지 않습니다 (401)' }
    }
    if (status === 429) {
      const isQuota = message.toLowerCase().includes('quota') || message.toLowerCase().includes('exceeded') || message.toLowerCase().includes('billing')
      return {
        code: isQuota ? ERROR_CODES.QUOTA_EXCEEDED : ERROR_CODES.RATE_LIMIT,
        message: isQuota ? 'AI 사용 한도 초과' : 'AI 요청 제한 초과'
      }
    }
    if (status === undefined || status === null) {
      return { code: ERROR_CODES.API_ERROR, message: `Anthropic 연결 오류: ${message}` }
    }
    return { code: ERROR_CODES.API_ERROR, message: `Anthropic API 오류 (${status}): ${message}` }
  }
  return { code: ERROR_CODES.UNKNOWN, message: error instanceof Error ? error.message : 'Unknown error' }
}

// ───────────────────────────────────────────
// Columnist 실행
// ───────────────────────────────────────────
export async function runColumnist(cleanDraft: string): Promise<PipelineResult<ColumnistResult>> {
  let usedPhrases: string[] = []
  let phraseSeed = ''

  try {
    console.log('[COLUMNIST] 시작... 초안 길이:', cleanDraft.length)

    const { phrases, seed } = pickHumanPhrases(6, 10)
    usedPhrases = phrases
    phraseSeed = seed

    const { systemPrompt, userPrompt, variationMeta } = buildColumnistPrompt({ cleanDraft, humanPhrases: phrases })
    console.log(`[COLUMNIST] 변주: 아웃라인=${variationMeta.outlineId}, 도입부=${variationMeta.introId}`)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.5,
      max_tokens: 2000,
      tools: [{
        name: 'write_blog_post',
        description: '블로그 글을 구조화된 형식으로 작성합니다',
        input_schema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string', description: 'SEO H1 제목 (40자 이내)' },
            meta_description: { type: 'string', description: '150~170자 메타 설명' },
            subtitle: { type: 'string', description: '부제목 (30~60자)' },
            tags: { type: 'array', items: { type: 'string' }, description: 'SEO 태그 3개' },
            summary_points: {
              type: 'array',
              items: { type: 'string' },
              description: '핵심 요약 3~4가지 (각 50자 이상, 수치 포함 권장)'
            },
            sections: {
              type: 'array',
              description: '본문 섹션 3~4개',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string', description: 'H2 섹션 제목' },
                  paragraphs: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '문단 2~3개 (각 3~5문장, 수치+판단해석 포함)'
                  },
                  expert_insight: { type: 'string', description: '핵심 포인트 1~2문장 (없으면 빈 문자열)' }
                },
                required: ['heading', 'paragraphs', 'expert_insight']
              }
            },
            action_tips: {
              type: 'array',
              items: { type: 'string' },
              description: '지금 바로 확인할 것 3~5가지 (짧고 구체적으로)'
            }
          },
          required: ['title', 'meta_description', 'subtitle', 'tags', 'summary_points', 'sections', 'action_tips']
        }
      }],
      tool_choice: { type: 'any' as const }
    })

    const toolUse = response.content.find(c => c.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      console.error('[COLUMNIST] Tool Use 응답 없음')
      return {
        success: false,
        error: { code: ERROR_CODES.PARSE_ERROR, message: 'AI가 구조화된 응답을 반환하지 않았습니다', stage: 'COLUMNIST' }
      }
    }

    const data = toolUse.input as StructuredArticle
    console.log('[COLUMNIST] 구조화 응답 수신. 섹션:', data.sections?.length, '요약:', data.summary_points?.length)

    // HTML 빌드
    const html = buildHtml(data)

    // 간단 검증
    const failures: string[] = []
    const warnings: string[] = []
    if (!data.sections || data.sections.length < 2) failures.push('섹션이 2개 미만입니다')
    if (!data.summary_points || data.summary_points.length < 2) failures.push('핵심 요약이 2개 미만입니다')
    if (!data.action_tips || data.action_tips.length < 2) warnings.push('실천 팁이 2개 미만입니다')

    if (failures.length > 0) console.warn('[COLUMNIST] 검증 실패:', failures)
    else console.log('[COLUMNIST] 완료!')

    return {
      success: true,
      data: {
        title: data.title || '제목 없음',
        metaDescription: data.meta_description || '',
        tags: data.tags || [],
        markdown: html,
        usedPhrases,
        phraseSeed,
        validationPassed: failures.length === 0,
        validationFailures: failures,
        validationWarnings: warnings
      }
    }

  } catch (error) {
    console.error('[COLUMNIST] 오류:', error)
    const errorInfo = analyzeAnthropicError(error)
    return {
      success: false,
      error: { code: errorInfo.code, message: errorInfo.message, stage: 'COLUMNIST' }
    }
  }
}
