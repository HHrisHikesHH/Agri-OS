import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import {
  buildFarmContext,
  saveContextCache,
} from "@/lib/ai/context/builder"
import type { UsersRow } from "@/lib/types/database.types"

export async function POST(_request: NextRequest) {
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
  const context = await buildFarmContext(u.id)
  await saveContextCache(u.id, context)

  return NextResponse.json({
    success: true,
    estimatedTokens: context.estimatedTokens,
    rebuiltAt: new Date().toISOString(),
  })
}

