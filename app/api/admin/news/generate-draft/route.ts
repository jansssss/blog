/**
 * AI 초안 생성 API
 * 선택된 뉴스 아이템으로부터 Perplexity AI를 사용하여 초안 생성
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateSlug } from '@/lib/utils'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Perplexity API 클라이언트
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai'
})

// Perplexity API를 사용한 고품질 초안 생성
async function generateDraftContentWithAI(newsItem: any): Promise<{ title: string; summary: string; content: string; tags: string[] }> {
  const originalTitle = newsItem.title
  const newsLink = newsItem.link
  const category = newsItem.category || '금융'

  try {
    // Perplexity API로 뉴스 분석 및 초안 생성
    const response = await perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `당신은 금융 뉴스를 실질적인 대출·금융 판단 정보로 변환하는 전문 작가입니다.

**핵심 원칙**:
1. 뉴스의 정책/변화를 정확히 파악하고, 그것이 "실제 개인의 대출"에 미치는 구체적 영향을 분석
2. 일반론 금지 - 뉴스에 나온 실제 정책, 수치, 조건만 사용
3. 관련 없는 DSR, 금리, 신규대출 이야기 금지 - 뉴스 주제와 직결된 내용만
4. 계산 예시는 뉴스의 실제 수치 기반으로만 작성
5. YMYL(금융 허위 정보) 주의 - 추측이나 일반적 조언 지양

**고품질 작성 6대 원칙**:
1. **독자 돈 기준 요약**: "보험료 9000원 오른다" (O) / "손보사들이 1.3% 인상" (X)
2. **뉴스 유형별 섹션명 자동화**:
   - 대출 뉴스 → "내 대출에 미치는 영향"
   - 보험 뉴스 → "내 보험료에 미치는 영향"
   - 세금 뉴스 → "내 세금에 미치는 영향"
   - 금리 뉴스 → "내 이자에 미치는 영향"
3. **숫자는 기사에서만**: 기사의 실제 수치만 사용 (예: 69만2000원 × 1.014)
4. **구체적 사례 1개 필수**: "서울 40대 직장인 A씨는..." 형식으로 실제 사례 작성
5. **행동 힌트 제시**: 문장 끝에 "비교 견적을 확인하세요", "갱신 전 1주일 전에 체크하세요" 등
6. **제목에 독자 대상 명시**: "직장인·자가용 운전자", "30대 신혼부부", "프리랜서" 등

**출력 형식**: 마크다운`
        },
        {
          role: 'user',
          content: `다음 금융 뉴스를 분석하여 "독자의 돈에 정확히 무엇이 달라지는가?"에 답하는 블로그 글을 작성하세요.

**[중요] 반드시 아래 뉴스 제목의 내용만 다루세요. 다른 관련 뉴스로 주제를 바꾸지 마세요.**

**뉴스 제목**: ${originalTitle}
**뉴스 링크**: ${newsLink}
**카테고리**: ${category}

위 뉴스 제목 "${originalTitle}"의 내용을 중심으로 다음 구조로 작성하세요:

# [독자 대상] + [핵심 변화] - [구체적 금액/수치]
예: "직장인·자가용 운전자 자동차 보험료 9000원 인상" 또는 "30대 신혼부부 주담대 원금 상환 유예 가능"

## 한 줄 요약
- **독자의 돈 기준**으로 작성 (예: "보험료 9000원 오른다" / "대출 상환 3개월 중단 가능")
- 정책/변화의 핵심을 1문장으로

## 이슈 배경
- 이 정책이 왜 나왔는가?
- 누구를 대상으로 하는가? (구체적 독자층 명시)
- 구체적인 변화 내용 (기사의 실제 수치만 사용)

## ${category === '대출' ? '내 대출에' : category === '보험' ? '내 보험료에' : category === '세금' ? '내 세금에' : category === '금리' ? '내 이자에' : '나에게'} 미치는 영향
**뉴스와 직접 관련된 영향만 작성**
- 대상자: 누가 영향을 받는가 (예: "서울 거주 40대 직장인", "연소득 5천만원 자영업자")
- 변화: 무엇이 달라지는가 (기사 수치 기반)
- 조건: 어떤 조건이 필요한가
- **행동 힌트**: "○○○을 확인하세요", "△△△ 전에 체크하세요" 형식으로 마무리

## 계산 예시
**반드시 기사의 실제 수치만 사용**
- 예시: [구체적 상황과 실명 이니셜]
  - 현재 상태 (기사 수치)
  - 변화 후 상태 (기사 수치로 계산)
  - 실질적 효과 (금액)
  - **행동 힌트**: "비교 견적을 확인하세요" 등

## 구체적 사례
"[지역] [연령대] [직업]인 [이니셜]씨는..."
- 실제 상황을 가상으로 구체화
- 기사 수치를 적용한 사례
- **행동 힌트**로 마무리

## 실제 활용 방법
1. 단계별 실행 방법
2. 준비해야 할 서류나 조건
3. 주의사항
- 각 항목 끝에 **행동 힌트** 포함

## FAQ
- Q1: [이 정책 관련 질문]
- Q2: [대상자 관련 질문]
- Q3: [실행 방법 관련 질문]
- 각 답변 끝에 **행동 힌트** 포함

## 주의사항
> ⚠️ 이 글은 ${originalTitle}에 대한 정보 제공 목적이며, 개인 상황에 따라 적용이 다를 수 있습니다.
> 실제 적용 전 금융기관에 문의하세요.

---
**출처**: ${newsLink}
**관련 키워드**: ${category}, [뉴스 관련 키워드 3-5개]`
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })

    const aiContent = response.choices[0]?.message?.content || ''

    if (!aiContent) {
      throw new Error('AI 생성 실패')
    }

    // 제목 추출 (첫 번째 # 헤딩)
    const titleMatch = aiContent.match(/^#\s+(.+)$/m)
    const seoTitle = titleMatch ? titleMatch[1].trim() : `${originalTitle} - 대출 영향 분석`

    // 요약 추출 (한 줄 요약 섹션)
    const summaryMatch = aiContent.match(/##\s+한 줄 요약\s*\n-\s*(.+)/i)
    const summary = summaryMatch
      ? summaryMatch[1].trim()
      : `${originalTitle}에 대한 금융 정책 분석 및 대출 영향을 자세히 알아봅니다.`

    // 태그 추출 (관련 키워드 섹션에서)
    const tagsMatch = aiContent.match(/\*\*관련 키워드\*\*:\s*(.+)$/m)
    const tags = tagsMatch
      ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean).slice(0, 5)
      : [category, '금융', '대출']

    return {
      title: seoTitle,
      summary,
      content: aiContent,
      tags
    }

  } catch (error) {
    console.error('[AI-DRAFT] Perplexity API 오류:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { newsItemIds } = body

    if (!newsItemIds || !Array.isArray(newsItemIds) || newsItemIds.length === 0) {
      return NextResponse.json(
        { error: '뉴스 아이템 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log(`[AI-DRAFT] 초안 생성 시작: ${newsItemIds.length}개 뉴스`)

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[]
    }

    // 선택된 뉴스 아이템으로 초안 생성
    for (const newsItemId of newsItemIds) {
      try {
        // 뉴스 아이템 조회
        const { data: newsItem, error: fetchError } = await supabaseAdmin
          .from('news_items')
          .select('*')
          .eq('id', newsItemId)
          .single()

        if (fetchError || !newsItem) {
          throw new Error('뉴스 아이템을 찾을 수 없습니다.')
        }

        console.log(`[AI-DRAFT] 처리 중: ${newsItem.title}`)

        // AI로 초안 생성
        const { title, summary, content, tags } = await generateDraftContentWithAI(newsItem)
        const slug = generateSlug(title)

        // 초안 저장
        const { data: draft, error: draftError } = await supabaseAdmin
          .from('drafts')
          .insert({
            news_item_id: newsItem.id,
            title,
            slug,
            summary,
            content,
            category: newsItem.category,
            tags,
            status: 'pending'
          })
          .select()
          .single()

        if (draftError) {
          throw new Error(`초안 저장 실패: ${draftError.message}`)
        }

        // 뉴스 아이템 업데이트
        await supabaseAdmin
          .from('news_items')
          .update({ draft_generated: true })
          .eq('id', newsItem.id)

        results.success.push(newsItemId)
        console.log(`[AI-DRAFT] 성공: ${draft.id}`)

      } catch (itemError) {
        const errorMessage = itemError instanceof Error ? itemError.message : '알 수 없는 오류'
        console.error(`[AI-DRAFT] 실패 (${newsItemId}):`, errorMessage)
        results.failed.push({ id: newsItemId, error: errorMessage })
      }
    }

    console.log(`[AI-DRAFT] 완료 - 성공: ${results.success.length}, 실패: ${results.failed.length}`)

    return NextResponse.json({
      success: true,
      message: `${results.success.length}개 초안 생성 완료`,
      results
    })

  } catch (error) {
    console.error('[AI-DRAFT] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
