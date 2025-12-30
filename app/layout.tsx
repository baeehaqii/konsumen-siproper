import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Customer Siproper",
  description: "Lacak Progres Pembelian Hunian di Sapphire Grup",
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1767072165/logooo_kdnfbc.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1767072165/logooo_kdnfbc.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1767072165/logooo_kdnfbc.png",
        type: "image/svg+xml",
      },
    ],
    apple: "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1767072165/logooo_kdnfbc.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
