import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const MANTLE_RPC_URL = 'https://rpc.sepolia.mantle.xyz'
const CONTRACT_ADDRESS = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073'

// The specific transaction hash we saw in the explorer (full hash)
const KNOWN_TX_HASH = '0xa825eb79e874cea767866ab25d0728c0beec71c85558eb0cc581bbba540bfa'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching specific known transaction...')
    
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC_URL)
    
    // Try to fetch the specific transaction we know exists
    const tx = await provider.getTransaction(KNOWN_TX_HASH)
    const receipt = await provider.getTransactionReceipt(KNOWN_TX_HASH)
    
    if (!tx || !receipt) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found',
        txHash: KNOWN_TX_HASH
      })
    }
    
    // Get block details
    const block = await provider.getBlock(tx.blockNumber!)
    
    const now = Math.floor(Date.now() / 1000)
    const txAge = now - (block?.timestamp || now)
    const timeAgo = txAge < 60 ? `${txAge}s ago` : 
                   txAge < 3600 ? `${Math.floor(txAge / 60)}m ago` : 
                   txAge < 86400 ? `${Math.floor(txAge / 3600)}h ago` :
                   `${Math.floor(txAge / 86400)}d ago`
    
    const transactionData = {
      hash: tx.hash,
      status: receipt.status === 1 ? 'Success' : 'Failed',
      block: tx.blockNumber,
      timestamp: timeAgo,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value) + ' MNT',
      type: 'Mint Dance NFT',
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: tx.gasPrice?.toString(),
      blockTimestamp: block?.timestamp,
      contractAddress: CONTRACT_ADDRESS
    }
    
    return NextResponse.json({
      success: true,
      transaction: transactionData,
      blockDetails: {
        number: block?.number,
        timestamp: block?.timestamp,
        hash: block?.hash
      }
    })
  } catch (error) {
    console.error('Error fetching specific transaction:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      txHash: KNOWN_TX_HASH
    }, { status: 500 })
  }
}