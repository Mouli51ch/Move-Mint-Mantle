import { NextRequest, NextResponse } from 'next/server'
import { blockchainDataService } from '@/lib/services/blockchain-data'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing blockchain connection...')
    
    // Test contract stats
    const stats = await blockchainDataService.getContractStats()
    console.log('Contract stats:', stats)
    
    // Test recent transactions
    const transactions = await blockchainDataService.getRecentTransactions()
    console.log('Recent transactions count:', transactions.length)
    
    // Test all transactions
    const allTransactions = await blockchainDataService.getAllTransactions()
    console.log('All transactions count:', allTransactions.length)
    
    return NextResponse.json({
      success: true,
      data: {
        contractStats: stats,
        recentTransactions: transactions,
        allTransactions: allTransactions.slice(0, 5), // Just first 5 for testing
        counts: {
          recent: transactions.length,
          all: allTransactions.length
        }
      }
    })
  } catch (error) {
    console.error('Blockchain test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}