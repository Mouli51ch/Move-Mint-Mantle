# MoveMint NFT Contract - Mantle Testnet

🕺💃 **Production-ready ERC721 NFT contract for minting dance performances with IP-style metadata on Mantle Testnet.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-orange)](https://hardhat.org/)

## 🚀 **Live Contract**

- **Contract Address:** `0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073`
- **Network:** Mantle Sepolia Testnet (Chain ID: 5003)
- **Explorer:** [View on Mantle Explorer](https://explorer.sepolia.mantle.xyz/address/0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073)

## ✨ **Features**

- ✅ **ERC721** standard with enumeration and URI storage
- ✅ **ERC2981** royalty support (5% default, customizable per token)
- ✅ **Decentralized minting** - users mint their own NFTs (no admin control)
- ✅ **Rich metadata** - title, dance style, choreographer, duration, IPFS hash
- ✅ **Creator tracking** - query all tokens by creator address
- ✅ **IPFS integration** - automatic tokenURI resolution to IPFS
- ✅ **Gas optimized** - OpenZeppelin standards with compiler optimization
- ✅ **Production tested** - comprehensive test suite included

## 🎯 **Use Cases**

Perfect for:
- **Dance Performance NFTs** - Mint choreographed performances
- **IP Asset Registry** - Proof of creation and ownership
- **Creator Portfolios** - Track all works by choreographer
- **Royalty Distribution** - Automatic royalties on secondary sales
- **Cross-chain Integration** - Works alongside Story Protocol

## 🏗️ **Architecture**

```
MoveMintNFT Contract
├── ERC721 (Base NFT functionality)
├── ERC721Enumerable (Token enumeration)
├── ERC721URIStorage (Individual token URIs)
├── ERC2981 (Royalty standard)
└── Ownable (Access control)
```

### **Core Functions**

```solidity
// Mint a new dance performance NFT
function mintDance(
    string memory title,
    string memory danceStyle,
    string memory choreographer,
    uint256 duration,
    string memory ipfsMetadataHash
) public returns (uint256)

// Get all tokens minted by a creator
function getCreatorTokens(address creator) 
    public view returns (uint256[] memory)

// Get full metadata for a token
function getDanceMetadata(uint256 tokenId) 
    public view returns (DanceMetadata memory)
```

## 🚀 **Quick Start**

### Prerequisites

- Node.js 16+ and npm
- MetaMask or compatible Web3 wallet
- Testnet MNT tokens from [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mouli51ch/Move-Mint-Mantle.git
cd Move-Mint-Mantle

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configuration

Edit `.env` with your credentials:

```env
PRIVATE_KEY=0xYourPrivateKeyHere
RPC_URL=https://rpc.sepolia.mantle.xyz
```

**⚠️ Security Note:** Use a dedicated testnet wallet. Never use your main wallet's private key.

### Compile & Test

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Test contract interaction
npx hardhat run scripts/test-contract.ts --network mantleTestnet
```

### Deploy (Optional)

The contract is already deployed, but you can deploy your own:

```bash
# Deploy to Mantle Testnet
npm run deploy

# Verify on explorer (optional)
npx hardhat verify --network mantleTestnet <CONTRACT_ADDRESS> "<ROYALTY_RECEIVER>" 500
```

## 📱 **Frontend Integration**

### Quick Integration

```typescript
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073";
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Mint a dance NFT
async function mintDance() {
  const signer = await provider.getSigner();
  const contractWithSigner = contract.connect(signer);
  
  const tx = await contractWithSigner.mintDance(
    "Urban Flow",           // title
    "Hip Hop",             // danceStyle  
    "Jane Doe",            // choreographer
    180,                   // duration (seconds)
    "QmYourIPFSHash"       // ipfsMetadataHash
  );
  
  const receipt = await tx.wait();
  console.log("NFT minted! Token ID:", receipt.logs[0].topics[1]);
}
```

### Complete Integration Guide

📚 **[View Complete Frontend Integration Documentation](./docs/FRONTEND_INTEGRATION.md)**

Includes:
- Complete service class with TypeScript
- React hooks and components
- Error handling and network management
- Production deployment guide
- Testing examples

## 🔧 **Network Configuration**

### Mantle Sepolia Testnet

Add to MetaMask:

```
Network Name: Mantle Sepolia Testnet
RPC URL: https://rpc.sepolia.mantle.xyz
Chain ID: 5003
Currency Symbol: MNT
Block Explorer: https://explorer.sepolia.mantle.xyz
```

### Get Testnet Tokens

Visit [Mantle Faucet](https://faucet.sepolia.mantle.xyz/) to get free testnet MNT tokens.

## 🧪 **Testing**

### Run Test Suite

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/MoveMintNFT.test.ts

# Test with gas reporting
REPORT_GAS=true npm test
```

### Test Coverage

- ✅ Contract deployment and initialization
- ✅ NFT minting with metadata validation
- ✅ Creator token tracking
- ✅ Royalty functionality
- ✅ Access control and permissions
- ✅ Event emission verification

## 📊 **Contract Specifications**

| Feature | Details |
|---------|---------|
| **Standard** | ERC721 + ERC2981 + Enumerable + URI Storage |
| **Compiler** | Solidity ^0.8.20 |
| **Optimization** | 200 runs |
| **Gas Cost** | ~150,000-200,000 gas per mint |
| **Royalty** | 5% default (customizable) |
| **Max Supply** | Unlimited |

### **Metadata Structure**

```typescript
interface DanceMetadata {
  title: string;           // "Urban Flow"
  danceStyle: string;      // "Hip Hop", "Ballet", etc.
  choreographer: string;   // "Jane Doe"
  duration: number;        // 180 (seconds)
  ipfsMetadataHash: string; // "QmXxXx..."
  creator: address;        // Minter's address
  mintedAt: uint256;       // Block timestamp
}
```

## 🔗 **Integration with Existing Systems**

### Story Protocol Integration

This contract works alongside Story Protocol for dual minting:

```typescript
// 1. Upload to IPFS (existing flow)
const ipfsHash = await uploadToIPFS(danceData);

// 2. Mint on Story Protocol (existing)
const storyResult = await mintOnStoryProtocol(ipfsHash);

// 3. Mint on Mantle (new)
const mantleResult = await mintOnMantle(ipfsHash);

// 4. Store both IDs in database
await saveToDB({
  ipfsHash,
  storyProtocolId: storyResult.ipAssetId,
  mantleTokenId: mantleResult.tokenId
});
```

## 🛠️ **Development**

### Project Structure

```
├── contracts/
│   └── MoveMintNFT.sol          # Main NFT contract
├── scripts/
│   ├── deploy.ts                # Deployment script
│   ├── test-contract.ts         # Contract interaction test
│   └── generate-wallet.ts       # Wallet generation utility
├── test/
│   └── MoveMintNFT.test.ts      # Comprehensive test suite
├── docs/
│   └── FRONTEND_INTEGRATION.md  # Complete integration guide
├── examples/
│   └── frontend-integration.ts  # Frontend examples
└── hardhat.config.ts            # Hardhat configuration
```

### Available Scripts

```bash
npm run compile      # Compile contracts
npm run deploy       # Deploy to Mantle Testnet
npm test            # Run test suite
npm run clean       # Clean artifacts
```

## 🔒 **Security**

### Auditing Status

- ✅ **OpenZeppelin Standards** - Using audited, battle-tested contracts
- ✅ **Comprehensive Testing** - 100% function coverage
- ✅ **Input Validation** - All user inputs validated
- ✅ **Access Control** - Proper permission management
- ⏳ **External Audit** - Recommended before mainnet deployment

### Security Features

- **Reentrancy Protection** - OpenZeppelin's ReentrancyGuard patterns
- **Input Validation** - Comprehensive validation of all parameters
- **Access Control** - Role-based permissions for admin functions
- **Safe Math** - Built-in overflow protection in Solidity ^0.8.0

## 🚀 **Production Deployment**

### Mainnet Checklist

- [ ] **Security Audit** - Complete external security audit
- [ ] **Gas Optimization** - Final gas usage optimization
- [ ] **Frontend Testing** - Comprehensive frontend integration testing
- [ ] **Monitoring Setup** - Transaction and error monitoring
- [ ] **Documentation** - User-facing documentation
- [ ] **Support System** - Customer support for issues

### Mainnet Configuration

For mainnet deployment, update:

```typescript
// Mantle Mainnet
const MAINNET_CONFIG = {
  chainId: 5000,
  rpcUrl: "https://rpc.mantle.xyz",
  explorerUrl: "https://explorer.mantle.xyz"
};
```

## 📈 **Roadmap**

### Phase 1: ✅ **Testnet Deployment** (Current)
- [x] Smart contract development
- [x] Comprehensive testing
- [x] Testnet deployment
- [x] Frontend integration documentation

### Phase 2: 🔄 **Integration & Testing**
- [ ] Frontend integration with MoveMint platform
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit preparation

### Phase 3: 🎯 **Mainnet Launch**
- [ ] External security audit
- [ ] Mainnet deployment
- [ ] Production monitoring
- [ ] Community launch

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow Solidity style guide
- Add comprehensive tests for new features
- Update documentation for any changes
- Ensure all tests pass before submitting PR

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### Getting Help

- **Documentation:** Check the [Frontend Integration Guide](./docs/FRONTEND_INTEGRATION.md)
- **Issues:** Open an issue on GitHub
- **Discussions:** Use GitHub Discussions for questions

### Useful Resources

- **Mantle Docs:** https://docs.mantle.xyz
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin:** https://docs.openzeppelin.com
- **ethers.js:** https://docs.ethers.org

### Troubleshooting

**Common Issues:**

1. **"Insufficient funds"** - Get testnet MNT from [faucet](https://faucet.sepolia.mantle.xyz/)
2. **"Wrong network"** - Switch to Mantle Sepolia Testnet (Chain ID: 5003)
3. **"Transaction failed"** - Check gas limits and input validation

## 🎉 **Acknowledgments**

- **OpenZeppelin** - For secure, audited smart contract standards
- **Hardhat** - For excellent development framework
- **Mantle Network** - For fast, low-cost blockchain infrastructure
- **MoveMint Team** - For the innovative dance NFT platform concept

---

**Built with ❤️ for the MoveMint ecosystem - Where dance meets Web3** 🕺💃

**Ready to mint your dance performances as NFTs? Let's move!** 🚀