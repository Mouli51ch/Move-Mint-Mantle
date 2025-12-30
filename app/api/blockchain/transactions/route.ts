import { NextRequest, NextResponse } from 'next/server'

const EXPLORER_API_URL = 'https://explorer.sepolia.mantle.xyz/api'
const CONTRACT_ADDRESS = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'recent'
    const offset = type === 'all' ? '200' : '50'
    
    const explorerUrl = `${EXPLORER_API_URL}?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=${offset}&sort=desc`
    
    console.log('Fetching from explorer API:', explorerUrl)
    
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(explorerUrl, {
        headers: {
          'User-Agent': 'MoveMint-Dashboard/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      console.log('Explorer API response status:', response.status)
      
      if (!response.ok) {
        console.log(`Explorer API error: ${response.status} ${response.statusText}`)
        
        // Return empty result instead of throwing error - let frontend handle fallback
        return NextResponse.json({
          success: false,
          error: `Explorer API unavailable (${response.status})`,
          data: [],
          count: 0,
          type,
          fallbackNeeded: true
        })
      }
      
      const data = await response.json()
      console.log('Explorer API response:', { status: data.status, resultCount: data.result?.length || 0 })
      
      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        // Filter transactions based on type
        let filteredTxs = data.result
        
        if (type === 'recent') {
          // Filter last 7 days
          const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60)
          filteredTxs = data.result.filter((tx: any) => {
            const txTimestamp = parseInt(tx.timeStamp)
            return txTimestamp >= sevenDaysAgo
          })
        } else if (type === 'all') {
          // Filter last 30 days
          const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
          filteredTxs = data.result.filter((tx: any) => {
            const txTimestamp = parseInt(tx.timeStamp)
            return txTimestamp >= thirtyDaysAgo
          })
        }
        
        console.log(`Filtered ${filteredTxs.length} transactions for type: ${type}`)
        
        return NextResponse.json({
          success: true,
          data: filteredTxs,
          count: filteredTxs.length,
          type
        })
      } else {
        console.log('Explorer API returned no results or error:', data)
        return NextResponse.json({
          success: false,
          error: data.message || 'No transactions found',
          data: [],
          count: 0,
          type,
          fallbackNeeded: true
        })
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.log('Explorer API request timed out')
        return NextResponse.json({
          success: false,
          error: 'Explorer API timeout',
          data: [],
          count: 0,
          type,
          fallbackNeeded: true
        })
      }
      
      throw fetchError // Re-throw other fetch errors
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      fallbackNeeded: true
    })
  }
}