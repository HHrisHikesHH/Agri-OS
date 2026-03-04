'use client'

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol === "https:"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("SW registered")
        })
        .catch((err) => {
          console.log("SW registration failed:", err)
        })
    }
  }, [])

  return null
}

