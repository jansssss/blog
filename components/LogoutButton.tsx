'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin')
    setIsAdmin(adminStatus === 'true')
  }, [])

  const handleLogout = () => {
    const confirmed = window.confirm('로그아웃 하시겠습니까?')

    if (!confirmed) return

    // 로그아웃: localStorage에서 관리자 상태 제거
    localStorage.removeItem('isAdmin')

    // 홈으로 리다이렉트
    router.push('/')
    router.refresh()
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      로그아웃
    </Button>
  )
}