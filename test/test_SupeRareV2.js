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

const NAME_V2 = "SupeRareV2";
const SYMBOL_V2 = "SUPRV2";
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
    expect(await supeRareV2.name()).to.be.equal(NAME_V2);
  });

  it("SupeRareV2 Symbol: check the symbol of the V2 token", async function () {
    const { supeRareV2 } = await loadFixture(deployTokenFixture);
    expect(await supeRareV2.symbol()).to.be.equal(SYMBOL_V2);
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
  it("SupeRareV2 StopDeposits: Only owner can toggle ON/OFF deposits", async function () {
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    await expect(supeRareV2.connect(addr1).ToggleContract()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    await expect(supeRareV2.connect(owner).ToggleContract())
      .to.emit(supeRareV2, "ToggleStartStop")
      .withArgs(true);
  });

  it("SupeRareV2 StopDeposits: Owner toggles the contract to stop deposits", async function () {
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    await expect(supeRareV2.connect(owner).ToggleContract())
      .to.emit(supeRareV2, "ToggleStartStop")
      .withArgs(true);

    expect(await supeRareV2.contract_status()).to.be.equal(true);

    await expect(supeRareV2.connect(owner).ToggleContract())
      .to.emit(supeRareV2, "ToggleStartStop")
      .withArgs(false);

    expect(await supeRareV2.contract_status()).to.be.equal(false);
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

    await expect(
      supeRare.connect(creator).addNewTokenWithEditions("", 1, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");
    await expect(
      supeRare
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_20", 20, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");

    return { supeRare, supeRareV2, owner, addr1, creator };
  }

  it("SupeRareV2 Deposit: Owner of an V1 NFT cannot deposit token, if contract's stopped due to an issue.", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(owner).ToggleContract())
      .to.emit(supeRareV2, "ToggleStartStop")
      .withArgs(true);

    expect(await supeRareV2.contract_status()).to.be.equal(true);

    await expect(supeRareV2.connect(creator).deposit(10)).to.be.revertedWith(
      "DEPOSITS_DISABLED"
    );
  });

  it("SupeRareV2 Deposit NFT: Owner of an V1 NFT allowed to deposit an NFT and mints a token on the v2 contract", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit(10))
      .to.emit(supeRareV2, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    expect(await supeRareV2.balanceOf(creator.address)).to.be.equal(1);
    expect(await supeRareV2.totalSupply()).to.be.equal(1);
    const Position = await supeRareV2.getOwnerPosition(10);
    expect(Position[0]).to.be.equal(creator.address);
    expect(Position[1]).to.be.equal(10);
    expect(Position[2]).to.be.equal("NewEditions_20");
  });

  it("SupeRareV2 Deposit Duplicate NFT: Owner of tries to deposit the same token again.", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit(10))
      .to.emit(supeRareV2, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    await expect(supeRareV2.connect(creator).deposit(10)).to.be.revertedWith(
      "ERC721: token already minted"
    );
  });

  it("SupeRareV2 SetTokenURI: Owner sets the tokwnURI on the v2 contract", async function () {
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit(10))
      .to.emit(supeRareV2, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    expect(await supeRareV2.balanceOf(creator.address)).to.be.equal(1);

    await expect(
      supeRareV2.connect(addr1).setTokenURI(10, "V2EditionTokenURI.json")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      supeRareV2.connect(owner).setTokenURI(1, "V2EditionTokenURI.json")
    ).to.be.revertedWith("ERC721Metadata: URI set of nonexistent token");

    await expect(
      supeRareV2.connect(owner).setTokenURI(10, "V2EditionTokenURI.json")
    )
      .to.emit(supeRareV2, "TokenURISet")
      .withArgs(10, "V2EditionTokenURI.json");
  });
  it("SupeRareV2 SetBaseURI: Owner sets the BaseURI on the v2 contract", async function () {
    const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit(10))
      .to.emit(supeRareV2, "PositionCreated")
      .withArgs(creator.address, 10, "NewEditions_20");

    expect(await supeRareV2.balanceOf(creator.address)).to.be.equal(1);

    await expect(
      supeRareV2.connect(addr1).setBaseURI("V2BASE_URI")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(supeRareV2.connect(owner).setBaseURI("V2BASE_URI"))
      .to.emit(supeRareV2, "BaseURISet")
      .withArgs("V2BASE_URI");
  });

  describe("SupeRareV2 Withdraw: Tests related to withdrawing an NFT", function () {
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

      await expect(
        supeRare
          .connect(creator)
          .addNewTokenWithEditions("NewEditions_20", 20, parseEther("1"))
      ).to.emit(supeRare, "SalePriceSet");

      return { supeRare, supeRareV2, owner, addr1, creator };
    }

    it("SupeRareV2 Withdraw: Owner deposits V1 tokens, then tries to withdraw them", async function () {
      const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
        deployTokenFixture
      );

      await expect(supeRareV2.connect(creator).deposit(10))
        .to.emit(supeRareV2, "PositionCreated")
        .withArgs(creator.address, 10, "NewEditions_20");

      await expect(supeRareV2.connect(creator).withdraw(10))
        .to.emit(supeRareV2, "PositionDeleted")
        .withArgs(creator.address, 10);
    });

    it("SupeRareV2 Withdraw after V1 Transfer: Owner deposits V1 token and new owner of V1 tries to withdraw it", async function () {
      const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
        deployTokenFixture
      );

      await expect(supeRareV2.connect(creator).deposit(10))
        .to.emit(supeRareV2, "PositionCreated")
        .withArgs(creator.address, 10, "NewEditions_20");

      await expect(supeRare.connect(creator).transfer(addr1.address, 10))
        .to.emit(supeRare, "Transfer")
        .withArgs(creator.address, addr1.address, 10);

      await expect(supeRareV2.connect(addr1).withdraw(10))
        .to.emit(supeRareV2, "PositionDeleted")
        .withArgs(addr1.address, 10);
    });
  });
});
