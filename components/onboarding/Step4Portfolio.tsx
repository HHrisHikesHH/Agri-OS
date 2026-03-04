'use client'

import { useMemo } from "react"

import type { OnboardingData } from "@/app/(app)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

type PortfolioItemInput = OnboardingData["portfolio"][number]

type Step4Props = {
  portfolio: PortfolioItemInput[]
  onChange: (portfolio: PortfolioItemInput[]) => void
}

const SUGGESTIONS: PortfolioItemInput[] = [
  {
    name: "Tur (Pigeon pea)",
    local_name: "Tur",
    category: "crop",
    sub_category: "pulse",
    water_requirement: "medium",
    typical_season: ["kharif"],
  },
  {
    name: "Jowar (Sorghum)",
    local_name: "Jowar",
    category: "crop",
    sub_category: "cereal",
    water_requirement: "low",
    typical_season: ["kharif", "rabi"],
  },
  {
    name: "Bajra (Pearl millet)",
    local_name: "Bajra",
    category: "crop",
    sub_category: "cereal",
    water_requirement: "low",
    typical_season: ["kharif"],
  },
  {
    name: "Wheat",
    category: "crop",
    sub_category: "cereal",
    water_requirement: "medium",
    typical_season: ["rabi"],
  },
  {
    name: "Chana (Bengal gram)",
    local_name: "Chana",
    category: "crop",
    sub_category: "pulse",
    water_requirement: "low",
    typical_season: ["rabi"],
  },
  {
    name: "Mango",
    category: "tree",
    sub_category: "fruit",
    water_requirement: "medium",
  },
  {
    name: "Guava",
    category: "tree",
    sub_category: "fruit",
    water_requirement: "medium",
  },
]

export function Step4Portfolio({ portfolio, onChange }: Step4Props) {
  const remainingSuggestions = useMemo(
    () =>
      SUGGESTIONS.filter(
        (s) => !portfolio.some((p) => p.name.toLowerCase() === s.name.toLowerCase()),
      ),
    [portfolio],
  )

  function addSuggestion(item: PortfolioItemInput) {
    onChange([...portfolio, item])
  }

  function updateItem(index: number, partial: Partial<PortfolioItemInput>) {
    const next = portfolio.map((item, i) =>
      i === index ? { ...item, ...partial } : item,
    )
    onChange(next)
  }

  function removeItem(index: number) {
    const next = portfolio.filter((_, i) => i !== index)
    onChange(next)
  }

  function addEmpty() {
    onChange([
      ...portfolio,
      {
        name: "",
        category: "crop",
      },
    ])
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-green-800">
        Add the main crops, trees, or other farm enterprises you are already
        running. This helps Agri OS understand your base portfolio.
      </p>

      <div className="space-y-2">
        <Label>Quick add for Kalaburagi region</Label>
        <div className="flex flex-wrap gap-2">
          {remainingSuggestions.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => addSuggestion(item)}
              className="focus-visible:outline-none"
            >
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                {item.name}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {portfolio.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-green-100 bg-green-50/60 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-green-900">
                Item {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-xs text-red-700 hover:bg-red-50"
                onClick={() => removeItem(index)}
              >
                Remove
              </Button>
            </div>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                  placeholder="e.g. Tur"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Local name (optional)</Label>
                <Input
                  value={item.local_name ?? ""}
                  onChange={(e) =>
                    updateItem(index, { local_name: e.target.value })
                  }
                  placeholder="e.g. Togari"
                />
              </div>
            </div>

            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={item.category}
                  onChange={(e) =>
                    updateItem(index, { category: e.target.value })
                  }
                  placeholder="crop / tree / livestock / other"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sub-category</Label>
                <Input
                  value={item.sub_category ?? ""}
                  onChange={(e) =>
                    updateItem(index, { sub_category: e.target.value })
                  }
                  placeholder="pulse / cereal / fruit / etc."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Water need (low/medium/high)</Label>
                <Input
                  value={item.water_requirement ?? ""}
                  onChange={(e) =>
                    updateItem(index, { water_requirement: e.target.value })
                  }
                  placeholder="e.g. low"
                />
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <Label>Typical seasons (optional)</Label>
              <Textarea
                value={item.typical_season?.join(", ") ?? ""}
                onChange={(e) =>
                  updateItem(index, {
                    typical_season: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. kharif, rabi"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="border-green-300 text-green-800 hover:bg-green-50"
        onClick={addEmpty}
      >
        Add another item
      </Button>
    </div>
  )
}

