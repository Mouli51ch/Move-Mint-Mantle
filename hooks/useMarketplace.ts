/**
 * Custom hook for marketplace operations
 * Handles buying, selling, and wallet interactions
 */

import { useState, useCallback } from 'react'
import { marketplaceService, BuyResult } from '@/lib/services/marketplace'

export interface MarketplaceState {
  isLoading: boolean
  error: string | null
  isWalletConnected: boolean
  isCorrectNetwork: boolean
  userAddress: string | null
}

export function useMarketplace() {
  const [state, setState] = useState<MarketplaceState>({
    isLoading: false,
    error: null,
    isWalletConnected: false,
    isCorrectNetwork: false,
    userAddress: null
  })

  /**
   * Check wallet connection status
   */
  const checkWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const walletStatus = await marketplaceService.checkWalletConnection()
      setState(prev => ({
        ...prev,
        isWalletConnected: walletStatus.connected,
        isCorrectNetwork: walletStatus.correctNetwork,
        userAddress: walletStatus.address || null,
        isLoading: false
      }))
      
      return walletStatus
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to check wallet connection',
        isLoading: false
      }))
      return { connected: false, correctNetwork: false }
    }
  }, [])

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        if (accounts && accounts.length > 0) {
          // Check wallet status after connection
          await checkWallet()
        } else {
          setState(prev => ({
            ...prev,
            error: 'No accounts found. Please unlock your wallet.',
            isLoading: false
          }))
        }
      } else {
        setState(prev => ({
          ...prev,
          error: 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.',
          isLoading: false
        }))
      }
    } catch (error: any) {
      let errorMessage = 'Failed to connect wallet'
      
      if (error.code === 4001) {
        errorMessage = 'Connection request was rejected by user'
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
    }
  }, [checkWallet])

  /**
   * Switch to Mantle network
   */
  const switchNetwork = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const success = await marketplaceService.switchToMantleNetwork()
      if (success) {
        await checkWallet()
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to switch to Mantle network',
          isLoading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to switch network',
        isLoading: false
      }))
    }
  }, [checkWallet])

  /**
   * Buy an NFT
   */
  const buyNFT = useCallback(async (tokenId: number, price: string): Promise<BuyResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await marketplaceService.buyNFT(tokenId, price)
      
      if (!result.success) {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to buy NFT',
          isLoading: false
        }))
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
      
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to buy NFT'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    checkWallet,
    connectWallet,
    switchNetwork,
    buyNFT,
    clearError
  }
}