export interface Tool {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: Record<
      string,
      {
        type: string
        description: string
        enum?: string[]
        required?: boolean
      }
    >
    required: string[]
  }
}

export const AGENT_TOOLS: Tool[] = [
  // ─── READ TOOLS ───────────────────────────────────────

  {
    name: "get_mandi_prices",
    description:
      "Get current mandi prices for a commodity. Use when user asks about prices, rates, market rates, bhav.",
    parameters: {
      type: "object",
      properties: {
        commodity: {
          type: "string",
          description:
            "Crop name e.g. tur, jowar, wheat, mango. Use lowercase.",
        },
        days_back: {
          type: "number",
          description: "How many days of price history to fetch. Default 7.",
        },
      },
      required: ["commodity"],
    },
  },

  {
    name: "get_weather",
    description:
      "Get current weather and 7-day forecast for the farm location. Use when user asks about rain, temperature, when to irrigate, spray timing.",
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of forecast days. Default 7.",
        },
      },
      required: [],
    },
  },

  {
    name: "get_active_crop_cycles",
    description:
      "Get all active crop cycles with their current status, financials, and overdue tasks. Use when user asks about crops, kharif/rabi season, crop status.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description:
            "Filter by status. Options: planned, sowing, growing, harvested, all",
          enum: ["planned", "sowing", "growing", "harvested", "all"],
        },
      },
      required: [],
    },
  },

  {
    name: "get_overdue_tasks",
    description:
      "Get all overdue and upcoming farm tasks across all active crop cycles. Use when user asks about pending work, what to do today/this week.",
    parameters: {
      type: "object",
      properties: {
        days_ahead: {
          type: "number",
          description:
            "How many days ahead to look for upcoming tasks. Default 7.",
        },
      },
      required: [],
    },
  },

  {
    name: "get_financial_summary",
    description:
      "Get P&L summary, recent transactions, and income vs expense breakdown. Use when user asks about profits, losses, how much earned, finances.",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period for summary",
          enum: ["this_month", "this_season", "this_year", "all_time"],
        },
      },
      required: [],
    },
  },

  {
    name: "get_schemes",
    description:
      "Get government schemes the farmer qualifies for with eligibility status. Use when user asks about schemes, subsidies, government help, PM-KISAN, PMFBY etc.",
    parameters: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Filter schemes",
          enum: ["eligible_only", "not_applied", "all"],
        },
      },
      required: [],
    },
  },

  {
    name: "get_opportunities",
    description:
      "Get active business opportunities and their status. Use when user asks about business ideas, extra income, what else can I do.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Filter by status",
          enum: ["active", "exploring", "idea", "all"],
        },
      },
      required: [],
    },
  },

  {
    name: "get_sale_history",
    description:
      "Get history of past sales with prices and buyer details. Use when user asks about previous sales, what price I sold at, sales history.",
    parameters: {
      type: "object",
      properties: {
        commodity: {
          type: "string",
          description: "Filter by crop name. Leave empty for all sales.",
        },
        limit: {
          type: "number",
          description: "Number of records to fetch. Default 10.",
        },
      },
      required: [],
    },
  },

  // ─── WRITE TOOLS ──────────────────────────────────────

  {
    name: "log_sale",
    description:
      "Record a sale transaction. Use ONLY when user explicitly says they sold something and provides enough details. Always confirm details before calling.",
    parameters: {
      type: "object",
      properties: {
        commodity: {
          type: "string",
          description: "What was sold e.g. tur, jowar, mango",
        },
        quantity: {
          type: "number",
          description: "How much was sold",
        },
        unit: {
          type: "string",
          description: "Unit of quantity",
          enum: ["quintal", "kg", "piece", "dozen", "litre"],
        },
        price_per_unit: {
          type: "number",
          description: "Price per unit in rupees",
        },
        buyer_type: {
          type: "string",
          description: "Who bought it",
          enum: ["trader", "mandi", "direct", "processor", "other"],
        },
        sale_date: {
          type: "string",
          description:
            "Date of sale in YYYY-MM-DD format. Use today if not specified.",
        },
        notes: {
          type: "string",
          description: "Any additional notes",
        },
      },
      required: ["commodity", "quantity", "unit", "price_per_unit"],
    },
  },

  {
    name: "log_expense",
    description:
      "Record a farm expense. Use ONLY when user explicitly mentions spending money on something. Always confirm amount and category before calling.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Expense category",
          enum: [
            "seed",
            "fertilizer",
            "pesticide",
            "labor",
            "fuel",
            "equipment",
            "irrigation",
            "storage",
            "other",
          ],
        },
        amount: {
          type: "number",
          description: "Amount in rupees",
        },
        description: {
          type: "string",
          description: "What was purchased or paid for",
        },
        date: {
          type: "string",
          description:
            "Date in YYYY-MM-DD format. Use today if not specified.",
        },
      },
      required: ["category", "amount", "description"],
    },
  },

  {
    name: "complete_task",
    description:
      "Mark a farm task as done. Use when user says they completed a farming activity like spraying, irrigation, fertilizing.",
    parameters: {
      type: "object",
      properties: {
        task_title_keyword: {
          type: "string",
          description:
            "A keyword from the task title to identify which task to mark done e.g. 'spray', 'irrigate', 'fertilize'",
        },
        actual_cost: {
          type: "number",
          description: "What it actually cost in rupees. Optional.",
        },
        notes: {
          type: "string",
          description: "Any notes about how the task went",
        },
      },
      required: ["task_title_keyword"],
    },
  },

  {
    name: "set_price_alert",
    description:
      "Set a price alert for a commodity. Use when user says notify me when price reaches X, or alert me if tur goes above Y.",
    parameters: {
      type: "object",
      properties: {
        commodity: {
          type: "string",
          description: "Crop name",
        },
        alert_type: {
          type: "string",
          description:
            "Alert when price goes above or below threshold",
          enum: ["above", "below"],
        },
        threshold_price: {
          type: "number",
          description:
            "Price threshold in rupees per quintal",
        },
      },
      required: ["commodity", "alert_type", "threshold_price"],
    },
  },

  {
    name: "save_learning",
    description:
      "Save an important farming insight or lesson to memory. Use when user shares something they learned, observed, or wants to remember.",
    parameters: {
      type: "object",
      properties: {
        learning: {
          type: "string",
          description: "The insight or lesson to remember",
        },
        category: {
          type: "string",
          description: "Category of learning",
          enum: [
            "crop",
            "market",
            "financial",
            "weather",
            "business",
            "soil",
            "pest",
            "other",
          ],
        },
      },
      required: ["learning", "category"],
    },
  },

  {
    name: "add_opportunity",
    description:
      "Add a new business opportunity idea. Use when user mentions a new income idea they want to track.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Short title for the opportunity",
        },
        description: {
          type: "string",
          description: "What the opportunity involves",
        },
        estimated_monthly_revenue: {
          type: "number",
          description:
            "Estimated monthly revenue potential in rupees",
        },
        capital_required: {
          type: "string",
          description: "How much capital needed to start",
          enum: ["zero", "low", "medium", "high"],
        },
      },
      required: ["title", "description"],
    },
  },
]

export type ToolName = (typeof AGENT_TOOLS)[number]["name"]

