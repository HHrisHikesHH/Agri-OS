'use client'

import Link from "next/link"

import type {
  CropCyclesRow,
  PortfolioItemsRow,
  SeasonsRow,
} from "@/lib/types/database.types"

type SeasonWithCycles = SeasonsRow & {
  crop_cycles?: (CropCyclesRow & {
    portfolio_items?: PortfolioItemsRow | null
  })[]
}

type SeasonCardProps = {
  season: SeasonWithCycles
}

export function SeasonCard({ season }: SeasonCardProps) {
  const cycles = season.crop_cycles ?? []
  const totalArea =
    cycles.reduce((sum, c) => sum + (c.area_acres ?? 0), 0) ?? 0
  const totalRevenue =
    cycles.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0) ?? 0
  const totalCost =
    cycles.reduce((sum, c) => sum + (c.total_input_cost ?? 0), 0) ?? 0
  const net = totalRevenue - totalCost

  const today = new Date().toISOString().split("T")[0]
  const isActive =
    !!season.start_date &&
    !!season.end_date &&
    season.start_date <= today &&
    today <= season.end_date

  const hasEnded = !!season.end_date && season.end_date < today

  let statusLabel = "🔵 Upcoming"
  if (isActive) statusLabel = "🟢 Active"
  else if (hasEnded) statusLabel = "⚫ Completed"

  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 text-sm shadow-sm dark:shadow-gray-950">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-green-900 dark:text-green-300">
              {season.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
              {season.start_date} → {season.end_date}
            </p>
          </div>
          <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[11px] font-medium text-green-800 dark:text-green-400">
            {statusLabel}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 md:grid-cols-4">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Crop cycles
            </p>
            <p className="font-semibold text-green-800 dark:text-green-400">
              {cycles.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Area under crops
            </p>
            <p className="font-semibold text-green-800 dark:text-green-400">
              {totalArea.toFixed(1)} acres
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              P&L (₹)
            </p>
            <p
              className={`font-semibold ${
                net >= 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {net.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Rainfall
            </p>
            <p className="font-semibold text-green-800 dark:text-green-400">
              {season.rainfall_mm != null ? `${season.rainfall_mm} mm` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs">
        <div className="text-[11px] text-gray-500 dark:text-gray-400">
          Year {season.year} · {season.type}
        </div>
        <Link
          href={`/crops/${season.id}`}
          className="inline-flex items-center rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800"
        >
          View season →
        </Link>
      </div>
    </div>
  )
}

