import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Starting Cashflow Protocol deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MNT");

  // Deployment parameters
  const PROTOCOL_FEE = 300; // 3%
  const MINIMUM_INVESTMENT = ethers.parseEther("0.01"); // 0.01 MNT

  try {
    // 1. Deploy RevenueOracle
    console.log("\n📊 Deploying RevenueOracle...");
    const RevenueOracle = await ethers.getContractFactory("RevenueOracle");
    const revenueOracle = await RevenueOracle.deploy();
    await revenueOracle.waitForDeployment();
    const revenueOracleAddress = await revenueOracle.getAddress();
    console.log("✅ RevenueOracle deployed to:", revenueOracleAddress);

    // 2. Deploy CashflowProtocol (upgradeable)
    console.log("\n🏛️ Deploying CashflowProtocol (upgradeable)...");
    const CashflowProtocol = await ethers.getContractFactory("CashflowProtocol");
    const cashflowProtocol = await upgrades.deployProxy(
      CashflowProtocol,
      [PROTOCOL_FEE, MINIMUM_INVESTMENT],
      { 
        initializer: 'initialize',
        kind: 'uups' // Use UUPS proxy pattern
      }
    );
    await cashflowProtocol.waitForDeployment();
    const cashflowProtocolAddress = await cashflowProtocol.getAddress();
    console.log("✅ CashflowProtocol deployed to:", cashflowProtocolAddress);

    // 3. Deploy DistributionEngine
    console.log("\n💸 Deploying DistributionEngine...");
    const DistributionEngine = await ethers.getContractFactory("DistributionEngine");
    const distributionEngine = await DistributionEngine.deploy(
      revenueOracleAddress,
      cashflowProtocolAddress
    );
    await distributionEngine.waitForDeployment();
    const distributionEngineAddress = await distributionEngine.getAddress();
    console.log("✅ DistributionEngine deployed to:", distributionEngineAddress);

    // 4. Set up roles and permissions
    console.log("\n🔐 Setting up roles and permissions...");
    
    // Grant PROTOCOL_ROLE to CashflowProtocol in RevenueOracle
    const PROTOCOL_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROTOCOL_ROLE"));
    await revenueOracle.grantRole(PROTOCOL_ROLE, cashflowProtocolAddress);
    console.log("✅ Granted PROTOCOL_ROLE to CashflowProtocol in RevenueOracle");

    // Grant DISTRIBUTOR_ROLE to deployer in DistributionEngine (for testing)
    const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    await distributionEngine.grantRole(DISTRIBUTOR_ROLE, deployer.address);
    console.log("✅ Granted DISTRIBUTOR_ROLE to deployer in DistributionEngine");

    // 5. Verify deployments
    console.log("\n🔍 Verifying deployments...");
    
    // Test CashflowProtocol
    const protocolFee = await cashflowProtocol.protocolFee();
    const minInvestment = await cashflowProtocol.minimumInvestment();
    console.log("📊 Protocol fee:", protocolFee.toString(), "basis points");
    console.log("💰 Minimum investment:", ethers.formatEther(minInvestment), "MNT");

    // Test RevenueOracle
    const supportedPlatforms = await revenueOracle.getSupportedPlatforms();
    console.log("🌐 Supported platforms:", supportedPlatforms);

    // Test DistributionEngine
    const distributionProtocolFee = await distributionEngine.protocolFeeRate();
    console.log("💸 Distribution protocol fee:", distributionProtocolFee.toString(), "basis points");

    // 6. Deploy a test CashflowToken for demonstration
    console.log("\n🪙 Deploying test CashflowToken...");
    const CashflowToken = await ethers.getContractFactory("CashflowToken");
    const testToken = await CashflowToken.deploy(
      "Test Cashflow Token",
      "TCF",
      ethers.parseEther("1000"), // 1000 tokens
      12, // 12 months
      cashflowProtocolAddress
    );
    await testToken.waitForDeployment();
    const testTokenAddress = await testToken.getAddress();
    console.log("✅ Test CashflowToken deployed to:", testTokenAddress);

    // 7. Summary
    console.log("\n🎉 Deployment Summary:");
    console.log("=" .repeat(50));
    console.log("📊 RevenueOracle:      ", revenueOracleAddress);
    console.log("🏛️ CashflowProtocol:   ", cashflowProtocolAddress);
    console.log("💸 DistributionEngine: ", distributionEngineAddress);
    console.log("🪙 Test CashflowToken: ", testTokenAddress);
    console.log("=" .repeat(50));

    // 8. Save deployment info
    const deploymentInfo = {
      network: "mantleTestnet",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        RevenueOracle: revenueOracleAddress,
        CashflowProtocol: cashflowProtocolAddress,
        DistributionEngine: distributionEngineAddress,
        TestCashflowToken: testTokenAddress
      },
      parameters: {
        protocolFee: PROTOCOL_FEE,
        minimumInvestment: ethers.formatEther(MINIMUM_INVESTMENT)
      }
    };

    // Write to file
    const fs = require('fs');
    const path = require('path');
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'cashflow-protocol.json');
    
    // Create deployments directory if it doesn't exist
    const deploymentDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to:", deploymentPath);

    console.log("\n✨ Cashflow Protocol deployment completed successfully!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});