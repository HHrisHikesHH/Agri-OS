"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

import { AnimatedNumber } from "@/components/ui/AnimatedNumber"

interface PriceTickerCardProps {
  commodity: string
  price: number | null
  previousPrice?: number | null
  mandi?: string
  date?: string
}

export function PriceTickerCard({
  commodity,
  price,
  previousPrice,
  mandi,
  date,
}: PriceTickerCardProps) {
  const [displayPrice, setDisplayPrice] = useState(price)
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral")
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (price == null) return
    if (displayPrice != null && price !== displayPrice) {
      setTrend(price > displayPrice ? "up" : "down")
      setFlash(true)
      const id = setTimeout(() => setFlash(false), 1000)
      return () => clearTimeout(id)
    }
    setDisplayPrice(price)
  }, [price, displayPrice])

  const priceDiff =
    price != null && previousPrice != null ? price - previousPrice : null
  const pricePct =
    priceDiff != null && previousPrice
      ? (priceDiff / previousPrice) * 100
      : null

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
        flash
          ? trend === "up"
            ? "border-green-400 bg-green-50 dark:bg-green-950/20"
            : "border-red-400 bg-red-50 dark:bg-red-950/20"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}
    >
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 rounded-2xl ${
              trend === "up" ? "bg-green-400" : "bg-red-400"
            }`}
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {commodity}
            </p>
            {mandi && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                {mandi}
              </p>
            )}
          </div>
          {pricePct != null && (
            <motion.div
              key={trend}
              initial={{ y: trend === "up" ? 6 : -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                pricePct > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : pricePct < 0
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {pricePct > 0 ? "↑" : pricePct < 0 ? "↓" : "→"}
              {Math.abs(pricePct).toFixed(1)}%
            </motion.div>
          )}
        </div>

        <div className="mt-3">
          {displayPrice != null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                ₹
              </span>
              <AnimatedNumber
                value={displayPrice}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
              />
              <span className="text-xs text-gray-400 dark:text-gray-600 font-mono">
                /qtl
              </span>
            </div>
          ) : (
            <div className="h-8 w-24 skeleton" />
          )}
        </div>

        {priceDiff != null && (
          <p
            className={`text-xs font-mono mt-1 ${
              priceDiff > 0
                ? "text-green-600 dark:text-green-400"
                : priceDiff < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {priceDiff > 0 ? "+" : ""}₹{priceDiff.toFixed(0)} from last
          </p>
        )}

        {date && (
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-600 font-mono">
            {date}
          </p>
        )}
      </div>
    </motion.div>
  )
}

