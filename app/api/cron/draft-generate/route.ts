/**
 * 초안 자동 생성 API
 * Vercel Cron: 1시간마다 실행 (10분 지연)
 * GET /api/cron/draft-generate
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateSlug } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 템플릿 기반 초안 생성 (금융/대출 특화)
function generateDraftContent(newsItem: any): { title: string; summary: string; content: string; tags: string[] } {
  const originalTitle = newsItem.title
  const category = newsItem.category || '금융'

  // SEO 최적화된 제목 생성
  const seoTitle = `${originalTitle} - 대출·금리 영향 분석`

  // 요약 생성
  const summary = `${originalTitle} 뉴스가 발표되었습니다. 이번 발표가 개인 대출, DSR, 금리에 미치는 영향을 분석하고, 실제 사례를 통해 대출 전략을 제시합니다.`

  // 템플릿 기반 본문 생성 (마크다운)
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

  // 태그 생성
  const tags = [category, '대출', '금리', 'DSR', '금융정책']

  return {
    title: seoTitle,
    summary,
    content,
    tags
  }
}

export async function GET(request: Request) {
  try {
    console.log('[DRAFT-GENERATE] Starting draft generation...')

    // Authorization 헤더 검증
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 초안이 생성되지 않은 뉴스 아이템 가져오기 (제외되지 않은 것만)
    const { data: newsItems, error: newsError } = await supabaseAdmin
      .from('news_items')
      .select('*')
      .eq('draft_generated', false)
      .eq('excluded', false)
      .order('pub_date', { ascending: false })
      .limit(10) // 한 번에 10개씩 처리

    if (newsError) {
      console.error('[DRAFT-GENERATE] News items error:', newsError)
      return NextResponse.json({ error: 'Failed to fetch news items' }, { status: 500 })
    }

    if (!newsItems || newsItems.length === 0) {
      console.log('[DRAFT-GENERATE] No items to process')
      return NextResponse.json({
        success: true,
        message: 'No items to process',
        stats: { processed: 0, created: 0, errors: 0 }
      })
    }

    let processed = 0
    let created = 0
    let errors = 0

    // 각 뉴스 아이템에 대해 초안 생성
    for (const item of newsItems) {
      try {
        processed++
        console.log(`[DRAFT-GENERATE] Processing: ${item.title}`)

        // 템플릿 기반 콘텐츠 생성
        const { title, summary, content, tags } = generateDraftContent(item)
        const slug = generateSlug(title)

        // 초안 삽입
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
          console.error('[DRAFT-GENERATE] Draft insert error:', draftError)
          errors++
          continue
        }

        // 뉴스 아이템의 draft_generated 플래그 업데이트
        await supabaseAdmin
          .from('news_items')
          .update({ draft_generated: true })
          .eq('id', item.id)

        created++
        console.log(`[DRAFT-GENERATE] Draft created: ${draft.id}`)

      } catch (itemError) {
        console.error(`[DRAFT-GENERATE] Error processing item ${item.id}:`, itemError)
        errors++
      }
    }

    const stats = {
      processed,
      created,
      errors
    }

    console.log('[DRAFT-GENERATE] Completed:', stats)

    return NextResponse.json({
      success: true,
      message: 'Draft generation completed',
      stats
    })

  } catch (error) {
    console.error('[DRAFT-GENERATE] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
