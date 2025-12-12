"use client"
import { useEffect, useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"

export default function Detection() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Initializing AI model...")

  const statuses = [
    "Initializing AI model...",
    "Loading video...",
    "Analyzing movements...",
    "Detecting poses...",
    "Processing skeleton data...",
    "Finalizing results...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            window.location.href = "/app/results"
          }, 1000)
          return 100
        }
        const next = prev + Math.random() * 30
        return next > 100 ? 100 : next
      })
    }, 800)

    const statusInterval = setInterval(() => {
      const statusIndex = Math.floor((progress / 100) * (statuses.length - 1))
      setStatus(statuses[Math.min(statusIndex, statuses.length - 1)])
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(statusInterval)
    }
  }, [progress])

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-12 text-center animate-fade-in-down">
            <h1 className="font-medium text-4xl text-white mb-2">Analyzing Movement</h1>
            <p className="text-gray-400">Please wait while our AI processes your video</p>
          </div>

          <div className="mb-8 animate-scale-in">
            <div className="aspect-square bg-black rounded-xl border-2 border-green-900/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-green-400/20 to-green-600/20 animate-pulse" />
              <div className="absolute inset-2 bg-black rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="font-bold text-4xl text-green-400 mb-2 transition-all duration-300">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-gray-500">Processing</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 animate-fade-in">
            <div className="w-full bg-black rounded-full h-2 border border-green-900/30 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-300 shadow-lg shadow-green-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-8 animate-fade-in">
            <p className="text-gray-400 text-sm min-h-5 transition-all duration-300">{status}</p>
          </div>

          <div className="bg-black border border-green-900/30 p-6 rounded-xl mb-8 animate-fade-in-up">
            <h3 className="font-medium text-sm text-green-400 mb-4 uppercase tracking-wide">Detected So Far</h3>
            <div className="space-y-2">
              {["Squat", "Lunge", "Push-up", "Plank"].map((movement, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {movement}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs animate-fade-in">
            <p>This usually takes 1-3 minutes depending on video length</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
