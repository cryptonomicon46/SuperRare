const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { parseEther, formatEther } = require("ethers/lib/utils");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { parse } = require("dotenv");

const NAME = "SupeRare";
const SYMBOL = "SUPR";

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract

describe("SupeRareV1 Test Suite#1: Basics", function () {
  async function deployTokenFixture() {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MockV1 = await ethers.getContractFactory("MockV1");
    //console.log("Deploying MockV1 ...\n");
    const mockV1 = await MockV1.deploy();
    await mockV1.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(mockV1.address);
    await supeRareV2.deployed();

    ////console.log("MockV1 contract deployed at:", mockV1.address);
    ////console.log("Deployer Address", owner.address);

    return { mockV1, supeRareV2, owner, addr1, addr2 };
  }

  it("SupeRareV1 Deployed: check contract address to be a proper address", async function () {
    const { mockV1 } = await loadFixture(deployTokenFixture);
    expect(mockV1.address).to.be.a.properAddress;
  });

  it("SupeRareV1: Only owner can create the Whitelist", async function () {
    const { mockV1, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(mockV1.connect(addr2.address).whitelistCreator(addr1.address))
      .to.be.reverted;

    await expect(mockV1.connect(owner).whitelistCreator(addr2.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(addr2.address);
  });

  it("SupeRareV1 IsWhiteListed: Check if an account is whitelisted", async function () {
    const { mockV1, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(mockV1.connect(owner).whitelistCreator(addr2.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(addr2.address);

    let whiteListAddr = await mockV1.isWhitelisted(addr2.address);
    expect(whiteListAddr).to.be.true;

    whiteListAddr = await mockV1.isWhitelisted(addr1.address);
    expect(whiteListAddr).to.be.false;
  });

  it("SupeRareV1 MaintainerPercentage: Check default value and change it.", async function () {
    const { mockV1, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    let maintainer_per = await mockV1.maintainerPercentage();
    ////console.log(maintainer_per);

    expect(maintainer_per).to.equal(30);

    await expect(mockV1.connect(addr2.address).setMaintainerPercentage(5)).to.be
      .reverted;

    maintainer_per = await mockV1.maintainerPercentage();
    expect(maintainer_per).to.equal(30);

    await mockV1.connect(owner).setMaintainerPercentage(5);

    maintainer_per = await mockV1.maintainerPercentage();
    expect(maintainer_per).to.equal(5);
  });

  it("SupeRareV1 CreatorPercentage: Check default value and change it.", async function () {
    const { mockV1, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    let creator_per = await mockV1.creatorPercentage();
    ////console.log(creator_per);

    expect(creator_per).to.equal(100);

    await expect(mockV1.connect(addr2.address).setCreatorPercentage(5)).to.be
      .reverted;

    creator_per = await mockV1.creatorPercentage();
    expect(creator_per).to.equal(100);

    await mockV1.connect(owner).setCreatorPercentage(20);

    creator_per = await mockV1.creatorPercentage();
    expect(creator_per).to.equal(20);
  });

  it("SupeRareV1 AddNewToken: Check the TotalSupply, tokenId and URI", async function () {
    const { mockV1, owner, addr1 } = await loadFixture(deployTokenFixture);

    await expect(mockV1.connect(owner).whitelistCreator(addr1.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(addr1.address);

    await mockV1.connect(addr1).addNewToken("NewEditions_10");
    expect(await mockV1.totalSupply()).to.equal(1);
    const tokenId = await mockV1.tokensOf(addr1.address);
    //console.log(ethers.BigNumber.from(1), tokenId[0]);
    expect(tokenId[0]).to.be.equal(ethers.BigNumber.from("1"));
    expect(await mockV1.tokenURI(tokenId[0])).to.equal("NewEditions_10");
  });
});

describe("SupeRareV1 Test Suite#2: Creator creates MockV1 token: Tests", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const MockV1 = await ethers.getContractFactory("MockV1");
    //console.log("Deploying MockV1 ...\n");
    const mockV1 = await MockV1.deploy();
    await mockV1.deployed();
    ////console.log("MockV1 contract deployed at:", mockV1.address);
    ////console.log("Deployer Address", owner.address);
    await expect(mockV1.connect(owner).whitelistCreator(creator.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(
      mockV1
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_10", 10, parseEther("1"))
    ).to.emit(mockV1, "SalePriceSet");

    return { mockV1, owner, addr1, creator };
  }

  it("AddNewTokenEdition: Create new tokens and check totalSupply", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let totalSupply = await mockV1.totalSupply();
    expect(totalSupply).to.equal(11);
  });

  it("AddNewTokenEdition: Check TokenURIs", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await mockV1.tokenURI(i)).to.be.equal("NewEditions_10");
    }
  });

  it("AddNewTokenEdition: Check SalePriceOfTokens", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    for (let i = 1; i <= 11; i++) {
      i == 1
        ? expect(await mockV1.salePriceOfToken(i)).to.be.equal(0)
        : expect(await mockV1.salePriceOfToken(i)).to.be.equal(parseEther("1"));
    }
  });

  it("AddNewTokenEdition: Check OwnerOf and CreatorOf tokenIds", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await mockV1.ownerOf(i)).to.be.equal(creator.address);
      expect(await mockV1.creatorOfToken(i)).to.be.equal(creator.address);
    }
  });

  it("AddNewTokenEdition: Check all tokens belonging to the owner", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    const tokensOfOwner = await mockV1.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));
  });

  it("AddNewTokenEdition: Check balance of Owner", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await mockV1.balanceOf(creator.address)).to.equal(11);
  });

  it("AddNewTokenEdition: Check Original token URI", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    const tokensOfOwner = await mockV1.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

    expect(await mockV1.originalTokenOfUri("NewEditions_10")).to.equal("1");
  });
});

