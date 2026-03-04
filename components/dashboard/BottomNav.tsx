'use client'

import { motion } from "framer-motion"
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 md:hidden">
      <div className="flex items-center justify-around px-2 h-16">
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
              className="relative flex flex-col items-center justify-center w-16 h-full gap-0.5"
            >
              <motion.div
                animate={active ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="relative"
              >
                <Icon
                  className={`h-5 w-5 ${
                    active
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </motion.div>

              <motion.span
                animate={{
                  color: active ? "#16a34a" : "#9ca3af",
                  fontWeight: active ? 600 : 400,
                }}
                className="text-[10px] leading-none"
              >
                {item.label}
              </motion.span>

              {active && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute -bottom-0 w-8 h-0.5 rounded-full bg-green-600"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


