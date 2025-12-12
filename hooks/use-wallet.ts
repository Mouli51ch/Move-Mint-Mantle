"use client"

import { useState, useEffect, useCallback } from 'react'
import { walletService, WalletError } from '@/lib/wallet/wallet-service'
import { 
  WalletConnection, 
  TransactionRequest, 
  TransactionStatus,
  WalletEvent,
  STORY_PROTOCOL_CONFIG 
} from '@/lib/wallet/types'

interface UseWalletReturn {
  // Connection state
  connection: WalletConnection | null
  isConnected: boolean
  isConnecting: boolean
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchNetwork: () => Promise<void>
  
  // Transaction methods
  signTransaction: (transaction: TransactionRequest) => Promise<string>
  getTransactionStatus: (txHash: string) => Promise<TransactionStatus>
  waitForTransaction: (txHash: string, confirmations?: number) => Promise<TransactionStatus>
  
  // Utility methods
  getBalance: () => Promise<string>
  signMessage: (message: string) => Promise<string>
  
  // State
  error: string | null
  clearError: () => void
  
  // Network state
  isCorrectNetwork: boolean
  currentChainId: number | null
}

export function useWallet(): UseWalletReturn {
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)

  // Derived state
  const isConnected = connection?.isConnected || false
  const isCorrectNetwork = currentChainId === STORY_PROTOCOL_CONFIG.chainId

  // Initialize wallet state on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        // Check if already connected
        const existingConnection = walletService.getConnection()
        if (existingConnection) {
          setConnection(existingConnection)
          setCurrentChainId(existingConnection.chainId)
        }

        // Get current chain ID if wallet is available
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const chainId = await walletService.getChainId()
            setCurrentChainId(chainId)
          } catch (err) {
            // Ignore errors during initialization
          }
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err)
      }
    }

    initializeWallet()
  }, [])

  // Set up event listeners
  useEffect(() => {
    const handleAccountsChanged = (event: WalletEvent) => {
      const accounts = event.data as string[]
      if (accounts.length === 0) {
        setConnection(null)
        setError('Wallet disconnected')
      } else {
        setConnection(prev => prev ? { ...prev, address: accounts[0] } : null)
      }
    }

    const handleChainChanged = (event: WalletEvent) => {
      const chainId = event.data as number
      setCurrentChainId(chainId)
      setConnection(prev => prev ? { ...prev, chainId } : null)
    }

    const handleConnect = (event: WalletEvent) => {
      const connectionData = event.data as WalletConnection
      setConnection(connectionData)
      setCurrentChainId(connectionData.chainId)
      setError(null)
    }

    const handleDisconnect = () => {
      setConnection(null)
      setCurrentChainId(null)
      setError('Wallet disconnected')
    }

    // Add event listeners
    walletService.addEventListener('accountsChanged', handleAccountsChanged)
    walletService.addEventListener('chainChanged', handleChainChanged)
    walletService.addEventListener('connect', handleConnect)
    walletService.addEventListener('disconnect', handleDisconnect)

    // Cleanup
    return () => {
      walletService.removeEventListener('accountsChanged', handleAccountsChanged)
      walletService.removeEventListener('chainChanged', handleChainChanged)
      walletService.removeEventListener('connect', handleConnect)
      walletService.removeEventListener('disconnect', handleDisconnect)
    }
  }, [])

  // Connect wallet
  const connect = useCallback(async () => {
    if (isConnecting) return

    setIsConnecting(true)
    setError(null)

    try {
      const newConnection = await walletService.connect()
      setConnection(newConnection)
      setCurrentChainId(newConnection.chainId)
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Failed to connect wallet'
      setError(errorMessage)
      console.error('Wallet connection failed:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect()
      setConnection(null)
      setCurrentChainId(null)
      setError(null)
    } catch (err) {
      console.error('Wallet disconnection failed:', err)
    }
  }, [])

  // Switch to Story Protocol network
  const switchNetwork = useCallback(async () => {
    if (!connection) {
      setError('Wallet not connected')
      return
    }

    setError(null)

    try {
      await walletService.switchToStoryProtocol()
      setCurrentChainId(STORY_PROTOCOL_CONFIG.chainId)
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Failed to switch network'
      setError(errorMessage)
      console.error('Network switch failed:', err)
    }
  }, [connection])

  // Sign transaction
  const signTransaction = useCallback(async (transaction: TransactionRequest): Promise<string> => {
    if (!connection) {
      throw new WalletError(4100, 'Wallet not connected')
    }

    setError(null)

    try {
      return await walletService.signTransaction(transaction)
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Transaction failed'
      setError(errorMessage)
      throw err
    }
  }, [connection])

  // Get transaction status
  const getTransactionStatus = useCallback(async (txHash: string): Promise<TransactionStatus> => {
    if (!connection) {
      throw new WalletError(4100, 'Wallet not connected')
    }

    try {
      return await walletService.getTransactionStatus(txHash)
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Failed to get transaction status'
      setError(errorMessage)
      throw err
    }
  }, [connection])

  // Wait for transaction confirmation
  const waitForTransaction = useCallback(async (
    txHash: string, 
    confirmations: number = 1
  ): Promise<TransactionStatus> => {
    if (!connection) {
      throw new WalletError(4100, 'Wallet not connected')
    }

    try {
      return await walletService.waitForTransaction(txHash, confirmations)
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Transaction confirmation failed'
      setError(errorMessage)
      throw err
    }
  }, [connection])

  // Get balance
  const getBalance = useCallback(async (): Promise<string> => {
    if (!connection) {
      throw new WalletError(4100, 'Wallet not connected')
    }

    try {
      return await walletService.getBalance()
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Failed to get balance'
      setError(errorMessage)
      throw err
    }
  }, [connection])

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!connection) {
      throw new WalletError(4100, 'Wallet not connected')
    }

    setError(null)

    try {
      return await walletService.signMessage(message)
    } catch (err) {
      const errorMessage = err instanceof WalletError 
        ? err.message 
        : 'Message signing failed'
      setError(errorMessage)
      throw err
    }
  }, [connection])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Connection state
    connection,
    isConnected,
    isConnecting,
    
    // Actions
    connect,
    disconnect,
    switchNetwork,
    
    // Transaction methods
    signTransaction,
    getTransactionStatus,
    waitForTransaction,
    
    // Utility methods
    getBalance,
    signMessage,
    
    // State
    error,
    clearError,
    
    // Network state
    isCorrectNetwork,
    currentChainId
  }
}