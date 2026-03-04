'use client'

import { useMemo, useState, useTransition } from "react"

import {
  addPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItem,
} from "@/app/(app)/farm/actions"
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
import type { PortfolioItemsRow } from "@/lib/types/database.types"

type PortfolioItemFormProps = {
  item?: PortfolioItemsRow
}

type FormState = {
  error?: string
  success?: boolean
}

type Suggestion = {
  name: string
  local_name?: string
  category: string
  sub_category?: string
  typical_season?: string[]
  water_requirement?: string
}

const SUGGESTIONS: Suggestion[] = [
  // Crops
  {
    name: "Tur",
    local_name: "Tur",
    category: "crop",
    sub_category: "pulse",
    typical_season: ["Kharif"],
    water_requirement: "Medium",
  },
  {
    name: "Jowar",
    local_name: "Jowar",
    category: "crop",
    sub_category: "cereal",
    typical_season: ["Kharif", "Rabi"],
    water_requirement: "Low",
  },
  {
    name: "Bajra",
    local_name: "Bajra",
    category: "crop",
    sub_category: "cereal",
    typical_season: ["Kharif"],
    water_requirement: "Low",
  },
  {
    name: "Gehu",
    local_name: "Wheat",
    category: "crop",
    sub_category: "cereal",
    typical_season: ["Rabi"],
    water_requirement: "Medium",
  },
  {
    name: "Chana",
    local_name: "Chana",
    category: "crop",
    sub_category: "pulse",
    typical_season: ["Rabi"],
    water_requirement: "Low",
  },
  {
    name: "Sunflower",
    category: "crop",
    sub_category: "oilseed",
    typical_season: ["Kharif", "Rabi"],
    water_requirement: "Medium",
  },
  {
    name: "Groundnut",
    category: "crop",
    sub_category: "oilseed",
    typical_season: ["Kharif"],
    water_requirement: "Medium",
  },
  {
    name: "Sesame",
    local_name: "Til",
    category: "crop",
    sub_category: "oilseed",
    typical_season: ["Kharif"],
    water_requirement: "Low",
  },
  // Fruits
  {
    name: "Mango",
    category: "horticulture",
    sub_category: "fruit",
    water_requirement: "Medium",
  },
  {
    name: "Guava",
    category: "horticulture",
    sub_category: "fruit",
    water_requirement: "Medium",
  },
  {
    name: "Pomegranate",
    category: "horticulture",
    sub_category: "fruit",
    water_requirement: "Medium",
  },
  {
    name: "Banana",
    category: "horticulture",
    sub_category: "fruit",
    water_requirement: "High",
  },
  // Vegetables
  {
    name: "Tomato",
    category: "crop",
    sub_category: "vegetable",
    typical_season: ["Rabi", "Summer"],
    water_requirement: "High",
  },
  {
    name: "Onion",
    category: "crop",
    sub_category: "vegetable",
    typical_season: ["Rabi"],
    water_requirement: "Medium",
  },
  {
    name: "Chilli",
    category: "crop",
    sub_category: "vegetable",
    typical_season: ["Kharif", "Rabi"],
    water_requirement: "Medium",
  },
]

