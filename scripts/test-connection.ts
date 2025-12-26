import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing Mantle Testnet connection...\n");

  try {
    // Test network connection
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Network connected:");
    console.log("   - Name:", network.name);
    console.log("   - Chain ID:", network.chainId.toString());
    
    // Test signers
    const signers = await ethers.getSigners();
    console.log("\n📝 Signers found:", signers.length);
    
    if (signers.length === 0) {
      console.log("❌ No signers found. Check your PRIVATE_KEY in .env file.");
      console.log("   - Make sure it starts with 0x");
      console.log("   - Make sure it's 64 characters long (32 bytes)");
      return;
    }

    const deployer = signers[0];
    console.log("   - Deployer address:", deployer.address);

    // Check balance
    const balance = await provider.getBalance(deployer.address);
    console.log("   - Balance:", ethers.formatEther(balance), "MNT");

    if (balance === 0n) {
      console.log("\n❌ Account has no MNT tokens!");
      console.log("🚰 Get testnet tokens from: https://faucet.sepolia.mantle.xyz/");
      console.log("   - Connect your wallet");
      console.log("   - Request testnet MNT tokens");
      console.log("   - Wait for confirmation");
    } else {
      console.log("\n✅ Account is funded and ready for deployment!");
    }

  } catch (error) {
    console.error("❌ Connection test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });