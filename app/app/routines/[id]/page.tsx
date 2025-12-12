"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

export default function RoutineDetails({ params }: { params: Promise<{ id: string }> }) {
  const [showSkeleton, setShowSkeleton] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="mb-8 animate-fade-in-down">
            <Link
              href="/app/dashboard"
              className="text-gray-400 hover:text-green-400 text-sm mb-6 inline-block transition duration-300"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div
                className="bg-black rounded-xl overflow-hidden border border-green-900/30 aspect-video flex items-center justify-center mb-6 hover:border-green-600/50 transition duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-green-500/30 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">Movement Video</p>
                </div>
              </div>

              <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className="text-sm text-gray-400 hover:text-green-400 transition duration-300"
                >
                  {showSkeleton ? "Hide" : "Show"} Skeleton Detection
                </button>
              </div>

              {showSkeleton && (
                <div className="bg-black rounded-xl overflow-hidden border border-green-900/30 aspect-video flex items-center justify-center hover:border-green-600/50 transition duration-300 animate-scale-in">
                  <svg
                    className="w-full h-full max-w-64 max-h-64"
                    viewBox="0 0 100 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="30" r="8" fill="#22c55e" />
                    <line x1="50" y1="38" x2="50" y2="70" stroke="#16a34a" strokeWidth="2" />
                    <line x1="50" y1="45" x2="30" y2="50" stroke="#16a34a" strokeWidth="2" />
                    <line x1="50" y1="45" x2="70" y2="50" stroke="#16a34a" strokeWidth="2" />
                    <line x1="50" y1="70" x2="35" y2="120" stroke="#16a34a" strokeWidth="2" />
                    <line x1="50" y1="70" x2="65" y2="120" stroke="#16a34a" strokeWidth="2" />
                    {[
                      { x: 50, y: 38 },
                      { x: 30, y: 50 },
                      { x: 70, y: 50 },
                      { x: 50, y: 70 },
                      { x: 35, y: 120 },
                      { x: 65, y: 120 },
                    ].map((point, i) => (
                      <circle key={i} cx={point.x} cy={point.y} r="2" fill="#22c55e" />
                    ))}
                  </svg>
                </div>
              )}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h1 className="font-medium text-3xl text-white mb-2">Morning Yoga Session</h1>
              <p className="text-gray-400 mb-6">Created Jan 15, 2025</p>

              <div className="space-y-4 mb-8">
                <div
                  className="bg-black border border-green-900/30 p-4 rounded-lg hover:border-green-600/50 transition duration-300 animate-fade-in-up"
                  style={{ animationDelay: "0.25s" }}
                >
                  <p className="text-gray-500 text-xs mb-1 uppercase">Views</p>
                  <p className="text-2xl font-medium text-green-400">324</p>
                </div>
                <div
                  className="bg-black border border-green-900/30 p-4 rounded-lg hover:border-green-600/50 transition duration-300 animate-fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <p className="text-gray-500 text-xs mb-1 uppercase">Price</p>
                  <p className="text-2xl font-medium text-green-400">2.5 IP</p>
                </div>
                <div
                  className="bg-black border border-green-900/30 p-4 rounded-lg hover:border-green-600/50 transition duration-300 animate-fade-in-up"
                  style={{ animationDelay: "0.35s" }}
                >
                  <p className="text-gray-500 text-xs mb-1 uppercase">Earnings</p>
                  <p className="text-2xl font-medium text-green-400">6.2 IP</p>
                </div>
              </div>

              <div
                className="bg-black border border-green-900/30 p-6 rounded-xl mb-8 hover:border-green-600/50 transition duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <h3 className="font-medium text-lg text-white mb-3">Description</h3>
                <p className="text-gray-400 text-sm">
                  A peaceful morning yoga session focusing on flexibility, balance, and mindfulness. Perfect for
                  beginners and advanced yogis alike.
                </p>
              </div>

              <div
                className="bg-black border border-green-900/30 p-6 rounded-xl mb-8 hover:border-green-600/50 transition duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.45s" }}
              >
                <h3 className="font-medium text-lg text-white mb-3">Movements</h3>
                <div className="space-y-2">
                  {["Squat", "Lunge", "Push-up", "Plank"].map((movement, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-300 animate-fade-in-up"
                      style={{ animationDelay: `${0.45 + i * 0.05}s` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      {movement}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.65s" }}>
                <Button className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/30 transition duration-300">
                  Share NFT
                </Button>
                <Button className="w-full border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300">
                  Edit Details
                </Button>
                <Button className="w-full border-red-600/50 text-red-400 hover:bg-red-950/30 bg-black border transition duration-300">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
