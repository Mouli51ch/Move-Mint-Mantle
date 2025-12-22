import { ethers } from "ethers";

async function main() {
  console.log("🔐 Generating new test wallet for Mantle Testnet...\n");

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("✅ New wallet generated:");
  console.log("   - Address:", wallet.address);
  console.log("   - Private Key:", wallet.privateKey);
  console.log("\n📋 Next steps:");
  console.log("1. Update your .env file with this private key:");
  console.log(`   PRIVATE_KEY=${wallet.privateKey}`);
  console.log("\n2. Fund this wallet with testnet MNT:");
  console.log("   - Visit: https://faucet.sepolia.mantle.xyz/");
  console.log("   - Connect wallet or enter address:", wallet.address);
  console.log("   - Request testnet tokens");
  console.log("\n3. Try deploying again with: npm run deploy");
  
  console.log("\n⚠️  SECURITY WARNING:");
  console.log("   - This is for TESTNET ONLY");
  console.log("   - Never use this private key on mainnet");
  console.log("   - Never share your private key with anyone");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Wallet generation failed:", error);
    process.exit(1);
  });