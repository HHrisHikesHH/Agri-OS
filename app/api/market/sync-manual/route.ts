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

  const url = new URL("/api/market/sync", request.url)

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
    },
  })

  const data = await res.json()
  return NextResponse.json(data, {
    status: res.status,
  })
}

