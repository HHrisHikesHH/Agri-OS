import { createClient } from "@/lib/supabase/server"
import { getCommodityName } from "@/lib/api/agmarknet"
import {
  getCurrentWeather,
  getForecast,
  KALABURAGI_COORDS,
} from "@/lib/api/weather"

export interface ToolResult {
  tool: string
  success: boolean
  data?: unknown
  error?: string
}

export async function executeTool(
  toolName: string,
  params: Record<string, unknown>,
  userId: string,
): Promise<ToolResult> {
  // Use untyped client to avoid over-constraining Supabase typings.
  const supabase = createClient() as any

  try {
    switch (toolName) {
      // ─── READ TOOLS ────────────────────────────────────

      case "get_mandi_prices": {
        const commodity = String(params.commodity ?? "").toLowerCase()
        const daysBack =
          typeof params.days_back === "number" ? params.days_back : 7

        const since = new Date(
          Date.now() - daysBack * 86400000,
        )
          .toISOString()
          .split("T")[0]
        const commodityName = getCommodityName(commodity)

        const { data: prices } = await supabase
          .from("market_prices")
          .select("*")
          .eq("commodity", commodityName)
          .gte("price_date", since)
          .order("price_date", { ascending: false })
          .limit(50)

        const rows = (prices ?? []) as any[]

        const today = new Date().toISOString().split("T")[0]
        const todayPrices = rows.filter(
          (p) => p.price_date === today,
        )
        const bestToday = [...todayPrices].sort(
          (a, b) => (b.modal_price ?? 0) - (a.modal_price ?? 0),
        )[0]

        const allDates = [
          ...new Set(rows.map((p) => p.price_date)),
        ].sort()
        const latestDate =
          allDates.length > 0 ? allDates[allDates.length - 1] : null
        const prevDate =
          allDates.length > 1 ? allDates[allDates.length - 2] : null

        const latest =
          latestDate == null
            ? []
            : rows.filter((p) => p.price_date === latestDate)
        const previous =
          prevDate == null
            ? []
            : rows.filter((p) => p.price_date === prevDate)

        const latestAvg =
          latest.reduce(
            (s, p) => s + (p.modal_price ?? 0),
            0,
          ) / (latest.length || 1)
        const prevAvg =
          previous.reduce(
            (s, p) => s + (p.modal_price ?? 0),
            0,
          ) / (previous.length || 1)

        let trend: "up" | "down" | "stable" = "stable"
        if (latestAvg > prevAvg) trend = "up"
        else if (latestAvg < prevAvg) trend = "down"

        const trendAmount = Math.abs(latestAvg - prevAvg).toFixed(0)

        return {
          tool: toolName,
          success: true,
          data: {
            commodity,
            best_price_today: bestToday
              ? {
                  price: bestToday.modal_price,
                  mandi: bestToday.mandi_name,
                  date: bestToday.price_date,
                }
              : null,
            all_mandis_today: todayPrices.map((p) => ({
              mandi: p.mandi_name,
              modal_price: p.modal_price,
              min: p.min_price,
              max: p.max_price,
            })),
            trend,
            trend_change: `₹${trendAmount}`,
            data_available: rows.length > 0,
            last_updated: latestDate ?? "no data",
          },
        }
      }

      case "get_weather": {
        const { data: profile } = await supabase
          .from("farm_profiles")
          .select("lat, lng, village")
          .eq("user_id", userId)
          .maybeSingle()

        const lat = profile?.lat ?? KALABURAGI_COORDS.lat
        const lng = profile?.lng ?? KALABURAGI_COORDS.lng

        const [current, forecast] = await Promise.all([
          getCurrentWeather(lat, lng),
          getForecast(lat, lng),
        ])

        const days =
          typeof params.days === "number" ? params.days : 7

        const actions: string[] = []
        const tomorrow = forecast[1]
        if (tomorrow?.rainMm > 5) {
          actions.push(
            "Skip irrigation tomorrow — rain expected",
          )
        }
        if (tomorrow?.rainMm > 20) {
          actions.push(
            "Heavy rain tomorrow — check drainage in low-lying plots",
          )
        }
        if (
          forecast.slice(0, 3).every((d) => d.rainMm < 1)
        ) {
          actions.push(
            "No significant rain next 3 days — plan irrigation",
          )
        }
        if (current && current.humidity > 80) {
          actions.push(
            "High humidity — monitor for fungal disease and avoid late-evening irrigation",
          )
        }
        if (current && current.temperature > 40) {
          actions.push(
            "Extreme heat — avoid spraying in daytime, irrigate in evening to reduce stress",
          )
        }

        return {
          tool: toolName,
          success: true,
          data: {
            current,
            forecast: forecast.slice(0, days),
            farm_actions: actions,
          },
        }
      }

      case "get_active_crop_cycles": {
        const status =
          (params.status as string | undefined) ?? "all"
        const statusFilter =
          status === "all"
            ? ["planned", "sowing", "growing", "harvested"]
            : [status]

        const today = new Date().toISOString().split("T")[0]

        const { data: cycles } = await supabase
          .from("crop_cycles")
          .select<string>(`
            id, status, area_acres, sowing_date, expected_harvest_date,
            actual_harvest_date, expected_yield_qtl, actual_yield_qtl,
            total_input_cost, total_revenue, net_profit, profit_per_acre,
            portfolio_items ( name, category ),
            plots ( name ),
            seasons ( name, type ),
            crop_cycle_tasks ( id, title, status, scheduled_date, task_type )
          `)
          .eq("user_id", userId)
          .in("status", statusFilter)

        const rows = (cycles ?? []) as any[]

        return {
          tool: toolName,
          success: true,
          data: {
            cycles: rows.map((c) => {
              const latestHarvest =
                c.expected_harvest_date ??
                c.actual_harvest_date
              const daysToHarvest = latestHarvest
                ? Math.ceil(
                    (new Date(latestHarvest).getTime() -
                      Date.now()) /
                      86400000,
                  )
                : null

              const tasks = (c.crop_cycle_tasks ??
                []) as any[]
              const overdueTasks = tasks.filter(
                (t) =>
                  t.status === "pending" &&
                  t.scheduled_date < today,
              )
              const upcomingTasks = tasks
                .filter(
                  (t) =>
                    t.status === "pending" &&
                    t.scheduled_date >= today,
                )
                .sort((a, b) =>
                  a.scheduled_date.localeCompare(
                    b.scheduled_date,
                  ),
                )
                .slice(0, 3)

              return {
                id: c.id,
                crop: c.portfolio_items?.name,
                plot: c.plots?.name,
                season: c.seasons?.name,
                status: c.status,
                area_acres: c.area_acres,
                sowing_date: c.sowing_date,
                expected_harvest: c.expected_harvest_date,
                days_to_harvest: daysToHarvest,
                financials: {
                  input_cost: c.total_input_cost,
                  revenue: c.total_revenue,
                  net_profit: c.net_profit,
                  profit_per_acre: c.profit_per_acre,
                },
                overdue_tasks: overdueTasks.map((t) => ({
                  title: t.title,
                  due: t.scheduled_date,
                })),
                upcoming_tasks: upcomingTasks.map((t) => ({
                  title: t.title,
                  due: t.scheduled_date,
                })),
              }
            }),
          },
        }
      }

      case "get_overdue_tasks": {
        const today = new Date().toISOString().split("T")[0]
        const daysAhead =
          typeof params.days_ahead === "number"
            ? params.days_ahead
            : 7
        const futureDate = new Date(
          Date.now() + daysAhead * 86400000,
        )
          .toISOString()
          .split("T")[0]

        const { data: tasks } = await supabase
          .from("crop_cycle_tasks")
          .select<string>(`
            id, title, task_type, scheduled_date, status,
            crop_cycles (
              portfolio_items ( name ),
              plots ( name )
            )
          `)
          .eq("user_id", userId)
          .eq("status", "pending")
          .lte("scheduled_date", futureDate)
          .order("scheduled_date", { ascending: true })

        const rows = (tasks ?? []) as any[]
        const overdue = rows.filter(
          (t) => t.scheduled_date < today,
        )
        const upcoming = rows.filter(
          (t) => t.scheduled_date >= today,
        )

        return {
          tool: toolName,
          success: true,
          data: {
            overdue_count: overdue.length,
            upcoming_count: upcoming.length,
            overdue: overdue.map((t) => ({
              id: t.id,
              title: t.title,
              type: t.task_type,
              due: t.scheduled_date,
              days_overdue: Math.floor(
                (Date.now() -
                  new Date(t.scheduled_date).getTime()) /
                  86400000,
              ),
              crop:
                t.crop_cycles?.portfolio_items?.name ??
                null,
              plot: t.crop_cycles?.plots?.name ?? null,
            })),
            upcoming: upcoming.map((t) => ({
              id: t.id,
              title: t.title,
              type: t.task_type,
              due: t.scheduled_date,
              days_until: Math.ceil(
                (new Date(t.scheduled_date).getTime() -
                  Date.now()) /
                  86400000,
              ),
              crop:
                t.crop_cycles?.portfolio_items?.name ??
                null,
            })),
          },
        }
      }

      case "get_financial_summary": {
        const period =
          (params.period as string | undefined) ??
          "this_year"
        const now = new Date()
        let since: string

        switch (period) {
          case "this_month":
            since = `${now.getFullYear()}-${String(
              now.getMonth() + 1,
            ).padStart(2, "0")}-01`
            break
          case "this_season": {
            const month = now.getMonth() + 1
            if (month >= 6 && month <= 10) {
              since = `${now.getFullYear()}-06-01`
            } else if (month >= 11) {
              since = `${now.getFullYear()}-11-01`
            } else {
              since = `${now.getFullYear() - 1}-11-01`
            }
            break
          }
          case "this_year":
            since = `${now.getFullYear()}-01-01`
            break
          default:
            since = "2020-01-01"
        }

        const { data: transactions } = await supabase
          .from("transactions")
          .select(
            "type, amount, category, date, description",
          )
          .eq("user_id", userId)
          .gte("date", since)
          .order("date", { ascending: false })

        const txs = (transactions ?? []) as any[]
        const income = txs.filter(
          (t) => t.type === "income",
        )
        const expenses = txs.filter(
          (t) => t.type === "expense",
        )
        const totalIncome = income.reduce(
          (s, t) => s + (t.amount ?? 0),
          0,
        )
        const totalExpense = expenses.reduce(
          (s, t) => s + (t.amount ?? 0),
          0,
        )

        const expByCategory: Record<string, number> = {}
        for (const t of expenses) {
          const key = t.category ?? "other"
          expByCategory[key] =
            (expByCategory[key] ?? 0) +
            (t.amount ?? 0)
        }

        const { data: cycles } = await supabase
          .from("crop_cycles")
          .select<string>(
            "portfolio_items(name), net_profit, profit_per_acre, area_acres",
          )
          .eq("user_id", userId)
          .not("net_profit", "is", null)

        const pnlRows = (cycles ?? []) as any[]

        return {
          tool: toolName,
          success: true,
          data: {
            period,
            since,
            total_income: totalIncome,
            total_expense: totalExpense,
            net_profit: totalIncome - totalExpense,
            transaction_count: txs.length,
            expense_breakdown: expByCategory,
            recent_transactions: txs
              .slice(0, 5)
              .map((t) => ({
                type: t.type,
                amount: t.amount,
                category: t.category,
                description: t.description,
                date: t.date,
              })),
            crop_pnl: pnlRows.map((c) => ({
              crop: c.portfolio_items?.name,
              net_profit: c.net_profit,
              profit_per_acre: c.profit_per_acre,
            })),
          },
        }
      }

      case "get_schemes": {
        const filter =
          (params.filter as string | undefined) ?? "all"

        const { data: allSchemes } = await supabase
          .from("schemes_master")
          .select("*")
          .eq("is_active", true)

        const { data: applications } = await supabase
          .from("user_scheme_applications")
          .select<string>("*, schemes_master(name)")
          .eq("user_id", userId)

        const appliedIds = new Set(
          (applications ?? []).map((a: any) => a.scheme_id),
        )

        let schemes = (allSchemes ?? []) as any[]
        if (filter === "not_applied") {
          schemes = schemes.filter(
            (s) => !appliedIds.has(s.id),
          )
        }

        return {
          tool: toolName,
          success: true,
          data: {
            schemes: schemes.map((s) => ({
              id: s.id,
              name: s.name,
              short_name: s.short_name,
              benefit: s.benefit_amount,
              category: s.category,
              apply_url: s.apply_url,
              applied: appliedIds.has(s.id),
              application_status:
                (applications ?? []).find(
                  (a: any) => a.scheme_id === s.id,
                )?.status ?? null,
            })),
            total_applied: (applications ?? []).length,
            total_receiving: (applications ?? []).filter(
              (a: any) => a.status === "receiving",
            ).length,
            total_received: (applications ?? []).reduce(
              (s: number, a: any) =>
                s + (a.total_received ?? 0),
              0,
            ),
          },
        }
      }

      case "get_opportunities": {
        const status =
          (params.status as string | undefined) ?? "all"
        let query = supabase
          .from("business_opportunities")
          .select("*")
          .eq("user_id", userId)

        if (status !== "all") {
          query = query.eq("status", status)
        }

        const { data: opportunities } = await query.order(
          "revenue_potential_monthly",
          { ascending: false },
        )

        const rows = (opportunities ?? []) as any[]

        return {
          tool: toolName,
          success: true,
          data: {
            opportunities: rows.map((o) => ({
              id: o.id,
              title: o.title,
              status: o.status,
              category: o.category,
              monthly_potential:
                o.revenue_potential_monthly,
              timeline_months: o.timeline_months,
              capital_required: o.capital_required,
              difficulty: o.difficulty,
              first_step: o.meta?.first_step ?? null,
            })),
            total_monthly_potential: rows
              .filter((o) => o.status === "active")
              .reduce(
                (s, o) =>
                  s +
                  (o.revenue_potential_monthly ?? 0),
                0,
              ),
          },
        }
      }

      case "get_sale_history": {
        const commodity =
          (params.commodity as string | undefined) ?? ""
        const limit =
          typeof params.limit === "number"
            ? params.limit
            : 10

        let query = supabase
          .from("sales")
          .select<string>(`
            sale_date, quantity, unit, price_per_unit, total_amount,
            buyer_type, buyer_name, channel, price_vs_market,
            portfolio_items ( name )
          `)
          .eq("user_id", userId)
          .order("sale_date", { ascending: false })
          .limit(limit)

        if (commodity) {
          const { data: item } = await supabase
            .from("portfolio_items")
            .select("id")
            .eq("user_id", userId)
            .ilike("name", `%${commodity}%`)
            .limit(1)
            .maybeSingle()

          if (item) {
            query = query.eq("portfolio_item_id", item.id)
          }
        }

        const { data: sales } = await query
        const rows = (sales ?? []) as any[]

        return {
          tool: toolName,
          success: true,
          data: {
            sales: rows.map((s) => ({
              date: s.sale_date,
              crop: s.portfolio_items?.name,
              quantity: `${s.quantity} ${s.unit}`,
              price: s.price_per_unit,
              total: s.total_amount,
              buyer: s.buyer_type,
              vs_market: s.price_vs_market
                ? `${
                    s.price_vs_market > 0 ? "+" : ""
                  }${s.price_vs_market.toFixed(1)}%`
                : "no data",
            })),
            count: rows.length,
          },
        }
      }

      // ─── WRITE TOOLS ────────────────────────────────────

      case "log_sale": {
        const commodity = String(params.commodity ?? "")
        const quantity = Number(params.quantity ?? 0)
        const unit =
          (params.unit as string | undefined) ??
          "quintal"
        const pricePerUnit = Number(
          params.price_per_unit ?? 0,
        )
        const totalAmount = quantity * pricePerUnit
        const saleDate =
          (params.sale_date as string | undefined) ??
          new Date().toISOString().split("T")[0]

        const { data: portfolioItem } = await supabase
          .from("portfolio_items")
          .select("id, name")
          .eq("user_id", userId)
          .ilike("name", `%${commodity}%`)
          .limit(1)
          .maybeSingle()

        if (!portfolioItem) {
          return {
            tool: toolName,
            success: false,
            error: `Could not find "${commodity}" in your portfolio. Please add it first.`,
          }
        }

        const { data: transaction } = await supabase
          .from("transactions")
          .insert({
            user_id: userId,
            type: "income",
            category: "crop_sale",
            amount: totalAmount,
            date: saleDate,
            description: `Sale of ${portfolioItem.name} — ${quantity} ${unit} @ ₹${pricePerUnit}`,
            payment_method: "cash",
          })
          .select()
          .maybeSingle()

        await supabase.from("sales").insert({
          user_id: userId,
          transaction_id: transaction?.id ?? null,
          sale_date: saleDate,
          portfolio_item_id: portfolioItem.id,
          quantity,
          unit,
          price_per_unit: pricePerUnit,
          total_amount: totalAmount,
          buyer_type:
            (params.buyer_type as string | undefined) ??
            "trader",
          notes:
            (params.notes as string | undefined) ?? null,
        })

        return {
          tool: toolName,
          success: true,
          data: {
            message: "Sale recorded successfully",
            crop: portfolioItem.name,
            quantity: `${quantity} ${unit}`,
            amount: totalAmount,
            date: saleDate,
          },
        }
      }

      case "log_expense": {
        const amount = Number(params.amount ?? 0)
        const date =
          (params.date as string | undefined) ??
          new Date().toISOString().split("T")[0]

        await supabase.from("transactions").insert({
          user_id: userId,
          type: "expense",
          category: params.category as string,
          amount,
          date,
          description: params.description as string,
          payment_method: "cash",
        })

        return {
          tool: toolName,
          success: true,
          data: {
            message: "Expense recorded",
            category: params.category,
            amount,
            description: params.description,
            date,
          },
        }
      }

      case "complete_task": {
        const keyword = String(
          params.task_title_keyword ?? "",
        ).toLowerCase()
        const today = new Date().toISOString().split("T")[0]

        const { data: tasks } = await supabase
          .from("crop_cycle_tasks")
          .select("id, title, crop_cycle_id")
          .eq("user_id", userId)
          .eq("status", "pending")
          .ilike("title", `%${keyword}%`)
          .order("scheduled_date", { ascending: true })
          .limit(5)

        const rows = (tasks ?? []) as any[]
        if (rows.length === 0) {
          return {
            tool: toolName,
            success: false,
            error: `No pending task found matching "${keyword}". Check your task list.`,
          }
        }

        const task = rows[0]
        await supabase
          .from("crop_cycle_tasks")
          .update({
            status: "done",
            completed_date: today,
            cost:
              typeof params.actual_cost === "number"
                ? params.actual_cost
                : 0,
            notes:
              (params.notes as string | undefined) ??
              null,
          })
          .eq("id", task.id)

        return {
          tool: toolName,
          success: true,
          data: {
            message: `Task marked as done: "${task.title}"`,
            task_id: task.id,
            cost_logged:
              typeof params.actual_cost === "number"
                ? params.actual_cost
                : 0,
          },
        }
      }

      case "set_price_alert": {
        const commodity = String(params.commodity ?? "")

        const { data: portfolioItem } = await supabase
          .from("portfolio_items")
          .select("id, name")
          .eq("user_id", userId)
          .ilike("name", `%${commodity}%`)
          .limit(1)
          .maybeSingle()

        if (!portfolioItem) {
          return {
            tool: toolName,
            success: false,
            error: `"${commodity}" not found in your portfolio.`,
          }
        }

        await supabase.from("price_alerts").insert({
          user_id: userId,
          portfolio_item_id: portfolioItem.id,
          alert_type: params.alert_type as string,
          threshold_value: Number(
            params.threshold_price ?? 0,
          ),
          is_active: true,
          created_by: "agent",
        })

        return {
          tool: toolName,
          success: true,
          data: {
            message: `Price alert set for ${portfolioItem.name}`,
            alert: `Notify when price goes ${params.alert_type} ₹${params.threshold_price}/qtl`,
          },
        }
      }

      case "save_learning": {
        await supabase.from("farm_learnings").insert({
          user_id: userId,
          category: params.category as string,
          learning: params.learning as string,
          confidence: "medium",
          times_confirmed: 1,
        })

        return {
          tool: toolName,
          success: true,
          data: {
            message: "Learning saved to your farm memory",
            learning: params.learning,
          },
        }
      }

      case "add_opportunity": {
        await supabase.from("business_opportunities").insert({
          user_id: userId,
          title: params.title as string,
          description: params.description as string,
          revenue_potential_monthly:
            (params.estimated_monthly_revenue as number) ??
            null,
          capital_required:
            (params.capital_required as string) ??
            "low",
          source: "user",
          status: "idea",
          difficulty: "medium",
        })

        return {
          tool: toolName,
          success: true,
          data: {
            message: `Opportunity added: "${params.title}"`,
          },
        }
      }

      case "update_farm_profile": {
        const fields: Record<string, unknown> = {}
        if (typeof params.total_acres === "number") {
          fields.total_acres = params.total_acres
        }
        if (typeof params.village === "string") {
          fields.village = params.village
        }
        if (typeof params.taluk === "string") {
          fields.taluk = params.taluk
        }
        if (typeof params.district === "string") {
          fields.district = params.district
        }
        if (typeof params.state === "string") {
          fields.state = params.state
        }

        if (Object.keys(fields).length === 0) {
          return {
            tool: toolName,
            success: false,
            error:
              "No farm profile fields provided to update.",
          }
        }

        const { data: existing } = await supabase
          .from("farm_profiles")
          .select("id, total_acres, village, taluk, district, state")
          .eq("user_id", userId)
          .maybeSingle()

        if (existing) {
          await supabase
            .from("farm_profiles")
            .update(fields)
            .eq("id", existing.id)
        } else {
          await supabase.from("farm_profiles").insert({
            user_id: userId,
            ...fields,
          })
        }

        return {
          tool: toolName,
          success: true,
          data: {
            message: "Farm profile updated",
            updated_fields: fields,
          },
        }
      }

      case "upsert_portfolio_crop": {
        const cropName = String(
          params.crop_name ?? "",
        ).trim()
        if (!cropName) {
          return {
            tool: toolName,
            success: false,
            error: "crop_name is required",
          }
        }

        const { data: existing } = await supabase
          .from("portfolio_items")
          .select("id, name, is_active, category")
          .eq("user_id", userId)
          .ilike("name", `%${cropName}%`)
          .maybeSingle()

        const category =
          (params.category as string | undefined) ??
          "crop"

        if (existing) {
          await supabase
            .from("portfolio_items")
            .update({
              is_active: true,
              category:
                existing.category ?? category,
              local_name:
                (params.local_name as string | undefined) ??
                existing.local_name ??
                null,
            })
            .eq("id", existing.id)

          return {
            tool: toolName,
            success: true,
            data: {
              message:
                "Existing portfolio crop activated/updated",
              id: existing.id,
              name: existing.name,
            },
          }
        }

        const { data: inserted, error } = await supabase
          .from("portfolio_items")
          .insert({
            user_id: userId,
            name: cropName,
            local_name:
              (params.local_name as string | undefined) ??
              null,
            category,
            is_active: true,
          })
          .select("id, name")
          .maybeSingle()

        if (error) {
          return {
            tool: toolName,
            success: false,
            error: error.message,
          }
        }

        return {
          tool: toolName,
          success: true,
          data: {
            message: "New crop added to portfolio",
            id: inserted?.id,
            name: inserted?.name,
          },
        }
      }

      case "start_crop_cycle": {
        const cropName = String(
          params.crop_name ?? "",
        ).trim()
        if (!cropName) {
          return {
            tool: toolName,
            success: false,
            error: "crop_name is required",
          }
        }

        const todayStr =
          (params.sowing_date as string | undefined) ??
          new Date().toISOString().split("T")[0]

        // Find or create portfolio item for this crop.
        const { data: existingItem } = await supabase
          .from("portfolio_items")
          .select("id, name, category, is_active")
          .eq("user_id", userId)
          .ilike("name", `%${cropName}%`)
          .maybeSingle()

        let portfolioItemId: string | null = null
        let portfolioItemName = cropName

        if (existingItem) {
          portfolioItemId = existingItem.id
          portfolioItemName = existingItem.name
          await supabase
            .from("portfolio_items")
            .update({ is_active: true })
            .eq("id", existingItem.id)
        } else {
          const { data: inserted, error } = await supabase
            .from("portfolio_items")
            .insert({
              user_id: userId,
              name: cropName,
              category: "crop",
              is_active: true,
            })
            .select("id, name")
            .maybeSingle()
          if (error) {
            return {
              tool: toolName,
              success: false,
              error: error.message,
            }
          }
          portfolioItemId = inserted?.id ?? null
          portfolioItemName =
            inserted?.name ?? portfolioItemName
        }

        // Choose a plot (if any active plots exist).
        const { data: plots } = await supabase
          .from("plots")
          .select("id, name, area_acres")
          .eq("user_id", userId)
          .eq("is_active", true)

        const plotRows = (plots ?? []) as any[]
        let chosenPlot: any | null = null
        const plotNameFilter = (
          params.plot_name as string | undefined
        )?.toLowerCase()
        if (plotNameFilter && plotRows.length > 0) {
          chosenPlot =
            plotRows.find((p) =>
              String(p.name ?? "")
                .toLowerCase()
                .includes(plotNameFilter),
            ) ?? plotRows[0]
        } else if (plotRows.length > 0) {
          chosenPlot = plotRows[0]
        }

        // Choose a season for the current year if available.
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        let seasonType: string | null = null
        if (month >= 6 && month <= 10) {
          seasonType = "kharif"
        } else if (month >= 11 || month <= 2) {
          seasonType = "rabi"
        } else {
          seasonType = "summer"
        }

        const { data: seasons } = await supabase
          .from("seasons")
          .select("id, name, type, year")
          .eq("user_id", userId)
          .eq("year", year)

        const seasonRows = (seasons ?? []) as any[]
        let chosenSeason: any | null = null
        if (seasonRows.length > 0) {
          chosenSeason =
            seasonRows.find(
              (s) =>
                s.type &&
                s.type.toLowerCase() ===
                  seasonType?.toLowerCase(),
            ) ?? seasonRows[0]
        }

        const areaAcres =
          typeof params.area_acres === "number"
            ? params.area_acres
            : chosenPlot?.area_acres ?? null

        const { data: cycle, error } = await supabase
          .from("crop_cycles")
          .insert({
            user_id: userId,
            plot_id: chosenPlot?.id ?? null,
            season_id: chosenSeason?.id ?? null,
            portfolio_item_id: portfolioItemId,
            area_acres: areaAcres,
            sowing_date: todayStr,
            status: "sowing",
            seed_variety:
              (params.seed_variety as string | undefined) ??
              null,
            meta: { started_by: "agent" },
          })
          .select("id")
          .maybeSingle()

        if (error) {
          return {
            tool: toolName,
            success: false,
            error: error.message,
          }
        }

        return {
          tool: toolName,
          success: true,
          data: {
            message:
              "New crop cycle created and marked as sowing",
            cycle_id: cycle?.id,
            crop: portfolioItemName,
            plot: chosenPlot?.name ?? null,
            season: chosenSeason?.name ?? null,
            sowing_date: todayStr,
            area_acres: areaAcres,
          },
        }
      }

      default:
        return {
          tool: toolName,
          success: false,
          error: `Unknown tool: ${toolName}`,
        }
    }
  } catch (err) {
    return {
      tool: toolName,
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Tool execution failed",
    }
  }
}

