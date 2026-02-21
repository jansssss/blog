import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 604800 // 7일 캐시

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const prompt = searchParams.get('prompt')

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const parts = data?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData)

    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'No image in response' }, { status: 500 })
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': imagePart.inlineData.mimeType || 'image/png',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Gemini image generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
