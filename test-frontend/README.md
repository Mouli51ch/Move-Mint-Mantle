# MoveMint NFT Test Frontend

A minimal Next.js frontend for testing the MoveMintNFT smart contract on Mantle Testnet.

## Setup

1. **Install dependencies:**
   ```bash
   cd test-frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   The contract address is already configured, but you can update it if needed.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:3000`

## 🔒 Security Note

**NO PRIVATE KEYS IN FRONTEND!** ✅
- Users connect their own MetaMask wallets
- MetaMask handles all private key operations
- Transactions are signed by the user's wallet
- Frontend only contains public configuration

## Features

✅ **Wallet Connection**
- Connect/disconnect MetaMask wallet
- Display connected address

✅ **Network Management**
- Detect current network
- Auto-switch to Mantle Testnet (Chain ID: 5001)
- Warning when on wrong network

✅ **Contract Interaction**
- Mint dance NFTs with metadata
- Form validation
- Transaction status updates

✅ **UI State Management**
- Loading states
- Error handling
- Form validation
- Button disable logic

## Usage

1. Make sure MetaMask is installed
2. Connect your wallet
3. Switch to Mantle Testnet if prompted
4. Fill in the dance metadata:
   - **Title**: Name of the dance performance
   - **Dance Style**: Genre (e.g., Ballet, Hip-Hop)
   - **Choreographer**: Creator's name
   - **Duration**: Length in seconds
   - **IPFS Hash**: Metadata hash (e.g., QmXxx...)
5. Click "Mint Dance NFT"

## Requirements

- MetaMask browser extension
- MNT tokens on Mantle Testnet (get from [faucet](https://faucet.testnet.mantle.xyz/))
- Deployed MoveMintNFT contract address

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Web3**: ethers.js v6
- **Wallet**: MetaMask (window.ethereum)
- **Network**: Mantle Testnet (Chain ID: 5001)
- **Styling**: Inline CSS (minimal)

## Contract ABI

The frontend includes only the necessary ABI functions:
- `mintDance(string,string,string,uint256,string)`
- `getTotalMinted()`

## Network Configuration

```javascript
const MANTLE_TESTNET = {
  chainId: '0x1389', // 5001 in hex
  chainName: 'Mantle Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.mantle.xyz'],
}
```

## Troubleshooting

**"Contract address not set"**
- Update `CONTRACT_ADDRESS` in `app/page.tsx`

**"Wrong network"**
- Click "Switch Network" button
- Or manually add Mantle Testnet to MetaMask

**"Transaction failed"**
- Check you have enough MNT tokens
- Verify all form fields are filled
- Check contract address is correct

**"MetaMask not detected"**
- Install MetaMask browser extension
- Refresh the page