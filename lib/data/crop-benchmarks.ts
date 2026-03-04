export const CROP_BENCHMARKS: Record<
  string,
  {
    yieldPerAcre: { min: number; max: number; unit: string }
    durationDays: number
    waterRequirement: string
    typicalInputCostPerAcre: number
    season: string[]
  }
> = {
  tur: {
    yieldPerAcre: { min: 4, max: 8, unit: "quintal" },
    durationDays: 150,
    waterRequirement: "low",
    typicalInputCostPerAcre: 8000,
    season: ["kharif"],
  },
  jowar: {
    yieldPerAcre: { min: 6, max: 12, unit: "quintal" },
    durationDays: 110,
    waterRequirement: "low",
    typicalInputCostPerAcre: 6000,
    season: ["kharif", "rabi"],
  },
  bajra: {
    yieldPerAcre: { min: 8, max: 15, unit: "quintal" },
    durationDays: 90,
    waterRequirement: "low",
    typicalInputCostPerAcre: 5500,
    season: ["kharif"],
  },
  wheat: {
    yieldPerAcre: { min: 10, max: 18, unit: "quintal" },
    durationDays: 120,
    waterRequirement: "medium",
    typicalInputCostPerAcre: 9000,
    season: ["rabi"],
  },
  chana: {
    yieldPerAcre: { min: 5, max: 9, unit: "quintal" },
    durationDays: 105,
    waterRequirement: "low",
    typicalInputCostPerAcre: 7000,
    season: ["rabi"],
  },
  sunflower: {
    yieldPerAcre: { min: 4, max: 7, unit: "quintal" },
    durationDays: 95,
    waterRequirement: "low",
    typicalInputCostPerAcre: 7500,
    season: ["rabi", "summer"],
  },
  mango: {
    yieldPerAcre: { min: 800, max: 1500, unit: "kg" },
    durationDays: 90,
    waterRequirement: "low",
    typicalInputCostPerAcre: 5000,
    season: ["summer"],
  },
  guava: {
    yieldPerAcre: { min: 1000, max: 2000, unit: "kg" },
    durationDays: 60,
    waterRequirement: "low",
    typicalInputCostPerAcre: 4000,
    season: ["kharif", "rabi"],
  },
}

export function getBenchmark(cropName: string) {
  const key = cropName.toLowerCase().trim()
  return CROP_BENCHMARKS[key] ?? null
}

