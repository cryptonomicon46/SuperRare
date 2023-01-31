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

describe("SupeRareV2 Test Suit: The Basics", function () {
  async function deployTokenFixture() {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(supeRare.address);
    await supeRareV2.deployed();

    ////console.log("SupeRare contract deployed at:", supeRare.address);
    ////console.log("Deployer Address", owner.address);

    return { supeRare, supeRareV2, owner, addr1, addr2 };
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
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    expect(await supeRareV2.owner()).to.be.equal(owner.address);
  });

  it("SupeRareV2 transferOwnership: Only owner can transfer ownership", async function () {
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareV2.connect(addr1).transferOwnership(addr1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("SupeRareV2 TransferOwnership to new Owner: Check address of the new owner", async function () {
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
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

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(supeRare.address);
    await supeRareV2.deployed();
    //console.log(`supeRareV2 contract deployed at ${supeRareV2.address}`);

    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(supeRare.connect(creator).addNewToken("NewEditions_1"))
      .to.emit(supeRare, "Transfer")
      .withArgs(ethers.constants.AddressZero, creator.address, 1);

    return { supeRare, supeRareV2, owner, addr1, creator };
  }

  it("SupeRareV2 Deposit whitelist pass: Owner of an V1 NFT gets whitelisted.", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareV2.connect(addr1).getAddedToWhitelist(1)
    ).to.be.revertedWith("SupeRareV2: Sender isn't the owner of the V1 Token!");

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);
  });

  it("SupeRareV2 Deposit whitelist fail: Owner of tries to get whitelisted again for the same v1 tokenID.", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
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
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    expect(await supeRare.balanceOf(creator.address)).to.equal(1);
    expect(await supeRare.balanceOf(supeRareV2.address)).to.equal(0);

    await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(supeRare, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    expect(await supeRare.balanceOf(creator.address)).to.equal(0);
    expect(await supeRare.balanceOf(supeRareV2.address)).to.equal(1);
  });

  it("SupeRareV2 Deposit, mintV2: Mint the v2 token and confirm the v1:v2 peg, check balances", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(supeRare, "Transfer")
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
describe("SupeRareV2 SafeTransfer: Tests related to setting SafeTransfer of the V2 Token", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(supeRare.address);
    await supeRareV2.deployed();
    //console.log(`supeRareV2 contract deployed at ${supeRareV2.address}`);

    const EschrowERC721 = await ethers.getContractFactory("EschrowERC721");
    //console.log("Deploying Eschrow ...\n");
    const eschrowERC721 = await EschrowERC721.deploy();
    await eschrowERC721.deployed();
    //console.log(`EschrowERC721 contract deployed at ${eschrowERC721.address}`);

    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(supeRare.connect(creator).addNewToken("NewEditions_1"))
      .to.emit(supeRare, "Transfer")
      .withArgs(ethers.constants.AddressZero, creator.address, 1);

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(supeRare, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    await expect(supeRareV2.connect(creator).mintV2(1))
      .to.be.emit(supeRareV2, "MintV2")
      .withArgs(creator.address, 1);

    return {
      supeRare,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrowERC721,
    };
  }

  //   it("SupeRareV2 SafeTransfer to Eschrow: This should fail, as the contract isn't ERC721 compliant", async function () {
  //     const {
  //       supeRare,
  //       supeRareV2,
  //       owner,
  //       addr1,
  //       creator,
  //       eschrow,
  //       eschrowERC721,
  //     } = await loadFixture(deployTokenFixture);

  //     await expect(supeRareV2.connect(creator).approve(eschrow.address, 1))
  //       .to.emit(supeRareV2, "Approval")
  //       .withArgs(creator.address, eschrow.address, 1);

  //     await expect(
  //       supeRareV2
  //         .connect(eschrow.address)
  //         .safelyTransfer(creator.address, eschrow.address, 1)
  //     ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
  //   });
  it("SupeRareV2 SafeTransfer to EschrowERC721: This should pass, as the contract is ERC721 compliant", async function () {
    const {
      supeRare,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      eschrowERC721,
    } = await loadFixture(deployTokenFixture);

    await expect(
      supeRareV2.connect(addr1).approve(eschrowERC721.address, 1)
    ).to.be.revertedWith(
      "ERC721: approve caller is not owner nor approved for all"
    );

    await expect(supeRareV2.connect(creator).approve(eschrowERC721.address, 1))
      .to.emit(supeRareV2, "Approval")
      .withArgs(creator.address, eschrowERC721.address, 1);

    await expect(
      supeRareV2
        .connect(creator)
        .safelyTransfer(creator.address, eschrowERC721.address, 1)
    )
      .to.be.emit(supeRareV2, "Transfer")
      .withArgs(creator.address, eschrowERC721.address, 1);

    expect(await supeRareV2.balanceOf(creator.address)).to.equal(0);
    expect(await supeRareV2.balanceOf(eschrowERC721.address)).to.equal(1);
    expect(await supeRareV2.ownerOf(1)).to.equal(eschrowERC721.address);
  });
});

describe("SupeRareV2 Withdraw: Tests related to withdrawing a V1 token", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
    //console.log("Deploying SupeRareV2 ...\n");
    const supeRareV2 = await SupeRareV2.deploy(supeRare.address);
    await supeRareV2.deployed();
    //console.log(`supeRareV2 contract deployed at ${supeRareV2.address}`);

    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(supeRare.connect(creator).addNewToken("NewEditions_1"))
      .to.emit(supeRare, "Transfer")
      .withArgs(ethers.constants.AddressZero, creator.address, 1);

    await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
      .to.emit(supeRareV2, "OwnerWhitelisted")
      .withArgs(creator.address, 1);

    await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
      .to.emit(supeRare, "Transfer")
      .withArgs(creator.address, supeRareV2.address, 1);

    await expect(supeRareV2.connect(creator).mintV2(1))
      .to.be.emit(supeRareV2, "MintV2")
      .withArgs(creator.address, 1);

    return { supeRare, supeRareV2, owner, addr1, creator };
  }

  it("SupeRareV2 Withdraw onlyOwnerOfV2: Owner deposits V1 tokens, then tries to withdraw them", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await supeRare.ownerOf(1)).to.equal(supeRareV2.address);
    expect(await supeRare.balanceOf(supeRareV2.address)).to.equal(1);
    expect((await supeRare.tokensOf(supeRareV2.address))[0]).to.equal(
      BigNumber.from("1")
    );
    expect(await supeRare.balanceOf(creator.address)).to.equal(0);

    await expect(supeRareV2.connect(addr1).withdraw(1)).to.be.revertedWith(
      "SupeRareV2: Sender isn't the owner of the V2 token!"
    );
    await expect(supeRareV2.connect(creator).withdraw(1))
      .to.be.emit(supeRareV2, "WithdrawV1")
      .withArgs(creator.address, 1);

    expect(await supeRare.balanceOf(supeRareV2.address)).to.equal(0);
    expect(await supeRare.balanceOf(creator.address)).to.equal(1);

    expect(await supeRareV2.totalSupply()).to.equal(0);
    expect(await supeRareV2.balanceOf(creator.address)).to.equal(0);
  });
});
