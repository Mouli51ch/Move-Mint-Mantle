import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing deployed MoveMint NFT contract...\n");

  const contractAddress = "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073";
  
  // Get the contract instance
  const MoveMintNFT = await ethers.getContractFactory("MoveMintNFT");
  const contract = MoveMintNFT.attach(contractAddress);

  try {
    // Test basic contract functions
    console.log("📋 Contract Information:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalMinted = await contract.getTotalMinted();
    const owner = await contract.owner();

    console.log("   - Name:", name);
    console.log("   - Symbol:", symbol);
    console.log("   - Total Minted:", totalMinted.toString());
    console.log("   - Owner:", owner);

    console.log("\n✅ Contract is working correctly!");
    console.log("🎯 Ready for minting dance NFTs!");

    // Test minting a sample dance NFT
    console.log("\n🎭 Testing mint function...");
    const [signer] = await ethers.getSigners();
    console.log("Minting with account:", signer.address);

    const tx = await contract.mintDance(
      "Test Dance Performance",
      "Hip Hop",
      "Test Choreographer", 
      120, // 2 minutes
      "QmTestIPFSHash123456789"
    );

    console.log("📤 Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("🎉 NFT minted successfully!");
    
    // Get the new total
    const newTotal = await contract.getTotalMinted();
    console.log("📊 New total minted:", newTotal.toString());

    console.log("\n🔗 View transaction on explorer:");
    console.log(`https://explorer.sepolia.mantle.xyz/tx/${tx.hash}`);

  } catch (error) {
    console.error("❌ Contract test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });