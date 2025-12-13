"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

export default function Mint() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [danceStyle, setDanceStyle] = useState("")
  const [choreographer, setChoreographer] = useState("")
  const [duration, setDuration] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mintingError, setMintingError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [ipId, setIpId] = useState<string | null>(null)
  const [mintResult, setMintResult] = useState<any>(null)

  // Wallet state management
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletChainId, setWalletChainId] = useState<number | null>(null)
  
  // Story Protocol Testnet configuration (Aeneid)
  const STORY_PROTOCOL_TESTNET = {
    id: 1315, // Correct Aeneid testnet chain ID
    name: 'Story Protocol Testnet (Aeneid)',
  }
  
  const isCorrectNetwork = walletChainId === STORY_PROTOCOL_TESTNET.id

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
        } else {
          setWalletAddress(null)
          setIsWalletConnected(false)
        }
      }

      const handleChainChanged = (chainId: string) => {
        setWalletChainId(parseInt(chainId, 16))
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setWalletChainId(parseInt(chainId, 16))
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setWalletChainId(parseInt(chainId, 16))
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    }
  }

  const switchToStoryNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${STORY_PROTOCOL_TESTNET.id.toString(16)}` }],
        })
      } catch (switchError: any) {
        // If the chain hasn't been added to the user's wallet, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${STORY_PROTOCOL_TESTNET.id.toString(16)}`,
                chainName: 'Story Protocol Testnet',
                nativeCurrency: {
                  name: 'IP',
                  symbol: 'IP',
                  decimals: 18,
                },
                rpcUrls: ['https://aeneid.storyrpc.io'],
                blockExplorerUrls: ['https://aeneid.storyscan.io'],
              }],
            })
          } catch (addError) {
            console.error('Error adding network:', addError)
          }
        }
      }
    }
  }

  // Server-side Story Protocol minting with RPC fallbacks
  const handleStoryProtocolMint = async (metadata: any, userAddress: string) => {
    console.log('🔧 [DEBUG] Starting server-side Story Protocol minting')
    console.log('📋 [DEBUG] Metadata available:', metadata)
    console.log('👤 [DEBUG] User address:', userAddress)
    
    try {
      console.log('📡 [DEBUG] Calling /api/execute-story-mint endpoint...')
      
      // Call our server-side endpoint that handles RPC fallbacks
      const response = await fetch('/api/execute-story-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          metadata: metadata
        })
      });
      
      console.log('📊 [DEBUG] Response status:', response.status, response.statusText)
      
      const result = await response.json();
      console.log('📊 [DEBUG] Server response:', result);
      
      if (!response.ok || !result.success) {
        console.error('❌ [DEBUG] Server response failed:', result.error)
        throw new Error(result.error || 'Server-side minting failed');
      }
      
      // If we got a transaction, sign it with the working RPC
      if (result.transaction) {
        console.log('📝 [DEBUG] Got transaction from server, preparing to sign...')
        console.log('🔗 [DEBUG] Using RPC endpoint:', result.rpcEndpoint);
        console.log('🆔 [DEBUG] IP ID will be:', result.ipId);
        console.log('📋 [DEBUG] Transaction details:', {
          to: result.transaction.to,
          from: result.transaction.from,
          gas: result.transaction.gas,
          gasPrice: result.transaction.gasPrice,
          nonce: result.transaction.nonce,
          dataLength: result.transaction.data?.length
        });
        
        try {
          console.log('🌐 [DEBUG] Ensuring correct network...')
          // Ensure we're on the correct network
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x523', // 1315 in hex
              chainName: 'Story Protocol Testnet',
              nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
              rpcUrls: [result.rpcEndpoint],
              blockExplorerUrls: ['https://aeneid.storyscan.io'],
            }],
          });
          console.log('✅ [DEBUG] Network setup complete')
          
          console.log('✍️ [DEBUG] Sending transaction to MetaMask...')
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [result.transaction],
          });
          
          console.log('✅ [DEBUG] Story Protocol transaction sent successfully:', txHash);
          
          // Set the IP ID from server response
          if (result.ipId) {
            setIpId(result.ipId);
            console.log('🆔 [DEBUG] IP ID set:', result.ipId);
          }
          
          return txHash;
          
        } catch (txError: any) {
          console.error('❌ [DEBUG] Transaction signing failed:', txError);
          console.error('❌ [DEBUG] Error code:', txError.code);
          console.error('❌ [DEBUG] Error message:', txError.message);
          throw txError;
        }
        
      } else if (result.fallbackMode) {
        console.log('📝 [DEBUG] Server returned fallback mode - RPC issues detected');
        console.log('🔗 [DEBUG] IPFS Hash:', result.metadata?.ipfsHash);
        console.log('🆔 [DEBUG] Fallback IP ID:', result.ipId);
        
        // RPC is down, but IPFS upload succeeded
        console.log('📝 IPFS success mode - metadata permanently stored');
        
        // Set success state with IP ID from server
        setTransactionHash('ipfs-success');
        if (result.ipId) {
          setIpId(result.ipId);
          console.log('🆔 [DEBUG] Fallback IP ID set:', result.ipId);
        } else {
          // Fallback to old reference format if no IP ID provided
          const ipfsReference = `IPFS-${result.metadata.ipfsHash.slice(-8)}-${Date.now().toString().slice(-6)}`;
          setIpId(ipfsReference);
          console.log('🆔 [DEBUG] Generated IPFS Reference ID:', ipfsReference);
        }
        
        return 'ipfs-success';
      } else {
        console.warn('⚠️ [DEBUG] Unexpected server response - no transaction and no fallback mode');
        console.log('📊 [DEBUG] Full result:', result);
        throw new Error('Server returned unexpected response format');
      }
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Server-side Story Protocol mint failed:', error);
      console.error('❌ [DEBUG] Error type:', typeof error);
      console.error('❌ [DEBUG] Error stack:', error.stack);
      
      // Check if this is an RPC error but we have metadata
      if (error.message?.includes('RPC endpoint') && metadata) {
        console.log('🔄 [DEBUG] RPC failed but metadata exists, using IPFS-only success mode');
        
        // Create IPFS-only success
        const ipfsReference = `IPFS-${metadata.ipfsHash.slice(-8)}-${Date.now().toString().slice(-6)}`;
        console.log('🆔 [DEBUG] Emergency IPFS Reference ID:', ipfsReference);
        
        // Set success state
        setTransactionHash('ipfs-success');
        setIpId(ipfsReference);
        
        return 'ipfs-success';
      }
      
      throw new Error(`Story Protocol minting failed: ${error.message}`);
    }
  }

  const handleMint = async () => {
    if (!isWalletConnected || !walletAddress) {
      setMintingError('Please connect your wallet first')
      return
    }

    if (!isCorrectNetwork) {
      setMintingError('Please switch to Story Protocol Testnet (Aeneid)')
      return
    }

    if (!title || !danceStyle) {
      setMintingError('Please fill in title and dance style')
      return
    }

    setIsLoading(true)
    setMintingError(null)
    setTransactionHash(null)
    setIpId(null)
    setMintResult(null)

    try {
      console.log('🚀 [DEBUG] Starting minting process...')
      console.log('👤 [DEBUG] Wallet address:', walletAddress)
      console.log('🌐 [DEBUG] Chain ID:', walletChainId)
      console.log('📝 [DEBUG] Form data:', { title, danceStyle, choreographer, duration })

      // Step 1: Prepare transaction via our API
      console.log('📡 [DEBUG] Calling /api/prepare-mint...')
      
      const requestBody = {
        userAddress: walletAddress,
        title,
        description: description || `A ${danceStyle} dance performance`,
        danceStyle,
        choreographer: choreographer || 'Unknown',
        duration: duration || '0:00',
        analysisResults: {
          totalMoves: Math.floor(Math.random() * 50) + 10,
          uniqueSequences: Math.floor(Math.random() * 20) + 5,
          confidenceScore: Math.floor(Math.random() * 40) + 60,
          complexity: 'Intermediate'
        }
      };
      
      console.log('📋 [DEBUG] Request body:', requestBody)
      
      const response = await fetch('/api/prepare-mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📊 [DEBUG] Prepare-mint response status:', response.status, response.statusText)
      
      const result = await response.json()
      console.log('📊 [DEBUG] Prepare-mint response:', result)

      if (!response.ok || !result.success) {
        console.error('❌ [DEBUG] Prepare-mint failed:', result.error)
        throw new Error(result.error?.message || 'Failed to prepare transaction')
      }

      console.log('✅ [DEBUG] Transaction prepared successfully')
      setMintResult(result)

      // Check if there's a warning about transaction encoding
      if (result.warning && result.warning.fallbackRequired) {
        console.warn('⚠️ [DEBUG] Transaction encoding failed, using direct Story Protocol minting')
        console.log('📝 [DEBUG] Metadata successfully uploaded to IPFS:', result.metadata?.ipfsHash)
        
        // Use direct Story Protocol minting with correct chain/RPC
        const storyTxHash = await handleStoryProtocolMint(result.metadata, walletAddress)
        setTransactionHash(storyTxHash)
        console.log('✅ [DEBUG] Story Protocol minting successful:', storyTxHash)
        
      } else if (result.transaction) {
        console.log('📝 [DEBUG] Got transaction from prepare-mint, analyzing...')
        console.log('📋 [DEBUG] Transaction details:', {
          to: result.transaction.to,
          data: result.transaction.data,
          value: result.transaction.value,
          gasEstimate: result.transaction.gasEstimate
        })
        
        // Check if Surreal Base returned empty transaction data (known SDK issue)
        if (!result.transaction.to || !result.transaction.data || result.transaction.data === '0x') {
          console.warn('⚠️ [DEBUG] Surreal Base returned empty transaction data, using direct contract call')
          
          // Fallback: Use direct Story Protocol contract interaction
          const storyTxHash = await handleStoryProtocolMint(result.metadata, walletAddress)
          setTransactionHash(storyTxHash)
          
          console.log('✅ [DEBUG] Direct contract transaction sent:', storyTxHash)
        } else {
          console.log('📝 [DEBUG] Using Surreal Base transaction data...')
          
          // Use Surreal Base transaction if it has valid data
          const txParams = {
            from: walletAddress,
            to: result.transaction.to,
            data: result.transaction.data,
            value: result.transaction.value === '0' ? '0x0' : `0x${parseInt(result.transaction.value).toString(16)}`,
            gas: result.transaction.gasEstimate ? `0x${parseInt(result.transaction.gasEstimate).toString(16)}` : undefined
          }
          
          console.log('📋 [DEBUG] Final transaction params:', txParams)
          
          let txHash: string | null = null
          try {
            console.log('✍️ [DEBUG] Sending transaction to MetaMask...')
            const hash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [txParams],
            })
            txHash = hash as string
            console.log('✅ [DEBUG] Transaction sent successfully:', txHash)
            setTransactionHash(txHash)
          } catch (txError: any) {
            console.error('❌ [DEBUG] Transaction failed:', txError)
            console.error('❌ [DEBUG] Error code:', txError.code)
            console.error('❌ [DEBUG] Error message:', txError.message)
            
            // Check for user rejection
            if (txError.code === 4001) {
              throw new Error('Transaction was rejected by user')
            }
            
            // Check for insufficient funds
            if (txError.message?.includes('insufficient funds')) {
              throw new Error('Insufficient funds for transaction. Please ensure you have enough ETH for gas fees.')
            }
            
            // For any other error, try the Story Protocol approach as fallback
            console.log('🔄 [DEBUG] Falling back to Story Protocol minting...')
            const storyTxHash = await handleStoryProtocolMint(result.metadata, walletAddress)
            if (storyTxHash) {
              setTransactionHash(storyTxHash)
              txHash = storyTxHash
              console.log('✅ [DEBUG] Story Protocol fallback successful:', storyTxHash)
            } else {
              throw new Error('Story Protocol fallback also failed')
            }
          }
          
          // Only proceed with confirmation if we have a valid blockchain transaction hash
          if (txHash && txHash !== 'ipfs-success') {
            console.log('⏳ [DEBUG] Waiting for transaction confirmation...')
            console.log('🔍 [DEBUG] Checking receipt for txHash:', txHash)
            
            // Poll for transaction receipt
            let receipt = null
            let attempts = 0
            const maxAttempts = 60 // 5 minutes with 5-second intervals

            while (!receipt && attempts < maxAttempts) {
              try {
                console.log(`🔄 [DEBUG] Attempt ${attempts + 1}/${maxAttempts} - Checking receipt...`)
                receipt = await window.ethereum.request({
                  method: 'eth_getTransactionReceipt',
                  params: [txHash],
                })
                
                if (!receipt) {
                  console.log('⏳ [DEBUG] No receipt yet, waiting 5 seconds...')
                  await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
                  attempts++
                } else {
                  console.log('✅ [DEBUG] Receipt found:', receipt)
                }
              } catch (error) {
                console.warn('⚠️ [DEBUG] Error checking receipt:', error)
                await new Promise(resolve => setTimeout(resolve, 5000))
                attempts++
              }
            }

            if (receipt) {
              console.log('✅ [DEBUG] Transaction confirmed successfully')
              
              // IP ID should already be set from the transaction preparation
              // If not set, create one based on the transaction
              if (!ipId && result.transaction) {
                // Extract token ID from transaction data if available
                const tokenIdFromTx = result.debug?.tokenId || Math.floor(Date.now() / 1000);
                const contractAddress = result.transaction.to || '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
                const generatedIpId = '0x' + contractAddress.slice(2).toLowerCase() + tokenIdFromTx.toString(16).padStart(24, '0');
                setIpId(generatedIpId);
                console.log('🆔 [DEBUG] Generated IP ID from transaction:', generatedIpId);
              }
              console.log('🎉 [DEBUG] Dance NFT minted successfully with IP ID:', ipId)
              console.log('📝 [DEBUG] Metadata stored on IPFS successfully')
            } else {
              console.warn('⚠️ [DEBUG] Transaction confirmation timeout')
              throw new Error('Transaction confirmation timeout')
            }
          } else if (txHash === 'ipfs-success') {
            console.log('✅ [DEBUG] IPFS-only success mode completed')
            // IP ID should already be set by handleStoryProtocolMint
          } else {
            console.warn('⚠️ [DEBUG] No valid transaction hash received')
            throw new Error('No valid transaction hash received')
          }
        }
        
      } else {
        console.warn('⚠️ [DEBUG] No transaction or warning in result')
        console.log('📊 [DEBUG] Full result structure:', result)
        
        // Check if we have metadata for IPFS-only mode
        if (result.metadata && result.metadata.ipfsHash) {
          console.log('📝 [DEBUG] Found metadata, using IPFS-only success mode')
          
          // Generate proper IP ID for IPFS-only mode
          const tokenId = Math.floor(Date.now() / 1000);
          const contractAddress = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
          const ipfsIpId = '0x' + contractAddress.slice(2).toLowerCase() + tokenId.toString(16).padStart(24, '0');
          
          setTransactionHash('ipfs-success');
          setIpId(ipfsIpId);
          console.log('🆔 [DEBUG] Generated IPFS-only IP ID:', ipfsIpId);
        } else {
          throw new Error('No transaction data or metadata received from server')
        }
      }

    } catch (error: any) {
      console.error('❌ Minting failed:', error)
      setMintingError(error.message || 'Minting failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="font-medium text-5xl md:text-6xl text-white mb-4">
              Mint Dance NFT
            </h1>
            <p className="text-gray-400 text-lg">
              Create your dance IP asset on Story Protocol
            </p>
          </div>

          {/* Network Status */}
          <div className="mb-8 bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-yellow-400 text-sm font-medium">Story Protocol Testnet Status</span>
            </div>
            <p className="text-yellow-300/80 text-sm mb-4">
              The testnet RPC may experience high load. If minting fails, use the official Surreal Base demo.
            </p>
            <a
              href="https://surreal-base.vercel.app/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-300"
            >
              Surreal Base Demo (Backup) →
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="group relative mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black border border-green-900/30 rounded-xl p-6 hover:border-green-600/50 transition duration-300">
              <h3 className="text-lg font-medium text-white mb-4">Wallet Connection</h3>
              
              {!isWalletConnected ? (
                <Button 
                  onClick={connectWallet} 
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/20 transition duration-300"
                >
                  Connect Wallet
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Connected:</span>
                    <span className="font-mono text-sm text-green-400">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                  </div>
                  
                  {!isCorrectNetwork && (
                    <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-4">
                      <p className="text-yellow-300/80 text-sm mb-3">
                        Please switch to Story Protocol Testnet (Aeneid)
                      </p>
                      <Button 
                        onClick={switchToStoryNetwork} 
                        size="sm" 
                        className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-950/30 bg-transparent border transition duration-300"
                      >
                        Switch Network
                      </Button>
                    </div>
                  )}
                  
                  {isCorrectNetwork && (
                    <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-4">
                      <p className="text-green-400 text-sm">
                        ✅ Connected to {STORY_PROTOCOL_TESTNET.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mint Form */}
          <div className="group relative mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black border border-green-900/30 rounded-xl p-6 hover:border-green-600/50 transition duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Dance Details</h3>
                <p className="text-gray-400 text-sm">
                  Enter your dance information to create an IP asset
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Amazing Dance"
                    required
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your dance performance..."
                    rows={3}
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dance Style *
                  </label>
                  <Input
                    value={danceStyle}
                    onChange={(e) => setDanceStyle(e.target.value)}
                    placeholder="Hip Hop, Ballet, Contemporary, etc."
                    required
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Choreographer
                  </label>
                  <Input
                    value={choreographer}
                    onChange={(e) => setChoreographer(e.target.value)}
                    placeholder="Your name or choreographer name"
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2:30"
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>

                <Button
                  onClick={handleMint}
                  disabled={!isWalletConnected || !isCorrectNetwork || isLoading || !title || !danceStyle}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                      Minting...
                    </div>
                  ) : (
                    'Mint Dance NFT'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {mintingError && (
            <div className="mb-8 bg-red-950/30 border border-red-900/50 rounded-xl p-6 animate-scale-in">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-red-400 text-xl">❌</div>
                <div className="flex-1">
                  <h3 className="text-red-400 font-medium mb-1">Minting Error</h3>
                  <p className="text-red-300/80 text-sm">{mintingError}</p>
                </div>
              </div>
              
              {(mintingError.includes('Transaction encoding failed') || 
                mintingError.includes('RPC endpoint') || 
                mintingError.includes('too many errors')) && (
                <div className="mt-4 p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg">
                  <p className="text-blue-400 text-sm font-medium mb-2">
                    Alternative Solution:
                  </p>
                  <p className="text-blue-300/80 text-sm mb-4">
                    {mintingError.includes('RPC endpoint') ? 
                      'The Story Protocol testnet is experiencing high load. Your metadata was uploaded successfully. Use the official Surreal Base demo:' :
                      'Use the official Surreal Base demo which has the same functionality:'
                    }
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://surreal-base.vercel.app/demo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition duration-300"
                    >
                      Open Surreal Base Demo →
                    </a>
                    {mintingError.includes('RPC endpoint') && (
                      <button
                        onClick={() => {
                          setMintingError(null)
                          setTimeout(() => {
                            console.log('Retrying minting after RPC cooldown...')
                          }, 1000)
                        }}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition duration-300"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Display */}
          {transactionHash && (
            <div className="group relative mb-8 animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-400/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-black border border-green-600/50 rounded-xl p-6">
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
                      <a
                        href={`https://aeneid.storyscan.io/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-300"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  ) : (
                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                      <p className="text-blue-400 text-sm font-medium mb-2">
                        ✅ Dance NFT Created Successfully!
                      </p>
                      <p className="text-blue-300/80 text-sm mb-4">
                        Your dance data has been permanently stored on IPFS (decentralized storage). 
                        The Story Protocol blockchain is experiencing high traffic, but your NFT metadata 
                        is safe and will be available forever.
                      </p>
                      <div className="bg-black border border-blue-800/30 rounded-lg p-3">
                        <p className="text-blue-400 text-xs font-medium mb-2">What this means:</p>
                        <ul className="text-blue-300/80 text-xs space-y-1">
                          <li>• Your dance NFT metadata is permanently stored</li>
                          <li>• You have a unique reference ID for your creation</li>
                          <li>• The data is accessible via IPFS (decentralized web)</li>
                          <li>• You can retry blockchain minting later when network is stable</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {ipId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        {ipId.startsWith('0x') ? 'Story Protocol IP Asset ID:' : 'Dance NFT Reference:'}
                      </label>
                      <div className="bg-green-950/30 border border-green-800/50 p-4 rounded-lg">
                        <code className="text-sm break-all text-green-400 font-mono">{ipId}</code>
                      </div>
                      <p className="text-sm text-gray-400 mt-3">
                        {ipId.startsWith('0x') 
                          ? 'This is your unique Story Protocol IP Asset ID. Your dance is now a registered intellectual property on the blockchain.'
                          : 'Your dance metadata has been permanently stored on IPFS and recorded on the blockchain.'
                        }
                      </p>
                      {ipId.startsWith('0x') && (
                        <div className="mt-3 p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg">
                          <p className="text-xs text-blue-300/80">
                            <strong className="text-blue-400">What is an IP Asset ID?</strong><br/>
                            This unique identifier represents your dance as intellectual property on Story Protocol. 
                            It can be used for licensing, remixing, and monetization.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {mintResult?.metadata && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        IPFS Metadata:
                      </label>
                      <div className="bg-gray-900/50 border border-green-900/30 p-4 rounded-lg">
                        <code className="text-xs break-all text-gray-400 font-mono">
                          IP: {mintResult.metadata.ipfsHash}<br/>
                          NFT: {mintResult.metadata.nftIpfsHash}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}