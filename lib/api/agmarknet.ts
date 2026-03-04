const AGMARKNET_BASE =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

const API_KEY = process.env.DATA_GOV_API_KEY

export interface MandiPrice {
  commodity: string
  market: string
  district: string
  state: string
  arrival_date: string
  min_price: number
  max_price: number
  modal_price: number
}

export async function fetchMandiPrices(params: {
  commodity?: string
  state?: string
  district?: string
  market?: string
  variety?: string
  grade?: string
  limit?: number
  offset?: number
}): Promise<MandiPrice[]> {
  const url = new URL(AGMARKNET_BASE)
  url.searchParams.set("api-key", API_KEY ?? "your_free_key_here")
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", String(params.limit ?? 100))

  if (params.commodity) {
    url.searchParams.set("filters[commodity]", params.commodity)
  }
  if (params.state) {
    url.searchParams.set("filters[state.keyword]", params.state)
  }
  if (params.district) {
    url.searchParams.set("filters[district]", params.district)
  }
  if (params.market) {
    url.searchParams.set("filters[market]", params.market)
  }
  if (params.variety) {
    url.searchParams.set("filters[variety]", params.variety)
  }
  if (params.grade) {
    url.searchParams.set("filters[grade]", params.grade)
  }
  if (typeof params.offset === "number") {
    url.searchParams.set("offset", String(params.offset))
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      throw new Error(`Agmarknet API error: ${res.status}`)
    }
    const data = (await res.json()) as { records?: MandiPrice[] }
    return data.records ?? []
  } catch (err) {
    console.error("Agmarknet fetch error:", err)
    return []
  }
}

export const COMMODITY_MAP: Record<string, string> = {
  tur: "Arhar (Tur)",
  toor: "Arhar (Tur)",
  arhar: "Arhar (Tur)",
  jowar: "Jowar",
  bajra: "Bajra",
  wheat: "Wheat",
  gehu: "Wheat",
  chana: "Gram",
  gram: "Gram",
  mango: "Mango",
  guava: "Guava",
  onion: "Onion",
  tomato: "Tomato",
  sunflower: "Sunflower",
  groundnut: "Groundnut",
}

export function getCommodityName(portfolioItemName: string): string {
  const key = portfolioItemName.toLowerCase().trim()
  return COMMODITY_MAP[key] ?? portfolioItemName
}

