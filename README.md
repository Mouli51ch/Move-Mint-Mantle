# MoveMint - Dance NFT Minting Platform

🕺💃 **Complete Web3 application for minting dance performances as NFTs on Mantle Network.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Mantle](https://img.shields.io/badge/Mantle-Testnet-green)](https://mantle.xyz/)

## 🚀 **Live Application**

- **Contract:** `0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073`
- **Network:** Mantle Sepolia Testnet (Chain ID: 5003)
- **Explorer:** [View on Mantle Explorer](https://explorer.sepolia.mantle.xyz/address/0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073)

## 🎯 Overview

MoveMint is a complete Web3 application that allows dancers and choreographers to mint their dance performances as NFTs on Mantle Network. The application provides a user-friendly interface for creating dance NFTs with proper metadata storage and blockchain integration.

## ✨ Features

### Frontend Application
- **Simple Minting Interface**: Clean, focused UI for dance metadata input
- **Mantle Network Integration**: Fast and affordable NFT creation on Mantle Sepolia Testnet
- **Wallet Integration**: MetaMask support with automatic network switching
- **Real-time Movement Detection**: TensorFlow.js integration for dance analysis
- **IPFS Storage**: Metadata stored on IPFS for decentralized access
- **Error Handling**: Robust error handling with clear user feedback
- **Real Blockchain Integration**: Direct contract interaction using ethers.js

### Smart Contract Features
- ✅ **ERC721** standard with enumeration and URI storage
- ✅ **ERC2981** royalty support (5% default, customizable per token)
- ✅ **Decentralized minting** - users mint their own NFTs
- ✅ **Rich metadata** - title, dance style, choreographer, duration, IPFS hash
- ✅ **Creator tracking** - query all tokens by creator address
- ✅ **IPFS integration** - automatic tokenURI resolution to IPFS

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
NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS=0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
```

## 🎭 How to Mint a Dance NFT

1. **Connect Wallet**: Click "Connect Wallet" and connect to Mantle Sepolia Testnet
2. **Fill Details**: Enter your dance information:
   - Title (required)
   - Description
   - Dance Style (required)
   - Choreographer name
   - Duration
3. **Mint**: Click "Mint Dance NFT" and sign the transaction
4. **Get Token ID**: Receive your unique NFT Token ID on Mantle

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

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Direct wallet integration (MetaMask)
- **UI Components**: Custom components with shadcn/ui
- **Movement Detection**: TensorFlow.js for dance analysis

### Smart Contract
```
MoveMintNFT Contract
├── ERC721 (Base NFT functionality)
├── ERC721Enumerable (Token enumeration)
├── ERC721URIStorage (Individual token URIs)
├── ERC2981 (Royalty standard)
└── Ownable (Access control)
```

### Core Functions

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

### Data Flow
```
User Input → /api/mint-nft → IPFS → Mantle Contract → NFT Token
```

## 📁 Project Structure

```
Move-Mint-Mantle/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── mint-nft/      # Main minting endpoint
│   └── app/               # Application pages
│       └── mint/          # Minting interface
├── components/            # React components
├── lib/                   # Utilities and services
├── contracts/             # Smart contracts
├── scripts/               # Deployment and utility scripts
├── test/                  # Contract tests
└── docs/                  # Documentation files
```

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm test

# Build for production
npm run build
```

### Contract Testing
```bash
# Compile contracts
npm run compile

# Run contract tests
npx hardhat test

# Test contract interaction
npx hardhat run scripts/test-contract.ts --network mantleTestnet
```

## 🔧 API Endpoints

### POST /api/mint-nft
Prepares dance metadata for minting on Mantle Network.

**Request:**
```json
{
  "userAddress": "0x...",
  "title": "My Dance",
  "description": "A beautiful dance performance",
  "danceStyle": "Hip Hop",
  "choreographer": "Artist Name",
  "duration": "2:30"
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
  "contractAddress": "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073"
}
```

## 📱 Frontend Integration

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

## 📊 Contract Specifications

| Feature | Details |
|---------|---------|
| **Standard** | ERC721 + ERC2981 + Enumerable + URI Storage |
| **Compiler** | Solidity ^0.8.20 |
| **Optimization** | 200 runs |
| **Gas Cost** | ~150,000-200,000 gas per mint |
| **Royalty** | 5% default (customizable) |
| **Max Supply** | Unlimited |

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

---

**Built with ❤️ for the dance and Web3 communities - Where dance meets blockchain** 🕺💃

**Ready to mint your dance performances as NFTs? Let's move!** 🚀