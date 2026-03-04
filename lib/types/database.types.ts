// Generated manually for Shetkari-Mitra public schema
// Keep in sync with Supabase SQL schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface UsersRow {
  id: string
  auth_id: string | null
  name: string
  phone: string | null
  email: string | null
  language: string | null
  onboarding_done: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface UsersInsert {
  id?: string
  auth_id?: string | null
  name: string
  phone?: string | null
  email?: string | null
  language?: string | null
  onboarding_done?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface UsersUpdate {
  id?: string
  auth_id?: string | null
  name?: string
  phone?: string | null
  email?: string | null
  language?: string | null
  onboarding_done?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface FarmProfilesRow {
  id: string
  user_id: string | null
  village: string | null
  taluk: string | null
  district: string | null
  state: string | null
  lat: number | null
  lng: number | null
  total_acres: number | null
  soil_types: string[] | null
  agro_zone: string | null
  water_status: string | null
  capital_status: string | null
  primary_goal: string | null
  risk_appetite: string | null
  year1_target_revenue: number | null
  agent_summary: string | null
  agent_summary_updated_at: string | null
  meta: Json | null
  created_at: string | null
  updated_at: string | null
}

export interface FarmProfilesInsert {
  id?: string
  user_id?: string | null
  village?: string | null
  taluk?: string | null
  district?: string | null
  state?: string | null
  lat?: number | null
  lng?: number | null
  total_acres?: number | null
  soil_types?: string[] | null
  agro_zone?: string | null
  water_status?: string | null
  capital_status?: string | null
  primary_goal?: string | null
   risk_appetite?: string | null
  year1_target_revenue?: number | null
  agent_summary?: string | null
  agent_summary_updated_at?: string | null
  meta?: Json | null
  created_at?: string | null
  updated_at?: string | null
}

export interface FarmProfilesUpdate {
  id?: string
  user_id?: string | null
  village?: string | null
  taluk?: string | null
  district?: string | null
  state?: string | null
  lat?: number | null
  lng?: number | null
  total_acres?: number | null
  soil_types?: string[] | null
  agro_zone?: string | null
  water_status?: string | null
  capital_status?: string | null
  primary_goal?: string | null
  risk_appetite?: string | null
  year1_target_revenue?: number | null
  agent_summary?: string | null
  agent_summary_updated_at?: string | null
  meta?: Json | null
  created_at?: string | null
  updated_at?: string | null
}

export interface PlotsRow {
  id: string
  user_id: string | null
  farm_profile_id: string | null
  name: string
  area_acres: number
  ownership: string | null
  soil_type: string | null
  terrain: string | null
  irrigation_type: string | null
  notes: string | null
  is_active: boolean | null
  meta: Json | null
  created_at: string | null
}

export interface PlotsInsert {
  id?: string
  user_id?: string | null
  farm_profile_id?: string | null
  name: string
  area_acres: number
  ownership?: string | null
  soil_type?: string | null
  terrain?: string | null
  irrigation_type?: string | null
  notes?: string | null
  is_active?: boolean | null
  meta?: Json | null
  created_at?: string | null
}

export interface PlotsUpdate {
  id?: string
  user_id?: string | null
  farm_profile_id?: string | null
  name?: string
  area_acres?: number
  ownership?: string | null
  soil_type?: string | null
  terrain?: string | null
  irrigation_type?: string | null
  notes?: string | null
  is_active?: boolean | null
  meta?: Json | null
  created_at?: string | null
}

export interface WaterSourcesRow {
  id: string
  user_id: string | null
  plot_id: string | null
  type: string | null
  reliability: string | null
  depth_ft: number | null
  motor_hp: number | null
  availability_months: number[] | null
  notes: string | null
  created_at: string | null
}

export interface WaterSourcesInsert {
  id?: string
  user_id?: string | null
  plot_id?: string | null
  type?: string | null
  reliability?: string | null
  depth_ft?: number | null
  motor_hp?: number | null
  availability_months?: number[] | null
  notes?: string | null
  created_at?: string | null
}

export interface WaterSourcesUpdate {
  id?: string
  user_id?: string | null
  plot_id?: string | null
  type?: string | null
  reliability?: string | null
  depth_ft?: number | null
  motor_hp?: number | null
  availability_months?: number[] | null
  notes?: string | null
  created_at?: string | null
}

export interface AssetsRow {
  id: string
  user_id: string | null
  name: string
  category: string
  ownership: string | null
  purchase_year: number | null
  purchase_cost: number | null
  current_value: number | null
  condition: string | null
  can_rent_out: boolean | null
  rental_rate: number | null
  notes: string | null
  meta: Json | null
  created_at: string | null
}

export interface AssetsInsert {
  id?: string
  user_id?: string | null
  name: string
  category: string
  ownership?: string | null
  purchase_year?: number | null
  purchase_cost?: number | null
  current_value?: number | null
  condition?: string | null
  can_rent_out?: boolean | null
  rental_rate?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface AssetsUpdate {
  id?: string
  user_id?: string | null
  name?: string
  category?: string
  ownership?: string | null
  purchase_year?: number | null
  purchase_cost?: number | null
  current_value?: number | null
  condition?: string | null
  can_rent_out?: boolean | null
  rental_rate?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface PortfolioItemsRow {
  id: string
  user_id: string | null
  name: string
  local_name: string | null
  category: string
  sub_category: string | null
  typical_season: string[] | null
  duration_days: number | null
  water_requirement: string | null
  min_water_mm: number | null
  tree_count: number | null
  tree_age_years: number | null
  bearing_status: boolean | null
  typical_price_min: number | null
  typical_price_max: number | null
  price_unit: string | null
  mandi_commodity_code: string | null
  is_active: boolean | null
  meta: Json | null
  created_at: string | null
}

export interface PortfolioItemsInsert {
  id?: string
  user_id?: string | null
  name: string
  local_name?: string | null
  category: string
  sub_category?: string | null
  typical_season?: string[] | null
  duration_days?: number | null
  water_requirement?: string | null
  min_water_mm?: number | null
  tree_count?: number | null
  tree_age_years?: number | null
  bearing_status?: boolean | null
  typical_price_min?: number | null
  typical_price_max?: number | null
  price_unit?: string | null
  mandi_commodity_code?: string | null
  is_active?: boolean | null
  meta?: Json | null
  created_at?: string | null
}

export interface PortfolioItemsUpdate {
  id?: string
  user_id?: string | null
  name?: string
  local_name?: string | null
  category?: string
  sub_category?: string | null
  typical_season?: string[] | null
  duration_days?: number | null
  water_requirement?: string | null
  min_water_mm?: number | null
  tree_count?: number | null
  tree_age_years?: number | null
  bearing_status?: boolean | null
  typical_price_min?: number | null
  typical_price_max?: number | null
  price_unit?: string | null
  mandi_commodity_code?: string | null
  is_active?: boolean | null
  meta?: Json | null
  created_at?: string | null
}

export interface SeasonsRow {
  id: string
  user_id: string | null
  name: string
  type: string
  year: number
  start_date: string | null
  end_date: string | null
  rainfall_mm: number | null
  notes: string | null
}

export interface SeasonsInsert {
  id?: string
  user_id?: string | null
  name: string
  type: string
  year: number
  start_date?: string | null
  end_date?: string | null
  rainfall_mm?: number | null
  notes?: string | null
}

export interface SeasonsUpdate {
  id?: string
  user_id?: string | null
  name?: string
  type?: string
  year?: number
  start_date?: string | null
  end_date?: string | null
  rainfall_mm?: number | null
  notes?: string | null
}

export interface CropCyclesRow {
  id: string
  user_id: string | null
  plot_id: string | null
  season_id: string | null
  portfolio_item_id: string | null
  area_acres: number | null
  sowing_date: string | null
  expected_harvest_date: string | null
  actual_harvest_date: string | null
  seed_variety: string | null
  expected_yield_qtl: number | null
  actual_yield_qtl: number | null
  status: string | null
  total_input_cost: number | null
  total_revenue: number | null
  net_profit: number | null
  profit_per_acre: number | null
  notes: string | null
  meta: Json | null
  created_at: string | null
  updated_at: string | null
}

export interface CropCyclesInsert {
  id?: string
  user_id?: string | null
  plot_id?: string | null
  season_id?: string | null
  portfolio_item_id?: string | null
  area_acres?: number | null
  sowing_date?: string | null
  expected_harvest_date?: string | null
  actual_harvest_date?: string | null
  seed_variety?: string | null
  expected_yield_qtl?: number | null
  actual_yield_qtl?: number | null
  status?: string | null
  total_input_cost?: number | null
  total_revenue?: number | null
  net_profit?: number | null
  profit_per_acre?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CropCyclesUpdate {
  id?: string
  user_id?: string | null
  plot_id?: string | null
  season_id?: string | null
  portfolio_item_id?: string | null
  area_acres?: number | null
  sowing_date?: string | null
  expected_harvest_date?: string | null
  actual_harvest_date?: string | null
  seed_variety?: string | null
  expected_yield_qtl?: number | null
  actual_yield_qtl?: number | null
  status?: string | null
  total_input_cost?: number | null
  total_revenue?: number | null
  net_profit?: number | null
  profit_per_acre?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CropCycleTasksRow {
  id: string
  crop_cycle_id: string | null
  user_id: string | null
  task_type: string | null
  title: string
  scheduled_date: string | null
  completed_date: string | null
  status: string | null
  cost: number | null
  notes: string | null
  meta: Json | null
  created_at: string | null
}

export interface CropCycleTasksInsert {
  id?: string
  crop_cycle_id?: string | null
  user_id?: string | null
  task_type?: string | null
  title: string
  scheduled_date?: string | null
  completed_date?: string | null
  status?: string | null
  cost?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface CropCycleTasksUpdate {
  id?: string
  crop_cycle_id?: string | null
  user_id?: string | null
  task_type?: string | null
  title?: string
  scheduled_date?: string | null
  completed_date?: string | null
  status?: string | null
  cost?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface TransactionsRow {
  id: string
  user_id: string | null
  type: string
  category: string
  amount: number
  date: string
  crop_cycle_id: string | null
  asset_id: string | null
  description: string | null
  payment_method: string | null
  meta: Json | null
  created_at: string | null
}

export interface TransactionsInsert {
  id?: string
  user_id?: string | null
  type: string
  category: string
  amount: number
  date: string
  crop_cycle_id?: string | null
  asset_id?: string | null
  description?: string | null
  payment_method?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface TransactionsUpdate {
  id?: string
  user_id?: string | null
  type?: string
  category?: string
  amount?: number
  date?: string
  crop_cycle_id?: string | null
  asset_id?: string | null
  description?: string | null
  payment_method?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface SalesRow {
  id: string
  user_id: string | null
  crop_cycle_id: string | null
  transaction_id: string | null
  sale_date: string
  portfolio_item_id: string | null
  quantity: number | null
  unit: string | null
  price_per_unit: number | null
  total_amount: number | null
  buyer_type: string | null
  buyer_name: string | null
  buyer_location: string | null
  channel: string | null
  market_price_that_day: number | null
  price_vs_market: number | null
  notes: string | null
  meta: Json | null
  created_at: string | null
}

export interface SalesInsert {
  id?: string
  user_id?: string | null
  crop_cycle_id?: string | null
  transaction_id?: string | null
  sale_date: string
  portfolio_item_id?: string | null
  quantity?: number | null
  unit?: string | null
  price_per_unit?: number | null
  total_amount?: number | null
  buyer_type?: string | null
  buyer_name?: string | null
  buyer_location?: string | null
  channel?: string | null
  market_price_that_day?: number | null
  price_vs_market?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface SalesUpdate {
  id?: string
  user_id?: string | null
  crop_cycle_id?: string | null
  transaction_id?: string | null
  sale_date?: string
  portfolio_item_id?: string | null
  quantity?: number | null
  unit?: string | null
  price_per_unit?: number | null
  total_amount?: number | null
  buyer_type?: string | null
  buyer_name?: string | null
  buyer_location?: string | null
  channel?: string | null
  market_price_that_day?: number | null
  price_vs_market?: number | null
  notes?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface InputPurchasesRow {
  id: string
  user_id: string | null
  crop_cycle_id: string | null
  transaction_id: string | null
  input_type: string | null
  product_name: string | null
  quantity: number | null
  unit: string | null
  price_per_unit: number | null
  total_cost: number | null
  supplier: string | null
  purchase_date: string | null
  meta: Json | null
  created_at: string | null
}

export interface InputPurchasesInsert {
  id?: string
  user_id?: string | null
  crop_cycle_id?: string | null
  transaction_id?: string | null
  input_type?: string | null
  product_name?: string | null
  quantity?: number | null
  unit?: string | null
  price_per_unit?: number | null
  total_cost?: number | null
  supplier?: string | null
  purchase_date?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface InputPurchasesUpdate {
  id?: string
  user_id?: string | null
  crop_cycle_id?: string | null
  transaction_id?: string | null
  input_type?: string | null
  product_name?: string | null
  quantity?: number | null
  unit?: string | null
  price_per_unit?: number | null
  total_cost?: number | null
  supplier?: string | null
  purchase_date?: string | null
  meta?: Json | null
  created_at?: string | null
}

export interface MarketPricesRow {
  id: string
  commodity: string
  mandi_name: string
  district: string | null
  state: string | null
  price_date: string
  min_price: number | null
  max_price: number | null
  modal_price: number | null
  unit: string | null
}

export interface MarketPricesInsert {
  id?: string
  commodity: string
  mandi_name: string
  district?: string | null
  state?: string | null
  price_date: string
  min_price?: number | null
  max_price?: number | null
  modal_price?: number | null
  unit?: string | null
}

export interface MarketPricesUpdate {
  id?: string
  commodity?: string
  mandi_name?: string
  district?: string | null
  state?: string | null
  price_date?: string
  min_price?: number | null
  max_price?: number | null
  modal_price?: number | null
  unit?: string | null
}

export interface PriceAlertsRow {
  id: string
  user_id: string | null
  portfolio_item_id: string | null
  alert_type: string | null
  threshold_value: number | null
  is_active: boolean | null
  created_by: string | null
  last_triggered: string | null
  created_at: string | null
}

export interface PriceAlertsInsert {
  id?: string
  user_id?: string | null
  portfolio_item_id?: string | null
  alert_type?: string | null
  threshold_value?: number | null
  is_active?: boolean | null
  created_by?: string | null
  last_triggered?: string | null
  created_at?: string | null
}

export interface PriceAlertsUpdate {
  id?: string
  user_id?: string | null
  portfolio_item_id?: string | null
  alert_type?: string | null
  threshold_value?: number | null
  is_active?: boolean | null
  created_by?: string | null
  last_triggered?: string | null
  created_at?: string | null
}

export interface AgentContextCacheRow {
  id: string
  user_id: string | null
  farm_summary: string | null
  financial_summary: string | null
  market_summary: string | null
  recent_decisions: string | null
  active_opportunities: string | null
  risk_flags: string | null
  total_tokens_estimate: number | null
  rebuilt_at: string | null
}

export interface AgentContextCacheInsert {
  id?: string
  user_id?: string | null
  farm_summary?: string | null
  financial_summary?: string | null
  market_summary?: string | null
  recent_decisions?: string | null
  active_opportunities?: string | null
  risk_flags?: string | null
  total_tokens_estimate?: number | null
  rebuilt_at?: string | null
}

export interface AgentContextCacheUpdate {
  id?: string
  user_id?: string | null
  farm_summary?: string | null
  financial_summary?: string | null
  market_summary?: string | null
  recent_decisions?: string | null
  active_opportunities?: string | null
  risk_flags?: string | null
  total_tokens_estimate?: number | null
  rebuilt_at?: string | null
}

export interface AgentInteractionsRow {
  id: string
  user_id: string | null
  input_type: string | null
  user_message: string
  agent_response: string
  context_used: string | null
  tokens_used: number | null
  cost_usd: number | null
  user_rating: number | null
  was_acted_upon: boolean | null
  created_at: string | null
}

export interface AgentInteractionsInsert {
  id?: string
  user_id?: string | null
  input_type?: string | null
  user_message: string
  agent_response: string
  context_used?: string | null
  tokens_used?: number | null
  cost_usd?: number | null
  user_rating?: number | null
  was_acted_upon?: boolean | null
  created_at?: string | null
}

export interface AgentInteractionsUpdate {
  id?: string
  user_id?: string | null
  input_type?: string | null
  user_message?: string
  agent_response?: string
  context_used?: string | null
  tokens_used?: number | null
  cost_usd?: number | null
  user_rating?: number | null
  was_acted_upon?: boolean | null
  created_at?: string | null
}

export interface AgentRecommendationsRow {
  id: string
  user_id: string | null
  interaction_id: string | null
  category: string | null
  recommendation: string
  confidence: string | null
  expected_benefit: number | null
  status: string | null
  actual_outcome: string | null
  actual_benefit: number | null
  created_at: string | null
  resolved_at: string | null
}

export interface AgentRecommendationsInsert {
  id?: string
  user_id?: string | null
  interaction_id?: string | null
  category?: string | null
  recommendation: string
  confidence?: string | null
  expected_benefit?: number | null
  status?: string | null
  actual_outcome?: string | null
  actual_benefit?: number | null
  created_at?: string | null
  resolved_at?: string | null
}

export interface AgentRecommendationsUpdate {
  id?: string
  user_id?: string | null
  interaction_id?: string | null
  category?: string | null
  recommendation?: string
  confidence?: string | null
  expected_benefit?: number | null
  status?: string | null
  actual_outcome?: string | null
  actual_benefit?: number | null
  created_at?: string | null
  resolved_at?: string | null
}

export interface AgentAlertsRow {
  id: string
  user_id: string | null
  alert_type: string | null
  priority: string | null
  title: string
  body: string
  action_url: string | null
  is_delivered: boolean | null
  is_read: boolean | null
  delivered_at: string | null
  created_at: string | null
  expires_at: string | null
}

export interface AgentAlertsInsert {
  id?: string
  user_id?: string | null
  alert_type?: string | null
  priority?: string | null
  title: string
  body: string
  action_url?: string | null
  is_delivered?: boolean | null
  is_read?: boolean | null
  delivered_at?: string | null
  created_at?: string | null
  expires_at?: string | null
}

export interface AgentAlertsUpdate {
  id?: string
  user_id?: string | null
  alert_type?: string | null
  priority?: string | null
  title?: string
  body?: string
  action_url?: string | null
  is_delivered?: boolean | null
  is_read?: boolean | null
  delivered_at?: string | null
  created_at?: string | null
  expires_at?: string | null
}

export interface BusinessOpportunitiesRow {
  id: string
  user_id: string | null
  title: string
  category: string | null
  source: string | null
  description: string | null
  investment_min: number | null
  investment_max: number | null
  revenue_potential_monthly: number | null
  timeline_months: number | null
  difficulty: string | null
  capital_required: string | null
  related_portfolio_items: string[] | null
  status: string | null
  user_notes: string | null
  meta: Json | null
  created_at: string | null
  updated_at: string | null
}

export interface BusinessOpportunitiesInsert {
  id?: string
  user_id?: string | null
  title: string
  category?: string | null
  source?: string | null
  description?: string | null
  investment_min?: number | null
  investment_max?: number | null
  revenue_potential_monthly?: number | null
  timeline_months?: number | null
  difficulty?: string | null
  capital_required?: string | null
  related_portfolio_items?: string[] | null
  status?: string | null
  user_notes?: string | null
  meta?: Json | null
  created_at?: string | null
  updated_at?: string | null
}

export interface BusinessOpportunitiesUpdate {
  id?: string
  user_id?: string | null
  title?: string
  category?: string | null
  source?: string | null
  description?: string | null
  investment_min?: number | null
  investment_max?: number | null
  revenue_potential_monthly?: number | null
  timeline_months?: number | null
  difficulty?: string | null
  capital_required?: string | null
  related_portfolio_items?: string[] | null
  status?: string | null
  user_notes?: string | null
  meta?: Json | null
  created_at?: string | null
  updated_at?: string | null
}

export interface FarmLearningsRow {
  id: string
  user_id: string | null
  category: string | null
  learning: string
  context: Json | null
  confidence: string | null
  times_confirmed: number | null
  created_at: string | null
  last_confirmed: string | null
}

export interface FarmLearningsInsert {
  id?: string
  user_id?: string | null
  category?: string | null
  learning: string
  context?: Json | null
  confidence?: string | null
  times_confirmed?: number | null
  created_at?: string | null
  last_confirmed?: string | null
}

export interface FarmLearningsUpdate {
  id?: string
  user_id?: string | null
  category?: string | null
  learning?: string
  context?: Json | null
  confidence?: string | null
  times_confirmed?: number | null
  created_at?: string | null
  last_confirmed?: string | null
}

export interface ExternalNewsRow {
  id: string
  user_id: string | null
  headline: string
  summary: string | null
  source: string | null
  url: string | null
  relevance_tags: string[] | null
  relevance_score: number | null
  is_read: boolean | null
  published_at: string | null
  fetched_at: string | null
}

export interface ExternalNewsInsert {
  id?: string
  user_id?: string | null
  headline: string
  summary?: string | null
  source?: string | null
  url?: string | null
  relevance_tags?: string[] | null
  relevance_score?: number | null
  is_read?: boolean | null
  published_at?: string | null
  fetched_at?: string | null
}

export interface ExternalNewsUpdate {
  id?: string
  user_id?: string | null
  headline?: string
  summary?: string | null
  source?: string | null
  url?: string | null
  relevance_tags?: string[] | null
  relevance_score?: number | null
  is_read?: boolean | null
  published_at?: string | null
  fetched_at?: string | null
}

export interface SchemesMasterRow {
  id: string
  name: string
  short_name: string | null
  category: string | null
  eligibility_criteria: Json | null
  benefit_description: string | null
  benefit_amount: string | null
  apply_url: string | null
  is_active: boolean | null
}

export interface SchemesMasterInsert {
  id?: string
  name: string
  short_name?: string | null
  category?: string | null
  eligibility_criteria?: Json | null
  benefit_description?: string | null
  benefit_amount?: string | null
  apply_url?: string | null
  is_active?: boolean | null
}

export interface SchemesMasterUpdate {
  id?: string
  name?: string
  short_name?: string | null
  category?: string | null
  eligibility_criteria?: Json | null
  benefit_description?: string | null
  benefit_amount?: string | null
  apply_url?: string | null
  is_active?: boolean | null
}

export interface UserSchemeApplicationsRow {
  id: string
  user_id: string | null
  scheme_id: string | null
  status: string | null
  applied_date: string | null
  approved_date: string | null
  total_received: number | null
  notes: string | null
  meta: Json | null
}

export interface UserSchemeApplicationsInsert {
  id?: string
  user_id?: string | null
  scheme_id?: string | null
  status?: string | null
  applied_date?: string | null
  approved_date?: string | null
  total_received?: number | null
  notes?: string | null
  meta?: Json | null
}

export interface UserSchemeApplicationsUpdate {
  id?: string
  user_id?: string | null
  scheme_id?: string | null
  status?: string | null
  applied_date?: string | null
  approved_date?: string | null
  total_received?: number | null
  notes?: string | null
  meta?: Json | null
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow
        Insert: UsersInsert
        Update: UsersUpdate
        Relationships: [
          {
            foreignKeyName: "users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      farm_profiles: {
        Row: FarmProfilesRow
        Insert: FarmProfilesInsert
        Update: FarmProfilesUpdate
        Relationships: [
          {
            foreignKeyName: "farm_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      plots: {
        Row: PlotsRow
        Insert: PlotsInsert
        Update: PlotsUpdate
        Relationships: [
          {
            foreignKeyName: "plots_farm_profile_id_fkey"
            columns: ["farm_profile_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      water_sources: {
        Row: WaterSourcesRow
        Insert: WaterSourcesInsert
        Update: WaterSourcesUpdate
        Relationships: [
          {
            foreignKeyName: "water_sources_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      assets: {
        Row: AssetsRow
        Insert: AssetsInsert
        Update: AssetsUpdate
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      portfolio_items: {
        Row: PortfolioItemsRow
        Insert: PortfolioItemsInsert
        Update: PortfolioItemsUpdate
        Relationships: [
          {
            foreignKeyName: "portfolio_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      seasons: {
        Row: SeasonsRow
        Insert: SeasonsInsert
        Update: SeasonsUpdate
        Relationships: [
          {
            foreignKeyName: "seasons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      crop_cycles: {
        Row: CropCyclesRow
        Insert: CropCyclesInsert
        Update: CropCyclesUpdate
        Relationships: [
          {
            foreignKeyName: "crop_cycles_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_portfolio_item_id_fkey"
            columns: ["portfolio_item_id"]
            isOneToOne: false
            referencedRelation: "portfolio_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      crop_cycle_tasks: {
        Row: CropCycleTasksRow
        Insert: CropCycleTasksInsert
        Update: CropCycleTasksUpdate
        Relationships: [
          {
            foreignKeyName: "crop_cycle_tasks_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycle_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: TransactionsRow
        Insert: TransactionsInsert
        Update: TransactionsUpdate
        Relationships: [
          {
            foreignKeyName: "transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: SalesRow
        Insert: SalesInsert
        Update: SalesUpdate
        Relationships: [
          {
            foreignKeyName: "sales_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_portfolio_item_id_fkey"
            columns: ["portfolio_item_id"]
            isOneToOne: false
            referencedRelation: "portfolio_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      input_purchases: {
        Row: InputPurchasesRow
        Insert: InputPurchasesInsert
        Update: InputPurchasesUpdate
        Relationships: [
          {
            foreignKeyName: "input_purchases_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "input_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "input_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      market_prices: {
        Row: MarketPricesRow
        Insert: MarketPricesInsert
        Update: MarketPricesUpdate
        Relationships: []
      }
      price_alerts: {
        Row: PriceAlertsRow
        Insert: PriceAlertsInsert
        Update: PriceAlertsUpdate
        Relationships: [
          {
            foreignKeyName: "price_alerts_portfolio_item_id_fkey"
            columns: ["portfolio_item_id"]
            isOneToOne: false
            referencedRelation: "portfolio_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_context_cache: {
        Row: AgentContextCacheRow
        Insert: AgentContextCacheInsert
        Update: AgentContextCacheUpdate
        Relationships: [
          {
            foreignKeyName: "agent_context_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_interactions: {
        Row: AgentInteractionsRow
        Insert: AgentInteractionsInsert
        Update: AgentInteractionsUpdate
        Relationships: [
          {
            foreignKeyName: "agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_recommendations: {
        Row: AgentRecommendationsRow
        Insert: AgentRecommendationsInsert
        Update: AgentRecommendationsUpdate
        Relationships: [
          {
            foreignKeyName: "agent_recommendations_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "agent_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_alerts: {
        Row: AgentAlertsRow
        Insert: AgentAlertsInsert
        Update: AgentAlertsUpdate
        Relationships: [
          {
            foreignKeyName: "agent_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      business_opportunities: {
        Row: BusinessOpportunitiesRow
        Insert: BusinessOpportunitiesInsert
        Update: BusinessOpportunitiesUpdate
        Relationships: [
          {
            foreignKeyName: "business_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      farm_learnings: {
        Row: FarmLearningsRow
        Insert: FarmLearningsInsert
        Update: FarmLearningsUpdate
        Relationships: [
          {
            foreignKeyName: "farm_learnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      external_news: {
        Row: ExternalNewsRow
        Insert: ExternalNewsInsert
        Update: ExternalNewsUpdate
        Relationships: [
          {
            foreignKeyName: "external_news_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      schemes_master: {
        Row: SchemesMasterRow
        Insert: SchemesMasterInsert
        Update: SchemesMasterUpdate
        Relationships: []
      }
      user_scheme_applications: {
        Row: UserSchemeApplicationsRow
        Insert: UserSchemeApplicationsInsert
        Update: UserSchemeApplicationsUpdate
        Relationships: [
          {
            foreignKeyName: "user_scheme_applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scheme_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

