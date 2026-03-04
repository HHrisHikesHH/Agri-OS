'use client'

import type { AssetsRow } from "@/lib/types/database.types"

type AssetCardProps = {
  asset: AssetsRow
  onEdit: () => void
  onDelete: () => void
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  const icon = getIconForCategory(asset.category)
  const condition = (asset.condition ?? "good").toLowerCase()

  const conditionClass =
    condition === "good"
      ? "bg-green-100 text-green-800"
      : condition === "fair"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800"

  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white p-4 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h3 className="text-sm font-semibold text-green-900">
              {asset.name}
            </h3>
          </div>
          <p className="mt-1 text-xs text-gray-600">{asset.category}</p>
          {asset.purchase_year && (
            <p className="mt-0.5 text-xs text-gray-500">
              Bought in {asset.purchase_year}
            </p>
          )}
          {asset.current_value && (
            <p className="mt-0.5 text-xs text-gray-500">
              Approx value ₹{asset.current_value}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${conditionClass}`}
          >
            Condition: {asset.condition ?? "good"}
          </span>
          {asset.can_rent_out && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">
              Can earn ₹{asset.rental_rate ?? 0}/day
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
          Delete
        </button>
      </div>
    </div>
  )
}

function getIconForCategory(category: string | null): string {
  const cat = (category ?? "").toLowerCase()
  if (cat.includes("vehicle") || cat.includes("tractor")) return "🚜"
  if (cat.includes("storage") || cat.includes("shed")) return "🏚️"
  if (cat.includes("machinery")) return "⚙️"
  if (cat.includes("tool")) return "🔧"
  if (cat.includes("land")) return "🌱"
  return "📦"
}

