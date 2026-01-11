import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/lib/web3/provider"
import "./globals.css"

import { Poppins, Geist_Mono as V0_Font_Geist_Mono } from 'next/font/google'

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

const poppins = Poppins({
  weight: ["100", "500"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "MoveMint - NFT Your Fitness",
  description: "Record your fitness movements and mint them as NFTs on Mantle Network",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: "https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-sans antialiased bg-neutral-950 text-neutral-200`}>
        <Web3Provider>
          {children}
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
