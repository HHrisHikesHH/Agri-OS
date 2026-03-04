"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface PressButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  successMessage?: string
  className?: string
  type?: "button" | "submit"
}

const variants: Record<
  NonNullable<PressButtonProps["variant"]>,
  string
> = {
  primary:
    "bg-green-700 text-white hover:bg-green-600 active:bg-green-800 shadow-sm",
  secondary:
    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
  ghost:
    "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
  danger:
    "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100",
}

const sizes: Record<NonNullable<PressButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
}

export function PressButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth,
  disabled,
  loading,
  successMessage,
  className = "",
  type = "button",
}: PressButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = async () => {
    if (!onClick || disabled || loading) return
    await onClick()
    if (successMessage) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        relative font-medium transition-colors duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      <motion.span
        animate={{ opacity: loading ? 0 : 1 }}
        className="flex items-center justify-center gap-2"
      >
        {showSuccess ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
          >
            ✓ {successMessage}
          </motion.span>
        ) : (
          children
        )}
      </motion.span>

      {loading && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
        </motion.span>
      )}
    </motion.button>
  )
}

