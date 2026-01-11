# Cashflow Protocol Troubleshooting Guide

## Issue: Cashflow Page Shows "0 Your Streams" and Connection Issues

### Quick Fixes

#### 1. **Connect Your Wallet**
- Click the "Connect Wallet" button
- Make sure MetaMask is installed
- Approve the connection request

#### 2. **Check Network**
- Ensure you're connected to **Mantle Sepolia Testnet**
- Network details:
  - **Chain ID**: 5003
  - **RPC URL**: https://rpc.sepolia.mantle.xyz
  - **Currency**: MNT

#### 3. **Add Mantle Sepolia to MetaMask**
If you don't see Mantle Sepolia in your networks:

1. Open MetaMask
2. Click "Add Network" or "Custom RPC"
3. Enter these details:
   - **Network Name**: Mantle Sepolia Testnet
   - **RPC URL**: https://rpc.sepolia.mantle.xyz
   - **Chain ID**: 5003
   - **Currency Symbol**: MNT
   - **Block Explorer**: https://explorer.sepolia.mantle.xyz

#### 4. **Get Testnet Funds**
You need MNT tokens to interact with the protocol:
- **Primary Faucet**: https://faucet.sepolia.mantle.xyz/
- **Backup Faucet**: https://faucets.chain.link/mantle-sepolia
- **Alternative**: https://thirdweb.com/mantle-sepolia-testnet

### Expected Behavior After Connection

Once properly connected, you should see:
- ✅ Protocol fee: 3%
- ✅ Minimum investment: 0.01 MNT
- ✅ Your streams count (initially 0 if you haven't created any)
- ✅ All tabs functional (My Streams, Create Stream, Verify Revenue, Invest)

### Creating Your First Stream

1. Go to the **"Create Stream"** tab
2. Fill in:
   - **Stream Title**: e.g., "My Dance Royalties"
   - **Projected Monthly Revenue**: e.g., "1.0" (in MNT)
   - **Duration**: e.g., "12" (months)
3. Click **"Create Cashflow Stream"**
4. Confirm the transaction in MetaMask
5. Wait for confirmation
6. Your stream will appear in the "My Streams" tab

### Testing the Integration

Use the test file: `test-contracts-integration.html`
1. Open the file in your browser
2. Connect your wallet
3. Test all contract functions
4. Verify everything works correctly

### Common Issues & Solutions

#### Issue: "Failed to initialize Web3 provider"
**Solution**: 
- Refresh the page
- Make sure MetaMask is unlocked
- Try disconnecting and reconnecting your wallet

#### Issue: "Please switch to Mantle Sepolia Testnet"
**Solution**:
- Open MetaMask
- Switch to Mantle Sepolia Testnet
- Refresh the page

#### Issue: "No streams found"
**Solution**:
- This is normal if you haven't created any streams yet
- Use the "Create Stream" tab to create your first stream

#### Issue: Transaction fails
**Solution**:
- Make sure you have enough MNT for gas fees
- Check that you're on the correct network
- Try increasing gas limit in MetaMask

### Contract Addresses (For Reference)

All contracts are deployed and verified on Mantle Sepolia:

- **SimpleCashflowProtocol**: `0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c`
- **RevenueOracle**: `0x4Ba705320F4c048BC89C8761d33e0Fbba9E659D8`
- **CashflowToken**: `0xBf994E5Ad6EDcF29F528D9d7c489e260Af6fBDC7`
- **DistributionEngine**: `0x94C32DF077BdF0053D39E70B8A4044e2403b7400`

### Debug Information

The page includes console logging. Open browser developer tools (F12) to see:
- Connection status
- Contract initialization
- Transaction details
- Error messages

Look for messages starting with:
- `🔄 [Cashflow]` - Loading states
- `✅ [Cashflow]` - Success messages
- `❌ [Cashflow]` - Error messages

### Still Having Issues?

1. **Clear browser cache** and refresh
2. **Try a different browser** (Chrome recommended)
3. **Update MetaMask** to the latest version
4. **Check console logs** for specific error messages
5. **Verify contract addresses** are correct in the .env file

### Support

If you continue having issues:
1. Check the browser console for error messages
2. Verify your wallet has MNT tokens
3. Confirm you're on Mantle Sepolia Testnet
4. Try the integration test file to isolate the issue