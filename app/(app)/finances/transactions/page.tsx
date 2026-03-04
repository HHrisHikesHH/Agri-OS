import { redirect } from "next/navigation"

import { TransactionLedger } from "@/components/finances/TransactionLedger"
import { createClient } from "@/lib/supabase/server"
import type {
  CropCyclesRow,
  PortfolioItemsRow,
  TransactionsRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function TransactionsPage() {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect("/login")

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (!userRow) redirect("/onboarding")

  const user = userRow as UsersRow

  const [{ data: txRaw }, { data: cyclesRaw }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("crop_cycles")
      .select<
        string
      >(`
        id,
        portfolio_items ( name )
      `)
      .eq("user_id", user.id),
  ])

  const transactions = (txRaw as TransactionsRow[] | null) ?? []
  const cycles =
    (cyclesRaw as (Pick<CropCyclesRow, "id"> & {
      portfolio_items: Pick<PortfolioItemsRow, "name"> | null
    })[] | null) ?? []

  return (
    <div className="max-w-5xl p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
        📋 Transaction ledger
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        All income and expenses recorded for your farm.
      </p>
      <div className="mt-6">
        <TransactionLedger transactions={transactions} cycles={cycles} />
      </div>
    </div>
  )
}

