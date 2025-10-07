import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "AI Merge - Storytelling Platform",
  description: "Transform your life experiences into compelling narratives with AI-powered story generation",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
