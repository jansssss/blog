'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-12 mt-8 px-4">
      <form onSubmit={handleSubmit} className="relative group overflow-visible">
        {/* Gradient Background Effect */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${
            isFocused ? 'opacity-30' : ''
          }`}
        />

        {/* Search Container */}
        <div className="relative">
          <div
            className={`flex items-center bg-background border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
              isFocused
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {/* AI Sparkle Icon */}
            <div className="pl-5 pr-3">
              <Sparkles
                className={`w-5 h-5 transition-colors duration-300 ${
                  isFocused ? 'text-primary animate-pulse' : 'text-muted-foreground'
                }`}
              />
            </div>

            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="궁금한 내용을 검색해보세요... (예: 프리랜서 신용대출, AI, 세금)"
              className="flex-1 bg-transparent py-4 pr-4 text-base outline-none placeholder:text-muted-foreground"
            />

            {/* Search Button */}
            <button
              type="submit"
              className={`mr-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                query.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              disabled={!query.trim()}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Subtle shine effect */}
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 pointer-events-none transition-opacity duration-500 ${
              isFocused ? 'opacity-10 animate-shine' : ''
            }`}
          />
        </div>
      </form>

      {/* Popular searches suggestion */}
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">인기 검색어:</span>
        {['신용대출', '프리랜서', '세금', 'AI'].map((keyword) => (
          <button
            key={keyword}
            onClick={() => {
              setQuery(keyword)
              router.push(`/search?q=${encodeURIComponent(keyword)}`)
            }}
            className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  )
}
