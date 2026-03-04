import { createClient } from "@/lib/supabase/server"
import type {
  AgentContextCacheRow,
  AssetsRow,
  BusinessOpportunitiesRow,
  CropCyclesRow,
  FarmLearningsRow,
  FarmProfilesRow,
  MarketPricesRow,
  PortfolioItemsRow,
  SalesRow,
  TransactionsRow,
  UserSchemeApplicationsRow,
} from "@/lib/types/database.types"

export interface FarmContext {
  farmSummary: string
  financialSummary: string
  marketSummary: string
  recentDecisions: string
  activeOpportunities: string
  riskFlags: string
  fullContext: string
  estimatedTokens: number
}

export async function buildFarmContext(
  userId: string,
): Promise<FarmContext> {
  const supabase = createClient()

  const [
    { data: profileRaw },
    { data: plotsRaw },
    { data: portfolioRaw },
    { data: assetsRaw },
    { data: activeCyclesRaw },
    { data: recentTransactionsRaw },
    { data: recentSalesRaw },
    { data: recentPricesRaw },
    { data: schemesRaw },
    { data: recentLearningsRaw },
    { data: opportunitiesRaw },
  ] = await Promise.all([
    supabase
      .from("farm_profiles")
      .select("*")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("plots")
      .select("name, area_acres, soil_type, irrigation_type")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("portfolio_items")
      .select(
        "name, category, tree_count, tree_age_years, bearing_status, water_requirement",
      )
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("assets")
      .select("name, category, can_rent_out, condition")
      .eq("user_id", userId),
    supabase
      .from("crop_cycles")
      .select<
        string
      >(`
        *,
        portfolio_items ( name ),
        plots ( name ),
        seasons ( name, type )
      `)
      .eq("user_id", userId)
      .in("status", ["planned", "sowing", "growing", "harvested"]),
    supabase
      .from("transactions")
      .select("type, amount, category, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(20),
    supabase
      .from("sales")
      .select<
        string
      >(`
        sale_date, quantity, unit, price_per_unit, total_amount,
        price_vs_market, buyer_type,
        portfolio_items ( name )
      `)
      .eq("user_id", userId)
      .order("sale_date", { ascending: false })
      .limit(5),
    supabase
      .from("market_prices")
      .select("commodity, modal_price, price_date, mandi_name")
      .order("price_date", { ascending: false })
      .limit(20),
    supabase
      .from("user_scheme_applications")
      .select<
        string
      >(`
        *,
        schemes_master ( name, benefit_amount )
      `)
      .eq("user_id", userId),
    supabase
      .from("farm_learnings")
      .select("learning, category, confidence")
      .eq("user_id", userId)
      .order("times_confirmed", { ascending: false })
      .limit(10),
    supabase
      .from("business_opportunities")
      .select(
        "title, status, revenue_potential_monthly, timeline_months",
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(3),
  ])

  const profile = profileRaw as FarmProfilesRow | null
  const plots = (plotsRaw as { name: string; area_acres: number; soil_type: string | null; irrigation_type: string | null }[] | null) ?? []
  const portfolio =
    (portfolioRaw as PortfolioItemsRow[] | null) ?? []
  const assets = (assetsRaw as AssetsRow[] | null) ?? []
  const activeCycles =
    (activeCyclesRaw as (CropCyclesRow & {
      portfolio_items: { name: string } | null
      plots: { name: string } | null
      seasons: { name: string | null; type: string | null } | null
    })[] | null) ?? []
  const recentTransactions =
    (recentTransactionsRaw as TransactionsRow[] | null) ??
    []
  const recentSales =
    (recentSalesRaw as (SalesRow & {
      portfolio_items: { name: string } | null
    })[] | null) ?? []
  const recentPrices =
    (recentPricesRaw as MarketPricesRow[] | null) ?? []
  const schemes =
    (schemesRaw as (UserSchemeApplicationsRow & {
      schemes_master?: { name: string | null; benefit_amount: string | null } | null
    })[] | null) ?? []
  const recentLearnings =
    (recentLearningsRaw as FarmLearningsRow[] | null) ??
    []
  const opportunities =
    (opportunitiesRaw as BusinessOpportunitiesRow[] | null) ??
    []

  const cropsList = portfolio
    .filter((p) => p.category === "crop")
    .map((p) => p.name)
    .join(", ")
  const treesList = portfolio
    .filter((p) => p.category === "horticulture")
    .map(
      (p) =>
        `${p.name} (${p.tree_count ?? 0} trees, ${
          p.tree_age_years ?? 0
        } yr)`,
    )
    .join(", ")
  const plotsSummary = plots
    .map(
      (p) =>
        `${p.name}: ${p.area_acres}ac ${p.soil_type ?? ""} soil, ${
          p.irrigation_type ?? "rainfed"
        }`,
    )
    .join("; ")

  const farmSummary = `
FARM: ${profile?.village}, ${profile?.taluk}, ${profile?.district}, Karnataka
LAND: ${profile?.total_acres ?? 0} total acres | ${
    plots.length
  } plots: ${plotsSummary}
CROPS: ${cropsList || "none"}
HORTICULTURE: ${treesList || "none"}
ASSETS: ${assets.map((a) => a.name).join(", ")}
WATER: ${profile?.water_status ?? "unknown"}
CAPITAL: ${profile?.capital_status ?? "unknown"}
GOAL: ${profile?.primary_goal ?? "not set"} | Risk appetite: ${
    profile?.risk_appetite ?? "unknown"
  }
  `.trim()

  const totalRevenue =
    recentTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount ?? 0), 0) ?? 0
  const totalExpenses =
    recentTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + (t.amount ?? 0), 0) ?? 0

  const recentSalesSummary = recentSales
    .map((s) => {
      const vs =
        typeof s.price_vs_market === "number"
          ? `${s.price_vs_market > 0 ? "+" : ""}${s.price_vs_market.toFixed(
              1,
            )}% vs market`
          : "no market data"
      return `${s.portfolio_items?.name ?? "Crop"}: ${
        s.quantity ?? 0
      }${s.unit ?? ""} @ ₹${s.price_per_unit ?? 0} (${vs})`
    })
    .join("; ")

  const activeCycleFinancials = activeCycles
    .map(
      (c) =>
        `${c.portfolio_items?.name ?? "Crop"} on ${
          c.plots?.name ?? "plot"
        }: ₹${c.total_input_cost ?? 0} cost, ₹${
          c.total_revenue ?? 0
        } revenue, ₹${c.net_profit ?? 0} net`,
    )
    .join("; ")

  const financialSummary = `
RECENT REVENUE: ₹${totalRevenue.toLocaleString(
    "en-IN",
  )} | EXPENSES: ₹${totalExpenses.toLocaleString(
    "en-IN",
  )} | NET: ₹${(totalRevenue - totalExpenses).toLocaleString("en-IN")}
ACTIVE CYCLES P&L: ${activeCycleFinancials || "none"}
RECENT SALES: ${recentSalesSummary || "none recorded"}
SCHEMES: ${
    schemes.length
      ? schemes
          .map(
            (s) =>
              `${s.schemes_master?.name ?? "Scheme"}: ${s.status}`,
          )
          .join(", ")
      : "none applied"
  }
  `.trim()

  const pricesByComm: Record<
    string,
    { price: number; date: string; mandi: string }
  > = {}
  for (const p of recentPrices) {
    if (
      !pricesByComm[p.commodity] ||
      p.price_date > pricesByComm[p.commodity].date
    ) {
      pricesByComm[p.commodity] = {
        price: p.modal_price ?? 0,
        date: p.price_date,
        mandi: p.mandi_name,
      }
    }
  }
  const priceLines = Object.entries(pricesByComm)
    .map(
      ([c, v]) =>
        `${c}: ₹${v.price}/qtl at ${v.mandi} (${v.date})`,
    )
    .join("; ")

  const marketSummary = `
CURRENT PRICES: ${priceLines || "no price data available"}
DATE: ${new Date().toISOString().split("T")[0]}
SEASON: ${getCurrentSeason()}
  `.trim()

  const learningsSummary =
    recentLearnings
      .map(
        (l) =>
          `[${l.category}/${l.confidence}] ${l.learning}`,
      )
      .join("\n") || "No learnings recorded yet"

  const recentDecisions = `
FARM LEARNINGS:
${learningsSummary}
  `.trim()

  const activeOpportunities = opportunities.length
    ? opportunities
        .map(
          (o) =>
            `${o.title}: ₹${
              o.revenue_potential_monthly ?? 0
            }/month potential, ${o.timeline_months ?? 0}mo timeline, status: ${
              o.status
            }`,
        )
        .join("\n")
    : "No active business opportunities being pursued"

  const riskFlags = generateRiskFlags(activeCycles, profile)

  const fullContext = `
=== FARMER PROFILE ===
${farmSummary}

=== FINANCES ===
${financialSummary}

=== MARKET ===
${marketSummary}

=== DECISIONS & LEARNINGS ===
${recentDecisions}

=== ACTIVE OPPORTUNITIES ===
${activeOpportunities}

=== RISK FLAGS ===
${riskFlags}
  `.trim()

  const estimatedTokens = Math.ceil(fullContext.length / 4)

  return {
    farmSummary,
    financialSummary,
    marketSummary,
    recentDecisions,
    activeOpportunities,
    riskFlags,
    fullContext,
    estimatedTokens,
  }
}

