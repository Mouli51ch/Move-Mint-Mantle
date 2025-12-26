"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"


export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.8); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
      <Navbar />

      {/* Hero Section with Wave Background */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient orbs in background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Mantle Badge */}
          <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-green-300 text-sm font-medium">Powered by Mantle Network</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <h1 className="font-medium text-5xl sm:text-6xl md:text-7xl text-white mb-6 leading-tight text-balance">
            Let your moves{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">soar</span>
          </h1>
          <p className="text-gray-400 text-lg mb-4 max-w-2xl mx-auto text-balance">
            The app to track all your moves on Mantle Network. Make smart moves only.
          </p>
          
          {/* Mantle Features */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
              Fast & Cheap
            </span>
            <span className="bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
              Instant Minting
            </span>
            <span className="bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
              True Ownership
            </span>
          </div>
          <div className="flex gap-4 justify-center mb-16 flex-wrap">
            <Button 
              onClick={() => {
                console.log("Get Started clicked")
                router.push("/app/upload")
              }}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium px-8 py-3 h-auto shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all cursor-pointer z-10 relative"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => {
                console.log("Try Demo clicked")
                router.push("/app/upload")
              }}
              variant="outline"
              className="border-green-600/50 text-green-400 hover:bg-green-950/30 hover:border-green-400 px-8 py-3 h-auto bg-black transition-all cursor-pointer"
            >
              Try Demo
            </Button>
            <Button
              onClick={() => router.push("/how-it-works")}
              variant="outline"
              className="border-green-600/50 text-green-400 hover:bg-green-950/30 hover:border-green-400 px-8 py-3 h-auto bg-black transition-all cursor-pointer"
            >
              Learn More
            </Button>
          </div>

          {/* Hero Video Card */}
          <div className="bg-gradient-to-b from-green-950/20 to-black rounded-xl aspect-video border border-green-900/30 flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all">
                <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">See MoveMint in action</p>
            </div>
          </div>

          {/* Wave divider */}
          <svg className="w-full h-32 mt-8 text-green-500/10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Enhanced Analytics Dashboard */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-green-950/5">
        <div className="max-w-7xl mx-auto">
          {/* Mantle Analytics Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-6 py-3 mb-4">
              <span className="text-green-300 font-medium">Mantle Network Analytics</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Real-time Platform Insights</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Live data from the Mantle ecosystem showing fast and affordable NFT minting
            </p>
          </div>

          {/* Animated Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 border-2 border-green-400 rounded-full"></div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform">116</div>
                    <div className="text-xs text-gray-400">+12 this week</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">Countries Using</div>
                <div className="w-full bg-green-950/30 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 border-2 border-green-400 rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform">3.2M+</div>
                    <div className="text-xs text-gray-400">+50K today</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">Moves Detected</div>
                <div className="w-full bg-green-950/30 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-4/5 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 bg-green-400 rounded-sm"></div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform">847K</div>
                    <div className="text-xs text-gray-400">+2.3K today</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">NFTs Minted</div>
                <div className="w-full bg-green-950/30 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-2/3 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 border-2 border-green-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform">4.9</div>
                    <div className="text-xs text-gray-400">+0.1 this month</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">Platform Rating</div>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Activity Feed */}
          <Card className="bg-gradient-to-r from-black via-green-950/10 to-black border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                Live Mantle Network Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">Recent Mints</div>
                  {['Pirouette Sequence #847', 'Hip-Hop Freestyle #291', 'Ballet Combo #156'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-green-500/5 rounded-lg animate-fade-in" style={{animationDelay: `${i * 0.2}s`}}>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">IP Registrations</div>
                  {['NFT Minted on Mantle', 'Dance Style Secured', 'Move Pattern Locked'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-green-500/5 rounded-lg animate-fade-in" style={{animationDelay: `${i * 0.2 + 0.1}s`}}>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">Global Activity</div>
                  {['Tokyo: 47 new moves', 'NYC: 23 mints today', 'London: 31 creators'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-green-500/5 rounded-lg animate-fade-in" style={{animationDelay: `${i * 0.2 + 0.2}s`}}>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-6 py-3 mb-6">
              <span className="text-green-300 font-medium">Mantle Network Features</span>
            </div>
            <h2 className="font-medium text-4xl text-white mb-4">Everything is in one place</h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto">
              Our smart dashboard powered by Mantle Network shows you everything you need to manage all your move NFTs with fast and affordable transactions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fast Minting Card */}
            <Card className="group relative bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 border-2 border-green-400 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white">Fast Minting</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Every NFT is minted instantly on Mantle's high-performance blockchain infrastructure.
                </p>
                <div className="bg-green-950/20 rounded-lg p-4 border border-green-900/20">
                  <div className="text-2xl font-bold text-green-400">847K</div>
                  <p className="text-gray-500 text-xs mt-1">NFTs minted</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-300">Fast minting active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="group relative bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 border-2 border-green-400 rounded grid grid-cols-2 gap-0.5 p-1">
                      <div className="bg-green-400 rounded-sm"></div>
                      <div className="bg-green-400 rounded-sm"></div>
                      <div className="bg-green-400 rounded-sm"></div>
                      <div className="bg-green-400 rounded-sm"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white">Deep Analytics</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Track every metric of your detected moves with precision analytics.
                </p>
                <div className="bg-green-950/20 rounded-lg p-4 border border-green-900/20">
                  <div className="text-2xl font-bold text-green-400">$55,058</div>
                  <p className="text-gray-500 text-xs mt-1">Total portfolio value</p>
                  <div className="w-full bg-green-950/30 rounded-full h-2 mt-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Tracking Card */}
            <Card className="group relative bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="w-6 h-6 border-2 border-green-400 rounded-full flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-green-400 rounded"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white">Real-time Sync</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Smart notifications alert you of important moves and trends instantly.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm bg-green-950/20 p-2 rounded">
                    <span className="text-gray-400">Live Value</span>
                    <span className="text-green-400 font-bold">$19,850.30</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 bg-green-950/10 p-2 rounded">
                    <span>24h Change</span>
                    <span className="text-green-400">+$2,150</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Multi Asset Tracking */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-950/5 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-medium text-4xl text-white mb-4 text-center">Multi Asset Tracking</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Overview of your portfolio balance with profit & loss during various time periods. Stay ahead, compare, and
            enjoy more insights
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "PIROUETTE", symbol: "$", amount: "0.973", change: "↑" },
              { name: "GRAND JETÉ", symbol: "$", amount: "3,123", change: "↑" },
              { name: "CHASSÉ", symbol: "$", amount: "178.90", change: "↑" },
              { name: "ARABESQUE", symbol: "$", amount: "133.93", change: "↑" },
            ].map((asset, i) => (
              <div
                key={i}
                className="bg-black border border-green-900/30 rounded-lg p-4 hover:border-green-600/50 transition group"
              >
                <p className="text-xs text-gray-500 font-medium">{asset.name}</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {asset.symbol}
                  {asset.amount}
                </p>
                <p className="text-green-400 text-xs mt-2 group-hover:text-green-300 transition">{asset.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative" id="app">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-medium text-4xl text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of creators minting their moves as NFTs on Mantle Network</p>
          <Button 
            onClick={() => {
              console.log("Start Free clicked")
              router.push("/app/upload")
            }}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium px-8 py-3 h-auto shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all cursor-pointer z-10 relative"
          >
            Start Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
