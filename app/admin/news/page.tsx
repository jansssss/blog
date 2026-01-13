'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Trash2, RefreshCw, Sparkles } from 'lucide-react'

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

export default function AdminNewsPage() {
  const router = useRouter()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'generated' | 'excluded'>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

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

  const handleSelectAll = () => {
    const pendingItems = newsItems.filter(item => !item.draft_generated && !item.excluded)
    if (selectedItems.length === pendingItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(pendingItems.map(item => item.id))
    }
  }

  const handleGenerateDrafts = async () => {
    if (selectedItems.length === 0) {
      alert('초안을 생성할 뉴스를 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedItems.length}개 뉴스로 AI 초안을 생성하시겠습니까?\n\n⚠️ Perplexity API 비용이 발생합니다.`)) {
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/admin/news/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsItemIds: selectedItems
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '초안 생성 실패')
      }

      alert(`✅ ${data.results.success.length}개 초안 생성 완료!\n❌ ${data.results.failed.length}개 실패`)

      // 목록 새로고침
      setSelectedItems([])
      loadNewsItems()

    } catch (error) {
      console.error('AI 초안 생성 오류:', error)
      alert(error instanceof Error ? error.message : '초안 생성 중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
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

  const filteredCount = newsItems.length

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/editor">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              관리자 홈
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">뉴스 관리</h1>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button
              onClick={handleGenerateDrafts}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? 'AI 생성 중...' : `AI 초안 생성 (${selectedItems.length})`}
            </Button>
          )}
          <Button onClick={loadNewsItems} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 필터 및 전체 선택 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            전체
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            초안 대기중
          </Button>
          <Button
            variant={filter === 'generated' ? 'default' : 'outline'}
            onClick={() => setFilter('generated')}
            size="sm"
          >
            초안 생성됨
          </Button>
          <Button
            variant={filter === 'excluded' ? 'default' : 'outline'}
            onClick={() => setFilter('excluded')}
            size="sm"
          >
            제외됨
          </Button>
        </div>

        {filter === 'pending' && newsItems.some(item => !item.draft_generated && !item.excluded) && (
          <Button
            onClick={handleSelectAll}
            variant="ghost"
            size="sm"
          >
            {selectedItems.length === newsItems.filter(item => !item.draft_generated && !item.excluded).length
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
        <div className="space-y-4">
          {newsItems.map((item) => (
            <Card key={item.id} className={item.excluded ? 'opacity-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* 체크박스 (초안 미생성 & 미제외 항목만) */}
                  {!item.draft_generated && !item.excluded && (
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {item.category}
                      </span>
                      {item.draft_generated && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          초안 생성됨
                        </span>
                      )}
                      {item.excluded && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          제외됨
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      발행일: {formatDate(item.pub_date)}
                    </p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      원문 보기
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex gap-2">
                    {item.excluded ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExclude(item.id, item.excluded)}
                        >
                          복원
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExclude(item.id, item.excluded)}
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
            <li>• "제외" 버튼을 클릭하면 해당 뉴스는 초안 생성 대상에서 제외됩니다.</li>
            <li>• 초안이 생성되면 "초안 관리" 페이지에서 확인하고 승인할 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
