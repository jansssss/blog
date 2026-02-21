/**
 * Gemini / OpenAI DALL-E 이미지 일괄 생성 스크립트
 * 실행: node scripts/generate-guide-images.mjs
 *
 * 우선순위:
 *   1) Gemini (gemini-2.0-flash-exp-image-generation)
 *   2) Gemini 429/실패 시 → OpenAI DALL-E 3 로 자동 폴백
 *
 * 생성된 이미지: public/images/guide/ 및 public/images/trend/
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// ── 환경변수 로드 ────────────────────────────────────────────────
function loadEnv() {
  try {
    const content = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8')
    const get = (key) => { const m = content.match(new RegExp(`${key}=(.+)`)); return m?.[1]?.trim() ?? null }
    return { gemini: get('GEMINI_API_KEY'), openai: get('OPENAI_API_KEY') }
  } catch {
    return { gemini: process.env.GEMINI_API_KEY, openai: process.env.OPENAI_API_KEY }
  }
}
const KEYS = loadEnv()

// ── 이미지 목록 ──────────────────────────────────────────────────
const IMAGES = [
  // 가이드 페이지
  {
    slug: 'guide/loan-interest',
    prompt: 'Professional flat design illustration: Korean bank loan documents, calculator showing monthly payment, and interest rate percentage symbols. Clean infographic style, blue and white color scheme, no text.',
  },
  {
    slug: 'guide/dsr-dti-ltv',
    prompt: 'Clean infographic showing three financial ratio meters DSR DTI LTV as circular gauges with Korean apartment in background. Modern flat design, blue purple palette, no text.',
  },
  {
    slug: 'guide/repayment-types',
    prompt: 'Side-by-side bar chart comparison of three loan repayment methods with different payment patterns. Professional financial illustration, green blue color scheme, no text.',
  },
  {
    slug: 'guide/early-repayment-fee',
    prompt: 'Illustration of scissors cutting a loan contract document with calendar and calculation sheet. Clean flat design showing early loan repayment concept, orange and blue tones, no text.',
  },
  {
    slug: 'guide/credit-score',
    prompt: 'Credit score meter gauge going from red zone to green zone showing improvement journey. Korean financial context, professional flat design, teal and gold palette, no text.',
  },
  {
    slug: 'guide/loan-checklist',
    prompt: 'Checklist clipboard with checkmarks next to financial documents, calculator, and bank icons. Professional flat design for loan preparation guide, rose and white palette, no text.',
  },
  {
    slug: 'guide/mortgage-loan',
    prompt: 'Korean apartment building with LTV ratio chart, bank icons, and loan documents. Clean modern flat design, blue and white color scheme, no text.',
  },
  {
    slug: 'guide/mortgage-loan-rates',
    prompt: 'Financial chart showing mortgage interest rate components: base rate and credit spread as stacked bars. Modern infographic style, blue tones, no text.',
  },
  {
    slug: 'guide/jeonse-loan',
    prompt: 'Korean jeonse rental deposit system diagram showing renter, apartment building, bank, and guarantee institution connected by arrows. Professional flat design, blue and green tones, no text.',
  },
  {
    slug: 'guide/rate-strategy',
    prompt: 'Upward trending interest rate line graph with a split showing fixed vs variable rate paths. Professional financial illustration, blue and orange color scheme, no text.',
  },
  {
    slug: 'guide/loan-types-complete',
    prompt: 'Colorful taxonomy diagram showing Korean loan types branching into credit loans, mortgage loans, jeonse loans, policy loans. Professional flat design, blue green palette, no text.',
  },
  {
    slug: 'guide/loan-guarantee',
    prompt: 'Three shield icons representing guarantee institutions connected to renter and bank with protection symbols. Clean flat design, blue green purple palette, no text.',
  },
  {
    slug: 'guide/loan-rejection',
    prompt: 'Person looking at a rejected loan letter then following a recovery path with upward steps. Hopeful professional illustration, blue and orange tones, no text.',
  },
  // 트렌드 페이지
  {
    slug: 'trend/capital-gains-tax',
    prompt: 'Korean apartment complex with tax documents and capital gains tax percentage symbols. Professional editorial illustration showing property taxation. Dark blue and gold color scheme, no text.',
  },
  {
    slug: 'trend/capital-gains-tax-strategy',
    prompt: 'Person reviewing property sale timeline documents with different tax scenarios illustrated. Professional editorial style, navy and gold palette, no text.',
  },
  {
    slug: 'trend/multi-home-loan',
    prompt: 'Korean apartment buildings surrounded by regulatory barriers and restriction signs. Professional financial journalism illustration, dark blue and red color scheme, no text.',
  },
  {
    slug: 'trend/multi-home-loan-strategy',
    prompt: 'Strategic roadmap with multiple paths showing multi-property owner navigating loan regulations with warning signs. Professional editorial illustration, dark sophisticated color scheme, no text.',
  },
]

// ── Gemini로 생성 ────────────────────────────────────────────────
async function generateWithGemini(prompt) {
  if (!KEYS.gemini) throw new Error('GEMINI_API_KEY not set')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${KEYS.gemini}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    }
  )

  if (res.status === 429) throw Object.assign(new Error('RATE_LIMIT'), { code: 429 })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 200)}`)
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  const img = parts.find((p) => p.inlineData)
  if (!img?.inlineData) throw new Error('No image data in Gemini response')

  return Buffer.from(img.inlineData.data, 'base64')
}

// ── OpenAI DALL-E 3로 생성 ────────────────────────────────────────
async function generateWithOpenAI(prompt) {
  if (!KEYS.openai) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEYS.openai}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      response_format: 'url',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI ${res.status}: ${err.substring(0, 300)}`)
  }

  const data = await res.json()
  const url = data?.data?.[0]?.url
  if (!url) throw new Error('No image URL in OpenAI response')

  // URL에서 이미지 다운로드
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = []
      response.on('data', (c) => chunks.push(c))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    })
  })
}

// ── 단일 이미지 처리 ─────────────────────────────────────────────
async function processImage(slug, prompt) {
  const outputDir = path.join(ROOT, 'public', 'images', path.dirname(slug))
  const outputFile = path.join(ROOT, 'public', 'images', `${slug}.png`)

  if (fs.existsSync(outputFile)) {
    console.log(`⏭  Skip (exists): ${slug}.png`)
    return 'skipped'
  }

  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`🎨 Generating: ${slug}.png`)

  // 1차: Gemini 시도
  try {
    const buf = await generateWithGemini(prompt)
    fs.writeFileSync(outputFile, buf)
    console.log(`   ✅ [Gemini] ${Math.round(buf.length / 1024)}KB`)
    return 'gemini'
  } catch (err) {
    if (err.code === 429) {
      console.log(`   ⚠️  Gemini rate limit → OpenAI DALL-E 3 fallback`)
    } else {
      console.log(`   ⚠️  Gemini failed (${err.message}) → OpenAI DALL-E 3 fallback`)
    }
  }

  // 2차: OpenAI DALL-E 3 폴백
  try {
    const buf = await generateWithOpenAI(prompt)
    fs.writeFileSync(outputFile, buf)
    console.log(`   ✅ [OpenAI DALL-E 3] ${Math.round(buf.length / 1024)}KB`)
    return 'openai'
  } catch (err) {
    console.error(`   ❌ OpenAI also failed: ${err.message}`)
    return 'failed'
  }
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Guide Image Generator (Gemini → OpenAI DALL-E 3 fallback)')
  console.log(`   Gemini key: ${KEYS.gemini ? KEYS.gemini.substring(0, 10) + '...' : '❌ not set'}`)
  console.log(`   OpenAI key: ${KEYS.openai ? KEYS.openai.substring(0, 15) + '...' : '❌ not set'}`)
  console.log(`   Total: ${IMAGES.length} images\n`)

  const stats = { gemini: 0, openai: 0, skipped: 0, failed: 0 }

  for (const { slug, prompt } of IMAGES) {
    const result = await processImage(slug, prompt)
    stats[result] = (stats[result] ?? 0) + 1

    if (result !== 'skipped') {
      // 레이트 리밋 방지 대기
      console.log('   ⏳ Waiting 5s...')
      await new Promise(r => setTimeout(r, 5000))
    }
  }

  console.log('\n── 결과 ──────────────────────────────────')
  console.log(`✅ Gemini:   ${stats.gemini}개`)
  console.log(`✅ OpenAI:   ${stats.openai}개`)
  console.log(`⏭  Skipped:  ${stats.skipped}개`)
  console.log(`❌ Failed:   ${stats.failed}개`)
  if (stats.failed > 0) {
    console.log('\n재실패한 항목은 다시 실행하면 자동으로 재시도합니다.')
  }
}

main()
