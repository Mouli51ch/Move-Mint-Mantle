"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BuyNFTModal } from "@/components/ui/buy-nft-modal"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart, 
  Share2, 
  Play, 
  Eye,
  Zap,
  Clock,
  User,
  Coins,
  RefreshCw
} from "lucide-react"

interface NFTMetadata {
  tokenId: number
  title: string
  danceStyle: string
  choreographer: string
  duration: number
  ipfsMetadataHash: string
  creator: string
  mintedAt: number
  price?: string
  isForSale?: boolean
  image?: string
  video?: string
  cashflowStreamId?: number
  hasActiveStream?: boolean
}

export default function MarketplacePage() {
  const router = useRouter()
  const [nfts, setNfts] = useState<NFTMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'for-sale' | 'recent'>('all')
  const [totalSupply, setTotalSupply] = useState(0)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null)

  useEffect(() => {
    loadNFTs()
    
    // Set up periodic refresh to catch newly minted NFTs
    const refreshInterval = setInterval(() => {
      console.log('🔄 [Marketplace] Auto-refreshing NFT data...')
      loadNFTs()
    }, 15000) // Refresh every 15 seconds for better real-time updates
    
    // Listen for storage events (when new NFTs are minted in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastTransactionHash' || e.key === 'lastMintedIpId') {
        console.log('🔄 [Marketplace] Detected new mint, refreshing...')
        setTimeout(() => loadNFTs(), 2000) // Small delay to allow blockchain confirmation
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const loadNFTs = async () => {
    try {
      setLoading(true)
      
      // Fetch real NFT data from our API
      const response = await fetch('/api/nfts')
      const result = await response.json()
      
      if (result.success && result.data) {
        setTotalSupply(result.totalSupply || result.data.length)
        
        // Transform the real data and add marketplace-specific fields
        const transformedNFTs: NFTMetadata[] = result.data.map((nft: any) => ({
          ...nft,
          // Add marketplace-specific fields (these would come from a marketplace contract in production)
          price: Math.random() > 0.4 ? `${(Math.random() * 0.5 + 0.1).toFixed(3)} MNT` : undefined,
          isForSale: Math.random() > 0.4,
          image: `https://picsum.photos/400/400?random=${nft.tokenId}`,
          video: `https://sample-videos.com/zip/10/mp4/SampleVideo_${nft.tokenId}.mp4`,
          // Add cashflow stream data (in production, this would come from the protocol)
          cashflowStreamId: Math.random() > 0.6 ? Math.floor(Math.random() * 100) + 1 : undefined,
          hasActiveStream: Math.random() > 0.6
        }))
        
        setNfts(transformedNFTs)
      } else {
        console.error('Failed to fetch NFTs:', result.error)
        // Fallback to empty array
        setNfts([])
        setTotalSupply(0)
      }
    } catch (error) {
      console.error('Error loading NFTs:', error)
      // Fallback to empty array
      setNfts([])
      setTotalSupply(0)
    } finally {
      setLoading(false)
    }
  }

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.danceStyle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.choreographer.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    if (filterBy === 'for-sale') {
      matchesFilter = nft.isForSale || false
    } else if (filterBy === 'recent') {
      // Convert blockchain timestamp to milliseconds if needed
      const timestampMs = nft.mintedAt > 1000000000000 ? nft.mintedAt : nft.mintedAt * 1000
      matchesFilter = (Date.now() - timestampMs) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    }
    
    return matchesSearch && matchesFilter
  })

  const formatTimeAgo = (timestamp: number) => {
    // Convert from blockchain timestamp (seconds) to milliseconds if needed
    const timestampMs = timestamp > 1000000000000 ? timestamp : timestamp * 1000
    const diff = Date.now() - timestampMs
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleBuyNFT = (nft: NFTMetadata) => {
    setSelectedNFT(nft)
    setBuyModalOpen(true)
  }

  const handleBuySuccess = (transactionHash: string) => {
    console.log('NFT purchased successfully:', transactionHash)
    // Optionally refresh the NFT data or show a success message
    setBuyModalOpen(false)
    setSelectedNFT(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-950/20 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Dance NFT Marketplace
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
              Discover, collect, and trade unique dance NFTs on Mantle Network
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-green-950/30 border border-green-500/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold text-green-400">{totalSupply}</div>
                <div className="text-sm text-gray-400">Total NFTs</div>
              </div>
              <div className="bg-green-950/30 border border-green-500/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold text-green-400">{nfts.filter(n => n.isForSale).length}</div>
                <div className="text-sm text-gray-400">For Sale</div>
              </div>
              <div className="bg-green-950/30 border border-green-500/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold text-green-400">{nfts.length > 0 ? nfts.length : '0'}</div>
                <div className="text-sm text-gray-400">Owners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadNFTs}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All NFTs</option>
                  <option value="for-sale">For Sale</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
              
              {/* View Mode */}
              <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading NFTs...</span>
            </div>
          ) : filteredNFTs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">No NFTs found matching your criteria</div>
              <Button onClick={() => {setSearchTerm(''); setFilterBy('all')}} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filteredNFTs.map((nft) => (
                <Card 
                  key={nft.tokenId} 
                  className="bg-gray-900 border-gray-700 hover:border-green-500/50 transition-all duration-300 group overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/marketplace/${nft.tokenId}`)}
                >
                  <div className="relative">
                    {/* NFT Image/Video */}
                    <div className="aspect-square bg-gradient-to-br from-green-900/20 to-gray-900 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
                        {formatDuration(nft.duration)}
                      </div>
                      
                      {/* For Sale Badge */}
                      {nft.isForSale && (
                        <div className="absolute top-3 left-3 z-20">
                          <Badge className="bg-green-500 text-black">For Sale</Badge>
                        </div>
                      )}
                      
                      {/* Cashflow Stream Badge */}
                      {nft.hasActiveStream && (
                        <div className="absolute top-3 left-3 z-20" style={{ marginTop: nft.isForSale ? '32px' : '0' }}>
                          <Badge className="bg-blue-500 text-white">
                            💰 Stream #{nft.cashflowStreamId}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Button size="sm" variant="secondary" className="p-2">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="p-2">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-lg truncate">{nft.title}</h3>
                      <div className="text-right">
                        {nft.price && (
                          <div className="text-green-400 font-bold">{nft.price}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{nft.choreographer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Zap className="w-4 h-4" />
                        <span>{nft.danceStyle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(nft.mintedAt)}</span>
                      </div>
                      {nft.hasActiveStream && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>Cashflow Stream Active</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {nft.isForSale ? (
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleBuyNFT(nft)}
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Buy NFT Modal */}
      {selectedNFT && (
        <BuyNFTModal
          isOpen={buyModalOpen}
          onClose={() => {
            setBuyModalOpen(false)
            setSelectedNFT(null)
          }}
          nft={{
            tokenId: selectedNFT.tokenId,
            title: selectedNFT.title,
            price: selectedNFT.price || '0.1 MNT',
            creator: selectedNFT.creator,
            owner: selectedNFT.creator // In a real marketplace, this would be the current owner
          }}
          onSuccess={handleBuySuccess}
        />
      )}
    </div>
  )
}