'use client'

import { useMemo, useState, useTransition } from "react"

import { addSeason } from "@/app/(app)/crops/actions"
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
import type { SeasonsRow } from "@/lib/types/database.types"

import { SeasonCard } from "./SeasonCard"

type SeasonsOverviewProps = {
  seasons: SeasonsRow[]
}

type FormState = {
  error?: string
  success?: boolean
}

export function SeasonsOverview({ seasons }: SeasonsOverviewProps) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().split("T")[0]

  const [activeSeasons, pastSeasons] = useMemo(() => {
    const active: SeasonsRow[] = []
    const past: SeasonsRow[] = []
    seasons.forEach((s) => {
      if (s.start_date && s.end_date) {
        if (s.end_date < today) past.push(s)
        else active.push(s)
      } else {
        past.push(s)
      }
    })
    return [active, past]
  }, [seasons, today])

  function handleAddSeason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormState({})

    startTransition(async () => {
      const result = await addSeason(formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
      ;(event.currentTarget as HTMLFormElement).reset()
    })
  }

  function handleTypeChange(
    form: HTMLFormElement,
    type: string,
    year: string,
  ) {
    const nameInput = form.elements.namedItem("name") as HTMLInputElement | null
    if (!nameInput) return
    const safeYear = year || new Date().getFullYear().toString()
    nameInput.value = `${capitalize(type)} ${safeYear}`
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-green-800">
          Current & upcoming seasons
        </h2>
        {activeSeasons.length === 0 ? (
          <p className="rounded-xl border border-dashed border-green-200 bg-green-50/60 p-4 text-sm text-green-900">
            No active seasons yet. Add Kharif or Rabi to start planning crop
            cycles.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeSeasons.map((s) => (
              <SeasonCard key={s.id} season={s as SeasonsRow} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-green-800">Past seasons</h2>
        {pastSeasons.length === 0 ? (
          <p className="text-xs text-gray-500">
            Once seasons end, they will appear here for historical analysis.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pastSeasons.map((s) => (
              <SeasonCard key={s.id} season={s as SeasonsRow} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          Add new season
        </h2>

        {formState.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {formState.error}
          </p>
        )}
        {formState.success && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
            Season added.
          </p>
        )}

        <form
          className="mt-2 grid gap-3 md:grid-cols-4"
          onSubmit={handleAddSeason}
          id="add-season-form"
        >
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              name="type"
              defaultValue="kharif"
              onValueChange={(value) => {
                const form = document.getElementById(
                  "add-season-form",
                ) as HTMLFormElement | null
                if (!form) return
                const yearInput = form.elements.namedItem(
                  "year",
                ) as HTMLInputElement | null
                handleTypeChange(form, value, yearInput?.value ?? "")
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kharif">Kharif</SelectItem>
                <SelectItem value="rabi">Rabi</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="perennial">Perennial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min={2000}
              max={2100}
              defaultValue={new Date().getFullYear()}
              onChange={(e) => {
                const form = document.getElementById(
                  "add-season-form",
                ) as HTMLFormElement | null
                if (!form) return
                const typeValue =
                  (form.elements.namedItem("type") as HTMLSelectElement | null)
                    ?.value ?? "kharif"
                handleTypeChange(form, typeValue, e.target.value)
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Kharif 2026"
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={1}
              className="h-9 resize-none"
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-gray-700">
              Date range (optional)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="start_date"
                type="date"
              />
              <Input
                name="end_date"
                type="date"
              />
            </div>
          </div>
          <div className="flex items-end justify-end md:col-span-2">
            <Button
              type="submit"
              size="sm"
              className="bg-green-700 text-white hover:bg-green-800"
              disabled={isPending}
            >
              {isPending ? "Adding..." : "Add season"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function capitalize(value: string) {
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1)
}

