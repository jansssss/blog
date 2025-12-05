'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface EditButtonProps {
  postId: string
}

export default function EditButton({ postId }: EditButtonProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin')
    setIsAdmin(adminStatus === 'true')
  }, [])

  if (!isAdmin) {
    return null
  }

  return (
    <Link href={`/admin/editor?id=${postId}`}>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        수정
      </Button>
    </Link>
  )
}
