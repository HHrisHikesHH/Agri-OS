"use client"

import { useState } from "react"

import { AddAlertForm } from "@/components/market/AddAlertForm"
import { AnimatedINR } from "@/components/ui/AnimatedNumber"
import { PriceTickerCard } from "@/components/market/PriceTickerCard"
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

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-3 text-xs shadow-sm dark:shadow-gray-950">
      <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-300">
              {item.name}
            </p>
            {item.local_name && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {item.local_name}
              </p>
            )}
          </div>
          <div className="text-right text-[11px] text-gray-500 dark:text-gray-400 font-mono">
            <p>{todayPrice?.price_date ?? "No date"}</p>
            {todayPrice && (
              <p className="text-[10px]">
                {todayPrice.mandi_name}, {todayPrice.district}
              </p>
            )}
          </div>
      </div>

      {todayModal != null ? (
        <PriceTickerCard
          commodity={item.name}
          price={todayModal}
          previousPrice={prevModal}
          mandi={todayPrice?.mandi_name}
          date={todayPrice?.price_date}
        />
      ) : (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 text-[11px] text-gray-600 dark:text-gray-400">
          <p>No price data today — prices typically update by 2pm.</p>
          {previousPrice && (
            <p className="mt-1">
              Last known:{" "}
              <AnimatedINR
                value={previousPrice.modal_price ?? 0}
                className="text-[11px]"
              />{" "}
              / qtl on <span className="font-mono">{previousPrice.price_date}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 dark:border-gray-800 pt-2">
        <a
          href={`/market/prices/${encodeURIComponent(
            todayPrice?.commodity ?? item.name,
          )}`}
          className="text-[11px] font-medium text-green-700 dark:text-green-400 hover:underline"
        >
          View history →
        </a>
        <button
          type="button"
          onClick={() => setShowAlertForm((prev) => !prev)}
          className="rounded-full border border-green-200 dark:border-green-900 px-2 py-0.5 text-[11px] font-medium text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
        >
          {showAlertForm ? "Close alert form" : "Set alert"}
        </button>
      </div>

      {alerts.length > 0 && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          {alerts.length} active alert
          {alerts.length > 1 ? "s" : ""} for this crop.
        </p>
      )}

      {showAlertForm && (
        <div className="mt-2 rounded-lg border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-2">
          <AddAlertForm
            portfolioItems={[item]}
            currentPrice={todayModal}
          />
        </div>
      )}
    </div>
  )
}

