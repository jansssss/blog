'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Edit, Send } from 'lucide-react'
import { marked } from 'marked'

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
  site_id: string | null
  validation_passed: boolean | null
  validation_failures: string[] | null
  validation_warnings: string[] | null
  created_at: string
}

interface Site {
  id: string
  domain: string
  name: string
  is_main: boolean
}

export default function DraftEditPage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    loadSites()
    if (draftId) {
      loadDraft()
    }
  }, [router, draftId])

  const loadSites = async () => {
    const { data, error } = await supabase
      .from('sites')
      .select('id, domain, name, is_main')
      .order('is_main', { ascending: false })
      .order('name', { ascending: true })

    if (!error && data) {
      setSites(data)
      // 기본값으로 메인 사이트 선택
      const mainSite = data.find(s => s.is_main)
      if (mainSite) {
        setSelectedSiteId(mainSite.id)
      }
    }
  }

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
        // 저장된 site_id가 있으면 선택
        if (data.site_id) {
          setSelectedSiteId(data.site_id)
        }
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

  const handleEditInEditor = async () => {
    // 마크다운을 HTML로 변환
    const htmlContent = await marked.parse(content)

    // 초안 내용을 에디터로 전달
    const draftData = {
      title,
      slug,
      summary,
      content: htmlContent, // HTML로 변환된 콘텐츠
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      thumbnailUrl
    }

    // 세션 스토리지에 임시 저장
    sessionStorage.setItem('draftToEdit', JSON.stringify(draftData))

    // 에디터로 이동
    router.push('/admin/editor')
  }

  const handleDelete = async () => {
    if (!confirm('이 초안을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구할 수 없습니다.')) {
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', draftId)

      if (error) {
        console.error('삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      alert('초안이 삭제되었습니다.')
      router.push('/admin/drafts')
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    // site_id 필수 검증
    if (!selectedSiteId) {
      alert('발행할 사이트를 선택해주세요.')
      return
    }

    const selectedSite = sites.find(s => s.id === selectedSiteId)
    if (!confirm(`"${selectedSite?.name}" 사이트에 발행하시겠습니까?\n\n발행 후 초안은 삭제됩니다.`)) {
      return
    }

    setPublishing(true)
    try {
      const response = await fetch(`/api/admin/drafts/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: selectedSiteId })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`발행 실패: ${result.error}`)
        return
      }

      alert(`게시글이 "${selectedSite?.name}" 사이트에 발행되었습니다!`)
      router.push(`/blog/${result.slug}`)
    } catch (err) {
      console.error('발행 오류:', err)
      alert('발행 중 오류가 발생했습니다.')
    } finally {
      setPublishing(false)
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
        <div className="flex items-center gap-2">
          <Button onClick={handleEditInEditor} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            에디터로 편집
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
          <Button onClick={handleDelete} disabled={saving} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
          <div className="border-l pl-2 ml-2 flex items-center gap-2">
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">사이트 선택</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.domain})
                </option>
              ))}
            </select>
            <Button
              onClick={handlePublish}
              disabled={publishing || !selectedSiteId}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {publishing ? '발행 중...' : '발행'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 품질 검증 결과 - 실패/경고가 있을 때만 표시 */}
        {(draft.validation_passed === false || (draft.validation_warnings && draft.validation_warnings.length > 0)) && (
          <Card className={draft.validation_passed === false ? 'border-orange-500 bg-orange-50' : 'border-yellow-500 bg-yellow-50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {draft.validation_passed === false ? '⚠️ 품질 검증 실패' : '💡 품질 검증 경고'}
                <span className="text-sm font-normal text-muted-foreground">
                  - 아래 내용을 참고하여 편집하세요
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 실패 항목 */}
              {draft.validation_failures && draft.validation_failures.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-1">❌ 실패 ({draft.validation_failures.length}개)</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                    {draft.validation_failures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* 경고 항목 */}
              {draft.validation_warnings && draft.validation_warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-700 mb-1">⚠️ 경고 ({draft.validation_warnings.length}개)</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-0.5">
                    {draft.validation_warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
