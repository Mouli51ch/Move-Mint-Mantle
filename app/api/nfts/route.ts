import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const MANTLE_RPC_URL = 'https://rpc.sepolia.mantle.xyz'
const CONTRACT_ADDRESS = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073'

// MoveMint ABI for NFT functions
const MOVEMINT_ABI = [
  'function getTotalMinted() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getDanceMetadata(uint256 tokenId) view returns (tuple(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash, address creator, uint256 mintedAt))',
  'function getCreatorTokens(address creator) view returns (uint256[])'
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MOVEMINT_ABI, provider)
    
    if (tokenId) {
      // Get specific NFT data
      try {
        console.log(`Fetching specific NFT ${tokenId}...`)
        
        // First check if the token exists by trying to get its owner
        const owner = await contract.ownerOf(tokenId)
        
        // If we get here, the token exists, so fetch its metadata and tokenURI
        const [metadata, tokenURI] = await Promise.all([
          contract.getDanceMetadata(tokenId),
          contract.tokenURI(tokenId).catch(() => '')
        ])
        
        console.log(`Successfully fetched NFT ${tokenId}`)
        
        return NextResponse.json({
          success: true,
          data: {
            tokenId: parseInt(tokenId),
            title: metadata.title,
            danceStyle: metadata.danceStyle,
            choreographer: metadata.choreographer,
            duration: Number(metadata.duration),
            ipfsMetadataHash: metadata.ipfsMetadataHash,
            creator: metadata.creator,
            mintedAt: Number(metadata.mintedAt),
            owner,
            tokenURI
          }
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorString = errorMessage.toString()
        console.error(`Error fetching NFT ${tokenId}:`, errorMessage)
        
        if (errorString.includes('Token does not exist') || 
            errorString.includes('ERC721: invalid token ID') ||
            errorString.includes('execution reverted') ||
            errorString.includes('unknown custom error')) {
          return NextResponse.json({
            success: false,
            error: `NFT #${tokenId} does not exist`
          })
        } else {
          return NextResponse.json({
            success: false,
            error: `Error fetching NFT #${tokenId}: ${errorString}`
          })
        }
      }
    } else {
      // Get all NFTs
      try {
        const totalSupply = await contract.getTotalMinted()
        const nfts = []
        
        console.log(`Total supply: ${totalSupply}`)
        
        // Instead of assuming sequential token IDs, let's check which ones actually exist
        // We'll try to fetch each token ID and skip the ones that don't exist
        const maxTokensToCheck = Math.min(Number(totalSupply) + 5, 50) // Check a few extra in case of gaps, but cap at 50
        
        for (let i = 1; i <= maxTokensToCheck; i++) {
          try {
            console.log(`Checking if NFT ${i} exists...`)
            
            // First check if the token exists by trying to get its owner
            const owner = await contract.ownerOf(i)
            
            // If we get here, the token exists, so fetch its metadata
            const metadata = await contract.getDanceMetadata(i)
            
            nfts.push({
              tokenId: i,
              title: metadata.title,
              danceStyle: metadata.danceStyle,
              choreographer: metadata.choreographer,
              duration: Number(metadata.duration),
              ipfsMetadataHash: metadata.ipfsMetadataHash,
              creator: metadata.creator,
              mintedAt: Number(metadata.mintedAt),
              owner
            })
            console.log(`Successfully fetched NFT ${i}`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            const errorString = errorMessage.toString()
            
            if (errorString.includes('Token does not exist') || 
                errorString.includes('ERC721: invalid token ID') ||
                errorString.includes('execution reverted') ||
                errorString.includes('unknown custom error')) {
              console.log(`NFT ${i} does not exist, skipping...`)
              // This is expected for non-existent tokens, just skip silently
            } else {
              console.error(`Unexpected error fetching NFT ${i}:`, errorMessage)
            }
          }
          
          // Stop if we've found enough NFTs and haven't found any in the last few attempts
          if (nfts.length >= Number(totalSupply) && i > Number(totalSupply)) {
            break
          }
        }
        
        console.log(`Successfully fetched ${nfts.length} NFTs (total supply reported: ${totalSupply})`)
        
        return NextResponse.json({
          success: true,
          data: nfts,
          totalSupply: Number(totalSupply),
          actualCount: nfts.length
        })
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        return NextResponse.json({
          success: false,
          error: 'Error fetching NFT data from contract'
        })
      }
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}