/**
 * 브라우저(클라이언트 컴포넌트) 전용 Supabase 클라이언트
 *
 * createBrowserClient(@supabase/ssr)를 사용해 인증 세션을
 * localStorage + 쿠키에 동시에 저장한다.
 * 쿠키에 저장되어야 createSupabaseServerClient()가 서버에서 세션을 읽을 수 있다.
 *
 * ※ 서버 컴포넌트에서는 lib/supabase.ts(anon) 또는
 *    lib/supabase-server.ts(세션 필요 시)를 사용할 것.
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey)
