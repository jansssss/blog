'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle, XCircle, Edit } from 'lucide-react'

interface Draft {
  id: string
  news_item_id: string | null
  title: string
  slug: string
  summary: string
  content: string
  category: string
  tags: string[]
  thumbnail_url: string | null
  status: string
  created_at: string
}

export default function DraftEditPage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    if (draftId) {
      loadDraft()
    }
  }, [router, draftId])

  const loadDraft = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', draftId)
        .single()

      if (error) {
        console.error('초안 로드 오류:', error)
        alert('초안을 불러오는데 실패했습니다.')
        router.push('/admin/drafts')
        return
      }

      if (data) {
        setDraft(data)
        setTitle(data.title)
        setSlug(data.slug)
        setSummary(data.summary || '')
        setContent(data.content)
        setCategory(data.category)
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
        setThumbnailUrl(data.thumbnail_url || '')
      }
    } catch (err) {
      console.error('예상치 못한 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title || !slug || !content) {
      alert('제목, 슬러그, 내용은 필수입니다.')
      return
    }

    setSaving(true)
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean)

      const { error } = await supabase
        .from('drafts')
        .update({
          title,
          slug,
          summary,
          content,
          category,
          tags: tagsArray,
          thumbnail_url: thumbnailUrl || null
        })
        .eq('id', draftId)

      if (error) {
        console.error('저장 오류:', error)
        alert('저장 중 오류가 발생했습니다.')
        return
      }

      alert('초안이 저장되었습니다.')
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleEditInEditor = () => {
    // 초안 내용을 에디터로 전달
    const draftData = {
      title,
      slug,
      summary,
      content,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      thumbnailUrl
    }

    // 세션 스토리지에 임시 저장
    sessionStorage.setItem('draftToEdit', JSON.stringify(draftData))

    // 에디터로 이동
    router.push('/admin/editor')
  }

  const handleApprove = async () => {
    if (!confirm('이 초안을 승인하고 블로그에 발행하시겠습니까?')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/drafts/${draftId}/approve`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Approval failed')
      }

      const result = await response.json()
      alert(`승인되었습니다! 게시글 ID: ${result.postId}`)
      router.push('/admin/drafts')
    } catch (err) {
      console.error('승인 오류:', err)
      alert(`승인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('이 초안을 반려하시겠습니까?')) {
      return
    }

    setSaving(true)
    try {
      const adminId = localStorage.getItem('adminId')

      const { error } = await supabase
        .from('drafts')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', draftId)

      if (error) {
        console.error('반려 처리 오류:', error)
        alert('반려 처리 중 오류가 발생했습니다.')
        return
      }

      alert('초안이 반려되었습니다.')
      router.push('/admin/drafts')
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('반려 처리 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <p className="text-center text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="container py-10">
        <p className="text-center text-muted-foreground">초안을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/drafts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              초안 목록
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">초안 편집</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEditInEditor} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            에디터로 편집
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
          {draft.status === 'pending' && (
            <>
              <Button onClick={handleReject} disabled={saving} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                반려
              </Button>
              <Button onClick={handleApprove} disabled={saving}>
                <CheckCircle className="mr-2 h-4 w-4" />
                승인 및 발행
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">슬러그 (URL)</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">요약</label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="게시글 요약 (SEO용)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">카테고리</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="금융"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">태그 (쉼표 구분)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="대출, 금리, DSR"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">썸네일 URL</label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* 본문 */}
        <Card>
          <CardHeader>
            <CardTitle>본문 (마크다운)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="마크다운 형식으로 작성하세요..."
              rows={25}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
