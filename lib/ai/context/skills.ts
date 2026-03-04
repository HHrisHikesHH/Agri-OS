import {
  FINANCIAL_REASONER_PROMPT,
} from "../prompts/skills/financial-reasoner"
import { MARKET_ANALYST_PROMPT } from "../prompts/skills/market-analyst"
import {
  OPPORTUNITY_SPOTTER_PROMPT,
} from "../prompts/skills/opportunity-spotter"
import { CROP_PLANNER_PROMPT } from "../prompts/skills/crop-planner"
import {
  SCHEME_NAVIGATOR_PROMPT,
} from "../prompts/skills/scheme-navigator"
import { RISK_ALERTER_PROMPT } from "../prompts/skills/risk-alerter"

export type Skill =
  | "financial-reasoner"
  | "market-analyst"
  | "opportunity-spotter"
  | "crop-planner"
  | "scheme-navigator"
  | "risk-alerter"
  | "general"

export function detectSkill(userMessage: string): Skill {
  const msg = userMessage.toLowerCase()

  if (
    /profit|loss|revenue|expense|cost|spend|earn|money|rupee|sale|p&l|income/.test(
      msg,
    )
  ) {
    return "financial-reasoner"
  }
  if (
    /price|sell|market|mandi|rate|when.*sell|hold|buyer/.test(msg)
  ) {
    return "market-analyst"
  }
  if (
    /business|idea|start|manufacture|process|dal|pulp|brand|export|income.*extra/.test(
      msg,
    )
  ) {
    return "opportunity-spotter"
  }
  if (
    /grow|crop|sow|plant|harvest|rotation|season|kharif|rabi|yield/.test(
      msg,
    )
  ) {
    return "crop-planner"
  }
  if (
    /scheme|subsidy|government|pm-kisan|insurance|loan|kcc|apply/.test(
      msg,
    )
  ) {
    return "scheme-navigator"
  }
  if (
    /risk|weather|rain|pest|disease|problem|worried|concern|danger/.test(
      msg,
    )
  ) {
    return "risk-alerter"
  }

  return "general"
}

export function getSkillPrompt(skill: Skill): string {
  switch (skill) {
    case "financial-reasoner":
      return FINANCIAL_REASONER_PROMPT
    case "market-analyst":
      return MARKET_ANALYST_PROMPT
    case "opportunity-spotter":
      return OPPORTUNITY_SPOTTER_PROMPT
    case "crop-planner":
      return CROP_PLANNER_PROMPT
    case "scheme-navigator":
      return SCHEME_NAVIGATOR_PROMPT
    case "risk-alerter":
      return RISK_ALERTER_PROMPT
    default:
      return ""
  }
}

export function getSkillLabel(skill: Skill): string {
  const labels: Record<Skill, string> = {
    "financial-reasoner": "💰 Financial Analysis",
    "market-analyst": "📊 Market Intelligence",
    "opportunity-spotter": "💡 Business Opportunities",
    "crop-planner": "🌾 Crop Planning",
    "scheme-navigator": "🏛️ Government Schemes",
    "risk-alerter": "⚠️ Risk Assessment",
    general: "🤖 General",
  }
  return labels[skill]
}

