"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletConnectionProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  className?: string
  showBalance?: boolean
  showNetworkWarning?: boolean
}

export function WalletConnection({ 
  onConnect, 
  onDisconnect, 
  className = "",
  showBalance = true,
  showNetworkWarning = true
}: WalletConnectionProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Story Protocol Testnet configuration
  const STORY_PROTOCOL_TESTNET = {
    id: 1315, // Correct chain ID from RPC
    name: 'Story Protocol Testnet',
    rpcUrl: 'https://aeneid.storyrpc.io',
  }
  
  // Derived state
  const isCorrectNetwork = chainId === STORY_PROTOCOL_TESTNET.id

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          
          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setChainId(parseInt(chainId, 16))

          // Get balance (with error handling for RPC issues)
          let balance = '0'
          try {
            balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            })
          } catch (balanceError) {
            console.warn('Could not fetch balance:', balanceError)
            // Continue without balance - not critical
          }
          const balanceInEther = parseInt(balance, 16) / Math.pow(10, 18)
          setBalance(balanceInEther.toFixed(4))
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err)
      }
    }
  }

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0]
          setAddress(walletAddress)
          setIsConnected(true)
          setShowWalletModal(false)

          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setChainId(parseInt(chainId, 16))

          // Get balance (with error handling for RPC issues)
          try {
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [walletAddress, 'latest']
            })
            const balanceInEther = parseInt(balance, 16) / Math.pow(10, 18)
            setBalance(balanceInEther.toFixed(4))
          } catch (balanceError) {
            console.warn('Could not fetch balance:', balanceError)
            // Continue without balance - not critical
          }

          // Call onConnect callback with the wallet address
          onConnect?.(walletAddress)
        } else {
          setError('wallet must has at least one account')
        }
      } else {
        setError('No Web3 wallet detected. Please install MetaMask.')
      }
    } catch (err: any) {
      console.error('Connection failed:', err)
      if (err.code === 4001) {
        setError('Connection request was rejected')
      } else {
        setError('Failed to connect wallet')
      }
    }
  }

  // Handle wallet disconnection
  const handleDisconnect = () => {
    try {
      onDisconnect?.()
      setError(null)
    } catch (err) {
      console.error('Disconnection failed:', err)
    }
  }

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${STORY_PROTOCOL_TESTNET.id.toString(16)}` }],
        })
        setChainId(STORY_PROTOCOL_TESTNET.id)
      }
    } catch (err: any) {
      if (err.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${STORY_PROTOCOL_TESTNET.id.toString(16)}`,
              chainName: 'Story Protocol Aeneid Testnet',
              nativeCurrency: {
                name: 'IP',
                symbol: 'IP',
                decimals: 18,
              },
              rpcUrls: [
                'https://aeneid.storyrpc.io',
                'https://testnet.storyrpc.io'
              ],
              blockExplorerUrls: ['https://aeneid.storyscan.io'],
            }],
          })
          setChainId(STORY_PROTOCOL_TESTNET.id)
        } catch (addError) {
          setError('Failed to add Story Protocol network')
        }
      } else {
        setError('Failed to switch network')
      }
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get network name
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 1315:
      case 1513:
        return 'Story Protocol Testnet'
      case 1:
        return 'Ethereum Mainnet'
      case 11155111:
        return 'Sepolia Testnet'
      case 137:
        return 'Polygon'
      default:
        return `Chain ${chainId}`
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {isConnected && showNetworkWarning && !isCorrectNetwork && (
        <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-yellow-400 font-medium">Wrong Network</h4>
              <p className="text-yellow-300 text-sm mt-1">
                Please switch to Story Protocol network to continue
              </p>
              <p className="text-yellow-500 text-xs mt-1">
                Current: {chainId ? getNetworkName(chainId) : 'Unknown'}
              </p>
            </div>
            <Button
              onClick={handleSwitchNetwork}
              className="bg-yellow-600 hover:bg-yellow-700 text-black text-sm"
            >
              Switch Network
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected ? (
        <div className="text-center">
          <Button
            onClick={() => setShowWalletModal(true)}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium px-6 py-3 shadow-lg shadow-green-500/30"
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="bg-black border border-green-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
              <p className="text-white font-mono text-sm mt-1">
                {formatAddress(address!)}
              </p>
              {showBalance && balance && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-gray-300 text-xs">
                    Balance: {balance} IP
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={handleDisconnect}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-2"
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-green-900/30 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-3 p-4 border border-green-900/30 hover:border-green-600/50 text-white hover:bg-green-950/20 rounded-lg transition duration-300"
              >
                <span className="text-2xl">🦊</span>
                <div className="text-left">
                  <p className="font-medium">MetaMask</p>
                </div>
                <div className="ml-auto text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
              <h4 className="text-blue-400 font-medium text-sm mb-2">Why connect a wallet?</h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Sign transactions securely without exposing private keys</li>
                <li>• Mint NFTs on Story Protocol blockchain</li>
                <li>• Manage your dance NFT collection</li>
                <li>• Earn royalties from your creative work</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}