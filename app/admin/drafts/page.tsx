'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Eye, Trash2, RefreshCw, RotateCcw, Sparkles } from 'lucide-react'

// API 호출 with 재시도 (1회 재시도)
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryDelay = 3000
): Promise<Response> {
  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API 타임아웃 또는 서버 오류')
    }
    return response
  } catch (error) {
    console.log(`[RETRY] 첫 번째 시도 실패, ${retryDelay}ms 후 재시도...`)
    await new Promise(resolve => setTimeout(resolve, retryDelay))

    const retryResponse = await fetch(url, options)
    const retryContentType = retryResponse.headers.get('content-type')
    if (!retryContentType || !retryContentType.includes('application/json')) {
      throw new Error('API 타임아웃 또는 서버 오류 (재시도 실패)')
    }
    return retryResponse
  }
}

interface Draft {
  id: string
  title: string
  slug: string
  summary: string
  category: string
  status: string
  stage: string
  error_stage: string | null
  error_code: string | null
  error_message: string | null
  editor_content: string | null
  columnist_content: string | null
  validation_passed: boolean | null
  validation_failures: string[] | null
  validation_warnings: string[] | null
  created_at: string
}

// 에러 코드를 사용자 친화적 메시지로 변환
const getErrorDisplayMessage = (errorCode: string | null): string => {
  if (!errorCode) return '알 수 없는 오류'
  const errorMessages: Record<string, string> = {
    'OPENAI_QUOTA_EXCEEDED': 'AI 사용 한도 초과',
    'OPENAI_RATE_LIMIT': 'AI 요청 제한 초과',
    'OPENAI_API_ERROR': 'AI API 오류',
    'OPENAI_PARSE_ERROR': 'AI 응답 파싱 오류',
    'SAVE_ERROR': 'DB 저장 오류',
    'UNKNOWN_ERROR': '알 수 없는 오류'
  }
  return errorMessages[errorCode] || errorCode
}

// 에러 메시지 요약 (60자)
const truncateErrorMessage = (message: string | null, maxLength: number = 60): string => {
  if (!message) return ''
  if (message.length <= maxLength) return message
  return message.slice(0, maxLength) + '...'
}

// Stage 기반 배지 생성
const getStageBadge = (draft: Draft): { label: string; className: string; tooltip?: string } => {
  const { stage, error_stage, error_code, error_message, editor_content, columnist_content, validation_passed, validation_failures, validation_warnings } = draft

  // 완료 상태 - 품질 검증 결과 포함
  if (stage === 'SAVED' || stage === 'COLUMNIST_DONE') {
    // 품질 검증 실패
    if (validation_passed === false) {
      const failCount = validation_failures?.length || 0
      const warnCount = validation_warnings?.length || 0
      return {
        label: `⚠️ 완성 (검증실패 ${failCount})`,
        className: 'bg-orange-100 text-orange-800',
        tooltip: `실패: ${failCount}개, 경고: ${warnCount}개 - 편집 시 확인 필요`
      }
    }
    // 품질 검증 경고만 있음
    if (validation_warnings && validation_warnings.length > 0) {
      return {
        label: `✓ 완성 (경고 ${validation_warnings.length})`,
        className: 'bg-yellow-100 text-yellow-800',
        tooltip: `경고 ${validation_warnings.length}개 - 편집 시 참고`
      }
    }
    // 품질 검증 완전 통과
    return { label: '✓ 초안 완성', className: 'bg-green-100 text-green-800' }
  }
  if (stage === 'EDITOR_DONE') {
    return { label: '2차 완료', className: 'bg-blue-100 text-blue-800' }
  }
  if (stage === 'PERPLEXITY_DONE') {
    return { label: '1차 완료', className: 'bg-yellow-100 text-yellow-800' }
  }

  // 실패 상태 - 어디까지 성공했는지 표시
  if (stage === 'FAILED') {
    const errorDisplay = getErrorDisplayMessage(error_code)
    const truncatedMessage = truncateErrorMessage(error_message)

    // 칼럼니스트 콘텐츠가 있으면 3차까지 완료 후 저장 실패
    if (columnist_content) {
      return {
        label: `3차 완료 · 저장 실패`,
        className: 'bg-orange-100 text-orange-800',
        tooltip: `${errorDisplay}: ${truncatedMessage}`
      }
    }

    // 편집자 콘텐츠가 있으면 2차까지 완료 후 3차 실패
    if (editor_content) {
      return {
        label: `2차 완료 · 3차 실패`,
        className: 'bg-orange-100 text-orange-800',
        tooltip: `${errorDisplay}: ${truncatedMessage}`
      }
    }

    // 에러 단계에 따른 표시
    if (error_stage === 'EDITOR') {
      return {
        label: `1차 완료 · 2차 실패`,
        className: 'bg-red-100 text-red-800',
        tooltip: `${errorDisplay}: ${truncatedMessage}`
      }
    }

    if (error_stage === 'COLUMNIST') {
      return {
        label: `2차 완료 · 3차 실패`,
        className: 'bg-orange-100 text-orange-800',
        tooltip: `${errorDisplay}: ${truncatedMessage}`
      }
    }

    if (error_stage === 'SAVE') {
      return {
        label: `3차 완료 · 저장 실패`,
        className: 'bg-orange-100 text-orange-800',
        tooltip: `${errorDisplay}: ${truncatedMessage}`
      }
    }

    // 일반 실패
    return {
      label: '✗ 실패',
      className: 'bg-red-100 text-red-800',
      tooltip: `${errorDisplay}: ${truncatedMessage}`
    }
  }

  // 기본값
  return { label: '초안', className: 'bg-gray-100 text-gray-600' }
}

