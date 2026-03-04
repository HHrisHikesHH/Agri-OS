import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("users").select("id").limit(1)

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch {
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 500 },
    )
  }
}

