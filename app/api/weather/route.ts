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

  return NextResponse.json({ current, forecast })
}

