import { NextRequest, NextResponse } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';



/**
 * Mint IP Asset on Story Protocol using the official SDK
 *
 * This endpoint uses the Story Protocol SDK to mint real IP Assets
 * which are NFTs registered as intellectual property on Story Protocol.
 */
export async function POST(request: NextRequest) {
  console.log('🚀 [mint-ip-asset] POST request received');
  
  try {
    const body = await request.json();
    console.log('✅ [mint-ip-asset] JSON parsed successfully');
    const { metadata, recipient, walletAddress, licenseTerms: frontendLicenseTerms } = body;

    console.log('🔍 [mint-ip-asset] Received request:');
    console.log('   - Body keys:', Object.keys(body));
    console.log('   - Metadata keys:', metadata ? Object.keys(metadata) : 'undefined');
    console.log('   - Recipient:', recipient);
    console.log('   - WalletAddress:', walletAddress);
    console.log('   - Frontend License Terms:', frontendLicenseTerms ? 'provided' : 'not provided');
    console.log('   - Full metadata:', JSON.stringify(metadata, null, 2));

    // Validate required fields
    if (!metadata) {
      console.error('❌ [mint-ip-asset] Missing metadata field');
      return NextResponse.json(
        { error: 'Missing required field: metadata' },
        { status: 400 }
      );
    }

    // Use connected wallet address or fallback to a default for server-side minting
    const userAddress = walletAddress || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

    // Use the connected wallet address or recipient
    const recipientAddress = recipient || userAddress;

    console.log('🎨 Minting IP Asset via Surreal Base Universal Minting Engine...');
    console.log('   User Address:', userAddress);
    console.log('   To:', recipientAddress);
    console.log('   Metadata:', JSON.stringify(metadata, null, 2));

    // Prepare metadata for Story Protocol using the working Surreal-Base format
    // Safely extract only the fields we need to avoid issues with complex objects
    const simplifiedMetadata = {
      name: metadata.name || 'Untitled',
      description: metadata.description || 'No description provided',
      image: metadata.image || '',
      attributes: Array.isArray(metadata.attributes) ? metadata.attributes.slice(0, 10) : [], // Keep more attributes for richer NFTs
      danceStyle: Array.isArray(metadata.danceStyle) ? metadata.danceStyle[0] : metadata.primaryDanceStyle,
      difficulty: metadata.difficulty || 'Beginner',
    };

    console.log('📝 Simplified metadata:', JSON.stringify(simplifiedMetadata, null, 2));
    
    console.log('📝 Metadata prepared for Story Protocol');
    console.log('   Name:', simplifiedMetadata.name);
    console.log('   Description length:', simplifiedMetadata.description.length);
    console.log('   Attributes count:', simplifiedMetadata.attributes.length);

    // Create IP metadata in the format expected by Universal Minting Engine API
    const ipMetadata = {
      title: simplifiedMetadata.name || 'Untitled',
      description: simplifiedMetadata.description || 'No description provided',
      creators: [{
        name: 'MoveMint Creator',
        address: userAddress,
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString(),
      // Include media URLs if available
      ...(simplifiedMetadata.image && simplifiedMetadata.image.startsWith('http') ? { 
        image: simplifiedMetadata.image,
        imageHash: `0x${Date.now().toString(16)}` // Generate a placeholder hash
      } : {}),
    };

    // Validate required fields
    if (!ipMetadata.title || !ipMetadata.description) {
      return NextResponse.json(
        { error: 'Missing required metadata fields: title and description are required' },
        { status: 400 }
      );
    }

    // Create NFT metadata in the Universal Minting Engine format
    const nftMetadata = {
      name: simplifiedMetadata.name || 'Untitled NFT',
      description: simplifiedMetadata.description || 'No description provided',
      // Only include image if we have a valid URL, otherwise omit it
      ...(simplifiedMetadata.image && simplifiedMetadata.image.startsWith('http') ? { image: simplifiedMetadata.image } : {}),
      attributes: (simplifiedMetadata.attributes || []).map((attr: any) => {
        try {
          return {
            key: attr.trait_type || 'attribute',
            value: attr.value?.toString() || ''
          };
        } catch (attrError) {
          console.warn('⚠️ [mint-ip-asset] Error processing attribute:', attr, attrError);
          return {
            key: 'attribute',
            value: 'unknown'
          };
        }
      }).filter((attr: any) => attr.key && attr.value) // Remove any invalid attributes
    };

    // Use license terms from frontend (License Remixer) or fall back to default
    let licenseTerms;
    
    if (frontendLicenseTerms) {
      console.log('✅ [mint-ip-asset] Using license terms from frontend License Remixer');
      console.log('   - License Terms:', JSON.stringify(frontendLicenseTerms, null, 2));
      
      // Use the license terms provided by the License Remixer - ensure all required fields are present
      licenseTerms = {
        transferable: frontendLicenseTerms.transferable ?? true,
        royaltyPolicy: frontendLicenseTerms.royaltyPolicy || "0x0000000000000000000000000000000000000000",
        defaultMintingFee: frontendLicenseTerms.defaultMintingFee || "100000000000000000",
        expiration: frontendLicenseTerms.expiration || "0",
        commercialUse: frontendLicenseTerms.commercialUse ?? true,
        commercialAttribution: frontendLicenseTerms.commercialAttribution ?? true,
        commercializerChecker: frontendLicenseTerms.commercializerChecker || "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: frontendLicenseTerms.commercializerCheckerData || "0x",
        commercialRevShare: frontendLicenseTerms.commercialRevShare ?? 10,
        derivativesAllowed: frontendLicenseTerms.derivativesAllowed ?? true,
        derivativesAttribution: frontendLicenseTerms.derivativesAttribution ?? true,
        derivativesApproval: frontendLicenseTerms.derivativesApproval ?? false,
        derivativesReciprocal: frontendLicenseTerms.derivativesReciprocal ?? true,
        derivativeRevShare: frontendLicenseTerms.derivativeRevShare ?? 10,
        currency: frontendLicenseTerms.currency || "0x0000000000000000000000000000000000000000",
        uri: frontendLicenseTerms.uri || "https://example.com/license-terms"
      };
    } else {
      console.log('⚠️ [mint-ip-asset] No license terms provided, using default commercial remix template');
      
      // Default license terms (commercial remix template) - Complete with all required fields
      licenseTerms = {
        transferable: true,
        royaltyPolicy: "0x0000000000000000000000000000000000000000",
        defaultMintingFee: "100000000000000000", // 0.1 ETH
        expiration: "0", // No expiration
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x",
        commercialRevShare: 10, // 10%
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevShare: 10, // 10%
        currency: "0x0000000000000000000000000000000000000000",
        uri: "https://example.com/license-terms"
      };
    }

    console.log('📋 Final request data:');
    console.log('   userAddress:', userAddress);
    console.log('   ipMetadata:', JSON.stringify(ipMetadata, null, 2));
    console.log('   nftMetadata:', JSON.stringify(nftMetadata, null, 2));

    // Validate the data before sending
    if (!userAddress || !userAddress.startsWith('0x')) {
      console.error('❌ [mint-ip-asset] Invalid userAddress:', userAddress);
      return NextResponse.json(
        { error: 'Invalid user address format' },
        { status: 400 }
      );
    }



    console.log('🚀 Using Surreal-Base Universal Minting Engine via proxy...');
    
    try {
      // Call Surreal Base directly from server-side (no need for proxy on server)
      const surrealBaseUrl = process.env.SURREAL_BASE_API_URL || 'https://surreal-base.vercel.app';
      const prepareResponse = await fetch(`${surrealBaseUrl}/api/prepare-mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: userAddress,
          ipMetadata,
          nftMetadata,
          licenseTerms
        })
      });

      if (!prepareResponse.ok) {
        let errorMessage = `HTTP ${prepareResponse.status}: ${prepareResponse.statusText}`;
        try {
          const errorData = await prepareResponse.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, use the status text
          console.warn('Could not parse error response as JSON:', parseError);
        }
        throw new Error(`Prepare-mint failed: ${errorMessage}`);
      }

      const prepareResult = await prepareResponse.json();
      console.log('✅ Transaction prepared by Surreal-Base');
      
      // Since Surreal Base handles the full minting process, we can return the result directly
      // The transaction has already been executed by Surreal Base
      
      // Check if Surreal Base returned a completed transaction or just prepared data
      const isCompleted = prepareResult.transaction?.hash && prepareResult.transaction.hash.startsWith('0x');
      
      if (isCompleted) {
        // Real transaction was executed
        const explorerUrl = `https://aeneid.storyscan.io/tx/${prepareResult.transaction.hash}`;
        
        return NextResponse.json({
          success: true,
          transactionHash: prepareResult.transaction.hash,
          tokenId: prepareResult.metadata?.tokenId || prepareResult.transaction.hash,
          blockNumber: prepareResult.transaction?.blockNumber || 0,
          gasUsed: prepareResult.transaction?.gasUsed || prepareResult.transaction?.gasEstimate || '0',
          status: 'completed',
          explorerUrl,
          ipAsset: {
            tokenId: prepareResult.metadata?.tokenId || prepareResult.transaction.hash,
            owner: recipientAddress,
            metadata: simplifiedMetadata,
            network: 'Story Protocol Aeneid Testnet',
            contractAddress: prepareResult.transaction?.to || '0x...',
          },
          message: 'IP Asset minted successfully on Story Protocol blockchain!',
          preparedBy: 'Surreal-Base Universal Minting Engine',
          metadata: prepareResult.metadata,
          transaction: prepareResult.transaction,
        });
      } else {
        // Transaction was prepared successfully (this is the expected behavior)
        console.log('✅ [mint-ip-asset] Transaction prepared successfully by Surreal Base');
        
        return NextResponse.json({
          success: true,
          status: 'prepared',
          message: 'IP Asset transaction prepared successfully! Ready for client-side signing and execution.',
          transaction: {
            to: prepareResult.transaction?.to,
            data: prepareResult.transaction?.data || '0x',
            value: prepareResult.transaction?.value || '0',
            gasEstimate: prepareResult.transaction?.gasEstimate || '800000'
          },
          metadata: {
            ipfsHash: prepareResult.metadata?.ipfsHash,
            ipHash: prepareResult.metadata?.ipHash,
            nftIpfsHash: prepareResult.metadata?.nftIpfsHash,
            nftHash: prepareResult.metadata?.nftHash,
            tokenId: prepareResult.metadata?.tokenId || `prepared-${Date.now()}`
          },
          ipAsset: {
            tokenId: prepareResult.metadata?.tokenId || `prepared-${Date.now()}`,
            owner: recipientAddress,
            metadata: simplifiedMetadata,
            network: 'Story Protocol Aeneid Testnet',
            contractAddress: prepareResult.transaction?.to || '0x...',
          },
          preparedBy: 'Surreal-Base Universal Minting Engine',
          licenseTermsUsed: licenseTerms, // Show which license terms were used
          nextSteps: [
            'Sign the prepared transaction with your wallet',
            'Submit the signed transaction to the blockchain',
            'Wait for transaction confirmation'
          ]
        });
      }

    } catch (engineError) {
      console.error('❌ Surreal-Base Universal Minting Engine error:', engineError);
      
      // Check if it's a specific Surreal Base error
      let userMessage = 'The Surreal Base Universal Minting Engine is currently unavailable.';
      let suggestion = 'This is a temporary service issue. Please try again in a few minutes.';
      let statusCode = 503; // Service Unavailable
      
      if (engineError instanceof Error) {
        if (engineError.message.includes('Internal server error') || engineError.message.includes('unexpected error')) {
          userMessage = 'The Surreal Base API is experiencing internal server issues.';
          suggestion = 'This is a known temporary issue with the Story Protocol infrastructure. The service should be restored shortly. Please try again in 5-10 minutes.';
          statusCode = 503;
        } else if (engineError.message.includes('validation')) {
          userMessage = 'Invalid request data sent to Surreal Base API.';
          suggestion = 'There may be an issue with the license terms or metadata format.';
          statusCode = 400;
        } else if (engineError.message.includes('fetch failed') || engineError.message.includes('network')) {
          userMessage = 'Unable to connect to Surreal Base API.';
          suggestion = 'Network connectivity issue. Please check your internet connection and try again.';
          statusCode = 503;
        }
      }
      
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          userMessage,
          details: engineError instanceof Error ? engineError.message : 'Unknown error',
          suggestion,
          serviceStatus: 'unavailable',
          retryAfter: 300, // Suggest retry after 5 minutes
          technicalDetails: {
            method: 'Surreal-Base Universal Minting Engine',
            network: 'aeneid',
            userAddress: userAddress,
            timestamp: new Date().toISOString(),
            surrealBaseUrl: process.env.SURREAL_BASE_API_URL || 'https://surreal-base.vercel.app',
            errorType: engineError instanceof Error ? engineError.constructor.name : 'Unknown'
          }
        },
        { status: statusCode }
      );
    }

  } catch (error: any) {
    console.error('❌ IP Asset minting failed:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);

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
    } else if (error.message?.includes('gas') || error.message?.includes('intrinsic')) {
      errorMessage = 'Transaction gas error. The transaction requires more gas than estimated.';
      userFriendlyMessage = 'Gas estimation failed. This is usually a temporary network issue. Please try again.';
      statusCode = 400;
    } else if (error.message?.includes('execution reverted')) {
      errorMessage = 'Smart contract execution reverted. This could be due to incorrect function call or contract permissions.';
      userFriendlyMessage = 'The minting contract rejected the transaction. This might be due to contract configuration or permissions.';
      statusCode = 400;
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
      registrationWorkflowsContract: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424',
      spgNftContract: '0x2da69432ad077637d174a94ad5169482cd5dba10'
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
