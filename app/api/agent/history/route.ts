import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import type {
  AgentInteractionsRow,
  UsersRow,
} from "@/lib/types/database.types"

const DEFAULT_LIMIT = 20

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    )
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (!userRow) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 },
    )
  }

  const u = userRow as UsersRow
  const { searchParams } = new URL(request.url)
  const before = searchParams.get("before")
  const limitParam = searchParams.get("limit")
  const limit = limitParam
    ? Math.min(
        Math.max(parseInt(limitParam, 10) || DEFAULT_LIMIT, 1),
        100,
      )
    : DEFAULT_LIMIT

  let query = supabase
    .from("agent_interactions")
    .select("*")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt("created_at", before)
  }

  const { data: interactionsRaw, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    )
  }

  const interactions =
    (interactionsRaw as AgentInteractionsRow[] | null) ?? []

  return NextResponse.json({
    interactions,
    hasMore: interactions.length === limit,
  })
}

