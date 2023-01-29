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

const NAME_V2 = "SupeRareWrapper";
const SYMBOL_V2 = "SUPRV2";
const NAME = "SupeRare";
const SYMBOL = "SUPR";

describe("SupeRareWrapper Test Suit: The Basics", function () {
  async function deployTokenFixture() {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
    //console.log("Deploying SupeRareWrapper ...\n");
    const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
    await supeRareWrapper.deployed();

    ////console.log("SupeRare contract deployed at:", supeRare.address);
    ////console.log("Deployer Address", owner.address);

    return { supeRare, supeRareWrapper, owner, addr1, addr2 };
  }

  it("SupeRareWrapper Deployed: check contract address to be a proper address", async function () {
    const { supeRareWrapper } = await loadFixture(deployTokenFixture);
    expect(supeRareWrapper.address).to.be.a.properAddress;
  });

  it("SupeRareWrapper Name: check the name of the V2 token", async function () {
    const { supeRareWrapper } = await loadFixture(deployTokenFixture);
    expect(await supeRareWrapper.name()).to.be.equal(NAME_V2);
  });

  it("SupeRareWrapper Symbol: check the symbol of the V2 token", async function () {
    const { supeRareWrapper } = await loadFixture(deployTokenFixture);
    expect(await supeRareWrapper.symbol()).to.be.equal(SYMBOL_V2);
  });

  it("SupeRareWrapper Owner: Check owner or the deployer of the contract", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);
    expect(await supeRareWrapper.owner()).to.be.equal(owner.address);
  });

  it("SupeRareWrapper transferOwnership: Only owner can transfer ownership", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);

    await expect(
      supeRareWrapper.connect(addr1).transferOwnership(addr1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("SupeRareWrapper TransferOwnership to new Owner: Check address of the new owner", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);

    await expect(
      supeRareWrapper.connect(owner).transferOwnership(addr1.address)
    )
      .to.emit(supeRareWrapper, "OwnershipTransferred")
      .withArgs(owner.address, addr1.address);

    expect(await supeRareWrapper.owner()).to.be.equal(addr1.address);
  });
  it("SupeRareWrapper StopDeposits: Only owner can toggle ON/OFF deposits", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);
    await expect(
      supeRareWrapper.connect(addr1).ToggleContract()
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(supeRareWrapper.connect(owner).ToggleContract())
      .to.emit(supeRareWrapper, "ToggleStartStop")
      .withArgs(true);
  });

  it("SupeRareWrapper StopDeposits: Owner toggles the contract to stop deposits", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);
    await expect(supeRareWrapper.connect(owner).ToggleContract())
      .to.emit(supeRareWrapper, "ToggleStartStop")
      .withArgs(true);

    expect(await supeRareWrapper.contract_status()).to.be.equal(true);

    await expect(supeRareWrapper.connect(owner).ToggleContract())
      .to.emit(supeRareWrapper, "ToggleStartStop")
      .withArgs(false);

    expect(await supeRareWrapper.contract_status()).to.be.equal(false);
  });
});

