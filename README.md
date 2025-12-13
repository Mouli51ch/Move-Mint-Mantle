# MoveMint - Dance NFT Minting Platform

A Web3 application for minting dance performances as IP assets on Story Protocol blockchain.

## 🎯 Overview

MoveMint allows dancers and choreographers to mint their dance performances as NFTs with intellectual property protection on Story Protocol. The application provides a simplified, user-friendly interface for creating dance IP assets with proper metadata storage on IPFS.

## ✨ Features

- **Simple Minting Interface**: Clean, focused UI for dance metadata input
- **Story Protocol Integration**: Real IP asset creation on Story Protocol testnet
- **Wallet Integration**: MetaMask and Coinbase Wallet support with automatic network switching
- **IPFS Storage**: Metadata stored on IPFS via Surreal Base Universal Minting Engine
- **Error Handling**: Robust error handling with fallback solutions
- **No Mock Data**: Everything uses real blockchain integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd move-mint-frontend-ui

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
SURREAL_BASE_API_URL=https://surreal-base.vercel.app
NEXT_PUBLIC_SURREAL_BASE_API_URL=https://surreal-base.vercel.app
```

## 🎭 How to Mint a Dance NFT

1. **Connect Wallet**: Click "Connect Wallet" and connect to Story Protocol Testnet (Aeneid)
2. **Fill Details**: Enter your dance information:
   - Title (required)
   - Description
   - Dance Style (required)
   - Choreographer name
   - Duration
3. **Mint**: Click "Mint Dance NFT" and sign the transaction
4. **Get IP Asset ID**: Receive your unique IP Asset ID on Story Protocol

## 🌐 Network Configuration

- **Network**: Story Protocol Testnet (Aeneid)
- **Chain ID**: 1513
- **RPC URL**: https://aeneid.storyrpc.io
- **Explorer**: https://aeneid.storyscan.io

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Direct wallet integration (MetaMask, Coinbase Wallet)
- **UI Components**: Custom components with shadcn/ui

### Backend Integration
- **API**: RESTful API endpoints for minting preparation
- **Blockchain**: Story Protocol via Surreal Base Universal Minting Engine
- **Storage**: IPFS via Pinata for metadata storage

### Data Flow
```
User Input → /api/prepare-mint → Surreal Base → Story Protocol → IP Asset
```

## 📁 Project Structure

```
move-mint-frontend-ui/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── prepare-mint/  # Main minting endpoint
│   └── app/               # Application pages
│       └── mint/          # Minting interface
├── components/            # React components
├── lib/                   # Utilities and services
├── hooks/                 # Custom React hooks
├── scripts/               # Test and utility scripts
└── docs/                  # Documentation files
```

## 🧪 Testing

Run the test suite to verify functionality:

```bash
# Test the minting API
node scripts/test-simplified-mint.js

# Run all tests
npm test

# Build for production
npm run build
```

## 🔧 API Endpoints

### POST /api/prepare-mint
Prepares dance metadata for minting on Story Protocol.

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
  "transaction": {
    "to": "0x...",
    "data": "0x...",
    "value": "0",
    "gasEstimate": "800000"
  },
  "metadata": {
    "ipfsHash": "Qm...",
    "nftIpfsHash": "Qm..."
  }
}
```

## 🚨 Known Issues & Solutions

### Transaction Encoding Issue
Due to a known issue with Story Protocol SDK gas estimation, transaction encoding may fail. The application handles this gracefully by:

1. Detecting the issue
2. Providing clear error messages
3. Directing users to the official Surreal Base demo: https://surreal-base.vercel.app/demo

### RPC Connectivity
Story Protocol testnet RPC may experience high load. The application provides fallback solutions and clear user guidance.

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

## 📚 Documentation

- [MVP Status](./MVP_STATUS_FINAL.md) - Current project status
- [Final Solution Guide](./FINAL_MVP_SOLUTION.md) - Complete user guide
- [API Documentation](./API_DOCUMENTATION_UPDATED.md) - Detailed API specs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Story Protocol](https://storyprotocol.xyz/) for IP infrastructure
- [Surreal Base](https://surreal-base.vercel.app/) for Universal Minting Engine
- Next.js and React communities for excellent tooling

## 📞 Support

For questions or issues:
1. Check the [documentation](./docs/)
2. Review [known issues](#-known-issues--solutions)
3. Open an issue on GitHub

---

**Built with ❤️ for the dance and Web3 communities**