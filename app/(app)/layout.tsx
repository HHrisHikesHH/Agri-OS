import type { ReactNode } from "react"

import { BottomNav } from "@/components/dashboard/BottomNav"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { PageTransition } from "@/components/providers/MotionProvider"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <main className="min-h-screen flex-1 pb-16 md:pb-0 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

