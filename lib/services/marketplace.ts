/**
 * Marketplace service for handling NFT buying/selling operations
 * Integrates with Web3 wallets and Mantle Network
 */

import { ethers } from 'ethers'
import { CONTRACTS, NETWORK_CONFIG } from '@/lib/web3/config'

// Extended ABI for marketplace functions
const MARKETPLACE_ABI = [
  // Basic NFT functions
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function approve(address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  
  // Marketplace functions (these would need to be added to the contract)
  'function listForSale(uint256 tokenId, uint256 price)',
  'function removeFromSale(uint256 tokenId)',
  'function buyNFT(uint256 tokenId) payable',
  'function getListingPrice(uint256 tokenId) view returns (uint256)',
  'function isForSale(uint256 tokenId) view returns (bool)',
  
  // Events
  'event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price)',
  'event NFTSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price)',
  'event NFTDelisted(uint256 indexed tokenId, address indexed seller)'
]

export interface ListingInfo {
  tokenId: number
  seller: string
  price: string
  isActive: boolean
  listedAt: number
}

export interface BuyResult {
  success: boolean
  transactionHash?: string
  error?: string
}

class MarketplaceService {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  /**
   * Initialize the marketplace service with Web3 provider
   */
  async initialize() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(CONTRACTS.MOVEMINT_NFT, MARKETPLACE_ABI, this.signer)
      return true
    }
    return false
  }

  /**
   * Check if user's wallet is connected and on correct network
   */
  async checkWalletConnection(): Promise<{ connected: boolean; correctNetwork: boolean; address?: string }> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return { connected: false, correctNetwork: false }
      }

      if (!this.provider) {
        const initialized = await this.initialize()
        if (!initialized) {
          return { connected: false, correctNetwork: false }
        }
      }

      // Check if wallet is connected
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        return { connected: false, correctNetwork: false }
      }

      // Check network
      const network = await this.provider!.getNetwork()
      const correctNetwork = Number(network.chainId) === NETWORK_CONFIG.MANTLE_TESTNET.chainId

      return {
        connected: true,
        correctNetwork,
        address: accounts[0]
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
      return { connected: false, correctNetwork: false }
    }
  }

  /**
   * Switch to Mantle network
   */
  async switchToMantleNetwork(): Promise<boolean> {
    try {
      if (!window.ethereum) return false

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.MANTLE_TESTNET.chainId.toString(16)}` }],
      })
      return true
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${NETWORK_CONFIG.MANTLE_TESTNET.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.MANTLE_TESTNET.name,
              nativeCurrency: NETWORK_CONFIG.MANTLE_TESTNET.currency,
              rpcUrls: [NETWORK_CONFIG.MANTLE_TESTNET.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.MANTLE_TESTNET.explorerUrl],
            }],
          })
          return true
        } catch (addError) {
          console.error('Failed to add Mantle network:', addError)
          return false
        }
      }
      console.error('Failed to switch network:', error)
      return false
    }
  }

  /**
   * Buy an NFT (simplified version for demo)
   * In a real marketplace, this would interact with a marketplace contract
   */
  async buyNFT(tokenId: number, priceInMNT: string): Promise<BuyResult> {
    try {
      // Initialize if needed
      if (!this.provider) {
        const initialized = await this.initialize()
        if (!initialized) {
          return { success: false, error: 'Failed to initialize Web3 provider' }
        }
      }

      const walletCheck = await this.checkWalletConnection()
      if (!walletCheck.connected) {
        return { success: false, error: 'Wallet not connected' }
      }

      if (!walletCheck.correctNetwork) {
        return { success: false, error: 'Please switch to Mantle Sepolia network' }
      }

      if (!this.contract || !this.signer) {
        const initialized = await this.initialize()
        if (!initialized) {
          return { success: false, error: 'Failed to initialize contract' }
        }
      }

      // Validate price
      const priceNumber = parseFloat(priceInMNT)
      if (isNaN(priceNumber) || priceNumber <= 0) {
        return { success: false, error: 'Invalid price' }
      }

      // Check if user has enough balance
      const balance = await this.provider!.getBalance(walletCheck.address!)
      const priceWei = ethers.parseEther(priceInMNT)
      
      if (balance < priceWei) {
        const balanceInMNT = ethers.formatEther(balance)
        return { 
          success: false, 
          error: `Insufficient MNT balance. You have ${parseFloat(balanceInMNT).toFixed(4)} MNT, need ${priceInMNT} MNT` 
        }
      }

      // Get current owner
      const currentOwner = await this.contract!.ownerOf(tokenId)
      
      // Check if user is trying to buy their own NFT
      if (currentOwner.toLowerCase() === walletCheck.address!.toLowerCase()) {
        return { success: false, error: 'You already own this NFT' }
      }

      // For demo, we'll show a transaction that would happen in a real marketplace
      // This sends MNT to the current owner (simulating a purchase)
      const tx = await this.signer!.sendTransaction({
        to: currentOwner,
        value: priceWei,
        data: '0x' // Empty data for simple transfer
      })

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      if (!receipt || receipt.status !== 1) {
        return { success: false, error: 'Transaction failed' }
      }

      return {
        success: true,
        transactionHash: tx.hash
      }
    } catch (error: any) {
      console.error('Error buying NFT:', error)
      
      // Handle specific error types
      if (error.code === 4001) {
        return { success: false, error: 'Transaction was rejected by user' }
      } else if (error.code === -32603) {
        return { success: false, error: 'Internal JSON-RPC error. Please try again.' }
      } else if (error.message?.includes('insufficient funds')) {
        return { success: false, error: 'Insufficient funds for transaction' }
      } else if (error.message?.includes('user rejected')) {
        return { success: false, error: 'Transaction was rejected by user' }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to buy NFT'
      }
    }
  }

  /**
   * Get NFT listing information (mock data for demo)
   */
  async getListingInfo(tokenId: number): Promise<ListingInfo | null> {
    try {
      // For demo purposes, return mock listing data
      // In a real marketplace, this would query the marketplace contract
      return {
        tokenId,
        seller: '0x1234567890123456789012345678901234567890',
        price: (Math.random() * 0.5 + 0.1).toFixed(3),
        isActive: Math.random() > 0.3,
        listedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      }
    } catch (error) {
      console.error('Error getting listing info:', error)
      return null
    }
  }

  /**
   * List an NFT for sale (placeholder for future implementation)
   */
  async listNFTForSale(tokenId: number, priceInMNT: string): Promise<BuyResult> {
    // Placeholder for future marketplace contract integration
    return {
      success: false,
      error: 'Listing functionality not yet implemented - requires marketplace contract'
    }
  }

  /**
   * Remove NFT from sale (placeholder for future implementation)
   */
  async removeNFTFromSale(tokenId: number): Promise<BuyResult> {
    // Placeholder for future marketplace contract integration
    return {
      success: false,
      error: 'Delisting functionality not yet implemented - requires marketplace contract'
    }
  }
}

export const marketplaceService = new MarketplaceService()