'use client'

import { ReactNode, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { cn } from '@/lib/utils'

export default function MainLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <Navbar />

      <div className="flex pb-10 md:pb-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            collapsed ? 'md:ml-16' : 'md:ml-64'
          )}
        >
          {children}
        </main>
      </div>

      <MobileNav />
    </>
  )
}
