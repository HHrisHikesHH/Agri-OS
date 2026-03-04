import { redirect } from "next/navigation"

import { ExpensesView } from "@/components/finances/ExpensesView"
import { createClient } from "@/lib/supabase/server"
import type { TransactionsRow, UsersRow } from "@/lib/types/database.types"

export default async function ExpensesPage() {
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

  const { data: txRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", u.id)
    .eq("type", "expense")

  const expenses = (txRaw as TransactionsRow[] | null) ?? []

  return (
    <div className="max-w-5xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">💸 Expenses</h1>
      <p className="mt-1 text-sm text-gray-500">
        See where your money is going across categories.
      </p>
      <div className="mt-6">
        <ExpensesView expenses={expenses} />
      </div>
    </div>
  )
}