// 이어하기 가능 여부 확인
const canResume = (draft: Draft): boolean => {
  // FAILED 상태이거나 중간 단계인 경우 이어하기 가능
  if (draft.stage === 'FAILED') return true
  if (draft.stage === 'PERPLEXITY_DONE') return true
  if (draft.stage === 'EDITOR_DONE') return true
  return false
}

export default function AdminDraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [resumingId, setResumingId] = useState<string | null>(null)
  const [resumingStep, setResumingStep] = useState<'idle' | 'editor' | 'columnist' | 'saving' | 'done'>('idle')
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    // 로그인 체크
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    loadDrafts()
  }, [router])

  const loadDrafts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('초안 로드 오류:', error)
        alert('초안을 불러오는데 실패했습니다.')
        return
      }

      setDrafts(data || [])
    } catch (err) {
      console.error('예상치 못한 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === drafts.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(drafts.map(draft => draft.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 초안을 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedItems.length}개 초안을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구할 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .in('id', selectedItems)

      if (error) {
        console.error('일괄 삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      setDrafts(prev => prev.filter(draft => !selectedItems.includes(draft.id)))
      setSelectedItems([])
      alert(`${selectedItems.length}개 초안이 삭제되었습니다.`)
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 편집 및 글작성 핸들러 - Editor + Columnist 실행
  const handleResume = async (draft: Draft) => {
    if (!confirm(`"${draft.title}" 초안을 편집하고 글작성을 진행하시겠습니까?\n\n📝 편집자가 팩트체크/교정 후\n✍️ 칼럼니스트가 최종 글을 작성합니다.\n\n⚠️ API 비용이 발생합니다.`)) {
      return
    }

    setResumingId(draft.id)
    setResumingStep('idle')

    try {
      const { editor_content, columnist_content, id: draftId } = draft

      // 칼럼니스트 콘텐츠가 있으면 저장만 재시도
      if (columnist_content) {
        setResumingStep('saving')
        console.log('[RESUME] 저장 재시도...')

        const { error: saveError } = await supabase
          .from('drafts')
          .update({
            content: columnist_content,
            stage: 'SAVED',
            error_stage: null,
            error_code: null,
            error_message: null
          })
          .eq('id', draftId)

        if (saveError) {
          throw new Error(`저장 실패: ${saveError.message}`)
        }

        setResumingStep('done')
        setTimeout(() => {
          alert('저장이 완료되었습니다.')
          loadDrafts()
          setResumingId(null)
          setResumingStep('idle')
        }, 500)
        return
      }

      // 편집자 콘텐츠 확인
      let cleanDraft = editor_content

      // cleanDraft가 없으면 DB에서 다시 조회
      if (!cleanDraft) {
        const { data: latestDraft } = await supabase
          .from('drafts')
          .select('editor_content, stage')
          .eq('id', draftId)
          .single()

        if (latestDraft?.editor_content) {
          cleanDraft = latestDraft.editor_content
          console.log('[RESUME] DB에서 editor_content 로드 완료')
        }
      }

      // editor_content가 없고 stage가 편집자 이전이면 편집자부터 시작
      const needsEditor = !cleanDraft

      if (needsEditor) {
        // 편집자부터 시작
        setResumingStep('editor')
        console.log('[RESUME] 편집자 단계 시작...')

        // 초안 content 가져오기
        const { data: fullDraft } = await supabase
          .from('drafts')
          .select('content, editor_content')
          .eq('id', draftId)
          .single()

        // DB에서 editor_content가 있으면 사용
        if (fullDraft?.editor_content) {
          console.log('[RESUME] DB에서 editor_content 발견, 칼럼니스트로 건너뜀')
          cleanDraft = fullDraft.editor_content
        } else if (!fullDraft?.content) {
          throw new Error('초안 내용을 찾을 수 없습니다.')
        } else {
          // 재시도 로직 포함 API 호출
          const editorResponse = await fetchWithRetry(
            '/api/rewrite/editor',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ draft: fullDraft.content })
            },
            4000 // 4초 후 재시도
          )

          const editorData = await editorResponse.json()

          if (!editorResponse.ok || !editorData.success) {
            await supabase
              .from('drafts')
              .update({
                stage: 'FAILED',
                error_stage: 'EDITOR',
                error_code: editorData.error_code || 'UNKNOWN_ERROR',
                error_message: editorData.error_message || editorData.error
              })
              .eq('id', draftId)
            throw new Error(editorData.error || '편집자 처리 실패')
          }

          cleanDraft = editorData.cleanDraft

          // 편집자 결과 저장
          await supabase
            .from('drafts')
            .update({
              stage: 'EDITOR_DONE',
              editor_content: cleanDraft
            })
            .eq('id', draftId)

          console.log('[RESUME] 편집자 완료!')
        }
      }

      // Rate Limit 방지 딜레이 (4000~6000ms - 안정성 우선)
      const delay = Math.floor(Math.random() * 2000) + 4000
      console.log(`[RESUME] Rate Limit 방지 딜레이: ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))

      // 칼럼니스트 단계
      setResumingStep('columnist')
      console.log('[RESUME] 칼럼니스트 단계 시작...')

      // 재시도 로직 포함 API 호출
      const columnistResponse = await fetchWithRetry(
        '/api/rewrite/columnist',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cleanDraft })
        },
        5000 // 5초 후 재시도
      )

      const columnistData = await columnistResponse.json()

      if (!columnistResponse.ok || !columnistData.success) {
        await supabase
          .from('drafts')
          .update({
            stage: 'FAILED',
            error_stage: 'COLUMNIST',
            error_code: columnistData.error_code || 'UNKNOWN_ERROR',
            error_message: columnistData.error_message || columnistData.error,
            editor_content: cleanDraft
          })
          .eq('id', draftId)
        throw new Error(columnistData.error || '칼럼니스트 처리 실패')
      }

      console.log('[RESUME] 칼럼니스트 완료!')

      const finalMarkdown = columnistData.markdown

      // 최종 저장
      setResumingStep('saving')
      console.log('[RESUME] 최종 저장...')

      const { error: updateError } = await supabase
        .from('drafts')
        .update({
          title: columnistData.title,
          summary: columnistData.metaDescription,
          content: finalMarkdown,
          tags: columnistData.tags,
          thumbnail_url: null,
          stage: 'SAVED',
          editor_content: cleanDraft,
          columnist_content: finalMarkdown,
          error_stage: null,
          error_code: null,
          error_message: null,
          // 품질 검증 결과 저장
          validation_passed: columnistData.validationPassed ?? null,
          validation_failures: columnistData.validationFailures || [],
          validation_warnings: columnistData.validationWarnings || []
        })
        .eq('id', draftId)

      if (updateError) {
        await supabase
          .from('drafts')
          .update({
            stage: 'FAILED',
            error_stage: 'SAVE',
            error_code: 'SAVE_ERROR',
            error_message: updateError.message,
            editor_content: cleanDraft,
            columnist_content: columnistData.markdown
          })
          .eq('id', draftId)
        throw new Error(`저장 실패: ${updateError.message}`)
      }

      setResumingStep('done')
      console.log('[RESUME] 완료!')

      setTimeout(() => {
        // 품질 검증 결과에 따른 메시지
        let message = '✅ 편집 및 글작성이 완료되었습니다!'

        if (columnistData.validationPassed === false) {
          const failCount = columnistData.validationFailures?.length || 0
          const warnCount = columnistData.validationWarnings?.length || 0
          message += `\n\n⚠️ 품질 검증 이슈 발견:\n- 실패: ${failCount}개\n- 경고: ${warnCount}개\n\n초안 편집에서 상세 내용을 확인하세요.`
        } else if (columnistData.validationWarnings?.length > 0) {
          message += `\n\n💡 품질 경고 ${columnistData.validationWarnings.length}개 - 편집 시 참고하세요.`
        }

        alert(message)
        loadDrafts()
        setResumingId(null)
        setResumingStep('idle')
      }, 500)

    } catch (err) {
      console.error('편집 및 글작성 오류:', err)
      alert(`편집 및 글작성 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
      loadDrafts()
      setResumingId(null)
      setResumingStep('idle')
    }
  }

  // 편집 및 글작성 진행 메시지
  const getResumingMessage = () => {
    switch (resumingStep) {
      case 'editor':
        return '📝 편집자가 팩트체크 및 교정 중...'
      case 'columnist':
        return '✍️ 칼럼니스트가 최종 글 작성 중...'
      case 'saving':
        return '💾 최종 저장 중...'
      case 'done':
        return '✅ 글작성 완료!'
      default:
        return '준비 중...'
    }
  }

  // 통계 계산 (stage 기준)
  const getStats = () => {
    const saved = drafts.filter(d => d.stage === 'SAVED' || d.stage === 'COLUMNIST_DONE').length
    const failed = drafts.filter(d => d.stage === 'FAILED').length
    const partial = drafts.filter(d => d.stage === 'PERPLEXITY_DONE' || d.stage === 'EDITOR_DONE').length
    return { saved, failed, partial, total: drafts.length }
  }

  const stats = getStats()

  return (
    <div className="container py-6 px-4 md:py-10 md:px-6">
      {/* 모바일 최적화 헤더 */}
      <div className="mb-6 space-y-4">
        {/* 상단: 뒤로가기 + 제목 */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/admin/editor">
            <Button variant="ghost" size="sm" className="px-2 md:px-3">
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">관리자 홈</span>
            </Button>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold">초안 관리</h1>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {selectedItems.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm" className="shrink-0">
              <Trash2 className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">선택 삭제</span>
              <span className="ml-1">({selectedItems.length})</span>
            </Button>
          )}
          <Button onClick={loadDrafts} variant="outline" size="sm" className="shrink-0">
            <RefreshCw className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">새로고침</span>
          </Button>
        </div>
      </div>

      {/* 편집 및 글작성 진행 상태 모달 */}
      {resumingId && (
        <Card className="mb-6 border-2 border-orange-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
               style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />

          <CardContent className="py-4 md:py-8 relative z-10">
            <div className="flex flex-col items-center gap-4 md:gap-6">
              {/* 로딩 애니메이션 - 모바일에서 작게 */}
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-orange-200 border-t-orange-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-orange-600 animate-pulse" />
                </div>
              </div>

              {/* 메시지 */}
              <div className="text-center px-2">
                <p className="text-base md:text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                  {getResumingMessage()}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                  편집 및 글작성 진행 중...
                </p>
              </div>

              {/* 진행 단계 표시 */}
              <div className="flex items-center gap-3 mt-2">
                {/* Step 1: Editor */}
                <div className={`relative flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  resumingStep === 'editor'
                    ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-300'
                    : resumingStep === 'columnist' || resumingStep === 'saving' || resumingStep === 'done'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {resumingStep === 'editor' && (
                    <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-50" />
                  )}
                  <span className="relative">1. 편집자</span>
                </div>

                <div className={`transition-all duration-300 ${
                  resumingStep === 'columnist' || resumingStep === 'saving' || resumingStep === 'done'
                    ? 'text-green-500' : 'text-gray-300'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Step 2: Columnist */}
                <div className={`relative flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  resumingStep === 'columnist'
                    ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-300'
                    : resumingStep === 'saving' || resumingStep === 'done'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {resumingStep === 'columnist' && (
                    <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-50" />
                  )}
                  <span className="relative">2. 칼럼니스트</span>
                </div>

                <div className={`transition-all duration-300 ${
                  resumingStep === 'saving' || resumingStep === 'done'
                    ? 'text-green-500' : 'text-gray-300'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Step 3: Save */}
                <div className={`relative flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  resumingStep === 'saving'
                    ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-300'
                    : resumingStep === 'done'
                      ? 'bg-green-500 text-white scale-110'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {resumingStep === 'saving' && (
                    <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-50" />
                  )}
                  {resumingStep === 'done' && (
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50" />
                  )}
                  <span className="relative">3. 저장</span>
                </div>
              </div>

              {/* 프로그레스 바 */}
              <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500 ease-out"
                  style={{
                    width: resumingStep === 'editor' ? '33%'
                         : resumingStep === 'columnist' ? '66%'
                         : resumingStep === 'saving' ? '90%'
                         : resumingStep === 'done' ? '100%' : '10%'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 전체 선택 */}
      {drafts.length > 0 && (
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleSelectAll}
            variant="ghost"
            size="sm"
          >
            {selectedItems.length === drafts.length ? '전체 해제' : '전체 선택'}
          </Button>
        </div>
      )}

      {/* 통계 - 모바일에서 2x2 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">총 초안</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-green-600">완료</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.saved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-yellow-600">진행중</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.partial}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-red-600">실패</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* 초안 목록 */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : drafts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">생성된 초안이 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">
              뉴스 관리에서 AI 초안을 생성해주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="p-4 md:pt-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* 체크박스 */}
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(draft.id)}
                      onChange={(e) => handleSelectItem(draft.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 태그 */}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {draft.category}
                      </span>
                      {/* Stage 기반 배지 */}
                      {(() => {
                        const badge = getStageBadge(draft)
                        return (
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${badge.className}`}
                            title={badge.tooltip}
                          >
                            {badge.label}
                          </span>
                        )
                      })()}
                    </div>
                    {/* 제목 */}
                    <h3 className="font-semibold text-sm md:text-base mb-1.5 md:mb-2 line-clamp-2">{draft.title}</h3>
                    {/* 요약 */}
                    <p className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 line-clamp-2">
                      {draft.summary}
                    </p>
                    {/* 에러 메시지 표시 (실패한 경우) */}
                    {draft.stage === 'FAILED' && draft.error_message && (
                      <p className="text-xs text-red-600 mb-1.5 line-clamp-1" title={draft.error_message}>
                        {truncateErrorMessage(draft.error_message, 60)}
                      </p>
                    )}
                    {/* 날짜 */}
                    <div className="text-xs text-muted-foreground">
                      <span>{formatDate(draft.created_at)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 - 모바일에서 세로 배치 */}
                  <div className="flex flex-col gap-1.5 md:gap-2 shrink-0">
                    {/* 편집 및 글작성 버튼 (1차 완료 또는 실패 상태인 경우) */}
                    {canResume(draft) && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleResume(draft)}
                        disabled={resumingId === draft.id}
                        className="bg-orange-500 hover:bg-orange-600 text-xs md:text-sm px-2 md:px-3"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 ${resumingId === draft.id ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">{resumingId === draft.id ? '진행중...' : '편집 및 글작성'}</span>
                      </Button>
                    )}
                    <Link href={`/admin/drafts/${draft.id}`}>
                      <Button size="sm" variant="outline" className="text-xs md:text-sm px-2 md:px-3 w-full">
                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                        <span className="hidden md:inline">편집</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 도움말 */}
      <Card className="mt-6 bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">사용 방법</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• AI가 생성한 초안을 검토하고 편집할 수 있습니다.</li>
            <li>• "편집" 버튼을 클릭하여 초안을 수정하세요.</li>
            <li>• "에디터로 편집" 버튼을 누르면 에디터 페이지에서 최종 편집 후 발행할 수 있습니다.</li>
            <li>• 불필요한 초안은 선택 후 일괄 삭제할 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
