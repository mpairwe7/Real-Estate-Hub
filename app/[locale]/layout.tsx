import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "../globals.css"
import { ToastProvider } from "@/components/ui/toast"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/lib/i18n-config"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "EstateHub - Premium Real Estate & Maintenance",
  description: "Find your perfect property or manage maintenance with ease",
  generator: "v0.app",
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound()
  }
  
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} className="dark">
      <body className={`font-sans ${inter.variable} ${playfair.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
