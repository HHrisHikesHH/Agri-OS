import { NextRequest, NextResponse } from "next/server"

import { getCurrentWeather, getForecast } from "@/lib/api/weather"

export async function GET(request: NextRequest) {
  const lat = parseFloat(
    request.nextUrl.searchParams.get("lat") ?? "17.3297",
  )
  const lng = parseFloat(
    request.nextUrl.searchParams.get("lng") ?? "76.8343",
  )

  const [current, forecast] = await Promise.all([
    getCurrentWeather(lat, lng),
    getForecast(lat, lng),
  ])

  // Minimal debug fields to help verify server-side config.
  const debug =
    request.nextUrl.searchParams.get("debug") === "1"
      ? {
          lat,
          lng,
          hasKey: Boolean(process.env.AGROMONITORING_API_KEY),
        }
      : undefined

  return NextResponse.json({ current, forecast, debug })
}

