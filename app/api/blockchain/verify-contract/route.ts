import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const MANTLE_RPC_URL = 'https://rpc.sepolia.mantle.xyz'
const CONTRACT_ADDRESS = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073'

export async function GET(request: NextRequest) {
  try {
    console.log('Verifying contract at:', CONTRACT_ADDRESS)
    
    const provider = new ethers.JsonRpcProvider(MANTLE_RPC_URL)
    
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS)
    console.log('Contract code length:', code.length)
    
    if (code === '0x') {
      return NextResponse.json({
        success: false,
        error: 'No contract found at this address',
        contractAddress: CONTRACT_ADDRESS,
        hasCode: false
      })
    }
    
    // Try different common NFT functions + MoveMint specific
    const testFunctions = [
      'function getTotalMinted() view returns (uint256)',
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function balanceOf(address owner) view returns (uint256)',
      'function owner() view returns (address)',
    ]
    
    const results: any = {
      contractAddress: CONTRACT_ADDRESS,
      hasCode: true,
      codeLength: code.length,
      functions: {}
    }
    
    for (const funcSig of testFunctions) {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, [funcSig], provider)
        const funcName = funcSig.split('(')[0].split(' ').pop()
        
        if (!funcName) continue
        
        if (funcName === 'balanceOf') {
          // Skip balanceOf as it requires a parameter
          results.functions[funcName] = 'requires_parameter'
          continue
        }
        
        const result = await contract[funcName]()
        results.functions[funcName] = result.toString()
        console.log(`${funcName}():`, result.toString())
      } catch (error) {
        const funcName = funcSig.split('(')[0].split(' ').pop()
        if (funcName) {
          results.functions[funcName] = 'not_available'
        }
        console.log(`Function ${funcSig} not available:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    // Get latest block for reference
    const latestBlock = await provider.getBlockNumber()
    results.latestBlock = latestBlock
    
    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Contract verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      contractAddress: CONTRACT_ADDRESS
    }, { status: 500 })
  }
}