'use client'

import { useTransition } from "react"

import {
  updateCropCycleStatus,
  updateCropCycle,
} from "@/app/(app)/crops/actions"
import { AddSaleForm } from "@/components/finances/AddSaleForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  CropCycleTasksRow,
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
  SeasonsRow,
} from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

import { AddTaskForm } from "./AddTaskForm"
import { CropCycleStatusBadge } from "./CropCycleStatusBadge"
import { TaskList } from "./TaskList"

type CycleWithRelations = CropCyclesRow & {
  plots?: PlotsRow | null
  portfolio_items?: PortfolioItemsRow | null
  seasons?: SeasonsRow | null
  crop_cycle_tasks?: CropCycleTasksRow[]
}

type Props = {
  cycle: CycleWithRelations
}

export function CropCycleDetail({ cycle }: Props) {
  const [isPending, startTransition] = useTransition()

  const crop = cycle.portfolio_items
  const plot = cycle.plots
  const season = cycle.seasons
  const tasks = cycle.crop_cycle_tasks ?? []

  const sowingDate = cycle.sowing_date
  const expectedHarvest = cycle.expected_harvest_date
  const actualHarvest = cycle.actual_harvest_date

  const today = new Date().toISOString().split("T")[0]

  const totalCost = cycle.total_input_cost ?? 0
  const totalRevenue = cycle.total_revenue ?? 0
  const net = (cycle.net_profit ?? totalRevenue - totalCost) || 0

  const expectedYield = cycle.expected_yield_qtl
  const actualYield = cycle.actual_yield_qtl

  const daysToHarvest =
    expectedHarvest && today <= expectedHarvest
      ? diffDays(today, expectedHarvest)
      : null

  const overdueTasksCount = tasks.filter(
    (t) => t.status === "pending" && t.scheduled_date && t.scheduled_date < today,
  ).length

  function handleStatusChange(newStatus: string) {
    startTransition(() => {
      updateCropCycleStatus(cycle.id, newStatus)
    })
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => {
      updateCropCycle(cycle.id, formData)
    })
  }

  return (
    <div className="space-y-6">
      {/* Section 1 — header */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-green-800">
              {crop?.name ?? "Crop cycle"}
            </h1>
            {crop?.local_name && (
              <p className="text-sm text-gray-600">{crop.local_name}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {season && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-800">
                  {season.name}
                </span>
              )}
              {plot && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-800">
                  Plot: {plot.name}
                </span>
              )}
              {crop?.water_requirement && (
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-800">
                  Water: {crop.water_requirement}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs">
            <CropCycleStatusBadge status={cycle.status} />
            <Select
              defaultValue={cycle.status ?? "planned"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="sowing">Sowing</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="harvested">Harvested</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 text-xs text-gray-700 md:grid-cols-4">
          <div>
            <p className="text-[11px] text-gray-500">Area</p>
            <p className="font-semibold text-green-800">
              {cycle.area_acres ?? 0} acres
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Sowing date</p>
            <p className="font-semibold text-green-800">
              {sowingDate ?? "Not set"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">
              Expected &amp; actual harvest
            </p>
            <p className="font-semibold text-green-800">
              {expectedHarvest ?? "—"} / {actualHarvest ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Expected yield</p>
            <p className="font-semibold text-green-800">
              {actualYield != null
                ? `${actualYield} qtl actual`
                : expectedYield != null
                  ? `${expectedYield} qtl expected`
                  : "Not set"}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — timeline */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">Timeline</h2>
        <Timeline
          sowingDate={sowingDate}
          expectedHarvest={expectedHarvest}
          actualHarvest={actualHarvest}
          status={cycle.status}
        />
        {daysToHarvest != null && daysToHarvest >= 0 && (
          <p className="text-xs text-gray-700">
            {daysToHarvest} days remaining to expected harvest.
          </p>
        )}
        {expectedHarvest && expectedHarvest < today && !actualHarvest && (
          <p className="text-xs text-red-700">
            Harvest is overdue based on expected date.
          </p>
        )}
      </section>

      {/* Section 3 — tasks */}
      <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-green-800">Tasks</h2>
          {overdueTasksCount > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
              ⚠ {overdueTasksCount} task
              {overdueTasksCount > 1 ? "s" : ""} overdue
            </span>
          )}
        </div>
        <TaskList tasks={tasks} cycleId={cycle.id} />
        <div className="mt-4 border-t border-green-100 pt-3">
          <h3 className="mb-2 text-xs font-semibold text-green-800">
            + Add custom task
          </h3>
          <AddTaskForm cycleId={cycle.id} />
        </div>
      </section>

      {/* Section 4 — financial summary */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          Financial summary
        </h2>
        <div className="grid gap-3 text-xs text-gray-700 md:grid-cols-4">
          <div>
            <p className="text-[11px] text-gray-500">Input cost so far</p>
            <p className="font-semibold text-green-800">
              {formatINR(totalCost)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Revenue (logged)</p>
            <p className="font-semibold text-green-800">
              {formatINR(totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Net profit so far</p>
            <p
              className={`font-semibold ${
                net >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatINR(net)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Expected at harvest</p>
            <p className="font-semibold text-green-800">
              {expectedYield && crop
                ? `~${expectedYield} qtl × price → estimate in Week 4`
                : "Set expected yield to see estimates"}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-green-100 bg-green-50 p-3">
          <p className="mb-2 text-[11px] font-semibold text-green-800">
            Log a sale for this crop
          </p>
          <AddSaleForm
            portfolioItems={crop ? [crop] : []}
            cycles={[
              {
                id: cycle.id,
                status: cycle.status ?? "planned",
                area_acres: cycle.area_acres ?? 0,
                portfolio_items: crop ? { name: crop.name } : null,
              },
            ]}
            defaultPortfolioItemId={crop?.id}
            defaultCycleId={cycle.id}
          />
        </div>
      </section>

      {/* Section 5 — edit panel */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          Edit key details
        </h2>
        <form
          className="grid gap-3 text-xs md:grid-cols-4"
          onSubmit={handleEditSubmit}
        >
          <div className="space-y-1.5">
            <Label htmlFor="sowing_date_edit">Sowing date</Label>
            <Input
              id="sowing_date_edit"
              name="sowing_date"
              type="date"
              defaultValue={sowingDate ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expected_harvest_edit">
              Expected harvest date
            </Label>
            <Input
              id="expected_harvest_edit"
              name="expected_harvest_date"
              type="date"
              defaultValue={expectedHarvest ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actual_harvest_edit">Actual harvest date</Label>
            <Input
              id="actual_harvest_edit"
              name="actual_harvest_date"
              type="date"
              defaultValue={actualHarvest ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actual_yield_edit">Actual yield (qtl)</Label>
            <Input
              id="actual_yield_edit"
              name="actual_yield_qtl"
              type="number"
              min={0}
              step={0.1}
              defaultValue={actualYield ?? ""}
            />
          </div>
          <div className="space-y-1.5 md:col-span-4">
            <Label htmlFor="notes_edit">Notes</Label>
            <Textarea
              id="notes_edit"
              name="notes"
              rows={3}
              defaultValue={cycle.notes ?? ""}
              placeholder="How did this season go? Any learnings or surprises?"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button
              type="submit"
              size="sm"
              className="bg-green-700 text-white hover:bg-green-800"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Timeline({
  sowingDate,
  expectedHarvest,
  actualHarvest,
  status,
}: {
  sowingDate: string | null
  expectedHarvest: string | null
  actualHarvest: string | null
  status: string | null
}) {
  const today = new Date().toISOString().split("T")[0]
  const start = sowingDate
  const end = actualHarvest || expectedHarvest

  let progress = 0
  if (start && end && start <= today && today <= end) {
    const total = diffDays(start, end)
    const elapsed = diffDays(start, today)
    progress = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0
  } else if (end && today > end) {
    progress = 100
  }

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between text-[11px] text-gray-600">
        <span>Sowing</span>
        <span>Growing</span>
        <span>Harvest</span>
        <span>Sold</span>
      </div>
      <div className="relative mt-1 h-2 rounded-full bg-green-100">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-green-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-600">
        <span>{sowingDate ?? "—"}</span>
        <span className="text-gray-400">
          Status: {(status ?? "planned").toUpperCase()}
        </span>
        <span>{expectedHarvest ?? "—"}</span>
        <span>{actualHarvest ?? "—"}</span>
      </div>
    </div>
  )
}

function diffDays(from: string, to: string): number {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

