# MoveMint - Dance NFT & Cashflow Tokenization Platform

🕺💃 **Complete Web3 application for minting dance performances as NFTs and tokenizing future royalties on Mantle Network.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Mantle](https://img.shields.io/badge/Mantle-Testnet-green)](https://mantle.xyz/)

## 🚀 **Live Application**

- **NFT Contract:** `0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073`
- **Cashflow Protocol:** `0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c`
- **Network:** Mantle Sepolia Testnet (Chain ID: 5003)
- **Explorer:** [View on Mantle Explorer](https://explorer.sepolia.mantle.xyz/address/0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073)

## 🎯 Overview

MoveMint is a revolutionary Web3 platform that combines NFT minting with cashflow tokenization. Dancers and choreographers can mint their performances as NFTs and tokenize their future royalty streams for immediate liquidity. Built on Mantle Network for fast, affordable transactions.

## ✨ Core Features

### 🎭 **NFT Minting Platform**
- **Dance Performance NFTs**: Mint dance videos, choreographies, and performances
- **Rich Metadata**: Title, style, choreographer, duration, and IPFS storage
- **Real-time Analysis**: TensorFlow.js integration for movement detection
- **Instant Minting**: Direct wallet integration with MetaMask
- **Marketplace**: Browse, buy, and trade dance NFTs with real-time updates

### 💰 **Cashflow Protocol (Revolutionary)**
- **Stream Tokenization**: Convert future royalty payments into tradeable tokens
- **Investment Platform**: Investors can buy shares in future revenue streams
- **Revenue Verification**: Multi-platform verification (Spotify, YouTube, TikTok, Instagram)
- **Automated Distribution**: Smart contract-based revenue distribution
- **Yield Generation**: Earn returns from successful dance performances

### 🏪 **Enhanced Marketplace**
- **Real-time Updates**: Auto-refresh every 15 seconds for new listings
- **Cashflow Indicators**: Visual badges showing active revenue streams
- **Cross-tab Sync**: Detects new mints across browser tabs
- **Buy Functionality**: Direct NFT purchasing with MNT tokens
- **Stream Integration**: See which NFTs have active cashflow streams

### 📊 **Comprehensive Dashboard**
- **Portfolio Management**: Track your NFTs and cashflow streams
- **Revenue Analytics**: Monitor performance and earnings
- **Investment Tracking**: View your investments in other creators' streams
- **Real-time Data**: Live blockchain data integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Testnet MNT tokens from [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mouli51ch/Move-Mint-Mantle.git
cd Move-Mint-Mantle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Blockchain Configuration
NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS=0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz

# Cashflow Protocol Contracts
NEXT_PUBLIC_CASHFLOW_PROTOCOL_ADDRESS=0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c
NEXT_PUBLIC_REVENUE_ORACLE_ADDRESS=0x4Ba705320F4c048BC89C8761d33e0Fbba9E659D8
NEXT_PUBLIC_DISTRIBUTION_ENGINE_ADDRESS=0x94C32DF077BdF0053D39E70B8A4044e2403b7400
NEXT_PUBLIC_CASHFLOW_TOKEN_ADDRESS=0xBf994E5Ad6EDcF29F528D9d7c489e260Af6fBDC7

# IPFS Configuration (Pinata)
PINATA_JWT=your_pinata_jwt_token
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

## 🎭 Complete User Journey

### 1. **Mint a Dance NFT**
1. **Connect Wallet**: Connect to Mantle Sepolia Testnet
2. **Upload Video**: Record or upload your dance performance
3. **Add Metadata**: Title, description, dance style, choreographer
4. **Optional Cashflow**: Create a revenue stream for future royalties
5. **Mint**: Sign transaction and receive your NFT

### 2. **Create Cashflow Stream**
1. **Access Dashboard**: Go to `/app/cashflow`
2. **Register Stream**: Set projected monthly revenue and duration
3. **Verify Revenue**: Submit revenue data from platforms (Spotify, YouTube, etc.)
4. **Tokenize**: Convert stream into tradeable tokens
5. **Earn**: Receive immediate liquidity from future royalties

### 3. **Invest in Streams**
1. **Browse Streams**: View available tokenized revenue streams
2. **Analyze Performance**: Check historical data and projections
3. **Invest**: Purchase stream tokens with MNT
4. **Earn Yield**: Receive proportional revenue distributions

### 4. **Trade in Marketplace**
1. **Browse NFTs**: View all minted dance performances
2. **Filter by Streams**: Find NFTs with active cashflow streams
3. **Purchase**: Buy NFTs directly with MNT tokens
4. **Real-time Updates**: See new listings automatically

## 🌐 Network Configuration

- **Network**: Mantle Sepolia Testnet
- **Chain ID**: 5003
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Explorer**: https://explorer.sepolia.mantle.xyz
- **Contract**: 0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073

### Add to MetaMask

```
Network Name: Mantle Sepolia Testnet
RPC URL: https://rpc.sepolia.mantle.xyz
Chain ID: 5003
Currency Symbol: MNT
Block Explorer: https://explorer.sepolia.mantle.xyz
```

## 🏗️ Architecture

### Smart Contract Ecosystem

```
MoveMint Protocol Suite
├── MoveMintNFT (0x2CD0f925...)
│   ├── ERC721 (Base NFT functionality)
│   ├── ERC721Enumerable (Token enumeration)
│   ├── ERC721URIStorage (Individual token URIs)
│   ├── ERC2981 (Royalty standard)
│   └── Ownable (Access control)
│
├── SimpleCashflowProtocol (0x54Fb33115...)
│   ├── Stream Registration
│   ├── Investment Management
│   ├── Tokenization Logic
│   └── Fee Distribution
│
├── RevenueOracle (0x4Ba705320...)
│   ├── Multi-platform Verification
│   ├── Data Validation
│   ├── Reputation System
│   └── Dispute Resolution
│
├── DistributionEngine (0x94C32DF077...)
│   ├── Automated Payouts
│   ├── Fee Calculations
│   ├── Batch Processing
│   └── Gas Optimization
│
└── CashflowToken (0xBf994E5Ad...)
    ├── ERC20 Dividend Token
    ├── Yield Distribution
    ├── Claim Mechanisms
    └── Governance Rights
```

### Frontend Architecture
- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Web3**: Ethers.js v6 for blockchain interaction
- **State Management**: React hooks with context
- **Real-time Updates**: Auto-refresh and cross-tab sync
- **Movement Detection**: TensorFlow.js integration

### Core Contract Functions

#### NFT Minting
```solidity
function mintDance(
    string memory title,
    string memory danceStyle,
    string memory choreographer,
    uint256 duration,
    string memory ipfsMetadataHash
) public returns (uint256)
```

#### Cashflow Stream Management
```solidity
function registerStream(
    string memory title,
    uint256 projectedMonthlyRevenue,
    uint256 durationMonths
) external returns (uint256)

function investInStream(uint256 streamId) 
    external payable

function verifyRevenue(
    uint256 streamId,
    uint256 period,
    uint256 verifiedAmount,
    bytes32 proofHash
) external
```

### Data Flow
```
User Input → API Processing → IPFS Storage → Smart Contracts → NFT/Tokens
     ↓
Revenue Verification → Oracle → Distribution Engine → Yield Payments
```

## 📁 Project Structure

```
Move-Mint-Mantle/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── mint-nft/      # NFT minting endpoint
│   │   ├── cashflow/      # Cashflow protocol API
│   │   ├── nfts/          # NFT marketplace API
│   │   └── blockchain/    # Blockchain data APIs
│   ├── app/               # Application pages
│   │   ├── mint/          # NFT minting interface
│   │   ├── cashflow/      # Cashflow dashboard
│   │   ├── dashboard/     # User portfolio
│   │   └── results/       # Minting results
│   └── marketplace/       # NFT marketplace
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── navbar.tsx        # Navigation
│   └── footer.tsx        # Footer
├── lib/                   # Utilities and services
│   ├── services/         # Business logic
│   │   ├── cashflow-protocol.ts
│   │   ├── marketplace.ts
│   │   └── blockchain-data.ts
│   ├── web3/             # Web3 configuration
│   └── utils/            # Helper functions
├── contracts/             # Smart contracts
│   ├── MoveMintNFT.sol
│   ├── SimpleCashflowProtocol.sol
│   ├── RevenueOracle.sol
│   ├── DistributionEngine.sol
│   └── CashflowToken.sol
├── scripts/               # Deployment scripts
├── test/                  # Contract tests
└── docs/                  # Documentation
```

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm test

# Build for production
npm run build

# Test specific components
npm test -- --testPathPattern=cashflow
```

### Contract Testing
```bash
# Compile contracts
npm run compile

# Run contract tests
npx hardhat test

# Test cashflow protocol
npx hardhat test test/CashflowProtocol.test.ts

# Deploy to testnet
npx hardhat run scripts/deploy-step-by-step.ts --network mantleTestnet
```

### Integration Testing
```bash
# Test complete minting flow
open test-mint-flow.html

# Test cashflow integration
open test-contracts-integration.html
```

## 🔧 API Endpoints

### NFT Minting
#### POST /api/mint-nft
Prepares dance metadata for minting on Mantle Network.

**Request:**
```json
{
  "userAddress": "0x...",
  "title": "My Dance",
  "description": "A beautiful dance performance",
  "danceStyle": "Hip Hop",
  "choreographer": "Artist Name",
  "duration": "2:30",
  "createCashflowStream": true,
  "projectedMonthlyRevenue": "100"
}
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "name": "My Dance",
    "description": "A beautiful dance performance",
    "ipfsHash": "Qm...",
    "dance_data": {
      "style": "Hip Hop",
      "choreographer": "Artist Name",
      "duration": "2:30"
    }
  },
  "contractAddress": "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073",
  "cashflowStreamId": 123
}
```

### Cashflow Protocol
#### GET/POST /api/cashflow
Comprehensive cashflow protocol management.

**Supported Operations:**
- `getProtocolInfo` - Get protocol statistics
- `registerStream` - Create new revenue stream
- `investInStream` - Invest in existing stream
- `verifyRevenue` - Submit revenue verification
- `getStreamInfo` - Get stream details
- `calculateDistribution` - Calculate revenue distribution

### Marketplace
#### GET /api/nfts
Retrieve all minted NFTs with real-time data.

**Response:**
```json
{
  "nfts": [
    {
      "tokenId": "1",
      "title": "Urban Flow",
      "creator": "0x...",
      "price": "0.1",
      "hasCashflowStream": true,
      "streamActive": true,
      "metadata": {...}
    }
  ],
  "total": 150,
  "hasGaps": false
}
```

## 📱 Frontend Integration

### NFT Minting Integration

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

### Cashflow Protocol Integration

```typescript
import { cashflowProtocolService } from '@/lib/services/cashflow-protocol';

// Initialize the service
await cashflowProtocolService.initialize();

// Register a new revenue stream
const result = await cashflowProtocolService.registerStream({
  title: "My Dance Royalties",
  projectedMonthlyRevenue: "100", // in MNT
  durationMonths: 12
});

// Invest in a stream
const investment = await cashflowProtocolService.investInStream({
  streamId: 1,
  amount: "10" // in MNT
});

// Verify revenue
const verification = await cashflowProtocolService.verifyRevenue({
  streamId: 1,
  period: 1,
  verifiedAmount: "50",
  proofHash: "0x...",
  sourceData: [{
    platform: "Spotify",
    accountId: "artist123",
    amount: "50",
    dataHash: "0x...",
    timestamp: Date.now()
  }]
});
```

### Marketplace Integration

```typescript
// Fetch all NFTs with real-time updates
const response = await fetch('/api/nfts');
const { nfts } = await response.json();

// Filter NFTs with cashflow streams
const streamNFTs = nfts.filter(nft => nft.hasCashflowStream);

// Buy an NFT
const buyTx = await marketplaceContract.buyNFT(tokenId, {
  value: ethers.parseEther(price)
});
```

## 📊 Contract Specifications

### NFT Contract (MoveMintNFT)
| Feature | Details |
|---------|---------|
| **Standard** | ERC721 + ERC2981 + Enumerable + URI Storage |
| **Address** | `0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073` |
| **Compiler** | Solidity ^0.8.20 |
| **Gas Cost** | ~150,000-200,000 gas per mint |
| **Royalty** | 5% default (customizable) |
| **Max Supply** | Unlimited |

### Cashflow Protocol Suite
| Contract | Address | Purpose |
|----------|---------|---------|
| **SimpleCashflowProtocol** | `0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c` | Stream management & investment |
| **RevenueOracle** | `0x4Ba705320F4c048BC89C8761d33e0Fbba9E659D8` | Revenue verification |
| **DistributionEngine** | `0x94C32DF077BdF0053D39E70B8A4044e2403b7400` | Automated payouts |
| **CashflowToken** | `0xBf994E5Ad6EDcF29F528D9d7c489e260Af6fBDC7` | Dividend tokens |

### Protocol Features
- **Protocol Fee**: 3% on all transactions
- **Minimum Investment**: 0.01 MNT
- **Supported Platforms**: Spotify, YouTube, TikTok, Instagram, Licensing
- **Revenue Verification**: Cryptographic proof system
- **Distribution**: Automated monthly payouts

### Metadata Structure

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

interface CashflowStream {
  creator: address;        // Stream creator
  title: string;          // "My Dance Royalties"
  projectedMonthlyRevenue: uint256; // Expected monthly income
  durationMonths: uint256; // Stream duration
  tokenAddress: address;   // Associated token contract
  totalInvestment: uint256; // Total invested amount
  isActive: boolean;       // Stream status
  isTokenized: boolean;    // Tokenization status
}
```

## 🛠️ Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes
3. Test thoroughly: `npm test && npm run build`
4. Submit pull request

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 🔒 Security

### Security Features
- **Reentrancy Protection** - OpenZeppelin's ReentrancyGuard patterns
- **Input Validation** - Comprehensive validation of all parameters
- **Access Control** - Role-based permissions for admin functions
- **Safe Math** - Built-in overflow protection in Solidity ^0.8.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- **Issues:** Open an issue on GitHub
- **Documentation:** Check the docs/ directory
- **Discussions:** Use GitHub Discussions for questions

### Troubleshooting

**Common Issues:**

1. **"Insufficient funds"** - Get testnet MNT from [faucet](https://faucet.sepolia.mantle.xyz/)
2. **"Wrong network"** - Switch to Mantle Sepolia Testnet (Chain ID: 5003)
3. **"Transaction failed"** - Check gas limits and input validation

## 🎉 Acknowledgments

- **OpenZeppelin** - For secure, audited smart contract standards
- **Mantle Network** - For fast, low-cost blockchain infrastructure  
- **Next.js & React** - For excellent frontend framework
- **TensorFlow.js** - For movement detection capabilities
- **Pinata** - For reliable IPFS storage and metadata hosting
- **Ethers.js** - For seamless Web3 integration

---

**Built with ❤️ for the dance and Web3 communities - Where dance meets DeFi** 🕺💃

**Ready to mint your dance performances and tokenize your future royalties? Let's move!** 🚀

## 🌟 **What Makes MoveMint Special**

- **First-of-its-kind** cashflow tokenization for creative content
- **Real revenue streams** from actual platform earnings
- **Immediate liquidity** for future royalty payments  
- **Community-driven** investment in creative talent
- **Built on Mantle** for fast, affordable transactions
- **Complete transparency** with on-chain verification