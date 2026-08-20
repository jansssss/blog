---
name: project-ohyess-structure
description: ohyess.kr 사이트 구조, 기술 스택, 콘텐츠 섹션 현황 (2026-06 기준)
metadata:
  type: project
---

ohyess.kr은 한국 금융/대출 정보 특화 블로그. Next.js 15 App Router 기반.

## 기술 스택

- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui, recharts
- Backend/DB: Supabase (posts, categories, gsc_search_queries 테이블)
- 배포: Vercel
- 자동화: GitHub Actions (2일 1회, KST 05:00~08:00 랜덤 실행)
- AI 파이프라인: Tavily(리서치) → OpenAI(작성) → Supabase(발행)

## 콘텐츠 섹션

- /blog/ — AI 자동 발행 금융 뉴스/분석 (에버그린 + 뉴스 혼합)
- /guide/ — 대출 가이드 12개 (대출이자, DSR/DTI/LTV, 상환방식, 중도상환수수료, 신용점수, 체크리스트, 주담대, 전세대출, 금리전략, 대출종류, 보증보험, 대출거절)
- /calculator/ — 금융 계산기 9개 (대출이자, 한도, 중도상환수수료, 상환방식비교, 상환부담률, 금리변동영향, 긴급자금, 중도상환비교, repayment-compare)
- /compare/ — 은행금리비교, 고정vs변동, 대출상품비교, 정책대출비교
- /trend/ — 금융 트렌드 정적 페이지 (코스피, 양도세 등 핫이슈)
- /policy/ — 주거/청년/소상공인/중소기업 정책

## 자동화 파이프라인 특성

- EVERGREEN_QUERY_CLUSTERS: 6개 클러스터 회전 (전세대출, 신용점수, 청년정책, 양도세/연말정산, 주택청약, 근로장려금)
- GSC 피드백 루프: gsc_search_queries 테이블 → 노출 높고 CTR 낮은 쿼리 → 자동 글 생성
- 중복 방지: 최근 30개 주제 제외 로직

**Why:** 구조 이해가 콘텐츠 갭 분석과 광고 최적화 전략의 기반
**How to apply:** 새 콘텐츠 추천 시 기존 12개 가이드·9개 계산기와 겹치지 않는 갭을 우선 채울 것
