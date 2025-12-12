# 🎨 MoveMint - Server-Side Minting Setup Guide

## Overview

This guide will help you set up **server-side NFT minting** for your MoveMint application. With server-side minting, users don't need to:
- Install MetaMask or any wallet
- Get testnet tokens
- Configure Story Protocol network
- Sign transactions

The backend handles all blockchain interactions using a private key stored securely in environment variables.

---

## ✅ What Was Fixed

### 1. **Double `/api` Path Issue** ✓
- **Problem**: API calls were going to `/api/api/license-templates` (404 error)
- **Solution**: Removed `/api` from `NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL` in `.env`
- **Result**: API calls now work correctly

### 2. **Server-Side Minting Implementation** ✓
- Created `/api/mint-nft` endpoint that uses a private key
- Added `mintNFTServerSide()` helper function
- Integrated with viem for blockchain interactions

### 3. **Environment Variables** ✓
- Added `STORY_PROTOCOL_PRIVATE_KEY` for server-side wallet
- Added `MINTING_WALLET_ADDRESS` for reference
- Separated server-side and client-side variables

---

## 🔧 Setup Instructions

### Step 1: Get a Story Protocol Testnet Wallet

You need a wallet with IP tokens to mint NFTs. Here's how:

#### Option A: Create a New Wallet (Recommended)

1. **Generate a new wallet:**
   ```bash
   # Using cast (Foundry)
   cast wallet new

   # Or using Node.js
   node -e "const { privateKeyToAccount } = require('viem/accounts'); const account = privateKeyToAccount('0x' + require('crypto').randomBytes(32).toString('hex')); console.log('Address:', account.address); console.log('Private Key:', account.privateKey);"
   ```

   This will output:
   ```
   Address: 0x742d35Cc6634C0532925a3b8D4C9db96590e4265
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

2. **Save the private key** - You'll need it for the `.env` file

#### Option B: Use an Existing Wallet

⚠️ **SECURITY WARNING**: Only use a testnet wallet! Never use a wallet with real funds!

1. Export private key from MetaMask (Account Details → Export Private Key)
2. Copy the private key (including the `0x` prefix)

### Step 2: Get Testnet IP Tokens

Your wallet needs IP tokens to pay for gas fees on Story Protocol Testnet.

1. **Visit the Story Protocol Faucet:**
   - Go to: https://faucet.story.foundation/ (or check Story Protocol docs for current faucet)
   - Enter your wallet address from Step 1
   - Request testnet IP tokens

2. **Verify you received tokens:**
   - Check on Story Protocol Explorer: https://testnet.storyscan.xyz/
   - Search for your wallet address
   - You should see a balance of IP tokens

### Step 3: Configure Environment Variables

1. **Open `.env` file** in the project root

2. **Add your private key:**
   ```bash
   # Replace with your actual private key (with 0x prefix)
   STORY_PROTOCOL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

   # Add your wallet address for reference
   MINTING_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96590e4265
   ```

3. **Verify the fix for double `/api` is applied:**
   ```bash
   # Should NOT have /api at the end:
   NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL=http://localhost:3000
   ```

4. **Save the file**

### Step 4: Test the Configuration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the minting API status:**
   - Open: http://localhost:3000/api/mint-nft
   - You should see:
     ```json
     {
       "endpoint": "mint-nft",
       "status": "active",
       "environment": {
         "privateKeyConfigured": true,
         "contractAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590e4265",
         "rpcUrl": "https://testnet.storyrpc.io"
       }
     }
     ```

3. **If `privateKeyConfigured` is `false`:**
   - Check that you added the private key to `.env`
   - Make sure it's not the placeholder value `your_private_key_here_replace_this`
   - Restart the dev server

### Step 5: Test Minting

1. **Navigate to the mint page:**
   - Upload and analyze a dance video first
   - Go through the results page
   - Click "Mint as NFT"

2. **On the mint page:**
   - Users can optionally connect their wallet to provide a recipient address
   - Or enter a wallet address manually
   - Fill out NFT details and license configuration
   - Click "Mint NFT"

3. **The backend will:**
   - Use the private key to sign the transaction
   - Mint the NFT on Story Protocol Testnet
   - Return the transaction hash and token ID
   - No user wallet signature required!

---

## 🔐 Security Best Practices

### ⚠️ CRITICAL - Protect Your Private Key

1. **Never commit `.env` to Git:**
   - `.env` is already in `.gitignore`
   - Double-check before pushing code

2. **Use separate wallets for different environments:**
   - Development: Use a testnet wallet with minimal funds
   - Production: Use a secure production wallet

3. **Environment variable naming:**
   - Server-side keys: NO `NEXT_PUBLIC_` prefix (private)
   - Client-side values: WITH `NEXT_PUBLIC_` prefix (public)

4. **Production deployment:**
   - Use environment variable management from your hosting platform
   - Never hardcode private keys in code
   - Consider using a secrets manager (AWS Secrets Manager, Vercel Secrets, etc.)

### For Production

When deploying to production:

1. **Create a production wallet** with real IP tokens
2. **Store private key securely:**
   - Vercel: Use Environment Variables in dashboard
   - AWS: Use AWS Secrets Manager
   - Railway: Use Environment Variables
   - DO NOT commit to Git

3. **Update RPC URL** if using mainnet:
   ```bash
   NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL=https://rpc.story.foundation
   NEXT_PUBLIC_STORY_PROTOCOL_CHAIN_ID=1514  # Mainnet chain ID
   ```

---

## 📁 File Changes Summary

### Modified Files:
1. **`.env`**
   - Fixed: Removed `/api` from base URL
   - Added: `STORY_PROTOCOL_PRIVATE_KEY`
   - Added: `MINTING_WALLET_ADDRESS`

2. **`app/api/mint-nft/route.ts`**
   - Replaced mock implementation with real blockchain minting
   - Uses viem to interact with Story Protocol
   - Handles transactions with private key from environment

3. **`lib/utils/server-mint.ts`** (NEW)
   - Helper functions for server-side minting
   - `mintNFTServerSide()` - Main minting function
   - `checkMintingConfiguration()` - Verify setup

### Files to Update (Optional):
- `app/app/mint/page.tsx` - Can be simplified to use server-side API
- Remove wallet connection requirement if desired

---

## 🎯 How It Works

### Old Flow (Client-Side):
```
User → Connect Wallet → Sign Transaction → Blockchain → NFT Minted
      (needs MetaMask)  (needs tokens)
