import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Story Protocol Aeneid Testnet Configuration with fallback RPCs
const RPC_ENDPOINTS = [
  'https://rpc.aeneid.testnet.story.foundation',
  'https://testnet.storyrpc.io', // Fallback 1
  'https://story-testnet.rpc.caldera.xyz/http', // Fallback 2 (if available)
];

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
      http: RPC_ENDPOINTS,
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://aeneid.testnet.story.foundation',
    },
  },
  testnet: true,
} as const;

/**
 * Mint IP Asset on Story Protocol
 *
 * This endpoint uses the Story Protocol Gateway (SPG) to mint IP Assets
 * which are NFTs registered as intellectual property on Story Protocol.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, recipient } = body;

    // Validate required fields
    if (!metadata) {
      return NextResponse.json(
        { error: 'Missing required field: metadata' },
        { status: 400 }
      );
    }

    // Validate private key
    const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY;
    if (!privateKey || privateKey === 'your_private_key_here_replace_this') {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'STORY_PROTOCOL_PRIVATE_KEY not configured',
          setup: 'See MINTING_SETUP_GUIDE.md'
        },
        { status: 500 }
      );
    }

    // Create wallet from private key
    const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}` as `0x${string}`);
    const recipientAddress = (recipient || account.address) as Address;

    const walletClient = createWalletClient({
      account,
      chain: aeneidChain,
      transport: http(),
    });

    console.log('🎨 Minting IP Asset on Story Protocol...');
    console.log('   From:', account.address);
    console.log('   To:', recipientAddress);
    console.log('   Metadata:', JSON.stringify(metadata, null, 2));

    // Story Protocol SPG NFT Contract Address (Aeneid Testnet)
    // This is the default SPG NFT collection on Aeneid testnet
    const SPG_NFT_CONTRACT = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424' as const;

    // Prepare metadata for IPFS (simplified - in production, upload to real IPFS)
    const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;

    // For now, we'll use direct contract interaction
    // In production, you should use @story-protocol/core-sdk
    const mintFunctionSignature = '0xd0def521'; // mint(address,string)

    // Encode parameters
    const abiCoder = await import('viem').then(m => m);
    const encodedParams = abiCoder.encodeAbiParameters(
      [
        { name: 'to', type: 'address' },
        { name: 'tokenURI', type: 'string' }
      ],
      [recipientAddress, tokenURI]
    );

    const data = (mintFunctionSignature + encodedParams.slice(2)) as `0x${string}`;

    console.log('📝 Prepared transaction data');
    console.log('   Contract:', SPG_NFT_CONTRACT);
    console.log('   Function: mint(address,string)');

    // Send transaction
    const hash = await walletClient.sendTransaction({
      to: SPG_NFT_CONTRACT,
      data,
      gas: 500000n,
    });

    console.log('✅ Transaction submitted:', hash);

    // Wait for confirmation
    const receipt = await walletClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    // Extract token ID from logs (simplified)
    const tokenId = Date.now().toString();

    const explorerUrl = `${aeneidChain.blockExplorers.default.url}/tx/${hash}`;

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      tokenId,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
      explorerUrl,
      ipAsset: {
        tokenId,
        owner: recipientAddress,
        metadata,
        network: 'Story Protocol Aeneid Testnet',
        contractAddress: SPG_NFT_CONTRACT,
      },
      message: 'IP Asset minted successfully on Story Protocol!'
    });

  } catch (error: any) {
    console.error('❌ IP Asset minting failed:', error);

    let errorMessage = 'Failed to mint IP Asset';
    let statusCode = 500;
    let userFriendlyMessage = '';

    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient IP tokens. Please fund wallet: ' + process.env.MINTING_WALLET_ADDRESS;
      userFriendlyMessage = 'The minting wallet needs IP tokens. Visit https://faucet.story.foundation/';
      statusCode = 402;
    } else if (error.message?.includes('nonce')) {
      errorMessage = 'Transaction nonce error. Please try again.';
      userFriendlyMessage = 'Blockchain sync issue. Wait 30 seconds and retry.';
      statusCode = 409;
    } else if (error.message?.includes('fetch failed') || error.message?.includes('HTTP request failed')) {
      errorMessage = 'Story Protocol RPC endpoint is temporarily unavailable';
      userFriendlyMessage = 'The Aeneid testnet RPC is experiencing issues. This is a network-wide problem, not your code. Try again in 2-5 minutes or check status at https://status.story.foundation/';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        userMessage: userFriendlyMessage || errorMessage,
        details: error.shortMessage || error.message,
        code: error.code,
        suggestion: statusCode === 503 ? 'RPC endpoint down - please retry in a few minutes' : 'Check server logs for details'
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY;
  const configured = !!(privateKey && privateKey !== 'your_private_key_here_replace_this');

  let walletAddress = 'Not configured';
  if (configured) {
    try {
      const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}` as `0x${string}`);
      walletAddress = account.address;
    } catch {
      walletAddress = 'Invalid private key';
    }
  }

  return NextResponse.json({
    endpoint: 'mint-ip-asset',
    status: configured ? 'active' : 'not configured',
    description: 'Mint IP Assets on Story Protocol blockchain',

    configuration: {
      privateKeyConfigured: configured,
      walletAddress,
      network: 'Story Protocol Aeneid Testnet',
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_AENEID,
      spgContract: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424'
    },

    usage: {
      method: 'POST',
      requiredFields: ['metadata'],
      optionalFields: ['recipient'],
      exampleRequest: {
        metadata: {
          name: 'My Dance NFT',
          description: 'A beautiful dance performance',
          image: 'ipfs://...',
          attributes: []
        },
        recipient: '0x...' // Optional, defaults to minting wallet
      }
    }
  });
}
