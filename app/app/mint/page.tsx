"use client"

import type React from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RealTimeProgress } from "@/components/ui/real-time-progress"
import Link from "next/link"
import { useState, useEffect } from "react"
import { LicenseConfiguration } from "@/components/ui/license-configuration"
import { WalletConnection } from "@/components/ui/wallet-connection"
import { TransactionStatus } from "@/components/ui/transaction-status"
import { useLicenseConfiguration } from "@/hooks/use-license-configuration"
import { useRealTimeProgress } from "@/hooks/use-real-time-progress"
import { universalMintingEngineService } from "@/lib/api/service"
import { MintRequest, NFTMetadata, DanceAnalysisResults, DanceDifficulty } from "@/lib/types/api"
import { useSession } from "@/hooks/use-session"
import { mintNFT, estimateMintGas } from '@/lib/contracts/nft-minting'

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

// Transaction status type
interface TxStatus {
  status: 'pending' | 'confirmed' | 'failed'
  hash: string
  blockNumber?: number
}

export default function Mint() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [price, setPrice] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'details' | 'license' | 'review'>('details')
  const [analysisResults, setAnalysisResults] = useState<DanceAnalysisResults | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [mintingError, setMintingError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [mintingStep, setMintingStep] = useState<'idle' | 'preparing' | 'signing' | 'confirming' | 'complete' | 'error'>('idle')
  const [canRetryMinting, setCanRetryMinting] = useState(true)
  const [mintingOperationId, setMintingOperationId] = useState<string>('')

  // Enhanced real-time progress for minting
  const mintingProgress = useRealTimeProgress({
    operationId: mintingOperationId,
    onComplete: (id) => {
      setMintingStep('complete')
    },
    onError: (id, error) => {
      setMintingError(error)
      setCanRetryMinting(true)
    }
  })

  // License configuration hook
  const {
    config: licenseConfig,
    updateConfig: updateLicenseConfig,
    validateConfiguration,
    isLoading: licenseLoading,
    error: licenseError,
    clearError: clearLicenseError
  } = useLicenseConfiguration()

  // Wallet state management
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletChainId, setWalletChainId] = useState<number | null>(null)
  
  // Story Protocol Testnet configuration
  const STORY_PROTOCOL_TESTNET = {
    id: 1513,
    name: 'Story Protocol Testnet',
  }
  
  const isCorrectNetwork = walletChainId === STORY_PROTOCOL_TESTNET.id

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
          
          // Get chain ID
          const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
          setWalletChainId(parseInt(chainId, 16))
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err)
      }
    }
  }

  // Session management
  const { 
    analysisSession, 
    getCurrentVideoId,
    saveMinting,
    updateMintingStatus,
    mintingSession,
    updateWorkflowStep 
  } = useSession()

  // Load analysis results and video ID from session service
  useEffect(() => {
    const storedVideoId = getCurrentVideoId()

    if (storedVideoId) {
      setVideoId(storedVideoId)
    }

    if (analysisSession) {
      setAnalysisResults(analysisSession.analysisResults)
      setVideoId(analysisSession.videoId)
    }

    // DEMO MODE: If no analysis data, create mock data for testing
    // Remove this in production or after testing
    if (!analysisSession && !storedVideoId) {
      const demoAnalysis: DanceAnalysisResults = {
        videoId: 'demo-video-' + Date.now(),
        duration: 180, // 3 minutes
        frameRate: 30,
        totalFrames: 5400,
        detectedMovements: [
          { name: 'Hip Hop Basic Step', confidence: 0.92, startTime: 0, endTime: 30 },
          { name: 'Body Roll', confidence: 0.88, startTime: 30, endTime: 60 },
          { name: 'Wave', confidence: 0.85, startTime: 60, endTime: 90 }
        ],
        primaryStyle: 'hip-hop',
        styleDistribution: [
          { style: 'hip-hop', percentage: 70, displayName: 'Hip Hop' },
          { style: 'freestyle', percentage: 30, displayName: 'Freestyle' }
        ],
        qualityMetrics: {
          overall: 85,
          technical: 82,
          artistic: 88
        },
        danceMetrics: {
          averageDifficulty: 'Intermediate',
          uniqueStyles: 2,
          technicalComplexity: 0.75,
          artisticExpression: 0.82
        },
        movementsByStyle: {},
        recommendations: ['Great energy and flow!']
      }
      setAnalysisResults(demoAnalysis)
      setVideoId(demoAnalysis.videoId)
      console.log('🎭 Demo mode enabled - using mock analysis data for testing')
    }

    // Restore minting session if exists
    if (mintingSession) {
      setTitle(mintingSession.nftTitle)
      setDescription(mintingSession.nftDescription || '')
      setTags(mintingSession.tags?.join(', ') || '')
      setPrice(mintingSession.price || '')
      setIsPrivate(mintingSession.isPrivate)
      setMintingStep(mintingSession.mintingStatus)
      setTransactionHash(mintingSession.transactionHash || null)
      setCanRetryMinting(mintingSession.canRetry)
      if (mintingSession.errorMessage) {
        setMintingError(mintingSession.errorMessage)
      }
    }
  }, [analysisSession, mintingSession, getCurrentVideoId])

  const handleNextStep = () => {
    if (currentStep === 'details') {
      if (!title.trim()) {
        setMintingError('Please enter a title for your NFT')
        return
      }
      setCurrentStep('license')
    } else if (currentStep === 'license') {
      const validation = validateConfiguration()
      if (!validation.isValid) {
        setMintingError(validation.errors.join(', '))
        return
      }
      setCurrentStep('review')
    }
    setMintingError(null)
  }

  const handlePreviousStep = () => {
    if (currentStep === 'license') {
      setCurrentStep('details')
    } else if (currentStep === 'review') {
      setCurrentStep('license')
    }
    setMintingError(null)
  }





  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoId || !analysisResults) {
      setMintingError('Missing video data. To mint a real NFT, please upload and analyze a dance video first. Currently using demo mode for testing.')
      console.warn('⚠️ No video analysis data - using demo mode')
      // Allow continuing with demo data for testing
      // return
    }

    // Wallet connection is optional for server-side minting
    // If no wallet connected, use server-side minting wallet
    const recipientAddress = walletAddress || process.env.NEXT_PUBLIC_MINTING_WALLET_ADDRESS || '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433'

    if (isWalletConnected && !isCorrectNetwork) {
      setMintingError('Please switch to Story Protocol Aeneid Testnet (Chain ID: 1513) or disconnect wallet to use server-side minting.')
      return
    }

    const validation = validateConfiguration()
    if (!validation.isValid) {
      setMintingError(validation.errors.join(', '))
      return
    }

    setIsLoading(true)
    setMintingError(null)
    setMintingStep('preparing')

    // Generate operation ID for enhanced progress tracking
    const operationId = `mint-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setMintingOperationId(operationId)

    // Start enhanced real-time progress tracking
    mintingProgress.start('preparing', 'Preparing NFT metadata...', {
      totalItems: 1,
      canCancel: false,
      canPause: false,
      subStages: [
        { name: 'Metadata Preparation', status: 'active', percentage: 0 },
        { name: 'IPFS Upload', status: 'pending', percentage: 0 },
        { name: 'License Processing', status: 'pending', percentage: 0 },
        { name: 'Transaction Preparation', status: 'pending', percentage: 0 },
        { name: 'Wallet Signature', status: 'pending', percentage: 0 },
        { name: 'Blockchain Submission', status: 'pending', percentage: 0 },
        { name: 'Confirmation', status: 'pending', percentage: 0 },
      ]
    })

    // Save minting session
    const mintingSessionData = {
      videoId,
      nftTitle: title,
      nftDescription: description,
      tags: tags.split(',').filter(tag => tag.trim()).map(tag => tag.trim()),
      price,
      isPrivate,
      licenseConfig: {
        licenseId: licenseConfig.generatedLicense?.data.licenseDocument.id,
        templateId: licenseConfig.templateId,
        customParams: licenseConfig.customParams,
        generatedLicense: licenseConfig.generatedLicense,
        configuredAt: Date.now(),
      },
      mintingStatus: 'preparing' as const,
      canRetry: true,
    }
    saveMinting(mintingSessionData)
    updateWorkflowStep('minting')

    try {
      // Update progress: Metadata preparation
      mintingProgress.updateSubStage('Metadata Preparation', 'active')
      mintingProgress.setProgress(10, 'Preparing NFT metadata...')

      // Prepare enhanced dance-specific NFT metadata
      const primaryStyle = analysisResults.primaryStyle || 'freestyle'
      const danceMetrics = analysisResults.danceMetrics || {}
      const styleDistribution = analysisResults.styleDistribution || []
      
      const metadata: NFTMetadata = {
        name: title,
        description: description || `${primaryStyle.charAt(0).toUpperCase() + primaryStyle.slice(1)} dance NFT featuring ${analysisResults.detectedMovements.length} movements with ${danceMetrics.averageDifficulty || 'Beginner'} difficulty`,
        image: '', // Will be set by API
        animation_url: '', // Will be set by API
        attributes: [
          // Basic metrics
          { trait_type: 'Duration', value: `${Math.floor(analysisResults.duration / 60)}:${String(Math.floor(analysisResults.duration % 60)).padStart(2, '0')}` },
          { trait_type: 'Total Movements', value: analysisResults.detectedMovements.length, display_type: 'number' },
          { trait_type: 'Overall Quality', value: Math.round(analysisResults.qualityMetrics.overall), display_type: 'number' },
          
          // Dance-specific attributes
          { trait_type: 'Primary Style', value: primaryStyle.charAt(0).toUpperCase() + primaryStyle.slice(1) },
          { trait_type: 'Difficulty Level', value: danceMetrics.averageDifficulty || 'Beginner' },
          { trait_type: 'Style Diversity', value: danceMetrics.uniqueStyles || 1, display_type: 'number' },
          { trait_type: 'Technical Complexity', value: Math.round((danceMetrics.technicalComplexity || 0) * 100), display_type: 'number' },
          { trait_type: 'Artistic Expression', value: Math.round((danceMetrics.artisticExpression || 0) * 100), display_type: 'number' },
          
          // Style distribution (top 3 styles)
          ...styleDistribution.slice(0, 3).map((style: any, index: number) => ({
            trait_type: `Style ${index + 1}`,
            value: `${style.displayName} (${Math.round(style.percentage)}%)`
          })),
          
          // User tags
          ...tags.split(',').filter(tag => tag.trim()).map(tag => ({ trait_type: 'Tag', value: tag.trim() }))
        ],
        external_url: window.location.origin,
        
        // Enhanced dance-specific fields
        danceStyle: styleDistribution.map((style: any) => style.style),
        primaryDanceStyle: primaryStyle,
        choreographer: '', // Could be added to form later
        musicInfo: undefined, // Could be extracted from analysis
        difficulty: (danceMetrics.averageDifficulty as DanceDifficulty) || 'Beginner',
        technicalComplexity: danceMetrics.technicalComplexity || 0,
        artisticExpression: danceMetrics.artisticExpression || 0,
        styleDistribution: styleDistribution,
        movementsByStyle: analysisResults.movementsByStyle || {},
        recommendations: analysisResults.recommendations || [],
        originalVideo: videoId,
        analysisData: analysisResults,
        licenseTerms: licenseConfig.generatedLicense?.data.licenseDocument || {
          id: licenseConfig.templateId || 'default',
          title: 'Standard License',
          content: 'Standard licensing terms',
          parameters: {},
          ipfsHash: '',
          storyProtocolParams: {
            licenseTemplate: 'standard',
            licenseTerms: {},
            royaltyPolicy: 'default',
            mintingFee: '0.05'
          }
        }
      }

      mintingProgress.updateSubStage('Metadata Preparation', 'completed', 100)
      mintingProgress.updateSubStage('IPFS Upload', 'active')
      mintingProgress.setProgress(20, 'Uploading metadata to IPFS...')

      mintingProgress.updateSubStage('IPFS Upload', 'completed', 100)
      mintingProgress.updateSubStage('License Processing', 'active')
      mintingProgress.setProgress(40, 'Processing license terms...')

      // Create IPFS metadata (simplified - in production, upload to real IPFS)
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      mintingProgress.updateSubStage('License Processing', 'completed', 100)
      mintingProgress.updateSubStage('Transaction Preparation', 'active')
      mintingProgress.setProgress(60, 'Preparing blockchain transaction...')

      mintingProgress.updateSubStage('Transaction Preparation', 'completed', 100)
      mintingProgress.updateSubStage('Blockchain Submission', 'active')
      mintingProgress.setProgress(70, 'Submitting to blockchain...')

      setMintingStep('signing')
      updateMintingStatus('signing')

      // Use server-side minting API (no wallet signature needed!)
      console.log('🚀 Minting via server-side API...')
      const mintResponse = await fetch('/api/mint-ip-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          recipient: recipientAddress
        })
      })

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json()
        throw new Error(errorData.error || 'Minting failed')
      }

      const mintResult = await mintResponse.json()

      setTransactionHash(mintResult.transactionHash)
      setMintingStep('confirming')
      updateMintingStatus('confirming', mintResult.transactionHash)

      mintingProgress.updateSubStage('Blockchain Submission', 'completed', 100)
      mintingProgress.updateSubStage('Confirmation', 'active')
      mintingProgress.setProgress(90, 'Confirming on blockchain...')

      // Server already waited for confirmation
      if (mintResult.success && mintResult.status === 'success') {
        mintingProgress.updateSubStage('Confirmation', 'completed', 100)
        mintingProgress.complete('NFT minted successfully on Story Protocol!')

        console.log('✅ NFT minted successfully!', {
          transactionHash: mintResult.transactionHash,
          tokenId: mintResult.tokenId,
          blockNumber: mintResult.blockNumber,
          explorerUrl: mintResult.explorerUrl
        })

        setMintingStep('complete')
        setIsLoading(false)
        updateMintingStatus('complete', mintResult.transactionHash)
        updateWorkflowStep('complete')
      } else {
        throw new Error('Transaction failed on blockchain')
      }

      // Transaction will be monitored by TransactionStatus component
      
    } catch (error) {
      console.error('Minting failed:', error)
      
      let errorMessage = 'Minting failed. Please try again.'
      let canRetry = true
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('User denied transaction')) {
          errorMessage = 'Transaction was cancelled. You can try minting again.'
          canRetry = true
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction. Please add more IP tokens to your wallet.'
          canRetry = false
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
          canRetry = true
        } else if (error.message.includes('gas')) {
          errorMessage = 'Gas estimation failed. The network may be congested. Please try again later.'
          canRetry = true
        } else {
          errorMessage = error.message
        }
      }
      
      // Update progress with error
      mintingProgress.fail(errorMessage, { 
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        canRetry,
        timestamp: Date.now()
      })
      
      setMintingError(errorMessage)
      setIsLoading(false)
      setMintingStep('idle')
      
      // Store retry capability and error in session
      setCanRetryMinting(canRetry)
      updateMintingStatus('error', undefined, errorMessage)
    }
  }

  // Handle transaction completion
  const handleTransactionComplete = (status: TxStatus) => {
    if (status.status === 'confirmed') {
      setMintingStep('complete')
      setIsLoading(false)
      
      // Update session with completion
      updateMintingStatus('complete', status.hash)
      updateWorkflowStep('complete')
      
      // Clear any previous errors
      setMintingError(null)
      
      // Show success message and redirect after delay
      setTimeout(() => {
        window.location.href = "/app/dashboard"
      }, 3000) // Increased delay to let user see completion
    }
  }

  // Handle transaction error
  const handleTransactionError = (error: string) => {
    console.error('Transaction error:', error)
    
    let userFriendlyError = error
    let canRetry = true
    
    // Parse common transaction errors
    if (error.includes('reverted')) {
      userFriendlyError = 'Transaction failed on blockchain. This may be due to network congestion or insufficient gas.'
      canRetry = true
    } else if (error.includes('timeout')) {
      userFriendlyError = 'Transaction confirmation timed out. It may still be processing. Check your wallet or try again.'
      canRetry = true
    } else if (error.includes('rejected')) {
      userFriendlyError = 'Transaction was rejected. You can try minting again.'
      canRetry = true
    } else if (error.includes('insufficient')) {
      userFriendlyError = 'Insufficient funds for transaction fees. Please add more IP tokens to your wallet.'
      canRetry = false
    }
    
    setMintingError(userFriendlyError)
    setCanRetryMinting(canRetry)
    setIsLoading(false)
    setMintingStep('idle')
    setTransactionHash(null) // Clear failed transaction hash
    
    // Update session with error
    updateMintingStatus('error', undefined, userFriendlyError)
  }

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 -left-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-in-down">
            <Link
              href="/app/results"
              className="text-gray-400 hover:text-green-400 text-sm mb-6 inline-block transition duration-300"
            >
              ← Back to Results
            </Link>
            <h1 className="font-medium text-5xl text-white mb-3">Mint Your Move NFT</h1>
            <p className="text-gray-400">
              {currentStep === 'details' && 'Add details for your dance NFT'}
              {currentStep === 'license' && 'Configure licensing terms for your NFT'}
              {currentStep === 'review' && 'Review and finalize your NFT minting'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center space-x-4">
              {[
                { key: 'details', label: 'Details', number: 1 },
                { key: 'license', label: 'License', number: 2 },
                { key: 'review', label: 'Review', number: 3 }
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition duration-300 ${
                    currentStep === step.key 
                      ? 'border-green-400 bg-green-400 text-black' 
                      : index < ['details', 'license', 'review'].indexOf(currentStep)
                      ? 'border-green-400 bg-green-400 text-black'
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {index < ['details', 'license', 'review'].indexOf(currentStep) ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    currentStep === step.key ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      index < ['details', 'license', 'review'].indexOf(currentStep)
                        ? 'bg-green-400'
                        : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {(mintingError || licenseError) && (
            <div className="mb-6 bg-red-950/30 border border-red-900/50 rounded-xl p-4 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-red-400 mb-3">{mintingError || licenseError}</p>
                  {mintingError && canRetryMinting && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setMintingError(null)
                          handleMint({ preventDefault: () => {} } as React.FormEvent)
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 h-auto"
                      >
                        Retry Minting
                      </Button>
                      <Button
                        onClick={() => {
                          setMintingError(null)
                          setCurrentStep('license')
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 h-auto"
                      >
                        Modify Parameters
                      </Button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setMintingError(null)
                    clearLicenseError()
                  }}
                  className="text-red-300 hover:text-red-200 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <form onSubmit={currentStep === 'review' ? handleMint : (e) => e.preventDefault()} className="space-y-6">
            {/* Move Summary - Always visible */}
            <div
              className="bg-black border border-green-900/30 p-6 rounded-xl animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="font-medium text-lg text-white mb-4">Move Summary</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1 uppercase">Detected Moves</p>
                  <p className="text-white">
                    {analysisResults 
                      ? analysisResults.detectedMovements.map(m => m.name).join(', ') || 'No movements detected'
                      : 'Loading analysis...'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1 uppercase">Duration</p>
                  <p className="text-white">
                    {analysisResults 
                      ? `${Math.floor(analysisResults.duration / 60)}:${String(Math.floor(analysisResults.duration % 60)).padStart(2, '0')}`
                      : 'Loading...'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: Details */}
            {currentStep === 'details' && (
              <div className="space-y-6">
                {/* Wallet Connection - Always Visible */}
                <div className="bg-black border border-green-900/30 p-6 rounded-xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <h3 className="text-lg font-medium text-white mb-4">🔗 Connect Your Wallet First</h3>
                  <p className="text-gray-400 text-sm mb-4">Connect your wallet to mint NFTs on Story Protocol blockchain</p>
                  <WalletConnection 
                    onConnect={(address) => {
                      setWalletAddress(address)
                      setIsWalletConnected(true)
                      checkWalletConnection()
                    }}
                    onDisconnect={() => {
                      setWalletAddress(null)
                      setIsWalletConnected(false)
                      setWalletChainId(null)
                    }}
                    showBalance={true}
                    showNetworkWarning={true}
                  />
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">NFT Title *</label>
                  <Input
                    type="text"
                    placeholder="e.g., Evening Ballet Routine"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={60}
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 hover:border-green-600/50 transition duration-300"
                  />
                  <p className="text-gray-500 text-xs mt-1">{title.length}/60 characters</p>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your routine, choreography, and artistic expression..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={5}
                    className="w-full bg-black border border-green-900/30 rounded-lg text-white placeholder:text-gray-600 p-3 hover:border-green-600/50 transition duration-300 focus:border-green-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">{description.length}/500 characters</p>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <Input
                    type="text"
                    placeholder="e.g., ballet, contemporary, choreography (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 hover:border-green-600/50 transition duration-300"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (Optional)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-black border-green-900/30 text-white placeholder:text-gray-600 hover:border-green-600/50 transition duration-300"
                      />
                      <span className="text-gray-400">IP</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Leave blank to make it free</p>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-green-600/50 bg-black transition duration-300"
                      />
                      <span className="text-sm text-gray-300">Make this private (only you can view)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: License Configuration */}
            {currentStep === 'license' && (
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <LicenseConfiguration
                  onLicenseChange={updateLicenseConfig}
                  initialConfig={licenseConfig}
                />
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 'review' && (
              <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                {/* Wallet Connection */}
                <div className="bg-black border border-green-900/30 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">Wallet Connection</h3>
                  <WalletConnection 
                    onConnect={(address) => {
                      setWalletAddress(address)
                      setIsWalletConnected(true)
                      checkWalletConnection() // Update chain ID and other details
                    }}
                    onDisconnect={() => {
                      setWalletAddress(null)
                      setIsWalletConnected(false)
                      setWalletChainId(null)
                    }}
                    showBalance={true}
                    showNetworkWarning={true}
                  />
                </div>

                {/* Transaction Status */}
                {transactionHash && (
                  <TransactionStatus
                    txHash={transactionHash}
                    onComplete={handleTransactionComplete}
                    onError={handleTransactionError}
                    requiredConfirmations={1}
                  />
                )}

                {/* Enhanced Real-Time Minting Progress */}
                {mintingOperationId && mintingStep !== 'idle' && (
                  <RealTimeProgress
                    operationId={mintingOperationId}
                    title="NFT Minting Progress"
                    showNotifications={true}
                    showSubStages={true}
                    showTimeRemaining={true}
                    allowCancel={false}
                    className="animate-fade-in-up"
                  />
                )}

                {/* Fallback to original progress if enhanced not available */}
                {!mintingOperationId && mintingStep !== 'idle' && (
                  <div className="bg-black border border-green-900/30 p-6 rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-4">Minting Progress</h3>
                    <div className="space-y-3">
                      {[
                        { 
                          key: 'preparing', 
                          label: 'Preparing Transaction', 
                          description: 'Creating NFT metadata and preparing blockchain transaction',
                          details: 'Uploading metadata to IPFS and generating transaction data'
                        },
                        { 
                          key: 'signing', 
                          label: 'Signing Transaction', 
                          description: 'Please sign the transaction in your wallet',
                          details: 'Confirm the transaction in your wallet popup'
                        },
                        { 
                          key: 'confirming', 
                          label: 'Confirming Transaction', 
                          description: 'Waiting for blockchain confirmation',
                          details: transactionHash ? `Transaction: ${transactionHash.slice(0, 10)}...${transactionHash.slice(-8)}` : 'Broadcasting to Story Protocol network'
                        },
                        { 
                          key: 'complete', 
                          label: 'Minting Complete', 
                          description: 'Your NFT has been successfully minted!',
                          details: 'Your dance NFT is now live on Story Protocol. Redirecting to your dashboard...'
                        }
                      ].map((step, index) => {
                        const isActive = mintingStep === step.key
                        const isComplete = ['preparing', 'signing', 'confirming', 'complete'].indexOf(mintingStep) > index
                        
                        return (
                          <div key={step.key} className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 ${
                            isActive ? 'bg-green-950/20 border border-green-900/30 shadow-lg' : 
                            isComplete ? 'bg-green-950/10' : 'bg-gray-950/20'
                          }`}>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all duration-300 ${
                              isComplete ? 'bg-green-400 text-black' :
                              isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}>
                              {isComplete ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : isActive ? (
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium transition-colors duration-300 ${
                                isActive ? 'text-green-400' : isComplete ? 'text-green-300' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </p>
                              <p className={`text-sm mt-1 transition-colors duration-300 ${
                                isActive ? 'text-green-300' : 'text-gray-500'
                              }`}>
                                {step.description}
                              </p>
                              {isActive && (
                                <p className="text-xs text-gray-400 mt-2 animate-fade-in-up">
                                  {step.details}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>
                          {mintingStep === 'preparing' && '25%'}
                          {mintingStep === 'signing' && '50%'}
                          {mintingStep === 'confirming' && '75%'}
                          {mintingStep === 'complete' && '100%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: 
                              mintingStep === 'preparing' ? '25%' :
                              mintingStep === 'signing' ? '50%' :
                              mintingStep === 'confirming' ? '75%' :
                              mintingStep === 'complete' ? '100%' : '0%'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Success Celebration */}
                    {mintingStep === 'complete' && (
                      <div className="mt-6 bg-gradient-to-r from-green-950/30 to-green-900/20 border border-green-400/30 p-6 rounded-xl animate-fade-in-up">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🎉</div>
                          <h4 className="text-xl font-medium text-green-400 mb-2">Congratulations!</h4>
                          <p className="text-green-300 mb-4">
                            Your dance NFT "{title}" has been successfully minted on Story Protocol!
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={() => window.location.href = "/app/dashboard"}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              View in Dashboard
                            </Button>
                            {transactionHash && (
                              <Button
                                onClick={() => window.open(`https://testnet.storyscan.xyz/tx/${transactionHash}`, '_blank')}
                                className="border border-green-600 text-green-400 hover:bg-green-950/30"
                              >
                                View Transaction
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* NFT Details Review */}
                <div className="bg-black border border-green-900/30 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">NFT Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Title:</span>
                      <span className="text-white">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Description:</span>
                      <span className="text-white text-right max-w-md">
                        {description || 'No description provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tags:</span>
                      <span className="text-white">{tags || 'No tags'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white">{price ? `${price} IP` : 'Free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visibility:</span>
                      <span className="text-white">{isPrivate ? 'Private' : 'Public'}</span>
                    </div>
                  </div>
                </div>

                {/* License Review */}
                <div className="bg-black border border-green-900/30 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-4">License Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">License Type:</span>
                      <span className="text-white">
                        {licenseConfig.useTemplate ? 'Template-based' : 'Custom'}
                      </span>
                    </div>
                    {licenseConfig.useTemplate && licenseConfig.templateId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Template:</span>
                        <span className="text-white">{licenseConfig.templateId}</span>
                      </div>
                    )}
                    {!licenseConfig.useTemplate && licenseConfig.customParams && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Commercial Use:</span>
                          <span className="text-white">
                            {licenseConfig.customParams.commercialUse ? 'Allowed' : 'Not Allowed'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Derivatives:</span>
                          <span className="text-white">
                            {licenseConfig.customParams.derivativesAllowed ? 'Allowed' : 'Not Allowed'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenue Share:</span>
                          <span className="text-white">{licenseConfig.customParams.revenueSharePercentage}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-black border border-green-900/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-900/20">
                    <span className="text-gray-400 text-sm">Minting Fee</span>
                    <span className="text-white text-sm">0.05 IP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total Cost</span>
                    <span className="text-green-400 font-medium">0.05 IP (~$200)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              {currentStep !== 'details' ? (
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex-1 border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300"
                >
                  Previous
                </Button>
              ) : (
                <Link href="/app/results" className="flex-1">
                  <Button
                    type="button"
                    className="w-full border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300"
                  >
                    Cancel
                  </Button>
                </Link>
              )}
              
              {currentStep !== 'review' ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={currentStep === 'details' && !title.trim()}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium py-3 h-auto shadow-lg shadow-green-500/30 disabled:opacity-50 transition-all duration-300"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || licenseLoading || !isWalletConnected || !isCorrectNetwork || mintingStep === 'complete'}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium py-3 h-auto shadow-lg shadow-green-500/30 disabled:opacity-50 transition-all duration-300"
                >
                  {mintingStep === 'complete' ? "Minting Complete!" :
                   isLoading ? "Minting..." : 
                   !isWalletConnected ? "Connect Wallet to Mint" :
                   !isCorrectNetwork ? "Switch Network to Mint" :
                   "Mint NFT"}
                </Button>
              )}
            </div>
          </form>

          <div
            className="mt-12 bg-black border border-green-900/30 p-6 rounded-xl animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="font-medium text-lg text-white mb-4">What's Included</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                "Permanent Story Protocol storage of your move NFT",
                "Transferable and tradeable on secondary markets",
                "Earn royalties when your NFT is sold",
                "Featured in your creator profile",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                >
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
