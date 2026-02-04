'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, RefreshCw, Eye, Globe } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  summary: string
  category: string
  published: boolean
  published_at: string
  created_at: string
  updated_at: string
  site_id: string
  tags: string[]
  thumbnail_url?: string
}

interface Site {
  id: string
  name: string
  domain: string
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data: postsData, error: postsError }, { data: sitesData }] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, slug, summary, category, published, published_at, created_at, updated_at, site_id, tags, thumbnail_url')
          .order('published_at', { ascending: false }),
        supabase
          .from('sites')
          .select('id, name, domain')
      ])

      if (postsError) {
        console.error('글 로드 오류:', postsError)
        alert('글을 불러오는데 실패했습니다.')
        return
      }

      setPosts(postsData || [])
      setSites(sitesData || [])
    } catch (err) {
      console.error('예상치 못한 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId)
    return site?.name || '알 수 없음'
  }

  const getSiteDomain = (siteId: string) => {
    const site = sites.find(s => s.id === siteId)
    return site?.domain || ''
  }

  const getSiteBadge = (siteId: string) => {
    const domain = getSiteDomain(siteId)
    if (domain.includes('ohyess')) {
      return { label: '오예스', className: 'bg-blue-100 text-blue-800' }
    }
    if (domain.includes('sureline')) {
      return { label: '슈어라인', className: 'bg-green-100 text-green-800' }
    }
    return { label: getSiteName(siteId), className: 'bg-gray-100 text-gray-600' }
  }

  const filteredPosts = siteFilter === 'all'
    ? posts
    : posts.filter(post => {
        const domain = getSiteDomain(post.site_id)
        return domain.includes(siteFilter)
      })

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
    if (selectedItems.length === filteredPosts.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredPosts.map(post => post.id))
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"\n\n이 글을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구할 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      setPosts(prev => prev.filter(post => post.id !== id))
      setSelectedItems(prev => prev.filter(item => item !== id))
      alert('삭제되었습니다.')
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 글을 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedItems.length}개 글을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구할 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .in('id', selectedItems)

      if (error) {
        console.error('일괄 삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
        return
      }

      setPosts(prev => prev.filter(post => !selectedItems.includes(post.id)))
      setSelectedItems([])
      alert(`${selectedItems.length}개 글이 삭제되었습니다.`)
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleTogglePublish = async (post: Post) => {
    const newStatus = !post.published
    const action = newStatus ? '공개' : '비공개'

    if (!confirm(`"${post.title}"\n\n이 글을 ${action} 처리하시겠습니까?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: newStatus })
        .eq('id', post.id)

      if (error) {
        console.error('상태 변경 오류:', error)
        alert('상태 변경 중 오류가 발생했습니다.')
        return
      }

      setPosts(prev =>
        prev.map(p => p.id === post.id ? { ...p, published: newStatus } : p)
      )
    } catch (err) {
      console.error('예상치 못한 오류:', err)
    }
  }

  // 통계
  const totalPosts = posts.length
  const ohyessPosts = posts.filter(p => getSiteDomain(p.site_id).includes('ohyess')).length
  const surelinePosts = posts.filter(p => getSiteDomain(p.site_id).includes('sureline')).length
  const publishedPosts = posts.filter(p => p.published).length

  return (
    <div className="container py-6 px-4 md:py-10 md:px-6">
      {/* 헤더 */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/admin/editor">
            <Button variant="ghost" size="sm" className="px-2 md:px-3">
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">관리자 홈</span>
            </Button>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold">글 관리 (통합)</h1>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {selectedItems.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm" className="shrink-0">
              <Trash2 className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">선택 삭제</span>
              <span className="ml-1">({selectedItems.length})</span>
            </Button>
          )}
          <Button onClick={loadData} variant="outline" size="sm" className="shrink-0">
            <RefreshCw className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">새로고침</span>
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs md:text-sm text-muted-foreground">전체</p>
            <p className="text-xl md:text-2xl font-bold">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs md:text-sm text-blue-600">오예스</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{ohyessPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs md:text-sm text-green-600">슈어라인</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{surelinePosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs md:text-sm text-muted-foreground">공개</p>
            <p className="text-xl md:text-2xl font-bold">{publishedPosts}</p>
          </CardContent>
        </Card>
      </div>

      {/* 사이트 필터 + 전체 선택 */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
          <Button
            variant={siteFilter === 'all' ? 'default' : 'outline'}
            onClick={() => { setSiteFilter('all'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            전체 ({totalPosts})
          </Button>
          <Button
            variant={siteFilter === 'ohyess' ? 'default' : 'outline'}
            onClick={() => { setSiteFilter('ohyess'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            오예스 ({ohyessPosts})
          </Button>
          <Button
            variant={siteFilter === 'sureline' ? 'default' : 'outline'}
            onClick={() => { setSiteFilter('sureline'); setSelectedItems([]) }}
            size="sm"
            className="shrink-0"
          >
            슈어라인 ({surelinePosts})
          </Button>
        </div>

        {filteredPosts.length > 0 && (
          <Button
            onClick={handleSelectAll}
            variant="ghost"
            size="sm"
            className="self-end md:self-auto"
          >
            {selectedItems.length === filteredPosts.length ? '전체 해제' : '전체 선택'}
          </Button>
        )}
      </div>

      {/* 글 목록 */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">게시글이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredPosts.map((post) => {
            const siteBadge = getSiteBadge(post.site_id)
            return (
              <Card key={post.id} className={!post.published ? 'opacity-60' : ''}>
                <CardContent className="p-4 md:pt-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* 체크박스 */}
                    <div className="pt-1 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(post.id)}
                        onChange={(e) => handleSelectItem(post.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 배지들 */}
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2">
                        {/* 사이트 배지 */}
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${siteBadge.className}`}>
                          {siteBadge.label}
                        </span>
                        {/* 카테고리 배지 */}
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                          {post.category}
                        </span>
                        {/* 공개 상태 배지 */}
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {post.published ? '공개' : '비공개'}
                        </span>
                      </div>

                      {/* 제목 */}
                      <h3 className="font-semibold text-sm md:text-base mb-1.5 md:mb-2 line-clamp-2">{post.title}</h3>

                      {/* 요약 */}
                      {post.summary && (
                        <p className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 line-clamp-2">
                          {post.summary}
                        </p>
                      )}

                      {/* 날짜 */}
                      <div className="text-xs text-muted-foreground">
                        <span>발행: {formatDate(post.published_at)}</span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-1.5 md:gap-2 shrink-0">
                      {/* 에디터에서 편집 */}
                      <Link href={`/admin/editor?id=${post.id}`}>
                        <Button size="sm" variant="outline" className="text-xs md:text-sm px-2 md:px-3 w-full">
                          <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden md:inline">편집</span>
                        </Button>
                      </Link>
                      {/* 보기 (해당 사이트 도메인으로 이동) */}
                      <a
                        href={`https://${getSiteDomain(post.site_id)}/blog/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="ghost" className="text-xs md:text-sm px-2 md:px-3 w-full">
                          <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden md:inline">보기</span>
                        </Button>
                      </a>
                      {/* 공개/비공개 토글 */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePublish(post)}
                        className="text-xs md:text-sm px-2 md:px-3"
                      >
                        <Globe className={`h-3.5 w-3.5 md:h-4 md:w-4 ${post.published ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      {/* 삭제 */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-xs md:text-sm px-2 md:px-3 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 도움말 */}
      <Card className="mt-6 bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">사용 방법</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 모든 사이트의 게시글을 한 곳에서 관리할 수 있습니다.</li>
            <li>• 사이트 필터를 사용하여 오예스 또는 슈어라인 글만 볼 수 있습니다.</li>
            <li>• "편집" 버튼을 클릭하면 에디터에서 해당 글을 수정할 수 있습니다.</li>
            <li>• 지구본 아이콘을 클릭하여 공개/비공개 상태를 전환할 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
