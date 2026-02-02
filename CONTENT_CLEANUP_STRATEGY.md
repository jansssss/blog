# AI/개발 관련 콘텐츠 정리 전략

## 📋 목적
ohyess.kr를 **금융 전문 정보 사이트**로 명확히 포지셔닝하기 위해, AI/개발 관련 콘텐츠를 정리하고 금융 콘텐츠에 집중합니다.

## 🔍 1단계: 현재 콘텐츠 파악

### 확인해야 할 항목

1. **블로그 게시물 확인**
   ```sql
   -- 관리자 페이지(/admin/drafts)에서 확인하거나 아래 쿼리 실행:

   -- AI/개발 관련 키워드를 포함한 게시물 찾기
   SELECT id, title, category, status, created_at
   FROM drafts
   WHERE site_id = (SELECT id FROM sites WHERE domain = 'ohyess.kr')
   AND (
     title ILIKE '%AI%' OR
     title ILIKE '%개발%' OR
     title ILIKE '%프로그래밍%' OR
     title ILIKE '%코딩%' OR
     title ILIKE '%머신러닝%' OR
     title ILIKE '%딥러닝%' OR
     title ILIKE '%파이썬%' OR
     title ILIKE '%JavaScript%' OR
     title ILIKE '%React%' OR
     content ILIKE '%개발%'
   )
   ORDER BY created_at DESC;
   ```

2. **카테고리 분석**
   ```sql
   -- 현재 사용 중인 모든 카테고리 확인
   SELECT DISTINCT category, COUNT(*) as post_count
   FROM drafts
   WHERE site_id = (SELECT id FROM sites WHERE domain = 'ohyess.kr')
   AND status = 'published'
   GROUP BY category
   ORDER BY post_count DESC;
   ```

## 🎯 2단계: 콘텐츠 분류

### A. 보존 (금융 관련)
다음 카테고리의 콘텐츠는 **유지**:
- 금융/대출
- 대출 이자
- 금리 정보
- 은행 비교
- 정책자금
- 주택담보대출
- 신용대출
- DSR/LTV
- 재테크

### B. 삭제 또는 비공개 (비금융)
다음 주제의 콘텐츠는 **삭제 또는 비공개** 처리:
- AI/머신러닝
- 프로그래밍/개발
- 기술 튜토리얼
- 소프트웨어 리뷰
- 일반 IT 뉴스

### C. 검토 필요 (경계 케이스)
다음은 **개별 검토** 후 결정:
- 핀테크 (금융 기술) → 금융 측면 강조 시 유지 가능
- 디지털 금융 서비스 → 금융 서비스 정보에 집중 시 유지
- 블록체인/암호화폐 → 투자/금융 관점이면 유지, 기술 관점이면 삭제

## 🛠️ 3단계: 실행 방법

### 옵션 1: 완전 삭제 (권장)
비금융 콘텐츠를 데이터베이스에서 완전히 제거

```sql
-- 비공개 처리 (안전한 방법)
UPDATE drafts
SET status = 'archived'
WHERE id IN (
  -- 위 1단계에서 찾은 AI/개발 관련 게시물 ID 목록
  'xxx', 'yyy', 'zzz'
);

-- 영구 삭제 (복구 불가)
DELETE FROM drafts
WHERE id IN (
  -- 삭제할 게시물 ID 목록
  'xxx', 'yyy', 'zzz'
);
```

### 옵션 2: 비공개 처리
나중에 다른 사이트로 옮길 가능성이 있다면 비공개 상태로 보관

```sql
UPDATE drafts
SET status = 'draft'  -- 또는 'archived'
WHERE category NOT IN ('금융/대출')
AND site_id = (SELECT id FROM sites WHERE domain = 'ohyess.kr');
```

### 옵션 3: 별도 사이트로 이전
AI/개발 콘텐츠를 위한 별도 사이트를 만들고 콘텐츠 이전

```sql
-- 새 사이트 생성 후 (예: devnote.kr)
UPDATE drafts
SET site_id = (SELECT id FROM sites WHERE domain = 'devnote.kr')
WHERE category IN ('AI', '개발', '프로그래밍')
AND site_id = (SELECT id FROM sites WHERE domain = 'ohyess.kr');
```

## ✅ 4단계: 사이트 일관성 확인

### 삭제 후 체크리스트

- [ ] **홈페이지**: AI/개발 관련 키워드가 메인 페이지에 없는지 확인
- [ ] **네비게이션**: 모든 메뉴가 금융 관련 페이지로 연결되는지 확인
- [ ] **카테고리**: 금융/대출 단일 카테고리로 통일되었는지 확인
- [ ] **검색 결과**: 사이트 검색 시 비금융 콘텐츠가 나오지 않는지 테스트
- [ ] **메타 데이터**: 사이트 설명(description)에 금융 전문성 강조
- [ ] **푸터**: 면책 고지가 금융 정보에 맞게 작성되었는지 확인

## 📊 5단계: AdSense 최적화 확인

콘텐츠 정리 후 AdSense 승인을 위한 체크리스트:

### ✅ 이미 완료된 항목
- [x] 계산기 페이지 콘텐츠 강화 (1,500-2,500자)
- [x] About 페이지 운영자 신뢰 정보 추가
- [x] 편집정책 페이지 생성 및 링크 추가
- [x] 출처 링크 (금융감독원, 한국은행 등)

### ⚠️ 추가 권장 사항
- [ ] **일관된 주제**: 모든 페이지가 금융/대출 주제로 통일
- [ ] **콘텐츠 양**: 최소 15-20개의 고품질 금융 가이드/해설 글
- [ ] **정기 업데이트**: 금리 변동 시 관련 콘텐츠 업데이트
- [ ] **원본 콘텐츠**: 복사-붙여넣기가 아닌 독창적인 설명과 해석
- [ ] **사용자 가치**: 실제 도움이 되는 실용적인 정보 제공

## 🎯 최종 목표

**ohyess.kr = 대출·금리 전문 정보 플랫폼**
- 명확한 정체성: "금융 의사결정을 돕는 계산기 & 비교 도구"
- 전문성 강화: YMYL 기준에 맞는 신뢰할 수 있는 금융 정보
- 사용자 중심: 복잡한 금융 개념을 쉽게 설명하는 가이드

## 🚀 실행 순서

1. **즉시 실행** (오늘)
   - 관리자 페이지에서 AI/개발 관련 게시물 확인
   - 명백한 비금융 콘텐츠 비공개 처리

2. **1주일 내** (이번 주)
   - 경계 케이스 검토 및 결정
   - 최종 삭제 또는 이전 작업
   - 사이트 일관성 확인

3. **지속적** (계속)
   - 금융 콘텐츠 보강 (주 1-2개 글)
   - 계산기 도구 추가 개발
   - 비교 기능 확장

## 📞 작업 진행 시 연락

작업 중 문제나 질문이 있으면 언제든지 연락하세요:
- 이메일: goooods@naver.com

---
**작성일**: 2026-02-02
**최종 업데이트**: 2026-02-02
