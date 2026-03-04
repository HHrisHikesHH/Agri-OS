'use client'

import { useState } from "react"

import type { PortfolioItemsRow } from "@/lib/types/database.types"

import { PortfolioItemCard } from "./PortfolioItemCard"
import { PortfolioItemForm } from "./PortfolioItemForm"

type PortfolioListProps = {
  items: PortfolioItemsRow[]
}

export function PortfolioList({ items }: PortfolioListProps) {
  const [selected, setSelected] = useState<PortfolioItemsRow | undefined>(
    undefined,
  )

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-green-200 bg-green-50/60 p-6 text-sm text-green-900">
            No crops or trees recorded yet. Add what you grow so Agri OS can
            reason about seasons, risk and prices.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onEdit={() => setSelected(item)}
                onDelete={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          {selected ? "Edit portfolio item" : "Add portfolio item"}
        </h2>
        <PortfolioItemForm item={selected} />
      </section>
    </div>
  )
}

