import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function FarmPage() {
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

  if (!userRow) {
    redirect("/onboarding")
  }

  const [farmProfileResult, plotsResult, assetsResult, portfolioResult] =
    await Promise.all([
      supabase
        .from("farm_profiles")
        .select("*")
        .eq("user_id", userRow.id)
        .single(),
      supabase
        .from("plots")
        .select("*", { count: "exact" })
        .eq("user_id", userRow.id)
        .eq("is_active", true),
      supabase
        .from("assets")
        .select("*", { count: "exact" })
        .eq("user_id", userRow.id),
      supabase
        .from("portfolio_items")
        .select("*", { count: "exact" })
        .eq("user_id", userRow.id)
        .eq("is_active", true),
    ])

  const farmProfile = farmProfileResult.data
  const plots = plotsResult.data ?? []
  const plotCount = plotsResult.count ?? 0
  const assetCount = assetsResult.count ?? 0
  const portfolioCount = portfolioResult.count ?? 0

  const totalPlotAcres =
    plots?.reduce((sum, p) => sum + (p.area_acres ?? 0), 0) ?? 0

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">🌿 My Farm</h1>
      {farmProfile ? (
        <p className="mt-1 text-gray-500">
          {farmProfile.village}, {farmProfile.taluk}, {farmProfile.district}
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">
          Complete onboarding to add your farm profile.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total acres"
          value={`${farmProfile?.total_acres ?? 0}`}
          unit="acres (profile)"
          color="green"
        />
        <StatCard
          label="Mapped plots"
          value={`${plotCount}`}
          unit="plots"
          color="blue"
        />
        <StatCard
          label="Assets"
          value={`${assetCount}`}
          unit="items"
          color="orange"
        />
        <StatCard
          label="Portfolio"
          value={`${portfolioCount}`}
          unit="crops/trees"
          color="purple"
        />
      </div>

      {farmProfile?.total_acres && totalPlotAcres < farmProfile.total_acres && (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          ⚠️{" "}
          {(farmProfile.total_acres - totalPlotAcres).toFixed(1)} acres not yet
          mapped to plots.
          <Link
            href="/farm/plots/new"
            className="ml-2 font-semibold underline"
          >
            Add plots →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SectionCard
          href="/farm/plots"
          icon="🗺️"
          title="Land plots"
          description="Manage separate land parcels and water sources."
          count={plotCount}
          countLabel="plots"
        />
        <SectionCard
          href="/farm/assets"
          icon="🚜"
          title="Farm assets"
          description="Tractor, storage, machinery and equipment."
          count={assetCount}
          countLabel="assets"
        />
        <SectionCard
          href="/farm/portfolio"
          icon="🌾"
          title="Crop portfolio"
          description="All crops, trees and livestock you manage."
          count={portfolioCount}
          countLabel="items"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string
  unit: string
  color: "green" | "blue" | "orange" | "purple"
}) {
  const colors: Record<typeof color, string> = {
    green: "text-green-700",
    blue: "text-blue-700",
    orange: "text-orange-600",
    purple: "text-purple-700",
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400">{unit}</p>
    </div>
  )
}

function SectionCard({
  href,
  icon,
  title,
  description,
  count,
  countLabel,
}: {
  href: string
  icon: string
  title: string
  description: string
  count: number
  countLabel: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-green-400 hover:shadow-md"
    >
      <div className="mb-2 text-3xl">{icon}</div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <p className="mt-3 text-sm font-medium text-green-700">
        {count} {countLabel}
      </p>
    </Link>
  )
}

