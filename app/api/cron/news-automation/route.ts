/**
 * 뉴스 자동화 통합 API
 * 1. RSS 뉴스 수집
 * 2. 초안 자동 생성
 * Vercel Cron: 매일 10:30 실행
 */

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateSlug } from '@/lib/utils'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const parser = new Parser()

// Perplexity API 클라이언트 (OpenAI SDK 호환)
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai'
})

// SHA-256 해시 생성
function generateHash(title: string, link: string): string {
  return createHash('sha256').update(`${title}${link}`).digest('hex')
}

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

**출력 형식**: 마크다운`
        },
        {
          role: 'user',
          content: `다음 금융 뉴스를 분석하여 "이 정책이 내 대출에 정확히 무엇을 바꾸는가?"에 답하는 블로그 글을 작성하세요.

**뉴스 제목**: ${originalTitle}
**뉴스 링크**: ${newsLink}
**카테고리**: ${category}

뉴스를 직접 검색하여 원문을 파악하고, 다음 구조로 작성하세요:

# [뉴스 기반 SEO 제목]

## 한 줄 요약
- 정책/변화의 핵심을 1문장으로

## 이슈 배경
- 이 정책이 왜 나왔는가?
- 누구를 대상으로 하는가?
- 구체적인 변화 내용 (수치, 조건 포함)

## 내 대출에 미치는 영향
**뉴스와 직접 관련된 영향만 작성**
- 대상자: 누가 영향을 받는가
- 변화: 무엇이 달라지는가
- 조건: 어떤 조건이 필요한가

## 계산 예시
**뉴스의 실제 수치를 사용**
- 예시 1: [구체적 상황]
  - 현재 상태
  - 변화 후 상태
  - 실질적 효과

## 실제 활용 방법
- 단계별 실행 방법
- 준비해야 할 서류나 조건
- 주의사항

## FAQ
- Q1: [이 정책 관련 질문]
- Q2: [대상자 관련 질문]
- Q3: [실행 방법 관련 질문]

## 주의사항
> ⚠️ 이 글은 ${originalTitle}에 대한 정보 제공 목적이며, 개인 상황에 따라 적용이 다를 수 있습니다.

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
    console.error('[AI-DRAFT] Perplexity API 오류, 폴백 사용:', error)
    // API 실패 시 기본 템플릿으로 폴백
    return generateDraftContentFallback(newsItem)
  }
}

// 폴백: 템플릿 기반 초안 생성
function generateDraftContentFallback(newsItem: any): { title: string; summary: string; content: string; tags: string[] } {
  const originalTitle = newsItem.title
  const category = newsItem.category || '금융'

  const seoTitle = `${originalTitle} - 대출·금리 영향 분석`
  const summary = `${originalTitle} 뉴스가 발표되었습니다. 이번 발표가 개인 대출, DSR, 금리에 미치는 영향을 분석하고, 실제 사례를 통해 대출 전략을 제시합니다.`

  const content = `# ${originalTitle}

## 한 줄 요약
최근 발표된 금융 정책 변화로 대출 시장에 새로운 변화가 예상됩니다.

## 이슈 배경

${originalTitle} 관련 뉴스가 발표되었습니다.

최근 ${category} 시장에서 주목할 만한 변화가 감지되고 있습니다. 이번 발표는 향후 대출 시장에 직접적인 영향을 미칠 것으로 예상됩니다.

**원문 확인**: [뉴스 원문 보기](${newsItem.link})

## 내 대출에 미치는 영향

### DSR 관점
- DSR(총부채원리금상환비율) 규제 변화 가능성
- 신규 대출 한도 조정 예상
- 기존 대출자의 추가 대출 여력 변동

### 금리 관점
- 시장 금리 변동 전망
- 고정금리 vs 변동금리 전략 검토 필요
- 대출 갈아타기 타이밍 재평가

### 한도 관점
- 신용대출 한도 영향
- 주택담보대출 LTV 변화 가능성
- 프리랜서/자영업자 대출 조건 변화

## 계산 예시

### 예시 1: 연소득 5천만원 직장인
**가정**:
- 연소득: 5,000만원
- 기존 대출: 1억원 (월 상환 50만원)
- 신규 대출 희망: 5천만원

**현재 DSR**: (50만원 × 12) / 5,000만원 = 12%
**신규 대출 시 DSR**: 예상 20% (여유 있음)

### 예시 2: 프리랜서 연소득 4천만원
**가정**:
- 연소득: 4,000만원 (증빙 가능 금액)
- 기존 대출: 없음
- 신규 대출 희망: 7천만원

**예상 DSR**: 약 25%
**결론**: 소득 증빙 자료 준비 시 대출 가능

## 실제 사례

### 사례 1: 대출 금리 인하 성공
30대 직장인 A씨는 이번 금리 변화 시점에 기존 대출(연 4.5%)을 재조정하여 연 3.8%로 금리를 인하받았습니다. 5천만원 대출 기준 연간 약 35만원의 이자 절감 효과를 얻었습니다.

### 사례 2: DSR 규제 대응
40대 자영업자 B씨는 DSR 규제 강화 전 미리 신용대출 한도를 확보했습니다. 월 소득 대비 부채 비율을 30% 이하로 유지하며 안정적인 재무 구조를 만들었습니다.

## FAQ

### Q1. 지금 당장 대출을 받아야 할까요?
현재 금리 수준과 개인 신용 상태를 종합적으로 고려해야 합니다. 급하지 않다면 2-3개월 시장 동향을 지켜보는 것도 전략입니다.

### Q2. DSR 40% 규제는 어떻게 계산하나요?
(연간 모든 대출 원리금 상환액) ÷ (연소득) × 100으로 계산합니다. 신용대출, 주택담보대출, 카드론 등 모든 대출이 포함됩니다.

### Q3. 프리랜서도 대출 받을 수 있나요?
가능합니다. 단, 소득 증빙 자료(종합소득세 신고서, 3개월 이상 통장 입금 내역 등)가 필요하며, 직장인 대비 금리가 0.5-1% 높을 수 있습니다.

### Q4. 고정금리와 변동금리 중 어떤 것이 유리한가요?
금리 상승기에는 고정금리가, 금리 하락기에는 변동금리가 유리합니다. 현재 시장 상황과 본인의 리스크 감수 성향을 고려하세요.

### Q5. 기존 대출을 갈아타기 하려면 어떻게 해야 하나요?
먼저 중도상환수수료를 확인하고, 새 대출 금리와 비교하여 실질적인 절감액을 계산하세요. 일반적으로 금리 차이가 1% 이상일 때 갈아타기가 유리합니다.

## 주의사항

> ⚠️ **중요**: 이 글은 일반적인 정보 제공 목적이며, 개인의 신용 상태, 소득 수준, 기존 대출 현황에 따라 실제 조건은 크게 달라질 수 있습니다.
>
> 대출 실행 전 반드시 금융기관과 직접 상담하시고, 본인의 상환 능력을 신중히 검토하세요.

---

**관련 키워드**: ${category}, 대출, 금리, DSR, 신용대출, 주택담보대출, 금융 정책
`

  const tags = [category, '대출', '금리', 'DSR', '금융정책']

  return { title: seoTitle, summary, content, tags }
}

