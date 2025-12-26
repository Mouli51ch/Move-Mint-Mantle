"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestIPID() {
  const [ipId, setIpId] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testMinting = async () => {
    setIsLoading(true)
    console.log('🚀 [TEST] Starting test minting...')
    
    try {
      // Reset state
      setIpId(null)
      setTransactionHash(null)
      console.log('🔄 [TEST] State reset')
      
      // Step 1: Call prepare-mint
      console.log('📡 [TEST] Calling prepare-mint...')
      const prepareMintResponse = await fetch('/api/prepare-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
          title: 'Test Dance',
          description: 'Testing IP ID display',
          danceStyle: 'Hip Hop',
          choreographer: 'Test User',
          duration: '2:30',
          analysisResults: {
            totalMoves: 25,
            uniqueSequences: 8,
            confidenceScore: 85,
            complexity: 'Intermediate'
          }
        })
      })
      
      const result = await prepareMintResponse.json()
      console.log('📊 [TEST] Prepare-mint result:', result)
      
      if (result.success && result.warning?.fallbackRequired) {
        console.log('⚠️ [TEST] Using Mantle mint...')
        
        // Step 2: Call execute-story-mint
        const executeResponse = await fetch('/api/execute-story-mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
            metadata: result.metadata
          })
        })
        
        const executeResult = await executeResponse.json()
        console.log('📊 [TEST] Execute result:', executeResult)
        
        if (executeResult.success) {
          if (executeResult.transaction) {
            console.log('🆔 [TEST] Setting IP ID from server:', executeResult.ipId)
            setIpId(executeResult.ipId)
            setTransactionHash('test-transaction-hash')
            console.log('✅ [TEST] State should be updated')
          } else if (executeResult.fallbackMode) {
            console.log('🆔 [TEST] Setting fallback IP ID:', executeResult.ipId)
            setIpId(executeResult.ipId)
            setTransactionHash('ipfs-success')
            console.log('✅ [TEST] Fallback state should be updated')
          }
        }
      }
      
    } catch (error) {
      console.error('❌ [TEST] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  console.log('🎨 [RENDER] Current state:', { ipId, transactionHash })

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">IP ID Display Test</h1>
        
        <div className="space-y-6">
          <Button 
            onClick={testMinting}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Testing...' : 'Test IP ID Flow'}
          </Button>
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Current State:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div>Transaction Hash: {transactionHash || 'null'}</div>
              <div>IP ID: {ipId || 'null'}</div>
              <div>Should Show Success: {!!(transactionHash && ipId) ? 'true' : 'false'}</div>
            </div>
          </div>
          
          {/* Success Display - Same as main mint page */}
          {transactionHash && (
            <div className="bg-green-950/30 border border-green-600/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-green-400">
                  {transactionHash === 'ipfs-success' ? 'Dance Data Stored Successfully! 🎉' : 'Minting Successful! 🎉'}
                </h3>
              </div>

              <div className="space-y-6">
                {transactionHash !== 'ipfs-success' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Transaction Hash:
                    </label>
                    <div className="bg-gray-900/50 border border-green-900/30 p-4 rounded-lg">
                      <code className="text-sm break-all text-green-400 font-mono">{transactionHash}</code>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                    <p className="text-blue-400 text-sm font-medium mb-2">
                      ✅ Dance NFT Created Successfully!
                    </p>
                    <p className="text-blue-300/80 text-sm">
                      Your dance data has been permanently stored on IPFS.
                    </p>
                  </div>
                )}

                {ipId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      {ipId.startsWith('0x') ? 'Mantle NFT Token ID:' : 'Dance NFT Reference:'}
                    </label>
                    <div className="bg-green-950/30 border border-green-800/50 p-4 rounded-lg">
                      <code className="text-sm break-all text-green-400 font-mono">{ipId}</code>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      {ipId.startsWith('0x') 
                        ? 'This is your unique Mantle NFT token ID.'
                        : 'Your dance metadata has been permanently stored.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}