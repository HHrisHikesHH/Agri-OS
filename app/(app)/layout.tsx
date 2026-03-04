import type { ReactNode } from "react"

import { BottomNav } from "@/components/dashboard/BottomNav"
import { Sidebar } from "@/components/dashboard/Sidebar"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-green-50">
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <main className="min-h-screen flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

