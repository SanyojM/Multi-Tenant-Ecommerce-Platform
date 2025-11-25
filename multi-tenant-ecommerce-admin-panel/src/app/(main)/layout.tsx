import LayoutWrapper from '@/components/wrappers/LayoutWrapper'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  )
}
