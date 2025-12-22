import { ethers } from "ethers";

async function main() {
  const privateKey = "0xaf0e3c0f38439b5347fdf62b609f1cbcfa2b892a9a4d34da14cf2e8729dda421";
  const wallet = new ethers.Wallet(privateKey);
  
  console.log("🔍 Wallet Information:");
  console.log("Private Key:", privateKey);
  console.log("Wallet Address:", wallet.address);
  console.log("Expected Address: 0x798b32BDf86253060d598038b1D77C98C36881D6");
  console.log("Addresses Match:", wallet.address.toLowerCase() === "0x798b32BDf86253060d598038b1D77C98C36881D6".toLowerCase());
}

main().catch(console.error);