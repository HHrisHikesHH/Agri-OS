const OWM_BASE = "https://api.openweathermap.org/data/2.5"
const API_KEY = process.env.OPENWEATHER_API_KEY

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
  if (!API_KEY) return null

  try {
    const res = await fetch(
      `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`,
      { next: { revalidate: 1800 } },
    )
    if (!res.ok) return null
    const data = await res.json()

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description ?? "",
      windSpeed: data.wind.speed,
      icon: data.weather[0]?.icon ?? "",
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    }
  } catch {
    return null
  }
}

export async function getForecast(
  lat: number,
  lng: number,
): Promise<ForecastDay[]> {
  if (!API_KEY) return []

  try {
    const res = await fetch(
      `${OWM_BASE}/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&cnt=40`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const data = await res.json()

    const dayMap = new Map<string, ForecastDay>()
    const list = data.list as Array<{
      dt_txt: string
      main: { temp_min: number; temp_max: number; humidity: number }
      weather: { description: string; icon: string }[]
      rain?: Record<string, number>
    }>

    for (const item of list) {
      const [date, time] = String(item.dt_txt).split(" ")
      const hour = parseInt(time, 10)
      if (!dayMap.has(date) || hour === 12) {
        dayMap.set(date, {
          date,
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          description: item.weather[0]?.description ?? "",
          icon: item.weather[0]?.icon ?? "",
          rainMm: item.rain?.["3h"] ?? 0,
          humidity: item.main.humidity,
        })
      }
    }
    return Array.from(dayMap.values()).slice(0, 7)
  } catch {
    return []
  }
}

export const KALABURAGI_COORDS = { lat: 17.3297, lng: 76.8343 }

