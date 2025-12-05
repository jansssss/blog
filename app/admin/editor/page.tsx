'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Editor from '@/components/Editor'
import { generateSlug } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

function AdminEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')

  const [mounted, setMounted] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('개발')
  const [tags, setTags] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [published, setPublished] = useState(true)

  useEffect(() => {
    setMounted(true)
    // 로그인 체크
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    // 수정 모드인 경우 게시글 데이터 로드
    if (postId) {
      loadPost(postId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, postId])

  const loadPost = async (id: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('게시글 로드 오류:', error)
        alert('게시글을 불러오는데 실패했습니다.')
        router.push('/admin/editor')
        return
      }

      if (data) {
        setIsEditMode(true)
        setTitle(data.title)
        setSlug(data.slug)
        setSummary(data.summary || '')
        setContent(data.content)
        setCategory(data.category || '개발')
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
        setThumbnailUrl(data.thumbnail_url || '')
        setPublished(data.published)
      }
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('게시글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    // 제목이 변경되면 자동으로 슬러그 생성
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSave = async () => {
    if (!title || !slug || !content) {
      alert('제목, 슬러그, 본문은 필수 항목입니다.')
      return
    }

    try {
      const adminId = localStorage.getItem('adminId')

      const postData = {
        title,
        slug,
        summary,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        thumbnail_url: thumbnailUrl || null,
        published,
        published_at: published ? new Date().toISOString() : null,
        author_id: adminId,
      }

      if (isEditMode && postId) {
        // 수정 모드
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId)

        if (error) {
          console.error('수정 오류:', error)
          alert(`게시글 수정 중 오류가 발생했습니다: ${error.message}`)
          return
        }

        alert('게시글이 성공적으로 수정되었습니다!')
      } else {
        // 새 글 작성 모드
        const { error } = await supabase
          .from('posts')
          .insert([postData])
          .select()

        if (error) {
          console.error('저장 오류:', error)
          alert(`게시글 저장 중 오류가 발생했습니다: ${error.message}`)
          return
        }

        alert('게시글이 성공적으로 저장되었습니다!')
      }

      // 메인 페이지로 이동
      router.push('/')
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('게시글 저장 중 오류가 발생했습니다.')
    }
  }

  const handlePreview = () => {
    // 미리보기 모달을 띄우거나 새 탭에서 열기
    console.log('미리보기 기능 (구현 예정)')
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">게시글 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              블로그로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{isEditMode ? '글 수정' : '새 글 작성'}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>제목</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="게시글 제목을 입력하세요"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>요약</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
                placeholder="게시글 요약 (SEO 및 카드 미리보기에 사용)"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>본문</CardTitle>
            </CardHeader>
            <CardContent>
              <Editor value={content} onChange={setContent} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>발행 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="published" className="text-sm font-medium">
                  즉시 발행
                </label>
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리 & 태그</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  카테고리
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="AI">AI</option>
                  <option value="재테크">재테크</option>
                  <option value="노무">노무</option>
                  <option value="개발">개발</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  태그 (쉼표로 구분)
                </label>
                <Input
                  id="tags"
                  placeholder="태그1, 태그2, 태그3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* URL Slug */}
          <Card>
            <CardHeader>
              <CardTitle>URL 슬러그</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="url-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                URL: /blog/{slug || 'slug'}
              </p>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>썸네일 이미지</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://example.com/image.jpg"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                이미지 URL을 입력하세요 (Unsplash 등 외부 이미지 사용 가능)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AdminEditorPage() {
  return (
    <Suspense fallback={
      <div className="container py-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AdminEditorContent />
    </Suspense>
  )
}
