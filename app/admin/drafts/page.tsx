'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Eye, Trash2, RefreshCw } from 'lucide-react'

interface Draft {
  id: string
  title: string
  slug: string
  summary: string
  category: string
  status: string
  stage: string
  created_at: string
}

export default function AdminDraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
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
          <h1 className="text-3xl font-bold">초안 관리</h1>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              일괄 삭제 ({selectedItems.length})
            </Button>
          )}
          <Button onClick={loadDrafts} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

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

      {/* 통계 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">총 초안</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{drafts.length}</div>
        </CardContent>
      </Card>

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
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* 체크박스 */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(draft.id)}
                      onChange={(e) => handleSelectItem(draft.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {draft.category}
                      </span>
                      {/* Stage 배지 */}
                      {draft.stage === 'COLUMNIST_DONE' && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✓ 완료
                        </span>
                      )}
                      {draft.stage === 'PERPLEXITY_DONE' && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          1차 완료
                        </span>
                      )}
                      {draft.stage === 'EDITOR_DONE' && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          2차 완료
                        </span>
                      )}
                      {(draft.stage === 'FAILED' || draft.stage === 'EDITOR_FAILED' || draft.stage === 'COLUMNIST_FAILED') && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          ✗ 실패
                        </span>
                      )}
                      {!draft.stage && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          초안
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{draft.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {draft.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>생성일: {formatDate(draft.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/drafts/${draft.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        편집
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
