import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const MANTLE_RPC_URL = 'https://rpc.sepolia.mantle.xyz'
const CONTRACT_ADDRESS = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073'

const MOVEMINT_ABI = [
  'function getTotalMinted() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
]

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Testing contract connection...')
    
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MOVEMINT_ABI, provider)
    
    // Test basic connectivity
    const latestBlock = await provider.getBlockNumber()
    console.log('Latest block:', latestBlock)
    
    // Test contract calls
    const totalMinted = await contract.getTotalMinted()
    const name = await contract.name()
    const symbol = await contract.symbol()
    
    console.log('Contract data:', { totalMinted: totalMinted.toString(), name, symbol })
    
    // Check a few recent blocks manually
    const recentBlocks = []
    for (let i = 0; i < 5; i++) {
      const blockNum = latestBlock - i
      const block = await provider.getBlock(blockNum, true)
      
      const blockInfo = {
        number: blockNum,
        timestamp: block?.timestamp,
        txCount: block?.transactions?.length || 0,
        transactions: []
      }
      
      if (block?.transactions) {
        for (const txHash of block.transactions.slice(0, 3)) { // Just first 3 txs
          if (typeof txHash === 'string') {
            const tx = await provider.getTransaction(txHash)
            if (tx) {
              blockInfo.transactions.push({
                hash: tx.hash,
                to: tx.to,
                from: tx.from,
                isToContract: tx.to?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
              })
            }
          }
        }
      }
      
      recentBlocks.push(blockInfo)
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        contractAddress: CONTRACT_ADDRESS,
        latestBlock,
        contractData: {
          totalMinted: totalMinted.toString(),
          name,
          symbol
        },
        recentBlocks
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}