#!/usr/bin/env tsx
/**
 * 금융감독원 금융상품 통합 비교공시 수집 → data/finlife-offers.json
 *
 * 실행:
 *   npx tsx --env-file=.env.local scripts/collect-finlife.ts
 *   npm run collect:finlife
 *
 * GitHub Actions 에서 월 1회 실행하고, 변경이 있을 때만 커밋한다.
 * (.github/workflows/collect-finlife.yml)
 *
 * 이 스크립트는 부분 실패를 용인하지 않는다: 기존 스냅샷보다 데이터가 크게 줄면
 * 기록을 덮어쓰지 않고 실패로 끝낸다. 반쪽짜리 비교표를 배포하는 것보다
 * 지난달 데이터를 유지하는 편이 사용자에게 낫기 때문이다.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { fetchAllGroupsForProduct } from '../lib/finlife/client'
import { EMPTY_SNAPSHOT, type OfferSnapshot } from '../lib/finlife/snapshot'
import type { LoanOffer, LoanProductType, SyncSummary } from '../lib/finlife/types'

const PRODUCT_TYPES: LoanProductType[] = ['mortgage', 'rent', 'credit']

/** 기존 대비 이 비율 미만으로 줄면 수집 실패로 간주 */
const SHRINK_GUARD_RATIO = 0.7

const OUTPUT_PATH = path.resolve(process.cwd(), 'data/finlife-offers.json')

async function readExistingSnapshot(): Promise<OfferSnapshot> {
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf8')
    return JSON.parse(raw) as OfferSnapshot
  } catch {
    return EMPTY_SNAPSHOT
  }
}

/** 오퍼 정렬 — 파일 diff 를 안정적으로 유지해 월별 변동을 읽기 쉽게 한다 */
function sortOffers(offers: LoanOffer[]): LoanOffer[] {
  return [...offers].sort((a, b) => a.id.localeCompare(b.id))
}

async function main() {
  const startedAt = Date.now()
  const allOffers: LoanOffer[] = []
  const allSummaries: SyncSummary[] = []
  const disclosureMonths: OfferSnapshot['disclosureMonths'] = {}
  const counts: OfferSnapshot['counts'] = {}

  console.log('금융감독원 금융상품 비교공시 수집을 시작합니다.\n')

  for (const productType of PRODUCT_TYPES) {
    const { offers, summaries } = await fetchAllGroupsForProduct(productType, { delayMs: 300 })
    allOffers.push(...offers)
    allSummaries.push(...summaries)
    counts[productType] = offers.length

    // 공시월은 상품종류 내에서 하나로 통일되어야 정상이다
    const months = [...new Set(offers.map((o) => o.disclosureMonth).filter(Boolean))].sort()
    if (months.length > 1) {
      console.warn(`  ! ${productType}: 공시월이 섞여 있습니다 → ${months.join(', ')}`)
    }
    disclosureMonths[productType] = months[months.length - 1]

    for (const s of summaries) {
      const status = s.errors.length ? `실패(${s.errors.join('; ')})` : '정상'
      console.log(
        `  ${productType.padEnd(9)} 권역 ${s.finGroupCode}: ${String(s.offerCount).padStart(4)}건  ${status}`
      )
    }
  }

  console.log(`\n총 ${allOffers.length}건 수집 (${((Date.now() - startedAt) / 1000).toFixed(1)}초)`)

  if (allOffers.length === 0) {
    console.error('\n오퍼를 한 건도 수집하지 못했습니다. 기존 스냅샷을 유지하고 종료합니다.')
    process.exit(1)
  }

  // 급격한 감소 방어 — API 부분 장애로 반쪽 데이터가 배포되는 것을 막는다
  const existing = await readExistingSnapshot()
  const previousCount = existing.offers.length
  if (previousCount > 0 && allOffers.length < previousCount * SHRINK_GUARD_RATIO) {
    console.error(
      `\n데이터가 비정상적으로 감소했습니다: ${previousCount}건 → ${allOffers.length}건 ` +
        `(기준 ${Math.round(SHRINK_GUARD_RATIO * 100)}%).\n` +
        '부분 장애로 판단해 기존 스냅샷을 유지하고 실패로 종료합니다.'
    )
    process.exit(1)
  }

  const snapshot: OfferSnapshot = {
    generatedAt: new Date().toISOString(),
    disclosureMonths,
    counts,
    summaries: allSummaries,
    offers: sortOffers(allOffers),
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')

  console.log(`\n저장 완료: ${path.relative(process.cwd(), OUTPUT_PATH)}`)
  for (const type of PRODUCT_TYPES) {
    console.log(`  ${type.padEnd(9)} ${counts[type]}건  공시월 ${disclosureMonths[type] ?? '-'}`)
  }
  if (previousCount > 0) {
    const delta = allOffers.length - previousCount
    console.log(`  이전 스냅샷 대비 ${delta >= 0 ? '+' : ''}${delta}건`)
  }
}

main().catch((error) => {
  console.error('\n수집 실패:', error instanceof Error ? error.message : error)
  process.exit(1)
})
