'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DeleteButtonProps {
  postId: string
}

export default function DeleteButton({ postId }: DeleteButtonProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin')
    setIsAdmin(adminStatus === 'true')
  }, [])

  const handleDelete = async () => {
    const confirmed = window.confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')

    if (!confirmed) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('삭제 오류:', error)
        alert(`게시글 삭제 중 오류가 발생했습니다: ${error.message}`)
        setDeleting(false)
        return
      }

      alert('게시글이 성공적으로 삭제되었습니다.')
      router.push('/')
    } catch (err) {
      console.error('예상치 못한 오류:', err)
      alert('게시글 삭제 중 오류가 발생했습니다.')
      setDeleting(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {deleting ? '삭제 중...' : '삭제'}
    </Button>
  )
}
