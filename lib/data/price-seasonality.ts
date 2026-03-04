export const PRICE_SEASONALITY: Record<
  string,
  {
    monthlyPattern: Record<
      number,
      { level: "low" | "medium" | "high"; typicalRange: [number, number] }
    >
    bestSellMonths: number[]
    worstSellMonths: number[]
    notes: string
  }
> = {
  tur: {
    monthlyPattern: {
      1: { level: "high", typicalRange: [7500, 9000] },
      2: { level: "high", typicalRange: [7800, 9200] },
      3: { level: "medium", typicalRange: [7000, 8000] },
      4: { level: "medium", typicalRange: [6800, 7500] },
      5: { level: "low", typicalRange: [6000, 7000] },
      6: { level: "low", typicalRange: [5800, 6500] },
      7: { level: "low", typicalRange: [5800, 6500] },
      8: { level: "low", typicalRange: [6000, 6800] },
      9: { level: "medium", typicalRange: [6500, 7200] },
      10: { level: "low", typicalRange: [6000, 6800] },
      11: { level: "low", typicalRange: [6200, 7000] },
      12: { level: "medium", typicalRange: [6800, 7500] },
    },
    bestSellMonths: [1, 2],
    worstSellMonths: [5, 6, 7],
    notes:
      "Tur prices peak Jan-Feb as old stock depletes before new harvest arrives",
  },
  jowar: {
    monthlyPattern: {
      1: { level: "high", typicalRange: [2800, 3400] },
      2: { level: "high", typicalRange: [2900, 3500] },
      3: { level: "medium", typicalRange: [2600, 3000] },
      4: { level: "medium", typicalRange: [2400, 2800] },
      5: { level: "low", typicalRange: [2200, 2600] },
      6: { level: "low", typicalRange: [2100, 2500] },
      7: { level: "low", typicalRange: [2100, 2500] },
      8: { level: "low", typicalRange: [2200, 2600] },
      9: { level: "medium", typicalRange: [2400, 2800] },
      10: { level: "low", typicalRange: [2200, 2600] },
      11: { level: "low", typicalRange: [2300, 2700] },
      12: { level: "medium", typicalRange: [2500, 3000] },
    },
    bestSellMonths: [1, 2],
    worstSellMonths: [5, 6, 7],
    notes:
      "Jowar follows similar pattern to tur — avoid selling immediately post-harvest",
  },
  wheat: {
    monthlyPattern: {
      1: { level: "medium", typicalRange: [2100, 2400] },
      2: { level: "medium", typicalRange: [2100, 2400] },
      3: { level: "low", typicalRange: [2000, 2300] },
      4: { level: "low", typicalRange: [1900, 2200] },
      5: { level: "medium", typicalRange: [2100, 2400] },
      6: { level: "high", typicalRange: [2300, 2700] },
      7: { level: "high", typicalRange: [2400, 2800] },
      8: { level: "high", typicalRange: [2400, 2800] },
      9: { level: "medium", typicalRange: [2200, 2600] },
      10: { level: "medium", typicalRange: [2100, 2500] },
      11: { level: "medium", typicalRange: [2100, 2400] },
      12: { level: "medium", typicalRange: [2100, 2400] },
    },
    bestSellMonths: [6, 7, 8],
    worstSellMonths: [3, 4],
    notes:
      "Wheat prices rise in summer as flour mills increase procurement",
  },
  chana: {
    monthlyPattern: {
      1: { level: "medium", typicalRange: [4800, 5500] },
      2: { level: "medium", typicalRange: [4800, 5500] },
      3: { level: "low", typicalRange: [4500, 5200] },
      4: { level: "low", typicalRange: [4500, 5000] },
      5: { level: "medium", typicalRange: [4800, 5500] },
      6: { level: "high", typicalRange: [5500, 6500] },
      7: { level: "high", typicalRange: [5500, 6500] },
      8: { level: "high", typicalRange: [5500, 6500] },
      9: { level: "medium", typicalRange: [5000, 5800] },
      10: { level: "medium", typicalRange: [4900, 5600] },
      11: { level: "medium", typicalRange: [4800, 5500] },
      12: { level: "medium", typicalRange: [4800, 5500] },
    },
    bestSellMonths: [6, 7, 8],
    worstSellMonths: [3, 4],
    notes:
      "Chana demand rises in summer — besan mills and snack manufacturers buy heavily",
  },
  mango: {
    monthlyPattern: {
      3: { level: "high", typicalRange: [40, 80] },
      4: { level: "high", typicalRange: [35, 70] },
      5: { level: "medium", typicalRange: [20, 40] },
      6: { level: "low", typicalRange: [10, 20] },
    },
    bestSellMonths: [3, 4],
    worstSellMonths: [6],
    notes:
      "Mango prices per kg — sell early in season before glut hits market",
  },
}

export function getSellWindowAdvice(
  commodityKey: string,
  currentMonth: number,
): { level: string; advice: string; potentialGain?: string } {
  const data = PRICE_SEASONALITY[commodityKey.toLowerCase()]
  if (!data) {
    return {
      level: "unknown",
      advice: "No historical data available for this crop",
    }
  }

  const current = data.monthlyPattern[currentMonth]
  if (!current) {
    return { level: "unknown", advice: "No data for this month" }
  }

  const bestMonth = data.bestSellMonths[0]
  const bestRange = data.monthlyPattern[bestMonth]

  if (data.bestSellMonths.includes(currentMonth)) {
    return {
      level: "high",
      advice:
        "NOW is a good time to sell — prices are historically at peak this month",
    }
  }

  if (data.worstSellMonths.includes(currentMonth)) {
    const potentialGain = bestRange
      ? `+₹${bestRange.typicalRange[0] - current.typicalRange[1]}/qtl potential`
      : undefined
    return {
      level: "low",
      advice: `Consider holding — prices typically rise ${
        potentialGain ? `(${potentialGain})` : "later in the year"
      }`,
      potentialGain,
    }
  }

  return {
    level: "medium",
    advice: `Moderate time to sell. ${data.notes}`,
  }
}

