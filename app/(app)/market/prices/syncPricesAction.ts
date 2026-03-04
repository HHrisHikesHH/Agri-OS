'use server'

import { createClient } from "@/lib/supabase/server"
import {
  fetchMandiPrices,
  getCommodityName,
} from "@/lib/api/agmarknet"
import type {
  MarketPricesRow,
  PortfolioItemsRow,
  PriceAlertsRow,
} from "@/lib/types/database.types"

export async function syncPrices() {
  const supabase = createClient()

  const { data: itemsRaw } = await supabase
    .from("portfolio_items")
    .select("name")
    .eq("is_active", true)

  const items = (itemsRaw as Pick<PortfolioItemsRow, "name">[] | null) ?? []
  const uniqueCommodities = Array.from(
    new Set(items.map((i) => getCommodityName(i.name))),
  )

  let synced = 0
  const errors: string[] = []

  for (const commodity of uniqueCommodities) {
    try {
      const prices = await fetchMandiPrices({
        commodity,
        state: "Karnataka",
        limit: 50,
      })

      if (prices.length === 0) continue

      const rows = prices.map((p) => {
        // arrival_date from API is in DD/MM/YYYY format — convert safely to YYYY-MM-DD
        const [day, month, year] = p.arrival_date.split("/")
        const priceDate =
          day && month && year
            ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            : new Date().toISOString().split("T")[0]

        return {
          // Store a normalized commodity label (the one we requested)
          // so it matches portfolio names / queries in the UI.
          commodity,
          mandi_name: p.market,
          district: p.district,
          state: p.state,
          price_date: priceDate,
          min_price: p.min_price,
          max_price: p.max_price,
          modal_price: p.modal_price,
          unit: "quintal",
        }
      })

      const { error } = await supabase
        .from("market_prices")
        // @ts-expect-error payload matches MarketPricesInsert
        .upsert(rows, { onConflict: "commodity,mandi_name,price_date" })

      if (error) {
        errors.push(`${commodity}: ${error.message}`)
      } else {
        synced += rows.length
      }
    } catch (err) {
      errors.push(`${commodity}: fetch failed`)
    }
  }

  await checkAndTriggerAlerts(supabase)

  if (errors.length > 0 && synced === 0) {
    return {
      error: `No prices synced. Errors: ${errors.join("; ")}`,
    }
  }

  return {
    success: true,
    synced,
    errors: errors.length > 0 ? errors : undefined,
  }
}

async function checkAndTriggerAlerts(supabase: ReturnType<typeof createClient>) {
  const today = new Date().toISOString().split("T")[0]

  const { data: alertsRaw } = await supabase
    .from("price_alerts")
    .select<
      string
    >(`
      *,
      portfolio_items ( name )
    `)
    .eq("is_active", true)

  const alerts =
    (alertsRaw as (PriceAlertsRow & {
      portfolio_items: { name: string } | null
    })[] | null) ?? []

  for (const alert of alerts) {
    const commodityName = getCommodityName(alert.portfolio_items?.name ?? "")

    const { data: priceRaw } = await supabase
      .from("market_prices")
      .select("modal_price")
      .ilike("commodity", commodityName)
      .eq("price_date", today)
      .order("modal_price", { ascending: false })
      .limit(1)
      .maybeSingle()

    const price = priceRaw as Pick<MarketPricesRow, "modal_price"> | null
    if (!price) continue

    const modal = price.modal_price
    if (modal == null) continue

    const triggered =
      (alert.alert_type === "above" &&
        modal >= (alert.threshold_value ?? 0)) ||
      (alert.alert_type === "below" &&
        modal <= (alert.threshold_value ?? 0))

    if (!triggered) continue

    await supabase
      .from("agent_alerts")
      // @ts-expect-error payload matches AgentAlertsInsert
      .insert({
        user_id: alert.user_id,
        alert_type: "price",
        priority: "high",
        title: `📈 Price Alert: ${alert.portfolio_items?.name ?? "Crop"}`,
        body: `${
          alert.portfolio_items?.name ?? "Crop"
        } is now ₹${price.modal_price}/qtl — your alert threshold of ₹${
          alert.threshold_value ?? 0
        } was reached.`,
        is_delivered: false,
        expires_at: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
      })

    await supabase
      .from("price_alerts")
      // @ts-expect-error payload matches PriceAlertsUpdate
      .update({ last_triggered: new Date().toISOString() })
      .eq("id", alert.id)
  }
}

