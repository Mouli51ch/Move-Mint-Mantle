# Cashflow Protocol Deployment Guide

## Current Status

### ✅ Deployed Contracts
- **SimpleCashflowProtocol**: `0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c`
  - Protocol fee: 3%
  - Minimum investment: 0.01 MNT
  - Status: ✅ Live and functional

### ❌ Pending Deployment
- **RevenueOracle**: Revenue verification system
- **CashflowToken**: ERC-20 dividend token template
- **DistributionEngine**: Automated payment distribution

## Issue: Insufficient Testnet Funds

**Current Balance**: 0.9 MNT  
**Required**: ~2.5 MNT for all contracts  
**Shortfall**: ~1.6 MNT

## Get More Testnet Funds

### 1. Official Mantle Sepolia Faucet (Primary)
🔗 **URL**: https://faucet.sepolia.mantle.xyz/
- **Amount**: Variable (usually 0.1-1 MNT)
- **Cooldown**: 4 hours if balance > 1,000 MNT
- **Requirements**: Connect wallet

### 2. Chainlink Faucet (Backup)
🔗 **URL**: https://faucets.chain.link/mantle-sepolia
- **Amount**: Variable
- **Requirements**: Social verification

### 3. ThirdWeb Faucet (Alternative)
🔗 **URL**: https://thirdweb.com/mantle-sepolia-testnet
- **Amount**: 0.01 MNT per request
- **Cooldown**: 24 hours

## Deployment Steps (After Getting Funds)

### Step 1: Deploy Remaining Contracts
```bash
cd Mantle
npx hardhat run scripts/deploy-step-by-step.ts --network mantleTestnet
```

### Step 2: Update Environment Variables
The deployment script will output the new addresses. Update `.env`:
```env
NEXT_PUBLIC_REVENUE_ORACLE_ADDRESS=<new_address>
NEXT_PUBLIC_CASHFLOW_TOKEN_ADDRESS=<new_address>
NEXT_PUBLIC_DISTRIBUTION_ENGINE_ADDRESS=<new_address>
```

### Step 3: Verify Integration
```bash
cd Move-Mint-
npm run build
npm run dev
```

## Expected Contract Addresses (After Deployment)

```
SimpleCashflowProtocol: 0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c (✅ Deployed)
RevenueOracle:          0x[NEW_ADDRESS] (❌ Pending)
CashflowToken:          0x[NEW_ADDRESS] (❌ Pending)  
DistributionEngine:     0x[NEW_ADDRESS] (❌ Pending)
```

## Frontend Integration Status

### ✅ Completed Features
- Cashflow stream registration during NFT minting
- Basic protocol interaction (SimpleCashflowProtocol)
- Revenue projection calculations
- Educational content and UI

### 🔄 Pending Full Integration
- Revenue oracle verification system
- Automated dividend distribution
- Real cashflow token creation per stream
- Distribution engine automation

### ✅ Marketplace Features
- Real NFT data from blockchain
- Newly minted NFTs appear automatically (30s refresh)
- Manual refresh button
- Buy functionality (demo mode)

## Post-Deployment Checklist

### 1. Contract Verification
- [ ] RevenueOracle supports all platforms
- [ ] CashflowToken dividend system works
- [ ] DistributionEngine permissions set correctly
- [ ] All contracts can interact with each other

### 2. Frontend Integration
- [ ] Update contract addresses in `.env`
- [ ] Test cashflow stream creation
- [ ] Verify revenue oracle integration
- [ ] Test dividend distribution
- [ ] Confirm marketplace shows new NFTs

### 3. End-to-End Testing
- [ ] Mint NFT with cashflow stream
- [ ] Verify stream appears in protocol
- [ ] Test investment functionality
- [ ] Confirm NFT appears in marketplace
- [ ] Test revenue verification (manual)
- [ ] Test dividend distribution

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NFT Minting   │───▶│ Cashflow Stream  │───▶│   Marketplace   │
│      Page       │    │   Registration   │    │     Display     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Revenue Oracle  │◀───│ SimpleCashflow   │───▶│ Distribution    │
│  Verification   │    │    Protocol      │    │     Engine      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Cashflow Token   │
                       │   (Per Stream)   │
                       └──────────────────┘
```

## Gas Estimates

| Contract | Estimated Gas | MNT Cost |
|----------|---------------|----------|
| RevenueOracle | ~800,000 | ~0.8 MNT |
| CashflowToken | ~600,000 | ~0.6 MNT |
| DistributionEngine | ~700,000 | ~0.7 MNT |
| Setup & Permissions | ~200,000 | ~0.2 MNT |
| **Total** | **~2.3M** | **~2.3 MNT** |

## Troubleshooting

### Deployment Fails
- Check wallet balance: `npx hardhat run scripts/check-balance.ts --network mantleTestnet`
- Verify network connection: Test with simple contract call
- Reduce gas limit if needed

### Frontend Issues
- Clear browser cache and restart dev server
- Check console for contract address errors
- Verify environment variables are loaded

### Contract Interaction Issues
- Confirm wallet is connected to Mantle Sepolia
- Check contract addresses in `.env`
- Verify ABI matches deployed contracts

## Next Steps After Deployment

1. **Test Complete Flow**: Mint → Register Stream → Invest → Distribute
2. **Add Revenue Verification**: Integrate with real platforms
3. **Enhance UI**: Add more detailed cashflow analytics
4. **Security Audit**: Review contracts before mainnet
5. **Documentation**: Create user guides and API docs

---

**Status**: Waiting for testnet funds to complete deployment  
**Last Updated**: January 11, 2026  
**Contact**: Ready to deploy once funds are available