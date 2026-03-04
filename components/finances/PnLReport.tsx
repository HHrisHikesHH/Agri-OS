'use client'

import { useMemo } from "react"

import type {
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
  SeasonsRow,
} from "@/lib/types/database.types"
import { getBenchmark } from "@/lib/data/crop-benchmarks"
import { formatINR, profitColor } from "@/lib/utils/currency"

type CycleWithJoins = CropCyclesRow & {
  portfolio_items: Pick<PortfolioItemsRow, "name" | "category"> | null
  plots: Pick<PlotsRow, "name"> | null
  seasons: Pick<SeasonsRow, "id" | "name" | "type" | "year"> | null
}

type Props = {
  cycles: CycleWithJoins[]
}

export function PnLReport({ cycles }: Props) {
  const overall = useMemo(() => {
    const totalRevenue =
      cycles.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0) ?? 0
    const totalCost =
      cycles.reduce((sum, c) => sum + (c.total_input_cost ?? 0), 0) ?? 0
    const netProfit = totalRevenue - totalCost

    let bestCrop: string | null = null
    let bestPerAcre = -Infinity
    cycles.forEach((c) => {
      if (
        c.profit_per_acre != null &&
        c.profit_per_acre > bestPerAcre &&
        c.portfolio_items?.name
      ) {
        bestPerAcre = c.profit_per_acre
        bestCrop = c.portfolio_items.name
      }
    })

    return { totalRevenue, totalCost, netProfit, bestCrop, bestPerAcre }
  }, [cycles])

  const bySeason = useMemo(() => {
    const map = new Map<string, CycleWithJoins[]>()
    cycles.forEach((c) => {
      const key = c.seasons
        ? `${c.seasons.id}`
        : "no-season"
      const arr = map.get(key) ?? []
      arr.push(c)
      map.set(key, arr)
    })
    return map
  }, [cycles])

  return (
    <div className="space-y-6 text-xs">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          All time farm P&amp;L
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <SummaryItem label="Total revenue" value={overall.totalRevenue} />
          <SummaryItem label="Total costs" value={overall.totalCost} />
          <SummaryItem label="Net profit" value={overall.netProfit} />
          <div>
            <p className="text-[11px] text-gray-500">Best crop (₹/acre)</p>
            {overall.bestCrop ? (
              <p className="mt-1 text-sm font-semibold text-green-800">
                {overall.bestCrop} ({formatINR(overall.bestPerAcre)})
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-400">Not enough data</p>
            )}
          </div>
        </div>
      </section>

      {/* Per-season breakdown */}
      <section className="space-y-4">
        {Array.from(bySeason.entries()).map(([seasonKey, seasonCycles]) => {
          const season = seasonCycles[0]?.seasons
          return (
            <div
              key={seasonKey}
              className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {season
                      ? `${season.name ?? `${season.type} ${season.year}`}`
                      : "Unassigned season"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Crops:{" "}
                    {Array.from(
                      new Set(
                        seasonCycles
                          .map((c) => c.portfolio_items?.name)
                          .filter(Boolean) as string[],
                      ),
                    ).join(", ") || "—"}
                  </p>
                </div>
                <SeasonSummary cycles={seasonCycles} />
              </div>
              <CycleTable cycles={seasonCycles} />
            </div>
          )
        })}
        {cycles.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">
            No harvested or closed crop cycles yet.
          </p>
        )}
      </section>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold ${profitColor(value)}`}
      >
        {formatINR(value)}
      </p>
    </div>
  )
}

function SeasonSummary({ cycles }: { cycles: CycleWithJoins[] }) {
  const totalRevenue =
    cycles.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0) ?? 0
  const totalCost =
    cycles.reduce((sum, c) => sum + (c.total_input_cost ?? 0), 0) ?? 0
  const net = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? (net / totalRevenue) * 100 : 0

  let bestCycle: CycleWithJoins | null = null
  cycles.forEach((c) => {
    if (
      c.profit_per_acre != null &&
      (!bestCycle || c.profit_per_acre > (bestCycle.profit_per_acre ?? 0))
    ) {
      bestCycle = c
    }
  })

  return (
    <div className="rounded-lg border bg-gray-50 px-3 py-2 text-right">
      <p className="text-[11px] text-gray-500">
        Revenue {formatINR(totalRevenue)} · Cost {formatINR(totalCost)}
      </p>
      <p className={`text-xs font-semibold ${profitColor(net)}`}>
        Net {formatINR(net)} ({margin.toFixed(1)}% margin)
      </p>
      {bestCycle && (
        <p className="mt-0.5 text-[11px] text-gray-600">
          Best: {bestCycle.portfolio_items?.name} (
          {formatINR(bestCycle.profit_per_acre ?? 0)}/acre)
        </p>
      )}
    </div>
  )
}

function CycleTable({ cycles }: { cycles: CycleWithJoins[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border text-[11px]">
      <table className="min-w-full table-fixed border-collapse">
        <thead className="bg-green-50 text-left text-[11px] text-gray-600">
          <tr>
            <th className="px-3 py-2">Crop</th>
            <th className="px-3 py-2">Plot</th>
            <th className="px-3 py-2">Area</th>
            <th className="px-3 py-2 text-right">Revenue</th>
            <th className="px-3 py-2 text-right">Cost</th>
            <th className="px-3 py-2 text-right">Net profit</th>
            <th className="px-3 py-2 text-right">₹ / acre</th>
            <th className="px-3 py-2 text-right">vs benchmark</th>
          </tr>
        </thead>
        <tbody>
          {cycles.map((c) => {
            const cropName = c.portfolio_items?.name ?? "Crop"
            const profitPerAcre = c.profit_per_acre ?? 0
            const benchmark = getBenchmark(cropName)
            let vsBenchLabel = "—"
            let vsBenchClass = "text-gray-500"

            if (benchmark && profitPerAcre !== 0) {
              const approx =
                ((benchmark.yieldPerAcre.min +
                  benchmark.yieldPerAcre.max) /
                  2) *
                benchmark.typicalInputCostPerAcre // heuristic; profit baseline
              const diff = profitPerAcre - approx
              const pct = (diff / (approx || 1)) * 100
              vsBenchLabel = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
              vsBenchClass =
                pct >= 0 ? "text-green-700" : "text-red-700"
            }

            return (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-3 py-2">
                  <span className="font-semibold text-gray-800">
                    {cropName}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {c.plots?.name ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {c.area_acres ?? 0} ac
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {formatINR(c.total_revenue ?? 0)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {formatINR(c.total_input_cost ?? 0)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-semibold ${profitColor(
                    c.net_profit ?? 0,
                  )}`}
                >
                  {formatINR(c.net_profit ?? 0)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {formatINR(profitPerAcre)}
                </td>
                <td className={`px-3 py-2 text-right ${vsBenchClass}`}>
                  {vsBenchLabel}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

