'use client'

import type {
  PlotsRow,
  WaterSourcesRow,
} from "@/lib/types/database.types"

import { PlotCard } from "./PlotCard"

type PlotWithSources = PlotsRow & {
  water_sources?: WaterSourcesRow[] | null
}

type PlotsListProps = {
  plots: PlotWithSources[]
}

export function PlotsList({ plots }: PlotsListProps) {
  if (!plots || plots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-green-200 bg-green-50/60 p-6 text-sm text-green-900">
        You haven&apos;t mapped any plots yet. Start by adding your first plot so
        Agri OS can reason per field.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plots.map((plot) => (
        <PlotCard key={plot.id} plot={plot} />
      ))}
    </div>
  )
}

