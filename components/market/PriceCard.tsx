'use client'

import { useState } from "react"

import { AddAlertForm } from "@/components/market/AddAlertForm"
import type {
  MarketPricesRow,
  PortfolioItemsRow,
  PriceAlertsRow,
} from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type AlertWithItem = PriceAlertsRow & {
  portfolio_items?: { name: string } | null
}

type Props = {
  item: PortfolioItemsRow
  todayPrice: MarketPricesRow | null
  previousPrice: MarketPricesRow | null
  alerts: AlertWithItem[]
}

export function PriceCard({
  item,
  todayPrice,
  previousPrice,
  alerts,
}: Props) {
  const [showAlertForm, setShowAlertForm] = useState(false)

  const todayModal = todayPrice?.modal_price ?? null
  const prevModal = previousPrice?.modal_price ?? null

  let trendLabel = "No change"
  let trendClass =
    "rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-700"

  if (todayModal != null && prevModal != null) {
    const diff = todayModal - prevModal
    if (diff > 0) {
      trendLabel = `🟢 Up ₹${diff.toFixed(0)} vs yesterday`
      trendClass =
        "rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-800"
    } else if (diff < 0) {
      trendLabel = `🔴 Down ₹${Math.abs(diff).toFixed(
        0,
      )} vs yesterday`
      trendClass =
        "rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-800"
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-3 text-xs shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-green-900">
            {item.name}
          </p>
          {item.local_name && (
            <p className="text-[11px] text-gray-500">
              {item.local_name}
            </p>
          )}
        </div>
        <div className="text-right text-[11px] text-gray-500">
          <p>{todayPrice?.price_date ?? "No date"}</p>
          {todayPrice && (
            <p className="text-[10px]">
              {todayPrice.mandi_name}, {todayPrice.district}
            </p>
          )}
        </div>
      </div>

      {todayModal != null ? (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] text-gray-500">
              Modal price
            </p>
            <p className="text-lg font-bold text-green-800">
              {formatINR(todayModal)} / qtl
            </p>
            <p className="text-[10px] text-gray-500">
              Range {formatINR(todayPrice?.min_price ?? 0)} –{" "}
              {formatINR(todayPrice?.max_price ?? 0)}
            </p>
          </div>
          <span className={trendClass}>{trendLabel}</span>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-2 text-[11px] text-gray-600">
          <p>No price data today — prices typically update by 2pm.</p>
          {previousPrice && (
            <p className="mt-1">
              Last known: {formatINR(previousPrice.modal_price ?? 0)} / qtl on{" "}
              {previousPrice.price_date}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <a
          href={`/market/prices/${encodeURIComponent(
            todayPrice?.commodity ?? item.name,
          )}`}
          className="text-[11px] font-medium text-green-700 hover:underline"
        >
          View history →
        </a>
        <button
          type="button"
          onClick={() => setShowAlertForm((prev) => !prev)}
          className="rounded-full border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-800 hover:bg-green-50"
        >
          {showAlertForm ? "Close alert form" : "Set alert"}
        </button>
      </div>

      {alerts.length > 0 && (
        <p className="text-[10px] text-gray-500">
          {alerts.length} active alert
          {alerts.length > 1 ? "s" : ""} for this crop.
        </p>
      )}

      {showAlertForm && (
        <div className="mt-2 rounded-lg border border-green-100 bg-green-50 p-2">
          <AddAlertForm
            portfolioItems={[item]}
            currentPrice={todayModal}
          />
        </div>
      )}
    </div>
  )
}

