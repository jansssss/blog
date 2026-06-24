import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
