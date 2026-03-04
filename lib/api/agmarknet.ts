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

// Each key maps to ALL possible names this commodity appears as
// in the Agmarknet/data.gov.in API across different mandis.
export const COMMODITY_MAP: Record<string, string[]> = {
  tur: ["Arhar (Tur)", "Tur", "Arhar", "Tur Dal", "Pigeon Pea"],
  toor: ["Arhar (Tur)", "Tur", "Arhar"],
  arhar: ["Arhar (Tur)", "Tur", "Arhar"],
  jowar: ["Jowar", "Sorghum", "Jowar(White)", "Jowar(Red)", "Jawar"],
  bajra: ["Bajra", "Bajra(Cumbu)", "Pearl Millet", "Sajje"],
  wheat: ["Wheat", "Gehun"],
  gehu: ["Wheat", "Gehun"],
  chana: [
    "Gram",
    "Bengal Gram",
    "Chana",
    "Gram(Whole)",
    "Chickpeas",
    "Black Gram",
  ],
  gram: ["Gram", "Bengal Gram", "Gram(Whole)", "Chickpeas"],
  mango: ["Mango", "Mango (Raw)", "Mango (Ripe)", "Mango(Ripe)"],
  guava: ["Guava"],
  sunflower: ["Sunflower", "Sunflower Seed", "Sunflower Oil Seed"],
  onion: ["Onion", "Onion Big", "Onion Small", "Kanda"],
  tomato: ["Tomato"],
  groundnut: [
    "Groundnut",
    "Groundnut (Split)",
    "Ground Nut Seed",
    "Groundnut (With Shell)",
  ],
  maize: ["Maize", "Corn"],
  cotton: ["Cotton", "Cotton(Lint)", "Cotton Seed", "Kapas"],
  soybean: ["Soyabean", "Soybean", "Soya Bean"],
  turmeric: ["Turmeric", "Haldi"],
  coriander: ["Coriander(Leaves)", "Coriander Seed", "Coriander"],
}

// Normalize any user-facing crop name (including ones with
// brackets like "Tur (Pigeon pea)") to a simple key that we
// reuse across API calls and seasonality logic.
export function getCommodityKey(name: string): string {
  const raw = name.toLowerCase().trim()
  // Strip trailing bracketed explanations, e.g.
  // "tur (pigeon pea)" -> "tur"
  const base = raw.replace(/\s*\(.*?\)\s*$/, "")
  return base
}

// Returns the PRIMARY commodity name (first in array) for display and storage.
export function getCommodityName(portfolioItemName: string): string {
  const key = getCommodityKey(portfolioItemName)
  const variants = COMMODITY_MAP[key]
  if (variants && variants.length > 0) return variants[0]

  // Fallback: try direct lookup
  const directKey = portfolioItemName.toLowerCase().trim()
  return COMMODITY_MAP[directKey]?.[0] ?? portfolioItemName
}

// Returns ALL possible names for this commodity — used in sync to cast a wide net.
export function getCommodityVariants(portfolioItemName: string): string[] {
  const key = getCommodityKey(portfolioItemName)
  const variants = COMMODITY_MAP[key]
  if (variants && variants.length > 0) return variants

  const directKey = portfolioItemName.toLowerCase().trim()
  return COMMODITY_MAP[directKey] ?? [portfolioItemName]
}

