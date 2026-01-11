import { NextRequest, NextResponse } from 'next/server'
import { cashflowProtocolService } from '@/lib/services/cashflow-protocol'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const streamId = searchParams.get('streamId')
    const period = searchParams.get('period')
    const address = searchParams.get('address')

    // Initialize the service
    const initialized = await cashflowProtocolService.initialize()
    if (!initialized) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize cashflow protocol service'
      })
    }

    switch (action) {
      case 'protocol-info':
        const protocolInfo = await cashflowProtocolService.getProtocolInfo()
        return NextResponse.json({
          success: true,
          data: protocolInfo
        })

      case 'supported-platforms':
        const platforms = await cashflowProtocolService.getSupportedPlatforms()
        return NextResponse.json({
          success: true,
          data: platforms
        })

      case 'stream-info':
        if (!streamId) {
          return NextResponse.json({
            success: false,
            error: 'Stream ID is required'
          })
        }
        
        const streamInfo = await cashflowProtocolService.getStreamInfo(parseInt(streamId))
        return NextResponse.json({
          success: true,
          data: streamInfo
        })

      case 'creator-streams':
        if (!address) {
          return NextResponse.json({
            success: false,
            error: 'Address is required'
          })
        }
        
        const creatorStreams = await cashflowProtocolService.getCreatorStreams(address)
        return NextResponse.json({
          success: true,
          data: creatorStreams
        })

      case 'verified-revenue':
        if (!streamId || !period) {
          return NextResponse.json({
            success: false,
            error: 'Stream ID and period are required'
          })
        }
        
        const verifiedRevenue = await cashflowProtocolService.getVerifiedRevenue(
          parseInt(streamId), 
          parseInt(period)
        )
        return NextResponse.json({
          success: true,
          data: verifiedRevenue
        })

      case 'distribution-calculation':
        if (!streamId || !period) {
          return NextResponse.json({
            success: false,
            error: 'Stream ID and period are required'
          })
        }
        
        const calculation = await cashflowProtocolService.calculateDistribution(
          parseInt(streamId), 
          parseInt(period)
        )
        return NextResponse.json({
          success: true,
          data: calculation
        })

      case 'distribution-due':
        if (!streamId || !period) {
          return NextResponse.json({
            success: false,
            error: 'Stream ID and period are required'
          })
        }
        
        const isDue = await cashflowProtocolService.isDistributionDue(
          parseInt(streamId), 
          parseInt(period)
        )
        return NextResponse.json({
          success: true,
          data: { isDue }
        })

      case 'wallet-status':
        const walletStatus = await cashflowProtocolService.checkWalletConnection()
        return NextResponse.json({
          success: true,
          data: walletStatus
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        })
    }
  } catch (error) {
    console.error('Cashflow API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    // Initialize the service
    const initialized = await cashflowProtocolService.initialize()
    if (!initialized) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize cashflow protocol service'
      })
    }

    switch (action) {
      case 'register-stream':
        const { title, projectedMonthlyRevenue, durationMonths } = body
        
        if (!title || !projectedMonthlyRevenue || !durationMonths) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: title, projectedMonthlyRevenue, durationMonths'
          })
        }

        const registerResult = await cashflowProtocolService.registerStream({
          title,
          projectedMonthlyRevenue,
          durationMonths
        })

        return NextResponse.json(registerResult)

      case 'verify-revenue':
        const { streamId, period, verifiedAmount, proofHash, sourceData } = body
        
        if (!streamId || !period || !verifiedAmount || !proofHash || !sourceData) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for revenue verification'
          })
        }

        const verifyResult = await cashflowProtocolService.verifyRevenue({
          streamId,
          period,
          verifiedAmount,
          proofHash,
          sourceData
        })

        return NextResponse.json(verifyResult)

      case 'invest-in-stream':
        const { streamId: investStreamId, amount } = body
        
        if (!investStreamId || !amount) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: streamId, amount'
          })
        }

        const investResult = await cashflowProtocolService.investInStream({
          streamId: investStreamId,
          amount
        })

        return NextResponse.json(investResult)

      case 'execute-distribution':
        const { streamId: distStreamId, period: distPeriod, tokenAddress, creatorAddress } = body
        
        if (!distStreamId || !distPeriod || !tokenAddress || !creatorAddress) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for distribution execution'
          })
        }

        const executeResult = await cashflowProtocolService.executeDistribution({
          streamId: distStreamId,
          period: distPeriod,
          tokenAddress,
          creatorAddress
        })

        return NextResponse.json(executeResult)

      case 'claim-dividends':
        const { tokenAddress: claimTokenAddress } = body
        
        if (!claimTokenAddress) {
          return NextResponse.json({
            success: false,
            error: 'Token address is required'
          })
        }

        const claimResult = await cashflowProtocolService.claimDividends(claimTokenAddress)
        return NextResponse.json(claimResult)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        })
    }
  } catch (error) {
    console.error('Cashflow API POST Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}