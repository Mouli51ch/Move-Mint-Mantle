# MoveMint NFT Contract Deployment Guide

This guide provides step-by-step instructions for deploying the MoveMint NFT contract to Mantle Testnet and preparing for mainnet deployment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Testnet Deployment](#testnet-deployment)
4. [Contract Verification](#contract-verification)
5. [Testing Deployment](#testing-deployment)
6. [Mainnet Preparation](#mainnet-preparation)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 16+ and npm 8+
- **Git** for version control
- **MetaMask** or compatible Web3 wallet

### Required Accounts
- **GitHub account** for repository access
- **Wallet with testnet MNT** for deployment
- **Mantle Explorer account** (optional, for verification)

### Knowledge Requirements
- Basic understanding of blockchain and smart contracts
- Familiarity with command line interface
- Understanding of environment variables and security

---

## Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Mouli51ch/Move-Mint-Mantle.git
cd Move-Mint-Mantle

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Wallet Configuration
PRIVATE_KEY=0xYourPrivateKeyHere
RPC_URL=https://rpc.sepolia.mantle.xyz

# Optional: For contract verification
MANTLESCAN_API_KEY=your_api_key_here
```

### 3. Wallet Setup

#### Option A: Use Existing Wallet
1. Export private key from MetaMask (Account Details → Export Private Key)
2. Add `0x` prefix if not present
3. Add to `.env` file

#### Option B: Generate New Wallet
```bash
# Generate new test wallet
npx hardhat run scripts/generate-wallet.ts

# Copy the generated private key to .env
```

### 4. Get Testnet Tokens

1. Visit [Mantle Sepolia Faucet](https://faucet.sepolia.mantle.xyz/)
2. Enter your wallet address
3. Request testnet MNT tokens
4. Wait for confirmation (usually 1-2 minutes)

### 5. Verify Setup

```bash
# Test network connection
npx hardhat run scripts/test-connection.ts --network mantleTestnet

# Compile contracts
npm run compile
```

---

## Testnet Deployment

### 1. Pre-deployment Checks

```bash
# Run tests to ensure contract works
npm test

# Check wallet balance
npx hardhat run scripts/test-connection.ts --network mantleTestnet
```

Expected output:
```
✅ Network connected: Mantle Sepolia Testnet (5003)
✅ Signers found: 1
✅ Deployer address: 0x...
✅ Balance: X.X MNT
✅ Account is funded and ready for deployment!
```

### 2. Deploy Contract

```bash
# Deploy to Mantle Sepolia Testnet
npm run deploy
```

Expected output:
```
🚀 Starting MoveMint NFT deployment on Mantle Testnet...

📝 Deploying contract with account: 0x...
💰 Account balance: X.X MNT

⚙️  Deployment Configuration:
   - Royalty Receiver: 0x...
   - Royalty Fee: 5%

📦 Deploying MoveMintNFT contract...
✅ MoveMintNFT deployed successfully!
📍 Contract Address: 0x...
🔗 Explorer: https://explorer.sepolia.mantle.xyz/address/0x...

🔍 Verifying deployment...
   - Name: MoveMint Dance NFT
   - Symbol: DANCE
   - Owner: 0x...
   - Total Minted: 0

✨ Deployment complete!
```

### 3. Save Deployment Information

**Important:** Save the following information:

```json
{
  "network": "Mantle Sepolia Testnet",
  "chainId": 5003,
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentDate": "2024-12-22",
  "transactionHash": "0x...",
  "explorerUrl": "https://explorer.sepolia.mantle.xyz/address/0x..."
}
```

---

## Contract Verification

### 1. Automatic Verification (Recommended)

```bash
# Verify contract on Mantle Explorer
npx hardhat verify --network mantleTestnet <CONTRACT_ADDRESS> "<ROYALTY_RECEIVER>" 500
```

Example:
```bash
npx hardhat verify --network mantleTestnet 0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073 "0x798b32BDf86253060d598038b1D77C98C36881D6" 500
```

### 2. Manual Verification

If automatic verification fails:

1. **Visit Mantle Explorer**
   - Go to your contract address on explorer
   - Click "Contract" tab
   - Click "Verify and Publish"

2. **Enter Contract Details**
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit.a1b79de6
   - License: MIT

3. **Upload Contract Source**
   - Copy content from `contracts/MoveMintNFT.sol`
   - Include all imported contracts (flattened)

4. **Constructor Arguments**
   - Address: `<ROYALTY_RECEIVER_ADDRESS>`
   - Uint96: `500`

### 3. Verification Success

Once verified, you should see:
- ✅ Contract source code published
- ✅ Read/Write functions available
- ✅ Contract ABI accessible
- ✅ Verified checkmark on explorer

---

## Testing Deployment

### 1. Basic Contract Testing

```bash
# Test contract functionality
npx hardhat run scripts/test-contract.ts --network mantleTestnet
```

This will:
- Connect to deployed contract
- Verify contract information
- Mint a test NFT
- Confirm successful minting

### 2. Frontend Integration Testing

Create a simple test file:

```typescript
// test-frontend.ts
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_ADDRESS";
const ABI = [/* Contract ABI */];

async function testFrontendIntegration() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  // Test mint function
  const tx = await contract.mintDance(
    "Test Dance",
    "Hip Hop",
    "Test Choreographer",
    120,
    "QmTestHash"
  );

  console.log("Transaction:", tx.hash);
  const receipt = await tx.wait();
  console.log("Minted successfully!");
}
```

### 3. Verify Contract Functions

Test all major functions:

```bash
# Test individual functions
npx hardhat console --network mantleTestnet
```

In console:
```javascript
const contract = await ethers.getContractAt("MoveMintNFT", "CONTRACT_ADDRESS");
await contract.name(); // Should return "MoveMint Dance NFT"
await contract.symbol(); // Should return "DANCE"
await contract.getTotalMinted(); // Should return current count
```

---

## Mainnet Preparation

### 1. Security Audit

**Before mainnet deployment:**

- [ ] **External Security Audit**
  - Hire professional auditing firm
  - Review all contract functions
  - Test for common vulnerabilities
  - Document findings and fixes

- [ ] **Internal Security Review**
  - Code review by multiple developers
  - Static analysis with tools like Slither
  - Gas optimization review
  - Access control verification

### 2. Mainnet Configuration

Update configuration for mainnet:

```typescript
// hardhat.config.ts - Add mainnet network
networks: {
  mantleMainnet: {
    url: "https://rpc.mantle.xyz",
    chainId: 5000,
    accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
    gasPrice: 20000000000, // Adjust based on network conditions
  }
}
```

### 3. Mainnet Deployment Checklist

- [ ] **Security Preparations**
  - [ ] Complete external audit
  - [ ] Fix all identified issues
  - [ ] Multi-signature wallet setup
  - [ ] Emergency pause mechanism (if needed)

- [ ] **Technical Preparations**
  - [ ] Mainnet RPC endpoint configured
  - [ ] Sufficient MNT for deployment
  - [ ] Gas price optimization
  - [ ] Contract verification setup

- [ ] **Operational Preparations**
  - [ ] Monitoring and alerting setup
  - [ ] Incident response procedures
  - [ ] Documentation updates
  - [ ] Team coordination plan

### 4. Mainnet Deployment Process

```bash
# 1. Final testing on testnet
npm test
npm run deploy # Verify testnet still works

# 2. Deploy to mainnet
npm run deploy -- --network mantleMainnet

# 3. Verify contract
npx hardhat verify --network mantleMainnet <CONTRACT_ADDRESS> "<ROYALTY_RECEIVER>" 500

# 4. Test basic functionality
npx hardhat run scripts/test-contract.ts --network mantleMainnet
```

---

## Troubleshooting

### Common Deployment Issues

#### 1. "Insufficient funds for gas"

**Problem:** Not enough MNT tokens for deployment

**Solutions:**
- Get more testnet tokens from faucet
- Reduce gas price in hardhat.config.ts
- Check wallet balance: `npx hardhat run scripts/test-connection.ts --network mantleTestnet`

#### 2. "Invalid private key"

**Problem:** Private key format incorrect

**Solutions:**
- Ensure private key starts with `0x`
- Verify private key is 64 characters (32 bytes)
- Generate new wallet: `npx hardhat run scripts/generate-wallet.ts`

#### 3. "Network connection failed"

**Problem:** RPC endpoint not responding

**Solutions:**
- Check RPC URL in .env file
- Try alternative RPC: `https://rpc.sepolia.mantle.xyz`
- Verify internet connection
- Check if network is experiencing issues

#### 4. "Contract verification failed"

**Problem:** Explorer can't verify contract source

**Solutions:**
- Wait a few minutes after deployment
- Ensure constructor arguments match deployment
- Try manual verification on explorer
- Check compiler version matches exactly

#### 5. "Transaction failed"

**Problem:** Transaction reverted or failed

**Solutions:**
- Check gas limits are sufficient
- Verify all constructor parameters
- Ensure wallet has enough balance
- Check for network congestion

### Debug Commands

```bash
# Check network connection
npx hardhat run scripts/test-connection.ts --network mantleTestnet

# Debug environment variables
npx hardhat run scripts/debug-env.ts

# Test contract compilation
npm run compile

# Run specific test
npx hardhat test test/MoveMintNFT.test.ts

# Check gas usage
REPORT_GAS=true npm test
```

### Getting Help

1. **Check Documentation**
   - Review README.md
   - Check frontend integration guide
   - Read troubleshooting section

2. **Community Support**
   - GitHub Issues for bugs
   - GitHub Discussions for questions
   - Discord community chat

3. **Professional Support**
   - Smart contract auditing services
   - Blockchain development consultants
   - Mantle Network support channels

---

## Post-Deployment Tasks

### 1. Update Documentation

- [ ] Update README with new contract address
- [ ] Update frontend integration examples
- [ ] Create deployment announcement
- [ ] Update project status

### 2. Frontend Integration

- [ ] Update contract address in frontend
- [ ] Test all frontend functionality
- [ ] Deploy frontend updates
- [ ] Monitor for issues

### 3. Monitoring Setup

- [ ] Set up transaction monitoring
- [ ] Configure error alerting
- [ ] Monitor gas usage patterns
- [ ] Track user adoption metrics

### 4. Community Communication

- [ ] Announce deployment on social media
- [ ] Update project documentation
- [ ] Notify stakeholders and users
- [ ] Prepare user guides and tutorials

---

## Security Best Practices

### During Deployment

1. **Private Key Security**
   - Use dedicated deployment wallet
   - Never commit private keys to git
   - Use hardware wallet for mainnet
   - Rotate keys after deployment

2. **Network Security**
   - Verify RPC endpoints
   - Use HTTPS connections only
   - Monitor for unusual activity
   - Keep deployment logs secure

3. **Contract Security**
   - Verify contract source code
   - Test all functions thoroughly
   - Monitor initial transactions
   - Have emergency procedures ready

### After Deployment

1. **Ongoing Monitoring**
   - Monitor contract interactions
   - Track gas usage patterns
   - Watch for unusual transactions
   - Set up automated alerts

2. **Access Control**
   - Transfer ownership to multi-sig
   - Document all privileged functions
   - Regular access reviews
   - Emergency response procedures

---

This deployment guide ensures a secure, reliable deployment process for the MoveMint NFT contract. Follow each step carefully and don't hesitate to seek help if you encounter issues.

**Happy deploying!** 🚀