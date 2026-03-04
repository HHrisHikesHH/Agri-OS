'use client'

import { useEffect, useState } from "react"

import type { ForecastDay, WeatherData } from "@/lib/api/weather"

type Props = {
  currentProp?: WeatherData | null
  forecastProp?: ForecastDay[]
}

export function WeatherWidget({ currentProp, forecastProp }: Props) {
  const [current, setCurrent] = useState<WeatherData | null>(
    currentProp ?? null,
  )
  const [forecast, setForecast] = useState<ForecastDay[]>(
    forecastProp ?? [],
  )
  const [loading, setLoading] = useState(!currentProp)

  useEffect(() => {
    if (currentProp || forecastProp) return

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/weather")
        const json = (await res.json()) as {
          current: WeatherData | null
          forecast: ForecastDay[]
        }
        if (!cancelled) {
          setCurrent(json.current)
          setForecast(json.forecast ?? [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [currentProp, forecastProp])

  const actions =
    forecast.length > 0 ? getWeatherActions(forecast) : []

  if (loading && !current) {
    return (
      <div className="rounded-xl border bg-white p-4 text-xs text-gray-500 shadow-sm">
        Loading weather…
      </div>
    )
  }

  if (!current) {
    return (
      <div className="rounded-xl border bg-white p-4 text-xs text-gray-500 shadow-sm">
        Weather data not available right now.
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 text-xs shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase text-gray-500">
            Current weather
          </p>
          <p className="mt-1 text-3xl font-bold text-green-800">
            {current.temperature}°C
          </p>
          <p className="text-[11px] text-gray-600">
            Feels like {current.feelsLike}°C ·{" "}
            {current.description}
          </p>
        </div>
        <div className="text-right text-[11px] text-gray-600">
          <p>Humidity: {current.humidity}%</p>
          <p>Wind: {current.windSpeed.toFixed(1)} m/s</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-[11px] font-semibold text-green-800">
          Next 7 days
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {forecast.slice(0, 7).map((day) => {
            const date = new Date(day.date)
            const label = date.toLocaleDateString("en-IN", {
              weekday: "short",
            })
            const isRainy = day.rainMm > 5
            return (
              <div
                key={day.date}
                className={`min-w-[70px] rounded-lg border px-2 py-2 text-center ${
                  isRainy
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <p className="text-[10px] text-gray-600">{label}</p>
                <p className="text-xs font-semibold text-gray-800">
                  {day.tempMax}° / {day.tempMin}°
                </p>
                <p className="text-[10px] text-gray-500">
                  {day.rainMm > 0 ? `${day.rainMm.toFixed(1)}mm` : "No rain"}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="mb-1 text-[11px] font-semibold text-green-800">
            Farm actions
          </p>
          <ul className="space-y-1 text-[11px] text-gray-700">
            {actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function getWeatherActions(forecast: ForecastDay[]): string[] {
  const actions: string[] = []
  const tomorrow = forecast[1]

  if (tomorrow?.rainMm > 5) {
    actions.push("💧 Skip irrigation tomorrow — rain expected")
  }
  if (tomorrow?.rainMm > 20) {
    actions.push(
      "⚠️ Heavy rain tomorrow — check drainage in low-lying plots",
    )
  }
  if (
    forecast.slice(0, 5).every((d) => d.rainMm < 2) &&
    (forecast[0]?.humidity ?? 0) < 40
  ) {
    actions.push(
      "🌡️ Dry spell ahead — plan irrigation for next 5 days",
    )
  }
  if ((forecast[0]?.tempMax ?? 0) > 42) {
    actions.push(
      "🔥 Extreme heat today — avoid spraying, water crops in evening",
    )
  }

  return actions
}

