import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Sora } from "next/font/google"

import "./globals.css"
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Agri OS",
    template: "%s — Agri OS",
  },
  description: "Your personal farming and business intelligence system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agri OS",
  },
}

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${jetbrains.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  )
}


