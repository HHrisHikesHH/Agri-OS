const AGRO_BASE = "https://api.agromonitoring.com/agro/1.0"

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  description: string
  windSpeed: number
  icon: string
  sunrise: number
  sunset: number
}

export interface ForecastDay {
  date: string
  tempMin: number
  tempMax: number
  description: string
  icon: string
  rainMm: number
  humidity: number
}

export async function getCurrentWeather(
  lat: number,
  lng: number,
): Promise<WeatherData | null> {
  const API_KEY = process.env.AGROMONITORING_API_KEY
  if (!API_KEY) return null

  try {
    const res = await fetch(
      `${AGRO_BASE}/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`,
      { next: { revalidate: 1800 } },
    )
    if (!res.ok) return null
    const data = await res.json()

    const kelvinToCelsius = (k: number | undefined) =>
      typeof k === "number" ? Math.round(k - 273.15) : 0

    return {
      temperature: kelvinToCelsius(data.main?.temp),
      feelsLike: kelvinToCelsius(data.main?.feels_like),
      humidity: data.main?.humidity ?? 0,
      description: data.weather?.[0]?.description ?? "",
      windSpeed: data.wind?.speed ?? 0,
      icon: data.weather?.[0]?.icon ?? "",
      sunrise: data.sys?.sunrise ?? 0,
      sunset: data.sys?.sunset ?? 0,
    }
  } catch {
    return null
  }
}

export async function getForecast(
  lat: number,
  lng: number,
): Promise<ForecastDay[]> {
  const API_KEY = process.env.AGROMONITORING_API_KEY
  if (!API_KEY) return []

  try {
    const res = await fetch(
      `${AGRO_BASE}/weather/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const data = (await res.json()) as Array<{
      dt: number
      main: { temp_min: number; temp_max: number; humidity: number }
      weather: { description: string; icon: string }[]
      rain?: Record<string, number>
    }>

    const kelvinToCelsius = (k: number | undefined) =>
      typeof k === "number" ? Math.round(k - 273.15) : 0

    const dayMap = new Map<string, ForecastDay>()

    for (const item of data) {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0]
      if (!dayMap.has(date)) {
        dayMap.set(date, {
          date,
          tempMin: kelvinToCelsius(item.main?.temp_min),
          tempMax: kelvinToCelsius(item.main?.temp_max),
          description: item.weather?.[0]?.description ?? "",
          icon: item.weather?.[0]?.icon ?? "",
          rainMm: item.rain?.["3h"] ?? 0,
          humidity: item.main?.humidity ?? 0,
        })
      }
    }

    return Array.from(dayMap.values()).slice(0, 7)
  } catch {
    return []
  }
}

export const KALABURAGI_COORDS = { lat: 17.3297, lng: 76.8343 }

