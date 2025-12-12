import { parseEther, formatEther } from 'viem'
import { writeContract, readContract, waitForTransactionReceipt } from 'wagmi/actions'
import { wagmiConfig } from '@/lib/web3/config'

// Simple NFT Contract ABI (ERC-721 with minting)
export const NFT_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "tokenURI", "type": "string"}
    ],
    "name": "mint",
    "outputs": [{"name": "tokenId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "index", "type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract configuration
export const NFT_CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}` || '0x742d35Cc6634C0532925a3b8D4C9db96590e4265',
  abi: NFT_CONTRACT_ABI,
  chainId: 1513, // Story Protocol Testnet
} as const

export interface MintNFTParams {
  to: string
  tokenURI: string
  mintPrice?: string // in ETH
}

export interface NFTMintResult {
  transactionHash: string
  tokenId: string
  blockNumber?: number
  gasUsed?: string
}

/**
 * Mint a new NFT on Story Protocol
 */
export async function mintNFT(params: MintNFTParams): Promise<NFTMintResult> {
  try {
    const { to, tokenURI, mintPrice = '0' } = params

    // Write contract to mint NFT
    const hash = await writeContract(wagmiConfig, {
      ...NFT_CONTRACT_CONFIG,
      functionName: 'mint',
      args: [to as `0x${string}`, tokenURI],
      value: parseEther(mintPrice),
    })

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      confirmations: 1,
    })

    // Extract token ID from logs (simplified - in real implementation, parse logs properly)
    const tokenId = Math.floor(Math.random() * 10000) + 1 // Mock for now

    return {
      transactionHash: hash,
      tokenId: tokenId.toString(),
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error: any) {
    console.error('NFT minting failed:', error)
    throw new Error(`Failed to mint NFT: ${error.message}`)
  }
}

/**
 * Get NFT metadata URI
 */
export async function getNFTTokenURI(tokenId: string): Promise<string> {
  try {
    const tokenURI = await readContract(wagmiConfig, {
      ...NFT_CONTRACT_CONFIG,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    })

    return tokenURI as string
  } catch (error: any) {
    console.error('Failed to get token URI:', error)
    throw new Error(`Failed to get token URI: ${error.message}`)
  }
}

/**
 * Get user's NFT balance
 */
export async function getUserNFTBalance(address: string): Promise<number> {
  try {
    const balance = await readContract(wagmiConfig, {
      ...NFT_CONTRACT_CONFIG,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })

    return Number(balance)
  } catch (error: any) {
    console.error('Failed to get NFT balance:', error)
    throw new Error(`Failed to get NFT balance: ${error.message}`)
  }
}

/**
 * Get user's NFT token IDs
 */
export async function getUserNFTTokens(address: string): Promise<string[]> {
  try {
    const balance = await getUserNFTBalance(address)
    const tokenIds: string[] = []

    for (let i = 0; i < balance; i++) {
      const tokenId = await readContract(wagmiConfig, {
        ...NFT_CONTRACT_CONFIG,
        functionName: 'tokenOfOwnerByIndex',
        args: [address as `0x${string}`, BigInt(i)],
      })
      tokenIds.push(tokenId.toString())
    }

    return tokenIds
  } catch (error: any) {
    console.error('Failed to get user NFT tokens:', error)
    throw new Error(`Failed to get user NFT tokens: ${error.message}`)
  }
}

/**
 * Estimate gas for minting
 */
export async function estimateMintGas(params: MintNFTParams): Promise<string> {
  try {
    // This would normally use estimateGas, but for now return a reasonable estimate
    return '0.002' // 0.002 ETH
  } catch (error: any) {
    console.error('Failed to estimate gas:', error)
    return '0.005' // Fallback higher estimate
  }
}