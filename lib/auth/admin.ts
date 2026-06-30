/**
 * 서버 사이드 관리자 인증 유틸
 *
 * 사용법:
 *   const result = await requireAdmin()
 *   if (result instanceof Response) return result   // 401 or 403
 *   const { id, email } = result                   // 검증된 관리자 정보
 */

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface AdminUser {
  id: string
  email: string
}

/**
 * 1) 쿠키에서 Supabase 세션을 읽어 로그인 여부 확인 → 없으면 401
 * 2) admins 테이블에 해당 user.id가 존재하는지 확인 → 없으면 403
 * 3) 통과하면 AdminUser 반환
 */
export async function requireAdmin(): Promise<AdminUser | NextResponse> {
  // 서버 사이드 세션 확인
  const supabaseServer = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // admins 테이블 membership 확인 (service role로 RLS 우회 없이 직접 조회)
  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()

  if (adminError || !admin) {
    return NextResponse.json(
      { error: 'Forbidden: admin only' },
      { status: 403 }
    )
  }

  return {
    id: user.id,
    email: user.email ?? '',
  }
}
