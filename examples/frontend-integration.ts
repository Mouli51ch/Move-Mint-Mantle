/**
 * MoveMint NFT Frontend Integration Examples
 * 
 * This file demonstrates how to integrate the MoveMintNFT contract
 * with your existing MoveMint frontend application.
 */

import { ethers } from 'ethers';

// Import the contract ABI (generated after compilation)
// In a real app, you'd import this from your artifacts
const MOVEMINT_NFT_ABI = [
  // Core functions - copy from artifacts/contracts/MoveMintNFT.sol/MoveMintNFT.json
  "function mintDance(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash) returns (uint256)",
  "function getDanceMetadata(uint256 tokenId) view returns (tuple(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash, address creator, uint256 mintedAt))",
  "function getCreatorTokens(address creator) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getTotalMinted() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "event DanceMinted(uint256 indexed tokenId, address indexed creator, string title, string danceStyle, string ipfsMetadataHash)"
];

// Contract configuration
const MANTLE_TESTNET_CONFIG = {
  chainId: 5001,
  name: 'Mantle Testnet',
  rpcUrl: 'https://rpc.testnet.mantle.xyz',
  explorerUrl: 'https://explorer.testnet.mantle.xyz',
  currency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18
  }
};

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x..."; // Your deployed contract address

/**
 * MoveMint NFT Service Class
 * Handles all interactions with the MoveMintNFT contract
 */
