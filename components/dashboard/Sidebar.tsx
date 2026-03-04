'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bot,
  Coins,
  Home,
  Leaf,
  Map,
  Sprout,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  activeNow?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, activeNow: true },
  { label: "My Farm", href: "/farm", icon: Map, activeNow: true },
  { label: "Crops", href: "/crops", icon: Sprout, activeNow: true },
  { label: "Finances", href: "/finances", icon: Coins, activeNow: true },
  { label: "Market", href: "/market", icon: BarChart3, activeNow: true },
  { label: "Agent", href: "/agent", icon: Bot, activeNow: false },
  { label: "Opportunities", href: "/opportunities", icon: Leaf, activeNow: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [unreadAgent, setUnreadAgent] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/agent/unread")
        const json = (await res.json()) as { count?: number }
        if (!cancelled) {
          setUnreadAgent(json.count ?? 0)
        }
      } catch {
        if (!cancelled) setUnreadAgent(0)
      }
    }
    void load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname?.startsWith(href)
  }

  const content = (
    <nav className="flex flex-1 flex-col gap-2 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        const disabled = !item.activeNow
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-disabled={disabled}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-green-700 text-white"
                : disabled
                  ? "cursor-not-allowed text-gray-400"
                  : "text-green-900 hover:bg-green-100"
            }`}
            onClick={() => setOpen(false)}
          >
            <Icon className="h-4 w-4" />
            <span className="flex items-center gap-1">
              {item.label}
              {!item.activeNow && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-gray-500">
                  Coming soon
                </span>
              )}
              {item.href === "/agent" && unreadAgent > 0 && (
                <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-normal text-red-700">
                  {unreadAgent}
                </span>
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="hidden h-screen w-64 flex-col border-r border-green-100 bg-green-50/80 px-4 md:flex">
        <div className="flex h-16 items-center border-b border-green-100">
          <span className="text-lg font-semibold text-green-900">🌾 Agri OS</span>
        </div>
        {content}
      </aside>

      <button
        type="button"
        className="fixed left-4 top-4 z-30 rounded-full bg-green-700 px-3 py-2 text-xs font-medium text-white shadow-md md:hidden"
        onClick={() => setOpen((prev) => !prev)}
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-20 flex md:hidden">
          <div className="h-full w-64 border-r border-green-100 bg-green-50/95 px-4 pb-6 pt-12 shadow-xl">
            <div className="mb-4 text-lg font-semibold text-green-900">
              🌾 Agri OS
            </div>
            {content}
          </div>
          <div
            className="flex-1 bg-black/30"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  )
}

