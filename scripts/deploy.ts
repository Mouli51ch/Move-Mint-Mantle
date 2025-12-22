import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting MoveMint NFT deployment on Mantle Testnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contract with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MNT\n");

  if (balance === 0n) {
    console.error("❌ Error: Deployer account has no MNT tokens!");
    console.log("Please fund your account at: https://faucet.testnet.mantle.xyz/");
    process.exit(1);
  }

  // Deployment parameters
  const royaltyReceiver = deployer.address; // Default to deployer, can be changed
  const royaltyFeeNumerator = 500; // 5% royalty (500 basis points)

  console.log("⚙️  Deployment Configuration:");
  console.log("   - Royalty Receiver:", royaltyReceiver);
  console.log("   - Royalty Fee:", royaltyFeeNumerator / 100, "%\n");

  // Deploy contract
  console.log("📦 Deploying MoveMintNFT contract...");
  const MoveMintNFT = await ethers.getContractFactory("MoveMintNFT");
  const moveMintNFT = await MoveMintNFT.deploy(royaltyReceiver, royaltyFeeNumerator);

  await moveMintNFT.waitForDeployment();
  const contractAddress = await moveMintNFT.getAddress();

  console.log("✅ MoveMintNFT deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Explorer:", `https://explorer.testnet.mantle.xyz/address/${contractAddress}\n`);

  // Verify contract details
  console.log("🔍 Verifying deployment...");
  const name = await moveMintNFT.name();
  const symbol = await moveMintNFT.symbol();
  const owner = await moveMintNFT.owner();

  console.log("   - Name:", name);
  console.log("   - Symbol:", symbol);
  console.log("   - Owner:", owner);
  console.log("   - Total Minted:", (await moveMintNFT.getTotalMinted()).toString());

  console.log("\n✨ Deployment complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Save the contract address for frontend integration");
  console.log("2. Verify contract on explorer (optional):");
  console.log(`   npx hardhat verify --network mantleTestnet ${contractAddress} "${royaltyReceiver}" ${royaltyFeeNumerator}`);
  console.log("3. Update your frontend with the new contract address and ABI");
  console.log("4. Test minting a dance NFT from your frontend\n");

  // Save deployment info
  const deploymentInfo = {
    network: "Mantle Testnet",
    chainId: 5001,
    contractAddress: contractAddress,
    deployer: deployer.address,
    royaltyReceiver: royaltyReceiver,
    royaltyFee: `${royaltyFeeNumerator / 100}%`,
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://explorer.testnet.mantle.xyz/address/${contractAddress}`,
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
