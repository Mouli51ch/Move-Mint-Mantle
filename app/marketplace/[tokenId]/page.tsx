"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BuyNFTModal } from "@/components/ui/buy-nft-modal"
import { 
  ArrowLeft, 
  Play, 
  Heart, 
  Share2, 
  User, 
  Clock, 
  Zap, 
  Coins,
  ExternalLink,
  Copy
} from "lucide-react"

interface NFTDetail {
  tokenId: number
  title: string
  danceStyle: string
  choreographer: string
  duration: number
  ipfsMetadataHash: string
  creator: string
  mintedAt: number
  owner: string
  tokenURI?: string
  price?: string
  isForSale?: boolean
}

export default function NFTDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tokenId = params.tokenId as string
  
  const [nft, setNft] = useState<NFTDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)

  useEffect(() => {
    if (tokenId) {
      loadNFTDetail()
    }
  }, [tokenId])

  const loadNFTDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/nfts?tokenId=${tokenId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Add marketplace-specific fields
        const nftWithMarketplace = {
          ...result.data,
          price: Math.random() > 0.3 ? `${(Math.random() * 0.5 + 0.1).toFixed(3)} MNT` : undefined,
          isForSale: Math.random() > 0.3
        }
        setNft(nftWithMarketplace)
      } else {
        setError(result.error || 'NFT not found')
      }
    } catch (error) {
      console.error('Error loading NFT:', error)
      setError('Failed to load NFT details')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
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

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleBuyNFT = () => {
    setBuyModalOpen(true)
  }

  const handleBuySuccess = (transactionHash: string) => {
    console.log('NFT purchased successfully:', transactionHash)
    setBuyModalOpen(false)
    // Optionally refresh the NFT data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Loading NFT...</span>
        </div>
      </div>
    )
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 mb-4">{error || 'NFT not found'}</div>
            <Button onClick={() => router.push('/marketplace')} variant="outline">
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button 
            onClick={() => router.push('/marketplace')}
            variant="ghost" 
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* NFT Media */}
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-green-900/20 to-gray-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white/80 hover:scale-110 transition-transform cursor-pointer" />
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                    {formatDuration(nft.duration)}
                  </div>
                  
                  {/* For Sale Badge */}
                  {nft.isForSale && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-black">For Sale</Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Favorite
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{nft.title}</h1>
                <p className="text-xl text-gray-400">#{nft.tokenId}</p>
              </div>

              {/* Price */}
              {nft.price && (
                <Card className="bg-green-950/20 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Price</div>
                        <div className="text-3xl font-bold text-green-400">{nft.price}</div>
                      </div>
                      {nft.isForSale && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleBuyNFT}
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Dance Style</span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-400" />
                          <span className="text-white">{nft.danceStyle}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Choreographer</span>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-400" />
                          <span className="text-white">{nft.choreographer}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Duration</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-white">{formatDuration(nft.duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Minted</span>
                        <span className="text-white">{formatTimeAgo(nft.mintedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ownership */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Ownership</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Creator</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">{truncateAddress(nft.creator)}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(nft.creator)}
                            className="p-1"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Current Owner</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">{truncateAddress(nft.owner)}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(nft.owner)}
                            className="p-1"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blockchain Info */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Blockchain</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Token ID</span>
                        <span className="text-white">#{nft.tokenId}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Contract</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">0x2CD0...7073</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => window.open('https://explorer.sepolia.mantle.xyz/address/0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073', '_blank')}
                            className="p-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Network</span>
                        <span className="text-green-400">Mantle Sepolia</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Buy NFT Modal */}
      {nft && (
        <BuyNFTModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          nft={{
            tokenId: nft.tokenId,
            title: nft.title,
            price: nft.price || '0.1 MNT',
            creator: nft.creator,
            owner: nft.owner
          }}
          onSuccess={handleBuySuccess}
        />
      )}
    </div>
  )
}