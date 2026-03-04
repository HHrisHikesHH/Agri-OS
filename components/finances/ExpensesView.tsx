'use client'

import { useMemo, useState } from "react"
import { Cell, Pie, PieChart, Tooltip } from "recharts"

import type { TransactionsRow } from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type Props = {
  expenses: TransactionsRow[]
}

const COLORS = [
  "#16a34a",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#22c55e",
  "#a855f7",
  "#64748b",
]

export function ExpensesView({ expenses }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const breakdown = useMemo(() => {
    const map = new Map<string, number>()
    expenses.forEach((e) => {
      const key = e.category ?? "other"
      map.set(key, (map.get(key) ?? 0) + (e.amount ?? 0))
    })
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }, [expenses])

  const total = breakdown.reduce((sum, b) => sum + b.value, 0)

  const filteredExpenses =
    categoryFilter === "all"
      ? expenses
      : expenses.filter((e) => e.category === categoryFilter)

  return (
    <div className="space-y-6 text-xs">
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-green-800">
            Expense breakdown by category
          </h2>
          {breakdown.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400">
              No expenses recorded yet.
            </p>
          ) : (
            <PieChart width={260} height={220}>
              <Pie
                data={breakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {breakdown.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${formatINR(value)} (${(
                    (value / (total || 1)) * 100
                  ).toFixed(1)}%)`
                }
              />
            </PieChart>
          )}
          {total > 0 && (
            <p className="mt-2 text-[11px] text-gray-600">
              Total expenses: <span className="font-semibold">{formatINR(total)}</span>
            </p>
          )}
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-green-800">
              Expense list
            </h2>
            <select
              className="rounded-md border bg-white px-2 py-1 text-[11px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {breakdown.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {filteredExpenses.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400">
                No expenses found for this filter.
              </p>
            ) : (
              filteredExpenses
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {e.category}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {e.date} · {e.description ?? "No description"}
                      </p>
                    </div>
                    <p className="font-semibold text-red-700">
                      {formatINR(e.amount ?? 0)}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

