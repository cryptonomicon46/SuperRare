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
const { c } = require("docker/src/languages");

const NAME = "SupeRare";
const SYMBOL = "SUPR";

describe("SupeRareV2 Test Suit: The Basics", function () {
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

  it("SupeRareV2 Deployed: check contract address to be a proper address", async function () {
    const { supeRareV2 } = await loadFixture(deployTokenFixture);
    expect(supeRareV2.address).to.be.a.properAddress;
  });

  it("SupeRareV2 Name: check the name of the V2 token", async function () {
    const { supeRareV2 } = await loadFixture(deployTokenFixture);
    expect(await supeRareV2.name()).to.be.equal(NAME);
  });

  it("SupeRareV2 Symbol: check the symbol of the V2 token", async function () {
    const { supeRareV2 } = await loadFixture(deployTokenFixture);
    expect(await supeRareV2.symbol()).to.be.equal(SYMBOL);
  });

  it("SupeRareV2 Owner: Check owner or the deployer of the contract", async function () {
    const { mockV1, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    expect(await supeRareV2.owner()).to.be.equal(owner.address);
  });

  it("SupeRareV2 transferOwnership: Only owner can transfer ownership", async function () {
    const { mockV1, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareV2.connect(addr1).transferOwnership(addr1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("SupeRareV2 TransferOwnership to new Owner: Check address of the new owner", async function () {
    const { mockV1, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(owner).transferOwnership(addr1.address))
      .to.emit(supeRareV2, "OwnershipTransferred")
      .withArgs(owner.address, addr1.address);

    expect(await supeRareV2.owner()).to.be.equal(addr1.address);
  });
});

describe("SupeRareV2 Deposits: Tests related to depositing an NFT", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const MockV1 = await ethers.getContractFactory("MockV1");
    //console.log("Deploying MockV1 ...\n");
    const mockV1 = await MockV1.deploy();
    await mockV1.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(mockV1.address);
    await supeRareV2.deployed();
    //console.log(`supeRareV2 contract deployed at ${supeRareV2.address}`);

    await expect(mockV1.connect(owner).whitelistCreator(creator.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(mockV1.connect(creator).addNewToken("NewEditions_1"))
      .to.emit(mockV1, "Transfer")
      .withArgs(ethers.constants.AddressZero, creator.address, 1);

    return { mockV1, supeRareV2, owner, addr1, creator };
  }

  it("SupeRareV2 Deposit whitelist pass: Owner of an V1 NFT gets whitelisted.", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareV2.connect(addr1).getAddedToWhitelist(1)
    ).to.be.revertedWith("SupeRareV2: Sender isn't the owner of the V1 Token!");

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);
  });

  it("SupeRareV2 Deposit and check if Whitelisted: Owner of an V1 NFT asks to get whitelisted and checks if whitelisted.", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareV2.connect(addr1).getAddedToWhitelist(1)
    ).to.be.revertedWith("SupeRareV2: Sender isn't the owner of the V1 Token!");

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    const isWhitelisted = await supeRareV2.connect(creator).isWhitelisted(1);

    expect(await supeRareV2.connect(creator).isWhitelisted(1)).to.equal(true);

    expect(await supeRareV2.connect(addr1).isWhitelisted(1)).to.equal(false);
  });

  it("SupeRareV2 Deposit whitelist fail: Owner of tries to get whitelisted again for the same v1 tokenID.", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareV2.connect(addr1).getAddedToWhitelist(1)
    ).to.be.revertedWith("SupeRareV2: Sender isn't the owner of the V1 Token!");

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(
      supeRareV2.connect(creator).getAddedToWhitelist(1)
    ).to.be.revertedWith("SupeRareV2: Account already whitelisted!");
  });

  it("SupeRareV2 Deposit verify balances before mint: V1 Onwer gets whitelisted, transfers V1 token check balances before and after ", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    expect(await mockV1.balanceOf(creator.address)).to.equal(1);
    expect(await mockV1.balanceOf(supeRareV2.address)).to.equal(0);

    await expect(mockV1.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(mockV1, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    expect(await mockV1.balanceOf(creator.address)).to.equal(0);
    expect(await mockV1.balanceOf(supeRareV2.address)).to.equal(1);
  });

  it("SupeRareV2 Deposit, mintV2: Mint the v2 token and confirm the v1:v2 peg, check balances", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(mockV1.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(mockV1, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    await expect(supeRareV2.connect(creator).mintV2(1))
      .to.be.emit(supeRareV2, "MintV2")
      .withArgs(creator.address, 1);

    expect(await supeRareV2.isPegged(1)).to.equal(true);
    expect(await supeRareV2.balanceOf(creator.address)).to.equal(1);
    expect(await supeRareV2.totalSupply()).to.equal(1);
    expect(await supeRareV2.ownerOf(1)).to.equal(creator.address);
  });
});
describe("SupeRareV2 SafeTransfer: Creator mints V1 token, deposits it into V2 contract and transfers V2 token to an external ERC721 contract.", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const MockV1 = await ethers.getContractFactory("MockV1");
    //console.log("Deploying MockV1 ...\n");
    const mockV1 = await MockV1.deploy();
    await mockV1.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(mockV1.address);
    await supeRareV2.deployed();
    //console.log(`supeRareV2 contract deployed at ${supeRareV2.address}`);

    const Contract_ERC721 = await ethers.getContractFactory("Contract_ERC721");
    //console.log("Deploying Eschrow ...\n");
    const contract_ERC721 = await Contract_ERC721.deploy(
      mockV1.address,
      supeRareV2.address
    );
    await contract_ERC721.deployed();
    //console.log(`Contract_ERC721 contract deployed at ${contract_ERC721.address}`);

    await expect(mockV1.connect(owner).whitelistCreator(creator.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(mockV1.connect(creator).addNewToken("NewEditions_1"))
      .to.emit(mockV1, "Transfer")
      .withArgs(ethers.constants.AddressZero, creator.address, 1);

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(mockV1.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(mockV1, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    await expect(supeRareV2.connect(creator).mintV2(1))
      .to.be.emit(supeRareV2, "MintV2")
      .withArgs(creator.address, 1);

    return {
      mockV1,
      supeRareV2,
      owner,
      addr1,
      creator,
      contract_ERC721,
    };
  }

  it("SupeRareV2 SafeTransfer to Contract_ERC721#1: This should pass, as the contract is ERC721 compliant", async function () {
    const {
      mockV1,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      contract_ERC721,
    } = await loadFixture(deployTokenFixture);

    await expect(
      supeRareV2.connect(addr1).approve(contract_ERC721.address, 1)
    ).to.be.revertedWith(
      "ERC721: approve caller is not owner nor approved for all"
    );

    await expect(
      supeRareV2.connect(creator).approve(contract_ERC721.address, 1)
    )
      .to.emit(supeRareV2, "Approval")
      .withArgs(creator.address, contract_ERC721.address, 1);

    await expect(
      supeRareV2
        .connect(creator)
        .safelyTransfer(creator.address, contract_ERC721.address, 1)
    )
      .to.be.emit(supeRareV2, "Transfer")
      .withArgs(creator.address, contract_ERC721.address, 1);

    expect(await supeRareV2.balanceOf(creator.address)).to.equal(0);
    expect(await supeRareV2.balanceOf(contract_ERC721.address)).to.equal(1);
    expect(await supeRareV2.ownerOf(1)).to.equal(contract_ERC721.address);
  });

  it("SupeRareV2 SafeTransfer to Contract_ERC721#2: The external contract then tries to withdaw the V1 token", async function () {
    const {
      mockV1,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      contract_ERC721,
    } = await loadFixture(deployTokenFixture);

    await expect(
      supeRareV2.connect(addr1).approve(contract_ERC721.address, 1)
    ).to.be.revertedWith(
      "ERC721: approve caller is not owner nor approved for all"
    );

    await expect(
      supeRareV2.connect(creator).approve(contract_ERC721.address, 1)
    )
      .to.emit(supeRareV2, "Approval")
      .withArgs(creator.address, contract_ERC721.address, 1);

    await expect(
      supeRareV2
        .connect(creator)
        .safelyTransfer(creator.address, contract_ERC721.address, 1)
    )
      .to.be.emit(supeRareV2, "Transfer")
      .withArgs(creator.address, contract_ERC721.address, 1);

    expect(await supeRareV2.balanceOf(creator.address)).to.equal(0);
    expect(await supeRareV2.balanceOf(contract_ERC721.address)).to.equal(1);
    expect(await supeRareV2.ownerOf(1)).to.equal(contract_ERC721.address);
    expect(await contract_ERC721.checkV1Ownership(1)).to.equal(false);

    expect(await contract_ERC721.checkV2Ownership(1)).to.equal(true);
    await expect(contract_ERC721.withdrawV1(1))
      .to.emit(contract_ERC721, "WithdrawV1")
      .withArgs(contract_ERC721.address, 1);

    // expect(await contract_ERC721.checkV2Ownership(1)).to.equal(false);

    expect(await contract_ERC721.checkV1Ownership(1)).to.equal(true);

    await expect(contract_ERC721.getWhiteListed(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(contract_ERC721.address, 1);

    await expect(contract_ERC721.mintV2(1)).to.be.revertedWith(
      "SupeRareV2: Please add yourself to the whitlist followed by transfering your V1 token to this contract before minting a V2 token!"
    );

    await expect(contract_ERC721.transferV1(supeRareV2.address, 1))
      .to.emit(contract_ERC721, "transferredV1")
      .withArgs(contract_ERC721.address, supeRareV2.address, 1);

    await expect(contract_ERC721.mintV2(1))
      .to.be.emit(contract_ERC721, "MintV2")
      .withArgs(contract_ERC721.address, 1);

    expect(await contract_ERC721.checkV2Ownership(1)).to.equal(true);
  });
});

describe("SupeRareV2 Withdraw: Tests related to withdrawing a V1 token", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const MockV1 = await ethers.getContractFactory("MockV1");
    //console.log("Deploying MockV1 ...\n");
    const mockV1 = await MockV1.deploy();
    await mockV1.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(mockV1.address);
    await supeRareV2.deployed();
    //console.log(`supeRareV2 contract deployed at ${supeRareV2.address}`);

    await expect(mockV1.connect(owner).whitelistCreator(creator.address))
      .to.emit(mockV1, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(mockV1.connect(creator).addNewToken("NewEditions_1"))
      .to.emit(mockV1, "Transfer")
      .withArgs(ethers.constants.AddressZero, creator.address, 1);

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(mockV1.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(mockV1, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    await expect(supeRareV2.connect(creator).mintV2(1))
      .to.be.emit(supeRareV2, "MintV2")
      .withArgs(creator.address, 1);

    return { mockV1, supeRareV2, owner, addr1, creator };
  }

  it("SupeRareV2 Withdraw onlyOwnerOfV2: Owner deposits V1 tokens, then tries to withdraw them", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await mockV1.ownerOf(1)).to.equal(supeRareV2.address);
    expect(await mockV1.balanceOf(supeRareV2.address)).to.equal(1);
    expect((await mockV1.tokensOf(supeRareV2.address))[0]).to.equal(
      BigNumber.from("1")
    );
    expect(await mockV1.balanceOf(creator.address)).to.equal(0);

    await expect(supeRareV2.connect(addr1).withdraw(1)).to.be.revertedWith(
      "SupeRareV2: Sender isn't the owner of the V2 token!"
    );
    await expect(supeRareV2.connect(creator).withdraw(1))
      .to.be.emit(supeRareV2, "WithdrawV1")
      .withArgs(creator.address, 1);

    expect(await mockV1.balanceOf(supeRareV2.address)).to.equal(0);
    expect(await mockV1.balanceOf(creator.address)).to.equal(1);

    expect(await supeRareV2.totalSupply()).to.equal(0);
    expect(await supeRareV2.balanceOf(creator.address)).to.equal(0);
  });

  it("SupeRareV2 Withdraw new V2 owner: Creator transfers V2 token and new owner of V2 tries to withdraw V1 token", async function () {
    const { mockV1, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await mockV1.ownerOf(1)).to.equal(supeRareV2.address);
    expect(await mockV1.balanceOf(supeRareV2.address)).to.equal(1);
    expect((await mockV1.tokensOf(supeRareV2.address))[0]).to.equal(
      BigNumber.from("1")
    );
    expect(await mockV1.balanceOf(creator.address)).to.equal(0);

    await expect(supeRareV2.connect(creator).approve(addr1.address, 1))
      .to.be.emit(supeRareV2, "Approval")
      .withArgs(creator.address, addr1.address, 1);

    await expect(
      supeRareV2
        .connect(addr1)
        .safelyTransfer(creator.address, addr1.address, 1)
    )
      .to.be.emit(supeRareV2, "Transfer")
      .withArgs(creator.address, addr1.address, 1);

    await expect(supeRareV2.connect(creator).withdraw(1)).to.be.revertedWith(
      "SupeRareV2: Sender isn't the owner of the V2 token!"
    );
    await expect(supeRareV2.connect(addr1).withdraw(1))
      .to.be.emit(supeRareV2, "WithdrawV1")
      .withArgs(addr1.address, 1);

    expect(await mockV1.balanceOf(supeRareV2.address)).to.equal(0);
    expect(await mockV1.balanceOf(creator.address)).to.equal(0);
    expect(await mockV1.balanceOf(addr1.address)).to.equal(1);

    expect(await supeRareV2.totalSupply()).to.equal(0);
    expect(await supeRareV2.balanceOf(creator.address)).to.equal(0);
  });
});
