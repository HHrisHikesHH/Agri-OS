import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCommodityName } from "@/lib/api/agmarknet"
import type {
  MarketPricesRow,
  PortfolioItemsRow,
  UsersRow,
} from "@/lib/types/database.types"

import { SyncPricesButton } from "./sync-button"

export default async function MarketPricesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (!userRow) redirect("/onboarding")
  const u = userRow as UsersRow

  const { data: portfolioRaw } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", u.id)
    .eq("is_active", true)

  const portfolio =
    (portfolioRaw as PortfolioItemsRow[] | null) ?? []

  const commodityNames = portfolio.map((i) => getCommodityName(i.name))

  const { data: pricesRaw } = await supabase
    .from("market_prices")
    .select("*")
    .in("commodity", commodityNames)
    .order("price_date", { ascending: false })
    .limit(200)

  const prices = (pricesRaw as MarketPricesRow[] | null) ?? []

  const today = new Date().toISOString().split("T")[0]
  const hasToday = prices.some((p) => p.price_date === today)

  return (
    <div className="max-w-5xl p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
            💹 Mandi prices
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Latest mandi prices for your portfolio crops.
          </p>
        </div>
        {!hasToday && <SyncPricesButton />}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 text-xs shadow-sm dark:shadow-gray-950">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="bg-green-50 dark:bg-gray-800 text-left text-[11px] text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-3 py-2">Commodity</th>
              <th className="px-3 py-2">Mandi</th>
              <th className="px-3 py-2">District</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2 text-right">Min</th>
              <th className="px-3 py-2 text-right">Modal</th>
              <th className="px-3 py-2 text-right">Max</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={`${p.commodity}-${p.mandi_name}-${p.price_date}`}>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                  <a
                    href={`/market/prices/${encodeURIComponent(
                      p.commodity,
                    )}`}
                    className="font-semibold text-green-800 dark:text-green-400 hover:underline"
                  >
                    {p.commodity}
                  </a>
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  {p.mandi_name}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  {p.district}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                  {p.price_date}
                </td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                  {p.min_price}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-green-800 dark:text-green-400">
                  {p.modal_price}
                </td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                  {p.max_price}
                </td>
              </tr>
            ))}
            {prices.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No market price data yet. Use &quot;Sync prices
                  now&quot; to fetch latest prices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

