import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database, UsersRow } from "@/lib/types/database.types"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all API routes to bypass auth middleware; they handle auth/keys themselves.
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next()
    res.headers.set("x-middleware-api-bypass", "1")
    return res
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/signup")
  ) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && ["/login", "/signup", "/"].includes(pathname)) {
    const { data: userDataRaw } = await supabase
      .from("users")
      .select("onboarding_done")
      .eq("auth_id", user.id)
      .single()
    const userData = userDataRaw as UsersRow | null
    if (!userData?.onboarding_done) {
      if (pathname !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    } else if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Apply auth middleware to everything EXCEPT:
    // - /api/* routes
    // - Next static/image assets
    // - Common static files
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

