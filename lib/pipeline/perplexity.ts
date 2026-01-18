/**
 * Perplexity AI 초안 생성 함수
 * sonar-pro 모델로 뉴스 분석 및 블로그 초안 생성
 */

import OpenAI from 'openai'
import type { PipelineResult, PerplexityResult, NewsItemRecord } from './types'

// Perplexity API 클라이언트
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
  timeout: 50000,
  maxRetries: 2
})

// 에러 코드
const ERROR_CODES = {
  API_ERROR: 'PERPLEXITY_API_ERROR',
  PARSE_ERROR: 'PERPLEXITY_PARSE_ERROR',
  EMPTY_RESPONSE: 'PERPLEXITY_EMPTY_RESPONSE',
  UNKNOWN: 'PERPLEXITY_UNKNOWN_ERROR'
}

/**
 * Perplexity API로 뉴스 기반 블로그 초안 생성
 */
export async function runPerplexity(
  newsItem: Pick<NewsItemRecord, 'title' | 'link' | 'category'>
): Promise<PipelineResult<PerplexityResult>> {
  const { title: originalTitle, link: newsLink, category = '금융' } = newsItem

  try {
    console.log('[PERPLEXITY] 초안 생성 시작:', originalTitle.slice(0, 50))

    const response = await perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `당신은 금융 뉴스를 실질적인 대출·금융 판단 정보로 변환하는 전문 작가입니다.

**[중요] 글 길이 제한**: 전체 6,000~8,000자 이내로 작성하세요. 각 섹션은 3~5문장으로 간결하게.

**핵심 원칙**:
1. 뉴스의 정책/변화를 정확히 파악하고, 그것이 "실제 개인의 대출"에 미치는 구체적 영향을 분석
2. 일반론 금지 - 뉴스에 나온 실제 정책, 수치, 조건만 사용
3. 관련 없는 DSR, 금리, 신규대출 이야기 금지 - 뉴스 주제와 직결된 내용만
4. 계산 예시는 뉴스의 실제 수치 기반으로만 작성
5. YMYL(금융 허위 정보) 주의 - 추측이나 일반적 조언 지양

**고품질 작성 6대 원칙**:
1. **독자 돈 기준 요약**: "보험료 9000원 오른다" (O) / "손보사들이 1.3% 인상" (X)
2. **뉴스 유형별 섹션명 자동화**
3. **숫자는 기사에서만**: 기사의 실제 수치만 사용
4. **구체적 사례 1개 필수**: "서울 40대 직장인 A씨는..." 형식
5. **행동 힌트 제시**: "비교 견적을 확인하세요" 등
6. **제목에 독자 대상 명시**: "직장인·자가용 운전자" 등

**출력 형식**: 마크다운 (글자수 엄수)`
        },
        {
          role: 'user',
          content: `다음 금융 뉴스를 분석하여 "독자의 돈에 정확히 무엇이 달라지는가?"에 답하는 블로그 글을 작성하세요.

**[중요] 반드시 아래 뉴스 제목의 내용만 다루세요.**

**뉴스 제목**: ${originalTitle}
**뉴스 링크**: ${newsLink}
**카테고리**: ${category}

위 뉴스 제목 "${originalTitle}"의 내용을 중심으로 다음 구조로 작성하세요:

# [독자 대상] + [핵심 변화] - [구체적 금액/수치]

## 한 줄 요약
- **독자의 돈 기준**으로 작성

## 이슈 배경
- 이 정책이 왜 나왔는가?
- 누구를 대상으로 하는가?
- 구체적인 변화 내용

## ${category === '대출' ? '내 대출에' : category === '보험' ? '내 보험료에' : '나에게'} 미치는 영향
- 대상자, 변화, 조건, 행동 힌트

## 계산 예시
- 기사의 실제 수치 기반

## 구체적 사례
- "[지역] [연령대] [직업]인 [이니셜]씨는..."

## 실제 활용 방법
- 단계별 실행 방법

## FAQ
- Q1~Q3

## 주의사항
> ⚠️ 정보 제공 목적이며, 개인 상황에 따라 적용이 다를 수 있습니다.

---
**출처**: ${newsLink}
**관련 키워드**: ${category}, [키워드 3-5개]`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000  // 2000~3000이면 충분
    })

    const aiContent = response.choices[0]?.message?.content || ''

    if (!aiContent) {
      return {
        success: false,
        error: {
          code: ERROR_CODES.EMPTY_RESPONSE,
          message: 'AI 응답이 비어있습니다',
          stage: 'PERPLEXITY'
        }
      }
    }

    console.log('[PERPLEXITY] 응답 길이:', aiContent.length, '자')

    // 제목 추출
    const titleMatch = aiContent.match(/^#\s+(.+)$/m)
    const seoTitle = titleMatch ? titleMatch[1].trim() : `${originalTitle} - 대출 영향 분석`

    // 요약 추출
    const summaryMatch = aiContent.match(/##\s+한 줄 요약\s*\n-\s*(.+)/i)
    const summary = summaryMatch
      ? summaryMatch[1].trim()
      : `${originalTitle}에 대한 금융 정책 분석`

    // 태그 추출
    const tagsMatch = aiContent.match(/\*\*관련 키워드\*\*:\s*(.+)$/m)
    const tags = tagsMatch
      ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean).slice(0, 5)
      : [category, '금융', '대출']

    console.log('[PERPLEXITY] 완료!')

    return {
      success: true,
      data: {
        title: seoTitle,
        summary,
        content: aiContent,
        tags
      }
    }

  } catch (error) {
    console.error('[PERPLEXITY] 오류:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let errorCode = ERROR_CODES.UNKNOWN

    if (error instanceof OpenAI.APIError) {
      errorCode = ERROR_CODES.API_ERROR
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        stage: 'PERPLEXITY'
      }
    }
  }
}
