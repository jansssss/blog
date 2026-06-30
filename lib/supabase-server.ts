/**
 * 서버 사이드 전용 Supabase 클라이언트 팩토리
 * Next.js App Router cookies()를 사용해 세션을 읽는다.
 * API Route, Server Component에서만 사용할 것.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 읽기 전용 컨텍스트(Server Component 렌더링 중)에서는 무시
          }
        },
      },
    }
  )
}
