"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { ethers } from "ethers"

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
  
  // IPFS integration state
  const [hasStoredIPFSData, setHasStoredIPFSData] = useState(false)
  const [storedIPFSData, setStoredIPFSData] = useState<any>(null)
  const [useStoredData, setUseStoredData] = useState(false)

  // Debug: Log current state on every render
  console.log('🎨 [RENDER] Mint page state:', { 
    transactionHash, 
    ipId, 
    isLoading, 
    mintingError: !!mintingError,
    shouldShowSuccess: !!transactionHash
  })

  // Wallet state management
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletChainId, setWalletChainId] = useState<number | null>(null)
  
  // Mantle Testnet configuration
  const MANTLE_TESTNET = {
    id: 5003, // Mantle Sepolia Testnet chain ID
    name: 'Mantle Sepolia Testnet',
  }
  
  const isCorrectNetwork = walletChainId === MANTLE_TESTNET.id

  // Track IP ID changes for debugging
  useEffect(() => {
    if (ipId) {
      console.log('🆔 [DEBUG] IP ID state updated:', ipId);
      // Store in sessionStorage as backup
      sessionStorage.setItem('lastMintedIpId', ipId);
    }
  }, [ipId]);

  // Track transaction hash changes
  useEffect(() => {
    if (transactionHash) {
      console.log('📝 [DEBUG] Transaction hash updated:', transactionHash);
      // Store in sessionStorage as backup
      sessionStorage.setItem('lastTransactionHash', transactionHash);
    }
  }, [transactionHash]);

  // Check wallet connection on mount and recover state if needed
  useEffect(() => {
    checkWalletConnection()
    
    // Check for stored analysis data from recent upload
    const storedRecording = sessionStorage.getItem('moveMintRecording');
    if (storedRecording) {
      try {
        const recordingData = JSON.parse(storedRecording);
        
        // Check for complete NFT metadata (works with or without IPFS)
        if (recordingData.nftMetadata) {
          console.log('🎯 [Mint] Found complete NFT metadata:', recordingData.nftMetadata);
          setStoredIPFSData(recordingData);
          setHasStoredIPFSData(true);
          
          // Automatically enable direct minting when metadata is available
          setUseStoredData(true);
          console.log('✅ [Mint] Auto-enabled direct metadata minting');
          
          // Pre-fill form with stored metadata
          if (recordingData.metadata) {
            setTitle(recordingData.metadata.title || '');
            setDescription(recordingData.metadata.description || '');
            setDanceStyle(recordingData.metadata.tags?.join(', ') || '');
          }
        } else if (recordingData.ipfsData?.metadataIpfsHash) {
          // Fallback to old IPFS-only structure
          console.log('🎯 [Mint] Found IPFS data (legacy):', recordingData.ipfsData);
          setStoredIPFSData(recordingData);
          setHasStoredIPFSData(true);
          setUseStoredData(true);
          console.log('✅ [Mint] Auto-enabled IPFS minting (legacy)');
        } else {
          console.log('ℹ️ [Mint] No metadata found, using traditional form minting');
          // Still pre-fill form with available data
          if (recordingData.metadata) {
            setTitle(recordingData.metadata.title || '');
            setDescription(recordingData.metadata.description || '');
            setDanceStyle(recordingData.metadata.tags?.join(', ') || '');
          }
        }
      } catch (error) {
        console.warn('Failed to parse stored recording data:', error);
      }
    }
    
    // Recover state from sessionStorage if available
    const savedIpId = sessionStorage.getItem('lastMintedIpId');
    const savedTxHash = sessionStorage.getItem('lastTransactionHash');
    
    if (savedIpId && savedTxHash && !ipId && !transactionHash) {
      console.log('🔄 [RECOVERY] Restoring state from session storage');
      console.log('🆔 [RECOVERY] Restored IP ID:', savedIpId);
      console.log('📝 [RECOVERY] Restored TX Hash:', savedTxHash);
      setIpId(savedIpId);
      setTransactionHash(savedTxHash);
    }

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

      window.ethereum!.on('accountsChanged', handleAccountsChanged)
      window.ethereum!.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum?.removeListener) {
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

  const switchToMantleNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${MANTLE_TESTNET.id.toString(16)}` }],
        })
      } catch (switchError: any) {
        // If the chain hasn't been added to the user's wallet, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${MANTLE_TESTNET.id.toString(16)}`,
                chainName: 'Mantle Sepolia Testnet',
                nativeCurrency: {
                  name: 'MNT',
                  symbol: 'MNT',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
                blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz'],
              }],
            })
          } catch (addError) {
            console.error('Error adding network:', addError)
          }
        }
      }
    }
  }

  // Direct Mantle NFT minting with actual contract interaction
  const handleMantleNFTMint = async (metadata: any, userAddress: string) => {
    console.log('🔧 [DEBUG] Starting Mantle NFT minting')
    console.log('📋 [DEBUG] Metadata available:', metadata)
    console.log('👤 [DEBUG] User address:', userAddress)
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install MetaMask to mint NFTs');
      }

      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      
      const contractAddress = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073';
      const contractABI = [
        "function mintDance(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash) returns (uint256)",
        "event DanceMinted(uint256 indexed tokenId, address indexed creator, string title, string danceStyle, string ipfsMetadataHash)"
      ];
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Prepare mint parameters
      const mintParams = {
        title: metadata.name || 'Dance NFT',
        danceStyle: metadata.dance_data?.style || 'Unknown',
        choreographer: metadata.dance_data?.choreographer || 'Unknown',
        duration: parseInt(metadata.dance_data?.duration?.replace(/[^\d]/g, '') || '0') || 180,
        ipfsMetadataHash: metadata.ipfsHash || `QmDefault${Date.now()}`
      };
      
      console.log('📝 [DEBUG] Calling mintDance with params:', mintParams);
      
      // Call the mintDance function
      const tx = await contract.mintDance(
        mintParams.title,
        mintParams.danceStyle,
        mintParams.choreographer,
        mintParams.duration,
        mintParams.ipfsMetadataHash
      );
      
      console.log('📤 [DEBUG] Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ [DEBUG] Transaction confirmed:', receipt);
      
      // Extract token ID from events
      let tokenId = '0';
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const iface = new ethers.Interface(contractABI);
          for (const log of receipt.logs) {
            try {
              const parsed = iface.parseLog(log);
              if (parsed && parsed.name === 'DanceMinted') {
                tokenId = parsed.args[0].toString();
                break;
              }
            } catch (e) {
              // Skip logs that don't match our interface
            }
          }
        } catch (e) {
          console.log('Could not parse logs, using fallback token ID');
          tokenId = `MANTLE-${Date.now()}`;
        }
      }
      
      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        contractAddress,
        metadata
      };
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Mantle NFT mint failed:', error);
      throw new Error(`Mantle NFT minting failed: ${error.message}`);
    }
  }

  // Direct metadata minting using stored analysis data
  const handleDirectIPFSMint = async () => {
    if (!storedIPFSData?.nftMetadata && !storedIPFSData?.ipfsData?.metadataIpfsHash) {
      setMintingError('No metadata found for minting');
      return;
    }

    setIsLoading(true);
    setMintingError(null);
    setTransactionHash(null);
    setIpId(null);

    try {
      console.log('🎯 [DirectMint] Starting direct metadata mint...');
      
      // Use complete NFT metadata if available, otherwise fall back to IPFS hash
      const useCompleteMetadata = !!storedIPFSData.nftMetadata;
      const ipfsHash = storedIPFSData.ipfsData?.metadataIpfsHash || 'local-metadata';
      
      console.log('📋 [DirectMint] Using metadata type:', useCompleteMetadata ? 'complete' : 'IPFS hash');
      console.log('📋 [DirectMint] IPFS hash:', ipfsHash);

      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      
      const contractAddress = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073';
      const contractABI = [
        "function mintDance(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash) returns (uint256)",
        "event DanceMinted(uint256 indexed tokenId, address indexed creator, string title, string danceStyle, string ipfsMetadataHash)"
      ];
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Use stored metadata for minting
      const metadata = storedIPFSData.metadata || {};
      const analysisResults = storedIPFSData.analysisResults || {};
      const nftMetadata = storedIPFSData.nftMetadata || {};
      
      const mintParams = {
        title: nftMetadata.name || metadata.title || title || 'Dance NFT',
        danceStyle: metadata.tags?.join(', ') || danceStyle || 'Contemporary',
        choreographer: metadata.choreographer || choreographer || walletAddress?.slice(0, 8) || 'Unknown',
        duration: storedIPFSData.duration || parseInt(duration?.replace(/[^\d]/g, '') || '0') || 180,
        ipfsMetadataHash: ipfsHash
      };
      
      console.log('📝 [DirectMint] Calling mintDance with params:', mintParams);
      
      // Call the mintDance function with metadata
      const tx = await contract.mintDance(
        mintParams.title,
        mintParams.danceStyle,
        mintParams.choreographer,
        mintParams.duration,
        mintParams.ipfsMetadataHash
      );
      
      console.log('📤 [DirectMint] Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ [DirectMint] Transaction confirmed:', receipt);
      
      // Extract token ID from events
      let tokenId = '0';
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const iface = new ethers.Interface(contractABI);
          for (const log of receipt.logs) {
            try {
              const parsed = iface.parseLog(log);
              if (parsed && parsed.name === 'DanceMinted') {
                tokenId = parsed.args[0].toString();
                break;
              }
            } catch (e) {
              // Skip logs that don't match our interface
            }
          }
        } catch (e) {
          console.log('Could not parse logs, using fallback token ID');
          tokenId = `MANTLE-${Date.now()}`;
        }
      }
      
      setTransactionHash(receipt.hash);
      setIpId(tokenId);
      
      console.log('🎉 [DirectMint] Direct metadata mint successful!');
      console.log('📋 [DirectMint] Token ID:', tokenId);
      console.log('📝 [DirectMint] Transaction:', receipt.hash);
      
      // Save successful mint to session storage for dashboard
      const mintResult = {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        contractAddress
      };
      
      const resultMetadata = {
        name: mintParams.title,
        description: nftMetadata.description || `AI-analyzed dance performance with ${analysisResults.detectedMovements?.length || 0} detected movements`,
        image: nftMetadata.image || '',
        animation_url: nftMetadata.animation_url || '',
        analysisData: nftMetadata.analysisData || analysisResults,
        attributes: nftMetadata.attributes || []
      };
      
      await saveMintToSession(mintResult, resultMetadata);
      
    } catch (error: any) {
      console.error('❌ [DirectMint] Direct metadata mint failed:', error);
      setMintingError(`Direct metadata minting failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to save mint to session storage
  const saveMintToSession = async (mintResult: any, metadata: any) => {
    try {
      const mintedNFT = {
        contractAddress: mintResult.contractAddress,
        tokenId: mintResult.tokenId,
        mintedAt: new Date().toISOString(),
        transactionHash: mintResult.transactionHash,
        metadata: {
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          animation_url: metadata.animation_url,
          danceStyle: metadata.danceStyle || [danceStyle || 'Contemporary'],
          difficulty: metadata.difficulty || 'Intermediate',
          choreographer: walletAddress,
          views: 0,
          analysisData: metadata.analysisData || {},
          attributes: metadata.attributes || []
        }
      };
      
      // Get existing minted NFTs from session
      const existingMints = sessionStorage.getItem('mintedNFTs');
      const mintedNFTs = existingMints ? JSON.parse(existingMints) : [];
      
      // Add new mint
      mintedNFTs.push(mintedNFT);
      
      // Save back to session
      sessionStorage.setItem('mintedNFTs', JSON.stringify(mintedNFTs));
      
      console.log('💾 [SaveMint] Saved minted NFT to session storage for dashboard');
    } catch (error) {
      console.warn('⚠️ [SaveMint] Failed to save mint to session storage:', error);
    }
  };

  const handleMint = async () => {
    if (!isWalletConnected || !walletAddress) {
      setMintingError('Please connect your wallet first')
      return
    }

    if (!isCorrectNetwork) {
      setMintingError('Please switch to Mantle Sepolia Testnet')
      return
    }

    // Check if we should use stored IPFS data
    if (hasStoredIPFSData && useStoredData && storedIPFSData?.ipfsData?.metadataIpfsHash) {
      console.log('🎯 [Mint] Using stored IPFS metadata for direct minting');
      await handleDirectIPFSMint();
      return;
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
      console.log('📡 [DEBUG] Calling /api/mint-nft...')
      
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
      
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📊 [DEBUG] Mint-nft response status:', response.status, response.statusText)
      
      const result = await response.json()
      console.log('📊 [DEBUG] Mint-nft response:', result)

      if (!response.ok || !result.success) {
        console.error('❌ [DEBUG] Mint-nft failed:', result.error)
        throw new Error(result.error?.message || 'Failed to prepare NFT metadata')
      }

      console.log('✅ [DEBUG] NFT metadata prepared successfully')
      setMintResult(result)

      // Now perform the actual Mantle contract minting
      console.log('🔗 [DEBUG] Calling Mantle contract...')
      const mintResult = await handleMantleNFTMint(result.metadata, walletAddress);
      
      if (mintResult.success) {
        setTransactionHash(mintResult.transactionHash);
        setIpId(mintResult.tokenId);
        console.log('🎉 [DEBUG] Mantle NFT minted successfully!');
        console.log('📋 [DEBUG] Token ID:', mintResult.tokenId);
        console.log('📝 [DEBUG] Transaction:', mintResult.transactionHash);
        
        // Save successful mint to session storage for dashboard
        await saveMintToSession(mintResult, result.metadata);
      } else {
        throw new Error('Contract minting failed');
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
          {/* IPFS Status Banner */}
          {hasStoredIPFSData && useStoredData && (
            <div className="mb-8 bg-gradient-to-r from-purple-950/50 to-green-950/50 border border-purple-600/30 rounded-xl p-4 animate-fade-in-down">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-green-400 rounded-full flex items-center justify-center">
                  <span className="text-black text-sm font-bold">🚀</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-purple-300 font-medium text-sm">IPFS Direct Minting Enabled</h3>
                  <p className="text-gray-400 text-xs">
                    Using your uploaded video analysis metadata for seamless NFT creation
                  </p>
                </div>
                <div className="text-green-400 text-xs font-medium">
                  READY
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="font-medium text-5xl md:text-6xl text-white mb-4">
              Mint Dance NFT
            </h1>
            <p className="text-gray-400 text-lg">
              Create your dance NFT on Mantle Network
            </p>
          </div>

          {/* Network Status */}
          <div className="mb-8 bg-blue-950/30 border border-blue-900/50 rounded-xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-blue-400 text-sm font-medium">Mantle Testnet Status</span>
            </div>
            <p className="text-blue-300/80 text-sm mb-4">
              Connected to Mantle Sepolia Testnet. Fast and low-cost NFT minting.
            </p>
            <a
              href="https://explorer.sepolia.mantle.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-300"
            >
              View on Mantle Explorer →
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
                        Please switch to Mantle Sepolia Testnet
                      </p>
                      <Button 
                        onClick={switchToMantleNetwork} 
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
                        ✅ Connected to {MANTLE_TESTNET.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metadata Status Display */}
          {hasStoredIPFSData && (
            <div className="group relative mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-400/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-black border border-purple-600/50 rounded-xl p-6 hover:border-purple-600/70 transition duration-300">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                    <h3 className="text-lg font-medium text-purple-400">
                      {storedIPFSData?.nftMetadata ? 'NFT Metadata Ready for Minting' : 'IPFS Metadata Available'}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {storedIPFSData?.nftMetadata ? 
                      'Complete NFT metadata with analysis results is ready for minting' :
                      'Your uploaded video analysis is ready for direct NFT minting'
                    }
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-950/40 border border-purple-800/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 block mb-1">Metadata Status:</span>
                        <span className="text-purple-300 font-medium">
                          {storedIPFSData?.nftMetadata ? '✅ Complete' : 'Legacy IPFS'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-1">IPFS Upload:</span>
                        <span className={`font-medium ${storedIPFSData?.ipfsData?.uploadSuccess ? 'text-green-400' : 'text-yellow-400'}`}>
                          {storedIPFSData?.ipfsData?.uploadSuccess ? '✅ Success' : 
                           storedIPFSData?.ipfsData?.uploadAttempted ? '⚠️ Failed (Local)' : '⏭️ Skipped'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-1">Analysis Results:</span>
                        <span className="text-green-400 text-xs">
                          {storedIPFSData?.analysisResults?.detectedMovements?.length || 0} movements detected
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-1">Quality Score:</span>
                        <span className="text-green-400 text-xs">
                          {storedIPFSData?.analysisResults?.qualityMetrics?.overall || 0}/100
                        </span>
                      </div>
                    </div>
                    
                    {storedIPFSData?.ipfsData?.metadataIpfsHash && (
                      <div className="mt-3 pt-3 border-t border-purple-800/30">
                        <span className="text-gray-400 block mb-1 text-xs">IPFS Hash:</span>
                        <span className="text-purple-300 font-mono text-xs break-all">
                          {storedIPFSData.ipfsData.metadataIpfsHash.slice(0, 12)}...{storedIPFSData.ipfsData.metadataIpfsHash.slice(-8)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-green-950/30 border border-green-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="useStoredData"
                      checked={useStoredData}
                      onChange={(e) => setUseStoredData(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-black border-purple-900/50 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="useStoredData" className="text-sm text-gray-300 flex-1">
                      Use stored metadata for direct minting (recommended)
                    </label>
                    {useStoredData && (
                      <span className="text-green-400 text-xs font-medium">✅ ENABLED</span>
                    )}
                  </div>
                  
                  {useStoredData && (
                    <div className="bg-green-950/40 border border-green-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-green-400 text-xl">🚀</div>
                        <div>
                          <p className="text-green-400 text-sm font-medium mb-1">
                            Direct Metadata Minting Enabled
                          </p>
                          <p className="text-green-300/80 text-xs">
                            {storedIPFSData?.nftMetadata ? 
                              'Using complete NFT metadata with analysis results. No form required!' :
                              'Using IPFS metadata hash for minting. Analysis data included.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mint Form */}
          <div className={`group relative mb-8 animate-fade-in-up transition-opacity duration-300 ${useStoredData ? 'opacity-50' : 'opacity-100'}`} style={{ animationDelay: "0.2s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black border border-green-900/30 rounded-xl p-6 hover:border-green-600/50 transition duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Dance Details {useStoredData && hasStoredIPFSData && <span className="text-gray-500 text-sm">(Optional - IPFS data will be used)</span>}
                </h3>
                <p className="text-gray-400 text-sm">
                  {useStoredData && hasStoredIPFSData ? 
                    'Form is optional when using IPFS metadata. Your stored analysis data will be used for minting.' :
                    'Enter your dance information to create an NFT on Mantle'
                  }
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
                  disabled={!isWalletConnected || !isCorrectNetwork || isLoading || (!useStoredData && (!title || !danceStyle))}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                      {useStoredData ? 'Minting with IPFS Data...' : 'Minting...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {useStoredData && hasStoredIPFSData && (
                        <span className="text-xs">🚀</span>
                      )}
                      {useStoredData && hasStoredIPFSData ? 'Mint NFT with IPFS Metadata' : 'Mint Dance NFT'}
                    </div>
                  )}
                </Button>

                {/* Clear Session Button */}
                {(transactionHash || ipId) && (
                  <Button
                    onClick={() => {
                      console.log('🧹 [CLEAR] Clearing session and starting fresh');
                      setTransactionHash(null);
                      setIpId(null);
                      setMintResult(null);
                      setMintingError(null);
                      sessionStorage.removeItem('lastMintedIpId');
                      sessionStorage.removeItem('lastTransactionHash');
                      console.log('✅ [CLEAR] Session cleared');
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white transition duration-300"
                  >
                    Clear Session & Start Fresh
                  </Button>
                )}
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
                      'The Mantle testnet is experiencing high load. Your metadata was uploaded successfully. Try again or use the demo:' :
                      'Use the demo which has the same functionality:'
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
                    {transactionHash === 'metadata-prepared' ? 'NFT Metadata Ready! 🎉' : 'Minting Successful! 🎉'}
                  </h3>
                </div>

                {/* Debug info */}
                {(() => {
                  console.log('🎨 [SUCCESS DISPLAY] Rendering with state:', { transactionHash, ipId });
                  return null;
                })()}

                <div className="space-y-6">
                  {transactionHash !== 'metadata-prepared' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Transaction Hash:
                      </label>
                      <div className="bg-gray-900/50 border border-green-900/30 p-4 rounded-lg">
                        <code className="text-sm break-all text-green-400 font-mono">{transactionHash}</code>
                      </div>
                      <a
                        href={`https://explorer.sepolia.mantle.xyz/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-300"
                      >
                        View on Mantle Explorer →
                      </a>
                    </div>
                  ) : (
                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                      <p className="text-blue-400 text-sm font-medium mb-2">
                        ✅ NFT Metadata Prepared Successfully!
                      </p>
                      <p className="text-blue-300/80 text-sm mb-4">
                        Your dance NFT metadata is ready for minting on Mantle. 
                        You can now interact with the contract to mint your NFT.
                      </p>
                      <div className="bg-black border border-blue-800/30 rounded-lg p-3">
                        <p className="text-blue-400 text-xs font-medium mb-2">Contract Details:</p>
                        <ul className="text-blue-300/80 text-xs space-y-1">
                          <li>• Contract: 0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073</li>
                          <li>• Network: Mantle Sepolia Testnet</li>
                          <li>• Function: mintDance()</li>
                          <li>• Your metadata is ready for IPFS upload</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {ipId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        {ipId.startsWith('0x') ? 'Mantle NFT Token ID:' : 'NFT Reference:'}
                      </label>
                      <div className="bg-green-950/30 border border-green-800/50 p-4 rounded-lg">
                        <code className="text-sm break-all text-green-400 font-mono">{ipId}</code>
                      </div>
                      <p className="text-sm text-gray-400 mt-3">
                        {ipId.startsWith('0x') 
                          ? 'This is your unique Mantle NFT token identifier. Your dance is now minted as an NFT on the blockchain.'
                          : 'Your dance metadata has been prepared and is ready for minting on Mantle.'
                        }
                      </p>
                      {ipId.startsWith('0x') && (
                        <div className="mt-3 p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg">
                          <p className="text-xs text-blue-300/80">
                            <strong className="text-blue-400">What is a Token ID?</strong><br/>
                            This unique identifier represents your dance NFT on the Mantle blockchain. 
                            It can be traded, transferred, and used in DeFi applications.
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