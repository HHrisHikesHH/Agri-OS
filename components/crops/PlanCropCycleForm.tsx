'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { planCropCycle } from "@/app/(app)/crops/actions"
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
  PlotsRow,
  PortfolioItemsRow,
} from "@/lib/types/database.types"
import { getBenchmark } from "@/lib/data/crop-benchmarks"

type Props = {
  seasonId: string
  plots: PlotsRow[]
  portfolioItems: PortfolioItemsRow[]
}

type FormState = {
  error?: string
  success?: boolean
}

export function PlanCropCycleForm({ seasonId, plots, portfolioItems }: Props) {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("")

  const selectedItem =
    portfolioItems.find((p) => p.id === selectedPortfolioId) ?? null
  const benchmark = selectedItem
    ? getBenchmark(selectedItem.name)
    : null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.set("season_id", seasonId)
    setFormState({})

    startTransition(async () => {
      const result = await planCropCycle(formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
      if (result?.cycleId) {
        router.push(`/crops/${seasonId}/${result.cycleId}`)
      } else {
        router.push(`/crops/${seasonId}`)
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formState.error}
        </p>
      )}
      {formState.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          Crop cycle planned! We&apos;ve added standard tasks to your schedule.
        </p>
      )}

      {/* Step 1: What & Where */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          1. What &amp; where
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>
              Crop <span className="text-red-500">*</span>
            </Label>
            <Select
              name="portfolio_item_id"
              onValueChange={setSelectedPortfolioId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" disabled>
                  Select crop
                </SelectItem>
                <optgroup label="Crops" />
                {portfolioItems
                  .filter(
                    (p) => (p.category ?? "").toLowerCase() === "crop",
                  )
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.local_name ? ` (${p.local_name})` : ""}
                    </SelectItem>
                  ))}
                <optgroup label="Horticulture" />
                {portfolioItems
                  .filter(
                    (p) =>
                      (p.category ?? "").toLowerCase() === "horticulture",
                  )
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.local_name ? ` (${p.local_name})` : ""}
                    </SelectItem>
                  ))}
                <optgroup label="Livestock" />
                {portfolioItems
                  .filter(
                    (p) =>
                      (p.category ?? "").toLowerCase() === "livestock",
                  )
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.local_name ? ` (${p.local_name})` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Plot</Label>
            <Select name="plot_id">
              <SelectTrigger>
                <SelectValue placeholder="Select plot (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {plots.map((plot) => (
                  <SelectItem key={plot.id} value={plot.id}>
                    {plot.name} ({plot.area_acres} acres)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="area_acres">
              Area (acres) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="area_acres"
              name="area_acres"
              type="number"
              min={0.1}
              step={0.1}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seed_variety">Seed variety</Label>
            <Input
              id="seed_variety"
              name="seed_variety"
              placeholder="e.g. ICPL 87119, GW 322"
            />
          </div>
        </div>
      </section>

      {/* Step 2: When */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          2. When will you sow?
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sowing_date">
              Sowing date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sowing_date"
              name="sowing_date"
              type="date"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration_days">Expected duration (days)</Label>
            <Input
              id="duration_days"
              name="duration_days"
              type="number"
              min={0}
              defaultValue={selectedItem?.duration_days ?? benchmark?.durationDays ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expected_harvest_date">
              Expected harvest date
            </Label>
            <Input
              id="expected_harvest_date"
              name="expected_harvest_date"
              type="date"
            />
          </div>
        </div>
      </section>

      {/* Step 3: Expectations */}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          3. Expectations
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="expected_yield_qtl">
              Expected yield (quintals)
            </Label>
            <Input
              id="expected_yield_qtl"
              name="expected_yield_qtl"
              type="number"
              min={0}
              step={0.1}
            />
          </div>
          {benchmark && (
            <div className="md:col-span-2">
              <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
                Benchmark for {selectedItem?.name}: yield{" "}
                {benchmark.yieldPerAcre.min}–{benchmark.yieldPerAcre.max}{" "}
                {benchmark.yieldPerAcre.unit}/acre, duration{" "}
                {benchmark.durationDays} days, typical input cost ₹
                {benchmark.typicalInputCostPerAcre}/acre.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Anything special about this cycle – late rains, variety choice, or experiments."
          />
        </div>
      </section>

      <Button
        type="submit"
        className="w-full bg-green-700 text-white hover:bg-green-800 md:w-auto"
        disabled={isPending}
      >
        {isPending ? "Planning..." : "Plan crop cycle"}
      </Button>
    </form>
  )
}

