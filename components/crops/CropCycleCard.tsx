'use client'

import Link from "next/link"

import type {
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
} from "@/lib/types/database.types"

import { CropCycleStatusBadge } from "./CropCycleStatusBadge"

type CycleWithRelations = CropCyclesRow & {
  plots?: PlotsRow | null
  portfolio_items?: PortfolioItemsRow | null
}

type Props = {
  seasonId: string
  cycle: CycleWithRelations
}

export function CropCycleCard({ seasonId, cycle }: Props) {
  const plot = cycle.plots
  const crop = cycle.portfolio_items

  const sowing = cycle.sowing_date
  const expectedHarvest = cycle.expected_harvest_date
  const actualHarvest = cycle.actual_harvest_date

  const expectedYield = cycle.expected_yield_qtl
  const actualYield = cycle.actual_yield_qtl

  const inputCost = cycle.total_input_cost ?? 0
  const netProfit = (cycle.net_profit ?? 0) || 0

  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white p-4 text-sm shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-green-900">
              {crop?.name ?? "Crop"}
            </h3>
            {crop?.local_name && (
              <p className="text-xs text-gray-600">{crop.local_name}</p>
            )}
            {plot && (
              <p className="mt-0.5 text-xs text-gray-500">
                Plot: {plot.name} ({plot.area_acres} acres)
              </p>
            )}
          </div>
          <CropCycleStatusBadge status={cycle.status} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
          <div>
            <p className="text-[11px] text-gray-500">Area</p>
            <p className="font-semibold text-green-800">
              {cycle.area_acres ?? 0} acres
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Sowing → Harvest</p>
            <p className="font-semibold text-green-800">
              {sowing || "—"} → {actualHarvest || expectedHarvest || "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Yield (qtl)</p>
            <p className="font-semibold text-green-800">
              {actualYield != null
                ? `${actualYield} actual`
                : expectedYield != null
                  ? `${expectedYield} expected`
                  : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Input cost</p>
            <p className="font-semibold text-green-800">₹{inputCost}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <p
          className={`text-[11px] ${
            netProfit >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          Net: ₹{netProfit.toFixed(0)}
        </p>
        <Link
          href={`/crops/${seasonId}/${cycle.id}`}
          className="inline-flex items-center rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800"
        >
          View details →
        </Link>
      </div>
    </div>
  )
}

