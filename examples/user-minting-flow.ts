/**
 * User Minting Flow Example
 * 
 * This example shows how users connect their wallet and mint NFTs
 * directly to their own address with their own royalties.
 */

import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073";
const CONTRACT_ABI = [
  "function mintDance(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash) returns (uint256)",
  "function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)",
  "function getCreatorTokens(address creator) view returns (uint256[])",
  "function getDanceMetadata(uint256 tokenId) view returns (tuple(string title, string danceStyle, string choreographer, uint256 duration, string ipfsMetadataHash, address creator, uint256 mintedAt))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event DanceMinted(uint256 indexed tokenId, address indexed creator, string title, string danceStyle, string ipfsMetadataHash)"
];

export class UserMintingService {
  private provider: ethers.BrowserProvider;
  private contract: ethers.Contract;
  private userAddress: string = '';

  constructor() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Please install MetaMask to mint NFTs');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
  }

  /**
   * Step 1: User connects their wallet
   */
  async connectWallet(): Promise<string> {
    try {
      // Request wallet connection
      await this.provider.send("eth_requestAccounts", []);
      const signer = await this.provider.getSigner();
      this.userAddress = await signer.getAddress();

      console.log("✅ Wallet connected:", this.userAddress);
      return this.userAddress;
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Step 2: User mints NFT to their own wallet
   */
  async mintMyDanceNFT(danceData: {
    title: string;
    danceStyle: string;
    choreographer: string;
    duration: number;
    ipfsHash: string;
  }) {
    if (!this.userAddress) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      console.log("🎭 Minting NFT to your wallet:", this.userAddress);

      // Mint NFT - it will be minted to user's wallet automatically
      const tx = await contractWithSigner.mintDance(
        danceData.title,
        danceData.danceStyle,
        danceData.choreographer,
        danceData.duration,
        danceData.ipfsHash
      );

      console.log("📤 Transaction sent:", tx.hash);
      const receipt = await tx.wait();

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
        tokenId = parsed?.args[0].toString();
      }

      console.log("🎉 NFT minted successfully!");
      console.log("   - Token ID:", tokenId);
      console.log("   - Owner:", this.userAddress);
      console.log("   - Creator:", this.userAddress);

      return {
        tokenId,
        owner: this.userAddress,
        creator: this.userAddress,
        transactionHash: receipt.hash
      };

    } catch (error) {
      throw new Error(`Minting failed: ${error.message}`);
    }
  }

  /**
   * Step 3: User sets their own royalties (optional)
   */
  async setMyRoyalties(tokenId: string, royaltyPercentage: number = 5) {
    if (!this.userAddress) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      // Convert percentage to basis points (5% = 500 basis points)
      const royaltyBasisPoints = royaltyPercentage * 100;

      console.log(`💰 Setting ${royaltyPercentage}% royalty for token ${tokenId}`);
      console.log("   - Royalty receiver:", this.userAddress);

      const tx = await contractWithSigner.setTokenRoyalty(
        tokenId,
        this.userAddress, // User receives their own royalties
        royaltyBasisPoints
      );

      await tx.wait();

      console.log("✅ Royalty set successfully!");
      console.log("   - You will receive royalties on secondary sales");

      return {
        tokenId,
        royaltyReceiver: this.userAddress,
        royaltyPercentage: royaltyPercentage
      };

    } catch (error) {
      throw new Error(`Setting royalty failed: ${error.message}`);
    }
  }

  /**
   * Step 4: Get all NFTs owned by the user
   */
  async getMyNFTs(): Promise<any[]> {
    if (!this.userAddress) {
      throw new Error('Please connect your wallet first');
    }

    try {
      console.log("🔍 Fetching your NFTs...");

      // Get all tokens created by this user
      const tokenIds = await this.contract.getCreatorTokens(this.userAddress);

      const myNFTs = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const [metadata, owner] = await Promise.all([
            this.contract.getDanceMetadata(tokenId),
            this.contract.ownerOf(tokenId)
          ]);

          return {
            tokenId: tokenId.toString(),
            title: metadata.title,
            danceStyle: metadata.danceStyle,
            choreographer: metadata.choreographer,
            duration: Number(metadata.duration),
            ipfsHash: metadata.ipfsMetadataHash,
            creator: metadata.creator, // This will be user's address
            owner: owner, // This will also be user's address
            mintedAt: new Date(Number(metadata.mintedAt) * 1000),
            isOwnedByMe: owner.toLowerCase() === this.userAddress.toLowerCase(),
            isCreatedByMe: metadata.creator.toLowerCase() === this.userAddress.toLowerCase()
          };
        })
      );

      console.log(`✅ Found ${myNFTs.length} NFTs created by you`);
      return myNFTs;

    } catch (error) {
      throw new Error(`Failed to fetch your NFTs: ${error.message}`);
    }
  }

  /**
   * Complete user flow example
   */
  async completeUserFlow() {
    try {
      // Step 1: Connect wallet
      const userAddress = await this.connectWallet();
      console.log("👤 Connected as:", userAddress);

      // Step 2: Mint NFT
      const mintResult = await this.mintMyDanceNFT({
        title: "My Amazing Dance",
        danceStyle: "Hip Hop",
        choreographer: "Me", // User is the choreographer
        duration: 180,
        ipfsHash: "QmYourIPFSHash"
      });

      console.log("🎭 Minted NFT:", mintResult);

      // Step 3: Set royalties (optional)
      await this.setMyRoyalties(mintResult.tokenId, 5); // 5% royalty

      // Step 4: View my NFTs
      const myNFTs = await this.getMyNFTs();
      console.log("📋 My NFTs:", myNFTs);

      return {
        userAddress,
        mintedNFT: mintResult,
        allMyNFTs: myNFTs
      };

    } catch (error) {
      console.error("❌ User flow failed:", error);
      throw error;
    }
  }
}

