'use client'

import { useState } from "react"

import type { AssetsRow } from "@/lib/types/database.types"

import { AssetCard } from "./AssetCard"
import { AssetForm } from "./AssetForm"

type AssetsListProps = {
  assets: AssetsRow[]
}

export function AssetsList({ assets }: AssetsListProps) {
  const [selected, setSelected] = useState<AssetsRow | undefined>(undefined)

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
      <section className="space-y-3">
        {assets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-green-200 bg-green-50/60 p-6 text-sm text-green-900">
            No assets recorded yet. Add your tractor, storage shed, and key
            machinery so Agri OS understands your capacity.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={() => setSelected(asset)}
                onDelete={() => setSelected(asset)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          {selected ? "Edit asset" : "Add asset"}
        </h2>
        <AssetForm asset={selected} />
      </section>
    </div>
  )
}

