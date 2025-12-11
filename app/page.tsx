import BlogCard from '@/components/BlogCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// 동적 렌더링 강제 (항상 최신 데이터 표시)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Supabase에서 최신 게시글 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(10)

  // Supabase에서 카테고리 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .order('name')

  return (
    <div className="container py-10">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl" style={{ lineHeight: '1.6' }}>
          모두의 궁금증을 해결하기위한 <br className="mb-2" />
          <span className="text-primary">생활정보 블로그</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground mt-6">
          금융, 세금, 대출, AI 등 다양한 주제의 전문 콘텐츠를 만나보세요
        </p>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="default">전체</Button>
          {categories?.map((category) => (
            <Button key={category.name} variant="outline">
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">최신 게시글</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* AdSense Placeholder */}
      <section className="mt-12">
        <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Google AdSense 광고 영역 (2단계에서 추가 예정)
          </p>
        </div>
      </section>
    </div>
  )
}
