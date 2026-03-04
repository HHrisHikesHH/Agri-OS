import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import {
  fetchMandiPrices,
  getCommodityName,
  getCommodityVariants,
} from "@/lib/api/agmarknet"
import type {
  MarketPricesRow,
  PortfolioItemsRow,
  PriceAlertsRow,
} from "@/lib/types/database.types"

const SYNC_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (!auth || auth !== `Bearer ${SYNC_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    )
  }

  const supabase = createClient()

  // Get all active portfolio items across all users.
  const { data: itemsRaw } = await supabase
    .from("portfolio_items")
    .select("name")
    .eq("is_active", true)

  const items =
    (itemsRaw as Pick<PortfolioItemsRow, "name">[] | null) ?? []

  // Deduplicate by normalized key.
  const seen = new Set<string>()
  const uniqueItems: string[] = []
  for (const item of items) {
    const key = item.name.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueItems.push(item.name)
    }
  }

  let synced = 0
  let skipped = 0
  const errors: string[] = []
  const results: {
    item: string
    variant: string
    records: number
  }[] = []

  for (const itemName of uniqueItems) {
    const variants = getCommodityVariants(itemName)
    const primaryName = getCommodityName(itemName)
    let foundData = false

    for (const variant of variants) {
      try {
        // Fetch without state filter first — cast a wide net.
        const prices = await fetchMandiPrices({
          commodity: variant,
          limit: 200,
        })

        if (prices.length === 0) continue

        // Prefer Karnataka/nearby states if available.
        const karnatakaLike = prices.filter((p) =>
          ["karnataka", "andhra pradesh", "telangana", "maharashtra"].includes(
            p.state.toLowerCase(),
          ),
        )

        const toStore =
          karnatakaLike.length > 0 ? karnatakaLike : prices

        const rows = toStore
          .map((p) => {
            // Parse date robustly — API returns DD/MM/YYYY or YYYY-MM-DD.
            const raw = String(p.arrival_date).trim()
            let priceDate = ""

            if (raw.includes("/")) {
              const parts = raw.split("/")
              if (parts.length === 3) {
                const [d, m, y] = parts
                priceDate = `${y}-${m.padStart(
                  2,
                  "0",
                )}-${d.padStart(2, "0")}`
              }
            } else if (raw.includes("-") && raw.length === 10) {
              priceDate = raw
            } else {
              const parsed = new Date(raw)
              if (!Number.isNaN(parsed.getTime())) {
                priceDate = parsed.toISOString().split("T")[0]
              }
            }

            if (!priceDate) return null

            return {
              commodity: primaryName,
              raw_commodity: p.commodity,
              mandi_name: p.market,
              district: p.district,
              state: p.state,
              price_date: priceDate,
              min_price: Number(p.min_price),
              max_price: Number(p.max_price),
              modal_price: Number(p.modal_price),
              unit: "quintal",
            }
          })
          .filter((r): r is NonNullable<typeof r> => r !== null)

        if (rows.length === 0) continue

        const { error } = await supabase
          .from("market_prices")
          // @ts-expect-error payload matches MarketPricesInsert
          .upsert(rows, {
            onConflict: "commodity,mandi_name,price_date",
            ignoreDuplicates: false,
          })

        if (error) {
          errors.push(`${itemName}/${variant}: ${error.message}`)
        } else {
          synced += rows.length
          results.push({
            item: itemName,
            variant,
            records: rows.length,
          })
          foundData = true
          break
        }
      } catch (err) {
        errors.push(
          `${itemName}/${variant}: ${
            err instanceof Error ? err.message : "fetch failed"
          }`,
        )
      }

      // Small delay between API calls to avoid rate limiting.
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 300))
    }

    if (!foundData) {
      skipped++
    }
  }

  await checkAndTriggerAlerts()

  return NextResponse.json({
    success: true,
    synced,
    skipped,
    results,
    errors: errors.length > 0 ? errors : undefined,
  })
}

async function checkAndTriggerAlerts() {
  const supabase = createClient()
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

