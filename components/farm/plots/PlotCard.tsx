'use client'

import Link from "next/link"

import type { PlotsRow, WaterSourcesRow } from "@/lib/types/database.types"

type PlotWithSources = PlotsRow & {
  water_sources?: WaterSourcesRow[] | null
}

type PlotCardProps = {
  plot: PlotWithSources
}

export function PlotCard({ plot }: PlotCardProps) {
  const waterSources = (plot.water_sources as WaterSourcesRow[] | null) ?? []
  const hasReliableSource = waterSources.some(
    (s) =>
      s.reliability &&
      (s.reliability.toLowerCase().includes("reliable") ||
        s.reliability.toLowerCase().includes("good")),
  )

  const waterLabel =
    waterSources.length === 0
      ? "No sources"
      : hasReliableSource
        ? "Has reliable water"
        : "Water uncertain"

  const waterColor =
    waterSources.length === 0
      ? "bg-gray-100 text-gray-700"
      : hasReliableSource
        ? "bg-green-100 text-green-800"
        : "bg-orange-100 text-orange-800"

  return (
    <Link
      href={`/farm/plots/${plot.id}`}
      className="flex flex-col rounded-xl border bg-white p-4 text-sm shadow-sm transition-all hover:border-green-400 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-green-900">
          {plot.name || "Unnamed plot"}
        </h3>
        <span className="text-xs font-medium text-green-700">
          {plot.area_acres ?? 0} acres
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-600">
        {plot.soil_type || "Soil not set"} ·{" "}
        {plot.irrigation_type || "Irrigation not set"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${waterColor}`}
        >
          {waterLabel}
        </span>
        {plot.ownership && (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-800">
            {plot.ownership}
          </span>
        )}
      </div>
    </Link>
  )
}

