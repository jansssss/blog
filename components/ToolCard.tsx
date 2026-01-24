import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ToolCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

export default function ToolCard({ icon, title, description, href }: ToolCardProps) {
  return (
    <Link href={href} className="block">
      <div className="h-full p-4 bg-background border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer group">
        <div className="flex items-start justify-between mb-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">{description}</p>
        <p className="text-xs text-primary mt-2 font-medium group-hover:underline">
          바로 계산하기
        </p>
      </div>
    </Link>
  )
}
