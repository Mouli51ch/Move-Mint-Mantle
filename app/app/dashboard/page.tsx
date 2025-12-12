"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { universalMintingEngineService } from "@/lib/api/service"
import { NFTsResponse, AssetsResponse } from "@/lib/types/api"

interface DanceNFT {
  id: string
  contractAddress: string
  tokenId: string
  title: string
  description: string
  image: string
  animation_url?: string
  danceStyle: string[]
  movements: string
  created: string
  views: number
  price: string
  difficulty: string
  duration: number
  choreographer?: string
  attributes: Array<{
    trait_type: string
    value: string | number
    display_type?: string
  }>
  transactionHash?: string
  ipfsHash?: string
}

interface CollectionStats {
  totalNFTs: number
  totalViews: number
  totalEarnings: string
  uniqueStyles: number
}

export default function Dashboard() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [nfts, setNfts] = useState<DanceNFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<DanceNFT[]>([])
  const [stats, setStats] = useState<CollectionStats>({
    totalNFTs: 0,
    totalViews: 0,
    totalEarnings: "0 IP",
    uniqueStyles: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStyle, setSelectedStyle] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"created" | "views" | "title">("created")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  const { connection, isConnected } = useWallet()

  // Load NFT collection on component mount and wallet connection
  useEffect(() => {
    if (isConnected && connection?.address) {
      loadNFTCollection()
    } else {
      setIsLoading(false)
      setNfts([])
      setFilteredNfts([])
    }
  }, [isConnected, connection?.address, currentPage])

  // Filter and sort NFTs when search/filter criteria change
  useEffect(() => {
    filterAndSortNFTs()
  }, [nfts, searchQuery, selectedStyle, sortBy, sortOrder])

  const loadNFTCollection = async () => {
    if (!connection?.address) return

    setIsLoading(true)
    setError(null)

    try {
      // Load NFTs with detailed metadata
      const nftsResponse = await universalMintingEngineService.getNFTs(
        connection.address,
        currentPage,
        itemsPerPage
      )

      // Transform API response to our NFT format
      const transformedNFTs: DanceNFT[] = nftsResponse.nfts.map(nft => ({
        id: `${nft.contractAddress}-${nft.tokenId}`,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        title: nft.metadata.name || 'Untitled Dance NFT',
        description: nft.metadata.description || '',
        image: nft.metadata.image || '',
        animation_url: nft.metadata.animation_url,
        danceStyle: nft.metadata.danceStyle || [],
        movements: nft.metadata.analysisData?.detectedMovements?.map(m => m.name).join(', ') || 'Unknown movements',
        created: new Date(nft.mintedAt).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 1000), // Placeholder - would come from analytics API
        price: nft.metadata.attributes?.find(attr => attr.trait_type === 'Price')?.value?.toString() || 'Free',
        difficulty: nft.metadata.difficulty || 'Beginner',
        duration: nft.metadata.analysisData?.duration || 0,
        choreographer: nft.metadata.choreographer,
        attributes: nft.metadata.attributes || [],
        transactionHash: nft.transactionHash,
        ipfsHash: nft.metadata.ipfsHash
      }))

      setNfts(transformedNFTs)
      setTotalPages(Math.ceil(nftsResponse.total / itemsPerPage))

      // Calculate collection statistics
      calculateStats(transformedNFTs, nftsResponse.total)

    } catch (error) {
      console.error('Failed to load NFT collection:', error)
      setError('Failed to load your NFT collection. Please try again.')
      
      // Load mock data as fallback for development
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadMockData = () => {
    const mockNFTs: DanceNFT[] = [
      {
        id: "mock-1",
        contractAddress: "0x1234567890123456789012345678901234567890",
        tokenId: "1",
        title: "Evening Ballet Routine",
        description: "A graceful evening ballet performance featuring classical movements",
        image: "",
        danceStyle: ["Ballet", "Classical"],
        movements: "Pirouette, Grand Jeté, Arabesque",
        created: "2025-01-15",
        views: 324,
        price: "2.5 IP",
        difficulty: "Advanced",
        duration: 180,
        attributes: [
          { trait_type: "Duration", value: 180, display_type: "number" },
          { trait_type: "Movements Detected", value: 3, display_type: "number" },
          { trait_type: "Dance Styles", value: "Ballet, Classical" }
        ]
      },
      {
        id: "mock-2",
        contractAddress: "0x1234567890123456789012345678901234567890",
        tokenId: "2",
        title: "Contemporary Dance",
        description: "Modern contemporary dance with fluid movements",
        image: "",
        danceStyle: ["Contemporary", "Modern"],
        movements: "Chassé, Plié, Tendu",
        created: "2025-01-12",
        views: 512,
        price: "1.8 IP",
        difficulty: "Intermediate",
        duration: 150,
        attributes: [
          { trait_type: "Duration", value: 150, display_type: "number" },
          { trait_type: "Movements Detected", value: 3, display_type: "number" },
          { trait_type: "Dance Styles", value: "Contemporary, Modern" }
        ]
      },
      {
        id: "mock-3",
        contractAddress: "0x1234567890123456789012345678901234567890",
        tokenId: "3",
        title: "Hip-Hop Freestyle",
        description: "Energetic hip-hop freestyle with street dance elements",
        image: "",
        danceStyle: ["Hip-Hop", "Street"],
        movements: "Pop, Lock, Wave",
        created: "2025-01-10",
        views: 189,
        price: "Free",
        difficulty: "Beginner",
        duration: 120,
        attributes: [
          { trait_type: "Duration", value: 120, display_type: "number" },
          { trait_type: "Movements Detected", value: 3, display_type: "number" },
          { trait_type: "Dance Styles", value: "Hip-Hop, Street" }
        ]
      },
      {
        id: "mock-4",
        contractAddress: "0x1234567890123456789012345678901234567890",
        tokenId: "4",
        title: "Jazz Dance Combo",
        description: "Classic jazz dance combination with syncopated rhythms",
        image: "",
        danceStyle: ["Jazz", "Musical Theatre"],
        movements: "Kick Ball Change, Jazz Square",
        created: "2025-01-08",
        views: 267,
        price: "1.2 IP",
        difficulty: "Intermediate",
        duration: 90,
        attributes: [
          { trait_type: "Duration", value: 90, display_type: "number" },
          { trait_type: "Movements Detected", value: 2, display_type: "number" },
          { trait_type: "Dance Styles", value: "Jazz, Musical Theatre" }
        ]
      }
    ]

    setNfts(mockNFTs)
    calculateStats(mockNFTs, mockNFTs.length)
  }

  const calculateStats = (nftList: DanceNFT[], total: number) => {
    const totalViews = nftList.reduce((sum, nft) => sum + nft.views, 0)
    const totalEarnings = nftList.reduce((sum, nft) => {
      const price = parseFloat(nft.price.replace(' IP', '')) || 0
      return sum + price
    }, 0)
    const uniqueStyles = new Set(nftList.flatMap(nft => nft.danceStyle)).size

    setStats({
      totalNFTs: total,
      totalViews,
      totalEarnings: `${totalEarnings.toFixed(1)} IP`,
      uniqueStyles
    })
  }

  const filterAndSortNFTs = () => {
    let filtered = [...nfts]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(nft =>
        nft.title.toLowerCase().includes(query) ||
        nft.movements.toLowerCase().includes(query) ||
        nft.danceStyle.some(style => style.toLowerCase().includes(query)) ||
        nft.description.toLowerCase().includes(query)
      )
    }

    // Apply style filter
    if (selectedStyle !== "all") {
      filtered = filtered.filter(nft =>
        nft.danceStyle.some(style => style.toLowerCase() === selectedStyle.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "created":
          aValue = new Date(a.created).getTime()
          bValue = new Date(b.created).getTime()
          break
        case "views":
          aValue = a.views
          bValue = b.views
          break
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredNfts(filtered)
  }

  const getUniqueStyles = () => {
    const styles = new Set(nfts.flatMap(nft => nft.danceStyle))
    return Array.from(styles).sort()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-12 animate-fade-in-down">
            <div>
              <h1 className="font-medium text-5xl text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">
                {isConnected 
                  ? `Manage your move NFT collection${connection?.address ? ` (${connection.address.slice(0, 6)}...${connection.address.slice(-4)})` : ''}`
                  : 'Connect your wallet to view your NFT collection'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/app/settings">
                <Button className="border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300">
                  Settings
                </Button>
              </Link>
              <Link href="/app/upload">
                <Button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/20 transition duration-300">
                  New Move
                </Button>
              </Link>
            </div>
          </div>

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="mb-8 bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="text-yellow-400 text-xl">⚠️</div>
                <div>
                  <h3 className="text-yellow-400 font-medium mb-1">Wallet Not Connected</h3>
                  <p className="text-yellow-300/80 text-sm">
                    Connect your wallet to view and manage your dance NFT collection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 bg-red-950/30 border border-red-900/50 rounded-xl p-6 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-red-400 text-xl">❌</div>
                  <div>
                    <h3 className="text-red-400 font-medium mb-1">Error Loading Collection</h3>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                </div>
                <Button
                  onClick={loadNFTCollection}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 h-auto"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Collection Statistics */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total NFTs", value: stats.totalNFTs.toString(), icon: "🎭" },
              { label: "Total Views", value: stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), icon: "👀" },
              { label: "Total Earnings", value: stats.totalEarnings, icon: "💰" },
              { label: "Dance Styles", value: stats.uniqueStyles.toString(), icon: "🎨" },
            ].map((stat, i) => (
              <div key={i} className="group relative animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-black border border-green-900/30 p-6 rounded-xl hover:border-green-600/50 transition duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs uppercase">{stat.label}</p>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Collection Header and Controls */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h2 className="font-medium text-2xl text-white">
                Your Collection {filteredNfts.length !== nfts.length && `(${filteredNfts.length} of ${nfts.length})`}
              </h2>
              
              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded transition duration-300 ${
                    view === "grid"
                      ? "bg-green-600 text-black shadow-lg shadow-green-500/50"
                      : "text-gray-400 hover:text-green-400 border border-green-900/30"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded transition duration-300 ${
                    view === "list"
                      ? "bg-green-600 text-black shadow-lg shadow-green-500/50"
                      : "text-gray-400 hover:text-green-400 border border-green-900/30"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            {isConnected && nfts.length > 0 && (
              <div className="bg-black border border-green-900/30 rounded-xl p-4 mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Search</label>
                    <Input
                      type="text"
                      placeholder="Search by title, moves, or style..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-black border-green-900/30 text-white placeholder:text-gray-600"
                    />
                  </div>

                  {/* Style Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Dance Style</label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-black border border-green-900/30 rounded-lg text-white p-2 focus:border-green-500"
                    >
                      <option value="all">All Styles</option>
                      {getUniqueStyles().map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "created" | "views" | "title")}
                      className="w-full bg-black border border-green-900/30 rounded-lg text-white p-2 focus:border-green-500"
                    >
                      <option value="created">Date Created</option>
                      <option value="views">Views</option>
                      <option value="title">Title</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                      className="w-full bg-black border border-green-900/30 rounded-lg text-white p-2 focus:border-green-500"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your NFT collection...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && isConnected && filteredNfts.length === 0 && nfts.length === 0 && (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-medium text-white mb-2">No NFTs Found</h3>
              <p className="text-gray-400 mb-6">
                You haven't minted any dance NFTs yet. Create your first move!
              </p>
              <Link href="/app/upload">
                <Button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium">
                  Create Your First Move
                </Button>
              </Link>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && isConnected && filteredNfts.length === 0 && nfts.length > 0 && (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-white mb-2">No Results Found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedStyle("all")
                }}
                className="border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && view === "grid" && filteredNfts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNfts.map((nft, idx) => (
                <Link key={nft.id} href={`/app/routines/${nft.tokenId}`}>
                  <div
                    className="group relative h-full animate-fade-in-up"
                    style={{ animationDelay: `${0.4 + idx * 0.08}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative bg-black rounded-xl overflow-hidden border border-green-900/30 group-hover:border-green-600/50 transition duration-300 cursor-pointer flex flex-col h-full">
                      {/* NFT Image/Video */}
                      <div className="aspect-square bg-gradient-to-br from-green-600/20 to-green-400/10 flex items-center justify-center border-b border-green-900/30 relative overflow-hidden">
                        {nft.image ? (
                          <img 
                            src={nft.image} 
                            alt={nft.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`${nft.image ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
                          <svg className="w-12 h-12 text-green-500/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                        </div>
                        
                        {/* Dance Style Tags */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {nft.danceStyle.slice(0, 2).map(style => (
                            <span key={style} className="bg-green-600/80 text-black text-xs px-2 py-1 rounded-full font-medium">
                              {style}
                            </span>
                          ))}
                          {nft.danceStyle.length > 2 && (
                            <span className="bg-gray-600/80 text-white text-xs px-2 py-1 rounded-full">
                              +{nft.danceStyle.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Duration Badge */}
                        {nft.duration > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(nft.duration)}
                          </div>
                        )}
                      </div>
                      
                      {/* NFT Details */}
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-medium text-white mb-2 line-clamp-2">{nft.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{nft.movements}</p>
                        
                        {/* Difficulty Badge */}
                        <div className="mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            nft.difficulty === 'Beginner' ? 'bg-green-900/30 text-green-400' :
                            nft.difficulty === 'Intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {nft.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                          <span>{nft.views} views</span>
                          <span className="font-medium text-green-400">{nft.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* List View */}
          {!isLoading && view === "list" && filteredNfts.length > 0 && (
            <div
              className="bg-black rounded-xl border border-green-900/30 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-900/30">
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">NFT</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Dance Style</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Movements</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Difficulty</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Views</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNfts.map((nft) => (
                      <tr
                        key={nft.id}
                        className="border-b border-green-900/20 last:border-b-0 hover:bg-green-950/20 transition duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-green-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              {nft.image ? (
                                <img 
                                  src={nft.image} 
                                  alt={nft.title}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              <div className={`${nft.image ? 'hidden' : ''}`}>
                                <svg className="w-6 h-6 text-green-500/30" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium line-clamp-1">{nft.title}</p>
                              <p className="text-xs text-gray-500">Token #{nft.tokenId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {nft.danceStyle.slice(0, 2).map(style => (
                              <span key={style} className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                                {style}
                              </span>
                            ))}
                            {nft.danceStyle.length > 2 && (
                              <span className="text-xs text-gray-400">+{nft.danceStyle.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs">
                          <div className="line-clamp-2">{nft.movements}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {nft.duration > 0 ? formatDuration(nft.duration) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            nft.difficulty === 'Beginner' ? 'bg-green-900/30 text-green-400' :
                            nft.difficulty === 'Intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {nft.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{nft.created}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{nft.views.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-green-400 font-medium">{nft.price}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2">
                            <Link href={`/app/routines/${nft.tokenId}`}>
                              <Button
                                size="sm"
                                className="text-green-400 hover:text-green-300 hover:bg-green-950/30 bg-transparent transition duration-300"
                              >
                                View
                              </Button>
                            </Link>
                            {nft.transactionHash && (
                              <Button
                                size="sm"
                                onClick={() => window.open(`https://testnet.storyscan.xyz/tx/${nft.transactionHash}`, '_blank')}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 bg-transparent transition duration-300"
                              >
                                Tx
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && isConnected && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 animate-fade-in-up">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border disabled:opacity-50"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 ${
                        currentPage === page
                          ? 'bg-green-600 text-black'
                          : 'border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border'
                      }`}
                    >
                      {page}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 ${
                        currentPage === totalPages
                          ? 'bg-green-600 text-black'
                          : 'border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border'
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
