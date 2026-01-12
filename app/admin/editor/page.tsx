'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateSlug } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { uploadThumbnail } from '@/lib/upload'
import Image from 'next/image'

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})

function AdminEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [mounted, setMounted] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('금융')
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

    // 초안에서 온 경우 데이터 로드
    const draftData = sessionStorage.getItem('draftToEdit')
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData)
        setTitle(parsed.title || '')
        setSlug(parsed.slug || '')
        setSummary(parsed.summary || '')
        setContent(parsed.content || '')
        setCategory(parsed.category || '금융')
        setTags(Array.isArray(parsed.tags) ? parsed.tags.join(', ') : '')
        setThumbnailUrl(parsed.thumbnailUrl || '')
        // 데이터 로드 후 세션 스토리지 비우기
        sessionStorage.removeItem('draftToEdit')
      } catch (e) {
        console.error('초안 데이터 파싱 오류:', e)
      }
    }
    // 수정 모드인 경우 게시글 데이터 로드
    else if (postId) {
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
        setCategory(data.category || '금융')
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

      if (isEditMode && postId) {
        // 수정 모드 - published_at은 업데이트하지 않음
        const updateData = {
          title,
          slug,
          summary,
          content,
          category,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          thumbnail_url: thumbnailUrl || null,
          published,
          author_id: adminId,
        }

        const { error } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', postId)

        if (error) {
          console.error('수정 오류:', error)
          alert(`게시글 수정 중 오류가 발생했습니다: ${error.message}`)
          return
        }

        alert('게시글이 성공적으로 수정되었습니다!')
      } else {
        // 새 글 작성 모드 - published_at 설정
        const insertData = {
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

        const { error } = await supabase
          .from('posts')
          .insert([insertData])
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setUploadingThumbnail(true)
    const url = await uploadThumbnail(file)
    setUploadingThumbnail(false)

    if (url) {
      setThumbnailUrl(url)
    } else {
      alert('썸네일 업로드에 실패했습니다.')
    }
  }

  const handleRemoveThumbnail = () => {
    setThumbnailUrl('')
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
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
                  <option value="금융">금융</option>
                  <option value="세금">세금</option>
                  <option value="대출">대출</option>
                  <option value="AI">AI</option>
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
            <CardContent className="space-y-4">
              {/* 썸네일 미리보기 */}
              {thumbnailUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={thumbnailUrl}
                    alt="썸네일 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={handleRemoveThumbnail}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* 업로드 버튼 */}
              <div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="w-full"
                >
                  {uploadingThumbnail ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      썸네일 업로드
                    </>
                  )}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  권장 크기: 1200x630px, 최대 5MB
                </p>
              </div>
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
