import { createClient } from "@/lib/supabase/server"
import {
  getCommodityName,
  getCommodityVariants,
} from "@/lib/api/agmarknet"

export default async function MarketDebugPage() {
  const supabase = createClient()

  const { data: marketRows } = await supabase
    .from("market_prices")
    .select(
      "commodity, raw_commodity, state, district, price_date, modal_price",
    )
    .order("price_date", { ascending: false })
    .limit(100)

  const { data: portfolioItems } = await supabase
    .from("portfolio_items")
    .select("name")
    .eq("is_active", true)

  return (
    <div className="max-w-4xl space-y-6 p-4 text-xs md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">

      <section>
        <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          Portfolio items → normalized names
        </h2>
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                Portfolio name
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                Normalized (stored as)
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                Variants tried
              </th>
            </tr>
          </thead>
          <tbody>
            {(portfolioItems ?? []).map((item) => {
              const primary = getCommodityName(item.name)
              const variants = getCommodityVariants(item.name)
              return (
                <tr key={item.name} className="bg-white dark:bg-gray-900">
                  <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-800 dark:text-gray-200">
                    {item.name}
                  </td>
                  <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-green-700 dark:text-green-400">
                    {primary}
                  </td>
                  <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-600 dark:text-gray-400">
                    {variants.join(", ")}
                  </td>
                </tr>
              )
            })}
            {(portfolioItems ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="border border-gray-200 dark:border-gray-800 px-2 py-3 text-center text-gray-500 dark:text-gray-400"
                >
                  No active portfolio items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">
          Latest rows from market_prices
        </h2>
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                Stored commodity
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                Raw API commodity
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                State
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                District
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-200">
                Date
              </th>
              <th className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-right text-[11px] text-gray-800 dark:text-gray-200">
                Modal ₹/qtl
              </th>
            </tr>
          </thead>
          <tbody>
            {(marketRows ?? []).map((row, idx) => (
              <tr
                key={`${row.commodity}-${row.price_date}-${idx}`}
                className={
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }
              >
                <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 font-medium text-gray-800 dark:text-gray-200">
                  {row.commodity}
                </td>
                <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-600 dark:text-gray-400">
                  {"raw_commodity" in row
                    ? // @ts-expect-error dynamic column
                      row.raw_commodity ?? ""
                    : ""}
                </td>
                <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-800 dark:text-gray-200">
                  {row.state}
                </td>
                <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-800 dark:text-gray-200">
                  {row.district}
                </td>
                <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-800 dark:text-gray-200">
                  {row.price_date}
                </td>
                <td className="border border-gray-200 dark:border-gray-800 px-2 py-1 text-right text-gray-800 dark:text-gray-200">
                  {row.modal_price}
                </td>
              </tr>
            ))}
            {(marketRows ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-200 dark:border-gray-800 px-2 py-3 text-center text-gray-500 dark:text-gray-400"
                >
                  No data in market_prices yet — run a sync first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

