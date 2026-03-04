import Link from "next/link"
import { redirect } from "next/navigation"

import { FarmSummaryCard } from "@/components/dashboard/FarmSummaryCard"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { createClient } from "@/lib/supabase/server"
import type {
  AssetsRow,
  CropCycleTasksRow,
  CropCyclesRow,
  FarmProfilesRow,
  PortfolioItemsRow,
  PlotsRow,
  TransactionsRow,
  UsersRow,
} from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type DashboardUser = UsersRow & {
  farm_profiles: FarmProfilesRow | null
  portfolio_items: PortfolioItemsRow[]
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: userDataRaw, error } = await supabase
    .from("users")
    .select(
      `
      *,
      farm_profiles (*),
      portfolio_items (*)
    `,
    )
    .eq("auth_id", user.id)
    .single()

  if (error || !userDataRaw) {
    redirect("/onboarding")
  }

  const userData = userDataRaw as unknown as DashboardUser

  if (!userData.onboarding_done) {
    redirect("/onboarding")
  }

  const profile = userData.farm_profiles
  const portfolio = userData.portfolio_items || []

  const { data: plots } = await supabase
    .from("plots")
    .select("*")
    .eq("user_id", userData.id)
    .eq("is_active", true)

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userData.id)

  const activePlots = (plots as PlotsRow[] | null) ?? []
  const totalMappedAcres =
    activePlots.reduce((sum, p) => sum + (p.area_acres ?? 0), 0) ?? 0

  const cropsCount = portfolio.filter(
    (p) => (p.category ?? "").toLowerCase() === "crop",
  ).length
  const orchardsCount = portfolio.filter(
    (p) => (p.category ?? "").toLowerCase() === "horticulture",
  ).length

  const tractorAsset = (assets ?? []).find((a: AssetsRow) =>
    (a.category ?? "").toLowerCase().includes("vehicle"),
  )
  const storageAsset = (assets ?? []).find((a: AssetsRow) =>
    (a.category ?? "").toLowerCase().includes("storage"),
  )

  const farmAssetsSummary = [
    tractorAsset ? "Tractor" : null,
    storageAsset ? "Storage" : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const waterStatus = profile?.water_status ?? "unknown"

  // This season at a glance
  const today = new Date().toISOString().split("T")[0]
  const { data: activeCyclesRaw } = await supabase
    .from("crop_cycles")
    .select<
      string
    >(`
      *,
      portfolio_items ( name ),
      crop_cycle_tasks ( status, scheduled_date )
    `)
    .eq("user_id", userData.id)
    .in("status", ["planned", "sowing", "growing"])

  const activeCycles =
    (activeCyclesRaw as (CropCyclesRow & {
      portfolio_items: Pick<PortfolioItemsRow, "name"> | null
      crop_cycle_tasks: Pick<
        CropCycleTasksRow,
        "status" | "scheduled_date"
      >[]
    })[]) ?? []

  const { data: transactionsRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userData.id)

  const transactions =
    (transactionsRaw as TransactionsRow[] | null) ?? []

  let overdueTasksCount = 0
  let nextTaskTitle: string | null = null
  let nextTaskDate: string | null = null

  activeCycles.forEach((cycle) => {
    const tasks = cycle.crop_cycle_tasks ?? []
    tasks.forEach((t) => {
      if (t.status === "pending" && t.scheduled_date) {
        if (t.scheduled_date < today) {
          overdueTasksCount += 1
        } else if (!nextTaskDate || t.scheduled_date < nextTaskDate) {
          nextTaskTitle = `${cycle.portfolio_items?.name ?? "Crop"} task`
          nextTaskDate = t.scheduled_date
        }
      }
    })
  })

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
            Welcome back, {userData.name}! 🌾
          </h1>
          {profile ? (
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {profile.village}, {profile.district}
            </p>
          ) : null}
        </div>
        <ThemeToggle size="sm" />
      </div>

      {/* My Farm at a Glance */}
      <section className="mt-6 space-y-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4">
        <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
          My farm at a glance
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <FarmSummaryCard
            label="Mapped plots"
            value={`${activePlots.length} · ${totalMappedAcres.toFixed(1)} acres`}
          />
          <FarmSummaryCard
            label="Portfolio"
            value={`${cropsCount} crops · ${orchardsCount} orchards`}
          />
          <FarmSummaryCard
            label="Assets"
            value={farmAssetsSummary || `${(assets ?? []).length} assets`}
          />
          <FarmSummaryCard
            label="Water status"
            value={waterStatus}
            accent="water"
          />
        </div>
      </section>

      {/* Goals / profile snapshot */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 shadow-sm dark:shadow-gray-950">
          <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
            Farm goal (from onboarding)
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {profile?.primary_goal ?? "Not set yet."}
          </p>
        </div>
        <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 shadow-sm dark:shadow-gray-950">
          <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
            Risk appetite
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
            {profile?.risk_appetite ?? "Not set"}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <section className="mt-6 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 shadow-sm dark:shadow-gray-950">
        <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
          Quick actions
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <QuickAction href="/finances" label="+ Log a sale" />
          <QuickAction href="/finances" label="+ Log expense" />
          <QuickAction href="/market" label="View prices" />
          <QuickAction href="/agent" label="Ask agent" />
        </div>
      </section>

      {/* This season at a glance */}
      <section className="mt-6 space-y-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 shadow-sm dark:shadow-gray-950">
        <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
          This season at a glance
        </h2>
        {activeCycles.length === 0 ? (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            No active crop cycles yet. Plan your first cycle from the Crops
            section.
          </p>
        ) : (
          <>
            <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              {activeCycles.map((cycle) => (
                <li key={cycle.id}>
                  <span className="font-semibold text-green-800 dark:text-green-400">
                    {cycle.portfolio_items?.name ?? "Crop"}
                  </span>{" "}
                  · {cycle.area_acres ?? 0} acres ·{" "}
                  <span className="capitalize">{cycle.status}</span>
                </li>
              ))}
            </ul>
            {overdueTasksCount > 0 && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/30 p-2 text-xs text-red-800 dark:text-red-400">
                ⚠ {overdueTasksCount} task
                {overdueTasksCount > 1 ? "s" : ""} overdue — review crop
                details in the Crops section.
              </div>
            )}
            {nextTaskTitle && nextTaskDate && (
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Next upcoming task:{" "}
                <strong>{nextTaskTitle}</strong> on{" "}
                <strong>{nextTaskDate}</strong>.
              </p>
            )}
          </>
        )}
      </section>

      {/* Market pulse & financial health */}
      <section className="mt-6 space-y-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 shadow-sm dark:shadow-gray-950">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
            Market pulse &amp; finances
          </h2>
          <Link
            href="/market"
            className="text-xs font-medium text-green-700 hover:underline"
          >
            View market →
          </Link>
        </div>
        {transactions.length === 0 ? (
            <p className="pt-2 text-xs text-gray-600 dark:text-gray-400">
            No financial activity recorded yet. Use the Finances section to log
            your first sale or expense.
          </p>
        ) : (
          <>
            {(() => {
              const revenue =
                transactions
                  .filter((t) => t.type === "income")
                  .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0
              const expenses =
                transactions
                  .filter((t) => t.type === "expense")
                  .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0
              const net = revenue - expenses

              return (
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-3 text-xs">
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Revenue
                    </p>
                    <p className="mt-1 text-base font-bold text-green-800 dark:text-green-400">
                      {formatINR(revenue)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-red-50 dark:bg-red-900/30 dark:border-red-900 p-3 text-xs">
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Expenses
                    </p>
                    <p className="mt-1 text-base font-bold text-red-700 dark:text-red-400">
                      {formatINR(expenses)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-3 text-xs">
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Net position
                    </p>
                    <p
                      className={`mt-1 text-base font-bold ${
                        net >= 0
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {formatINR(net)}
                    </p>
                  </div>
                </div>
              )
            })()}
            <div className="mt-3 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-2 text-[11px]">
              <p className="mb-1 font-semibold text-gray-800 dark:text-gray-100">
                Recent activity
              </p>
              <ul className="space-y-1">
                {transactions
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 3)
                  .map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {t.date} · {t.category}
                      </span>
                      <span
                        className={
                          t.type === "income"
                            ? "font-semibold text-green-700 dark:text-green-400"
                            : "font-semibold text-red-700 dark:text-red-400"
                        }
                      >
                        {formatINR(t.amount ?? 0)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-900 shadow-sm hover:bg-green-100"
    >
      {label}
    </Link>
  )
}


