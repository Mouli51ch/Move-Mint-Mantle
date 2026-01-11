"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  BarChart3, 
  Wallet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Eye,
  Send,
  Calculator
} from "lucide-react"
import { cashflowProtocolService, StreamInfo, CashflowTokenInfo } from "@/lib/services/cashflow-protocol"

export default function CashflowPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [streams, setStreams] = useState<(StreamInfo & { streamId: number })[]>([])
  const [supportedPlatforms, setSupportedPlatforms] = useState<string[]>([])
  const [protocolInfo, setProtocolInfo] = useState<{ protocolFee: number; minimumInvestment: string } | null>(null)
  
  // Stream creation form
  const [newStream, setNewStream] = useState({
    title: "",
    projectedMonthlyRevenue: "",
    durationMonths: 12
  })
  
  // Revenue verification form
  const [revenueForm, setRevenueForm] = useState({
    streamId: 0,
    period: 1,
    verifiedAmount: "",
    platform: "",
    accountId: "",
    amount: ""
  })

  // Investment form
  const [investmentForm, setInvestmentForm] = useState({
    streamId: 0,
    amount: ""
  })

  useEffect(() => {
    initializeService()
  }, [])

  const initializeService = async () => {
    try {
      setLoading(true)
      setConnectionError("")
      console.log('🔄 [Cashflow] Initializing service...')
      
      const initialized = await cashflowProtocolService.initialize()
      console.log('🔄 [Cashflow] Service initialized:', initialized)
      
      if (initialized) {
        const walletStatus = await cashflowProtocolService.checkWalletConnection()
        console.log('🔄 [Cashflow] Wallet status:', walletStatus)
        
        if (walletStatus.connected && walletStatus.correctNetwork) {
          setIsConnected(true)
          setWalletAddress(walletStatus.address || "")
          console.log('✅ [Cashflow] Wallet connected, loading protocol data...')
          await loadProtocolData()
        } else if (walletStatus.connected && !walletStatus.correctNetwork) {
          setConnectionError("Please switch to Mantle Sepolia Testnet")
          setIsConnected(false)
        } else {
          setConnectionError("Please connect your wallet")
          setIsConnected(false)
        }
      } else {
        setConnectionError("Failed to initialize Web3 provider")
        setIsConnected(false)
      }
    } catch (error) {
      console.error("❌ [Cashflow] Failed to initialize service:", error)
      setConnectionError("Failed to connect to the protocol")
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const loadProtocolData = async () => {
    try {
      console.log('🔄 [Cashflow] Loading protocol data...')
      
      // Load protocol info
      const info = await cashflowProtocolService.getProtocolInfo()
      console.log('📊 [Cashflow] Protocol info:', info)
      setProtocolInfo(info)

      // Load supported platforms
      const platforms = await cashflowProtocolService.getSupportedPlatforms()
      console.log('🌐 [Cashflow] Supported platforms:', platforms)
      setSupportedPlatforms(platforms)

      // Load user streams
      if (walletAddress) {
        console.log('🔄 [Cashflow] Loading streams for:', walletAddress)
        const userStreamIds = await cashflowProtocolService.getCreatorStreams(walletAddress)
        console.log('📋 [Cashflow] User stream IDs:', userStreamIds)
        
        const streamDetails = await Promise.all(
          userStreamIds.map(async (id) => {
            const info = await cashflowProtocolService.getStreamInfo(id)
            return info ? { ...info, streamId: id } : null
          })
        )
        const validStreams = streamDetails.filter(Boolean) as (StreamInfo & { streamId: number })[]
        console.log('✅ [Cashflow] Loaded streams:', validStreams)
        setStreams(validStreams)
      }
    } catch (error) {
      console.error("❌ [Cashflow] Failed to load protocol data:", error)
    }
  }

  const connectWallet = async () => {
    try {
      console.log('🔄 [Cashflow] Connecting wallet...')
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log('✅ [Cashflow] Wallet connection requested')
        await initializeService()
      } else {
        console.log('❌ [Cashflow] No Web3 provider found')
        alert('Please install MetaMask to use this feature')
      }
    } catch (error) {
      console.error("❌ [Cashflow] Failed to connect wallet:", error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const createStream = async () => {
    if (!newStream.title || !newStream.projectedMonthlyRevenue) return

    try {
      setLoading(true)
      const result = await cashflowProtocolService.registerStream({
        title: newStream.title,
        projectedMonthlyRevenue: newStream.projectedMonthlyRevenue,
        durationMonths: newStream.durationMonths
      })

      if (result.success) {
        alert(`Stream created successfully! ${result.streamId ? `Stream ID: ${result.streamId}` : ''}`)
        setNewStream({ title: "", projectedMonthlyRevenue: "", durationMonths: 12 })
        await loadProtocolData()
      } else {
        alert(`Failed to create stream: ${result.error}`)
      }
    } catch (error) {
      console.error("Failed to create stream:", error)
      alert("Failed to create stream")
    } finally {
      setLoading(false)
    }
  }

  const verifyRevenue = async () => {
    if (!revenueForm.verifiedAmount || !revenueForm.platform) return

    try {
      setLoading(true)
      
      // Generate a simple proof hash (in production, this would be more sophisticated)
      const proofData = `${revenueForm.streamId}-${revenueForm.period}-${revenueForm.verifiedAmount}-${Date.now()}`
      const proofHash = `0x${Array.from(new TextEncoder().encode(proofData))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 64)
        .padEnd(64, '0')}`

      const result = await cashflowProtocolService.verifyRevenue({
        streamId: revenueForm.streamId,
        period: revenueForm.period,
        verifiedAmount: revenueForm.verifiedAmount,
        proofHash,
        sourceData: [{
          platform: revenueForm.platform,
          accountId: revenueForm.accountId,
          amount: revenueForm.amount || revenueForm.verifiedAmount,
          dataHash: proofHash,
          timestamp: Math.floor(Date.now() / 1000)
        }]
      })

      if (result.success) {
        alert(`Revenue verified successfully! TX: ${result.transactionHash}`)
        setRevenueForm({
          streamId: 0,
          period: 1,
          verifiedAmount: "",
          platform: "",
          accountId: "",
          amount: ""
        })
      } else {
        alert(`Failed to verify revenue: ${result.error}`)
      }
    } catch (error) {
      console.error("Failed to verify revenue:", error)
      alert("Failed to verify revenue")
    } finally {
      setLoading(false)
    }
  }

  const investInStream = async () => {
    if (!investmentForm.amount || investmentForm.streamId === 0) {
      alert('Please enter both Stream ID and Investment Amount')
      return
    }

    // Validate minimum investment
    if (protocolInfo && parseFloat(investmentForm.amount) < parseFloat(protocolInfo.minimumInvestment)) {
      alert(`Investment amount must be at least ${protocolInfo.minimumInvestment} MNT`)
      return
    }

    try {
      setLoading(true)
      console.log('💰 [Frontend] Starting investment:', investmentForm)
      
      const result = await cashflowProtocolService.investInStream({
        streamId: investmentForm.streamId,
        amount: investmentForm.amount
      })

      console.log('💰 [Frontend] Investment result:', result)

      if (result.success) {
        alert(`Investment successful! 🎉\n\nTransaction Hash: ${result.transactionHash}\nAmount: ${investmentForm.amount} MNT\nStream ID: ${investmentForm.streamId}`)
        setInvestmentForm({ streamId: 0, amount: "" })
        await loadProtocolData() // Refresh data to show updated investment
      } else {
        console.error('💰 [Frontend] Investment failed:', result.error)
        alert(`Investment failed: ${result.error}`)
      }
    } catch (error) {
      console.error("💰 [Frontend] Investment error:", error)
      alert("Failed to process investment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkDistribution = async (streamId: number, period: number) => {
    try {
      const isDue = await cashflowProtocolService.isDistributionDue(streamId, period)
      const calculation = await cashflowProtocolService.calculateDistribution(streamId, period)
      
      alert(`Distribution Due: ${isDue ? 'Yes' : 'No'}\n${calculation ? 
        `Calculation:\n- Total: ${calculation.totalAmount} MNT\n- Protocol Fee: ${calculation.protocolFee} MNT\n- Creator Share: ${calculation.creatorShare} MNT\n- Investor Share: ${calculation.investorShare} MNT` : 
        'No calculation available'
      }`)
    } catch (error) {
      console.error("Failed to check distribution:", error)
      alert("Failed to check distribution")
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md bg-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Connect Your Wallet</CardTitle>
              <p className="text-gray-400">Connect to Mantle Sepolia to access the Cashflow Protocol</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={connectWallet} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
              <div className="text-sm text-gray-400 text-center">
                Make sure you're connected to Mantle Sepolia Testnet
              </div>
              {connectionError && (
                <div className="text-sm text-red-400 text-center bg-red-900/20 border border-red-500/20 rounded p-2">
                  {connectionError}
                </div>
              )}
              {loading && (
                <div className="text-xs text-blue-400 text-center">
                  Initializing cashflow protocol...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cashflow Protocol Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
              Tokenize your future royalties and manage revenue streams on Mantle Network
            </p>
            
            {/* Protocol Stats */}
            {protocolInfo && (
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="bg-green-950/30 border border-green-500/20 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-green-400">{protocolInfo.protocolFee / 100}%</div>
                  <div className="text-sm text-gray-400">Protocol Fee</div>
                </div>
                <div className="bg-green-950/30 border border-green-500/20 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-green-400">{protocolInfo.minimumInvestment}</div>
                  <div className="text-sm text-gray-400">Min Investment (MNT)</div>
                </div>
                <div className="bg-green-950/30 border border-green-500/20 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-green-400">{streams.length}</div>
                  <div className="text-sm text-gray-400">Your Streams</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="streams" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-700">
              <TabsTrigger value="streams" className="text-white">My Streams</TabsTrigger>
              <TabsTrigger value="create" className="text-white">Create Stream</TabsTrigger>
              <TabsTrigger value="verify" className="text-white">Verify Revenue</TabsTrigger>
              <TabsTrigger value="invest" className="text-white">Invest</TabsTrigger>
            </TabsList>

            {/* My Streams Tab */}
            <TabsContent value="streams" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Your Cashflow Streams</h2>
                <Button onClick={loadProtocolData} disabled={loading} variant="outline">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {streams.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Streams Yet</h3>
                    <p className="text-gray-400 mb-4">Create your first cashflow stream to get started</p>
                    <Button onClick={() => document.querySelector('[value="create"]')?.click()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Stream
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streams.map((stream) => (
                    <Card key={stream.streamId} className="bg-gray-900 border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg">{stream.title}</CardTitle>
                          <Badge variant={stream.isActive ? "default" : "secondary"}>
                            {stream.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Monthly Revenue</div>
                            <div className="text-white font-semibold">{stream.projectedMonthlyRevenue} MNT</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Duration</div>
                            <div className="text-white font-semibold">{stream.durationMonths} months</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Total Investment</div>
                            <div className="text-white font-semibold">{stream.totalInvestment} MNT</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Tokenized</div>
                            <div className="text-white font-semibold">{stream.isTokenized ? "Yes" : "No"}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => checkDistribution(stream.streamId, 1)}
                            className="flex-1"
                          >
                            <Calculator className="w-4 h-4 mr-1" />
                            Check Distribution
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Create Stream Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Create New Cashflow Stream</CardTitle>
                  <p className="text-gray-400">Tokenize your future royalty payments for immediate liquidity</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Stream Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., My Dance Royalties"
                        value={newStream.title}
                        onChange={(e) => setNewStream({...newStream, title: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue" className="text-white">Projected Monthly Revenue (MNT)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        step="0.01"
                        placeholder="1.0"
                        value={newStream.projectedMonthlyRevenue}
                        onChange={(e) => setNewStream({...newStream, projectedMonthlyRevenue: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-white">Duration (Months)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="60"
                        value={newStream.durationMonths}
                        onChange={(e) => setNewStream({...newStream, durationMonths: parseInt(e.target.value)})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createStream} 
                    disabled={loading || !newStream.title || !newStream.projectedMonthlyRevenue}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Cashflow Stream
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verify Revenue Tab */}
            <TabsContent value="verify" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Verify Revenue</CardTitle>
                  <p className="text-gray-400">Submit revenue verification for your streams</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="streamId" className="text-white">Stream ID</Label>
                      <Input
                        id="streamId"
                        type="number"
                        placeholder="1"
                        value={revenueForm.streamId || ""}
                        onChange={(e) => setRevenueForm({...revenueForm, streamId: parseInt(e.target.value) || 0})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period" className="text-white">Period (Month)</Label>
                      <Input
                        id="period"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={revenueForm.period}
                        onChange={(e) => setRevenueForm({...revenueForm, period: parseInt(e.target.value)})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verifiedAmount" className="text-white">Verified Amount (MNT)</Label>
                      <Input
                        id="verifiedAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.5"
                        value={revenueForm.verifiedAmount}
                        onChange={(e) => setRevenueForm({...revenueForm, verifiedAmount: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-white">Platform</Label>
                      <select
                        id="platform"
                        value={revenueForm.platform}
                        onChange={(e) => setRevenueForm({...revenueForm, platform: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="">Select Platform</option>
                        {supportedPlatforms.map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountId" className="text-white">Account ID</Label>
                      <Input
                        id="accountId"
                        placeholder="your-account-id"
                        value={revenueForm.accountId}
                        onChange={(e) => setRevenueForm({...revenueForm, accountId: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={verifyRevenue} 
                    disabled={loading || !revenueForm.verifiedAmount || !revenueForm.platform}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Verify Revenue
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invest Tab */}
            <TabsContent value="invest" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Invest in Streams</CardTitle>
                  <p className="text-gray-400">Invest in cashflow streams to earn yield from future royalties</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Available Streams Info */}
                  {streams.length > 0 && (
                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">Available Streams</h4>
                      <div className="space-y-2 text-sm">
                        {streams.map((stream) => (
                          <div key={stream.streamId} className="flex justify-between items-center">
                            <span className="text-gray-300">
                              Stream #{stream.streamId}: {stream.title}
                            </span>
                            <div className="flex gap-2">
                              <Badge variant={stream.isTokenized ? "default" : "secondary"}>
                                {stream.isTokenized ? "Tokenized" : "Not Tokenized"}
                              </Badge>
                              <Badge variant={stream.isActive ? "default" : "secondary"}>
                                {stream.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Note: You can only invest in tokenized streams that you didn't create
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="investStreamId" className="text-white">Stream ID</Label>
                      <Input
                        id="investStreamId"
                        type="number"
                        placeholder="1"
                        value={investmentForm.streamId || ""}
                        onChange={(e) => setInvestmentForm({...investmentForm, streamId: parseInt(e.target.value) || 0})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investAmount" className="text-white">Investment Amount (MNT)</Label>
                      <Input
                        id="investAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.1"
                        value={investmentForm.amount}
                        onChange={(e) => setInvestmentForm({...investmentForm, amount: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {protocolInfo && (
                    <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold">Investment Requirements</span>
                      </div>
                      <ul className="text-sm text-yellow-300 space-y-1">
                        <li>• Minimum investment: {protocolInfo.minimumInvestment} MNT</li>
                        <li>• Protocol fee: {protocolInfo.protocolFee / 100}% of investment</li>
                        <li>• Stream must be tokenized and active</li>
                        <li>• Cannot invest in your own streams</li>
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    onClick={investInStream} 
                    disabled={loading || !investmentForm.amount || investmentForm.streamId === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Invest in Stream
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}