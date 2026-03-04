"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type ToggleSize = "sm" | "md" | "lg"

export function ThemeToggle({ size = "md" }: { size?: ToggleSize }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <div className={size === "sm" ? "w-8 h-8" : "w-10 h-10"} />
  }

  const isDark = resolvedTheme === "dark"

  const sizeClasses: Record<ToggleSize, string> = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${sizeClasses[size]} relative flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`absolute transition-all duration-300 ${
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        }`}
      >
        ☀️
      </span>
      <span
        className={`absolute transition-all duration-300 ${
          isDark
            ? "opacity-0 -rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100"
        }`}
      >
        🌙
      </span>
    </button>
  )
}

