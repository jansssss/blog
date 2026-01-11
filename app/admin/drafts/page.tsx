'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface Draft {
  id: string
  title: string
  slug: string
  summary: string
  category: string
  status: string
  created_at: string
  reviewed_at: string | null
}

export default function AdminDraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    // 로그인 체크
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    loadDrafts()
  }, [router, filter])

  const loadDrafts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">승인 대기</span>
      case 'approved':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">승인됨</span>
      case 'rejected':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">반려됨</span>
      default:
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const pendingCount = drafts.filter(d => d.status === 'pending').length
  const approvedCount = drafts.filter(d => d.status === 'approved').length

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
        <Button onClick={loadDrafts} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-2">
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
          승인 대기 ({pendingCount})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
          size="sm"
        >
          승인됨
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
          size="sm"
        >
          반려됨
        </Button>
      </div>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 초안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
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
              뉴스가 수집되고 초안 생성 cron이 실행될 때까지 기다려주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {draft.category}
                      </span>
                      {getStatusBadge(draft.status)}
                    </div>
                    <h3 className="font-semibold mb-2">{draft.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {draft.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>생성일: {formatDate(draft.created_at)}</span>
                      {draft.reviewed_at && <span>검토일: {formatDate(draft.reviewed_at)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/drafts/${draft.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        편집/승인
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
            <li>• 자동 생성된 초안을 검토하고 편집할 수 있습니다.</li>
            <li>• "편집/승인" 버튼을 클릭하여 초안을 수정하세요.</li>
            <li>• 승인하면 블로그 게시글(posts)로 발행되며, 반려하면 초안만 보관됩니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