export class MoveMintNFTService {
  private provider: ethers.BrowserProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize provider
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, MOVEMINT_NFT_ABI, this.provider);
    } else {
      throw new Error('MetaMask not found. Please install MetaMask to use this feature.');
    }
  }

  /**
   * Connect wallet and get signer
   */
  async connectWallet(): Promise<string> {
    try {
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== MANTLE_TESTNET_CONFIG.chainId) {
        await this.switchToMantleTestnet();
      }

      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Switch to Mantle Testnet
   */
  async switchToMantleTestnet(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${MANTLE_TESTNET_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${MANTLE_TESTNET_CONFIG.chainId.toString(16)}`,
            chainName: MANTLE_TESTNET_CONFIG.name,
            rpcUrls: [MANTLE_TESTNET_CONFIG.rpcUrl],
            blockExplorerUrls: [MANTLE_TESTNET_CONFIG.explorerUrl],
            nativeCurrency: MANTLE_TESTNET_CONFIG.currency,
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Mint a new dance NFT
   */
  async mintDance(danceData: {
    title: string;
    danceStyle: string;
    choreographer: string;
    duration: number; // in seconds
    ipfsHash: string;
  }): Promise<{
    tokenId: string;
    transactionHash: string;
    explorerUrl: string;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    try {
      console.log('🎭 Minting dance NFT:', danceData);

      // Get contract with signer for transactions
      const contractWithSigner = this.contract.connect(this.signer);

      // Estimate gas
      const gasEstimate = await contractWithSigner.mintDance.estimateGas(
        danceData.title,
        danceData.danceStyle,
        danceData.choreographer,
        danceData.duration,
        danceData.ipfsHash
      );

      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Send transaction
      const tx = await contractWithSigner.mintDance(
        danceData.title,
        danceData.danceStyle,
        danceData.choreographer,
        danceData.duration,
        danceData.ipfsHash,
        {
          gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        }
      );

      console.log('📤 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);

      // Extract token ID from events
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'DanceMinted';
        } catch {
          return false;
        }
      });

      let tokenId = '0';
      if (mintEvent) {
        const parsed = this.contract.interface.parseLog(mintEvent);
        tokenId = parsed?.args[0].toString() || '0';
      }

      return {
        tokenId,
        transactionHash: receipt.hash,
        explorerUrl: `${MANTLE_TESTNET_CONFIG.explorerUrl}/tx/${receipt.hash}`
      };

    } catch (error: any) {
      console.error('❌ Minting failed:', error);
      
      // Handle common errors
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient MNT tokens for gas fees. Please get testnet tokens from the faucet.');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction was rejected by user.');
      } else {
        throw new Error(`Minting failed: ${error.message}`);
      }
    }
  }

  /**
   * Get all NFTs minted by a user
   */
  async getUserNFTs(userAddress: string): Promise<Array<{
    tokenId: string;
    title: string;
    danceStyle: string;
    choreographer: string;
    duration: number;
    ipfsHash: string;
    tokenURI: string;
    creator: string;
    mintedAt: Date;
    explorerUrl: string;
  }>> {
    try {
      console.log('🔍 Fetching NFTs for user:', userAddress);

      // Get token IDs for the user
      const tokenIds = await this.contract.getCreatorTokens(userAddress);
      console.log('📋 Found token IDs:', tokenIds.map((id: any) => id.toString()));

      // Fetch metadata for each token
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId: any) => {
          const [metadata, tokenURI] = await Promise.all([
            this.contract.getDanceMetadata(tokenId),
            this.contract.tokenURI(tokenId)
          ]);

          return {
            tokenId: tokenId.toString(),
            title: metadata.title,
            danceStyle: metadata.danceStyle,
            choreographer: metadata.choreographer,
            duration: Number(metadata.duration),
            ipfsHash: metadata.ipfsMetadataHash,
            tokenURI: tokenURI,
            creator: metadata.creator,
            mintedAt: new Date(Number(metadata.mintedAt) * 1000),
            explorerUrl: `${MANTLE_TESTNET_CONFIG.explorerUrl}/token/${CONTRACT_ADDRESS}?a=${tokenId}`
          };
        })
      );

      console.log('✅ Fetched NFT data:', nfts);
      return nfts;

    } catch (error) {
      console.error('❌ Failed to fetch user NFTs:', error);
      throw error;
    }
  }

  /**
   * Get metadata for a specific token
   */
  async getTokenMetadata(tokenId: string) {
    try {
      const metadata = await this.contract.getDanceMetadata(tokenId);
      const tokenURI = await this.contract.tokenURI(tokenId);
      const owner = await this.contract.ownerOf(tokenId);

      return {
        tokenId,
        title: metadata.title,
        danceStyle: metadata.danceStyle,
        choreographer: metadata.choreographer,
        duration: Number(metadata.duration),
        ipfsHash: metadata.ipfsMetadataHash,
        tokenURI,
        creator: metadata.creator,
        owner,
        mintedAt: new Date(Number(metadata.mintedAt) * 1000),
        explorerUrl: `${MANTLE_TESTNET_CONFIG.explorerUrl}/token/${CONTRACT_ADDRESS}?a=${tokenId}`
      };
    } catch (error) {
      console.error('❌ Failed to fetch token metadata:', error);
      throw error;
    }
  }

  /**
   * Listen for new mint events
   */
  onDanceMinted(callback: (event: {
    tokenId: string;
    creator: string;
    title: string;
    danceStyle: string;
    ipfsHash: string;
    transactionHash: string;
  }) => void): () => void {
    const eventFilter = this.contract.filters.DanceMinted();
    
    const listener = (tokenId: any, creator: string, title: string, danceStyle: string, ipfsHash: string, event: any) => {
      callback({
        tokenId: tokenId.toString(),
        creator,
        title,
        danceStyle,
        ipfsHash,
        transactionHash: event.transactionHash
      });
    };

    this.contract.on(eventFilter, listener);

    // Return cleanup function
    return () => {
      this.contract.off(eventFilter, listener);
    };
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    try {
      const totalMinted = await this.contract.getTotalMinted();
      
      return {
        totalMinted: Number(totalMinted),
        contractAddress: CONTRACT_ADDRESS,
        explorerUrl: `${MANTLE_TESTNET_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESS}`
      };
    } catch (error) {
      console.error('❌ Failed to fetch contract stats:', error);
      throw error;
    }
  }
}

/**
 * Integration with existing MoveMint flow
 * 
 * This shows how to integrate the Mantle NFT minting with your existing
 * Story Protocol flow for dual minting.
 */
export class MoveMintDualMintingService {
  private nftService: MoveMintNFTService;

  constructor() {
    this.nftService = new MoveMintNFTService();
  }

  /**
   * Dual minting: Story Protocol + Mantle NFT
   */
  async mintDanceWithDualProtocol(danceData: {
    title: string;
    danceStyle: string;
    choreographer: string;
    duration: number;
    videoFile: File;
    // ... other existing fields
  }) {
    try {
      console.log('🚀 Starting dual protocol minting...');

      // Step 1: Upload to IPFS (your existing code)
      console.log('📤 Uploading to IPFS...');
      const ipfsHash = await this.uploadToIPFS(danceData);
      console.log('✅ IPFS upload complete:', ipfsHash);

      // Step 2: Mint on Story Protocol (your existing code)
      console.log('📜 Minting on Story Protocol...');
      const storyProtocolResult = await this.mintOnStoryProtocol({
        ...danceData,
        ipfsHash
      });
      console.log('✅ Story Protocol mint complete:', storyProtocolResult.ipAssetId);

      // Step 3: Mint on Mantle (new)
      console.log('⛓️  Minting on Mantle...');
      const mantleResult = await this.nftService.mintDance({
        title: danceData.title,
        danceStyle: danceData.danceStyle,
        choreographer: danceData.choreographer,
        duration: danceData.duration,
        ipfsHash: ipfsHash
      });
      console.log('✅ Mantle mint complete:', mantleResult.tokenId);

      // Step 4: Save to your database with both IDs
      const savedRecord = await this.saveToDB({
        title: danceData.title,
        danceStyle: danceData.danceStyle,
        choreographer: danceData.choreographer,
        duration: danceData.duration,
        ipfsHash: ipfsHash,
        storyProtocolId: storyProtocolResult.ipAssetId,
        mantleTokenId: mantleResult.tokenId,
        mantleTransactionHash: mantleResult.transactionHash,
        networks: ['story-protocol-testnet', 'mantle-testnet'],
        createdAt: new Date()
      });

      console.log('🎉 Dual minting complete!');

      return {
        success: true,
        ipfsHash,
        storyProtocol: storyProtocolResult,
        mantle: mantleResult,
        databaseRecord: savedRecord
      };

    } catch (error) {
      console.error('❌ Dual minting failed:', error);
      throw error;
    }
  }

  // Placeholder methods - replace with your existing implementations
  private async uploadToIPFS(danceData: any): Promise<string> {
    // Your existing IPFS upload logic
    throw new Error('Implement your existing IPFS upload logic');
  }

  private async mintOnStoryProtocol(data: any): Promise<{ ipAssetId: string }> {
    // Your existing Story Protocol minting logic
    throw new Error('Implement your existing Story Protocol minting logic');
  }

  private async saveToDB(data: any): Promise<any> {
    // Your existing database save logic
    throw new Error('Implement your existing database save logic');
  }
}

/**
 * React Hook Example (if using React)
 */
export function useMoveMintNFT() {
  const [nftService] = useState(() => new MoveMintNFTService());
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const address = await nftService.connectWallet();
      setUserAddress(address);
      setIsConnected(true);
      await loadUserNFTs(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadUserNFTs = async (address?: string) => {
    try {
      setLoading(true);
      const nfts = await nftService.getUserNFTs(address || userAddress);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mintDance = async (danceData: any) => {
    try {
      setLoading(true);
      const result = await nftService.mintDance(danceData);
      await loadUserNFTs(); // Refresh user's NFTs
      return result;
    } catch (error) {
      console.error('Failed to mint dance:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    nftService,
    isConnected,
    userAddress,
    userNFTs,
    loading,
    connectWallet,
    loadUserNFTs,
    mintDance
  };
}

// Type definitions for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface DanceNFTMetadata {
  tokenId: string;
  title: string;
  danceStyle: string;
  choreographer: string;
  duration: number;
  ipfsHash: string;
  tokenURI: string;
  creator: string;
  owner: string;
  mintedAt: Date;
  explorerUrl: string;
}

export interface MintResult {
  tokenId: string;
  transactionHash: string;
  explorerUrl: string;
}