/**
 * Supabase Admin Client (Service Role)
 * 서버 사이드 전용 - 클라이언트에서 절대 사용 금지!
 * RLS를 우회하여 모든 데이터에 접근 가능
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase Service Role environment variables')
}

// Service Role 클라이언트 (서버 전용)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
