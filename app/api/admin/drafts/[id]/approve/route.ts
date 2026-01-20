/**
 * 초안 승인 및 게시글 발행 API
 * POST /api/admin/drafts/[id]/approve
 *
 * 요청 body: { site_id: string } - 필수
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: draftId } = await params

    // 요청 body에서 site_id 추출 (필수)
    let siteId: string | null = null
    try {
      const body = await request.json()
      siteId = body.site_id
    } catch {
      // body가 없는 경우
    }

    // site_id 필수 검증
    if (!siteId) {
      return NextResponse.json(
        { error: '발행할 사이트를 선택해주세요 (site_id 필수)' },
        { status: 400 }
      )
    }

    // 로그인 확인 (클라이언트에서 보낸 요청)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // site_id 유효성 검증
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id, name')
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: '유효하지 않은 사이트입니다' },
        { status: 400 }
      )
    }

    // 초안 가져오기
    const { data: draft, error: draftError } = await supabaseAdmin
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (draftError || !draft) {
      console.error('[APPROVE] Draft not found:', draftError)
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    if (draft.status === 'approved') {
      return NextResponse.json(
        { error: 'Draft already approved', postId: draft.published_post_id },
        { status: 400 }
      )
    }

    // posts 테이블에 게시글 삽입 (site_id 포함)
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        title: draft.title,
        slug: draft.slug,
        summary: draft.summary,
        content: draft.content,
        category: draft.category,
        tags: draft.tags,
        thumbnail_url: draft.thumbnail_url,
        published: true,
        published_at: new Date().toISOString(),
        author_id: user.id,
        site_id: siteId  // 선택된 사이트 ID
      })
      .select()
      .single()

    if (postError) {
      console.error('[APPROVE] Post insert error:', postError)

      // slug 중복 에러 처리
      if (postError.code === '23505') {
        return NextResponse.json(
          { error: 'Slug already exists. Please modify the slug in draft.' },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    // 초안 삭제 (posts에 복사 완료되었으므로 더 이상 필요 없음)
    const { error: deleteError } = await supabaseAdmin
      .from('drafts')
      .delete()
      .eq('id', draftId)

    if (deleteError) {
      console.error('[APPROVE] Draft delete error:', deleteError)
      // 게시글은 이미 생성되었으므로 에러를 로그만 남기고 계속 진행
    }

    console.log(`[APPROVE] Draft ${draftId} approved, published as post ${post.id} to site ${site.name}, and deleted`)

    return NextResponse.json({
      success: true,
      message: 'Draft approved and published',
      postId: post.id,
      slug: post.slug
    })

  } catch (error) {
    console.error('[APPROVE] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
