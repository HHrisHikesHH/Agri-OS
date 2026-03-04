'use client'

import { useMemo, useState } from "react"

import type {
  CropCyclesRow,
  PortfolioItemsRow,
  TransactionsRow,
} from "@/lib/types/database.types"
import { formatINR, profitColor } from "@/lib/utils/currency"

type CycleForSelect = Pick<
  CropCyclesRow,
  "id"
> & {
  portfolio_items: Pick<PortfolioItemsRow, "name"> | null
}

type Props = {
  transactions: TransactionsRow[]
  cycles: CycleForSelect[]
}

export function TransactionLedger({ transactions, cycles }: Props) {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  )
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      return true
    })
  }, [transactions, typeFilter, categoryFilter])

  const categories = Array.from(
    new Set(transactions.map((t) => t.category).filter(Boolean)),
  )

  const totalIncome =
    filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0
  const totalExpense =
    filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0

  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill
            label="All"
            active={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
          />
          <FilterPill
            label="Income"
            active={typeFilter === "income"}
            onClick={() => setTypeFilter("income")}
          />
          <FilterPill
            label="Expenses"
            active={typeFilter === "expense"}
            onClick={() => setTypeFilter("expense")}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Category:</span>
          <select
            className="rounded-md border bg-white px-2 py-1 text-[11px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c} value={c ?? ""}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="text-right text-[11px]">
          <p className="text-gray-500">
            Income: <span className="font-semibold">{formatINR(totalIncome)}</span>
          </p>
          <p className="text-gray-500">
            Expenses:{" "}
            <span className="font-semibold">{formatINR(totalExpense)}</span>
          </p>
          <p className={profitColor(balance)}>
            Balance: <span className="font-semibold">{formatINR(balance)}</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="min-w-full table-fixed border-collapse text-[11px]">
          <thead className="bg-green-50 text-left text-[11px] text-gray-600">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Crop</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((t) => {
              const cycle = t.crop_cycle_id
                ? cycles.find((c) => c.id === t.crop_cycle_id)
                : null
              const isIncome = t.type === "income"

              return (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 align-top text-gray-700">
                    {t.date}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {isIncome ? (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                        Income
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        Expense
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-gray-700">
                    {t.category}
                  </td>
                  <td className="px-3 py-2 align-top text-gray-700">
                    {t.description ?? "—"}
                  </td>
                  <td className="px-3 py-2 align-top text-gray-700">
                    {cycle?.portfolio_items?.name ?? "—"}
                  </td>
                  <td
                    className={`px-3 py-2 align-top text-right font-semibold ${
                      isIncome ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {formatINR(t.amount ?? 0)}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-gray-400"
                >
                  No transactions found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="pt-1 text-[10px] text-gray-400">
        Showing {Math.min(filtered.length, 100)} of {filtered.length} records.
      </p>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[11px] ${
        active
          ? "bg-green-700 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  )
}

