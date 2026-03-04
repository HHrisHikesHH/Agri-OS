'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Coins, Home, Map, Sprout } from "lucide-react"

type BottomItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  activeNow?: boolean
}

const ITEMS: BottomItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, activeNow: true },
  { label: "Farm", href: "/farm", icon: Map, activeNow: true },
  { label: "Crops", href: "/crops", icon: Sprout, activeNow: true },
  { label: "Money", href: "/finances", icon: Coins, activeNow: true },
  { label: "Agent", href: "/agent", icon: Bot, activeNow: false },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-green-100 bg-white/95 shadow-lg backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href)
          const disabled = !item.activeNow

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-disabled={disabled}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs ${
                active
                  ? "text-green-700"
                  : disabled
                    ? "text-gray-400"
                    : "text-gray-500 hover:text-green-700"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? "text-green-700" : "text-gray-500"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

