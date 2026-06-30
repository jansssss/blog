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

interface CalculatorCta {
  label: string
  url: string
}

interface StructuredArticle {
  title: string
  meta_description: string
  subtitle: string
  slug?: string
  tags: string[]
  summary_points: string[]
  sections: ArticleSection[]
  calculator_ctas?: CalculatorCta[]
  action_tips: string[]
  faqs?: Array<{ question: string; answer: string }>
  sources?: string[]
  disclaimer?: string
}

// ───────────────────────────────────────────
// HTML 빌더 (Blogger 스타일)
// ───────────────────────────────────────────
function buildHtml(data: StructuredArticle): string {
  const font = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"

  // 핵심 요약 박스
  const summaryItems = (data.summary_points ?? [])
    .map(p => `<li style="font-family:${font};font-size:15px;color:#2a3a5c;line-height:1.75;margin-bottom:8px;word-break:keep-all;">${esc(p)}</li>`)
    .join('\n')

  const summaryHtml = summaryItems ? `
<div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin:0 0 32px;">
  <div style="font-family:${font};font-size:13px;font-weight:700;color:#3268ff;margin-bottom:10px;letter-spacing:0.04em;">✅ 핵심 요약</div>
  <ul style="margin:0;padding-left:20px;">${summaryItems}</ul>
</div>` : ''

  // 본문 섹션들
  const sectionsHtml = (data.sections ?? []).map(section => {
    const paragraphsHtml = (section.paragraphs ?? [])
      .map(p => `<p style="font-family:${font};font-size:16px;color:#3a4a62;margin:0 0 14px;line-height:1.9;word-break:keep-all;">${esc(p)}</p>`)
      .join('\n')

    const insightHtml = section.expert_insight
      ? `<div style="background:#f0f4ff;border-left:4px solid #3268ff;border-radius:0 8px 8px 0;padding:14px 18px;margin:4px 0 20px;">
  <div style="font-family:${font};font-size:12px;font-weight:700;color:#3268ff;margin-bottom:6px;letter-spacing:0.04em;">💡 핵심 포인트</div>
  <p style="font-family:${font};font-size:15px;color:#2a3a5c;margin:0;line-height:1.75;word-break:keep-all;">${esc(section.expert_insight)}</p>
</div>`
      : ''

    return `<section>
<h2 style="font-family:${font};font-size:22px;font-weight:800;color:#1c2741;margin:40px 0 14px;padding-bottom:8px;border-bottom:2px solid #eef2f7;letter-spacing:-0.02em;line-height:1.4;word-break:keep-all;">${esc(section.heading ?? '')}</h2>
${paragraphsHtml}${insightHtml}</section>`
  }).join('\n')

  // 지금 바로 할 수 있는 것 (action tips)
  const tipsHtml = (data.action_tips ?? [])
    .map(tip => `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:#fff;border:1.5px solid #ffcfc9;color:#cc3a28;font-size:13px;font-weight:600;line-height:1.5;margin:0 4px 6px 0;">${esc(tip)}</span>`)
    .join('\n')

  const actionHtml = `
<div style="background:#fff8f6;border-radius:12px;padding:20px 24px;margin:36px 0 28px;">
  <div style="font-family:${font};font-size:13px;font-weight:700;color:#cc3a28;margin-bottom:12px;letter-spacing:0.04em;">🎯 지금 바로 확인할 것</div>
  <div>${tipsHtml}</div>
</div>`

  // 계산기 CTA 섹션
  let calcCtaHtml = ''
  if (data.calculator_ctas && data.calculator_ctas.length > 0) {
    const ctaLinks = data.calculator_ctas
      .map(c => `<li style="margin-bottom:8px;"><a href="${esc(c.url)}" style="font-family:${font};font-size:15px;color:#4f46e5;font-weight:600;text-decoration:none;">${esc(c.label)} →</a></li>`)
      .join('\n')
    calcCtaHtml = `
<div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin:28px 0;">
  <div style="font-family:${font};font-size:13px;font-weight:700;color:#4f46e5;margin-bottom:12px;letter-spacing:0.04em;">🧮 직접 계산해보기</div>
  <ul style="margin:0;padding-left:20px;">${ctaLinks}</ul>
</div>`
  }

  // FAQ 섹션
  let faqHtml = ''
  if (data.faqs && data.faqs.length > 0) {
    const faqItems = data.faqs
      .map(faq => `
<dt style="font-family:${font};font-size:15px;font-weight:700;color:#1c2741;margin:16px 0 6px;">Q. ${esc(faq.question)}</dt>
<dd style="font-family:${font};font-size:15px;color:#3a4a62;margin:0 0 8px;line-height:1.85;word-break:keep-all;">${esc(faq.answer)}</dd>`)
      .join('\n')
    faqHtml = `
<div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:28px 0;">
  <div style="font-family:${font};font-size:13px;font-weight:700;color:#374151;margin-bottom:4px;letter-spacing:0.04em;">❓ 자주 묻는 질문</div>
  <dl style="margin:0;">${faqItems}</dl>
</div>`
  }

  // 출처
  let sourcesHtml = ''
  if (data.sources && data.sources.length > 0) {
    const sourceItems = data.sources
      .map(s => `<li style="font-family:${font};font-size:13px;color:#6b7280;margin-bottom:4px;">${esc(s)}</li>`)
      .join('\n')
    sourcesHtml = `
<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;">
<div style="font-family:${font};font-size:12px;font-weight:700;color:#9ca3af;margin-bottom:8px;letter-spacing:0.04em;">참고 자료</div>
<ul style="margin:0;padding-left:20px;">${sourceItems}</ul>`
  }

  // 면책 고지
  const disclaimerText = data.disclaimer || '이 글은 정보 제공 목적으로 작성되었으며, 금융기관 심사 결과를 보장하지 않습니다. 실제 대출 여부 및 한도는 신청 금융기관의 기준에 따라 달라질 수 있습니다.'
  const disclaimerHtml = `
<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0 12px;">
<p style="font-family:${font};font-size:12px;color:#9ca3af;line-height:1.7;margin:0;">⚠️ ${esc(disclaimerText)}</p>`

  return summaryHtml + '\n' + sectionsHtml + '\n' + actionHtml + calcCtaHtml + faqHtml + sourcesHtml + disclaimerHtml
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
      max_tokens: 3000,
      tools: [{
        name: 'write_blog_post',
        description: '금융 사례 분석 블로그 글을 구조화된 형식으로 작성합니다',
        input_schema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string', description: 'SEO H1 제목 (40~60자, 핵심 수치·조건 포함)' },
            meta_description: { type: 'string', description: '150~170자 메타 설명' },
            subtitle: { type: 'string', description: '부제목 (30~60자)' },
            slug: { type: 'string', description: '영문 소문자+하이픈, 3~6단어, 날짜 없이 주제 중심' },
            tags: { type: 'array', items: { type: 'string' }, description: 'SEO 태그 3개' },
            summary_points: {
              type: 'array',
              items: { type: 'string' },
              description: '핵심 요약 1개 (60자 이상, 계산 가정+결과+조건 가변성 포함)'
            },
            sections: {
              type: 'array',
              description: '본문 섹션 (계산 가정 표·시나리오 비교·계산기 CTA 포함)',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string', description: 'H2 제목 (조건 명시형 또는 질문형)' },
                  paragraphs: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '문단 2~3개 (수치+출처+계산 근거 포함)'
                  },
                  expert_insight: { type: 'string', description: '핵심 포인트 1문장 (없으면 빈 문자열 "")' }
                },
                required: ['heading', 'paragraphs', 'expert_insight']
              }
            },
            calculator_ctas: {
              type: 'array',
              description: 'ohyess.kr 계산기·가이드 링크 2개 이상',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', description: '링크 텍스트' },
                  url: { type: 'string', description: '/calculator/... 또는 /guide/...' }
                },
                required: ['label', 'url']
              }
            },
            action_tips: {
              type: 'array',
              items: { type: 'string' },
              description: '지금 바로 확인할 것 5~6가지 (계산기 URL 포함 가능, 구체적 행동+수치)'
            },
            faqs: {
              type: 'array',
              description: 'FAQ 3개',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: '검색 의도 기반 질문' },
                  answer: { type: 'string', description: '2~3문장, 수치 포함' }
                },
                required: ['question', 'answer']
              }
            },
            sources: {
              type: 'array',
              items: { type: 'string' },
              description: '참고 출처 (기관명 + 연도)'
            },
            disclaimer: {
              type: 'string',
              description: '면책 고지 문구'
            }
          },
          required: ['title', 'meta_description', 'subtitle', 'slug', 'tags', 'summary_points', 'sections', 'calculator_ctas', 'action_tips', 'faqs', 'disclaimer']
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

    // YMYL 검증
    const failures: string[] = []
    const warnings: string[] = []

    if (!data.sections || data.sections.length < 3) failures.push('섹션이 3개 미만입니다')
    if (!data.summary_points || data.summary_points.length < 1) failures.push('핵심 요약이 없습니다')
    if (!data.calculator_ctas || data.calculator_ctas.length < 2) failures.push(`계산기 링크 부족 (${data.calculator_ctas?.length ?? 0}개, 2개 이상 필요)`)
    if (!data.faqs || data.faqs.length < 3) warnings.push(`FAQ ${data.faqs?.length ?? 0}개 (3개 권장)`)
    if (!data.disclaimer) failures.push('면책 고지 누락')
    if (!data.slug) warnings.push('slug 미생성 — fallback slug 사용됨')
    if (!data.action_tips || data.action_tips.length < 3) warnings.push('실천 팁이 3개 미만입니다')

    // HTML에 기준일 문구 있는지 체크
    if (!/기준\s*(으로|)?\s*작성|공시\s*기준|기준일/.test(html)) {
      failures.push('기준일 문구 미포함')
    }

    if (failures.length > 0) console.warn('[COLUMNIST] 검증 실패:', failures)
    else console.log('[COLUMNIST] 완료!')

    return {
      success: true,
      data: {
        title: data.title || '제목 없음',
        metaDescription: data.meta_description || '',
        slug: data.slug || '',
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
