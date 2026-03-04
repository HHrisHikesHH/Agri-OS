import { redirect } from "next/navigation"

import { WeatherWidget } from "@/components/market/WeatherWidget"
import { createClient } from "@/lib/supabase/server"
import { getCurrentWeather, getForecast } from "@/lib/api/weather"
import type {
  FarmProfilesRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function MarketWeatherPage() {
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

  const { data: farmProfileRaw } = await supabase
    .from("farm_profiles")
    .select("lat, lng, village, district")
    .eq("user_id", u.id)
    .single()

  const farmProfile = farmProfileRaw as
    | Pick<FarmProfilesRow, "lat" | "lng" | "village" | "district">
    | null

  const lat = Number(farmProfile?.lat ?? 17.3297)
  const lng = Number(farmProfile?.lng ?? 76.8343)

  const [current, forecast] = await Promise.all([
    getCurrentWeather(lat, lng),
    getForecast(lat, lng),
  ])

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">
        🌦️ Weather
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Forecast and farm actions based on upcoming rain and heat.
      </p>
      <p className="mt-1 text-[11px] text-gray-500">
        Location:{" "}
        {farmProfile?.village
          ? `${farmProfile.village}, ${farmProfile.district ?? "Kalaburagi"}`
          : "Kalaburagi region"}
      </p>
      <div className="mt-6">
        <WeatherWidget
          currentProp={current}
          forecastProp={forecast}
        />
      </div>
    </div>
  )
}

