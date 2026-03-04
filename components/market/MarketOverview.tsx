'use client'

import type {
  MarketPricesRow,
  PortfolioItemsRow,
  PriceAlertsRow,
} from "@/lib/types/database.types"
import { getCommodityName } from "@/lib/api/agmarknet"

import { PriceCard } from "./PriceCard"

type AlertWithItem = PriceAlertsRow & {
  portfolio_items?: { name: string } | null
}

type Props = {
  portfolioItems: PortfolioItemsRow[]
  prices: MarketPricesRow[]
  alerts: AlertWithItem[]
  today: string
}

export function MarketOverview({
  portfolioItems,
  prices,
  alerts,
  today,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {portfolioItems.map((item) => {
        const commodity = getCommodityName(item.name)
        const relevantPrices = prices.filter(
          (p) =>
            p.commodity.toLowerCase() === commodity.toLowerCase(),
        )

        let todayRow: MarketPricesRow | null = null
        let yesterdayRow: MarketPricesRow | null = null

        relevantPrices.forEach((p) => {
          if (p.price_date === today) {
            if (
              !todayRow ||
              (p.modal_price ?? 0) >
                (todayRow.modal_price ?? 0)
            ) {
              todayRow = p
            }
          } else if (p.price_date < today) {
            if (!yesterdayRow || p.price_date > yesterdayRow.price_date) {
              yesterdayRow = p
            }
          }
        })

        const itemAlerts = alerts.filter(
          (a) => a.portfolio_item_id === item.id,
        )

        return (
          <PriceCard
            key={item.id}
            item={item}
            todayPrice={todayRow}
            previousPrice={yesterdayRow}
            alerts={itemAlerts}
          />
        )
      })}
      {portfolioItems.length === 0 && (
        <p className="col-span-2 py-4 text-xs text-gray-500">
          No portfolio items found. Add crops to your portfolio to
          see market prices.
        </p>
      )}
    </div>
  )
}

