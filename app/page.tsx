"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LiveBlockchainDashboard } from "@/components/live-blockchain-dashboard"
import { useRouter } from "next/navigation"
import { 
  Zap, 
  Shield, 
  Coins, 
  Users, 
  TrendingUp, 
  Globe, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Layers,
  Network,
  Rocket,
  Eye,
  Heart
} from "lucide-react"

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
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-delay-100 { animation-delay: 0.1s; }
        .animate-delay-200 { animation-delay: 0.2s; }
        .animate-delay-300 { animation-delay: 0.3s; }
        .animate-delay-400 { animation-delay: 0.4s; }
        .animate-delay-500 { animation-delay: 0.5s; }
        .animate-delay-600 { animation-delay: 0.6s; }
      `}</style>
      <Navbar />

      {/* Hero Section with Wave Background */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient orbs in background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
          
          {/* Main Hero Dance Logo - Prominent Display */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 animate-float" style={{animationDelay: '0.5s'}}>
            <img 
              src="https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo%20(6).png" 
              alt="MoveMint Hero Dance" 
              className="w-96 h-96 object-contain"
            />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Mantle Badge */}
          <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6 animate-slide-up">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-green-300 text-sm font-medium">Powered by Mantle Network</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl text-white mb-6 leading-tight text-balance animate-slide-up animate-delay-100">
            Let your moves{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-green-500 animate-pulse">soar</span>
          </h1>
          
          <p className="text-gray-300 text-xl mb-6 max-w-2xl mx-auto text-balance animate-slide-up animate-delay-200">
            Transform your dance into valuable NFTs on Mantle Network
          </p>
          
          {/* Mantle Features */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up animate-delay-300">
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Fast & Cheap
            </div>
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Instant Minting
            </div>
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              True Ownership
            </div>
          </div>
          
          <div className="flex gap-4 justify-center mb-16 flex-wrap animate-slide-up animate-delay-400">
            <Button 
              onClick={() => {
                console.log("Get Started clicked")
                router.push("/app/upload")
              }}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium px-8 py-3 h-auto shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all cursor-pointer z-10 relative hover:scale-105"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => {
                console.log("Marketplace clicked")
                router.push("/marketplace")
              }}
              variant="outline"
              className="border-green-600/50 text-green-400 hover:bg-green-950/30 hover:border-green-400 px-8 py-3 h-auto bg-black transition-all cursor-pointer hover:scale-105"
            >
              Explore Marketplace
            </Button>
            <Button
              onClick={() => router.push("/how-it-works")}
              variant="outline"
              className="border-green-600/50 text-green-400 hover:bg-green-950/30 hover:border-green-400 px-8 py-3 h-auto bg-black transition-all cursor-pointer hover:scale-105"
            >
              Learn More
            </Button>
          </div>

          {/* Live Blockchain Dashboard */}
          <div className="animate-slide-up animate-delay-500">
            <LiveBlockchainDashboard />
          </div>

          {/* Wave divider */}
          <svg className="w-full h-32 mt-8 text-green-500/10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Marketplace Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-950/5 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium">NFT Marketplace</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Discover Unique Dance NFTs</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
              Explore, collect, and trade dance NFTs created by talented artists worldwide
            </p>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => router.push("/marketplace")}
                className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-semibold px-8 py-3 h-auto shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all cursor-pointer hover:scale-105 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Explore Marketplace
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Marketplace Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-950/30 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500/10 rounded-xl w-fit mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Discover</h3>
                <p className="text-gray-400 text-sm">
                  Browse unique dance NFTs from creators around the world
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-950/30 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500/10 rounded-xl w-fit mx-auto mb-4">
                  <Coins className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Trade</h3>
                <p className="text-gray-400 text-sm">
                  Buy and sell dance NFTs with low fees on Mantle Network
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-950/30 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500/10 rounded-xl w-fit mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Collect</h3>
                <p className="text-gray-400 text-sm">
                  Build your collection of rare and valuable dance NFTs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dance Elements Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-950/10 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium">Dance Culture</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Where Street Dance Meets Blockchain</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Celebrating the art, culture, and community of street dance through NFT technology
            </p>
          </div>
          
          {/* Dance Logo Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                <img 
                  src="https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo%20(5).png" 
                  alt="Street Dance Culture" 
                  className="relative w-48 h-48 mx-auto object-contain group-hover:scale-110 transition-transform duration-500 animate-float"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Urban Expression</h3>
              <p className="text-gray-400 text-sm">
                Capture the raw energy and creativity of street dance culture in digital form
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                <img 
                  src="https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo%20(4).png" 
                  alt="Dance Movement" 
                  className="relative w-48 h-48 mx-auto object-contain group-hover:scale-110 transition-transform duration-500 animate-float" 
                  style={{animationDelay: '1s'}}
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Dynamic Movement</h3>
              <p className="text-gray-400 text-sm">
                Every move tells a story - preserve your choreography as unique digital assets
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                <img 
                  src="https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo%20(3).png" 
                  alt="Dance Community" 
                  className="relative w-48 h-48 mx-auto object-contain group-hover:scale-110 transition-transform duration-500 animate-float" 
                  style={{animationDelay: '2s'}}
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Spirit</h3>
              <p className="text-gray-400 text-sm">
                Connect with dancers worldwide and build a thriving creative community
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <Button 
              onClick={() => router.push("/app/mint")}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-semibold px-10 py-4 h-auto shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all cursor-pointer hover:scale-105 inline-flex items-center gap-3 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Start Your Dance Journey
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why MoveMint Helps Mantle Network Grow */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-green-950/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Rocket className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Growing Mantle Network</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">How MoveMint Accelerates Mantle's Growth</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Real-world utility through dance NFTs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group h-full hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">User Adoption</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Bringing dancers and creators to Mantle Network through engaging NFT experiences
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm mt-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>Growing ecosystem</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group h-full hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Network Activity</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every NFT mint and trade showcases Mantle's speed and low costs
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm mt-4">
                  <Layers className="w-4 h-4" />
                  <span>Increasing volume</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 group h-full hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Globe className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Global Reach</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Dance connects cultures worldwide, bringing international attention to Mantle
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm mt-4">
                  <Network className="w-4 h-4" />
                  <span>Worldwide growth</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mantle Network Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-green-300 font-medium">Why Mantle Network</span>
            </div>
            <h2 className="font-bold text-4xl text-white mb-4">Built for Creators</h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto text-lg">
              Unmatched speed, security, and affordability
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group relative bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
              <CardContent className="relative p-8 text-center">
                <div className="p-4 bg-green-500/10 rounded-2xl w-fit mx-auto mb-6">
                  <Zap className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">&lt;2s</div>
                <p className="text-gray-400 text-sm">Average mint time</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-300">Ultra-fast processing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
              <CardContent className="relative p-8 text-center">
                <div className="p-4 bg-green-500/10 rounded-2xl w-fit mx-auto mb-6">
                  <Coins className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Ultra Low Costs</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">$0.01</div>
                <p className="text-gray-400 text-sm">Average transaction cost</p>
                <div className="w-full bg-green-950/30 rounded-full h-2 mt-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-1/4 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
              <CardContent className="relative p-8 text-center">
                <div className="p-4 bg-green-500/10 rounded-2xl w-fit mx-auto mb-6">
                  <Shield className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">99.9%</div>
                <p className="text-gray-400 text-sm">Network uptime</p>
                <div className="flex justify-center items-center gap-2 mt-4">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">Multiple audits</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative" id="app">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-green-500/3 rounded-full blur-2xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-950/20 border border-green-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">Ready to Start</span>
          </div>
          <h2 className="font-bold text-5xl text-white mb-6">Ready to mint your moves?</h2>
          <p className="text-gray-300 mb-10 text-xl max-w-2xl mx-auto">Join the movement and help grow the Mantle Network ecosystem</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => {
                console.log("Start Creating clicked")
                router.push("/app/upload")
              }}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-semibold px-10 py-4 h-auto shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all cursor-pointer z-10 relative hover:scale-105 inline-flex items-center gap-3 text-lg"
            >
              <Rocket className="w-5 h-5" />
              Start Creating on Mantle
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Low fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Instant minting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
