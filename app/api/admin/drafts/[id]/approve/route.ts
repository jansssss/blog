/**
 * 초안 승인 및 게시글 발행 API
 * POST /api/admin/drafts/[id]/approve
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

    // 로그인 확인 (클라이언트에서 보낸 요청)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // posts 테이블에 게시글 삽입
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
        author_id: user.id
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

    // 초안 상태 업데이트 (승인됨 + 발행된 게시글 ID 저장)
    const { error: updateError } = await supabaseAdmin
      .from('drafts')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        published_post_id: post.id
      })
      .eq('id', draftId)

    if (updateError) {
      console.error('[APPROVE] Draft update error:', updateError)
      // 게시글은 이미 생성되었으므로 에러를 로그만 남기고 계속 진행
    }

    console.log(`[APPROVE] Draft ${draftId} approved and published as post ${post.id}`)

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
