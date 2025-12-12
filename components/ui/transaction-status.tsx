"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TransactionStatus as TxStatus } from "@/lib/wallet/types"
import { useWallet } from "@/hooks/use-wallet"

interface TransactionStatusProps {
  txHash: string | null
  onComplete?: (status: TxStatus) => void
  onError?: (error: string) => void
  className?: string
  autoRefresh?: boolean
  requiredConfirmations?: number
}

export function TransactionStatus({ 
  txHash, 
  onComplete, 
  onError,
  className = "",
  autoRefresh = true,
  requiredConfirmations = 1
}: TransactionStatusProps) {
  const { getTransactionStatus, waitForTransaction } = useWallet()
  const [status, setStatus] = useState<TxStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-refresh transaction status
  useEffect(() => {
    if (!txHash || !autoRefresh) return

    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const txStatus = await getTransactionStatus(txHash)
        setStatus(txStatus)

        // Check if transaction is complete
        if (txStatus.status === 'confirmed' && txStatus.confirmations >= requiredConfirmations) {
          onComplete?.(txStatus)
          clearInterval(intervalId)
        } else if (txStatus.status === 'failed') {
          onError?.('Transaction failed')
          clearInterval(intervalId)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check transaction status'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    // Initial check
    checkStatus()

    // Set up polling for pending transactions
    if (status?.status === 'pending' || !status) {
      intervalId = setInterval(checkStatus, 3000) // Check every 3 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [txHash, autoRefresh, requiredConfirmations, status?.status, getTransactionStatus, onComplete, onError])

  // Manual refresh
  const handleRefresh = async () => {
    if (!txHash) return

    try {
      setLoading(true)
      setError(null)
      
      const txStatus = await getTransactionStatus(txHash)
      setStatus(txStatus)

      if (txStatus.status === 'confirmed' && txStatus.confirmations >= requiredConfirmations) {
        onComplete?.(txStatus)
      } else if (txStatus.status === 'failed') {
        onError?.('Transaction failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check transaction status'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Wait for confirmation
  const handleWaitForConfirmation = async () => {
    if (!txHash) return

    try {
      setLoading(true)
      setError(null)
      
      const txStatus = await waitForTransaction(txHash, requiredConfirmations)
      setStatus(txStatus)
      onComplete?.(txStatus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction confirmation failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Get status color
  const getStatusColor = (txStatus: string) => {
    switch (txStatus) {
      case 'pending':
        return 'text-yellow-400'
      case 'confirmed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  // Get status icon
  const getStatusIcon = (txStatus: string) => {
    switch (txStatus) {
      case 'pending':
        return (
          <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
        )
      case 'confirmed':
        return (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
        )
    }
  }

  // Format transaction hash
  const formatTxHash = (hash: string): string => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  if (!txHash) {
    return null
  }

  return (
    <div className={`bg-black border border-green-900/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Transaction Status</h3>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-1"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-950/30 border border-red-900/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Transaction Hash */}
      <div className="mb-4">
        <p className="text-gray-400 text-xs mb-1">Transaction Hash</p>
        <div className="flex items-center gap-2">
          <p className="text-white font-mono text-sm">{formatTxHash(txHash)}</p>
          <button
            onClick={() => navigator.clipboard.writeText(txHash)}
            className="text-green-400 hover:text-green-300 text-xs"
            title="Copy full hash"
          >
            Copy
          </button>
          <a
            href={`https://testnet.storyscan.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            View on Explorer
          </a>
        </div>
      </div>

      {/* Status Information */}
      {status ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.status)}
            <span className={`font-medium capitalize ${getStatusColor(status.status)}`}>
              {status.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Confirmations</p>
              <p className="text-white">
                {status.confirmations} / {requiredConfirmations}
              </p>
            </div>
            
            {status.blockNumber && (
              <div>
                <p className="text-gray-400">Block Number</p>
                <p className="text-white">{status.blockNumber}</p>
              </div>
            )}
            
            {status.gasUsed && (
              <div>
                <p className="text-gray-400">Gas Used</p>
                <p className="text-white">{parseInt(status.gasUsed).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Progress Bar for Confirmations */}
          {status.status === 'confirmed' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Confirmation Progress</span>
                <span>{Math.min(status.confirmations, requiredConfirmations)} / {requiredConfirmations}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((status.confirmations / requiredConfirmations) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {status.status === 'pending' && (
            <div className="mt-4">
              <Button
                onClick={handleWaitForConfirmation}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Waiting...' : `Wait for ${requiredConfirmations} Confirmation${requiredConfirmations > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}

          {status.status === 'confirmed' && status.confirmations >= requiredConfirmations && (
            <div className="mt-4 bg-green-950/20 border border-green-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 font-medium">Transaction Confirmed</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                Your transaction has been successfully confirmed on the blockchain.
              </p>
            </div>
          )}

          {status.status === 'failed' && (
            <div className="mt-4 bg-red-950/20 border border-red-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 font-medium">Transaction Failed</span>
              </div>
              <p className="text-red-300 text-sm mt-1">
                The transaction failed to execute. Please try again.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          <span>Loading transaction status...</span>
        </div>
      )}
    </div>
  )
}