export async function GET(request: Request) {
  try {
    console.log('[NEWS-AUTOMATION] Starting automated workflow...')

    // Authorization 검증
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      fetch: { total: 0, new: 0, duplicate: 0, sources: 0 },
      draft: { processed: 0, created: 0, errors: 0 }
    }

    // ============================================
    // STEP 1: RSS 뉴스 수집
    // ============================================
    console.log('[NEWS-AUTOMATION] Step 1: Fetching RSS feeds...')

    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('news_sources')
      .select('*')
      .eq('active', true)

    if (sourcesError) {
      console.error('[NEWS-AUTOMATION] Sources error:', sourcesError)
      throw new Error('Failed to fetch sources')
    }

    if (sources && sources.length > 0) {
      results.fetch.sources = sources.length

      for (const source of sources) {
        try {
          console.log(`[NEWS-AUTOMATION] Fetching: ${source.name}`)
          const feed = await parser.parseURL(source.url)

          if (feed.items && feed.items.length > 0) {
            // 최신 20개만 처리
            const itemsToProcess = feed.items.slice(0, 20)

            for (const item of itemsToProcess) {
              if (!item.title || !item.link) continue

              results.fetch.total++
              const hash = generateHash(item.title, item.link)
              const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()

              const { data, error } = await supabaseAdmin
                .from('news_items')
                .upsert(
                  {
                    source_id: source.id,
                    title: item.title,
                    link: item.link,
                    pub_date: pubDate.toISOString(),
                    category: source.category,
                    hash: hash
                  },
                  { onConflict: 'hash', ignoreDuplicates: true }
                )
                .select()

              if (error) {
                if (error.code === '23505') {
                  results.fetch.duplicate++
                }
              } else if (data && data.length > 0) {
                results.fetch.new++
                console.log(`[NEWS-AUTOMATION] New item: ${item.title}`)
              } else {
                results.fetch.duplicate++
              }
            }
          }

          await supabaseAdmin
            .from('news_sources')
            .update({ last_fetched_at: new Date().toISOString() })
            .eq('id', source.id)

        } catch (feedError) {
          console.error(`[NEWS-AUTOMATION] Feed error ${source.name}:`, feedError)
        }
      }
    }

    console.log('[NEWS-AUTOMATION] Step 1 completed:', results.fetch)

    // ============================================
    // STEP 2: 초안 생성
    // ============================================
    console.log('[NEWS-AUTOMATION] Step 2: Generating drafts...')

    const { data: newsItems, error: newsError } = await supabaseAdmin
      .from('news_items')
      .select('*')
      .eq('draft_generated', false)
      .eq('excluded', false)
      .order('pub_date', { ascending: false })
      .limit(10)

    if (newsError) {
      console.error('[NEWS-AUTOMATION] News items error:', newsError)
      throw new Error('Failed to fetch news items')
    }

    if (newsItems && newsItems.length > 0) {
      for (const item of newsItems) {
        try {
          results.draft.processed++
          console.log(`[NEWS-AUTOMATION] Processing: ${item.title}`)

          const { title, summary, content, tags } = await generateDraftContentWithAI(item)
          const slug = generateSlug(title)

          const { data: draft, error: draftError } = await supabaseAdmin
            .from('drafts')
            .insert({
              news_item_id: item.id,
              title,
              slug,
              summary,
              content,
              category: item.category,
              tags,
              status: 'pending'
            })
            .select()
            .single()

          if (draftError) {
            console.error('[NEWS-AUTOMATION] Draft error:', draftError)
            results.draft.errors++
            continue
          }

          await supabaseAdmin
            .from('news_items')
            .update({ draft_generated: true })
            .eq('id', item.id)

          results.draft.created++
          console.log(`[NEWS-AUTOMATION] Draft created: ${draft.id}`)

        } catch (itemError) {
          console.error(`[NEWS-AUTOMATION] Item error:`, itemError)
          results.draft.errors++
        }
      }
    }

    console.log('[NEWS-AUTOMATION] Step 2 completed:', results.draft)
    console.log('[NEWS-AUTOMATION] Workflow completed successfully')

    return NextResponse.json({
      success: true,
      message: 'News automation completed',
      results
    })

  } catch (error) {
    console.error('[NEWS-AUTOMATION] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