describe("Creator creates MockV1 token: Tests", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const MockV1 = await ethers.getContractFactory("MockV1");
    //console.log("Deploying MockV1 ...\n");
    const mockV1 = await MockV1.deploy();
    await mockV1.deployed();
    ////console.log("MockV1 contract deployed at:", mockV1.address);
    ////console.log("Deployer Address", owner.address);
    await expect(mockV1.connect(owner).whitelistCreator(creator.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(
      mockV1
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_10", 10, parseEther("1"))
    ).to.emit(mockV1, "SalePriceSet");

    return { mockV1, owner, addr1, creator };
  }

  it("AddNewTokenEdition: Create new tokens and check totalSupply", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let totalSupply = await mockV1.totalSupply();
    expect(totalSupply).to.equal(11);
  });

  it("AddNewTokenEdition: Check TokenURIs", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await mockV1.tokenURI(i)).to.be.equal("NewEditions_10");
    }
  });

  it("AddNewTokenEdition: Check SalePriceOfTokens", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    for (let i = 1; i <= 11; i++) {
      i == 1
        ? expect(await mockV1.salePriceOfToken(i)).to.be.equal(0)
        : expect(await mockV1.salePriceOfToken(i)).to.be.equal(parseEther("1"));
    }
  });

  it("AddNewTokenEdition: Check OwnerOf and CreatorOf tokenIds", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await mockV1.ownerOf(i)).to.be.equal(creator.address);
      expect(await mockV1.creatorOfToken(i)).to.be.equal(creator.address);
    }
  });

  it("AddNewTokenEdition: Check all tokens belonging to the owner", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    const tokensOfOwner = await mockV1.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));
  });

  it("AddNewTokenEdition: Check balance of Owner", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await mockV1.balanceOf(creator.address)).to.equal(11);
  });

  it("AddNewTokenEdition: Check Original token URI", async function () {
    const { mockV1, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    const tokensOfOwner = await mockV1.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

    expect(await mockV1.originalTokenOfUri("NewEditions_10")).to.equal("1");
  });
});
