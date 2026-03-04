import { redirect } from "next/navigation"

import { AddPlotForm } from "@/components/farm/plots/AddPlotForm"
import { createClient } from "@/lib/supabase/server"

export default async function NewPlotPage() {
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

  return (
    <div className="max-w-3xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">Add a new plot</h1>
      <p className="mt-1 text-sm text-gray-600">
        Give each plot a name you&apos;ll recognise so Agri OS can help you
        reason per field.
      </p>

      <div className="mt-6">
        <AddPlotForm />
      </div>

      <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
        💡 Tip: Give each plot a name you&apos;ll recognise — like the direction,
        a landmark, or what you grow there. E.g. &quot;East Tur Field&quot; or
        &quot;Mango Bagh near road&quot;.
      </div>
    </div>
  )
}

