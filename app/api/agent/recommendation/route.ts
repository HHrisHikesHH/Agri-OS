import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

  const body = (await request.json()) as {
    id: string
    status: string
    notes?: string
  }

  const { error } = await supabase
    .from("agent_recommendations")
    // @ts-expect-error update matches AgentRecommendationsUpdate
    .update({
      status: body.status,
      actual_outcome: body.notes ?? null,
    })
    .eq("id", body.id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ success: true })
}

