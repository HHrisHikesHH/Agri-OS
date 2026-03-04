'use client'

import type { PortfolioItemsRow } from "@/lib/types/database.types"

type PortfolioItemCardProps = {
  item: PortfolioItemsRow
  onEdit: () => void
  onDelete: () => void
}

export function PortfolioItemCard({
  item,
  onEdit,
  onDelete,
}: PortfolioItemCardProps) {
  const icon = getIconForCategory(item.category)
  const seasons = item.typical_season ?? []
  const categoryLabel = (item.category ?? "").toLowerCase()

  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white p-4 text-sm shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-green-900">
                {item.name}
              </h3>
              {item.local_name && (
                <p className="text-xs text-gray-600">{item.local_name}</p>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-600">
          {item.category} {item.sub_category ? `· ${item.sub_category}` : ""}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {seasons.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-800"
            >
              {s}
            </span>
          ))}
          {item.water_requirement && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">
              Water: {item.water_requirement}
            </span>
          )}
          {categoryLabel === "horticulture" && item.tree_count != null && (
            <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-800">
              {item.tree_count} trees
            </span>
          )}
          {categoryLabel === "horticulture" &&
            item.bearing_status != null && (
              <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] text-purple-800">
                {item.bearing_status ? "✅ Bearing" : "🕐 Not yet bearing"}
              </span>
            )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          className="rounded-md border border-green-200 px-2 py-1 text-green-800 hover:bg-green-50"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          type="button"
          className="rounded-md border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function getIconForCategory(category: string | null): string {
  const cat = (category ?? "").toLowerCase()
  if (cat === "crop") return "🌾"
  if (cat === "horticulture") return "🌳"
  if (cat === "livestock") return "🐄"
  if (cat.includes("processing")) return "🏭"
  return "🧺"
}

