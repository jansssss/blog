import { getLatestPosts, getAllCategories } from '@/lib/mock-data'
import BlogCard from '@/components/BlogCard'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const posts = getLatestPosts()
  const categories = getAllCategories()

  return (
    <div className="container py-10">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          모두의 궁금증을 해결하기위한 <br />
          <span className="text-primary">생활정보 블로그</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          AI, 재테크, 노무, 개발 등 다양한 주제의 전문 콘텐츠를 만나보세요
        </p>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="default">전체</Button>
          {categories.map((category) => (
            <Button key={category} variant="outline">
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">최신 게시글</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
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
