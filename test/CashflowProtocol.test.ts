import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { CashflowProtocol, RevenueOracle, CashflowToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CashflowProtocol", function () {
  let cashflowProtocol: CashflowProtocol;
  let revenueOracle: RevenueOracle;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let investor: SignerWithAddress;

  const PROTOCOL_FEE = 300; // 3%
  const MINIMUM_INVESTMENT = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, creator, investor] = await ethers.getSigners();

    // Deploy RevenueOracle
    const RevenueOracle = await ethers.getContractFactory("RevenueOracle");
    revenueOracle = await RevenueOracle.deploy();
    await revenueOracle.waitForDeployment();

    // Deploy CashflowProtocol (upgradeable)
    const CashflowProtocol = await ethers.getContractFactory("CashflowProtocol");
    cashflowProtocol = await upgrades.deployProxy(
      CashflowProtocol,
      [PROTOCOL_FEE, MINIMUM_INVESTMENT],
      { initializer: 'initialize' }
    ) as unknown as CashflowProtocol;
    await cashflowProtocol.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await cashflowProtocol.protocolFee()).to.equal(PROTOCOL_FEE);
      expect(await cashflowProtocol.minimumInvestment()).to.equal(MINIMUM_INVESTMENT);
    });

    it("Should grant admin role to deployer", async function () {
      const ADMIN_ROLE = await cashflowProtocol.ADMIN_ROLE();
      expect(await cashflowProtocol.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Stream Registration", function () {
    it("Should register a stream successfully", async function () {
      const sources = [{
        platform: "Spotify",
        accountId: "test-account",
        verificationHash: ethers.keccak256(ethers.toUtf8Bytes("test-verification")),
        historicalRevenue: ethers.parseEther("1"),
        weight: 10000,
        isActive: true
      }];

      const tx = await cashflowProtocol.connect(creator).registerStream(
        "Test Stream",
        "Test Description",
        sources,
        ethers.parseEther("0.1"), // 0.1 MNT monthly
        12, // 12 months
        MINIMUM_INVESTMENT,
        "QmTestHash"
      );

      await expect(tx)
        .to.emit(cashflowProtocol, "StreamRegistered")
        .withArgs(1, creator.address, "Test Stream", ethers.parseEther("0.1"), 12);

      // Check if creator role was granted
      const CREATOR_ROLE = await cashflowProtocol.CREATOR_ROLE();
      expect(await cashflowProtocol.hasRole(CREATOR_ROLE, creator.address)).to.be.true;
    });

    it("Should fail with empty title", async function () {
      const sources = [{
        platform: "Spotify",
        accountId: "test-account",
        verificationHash: ethers.keccak256(ethers.toUtf8Bytes("test-verification")),
        historicalRevenue: ethers.parseEther("1"),
        weight: 10000,
        isActive: true
      }];

      await expect(
        cashflowProtocol.connect(creator).registerStream(
          "",
          "Test Description",
          sources,
          ethers.parseEther("0.1"),
          12,
          MINIMUM_INVESTMENT,
          "QmTestHash"
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should fail with invalid source weights", async function () {
      const sources = [{
        platform: "Spotify",
        accountId: "test-account",
        verificationHash: ethers.keccak256(ethers.toUtf8Bytes("test-verification")),
        historicalRevenue: ethers.parseEther("1"),
        weight: 5000, // Only 50%, should be 100%
        isActive: true
      }];

      await expect(
        cashflowProtocol.connect(creator).registerStream(
          "Test Stream",
          "Test Description",
          sources,
          ethers.parseEther("0.1"),
          12,
          MINIMUM_INVESTMENT,
          "QmTestHash"
        )
      ).to.be.revertedWith("Source weights must sum to 100%");
    });
  });

  describe("Stream Tokenization", function () {
    let streamId: number;

    beforeEach(async function () {
      const sources = [{
        platform: "Spotify",
        accountId: "test-account",
        verificationHash: ethers.keccak256(ethers.toUtf8Bytes("test-verification")),
        historicalRevenue: ethers.parseEther("1"),
        weight: 10000,
        isActive: true
      }];

      await cashflowProtocol.connect(creator).registerStream(
        "Test Stream",
        "Test Description",
        sources,
        ethers.parseEther("0.1"),
        12,
        MINIMUM_INVESTMENT,
        "QmTestHash"
      );
      streamId = 1;
    });

    it("Should tokenize a stream successfully", async function () {
      const tokenizationPercentage = 6000; // 60%

      const tx = await cashflowProtocol.connect(creator).tokenizeStream(
        streamId,
        tokenizationPercentage
      );

      await expect(tx).to.emit(cashflowProtocol, "StreamTokenized");

      const streamInfo = await cashflowProtocol.getStreamInfo(streamId);
      expect(streamInfo.isTokenized).to.be.true;
      expect(streamInfo.tokenizationPercentage).to.equal(tokenizationPercentage);
    });

    it("Should fail if not stream creator", async function () {
      await expect(
        cashflowProtocol.connect(investor).tokenizeStream(streamId, 6000)
      ).to.be.revertedWith("Only creator can tokenize");
    });

    it("Should fail with invalid tokenization percentage", async function () {
      await expect(
        cashflowProtocol.connect(creator).tokenizeStream(streamId, 9000) // 90% > 80% max
      ).to.be.revertedWith("Invalid tokenization percentage");
    });
  });

  describe("Investment", function () {
    let streamId: number;
    let tokenAddress: string;

    beforeEach(async function () {
      const sources = [{
        platform: "Spotify",
        accountId: "test-account",
        verificationHash: ethers.keccak256(ethers.toUtf8Bytes("test-verification")),
        historicalRevenue: ethers.parseEther("1"),
        weight: 10000,
        isActive: true
      }];

      await cashflowProtocol.connect(creator).registerStream(
        "Test Stream",
        "Test Description",
        sources,
        ethers.parseEther("0.1"),
        12,
        MINIMUM_INVESTMENT,
        "QmTestHash"
      );
      streamId = 1;

      await cashflowProtocol.connect(creator).tokenizeStream(streamId, 6000);
      const streamInfo = await cashflowProtocol.getStreamInfo(streamId);
      tokenAddress = streamInfo.tokenAddress;
    });

    it("Should allow investment in tokenized stream", async function () {
      const investmentAmount = ethers.parseEther("0.1");

      const tx = await cashflowProtocol.connect(investor).investInStream(
        streamId,
        true, // risk acknowledged
        { value: investmentAmount }
      );

      await expect(tx)
        .to.emit(cashflowProtocol, "InvestmentMade")
        .withArgs(streamId, investor.address, investmentAmount, investmentAmount);

      // Check if investor role was granted
      const INVESTOR_ROLE = await cashflowProtocol.INVESTOR_ROLE();
      expect(await cashflowProtocol.hasRole(INVESTOR_ROLE, investor.address)).to.be.true;
    });

    it("Should fail if risk not acknowledged", async function () {
      await expect(
        cashflowProtocol.connect(investor).investInStream(
          streamId,
          false, // risk not acknowledged
          { value: ethers.parseEther("0.1") }
        )
      ).to.be.revertedWith("Must acknowledge investment risks");
    });

    it("Should fail if investment below minimum", async function () {
      await expect(
        cashflowProtocol.connect(investor).investInStream(
          streamId,
          true,
          { value: ethers.parseEther("0.005") } // Below 0.01 minimum
        )
      ).to.be.revertedWith("Investment below minimum");
    });

    it("Should fail if creator tries to invest in own stream", async function () {
      await expect(
        cashflowProtocol.connect(creator).investInStream(
          streamId,
          true,
          { value: ethers.parseEther("0.1") }
        )
      ).to.be.revertedWith("Creator cannot invest in own stream");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update protocol fee", async function () {
      const newFee = 400; // 4%
      
      await expect(cashflowProtocol.connect(owner).updateProtocolFee(newFee))
        .to.emit(cashflowProtocol, "ProtocolFeeUpdated")
        .withArgs(PROTOCOL_FEE, newFee);

      expect(await cashflowProtocol.protocolFee()).to.equal(newFee);
    });

    it("Should fail to update protocol fee above maximum", async function () {
      await expect(
        cashflowProtocol.connect(owner).updateProtocolFee(600) // 6% > 5% max
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow admin to pause and unpause", async function () {
      await cashflowProtocol.connect(owner).pause();
      expect(await cashflowProtocol.paused()).to.be.true;

      await cashflowProtocol.connect(owner).unpause();
      expect(await cashflowProtocol.paused()).to.be.false;
    });
  });
});