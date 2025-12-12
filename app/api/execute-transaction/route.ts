import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// Story Protocol Aeneid Testnet Configuration
const aeneidChain = {
  id: 1513,
  name: 'Story Protocol Aeneid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL_AENEID || 'https://rpc.aeneid.testnet.story.foundation'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://aeneid.testnet.story.foundation',
    },
  },
  testnet: true,
} as const

/**
 * Execute Blockchain Transaction Endpoint
 *
 * This endpoint takes PREPARED transactions from other endpoints
 * and actually executes them on the blockchain using the server's private key.
 *
 * This is what makes the blockchain functionality REAL vs MOCK.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, data, value, gasLimit } = body

    // Validate required fields
    if (!to || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: to, data' },
        { status: 400 }
      )
    }

    // Validate private key configuration
    const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY
    if (!privateKey || privateKey === 'your_private_key_here_replace_this') {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'STORY_PROTOCOL_PRIVATE_KEY not configured. Please add your private key to the .env file.',
          setup: 'See REAL_BLOCKCHAIN_IMPLEMENTATION_PLAN.md for setup instructions'
        },
        { status: 500 }
      )
    }

    // Create wallet from private key
    const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}` as `0x${string}`)

    // Create blockchain clients
    const publicClient = createPublicClient({
      chain: aeneidChain,
      transport: http(),
    })

    const walletClient = createWalletClient({
      account,
      chain: aeneidChain,
      transport: http(),
    })

    console.log('📝 Executing blockchain transaction...')
    console.log('  From:', account.address)
    console.log('  To:', to)
    console.log('  Data:', data.slice(0, 66) + '...')
    console.log('  Value:', value || '0')

    // Check wallet balance
    const balance = await publicClient.getBalance({ address: account.address })
    console.log('  Wallet Balance:', balance.toString(), 'wei')

    if (balance === 0n) {
      return NextResponse.json(
        {
          error: 'Insufficient funds',
          message: `Wallet ${account.address} has no IP tokens. Please fund it from the faucet.`,
          faucet: 'https://faucet.story.foundation/',
          walletAddress: account.address
        },
        { status: 402 }
      )
    }

    // Execute the transaction on blockchain
    const hash = await walletClient.sendTransaction({
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: value ? parseEther(value.toString()) : 0n,
      gas: gasLimit ? BigInt(gasLimit) : undefined,
    })

    console.log('✅ Transaction submitted to blockchain:', hash)

    // Wait for blockchain confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    })

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)
    console.log('   Gas used:', receipt.gasUsed.toString())
    console.log('   Status:', receipt.status)

    const explorerUrl = `${aeneidChain.blockExplorers.default.url}/tx/${hash}`

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
      explorerUrl,
      message: 'Transaction successfully executed on Story Protocol blockchain'
    })

  } catch (error: any) {
    console.error('❌ Transaction execution failed:', error)

    let errorMessage = 'Transaction execution failed'
    let statusCode = 500

    // Handle specific blockchain errors
    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in wallet. Please fund: ' + process.env.MINTING_WALLET_ADDRESS
      statusCode = 402
    } else if (error.message?.includes('nonce')) {
      errorMessage = 'Transaction nonce error. Please try again.'
      statusCode = 409
    } else if (error.message?.includes('gas')) {
      errorMessage = 'Gas estimation failed. The network may be congested.'
      statusCode = 503
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.shortMessage || error.message,
        code: error.code
      },
      { status: statusCode }
    )
  }
}

/**
 * GET endpoint - Check configuration status
 */
export async function GET() {
  const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY
  const configured = !!(privateKey && privateKey !== 'your_private_key_here_replace_this')

  let walletAddress = 'Not configured'
  let canExecute = false

  if (configured) {
    try {
      const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}` as `0x${string}`)
      walletAddress = account.address
      canExecute = true
    } catch {
      walletAddress = 'Invalid private key format'
      canExecute = false
    }
  }

  return NextResponse.json({
    endpoint: 'execute-transaction',
    status: canExecute ? 'active' : 'not configured',
    description: 'Executes prepared blockchain transactions using server wallet',

    configuration: {
      privateKeyConfigured: configured,
      walletAddress,
      canExecute,
      network: process.env.NEXT_PUBLIC_STORY_NETWORK || 'aeneid',
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_AENEID,
      explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL
    },

    usage: {
      method: 'POST',
      requiredFields: ['to', 'data'],
      optionalFields: ['value', 'gasLimit'],
      exampleRequest: {
        to: '0x742d35Cc6634C0532925a3b8D4C9db96590e4265',
        data: '0x...',
        value: '0',
        gasLimit: '800000'
      }
    },

    setup: canExecute ? null : {
      message: 'Add STORY_PROTOCOL_PRIVATE_KEY to .env file',
      documentation: 'See REAL_BLOCKCHAIN_IMPLEMENTATION_PLAN.md',
      faucet: 'https://faucet.story.foundation/'
    }
  })
}
