'use client'

import type {
  PortfolioItemsRow,
  SalesRow,
} from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type Props = {
  sale: SalesRow & { portfolio_items: Pick<PortfolioItemsRow, "name"> | null }
}

export function SaleCard({ sale }: Props) {
  const vs = sale.price_vs_market
  let vsLabel = "No market data"
  let vsClass = "bg-gray-50 text-gray-700"

  if (typeof vs === "number") {
    vsLabel = `${vs >= 0 ? "+" : ""}${vs.toFixed(1)}% vs market`
    vsClass =
      vs >= 0
        ? "bg-green-50 text-green-800"
        : "bg-red-50 text-red-700"
  }

  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 text-sm shadow-sm md:flex-row md:items-center">
      <div>
        <p className="font-semibold text-green-900">
          {sale.portfolio_items?.name ?? "Crop"} · {sale.quantity}{" "}
          {sale.unit}
        </p>
        <p className="mt-0.5 text-xs text-gray-600">
          {sale.sale_date} · {formatINR(sale.total_amount ?? 0)} · ₹
          {sale.price_per_unit ?? 0} / {sale.unit}
        </p>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Buyer: {sale.buyer_type}{" "}
          {sale.buyer_name ? `· ${sale.buyer_name}` : ""}{" "}
          {sale.buyer_location ? `· ${sale.buyer_location}` : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 text-xs">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${vsClass}`}
        >
          {vsLabel}
        </span>
      </div>
    </div>
  )
}

