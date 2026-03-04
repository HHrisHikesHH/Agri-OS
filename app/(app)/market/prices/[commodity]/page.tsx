import { redirect } from "next/navigation"

import { PriceHistoryChart } from "@/components/market/PriceHistoryChart"
import { SellWindowIndicator } from "@/components/market/SellWindowIndicator"
import { createClient } from "@/lib/supabase/server"
import { getSellWindowAdvice } from "@/lib/data/price-seasonality"
import { getCommodityKey } from "@/lib/api/agmarknet"
import type { MarketPricesRow } from "@/lib/types/database.types"
// import { formatINR } from "@/lib/utils/currency"

type Props = {
  params: { commodity: string }
}

export default async function CommodityPricesPage({
  params,
}: Props) {
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

  const now = new Date()
  const ninetyDaysAgo = new Date(
    now.getTime() - 90 * 86400000,
  )
    .toISOString()
    .split("T")[0]

  const commodityName = decodeURIComponent(params.commodity)
  const commodityKey = getCommodityKey(commodityName)

  const { data: historyRaw } = await supabase
    .from("market_prices")
    .select("*")
    .eq("commodity", commodityName)
    .gte("price_date", ninetyDaysAgo)
    .order("price_date", { ascending: true })

  const history =
    (historyRaw as MarketPricesRow[] | null) ?? []

  const latest = history[history.length - 1] ?? null
  const today = new Date().toISOString().split("T")[0]
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 86400000,
  )
    .toISOString()
    .split("T")[0]
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 86400000,
  )
    .toISOString()
    .split("T")[0]

  const last7 = history.filter(
    (p) => p.price_date >= sevenDaysAgo,
  )
  const last30 = history.filter(
    (p) => p.price_date >= thirtyDaysAgo,
  )

  const change7 =
    last7.length > 1
      ? (last7[last7.length - 1].modal_price ?? 0) -
        (last7[0].modal_price ?? 0)
      : 0
  const change30 =
    last30.length > 1
      ? (last30[last30.length - 1].modal_price ?? 0) -
        (last30[0].modal_price ?? 0)
      : 0

  const high =
    history.reduce(
      (max, p) =>
        Math.max(max, p.modal_price ?? 0),
      0,
    ) ?? 0
  const low =
    history.reduce(
      (min, p) =>
        Math.min(
          min,
          p.modal_price ?? Number.POSITIVE_INFINITY,
        ),
      Number.POSITIVE_INFINITY,
    ) ?? 0

  const currentMonth = new Date().getMonth() + 1
  const advice = getSellWindowAdvice(commodityKey, currentMonth)

  return (
    <div className="max-w-5xl p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
        {commodityName} prices
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        90-day mandi price history and simple sell window analysis.
      </p>

      <section className="mt-6 grid gap-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 text-xs shadow-sm dark:shadow-gray-950 md:grid-cols-4">
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Current modal
          </p>
          <p className="mt-1 text-lg font-bold text-green-800 dark:text-green-400">
            {latest ? `${latest.modal_price} / qtl` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            7-day change
          </p>
          <p
            className={`mt-1 text-lg font-bold ${
              change7 >= 0
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {change7 >= 0 ? "+" : ""}
            {change7.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            30-day change
          </p>
          <p
            className={`mt-1 text-lg font-bold ${
              change30 >= 0
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {change30 >= 0 ? "+" : ""}
            {change30.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-500">
            Range (90 days)
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {low !== Number.POSITIVE_INFINITY
              ? `${low.toFixed(0)} – ${high.toFixed(0)}`
              : "—"}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 text-xs shadow-sm dark:shadow-gray-950">
        <h2 className="mb-2 text-sm font-semibold text-green-800 dark:text-green-400">
          Price history (₹/qtl)
        </h2>
        <PriceHistoryChart data={history} />
      </section>

      <section className="mt-6 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 text-xs shadow-sm dark:shadow-gray-950">
        <h2 className="mb-2 text-sm font-semibold text-green-800 dark:text-green-400">
          Mandi comparison
        </h2>
        <MandiComparison history={history} today={today} />
      </section>

      <section className="mt-6 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 text-xs shadow-sm dark:shadow-gray-950">
        <SellWindowIndicator
          commodityName={commodityName}
          advice={advice}
        />
      </section>
    </div>
  )
}

function MandiComparison({
  history,
  today,
}: {
  history: MarketPricesRow[]
  today: string
}) {
  const byMandi = new Map<
    string,
    { today?: MarketPricesRow; yesterday?: MarketPricesRow }
  >()

  for (const p of history) {
    const key = `${p.mandi_name}-${p.district}`
    const entry = byMandi.get(key) ?? {}
    if (p.price_date === today) {
      entry.today = p
    } else if (
      !entry.yesterday ||
      p.price_date > entry.yesterday.price_date
    ) {
      entry.yesterday = p
    }
    byMandi.set(key, entry)
  }

  const rows = Array.from(byMandi.entries()).map(
    ([key, value]) => ({
      key,
      today: value.today,
      yesterday: value.yesterday,
    }),
  )

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed border-collapse text-[11px]">
        <thead className="bg-green-50 text-left text-[11px] text-gray-600">
          <tr>
            <th className="px-3 py-2">Mandi</th>
            <th className="px-3 py-2">District</th>
            <th className="px-3 py-2 text-right">Today</th>
            <th className="px-3 py-2 text-right">Yesterday</th>
            <th className="px-3 py-2 text-right">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const todayPrice = row.today?.modal_price ?? null
            const yPrice = row.yesterday?.modal_price ?? null
            const diff =
              todayPrice != null && yPrice != null
                ? todayPrice - yPrice
                : null
            return (
              <tr
                key={row.key}
                className="border-t border-gray-100"
              >
                <td className="px-3 py-2 text-gray-800">
                  {row.today?.mandi_name ??
                    row.yesterday?.mandi_name ??
                    "—"}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {row.today?.district ??
                    row.yesterday?.district ??
                    "—"}
                </td>
                <td className="px-3 py-2 text-right text-gray-800">
                  {todayPrice != null ? todayPrice.toFixed(0) : "—"}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {yPrice != null ? yPrice.toFixed(0) : "—"}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {diff == null
                    ? "—"
                    : diff === 0
                    ? "→"
                    : diff > 0
                    ? `↑ +₹${diff.toFixed(0)}`
                    : `↓ -₹${Math.abs(diff).toFixed(0)}`}
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-3 text-center text-gray-500"
              >
                No mandi data for this commodity yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

