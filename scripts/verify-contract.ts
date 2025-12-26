import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073";
  
  console.log("🔍 Verifying contract at:", contractAddress);
  console.log("🌐 Network: Mantle Testnet");
  
  try {
    // Get the contract instance
    const MoveMintNFT = await ethers.getContractFactory("MoveMintNFT");
    const contract = MoveMintNFT.attach(contractAddress);
    
    // Check if contract exists by calling view functions
    console.log("\n📋 Contract Details:");
    
    const name = await contract.name();
    console.log("   - Name:", name);
    
    const symbol = await contract.symbol();
    console.log("   - Symbol:", symbol);
    
    const owner = await contract.owner();
    console.log("   - Owner:", owner);
    
    const totalMinted = await contract.getTotalMinted();
    console.log("   - Total Minted:", totalMinted.toString());
    
    console.log("\n✅ Contract verification successful!");
    console.log("🔗 Explorer:", `https://explorer.testnet.mantle.xyz/address/${contractAddress}`);
    
    return true;
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    return false;
  }
}

main()
  .then((success) => {
    if (success) {
      console.log("\n✨ Contract is valid and ready to use!");
    } else {
      console.log("\n💥 Contract verification failed!");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });