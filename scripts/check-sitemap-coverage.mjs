#!/usr/bin/env node
/**
 * app/ 디렉토리의 실제 정적 페이지와 lib/sitemap-routes.ts 등록 목록을 대조한다.
 *
 * 페이지를 새로 만들고 사이트맵 등록을 잊는 사고를 막는 것이 목적.
 * (실제로 trend 6개 · policy 1개가 이 방식으로 누락된 적이 있다.)
 *
 * 사용: npm run check:sitemap
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const APP_DIR = join(ROOT, 'app')

/** 사이트맵 대상이 아닌 최상위 디렉토리 */
const IGNORED_TOP_LEVEL = new Set(['api', 'admin'])

function collectStaticRoutes(dir, segments = []) {
  const routes = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (!statSync(full).isDirectory()) continue
    // 동적 세그먼트([id])와 라우트 그룹((group))은 정적 사이트맵 대상이 아니다
    if (entry.startsWith('[') || entry.startsWith('(') || entry.startsWith('_')) continue
    if (segments.length === 0 && IGNORED_TOP_LEVEL.has(entry)) continue

    const next = [...segments, entry]
    try {
      statSync(join(full, 'page.tsx'))
      routes.push('/' + next.join('/'))
    } catch {
      // page.tsx가 없는 중간 디렉토리 — 하위만 계속 탐색
    }
    routes.push(...collectStaticRoutes(full, next))
  }
  return routes
}

function registeredPaths() {
  const src = readFileSync(join(ROOT, 'lib', 'sitemap-routes.ts'), 'utf8')
  return new Set([...src.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]))
}

function excludedPaths() {
  const src = readFileSync(join(ROOT, 'lib', 'sitemap-routes.ts'), 'utf8')
  const block = src.match(/SITEMAP_EXCLUDED[^=]*=\s*\{([\s\S]*?)\n\}/)
  if (!block) return new Set()
  return new Set([...block[1].matchAll(/'([^']+)':/g)].map((m) => m[1]))
}

const actual = collectStaticRoutes(APP_DIR)
try {
  statSync(join(APP_DIR, 'page.tsx'))
  actual.push('/')
} catch {}

const registered = registeredPaths()
const excluded = excludedPaths()

const missing = actual.filter((r) => !registered.has(r) && !excluded.has(r))
const stale = [...registered].filter((r) => r !== '/' && !actual.includes(r))

if (missing.length === 0 && stale.length === 0) {
  console.log(`✓ 사이트맵 커버리지 정상 — 정적 페이지 ${actual.length}개 전부 등록됨`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`\n✗ 사이트맵에 누락된 페이지 ${missing.length}개:`)
  for (const r of missing.sort()) {
    console.error(`    ${r}   (app${r}/page.tsx)`)
  }
  console.error('\n  → lib/sitemap-routes.ts에 추가하거나, 색인 대상이 아니면')
  console.error('    SITEMAP_EXCLUDED에 사유와 함께 등록하세요.')
}

if (stale.length > 0) {
  console.error(`\n✗ 등록됐지만 실제 페이지가 없는 경로 ${stale.length}개:`)
  for (const r of stale.sort()) {
    console.error(`    ${r}`)
  }
  console.error('\n  → 삭제된 페이지라면 lib/sitemap-routes.ts에서 제거하세요.')
}

const rel = relative(ROOT, join(ROOT, 'lib', 'sitemap-routes.ts')).replace(/\\/g, '/')
console.error(`\n수정 대상: ${rel}\n`)
process.exit(1)
