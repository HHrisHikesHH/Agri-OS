"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const OPTIONS = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" },
] as const

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
            theme === opt.value
              ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-500"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600"
          }`}
        >
          <span className="text-xl">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

