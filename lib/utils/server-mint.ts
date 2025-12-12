/**
 * Server-side NFT Minting Helper
 * Calls the backend API to mint NFTs using the server's private key
 */

interface ServerMintParams {
  to: string; // Recipient wallet address
  tokenURI: string; // NFT metadata URI
  mintPrice?: string; // Optional price in IP tokens
}

interface ServerMintResult {
  success: boolean;
  transactionHash: string;
  tokenId: string;
  blockNumber: number;
  gasUsed: string;
  status: string;
  nft: {
    id: string;
    tokenId: string;
    owner: string;
    tokenURI: string;
    mintedAt: string;
    blockchain: {
      network: string;
      contractAddress: string;
      tokenStandard: string;
      transactionHash: string;
      blockNumber: number;
      gasUsed: string;
    };
  };
  links: {
    transaction: string;
    nft: string;
  };
}

/**
 * Mint NFT using server-side blockchain transaction
 * No wallet signature required - backend handles everything
 */
export async function mintNFTServerSide(params: ServerMintParams): Promise<ServerMintResult> {
  const { to, tokenURI, mintPrice } = params;

  try {
    const response = await fetch('/api/mint-nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        tokenURI,
        mintPrice: mintPrice || '0',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Minting failed');
    }

    if (!data.success) {
      throw new Error(data.error || 'Minting failed');
    }

    return data;
  } catch (error: any) {
    console.error('Server-side minting error:', error);
    throw new Error(error.message || 'Failed to mint NFT on blockchain');
  }
}

/**
 * Check if server-side minting is properly configured
 */
export async function checkMintingConfiguration(): Promise<{
  configured: boolean;
  message?: string;
  details?: any;
}> {
  try {
    const response = await fetch('/api/mint-nft');
    const data = await response.json();

    if (!data.environment?.privateKeyConfigured) {
      return {
        configured: false,
        message: 'Server minting wallet not configured. Please add STORY_PROTOCOL_PRIVATE_KEY to .env file.',
        details: data.environment,
      };
    }

    return {
      configured: true,
      details: data.environment,
    };
  } catch (error) {
    return {
      configured: false,
      message: 'Unable to check minting configuration',
    };
  }
}
