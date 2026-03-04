"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BarChart3,
  Bot,
  Coins,
  Home,
  Leaf,
  Map,
  Sprout,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

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
          <motion.a
            key={item.href}
            href={item.href}
            whileHover={{ x: 3 }}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => setOpen(false)}
            aria-disabled={disabled}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 group ${
              active
                ? "text-green-700 dark:text-green-400"
                : disabled
                  ? "text-gray-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {active && (
              <motion.div
                layoutId="sidebar-active-pill"
                className="absolute inset-0 bg-green-50 dark:bg-green-950/30 rounded-xl"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative flex items-center gap-1">
              {item.label}
              {!item.activeNow && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-gray-500">
                  Coming soon
                </span>
              )}
              {item.href === "/agent" && unreadAgent > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  className="rounded-full bg-red-500 text-white px-1.5 py-0.5 text-[10px] font-normal"
                >
                  {unreadAgent > 9 ? "9+" : unreadAgent}
                </motion.span>
              )}
            </span>
          </motion.a>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="hidden h-screen w-64 flex-col border-r border-green-100 dark:border-green-900 bg-green-50/80 dark:bg-gray-950 px-4 md:flex">
        <div className="flex h-16 items-center justify-between border-b border-green-100 dark:border-green-900">
          <span className="text-lg font-semibold text-green-900 dark:text-green-100">
            🌾 Agri OS
          </span>
          <ThemeToggle size="sm" />
        </div>
        {content}
        <div className="mt-auto pt-4 border-t border-green-100 dark:border-green-900">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Appearance
            </span>
            <ThemeToggle size="sm" />
          </div>
        </div>
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
          <div className="h-full w-64 border-r border-green-100 dark:border-green-900 bg-green-50/95 dark:bg-gray-950 px-4 pb-6 pt-12 shadow-xl">
            <div className="mb-4 flex items-center justify-between text-lg font-semibold text-green-900 dark:text-green-100">
              🌾 Agri OS
              <ThemeToggle size="sm" />
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

