/**
 * Buy NFT Modal Component
 * Handles the complete buying flow with wallet connection and transaction
 */

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMarketplace } from '@/hooks/useMarketplace'
import { 
  X, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Loader2,
  Coins,
  Network
} from 'lucide-react'

interface NFTData {
  tokenId: number
  title: string
  price: string
  image?: string
  creator: string
  owner: string
}

interface BuyNFTModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFTData
  onSuccess?: (transactionHash: string) => void
}

export function BuyNFTModal({ isOpen, onClose, nft, onSuccess }: BuyNFTModalProps) {
  const {
    isLoading,
    error,
    isWalletConnected,
    isCorrectNetwork,
    userAddress,
    checkWallet,
    connectWallet,
    switchNetwork,
    buyNFT,
    clearError
  } = useMarketplace()

  const [step, setStep] = useState<'connect' | 'network' | 'confirm' | 'processing' | 'success' | 'error'>('connect')
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  // Check wallet status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkWallet().then(status => {
        if (!status.connected) {
          setStep('connect')
        } else if (!status.correctNetwork) {
          setStep('network')
        } else {
          setStep('confirm')
        }
      })
    }
  }, [isOpen, checkWallet])

  // Handle wallet connection
  const handleConnectWallet = async () => {
    await connectWallet()
    if (isWalletConnected) {
      if (isCorrectNetwork) {
        setStep('confirm')
      } else {
        setStep('network')
      }
    }
  }

  // Handle network switch
  const handleSwitchNetwork = async () => {
    await switchNetwork()
    if (isCorrectNetwork) {
      setStep('confirm')
    }
  }

  // Handle NFT purchase
  const handleBuyNFT = async () => {
    setStep('processing')
    clearError()
    
    const result = await buyNFT(nft.tokenId, nft.price.replace(' MNT', ''))
    
    if (result.success && result.transactionHash) {
      setTransactionHash(result.transactionHash)
      setStep('success')
      onSuccess?.(result.transactionHash)
    } else {
      setStep('error')
    }
  }

  // Handle modal close
  const handleClose = () => {
    setStep('connect')
    setTransactionHash(null)
    clearError()
    onClose()
  }

  if (!isOpen) return null

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-md w-full">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Buy NFT</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* NFT Preview */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{nft.title}</h4>
                  <p className="text-sm text-gray-400">#{nft.tokenId}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Price</span>
                  <span className="text-green-400 font-bold text-lg">{nft.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {step === 'connect' && (
            <div className="text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h4>
              <p className="text-gray-400 text-sm mb-6">
                Connect your wallet to purchase this NFT
              </p>
              <Button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'network' && (
            <div className="text-center">
              <Network className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Switch Network</h4>
              <p className="text-gray-400 text-sm mb-6">
                Please switch to Mantle Sepolia network to continue
              </p>
              <Button
                onClick={handleSwitchNetwork}
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>
                    <Network className="w-4 h-4 mr-2" />
                    Switch to Mantle
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-4">Confirm Purchase</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Address</span>
                    <span className="text-white font-mono">{userAddress ? formatAddress(userAddress) : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Owner</span>
                    <span className="text-white font-mono">{formatAddress(nft.owner)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network</span>
                    <span className="text-green-400">Mantle Sepolia</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-3">
                    <span className="text-gray-400">Total Price</span>
                    <span className="text-green-400 font-bold">{nft.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-950/20 border border-yellow-900/50 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-yellow-300 text-xs">
                    <p className="font-medium mb-1">Demo Mode</p>
                    <p>This is a demonstration. The transaction will send MNT to the current owner but won't transfer NFT ownership (requires marketplace contract).</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBuyNFT}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Buy Now for {nft.price}
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
              <h4 className="text-lg font-medium text-white mb-2">Processing Transaction</h4>
              <p className="text-gray-400 text-sm">
                Please confirm the transaction in your wallet and wait for confirmation...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Purchase Successful!</h4>
              <p className="text-gray-400 text-sm mb-6">
                Your transaction has been confirmed on the blockchain
              </p>
              {transactionHash && (
                <div className="mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://explorer.sepolia.mantle.xyz/tx/${transactionHash}`, '_blank')}
                    className="text-green-400 border-green-400 hover:bg-green-950/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </Button>
                </div>
              )}
              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Transaction Failed</h4>
              <p className="text-gray-400 text-sm mb-6">
                {error || 'Something went wrong with your purchase'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('confirm')}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}