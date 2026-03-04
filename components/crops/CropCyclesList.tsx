'use client'

import type {
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
  SeasonsRow,
} from "@/lib/types/database.types"

import { CropCycleCard } from "./CropCycleCard"

type CycleWithRelations = CropCyclesRow & {
  plots?: PlotsRow | null
  portfolio_items?: PortfolioItemsRow | null
}

type SeasonWithCycles = SeasonsRow & {
  crop_cycles: CycleWithRelations[]
}

type Props = {
  season: SeasonWithCycles
}

export function CropCyclesList({ season }: Props) {
  const cycles = season.crop_cycles ?? []

  if (cycles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-green-200 bg-green-50/60 p-6 text-sm text-green-900">
        No crop cycles planned for this season yet. Start by planning your first
        crop.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cycles.map((cycle) => (
        <CropCycleCard
          key={cycle.id}
          seasonId={season.id}
          cycle={cycle}
        />
      ))}
    </div>
  )
}

