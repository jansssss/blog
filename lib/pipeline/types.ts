/**
 * 파이프라인 공통 타입 정의
 */

// Draft stage 상태
export type DraftStage =
  | 'NEW'           // 새로 생성됨 (Perplexity 대기)
  | 'QUEUED'        // 큐에 등록됨
  | 'PERPLEXITY_DONE' // Perplexity 완료, Editor 대기
  | 'EDITOR_DONE'   // Editor 완료, Columnist 대기
  | 'SAVED'         // 모든 단계 완료
  | 'FAILED'        // 실패

// 파이프라인 단계별 결과
export interface PipelineResult<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    stage: string
  }
}

// Perplexity 결과
export interface PerplexityResult {
  title: string
  summary: string
  content: string
  tags: string[]
}

// Editor 결과
export interface EditorResult {
  cleanDraft: string
  editorNotes: string[]
  calcChecks: Array<{
    item: string
    before: string
    after: string
    reason: string
  }>
}

// Columnist 결과
export interface ColumnistResult {
  title: string
  metaDescription: string
  tags: string[]
  markdown: string
  usedPhrases: string[]
  phraseSeed: string
  // 검증 결과
  validationPassed: boolean
  validationFailures: string[]
  validationWarnings: string[]
}

// Draft 레코드 (DB)
export interface DraftRecord {
  id: string
  news_item_id: string
  title: string
  slug: string
  summary: string
  content: string
  category: string
  tags: string[]
  status: string
  stage: DraftStage
  editor_content: string | null
  columnist_content: string | null
  error_stage: string | null
  error_code: string | null
  error_message: string | null
  // 락/재시도 컬럼
  locked_at: string | null
  locked_by: string | null
  attempts: number
  next_retry_at: string | null
  last_error: string | null
  created_at: string
  // 검증 결과 컬럼
  validation_passed: boolean | null
  validation_failures: string[]
  validation_warnings: string[]
}

// 뉴스 아이템 레코드 (DB)
export interface NewsItemRecord {
  id: string
  title: string
  link: string
  pub_date: string
  category: string
  excluded: boolean
  draft_generated: boolean
}
