# Perplexity API 설정 가이드

## 1. Perplexity API Key 발급

1. [Perplexity AI](https://www.perplexity.ai/) 계정 생성
2. [API Settings](https://www.perplexity.ai/settings/api) 페이지로 이동
3. "Generate API Key" 버튼 클릭
4. API Key 복사 (예: `pplx-xxxxxxxxxxxxx`)

## 2. Vercel 환경변수 설정

### 방법 1: Vercel Dashboard (권장)
1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 선택
3. **Settings** > **Environment Variables** 이동
4. 새 환경변수 추가:
   - **Key**: `PERPLEXITY_API_KEY`
   - **Value**: `pplx-xxxxxxxxxxxxx` (발급받은 API Key)
   - **Environment**: Production, Preview, Development 모두 체크
5. **Save** 클릭

### 방법 2: 로컬 개발 환경
`.env.local` 파일에 추가:
```env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx
```

## 3. 배포 및 재배포

환경변수 추가 후 **반드시 재배포** 필요:
- Vercel은 환경변수 변경 시 자동 재배포되지 않음
- Git push 또는 Vercel Dashboard에서 수동 재배포

## 4. 작동 방식

### 기존 방식 (템플릿 기반)
```
뉴스 제목 → 고정 템플릿 → 일반적인 금융 정보 글
```
❌ 문제점:
- 뉴스 내용과 무관한 일반론
- DSR, 금리 등 관련 없는 내용 포함
- Google Discover 및 애드센스 저품질 판정 위험

### 개선 방식 (Perplexity AI)
```
뉴스 링크 → Perplexity 실시간 검색 → 원문 분석 → 맞춤형 글 작성
```
✅ 장점:
- 뉴스 원문의 실제 정책/수치 반영
- 해당 정책이 개인 대출에 미치는 구체적 영향 분석
- 사람이 작성한 것과 같은 고품질 콘텐츠
- YMYL(금융 정보) 기준 충족

## 5. Perplexity 모델

사용 모델: **`sonar-pro`**
- 실시간 웹 검색 + 고급 분석
- 최신 뉴스 및 정책 정보 접근
- 정확한 수치 및 조건 파악

## 6. 비용 예상

### Perplexity API 요금
- **sonar-pro**: $1.00 per 1M tokens
- 초안 1개당 약 4,000 tokens (입력+출력)
- **예상 비용**: 초안 10개 = $0.04 (약 50원)

### 일일 자동화
- 매일 9시: 최대 10개 초안 생성
- 월 비용: 약 $1.20 (1,500원)

## 7. 폴백(Fallback) 시스템

Perplexity API 실패 시:
- 자동으로 기존 템플릿 방식으로 전환
- 서비스 중단 없이 안정적 운영
- 로그에 `[AI-DRAFT] Perplexity API 오류, 폴백 사용` 기록

## 8. 테스트

환경변수 설정 후 테스트:
```bash
# 뉴스 자동화 API 수동 호출
curl -X GET https://your-domain.vercel.app/api/cron/news-automation \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

성공 시 로그:
```
[NEWS-AUTOMATION] Processing: [뉴스 제목]
[AI-DRAFT] Perplexity 응답 수신
[NEWS-AUTOMATION] Draft created: [draft-id]
```

## 9. 문제 해결

### API Key 오류
```
Error: 401 Unauthorized
```
→ `PERPLEXITY_API_KEY` 확인 및 재배포

### Rate Limit 초과
```
Error: 429 Too Many Requests
```
→ Perplexity 요금제 확인 또는 요청 간격 조정

### 타임아웃
```
Error: Request timeout
```
→ Vercel Function 타임아웃 설정 확인 (기본 10초)

## 10. 모니터링

Vercel Function Logs에서 확인:
- 프로젝트 > **Deployments** > 최신 배포 > **Functions** 탭
- `[NEWS-AUTOMATION]` 태그로 로그 필터링
