'use server'

export async function syncPrices() {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return { error: "CRON_SECRET is not configured" }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/market/sync`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
    },
  }).catch(() => null)

  if (!res) {
    return { error: "Request failed" }
  }
  if (!res.ok) {
    return { error: `Status ${res.status}` }
  }
  return { success: true }
}


