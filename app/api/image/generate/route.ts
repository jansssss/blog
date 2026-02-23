/**
 * DALL-E 3 이미지 생성 API
 * 칼럼니스트 글 작성 완료 후 대표 이미지 자동 생성
 * - Supabase Storage blog/ 폴더에 slug 기반 파일명으로 저장
 */

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_IMG_KEY || '',
  timeout: 55000,
  maxRetries: 0
})

function buildImagePrompt(title: string, tags: string[]): string {
  const tagsText = tags.length > 0 ? tags.join(', ') : 'personal finance, money management'
  return `A professional, clean illustration for a Korean personal finance blog article. Topic: "${title}". Related themes: ${tagsText}. Style: Modern flat design, blue and white color palette, minimalist icons representing finance or investment concepts. No text, numbers, or Korean characters in the image. High quality professional blog thumbnail, editorial illustration style.`
}

/** 슬러그를 파일명으로 안전하게 변환 */
function toSafeFilename(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, tags, slug } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: '제목(title)이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_IMG_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI 이미지 API 키(OPENAI_API_IMG_KEY)가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const prompt = buildImagePrompt(title, Array.isArray(tags) ? tags : [])
    const safeFilename = toSafeFilename(slug || title)
    console.log('[IMAGE-GEN] DALL-E 3 이미지 생성 시작...')
    console.log('[IMAGE-GEN] 제목:', title)
    console.log('[IMAGE-GEN] 파일명:', safeFilename)

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'natural'
    })

    const dalleUrl = imageResponse.data[0]?.url
    if (!dalleUrl) {
      return NextResponse.json(
        { success: false, error: '이미지 URL을 가져오지 못했습니다.' },
        { status: 500 }
      )
    }

    console.log('[IMAGE-GEN] 이미지 생성 완료, Supabase에 업로드 중...')

    // Supabase 설정 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[IMAGE-GEN] Supabase 설정 없음, DALL-E URL 반환')
      return NextResponse.json({ success: true, imageUrl: dalleUrl, filename: safeFilename })
    }

    // 이미지 다운로드
    const imageArrayBuffer = await fetch(dalleUrl).then(r => r.arrayBuffer())

    // Supabase Storage blog/ 폴더에 글 제목(슬러그) 기반 파일명으로 저장
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const filePath = `blog/${safeFilename}.png`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, imageArrayBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: true  // 같은 슬러그 재생성 시 덮어쓰기
      })

    if (uploadError) {
      console.error('[IMAGE-GEN] Supabase 업로드 실패:', uploadError)
      return NextResponse.json({ success: true, imageUrl: dalleUrl, filename: safeFilename })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    console.log('[IMAGE-GEN] 완료:', publicUrl)
    return NextResponse.json({ success: true, imageUrl: publicUrl, filename: safeFilename })

  } catch (error) {
    console.error('[IMAGE-GEN] 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '이미지 생성 실패'
      },
      { status: 500 }
    )
  }
}
