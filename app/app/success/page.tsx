"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Success() {
  const [nftId] = useState("0x742d35Cc6634C0532925a3b844Bc49e4f03B0cbc")
  const [displayId, setDisplayId] = useState("")

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= nftId.length) {
        setDisplayId(nftId.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative w-full max-w-md text-center">
          <div className="mb-8 animate-scale-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 animate-bounce">
              <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h1 className="font-bold text-4xl text-white mb-2 animate-fade-in-down">Minting Complete!</h1>
            <p className="text-gray-400 mb-8 animate-fade-in-down" style={{ animationDelay: "0.1s" }}>
              Your movement NFT has been successfully created on Mantle Network
            </p>
          </div>

          <div
            className="bg-black border border-green-900/30 p-8 rounded-xl mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="font-medium text-2xl text-white mb-6">Morning Yoga Session</h2>

            <div className="aspect-video bg-gradient-to-br from-green-600/20 to-green-400/10 rounded-lg border border-green-900/30 flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-green-500/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>

            <div
              className="bg-black border border-green-900/30 p-4 rounded-lg mb-6 text-left animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-gray-500 text-xs mb-2 uppercase">Contract Address</p>
              <p className="text-white text-sm font-mono break-all">{displayId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              <div className="bg-black border border-green-900/30 p-3 rounded-lg hover:border-green-600/50 transition duration-300">
                <p className="text-gray-500 text-xs mb-1 uppercase">Token ID</p>
                <p className="text-white font-mono text-sm">#42857</p>
              </div>
              <div className="bg-black border border-green-900/30 p-3 rounded-lg hover:border-green-600/50 transition duration-300">
                <p className="text-gray-500 text-xs mb-1 uppercase">Chain</p>
                <p className="text-white text-sm">Mantle Network</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link href="/app/dashboard">
              <Button className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium py-3 h-auto text-base shadow-lg shadow-green-500/30 transition duration-300">
                View in Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => window.open("https://story.foundation", "_blank")}
              className="w-full border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300"
            >
              View on Story
            </Button>
            <Button
              onClick={() => navigator.clipboard.writeText(nftId)}
              className="w-full border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300"
            >
              Copy Contract Address
            </Button>
          </div>

          <div
            className="bg-black border border-green-900/30 p-6 rounded-xl text-left animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="font-medium text-lg text-white mb-4">Next Steps</h3>
            <ol className="space-y-3 text-sm text-gray-400">
              {[
                "Share your NFT on social media",
                "List it on marketplaces to earn from sales",
                "Record more movements and build your collection",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                >
                  <span className="text-green-400 font-medium">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <Link href="/app/upload" className="block mt-8 animate-fade-in-up" style={{ animationDelay: "0.65s" }}>
            <Button className="w-full bg-green-950/50 hover:bg-green-900/50 border border-green-600/50 text-green-400 hover:text-green-300 py-3 h-auto text-base transition duration-300">
              Record Another Movement
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