describe("SupeRareWrapper Deposits: Tests related to depositing an NFT", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
    //console.log("Deploying SupeRareWrapper ...\n");
    const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
    await supeRareWrapper.deployed();
    //console.log(`supeRareWrapper contract deployed at ${supeRareWrapper.address}`);

    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(
      supeRare.connect(creator).addNewTokenWithEditions("", 1, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");
    await expect(
      supeRare
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_20", 20, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");

    return { supeRare, supeRareWrapper, owner, addr1, creator };
  }

  it("SupeRareWrapper Deposit: Owner of an V1 NFT cannot deposit token, if contract's stopped due to an issue.", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, creator } =
      await loadFixture(deployTokenFixture);

    await expect(supeRareWrapper.connect(owner).ToggleContract())
      .to.emit(supeRareWrapper, "ToggleStartStop")
      .withArgs(true);

    expect(await supeRareWrapper.contract_status()).to.be.equal(true);

    await expect(
      supeRareWrapper.connect(creator).deposit(10)
    ).to.be.revertedWith("DEPOSITS_DISABLED");
  });

  it("SupeRareWrapper Deposit NFT: Owner of an V1 NFT allowed to deposit an NFT and mints a token on the v2 contract", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, creator } =
      await loadFixture(deployTokenFixture);

    await expect(supeRareWrapper.connect(creator).deposit(10))
      .to.emit(supeRareWrapper, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    expect(await supeRareWrapper.balanceOf(creator.address)).to.be.equal(1);
    expect(await supeRareWrapper.totalSupply()).to.be.equal(1);
    const Position = await supeRareWrapper.getOwnerPosition(10);
    expect(Position[0]).to.be.equal(creator.address);
    expect(Position[1]).to.be.equal(10);
    expect(Position[2]).to.be.equal("NewEditions_20");
  });

  it("SupeRareWrapper Deposit Duplicate NFT: Owner of tries to deposit the same token again.", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, creator } =
      await loadFixture(deployTokenFixture);

    await expect(supeRareWrapper.connect(creator).deposit(10))
      .to.emit(supeRareWrapper, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    await expect(
      supeRareWrapper.connect(creator).deposit(10)
    ).to.be.revertedWith("ERC721: token already minted");
  });

  it("SupeRareWrapper SetTokenURI: Owner sets the tokwnURI on the v2 contract", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);

    await expect(supeRareWrapper.connect(creator).deposit(10))
      .to.emit(supeRareWrapper, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    expect(await supeRareWrapper.balanceOf(creator.address)).to.be.equal(1);

    await expect(
      supeRareWrapper.connect(addr1).setTokenURI(10, "V2EditionTokenURI.json")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      supeRareWrapper.connect(owner).setTokenURI(1, "V2EditionTokenURI.json")
    ).to.be.revertedWith("ERC721Metadata: URI set of nonexistent token");

    await expect(
      supeRareWrapper.connect(owner).setTokenURI(10, "V2EditionTokenURI.json")
    )
      .to.emit(supeRareWrapper, "TokenURISet")
      .withArgs(10, "V2EditionTokenURI.json");
  });
  it("SupeRareWrapper SetBaseURI: Owner sets the BaseURI on the v2 contract", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);

    await expect(supeRareWrapper.connect(creator).deposit(10))
      .to.emit(supeRareWrapper, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    expect(await supeRareWrapper.balanceOf(creator.address)).to.be.equal(1);

    await expect(
      supeRareWrapper.connect(addr1).setBaseURI("V2BASE_URI")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(supeRareWrapper.connect(owner).setBaseURI("V2BASE_URI"))
      .to.emit(supeRareWrapper, "BaseURISet")
      .withArgs("V2BASE_URI");
  });

  describe("SupeRareWrapper Withdraw: Tests related to withdrawing an NFT", function () {
    async function deployTokenFixture() {
      [owner, addr1, creator] = await ethers.getSigners();

      const SupeRare = await ethers.getContractFactory("SupeRare");
      //console.log("Deploying SupeRare ...\n");
      const supeRare = await SupeRare.deploy();
      await supeRare.deployed();

      const SupeRareWrapper = await ethers.getContractFactory(
        "SupeRareWrapper"
      );
      //console.log("Deploying SupeRareWrapper ...\n");
      const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
      await supeRareWrapper.deployed();
      //console.log(`supeRareWrapper contract deployed at ${supeRareWrapper.address}`);

      await expect(supeRare.connect(owner).whitelistCreator(creator.address))
        .to.emit(supeRare, "WhitelistCreator")
        .withArgs(creator.address);

      await expect(
        supeRare
          .connect(creator)
          .addNewTokenWithEditions("NewEditions_20", 20, parseEther("1"))
      ).to.emit(supeRare, "SalePriceSet");

      return { supeRare, supeRareWrapper, owner, addr1, creator };
    }

    it("SupeRareWrapper Withdraw: Owner deposits V1 tokens, then tries to withdraw them", async function () {
      const { supeRare, supeRareWrapper, owner, addr1, creator } =
        await loadFixture(deployTokenFixture);

      await expect(supeRareWrapper.connect(creator).deposit(10))
        .to.emit(supeRareWrapper, "PositionCreated")
        .withArgs(creator.address, 10, "NewEditions_20");

      await expect(supeRareWrapper.connect(creator).withdraw(10))
        .to.emit(supeRareWrapper, "PositionDeleted")
        .withArgs(creator.address, 10);
    });

    it("SupeRareWrapper Withdraw after V1 Transfer: Owner deposits V1 token and new owner of V1 tries to withdraw it", async function () {
      const { supeRare, supeRareWrapper, owner, addr1, creator } =
        await loadFixture(deployTokenFixture);

      await expect(supeRareWrapper.connect(creator).deposit(10))
        .to.emit(supeRareWrapper, "PositionCreated")
        .withArgs(creator.address, 10, "NewEditions_20");

      await expect(supeRare.connect(creator).transfer(addr1.address, 10))
        .to.emit(supeRare, "Transfer")
        .withArgs(creator.address, addr1.address, 10);

      await expect(supeRareWrapper.connect(addr1).withdraw(10))
        .to.emit(supeRareWrapper, "PositionDeleted")
        .withArgs(addr1.address, 10);
    });
  });
});
