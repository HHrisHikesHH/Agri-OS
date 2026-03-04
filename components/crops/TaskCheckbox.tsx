"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

import { completeTask } from "@/app/(app)/crops/actions"

export function TaskCheckbox({
  taskId,
  title,
  initialCompleted,
  onComplete,
}: {
  taskId: string
  title: string
  initialCompleted: boolean
  onComplete?: () => void
}) {
  const [checked, setChecked] = useState(initialCompleted)
  const [animating, setAnimating] = useState(false)

  const handleCheck = async () => {
    if (checked) return
    setAnimating(true)
    setChecked(true)

    setTimeout(async () => {
      await completeTask(taskId)
      setAnimating(false)
      onComplete?.()
    }, 600)
  }

  return (
    <motion.button
      type="button"
      className="flex items-center gap-3 group cursor-pointer"
      onClick={handleCheck}
      whileHover={{ x: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.div
        className={`relative w-5 h-5 rounded-md border-2 flex items-center justify-center ${
          checked
            ? "bg-green-600 border-green-600"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        }`}
        animate={checked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, times: [0, 0.5, 1] }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-3 h-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path d="M2 6l3 3 5-5" />
            </motion.svg>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {animating && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-md bg-green-400"
            />
          )}
        </AnimatePresence>
      </motion.div>

      <span
        className={`text-sm transition-all duration-300 ${
          checked
            ? "line-through text-gray-400 dark:text-gray-600"
            : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900"
        }`}
      >
        {title}
      </span>
    </motion.button>
  )
}