export async function saveContextCache(
  userId: string,
  context: FarmContext,
) {
  const supabase = createClient()

  await supabase
    .from("agent_context_cache")
    // @ts-expect-error insert matches AgentContextCacheInsert
    .upsert({
      user_id: userId,
      farm_summary: context.farmSummary,
      financial_summary: context.financialSummary,
      market_summary: context.marketSummary,
      recent_decisions: context.recentDecisions,
      active_opportunities: context.activeOpportunities,
      risk_flags: context.riskFlags,
      total_tokens_estimate: context.estimatedTokens,
      rebuilt_at: new Date().toISOString(),
    })
}

export async function getFarmContext(
  userId: string,
): Promise<FarmContext> {
  const supabase = createClient()

  const { data: cached } = await supabase
    .from("agent_context_cache")
    .select("*")
    .eq("user_id", userId)
    .single()

  const cacheRow = cached as AgentContextCacheRow | null

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
  const cacheIsStale =
    !cacheRow?.rebuilt_at ||
    new Date(cacheRow.rebuilt_at) < sixHoursAgo

  if (cacheIsStale || !cacheRow?.farm_summary) {
    const fresh = await buildFarmContext(userId)
    await saveContextCache(userId, fresh)
    return fresh
  }

  const farmSummary = cacheRow.farm_summary ?? ""
  const financialSummary = cacheRow.financial_summary ?? ""
  const marketSummary = cacheRow.market_summary ?? ""
  const recentDecisions = cacheRow.recent_decisions ?? ""
  const activeOpportunities = cacheRow.active_opportunities ?? ""
  const riskFlags = cacheRow.risk_flags ?? ""

  const fullContext = [
    farmSummary,
    financialSummary,
    marketSummary,
    recentDecisions,
    activeOpportunities,
    riskFlags,
  ]
    .filter(Boolean)
    .join("\n\n")

  return {
    farmSummary,
    financialSummary,
    marketSummary,
    recentDecisions,
    activeOpportunities,
    riskFlags,
    fullContext,
    estimatedTokens: cacheRow.total_tokens_estimate ?? 0,
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 10) return "Kharif (Jun-Oct)"
  if (month >= 11 || month <= 3) return "Rabi (Nov-Mar)"
  return "Summer (Apr-May)"
}

function generateRiskFlags(
  cycles: Array<
    Pick<CropCyclesRow, "net_profit" | "status"> & {
      portfolio_items?: { name: string } | null
    }
  >,
  profile: Pick<FarmProfilesRow, "water_status"> | null,
): string {
  const flags: string[] = []

  if (profile?.water_status === "scarce") {
    flags.push(
      "Water scarcity — avoid high water-demand crops and prefer drought-tolerant varieties.",
    )
  }

  const lossyCycles = cycles.filter(
    (c) => (c.net_profit ?? 0) < 0,
  )
  if (lossyCycles.length > 0) {
    flags.push(
      `${lossyCycles.length} crop cycle(s) currently at a loss — review input costs and selling strategy.`,
    )
  }

  return flags.length > 0
    ? flags.join("\n")
    : "No critical risks identified"
}

