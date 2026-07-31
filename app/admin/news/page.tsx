'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Trash2, RefreshCw, Sparkles, Download } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  link: string
  pub_date: string
  category: string
  excluded: boolean
  draft_generated: boolean
  created_at: string
}

// 진행 상태 타입 (Perplexity만 사용)
type ProcessingStep = 'idle' | 'perplexity' | 'done' | 'error'

export default function AdminNewsPage() {
  const router = useRouter()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'generated' | 'excluded'>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle')
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    // 로그인 체크
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    loadNewsItems()
  }, [router, filter])

  const loadNewsItems = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('news_items')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(50)

      if (filter === 'pending') {
        query = query.eq('draft_generated', false).eq('excluded', false)
      } else if (filter === 'generated') {
        query = query.eq('draft_generated', true)
      } else if (filter === 'excluded') {
        query = query.eq('excluded', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('뉴스 아이템 로드 오류:', error)
        alert('뉴스를 불러오는데 실패했습니다.')
        return
      }

      setNewsItems(data || [])
    } catch (err) {
      console.error('예상치 못한 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExclude = async (id: string, currentExcluded: boolean) => {
    try {
      const { error } = await supabase
        .from('news_items')
        .update({ excluded: !currentExcluded })
        .eq('id', id)

      if (error) {
        console.error('제외 처리 오류:', error)
        alert('처리 중 오류가 발생했습니다.')
        return
      }

      // UI 업데이트
      setNewsItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, excluded: !currentExcluded } : item
        )
      )
    } catch (err) {
      console.error('예상치 못한 오류:', err)
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  // 현재 필터의 모든 아이템 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedItems.length === newsItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(newsItems.map(item => item.id))
    }
  }

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 뉴스를 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedItems.length}개 뉴스를 완전히 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구할 수 없습니다.`)) {
      return
    }

    try {
      // API를 통한 일괄 삭제 (supabaseAdmin 사용)
      const response = await fetch('/api/admin/news/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsItemIds: selectedItems })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('일괄 삭제 오류:', data)
        alert(`삭제 중 오류가 발생했습니다: ${data.error || '알 수 없는 오류'}`)
        return
      }

      // UI에서 제거
      setNewsItems(prev => prev.filter(item => !selectedItems.includes(item.id)))
      const deletedCount = selectedItems.length
      setSelectedItems([])
      alert(`${deletedCount}개 뉴스가 삭제되었습니다.`)

    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // AI 초안 생성 (Perplexity만 실행 - 1차 완료 상태로 저장)
  const handleGenerateDrafts = async () => {
    if (selectedItems.length === 0) {
      alert('초안을 생성할 뉴스를 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedItems.length}개 뉴스로 AI 초안을 생성하시겠습니까?\n\n✅ Perplexity AI로 1차 초안이 생성됩니다.\n✅ 생성 후 '초안 관리'에서 '편집 및 글작성' 버튼으로 완성하세요.\n\n⚠️ API 비용이 발생합니다.`)) {
      return
    }

    setGenerating(true)
    setCurrentItemIndex(0)
    setProcessingStep('perplexity')

    const results = { success: 0, failed: 0, failedItems: [] as string[] }

    try {
      console.log('[PERPLEXITY] 초안 생성 시작...')

      for (let i = 0; i < selectedItems.length; i++) {
        setCurrentItemIndex(i + 1)

        // 아이템 간 딜레이 (Rate Limit 방지)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

        try {
          const response = await fetch('/api/admin/news/generate-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newsItemIds: [selectedItems[i]] })
          })

          const responseData = await response.json()

          if (!response.ok || !responseData.success) {
            console.error('[PERPLEXITY] 생성 실패:', responseData)
            results.failed++
            results.failedItems.push(`${selectedItems[i].slice(0, 8)}...: ${responseData.error || '생성 실패'}`)
            continue
          }

          results.success++
          console.log(`[PERPLEXITY] 성공: ${i + 1}/${selectedItems.length}`)

        } catch (err) {
          console.error('[PERPLEXITY] 오류:', err)
          results.failed++
          results.failedItems.push(`${selectedItems[i].slice(0, 8)}...: ${err instanceof Error ? err.message : '오류'}`)
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      console.error('[PERPLEXITY] 전체 오류:', errorMessage)
      results.failedItems.push(errorMessage)
    }

    setProcessingStep('done')

    setTimeout(() => {
      setGenerating(false)
      setProcessingStep('idle')
      setSelectedItems([])
      loadNewsItems()

      let message = `✅ ${results.success}개 1차 초안 생성 완료!\n\n📝 '초안 관리'에서 '편집 및 글작성' 버튼을 눌러 완성하세요.`
      if (results.failed > 0) {
        message += `\n\n❌ ${results.failed}개 실패`
        if (results.failedItems.length > 0) {
          message += `\n${results.failedItems.join('\n')}`
        }
      }
      alert(message)
    }, 1000)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"\n\n이 뉴스를 완전히 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구할 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      // UI에서 제거
      setNewsItems(prev => prev.filter(item => item.id !== id))
      alert('삭제되었습니다.')

    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 뉴스 수집 실행
  const handleFetchNews = async () => {
    if (!confirm('RSS 뉴스를 수집하시겠습니까?\n\n네이버 인기뉴스 + 구글 트렌드 기반 뉴스가 수집됩니다.')) {
      return
    }

    setFetching(true)
    try {
      const response = await fetch('/api/admin/news/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '뉴스 수집 실패')
      }

      alert(`뉴스 수집 완료!\n\n새로 수집: ${data.stats?.new || 0}개\n중복: ${data.stats?.duplicate || 0}개\n트렌딩: ${data.stats?.trending || 0}개`)
      loadNewsItems()
    } catch (err) {
      console.error('뉴스 수집 오류:', err)
      alert(`뉴스 수집 중 오류가 발생했습니다.\n${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setFetching(false)
    }
  }

  // 진행 상태 메시지 (Perplexity만)
  const getProcessingMessage = () => {
    switch (processingStep) {
      case 'perplexity':
        return '🔍 Perplexity AI로 뉴스를 분석하여 1차 초안 작성 중...'
      case 'done':
        return '✅ 1차 초안 생성 완료!'
      case 'error':
        return '❌ 오류 발생'
      default:
        return ''
    }
  }

  const filteredCount = newsItems.length

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
          <h1 className="text-xl md:text-3xl font-bold">뉴스 관리</h1>
        </div>

        {/* 액션 버튼들 - 모바일에서 가로 스크롤 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {selectedItems.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              size="sm"
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">선택 삭제</span>
              <span className="ml-1">({selectedItems.length})</span>
            </Button>
          )}
          {selectedItems.length > 0 && (
            <Button
              onClick={handleGenerateDrafts}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shrink-0"
            >
              <Sparkles className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">{generating ? 'AI 생성 중...' : 'AI 초안 생성'}</span>
              <span className="sm:hidden">{generating ? '생성중' : 'AI생성'}</span>
              <span className="ml-1">({selectedItems.length})</span>
            </Button>
          )}
          <Button
            onClick={handleFetchNews}
            disabled={fetching}
            variant="outline"
            size="sm"
            className="shrink-0 bg-green-50 border-green-300 hover:bg-green-100"
          >
            <Download className={`h-4 w-4 md:mr-2 ${fetching ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{fetching ? '수집 중...' : '뉴스 수집'}</span>
            <span className="sm:hidden">{fetching ? '수집중' : '수집'}</span>
          </Button>
          <Button onClick={loadNewsItems} variant="outline" size="sm" className="shrink-0">
            <RefreshCw className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">새로고침</span>
          </Button>
        </div>
      </div>

      {/* AI 처리 진행 상태 표시 */}
      {generating && (
        <Card className="mb-6 border-2 border-purple-500 overflow-hidden relative">
          {/* 배경 그라데이션 애니메이션 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite]"
               style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />

          <CardContent className="py-4 md:py-8 relative z-10">
            <div className="flex flex-col items-center gap-4 md:gap-6">
              {/* 로딩 애니메이션 - 모바일에서 작게 */}
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-purple-200 border-t-purple-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-purple-600 animate-pulse" />
                </div>
              </div>

              {/* 메시지 */}
              <div className="text-center px-2">
                <p className="text-base md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                  {getProcessingMessage()}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                  처리 중: {currentItemIndex} / {selectedItems.length}
                </p>
              </div>

              {/* 진행 단계 표시 - 단순화 (Perplexity만) */}
              <div className="flex items-center gap-3 mt-2">
                {/* Step 1: Perplexity 분석 */}
                <div className={`relative flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  processingStep === 'perplexity'
                    ? 'bg-purple-600 text-white scale-110 shadow-lg shadow-purple-300'
                    : processingStep === 'done'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {processingStep === 'perplexity' && (
                    <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-50" />
                  )}
                  <span className="relative">🔍 Perplexity 분석</span>
                </div>

                {/* Arrow */}
                <div className={`transition-all duration-300 ${
                  processingStep === 'done' ? 'text-green-500' : 'text-gray-300'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Step 2: 완료 */}
                <div className={`relative flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  processingStep === 'done'
                    ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-300'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {processingStep === 'done' && (
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50" />
                  )}
                  <span className="relative">✅ 1차 완료</span>
                </div>
              </div>

              {/* 프로그레스 바 */}
              <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                  style={{
                    width: processingStep === 'perplexity' ? '50%'
                         : processingStep === 'done' ? '100%' : '0%'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필터 및 전체 선택 */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => { setFilter('all'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            전체
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => { setFilter('pending'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            대기중
          </Button>
          <Button
            variant={filter === 'generated' ? 'default' : 'outline'}
            onClick={() => { setFilter('generated'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            생성됨
          </Button>
          <Button
            variant={filter === 'excluded' ? 'default' : 'outline'}
            onClick={() => { setFilter('excluded'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            제외됨
          </Button>
        </div>

        {/* 전체 선택 버튼 - 현재 필터에 맞게 표시 */}
        {newsItems.length > 0 && (
          <Button
            onClick={handleSelectAll}
            variant="ghost"
            size="sm"
            className="self-end md:self-auto"
          >
            {selectedItems.length === newsItems.length
              ? '전체 해제'
              : '전체 선택'}
          </Button>
        )}
      </div>

      {/* 통계 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>수집 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            총 {filteredCount}개의 뉴스가 수집되었습니다.
          </p>
        </CardContent>
      </Card>

      {/* 뉴스 목록 */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : newsItems.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">수집된 뉴스가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">
              RSS 소스를 추가하고 cron이 실행될 때까지 기다려주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {newsItems.map((item) => (
            <Card key={item.id} className={item.excluded ? 'opacity-50' : ''}>
              <CardContent className="p-4 md:pt-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* 체크박스 */}
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className={`h-4 w-4 rounded border-gray-300 cursor-pointer ${
                        item.excluded
                          ? 'text-red-500 focus:ring-red-500'
                          : 'text-primary focus:ring-primary'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 태그 */}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {item.category}
                      </span>
                      {item.draft_generated && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          생성됨
                        </span>
                      )}
                      {item.excluded && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                          제외됨
                        </span>
                      )}
                    </div>
                    {/* 제목 */}
                    <h3 className="font-semibold text-sm md:text-base mb-1.5 md:mb-2 line-clamp-2">{item.title}</h3>
                    {/* 날짜 및 링크 */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                      <span>{formatDate(item.pub_date)}</span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        원문
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* 액션 버튼 - 모바일에서 세로 배치 */}
                  <div className="flex flex-col md:flex-row gap-1.5 md:gap-2 shrink-0">
                    {item.excluded ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExclude(item.id, item.excluded)}
                          className="text-xs md:text-sm px-2 md:px-3"
                        >
                          복원
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="px-2 md:px-3"
                        >
                          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExclude(item.id, item.excluded)}
                        className="text-xs md:text-sm px-2 md:px-3"
                      >
                        제외
                      </Button>
                    )}
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
            <li>• RSS에서 자동으로 수집된 뉴스가 여기에 표시됩니다.</li>
            <li>• &ldquo;제외&rdquo; 버튼을 클릭하면 해당 뉴스는 초안 생성 대상에서 제외됩니다.</li>
            <li>• 초안이 생성되면 &ldquo;초안 관리&rdquo; 페이지에서 확인할 수 있습니다.</li>
            <li>• &ldquo;제외됨&rdquo; 탭에서 전체 선택 후 일괄 삭제할 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