```

### New Flow (Server-Side):
```
User → Fill Form → Backend Signs → Blockchain → NFT Minted
      (no wallet)   (with server key)
```

### Architecture:
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Frontend  │         │   Backend    │         │   Story Protocol│
│   (React)   │────────▶│   API Route  │────────▶│   Blockchain    │
│             │  POST   │ /api/mint-nft│  viem   │                 │
└─────────────┘         └──────────────┘         └─────────────────┘
                              │
                              │ Uses private key
                              ▼
                        ┌──────────────┐
                        │  .env file   │
                        │ PRIVATE_KEY  │
                        └──────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Private key added to `.env`
- [ ] Wallet has testnet IP tokens
- [ ] Dev server restarted
- [ ] `/api/mint-nft` shows `privateKeyConfigured: true`
- [ ] License templates load without 404 errors
- [ ] Can mint a test NFT successfully
- [ ] Transaction appears on Story Protocol Explorer

---

## 🐛 Troubleshooting

### Error: "STORY_PROTOCOL_PRIVATE_KEY not configured"
**Solution:** Add your private key to `.env` file and restart the dev server.

### Error: "Insufficient funds in minting wallet"
**Solution:** Get testnet IP tokens from the Story Protocol faucet.

### Error: "Failed to load resource: 404 /api/api/license-templates"
**Solution:** Make sure `.env` has `NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL=http://localhost:3000` (without `/api`)

### Error: "Transaction failed"
**Solution:**
- Check wallet has enough IP tokens for gas
- Verify contract address is correct
- Check Story Protocol Testnet is operational

### Error: "Invalid private key format"
**Solution:** Ensure private key starts with `0x` and is 64 hex characters long.

---

## 📚 Additional Resources

- **Story Protocol Docs**: https://docs.story.foundation/
- **Story Protocol Testnet Explorer**: https://testnet.storyscan.xyz/
- **Viem Documentation**: https://viem.sh/
- **ERC-721 Standard**: https://eips.ethereum.org/EIPS/eip-721

---

## ✨ Benefits of Server-Side Minting

1. **Better UX**: Users don't need wallets or tokens
2. **Faster**: No wallet popups or user confirmations
3. **Consistent**: All mints use same gas settings
4. **Controlled**: You manage the minting process
5. **Cheaper for users**: No gas fees for users

---

## 🚀 Next Steps

1. **Test the minting flow** with a sample video
2. **Customize the mint page** to remove wallet connection UI if desired
3. **Add IPFS integration** for proper metadata storage (currently using data URIs)
4. **Implement proper token ID extraction** from transaction logs
5. **Add database** to track minted NFTs
6. **Consider adding a pricing model** for minting

---

**Need help?** Check the code comments in:
- `app/api/mint-nft/route.ts` - Server-side minting logic
- `lib/utils/server-mint.ts` - Helper functions
- `.env` - Environment configuration

Happy minting! 🎨✨
