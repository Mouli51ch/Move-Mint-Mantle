# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

### 🔗 **Blockchain Configuration**
```
NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS=0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
```

### 💰 **Cashflow Protocol Contracts**
```
NEXT_PUBLIC_CASHFLOW_PROTOCOL_ADDRESS=0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c
NEXT_PUBLIC_REVENUE_ORACLE_ADDRESS=0x4Ba705320F4c048BC89C8761d33e0Fbba9E659D8
NEXT_PUBLIC_DISTRIBUTION_ENGINE_ADDRESS=0x94C32DF077BdF0053D39E70B8A4044e2403b7400
NEXT_PUBLIC_CASHFLOW_TOKEN_ADDRESS=0xBf994E5Ad6EDcF29F528D9d7c489e260Af6fBDC7
```

### ⚙️ **Application Configuration**
```
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_ENABLE_VIDEO_PROCESSING=true
NEXT_PUBLIC_ENABLE_NFT_MINTING=true
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=3
NEXT_PUBLIC_UPLOAD_CHUNK_SIZE=1048576
```

### 📁 **IPFS Configuration (Pinata)**
```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5MjdhZmEyMC0xN2E1LTRlMWYtOGE5YS03ZmZmYjEzNzAyZmMiLCJlbWFpbCI6ImNoYWtyYWJvcnR5bW91bGkxOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNzg1MThiMTk3OWRkODA1OGFhYzciLCJzY29wZWRLZXlTZWNyZXQiOiJjNjAwYzA1MDI1ODJlZmNmNTc2M2MzMDE4Y2ZkOTYyYWNmMjc2OGI5MDcxMjhhNDA4ZmI4MzU1ZjEwYzJmMzI3IiwiZXhwIjoxNzk4NDUzMjI1fQ.C-mAmlErj8GQKmZTfecklgHLoJgSIfghGp_KwkJEGLU
PINATA_API_KEY=78518b1979dd8058aac7
PINATA_SECRET_KEY=c600c0502582efcf5763c3018cfd962acf2768b907128a408fb8355f10c2f327
```

## 📋 **How to Add Environment Variables in Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: "Move-Mint-Mantle"
3. **Go to Settings**: Click "Settings" tab
4. **Environment Variables**: Click "Environment Variables" in sidebar
5. **Add each variable**:
   - Name: `NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS`
   - Value: `0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073`
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"
6. **Repeat for all variables** listed above

## 🚀 **After Adding Environment Variables**

1. **Redeploy**: Go to "Deployments" tab and click "Redeploy"
2. **Or trigger new deployment**: Make a small commit and push to trigger automatic deployment

## ✅ **Verification**

Once deployed successfully, your application will have:
- 🎯 **NFT Minting**: Working with real Mantle Sepolia contracts
- 💰 **Cashflow Protocol**: Complete tokenization system
- 🏪 **Marketplace**: Real-time NFT display
- 🔗 **Wallet Integration**: MetaMask support
- 📊 **Dashboard**: Cashflow management interface

## 🔍 **Environment Variables Summary**

| Category | Count | Purpose |
|----------|-------|---------|
| Blockchain | 3 | Contract addresses and network config |
| Cashflow Protocol | 4 | Smart contract addresses |
| Application | 7 | App configuration and features |
| IPFS/Pinata | 3 | File storage and metadata |
| **Total** | **17** | **Complete application configuration** |

---

**Next Step**: Add these environment variables in Vercel Dashboard, then redeploy! 🚀