export function PortfolioItemForm({ item }: PortfolioItemFormProps) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<string>(item?.category ?? "crop")

  const isEdit = Boolean(item)

  const seasonsString = useMemo(
    () => (item?.typical_season ?? []).join(", "),
    [item?.typical_season],
  )

  function applySuggestion(s: Suggestion) {
    const form = document.querySelector(
      "form[data-portfolio-form]",
    ) as HTMLFormElement | null
    if (!form) return

    ;(form.elements.namedItem("name") as HTMLInputElement | null)!.value =
      s.name
    const localNameInput = form.elements.namedItem(
      "local_name",
    ) as HTMLInputElement | null
    if (localNameInput) localNameInput.value = s.local_name ?? ""

    const categorySelect = form.elements.namedItem(
      "category",
    ) as HTMLSelectElement | null
    if (categorySelect) {
      categorySelect.value = s.category
      setCategory(s.category)
    }

    const subCategoryInput = form.elements.namedItem(
      "sub_category",
    ) as HTMLInputElement | null
    if (subCategoryInput) subCategoryInput.value = s.sub_category ?? ""

    const seasonInput = form.elements.namedItem(
      "typical_season",
    ) as HTMLInputElement | null
    if (seasonInput && s.typical_season) {
      seasonInput.value = s.typical_season.join(", ")
    }

    const waterInput = form.elements.namedItem(
      "water_requirement",
    ) as HTMLInputElement | null
    if (waterInput && s.water_requirement) {
      waterInput.value = s.water_requirement
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormState({})

    startTransition(async () => {
      const result = isEdit
        ? await updatePortfolioItem((item as PortfolioItemsRow).id, formData)
        : await addPortfolioItem(formData)

      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
    })
  }

  async function handleDelete() {
    if (!item) return
    if (!window.confirm("Remove this portfolio item?")) return
    setFormState({})
    startTransition(async () => {
      const result = await deletePortfolioItem(item.id)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 text-sm"
      data-portfolio-form
    >
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formState.error}
        </p>
      )}
      {formState.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          Saved.
        </p>
      )}

      <div className="space-y-2">
        <Label className="text-xs text-gray-700">
          Quick-add popular items for Kalaburagi
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-800 hover:bg-green-100"
              onClick={() => applySuggestion(s)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={item?.name ?? ""}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="local_name">Local name</Label>
          <Input
            id="local_name"
            name="local_name"
            defaultValue={item?.local_name ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            name="category"
            defaultValue={item?.category ?? "crop"}
            onValueChange={setCategory}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crop">Crop</SelectItem>
              <SelectItem value="horticulture">Horticulture</SelectItem>
              <SelectItem value="livestock">Livestock</SelectItem>
              <SelectItem value="processing">Processing unit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub_category">Sub-category</Label>
          <Input
            id="sub_category"
            name="sub_category"
            defaultValue={item?.sub_category ?? ""}
            placeholder={
              category === "crop"
                ? "pulse / cereal / oilseed / vegetable"
                : category === "horticulture"
                  ? "fruit / plantation"
                  : category === "livestock"
                    ? "cattle / goat / poultry"
                    : ""
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="water_requirement">Water requirement</Label>
          <Input
            id="water_requirement"
            name="water_requirement"
            defaultValue={item?.water_requirement ?? ""}
            placeholder="Low / Medium / High"
          />
        </div>
      </div>

      {/* Category specific fields */}
      {category === "crop" && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="typical_season">Typical season(s)</Label>
            <Input
              id="typical_season"
              name="typical_season"
              defaultValue={seasonsString}
              placeholder="e.g. Kharif, Rabi"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration_days">Crop duration (days)</Label>
            <Input
              id="duration_days"
              name="duration_days"
              type="number"
              min={0}
              defaultValue={item?.duration_days ?? ""}
            />
          </div>
        </div>
      )}

      {category === "horticulture" && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="tree_count">Number of trees</Label>
            <Input
              id="tree_count"
              name="tree_count"
              type="number"
              min={0}
              defaultValue={item?.tree_count ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tree_age_years">Tree age (years)</Label>
            <Input
              id="tree_age_years"
              name="tree_age_years"
              type="number"
              min={0}
              defaultValue={item?.tree_age_years ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bearing?</Label>
            <Select
              name="bearing_status"
              defaultValue={item?.bearing_status ? "true" : "false"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Not yet</SelectItem>
                <SelectItem value="true">Bearing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {category === "livestock" && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tree_count">Count</Label>
            <Input
              id="tree_count"
              name="tree_count"
              type="number"
              min={0}
              defaultValue={item?.tree_count ?? ""}
            />
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price_unit">Price unit</Label>
          <Input
            id="price_unit"
            name="price_unit"
            defaultValue={item?.price_unit ?? "quintal"}
            placeholder="quintal / kg / piece / dozen"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Variety, special qualities, typical markets..."
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-[11px] text-gray-500">
          Fields marked <span className="text-red-500">*</span> are required.
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={isPending}
              onClick={handleDelete}
            >
              Remove
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="bg-green-700 text-white hover:bg-green-800"
            disabled={isPending}
          >
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Add item"}
          </Button>
        </div>
      </div>
    </form>
  )
}

