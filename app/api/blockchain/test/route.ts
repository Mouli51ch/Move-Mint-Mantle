import { NextRequest, NextResponse } from 'next/server'

const EXPLORER_API_URL = 'https://explorer.sepolia.mantle.xyz/api'
const CONTRACT_ADDRESS = '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing direct connection to Mantle Explorer API...')
    
    const explorerUrl = `${EXPLORER_API_URL}?module=account&action=txlist&address=${CONTRACT_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
    
    console.log('Testing URL:', explorerUrl)
    
    const response = await fetch(explorerUrl, {
      headers: {
        'User-Agent': 'MoveMint-Dashboard/1.0',
      },
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: explorerUrl
      }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Response data:', data)
    
    return NextResponse.json({
      success: true,
      data: {
        status: data.status,
        message: data.message,
        resultCount: data.result?.length || 0,
        firstTx: data.result?.[0] || null
      },
      url: explorerUrl
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}