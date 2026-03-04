"use client"

import { motion } from "framer-motion"

export function SpringCard({
  children,
  className = "",
  onClick,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={onClick ? { y: -2, scale: 1.01 } : { y: -1 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`card ${onClick ? "cursor-pointer" : "cursor-default"} ${className}`}
    >
      {children}
    </motion.div>
  )
}

