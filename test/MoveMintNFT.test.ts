import { expect } from "chai";
import { ethers } from "hardhat";
import { MoveMintNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MoveMintNFT", function () {
  let moveMintNFT: MoveMintNFT;
  let owner: SignerWithAddress;
  let creator1: SignerWithAddress;
  let creator2: SignerWithAddress;
  let royaltyReceiver: SignerWithAddress;

  const ROYALTY_FEE = 500; // 5%

  beforeEach(async function () {
    [owner, creator1, creator2, royaltyReceiver] = await ethers.getSigners();

    const MoveMintNFT = await ethers.getContractFactory("MoveMintNFT");
    moveMintNFT = await MoveMintNFT.deploy(royaltyReceiver.address, ROYALTY_FEE);
    await moveMintNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await moveMintNFT.name()).to.equal("MoveMint Dance NFT");
      expect(await moveMintNFT.symbol()).to.equal("DANCE");
    });

    it("Should set the correct owner", async function () {
      expect(await moveMintNFT.owner()).to.equal(owner.address);
    });

    it("Should set default royalty", async function () {
      const royaltyInfo = await moveMintNFT.royaltyInfo(1, 10000);
      expect(royaltyInfo[0]).to.equal(royaltyReceiver.address);
      expect(royaltyInfo[1]).to.equal(500); // 5% of 10000
    });
  });

  describe("Minting", function () {
    const sampleDance = {
      title: "Urban Flow",
      danceStyle: "Hip Hop",
      choreographer: "Jane Doe",
      duration: 180,
      ipfsHash: "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
    };

    it("Should mint a dance NFT successfully", async function () {
      const tx = await moveMintNFT.connect(creator1).mintDance(
        sampleDance.title,
        sampleDance.danceStyle,
        sampleDance.choreographer,
        sampleDance.duration,
        sampleDance.ipfsHash
      );

      await expect(tx)
        .to.emit(moveMintNFT, "DanceMinted")
        .withArgs(0, creator1.address, sampleDance.title, sampleDance.danceStyle, sampleDance.ipfsHash);

      expect(await moveMintNFT.ownerOf(0)).to.equal(creator1.address);
      expect(await moveMintNFT.getTotalMinted()).to.equal(1);
    });

    it("Should store metadata correctly", async function () {
      await moveMintNFT.connect(creator1).mintDance(
        sampleDance.title,
        sampleDance.danceStyle,
        sampleDance.choreographer,
        sampleDance.duration,
        sampleDance.ipfsHash
      );

      const metadata = await moveMintNFT.getDanceMetadata(0);
      expect(metadata.title).to.equal(sampleDance.title);
      expect(metadata.danceStyle).to.equal(sampleDance.danceStyle);
      expect(metadata.choreographer).to.equal(sampleDance.choreographer);
      expect(metadata.duration).to.equal(sampleDance.duration);
      expect(metadata.ipfsMetadataHash).to.equal(sampleDance.ipfsHash);
      expect(metadata.creator).to.equal(creator1.address);
    });

    it("Should set correct token URI", async function () {
      await moveMintNFT.connect(creator1).mintDance(
        sampleDance.title,
        sampleDance.danceStyle,
        sampleDance.choreographer,
        sampleDance.duration,
        sampleDance.ipfsHash
      );

      const tokenURI = await moveMintNFT.tokenURI(0);
      expect(tokenURI).to.equal(`ipfs://${sampleDance.ipfsHash}`);
    });

    it("Should track creator tokens", async function () {
      // Creator1 mints 2 tokens
      await moveMintNFT.connect(creator1).mintDance(
        "Dance 1", "Hip Hop", "Creator 1", 120, "QmHash1"
      );
      await moveMintNFT.connect(creator1).mintDance(
        "Dance 2", "Contemporary", "Creator 1", 150, "QmHash2"
      );

      // Creator2 mints 1 token
      await moveMintNFT.connect(creator2).mintDance(
        "Dance 3", "Ballet", "Creator 2", 200, "QmHash3"
      );

      const creator1Tokens = await moveMintNFT.getCreatorTokens(creator1.address);
      const creator2Tokens = await moveMintNFT.getCreatorTokens(creator2.address);

      expect(creator1Tokens.length).to.equal(2);
      expect(creator2Tokens.length).to.equal(1);
      expect(creator1Tokens[0]).to.equal(0);
      expect(creator1Tokens[1]).to.equal(1);
      expect(creator2Tokens[0]).to.equal(2);
    });

    it("Should reject empty title", async function () {
      await expect(
        moveMintNFT.connect(creator1).mintDance(
          "", sampleDance.danceStyle, sampleDance.choreographer, 
          sampleDance.duration, sampleDance.ipfsHash
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should reject empty IPFS hash", async function () {
      await expect(
        moveMintNFT.connect(creator1).mintDance(
          sampleDance.title, sampleDance.danceStyle, sampleDance.choreographer,
          sampleDance.duration, ""
        )
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should reject zero duration", async function () {
      await expect(
        moveMintNFT.connect(creator1).mintDance(
          sampleDance.title, sampleDance.danceStyle, sampleDance.choreographer,
          0, sampleDance.ipfsHash
        )
      ).to.be.revertedWith("Duration must be greater than 0");
    });
  });

  describe("Royalties", function () {
    beforeEach(async function () {
      await moveMintNFT.connect(creator1).mintDance(
        "Test Dance", "Hip Hop", "Creator", 120, "QmTestHash"
      );
    });

    it("Should allow token owner to set token royalty", async function () {
      const newReceiver = creator2.address;
      const newFee = 1000; // 10%

      await moveMintNFT.connect(creator1).setTokenRoyalty(0, newReceiver, newFee);

      const royaltyInfo = await moveMintNFT.royaltyInfo(0, 10000);
      expect(royaltyInfo[0]).to.equal(newReceiver);
      expect(royaltyInfo[1]).to.equal(1000);
    });

    it("Should reject non-owner setting token royalty", async function () {
      await expect(
        moveMintNFT.connect(creator2).setTokenRoyalty(0, creator2.address, 1000)
      ).to.be.revertedWith("Only token owner can set royalty");
    });

    it("Should allow contract owner to set default royalty", async function () {
      const newReceiver = creator1.address;
      const newFee = 750; // 7.5%

      await moveMintNFT.connect(owner).setDefaultRoyalty(newReceiver, newFee);

      // Mint new token to test default royalty
      await moveMintNFT.connect(creator2).mintDance(
        "New Dance", "Ballet", "Creator 2", 180, "QmNewHash"
      );

      const royaltyInfo = await moveMintNFT.royaltyInfo(1, 10000);
      expect(royaltyInfo[0]).to.equal(newReceiver);
      expect(royaltyInfo[1]).to.equal(750);
    });
  });

  describe("Enumeration", function () {
    it("Should support enumeration", async function () {
      // Mint 3 tokens
      await moveMintNFT.connect(creator1).mintDance("Dance 1", "Hip Hop", "Creator", 120, "QmHash1");
      await moveMintNFT.connect(creator1).mintDance("Dance 2", "Ballet", "Creator", 150, "QmHash2");
      await moveMintNFT.connect(creator2).mintDance("Dance 3", "Jazz", "Creator", 180, "QmHash3");

      expect(await moveMintNFT.totalSupply()).to.equal(3);
      expect(await moveMintNFT.balanceOf(creator1.address)).to.equal(2);
      expect(await moveMintNFT.balanceOf(creator2.address)).to.equal(1);

      // Check token by index
      expect(await moveMintNFT.tokenByIndex(0)).to.equal(0);
      expect(await moveMintNFT.tokenByIndex(1)).to.equal(1);
      expect(await moveMintNFT.tokenByIndex(2)).to.equal(2);

      // Check token of owner by index
      expect(await moveMintNFT.tokenOfOwnerByIndex(creator1.address, 0)).to.equal(0);
      expect(await moveMintNFT.tokenOfOwnerByIndex(creator1.address, 1)).to.equal(1);
      expect(await moveMintNFT.tokenOfOwnerByIndex(creator2.address, 0)).to.equal(2);
    });
  });

  describe("Interface Support", function () {
    it("Should support required interfaces", async function () {
      // ERC721
      expect(await moveMintNFT.supportsInterface("0x80ac58cd")).to.be.true;
      // ERC721Enumerable
      expect(await moveMintNFT.supportsInterface("0x780e9d63")).to.be.true;
      // ERC721URIStorage
      expect(await moveMintNFT.supportsInterface("0x49064906")).to.be.true;
      // ERC2981 (Royalty)
      expect(await moveMintNFT.supportsInterface("0x2a55205a")).to.be.true;
    });
  });
});