import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Story Protocol Aeneid Testnet Configuration (updated from Surreal-Base)
const storyProtocolTestnet = {
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
} as const;

// NFT Contract ABI (ERC-721 with minting)
const NFT_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' }
    ],
    name: 'mint',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

export async function POST(request: NextRequest) {
  // This endpoint is DEPRECATED - use /api/mint-ip-asset instead
  return NextResponse.json(
    {
      error: 'DEPRECATED ENDPOINT',
      message: 'This endpoint is deprecated. Use /api/mint-ip-asset for Story Protocol IP Asset minting.',
      correctEndpoint: '/api/mint-ip-asset',
      reason: 'This endpoint uses old contract addresses and simple NFT minting instead of Story Protocol IP Assets',
      migration: {
        oldEndpoint: '/api/mint-nft',
        newEndpoint: '/api/mint-ip-asset',
        oldContract: '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
        newGateway: '0x937bef10ba6fb941ed84b8d249abc76031429a9a',
        newSPGContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc'
      }
    },
    { status: 410 } // 410 Gone - indicates the endpoint is deprecated
  );

  try {
    const body = await request.json();

    // Validate required fields
    const { to, tokenURI, mintPrice } = body;

    if (!to || !tokenURI) {
      return NextResponse.json(
        { error: 'Missing required fields: to, tokenURI' },
        { status: 400 }
      );
    }

    // Validate environment variables
    const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT_ADDRESS;

    if (!privateKey || privateKey === 'your_private_key_here_replace_this') {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'STORY_PROTOCOL_PRIVATE_KEY not configured. Please add your private key to the .env file.'
        },
        { status: 500 }
      );
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'NFT contract address not configured' },
        { status: 500 }
      );
    }

    // Create wallet from private key
    const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}` as `0x${string}`);

    // Create clients
    const publicClient = createPublicClient({
      chain: storyProtocolTestnet,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: storyProtocolTestnet,
      transport: http(),
    });

    console.log('Minting NFT with account:', account.address);
    console.log('Target address:', to);
    console.log('Contract:', contractAddress);

    // Prepare mint transaction
    const mintValue = mintPrice ? parseEther(mintPrice.toString()) : 0n;

    // Execute mint transaction
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: NFT_CONTRACT_ABI,
      functionName: 'mint',
      args: [to as `0x${string}`, tokenURI],
      value: mintValue,
    });

    console.log('Transaction submitted:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    console.log('Transaction confirmed:', receipt);

    // Extract token ID from logs (simplified - in production, parse logs properly)
    // For now, generate a mock token ID
    const tokenId = Date.now().toString();

    const response = {
      success: true,
      transactionHash: hash,
      tokenId,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,

      nft: {
        id: `nft_${tokenId}`,
        tokenId,
        owner: to,
        tokenURI,
        mintedAt: new Date().toISOString(),

        blockchain: {
          network: 'Story Protocol Testnet',
          contractAddress,
          tokenStandard: 'ERC-721',
          transactionHash: hash,
          blockNumber: Number(receipt.blockNumber),
          gasUsed: receipt.gasUsed.toString()
        },
      },

      links: {
        transaction: `https://testnet.storyscan.xyz/tx/${hash}`,
        nft: `https://testnet.storyscan.xyz/nft/${contractAddress}/${tokenId}`
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Mint NFT error:', error);

    let errorMessage = 'Failed to mint NFT';
    let statusCode = 500;

    // Handle specific errors
    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in minting wallet. Please fund the wallet address.';
      statusCode = 402;
    } else if (error.message?.includes('nonce')) {
      errorMessage = 'Transaction nonce error. Please try again.';
      statusCode = 409;
    } else if (error.message?.includes('gas')) {
      errorMessage = 'Gas estimation failed. The network may be congested.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.shortMessage || error.message,
        code: error.code
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'mint-nft',
    status: 'active',
    description: 'Server-side minting of NFTs on Story Protocol blockchain',
    methods: ['POST'],
    requiredFields: ['to', 'tokenURI'],
    optionalFields: ['mintPrice'],
    environment: {
      privateKeyConfigured: !!process.env.STORY_PROTOCOL_PRIVATE_KEY &&
                           process.env.STORY_PROTOCOL_PRIVATE_KEY !== 'your_private_key_here_replace_this',
      contractAddress: process.env.NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT_ADDRESS,
      rpcUrl: process.env.NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL
    }
  });
}
