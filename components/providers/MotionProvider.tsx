"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: { duration: 0.15, ease: "easeIn" },
  },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