// Usage example for React component
export function useUserMinting() {
  const [service] = useState(() => new UserMintingService());
  const [userAddress, setUserAddress] = useState<string>('');
  const [myNFTs, setMyNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const connectAndMint = async (danceData: any) => {
    try {
      setLoading(true);

      // Connect wallet
      const address = await service.connectWallet();
      setUserAddress(address);

      // Mint NFT to user's wallet
      const result = await service.mintMyDanceNFT(danceData);

      // Optionally set royalties
      await service.setMyRoyalties(result.tokenId, 5);

      // Refresh user's NFTs
      const nfts = await service.getMyNFTs();
      setMyNFTs(nfts);

      return result;

    } catch (error) {
      console.error('Minting failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    userAddress,
    myNFTs,
    loading,
    connectAndMint,
    service
  };
}

// Example React component
export function MintMyDanceNFT() {
  const { userAddress, connectAndMint, loading } = useUserMinting();
  const [formData, setFormData] = useState({
    title: '',
    danceStyle: '',
    choreographer: '',
    duration: 0,
    ipfsHash: ''
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await connectAndMint(formData);
      alert(`🎉 NFT minted to your wallet!\nToken ID: ${result.tokenId}\nYou own it and will receive royalties!`);
    } catch (error) {
      alert(`❌ Minting failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Mint Your Dance NFT</h2>
      
      {userAddress && (
        <div className="mb-4 p-3 bg-green-100 rounded">
          <p className="text-sm text-green-800">
            ✅ Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
          <p className="text-xs text-green-600">
            NFT will be minted to your wallet & you'll receive royalties
          </p>
        </div>
      )}

      <form onSubmit={handleMint} className="space-y-4">
        <input
          type="text"
          placeholder="Dance Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        
        <select
          value={formData.danceStyle}
          onChange={(e) => setFormData(prev => ({ ...prev, danceStyle: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Dance Style</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Ballet">Ballet</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Jazz">Jazz</option>
        </select>

        <input
          type="text"
          placeholder="Your Name (Choreographer)"
          value={formData.choreographer}
          onChange={(e) => setFormData(prev => ({ ...prev, choreographer: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Duration (seconds)"
          value={formData.duration || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="IPFS Hash"
          value={formData.ipfsHash}
          onChange={(e) => setFormData(prev => ({ ...prev, ipfsHash: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Minting...' : userAddress ? 'Mint My NFT' : 'Connect Wallet & Mint'}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-600">
        <p>✅ NFT will be minted to your wallet</p>
        <p>✅ You will be the owner and creator</p>
        <p>✅ You can set your own royalties</p>
        <p>✅ You will receive royalties on secondary sales</p>
      </div>
    </div>
  );
}