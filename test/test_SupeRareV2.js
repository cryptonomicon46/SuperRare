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

describe("SupeRareV2 Test Suit: Basics", function () {
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
  it("SupeRareV2 Deposit: Owner of an V1 NFT cannot deposit if contract is halted", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(owner).ToggleContract())
      .to.emit(supeRareV2, "ToggleStartStop")
      .withArgs(true);

    expect(await supeRareV2.contract_status()).to.be.equal(true);

    await expect(supeRareV2.connect(creator).deposit_V1(10)).to.be.revertedWith(
      "DEPOSITS_DISABLED"
    );
  });

  it("SupeRareV2 Deposit: Creator of V1 Tokens not allowed to deposit non-existent V1 NFT", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit_V1(50)).to.be.reverted;
    // ("SupeRareV2: Not the Owner of the SupeRareV1 Token!");
    // await expect(supeRareV2.connect(creator).deposit_V1(50)).to.be.revertedWith(
    //   "SupeRareV2: Not the Owner of the SupeRareV1 Token!"
    // );
  });
  it("SupeRareV2 Deposit: Owner of an V1 NFT allowed to deposit an NFT and mints a V2 Token", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit_V1(10))
      .to.emit(supeRareV2, "Transfer")
      .withArgs(BigNumber.from(0), creator.address, 10);

    expect(await supeRareV2.balanceOf(creator.address)).to.be.equal(1);
    expect(await supeRareV2.totalSupply()).to.be.equal(1);
  });

  it("SupeRareV2 Deposit: Owner of an V1 NFT tries to deposit an NFT with invalid TokenURI", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareV2.connect(creator).deposit_V1(1)).to.be.revertedWith(
      "SupeRareV2: Invalid V1 TokenURI!"
    );
  });

  it("SupeRareV2 Deposit: Check TokenURI of a V1 NFT deposit", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    await expect(supeRareV2.connect(creator).deposit_V1(20))
      .to.emit(supeRareV2, "Transfer")
      .withArgs(BigNumber.from(0), creator.address, 20);

    expect(await supeRareV2.tokenURI(20)).to.be.equal("NewEditions_20");
    expect(await supeRareV2.balanceOf(creator.address)).to.be.equal(1);
  });
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

  it("SupeRareV2 Withdraw", async function () {
    const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    for (let i = 1; i <= 21; i++) {
      await expect(supeRareV2.connect(creator).deposit_V1(i))
        .to.emit(supeRareV2, "Transfer")
        .withArgs(BigNumber.from(0), creator.address, i);
    }
    for (let i = 1; i <= 21; i++) {
      await expect(supeRareV2.connect(creator).Withdraw_V1(i))
        .to.emit(supeRareV2, "Transfer")
        .withArgs(creator.address, BigNumber.from(0), i);
    }
  });
});

describe("SupeRareV2 SafeTransfer Tests", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    //console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const Eschrow = await ethers.getContractFactory("Eschrow");
    //console.log("Deploying Eschrow ...\n");
    const eschrow = await Eschrow.deploy();
    await eschrow.deployed();

    const EschrowERC721 = await ethers.getContractFactory("EschrowERC721");
    //console.log("Deploying EschrowERC721 ...\n");
    const eschrowERC721 = await EschrowERC721.deploy();
    await eschrowERC721.deployed();

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

    return {
      supeRare,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      eschrowERC721,
    };
  }

  it("SupeRareV2 SafeTransfer _exists: Creator tries to transfer a tokenID that doesn't exist", async function () {
    const {
      supeRare,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      eschrowERC721,
    } = await loadFixture(deployTokenFixture);
    // for (let i = 1; i <= 21; i++) {
    await expect(supeRareV2.connect(creator).deposit_V1(1))
      .to.emit(supeRareV2, "Transfer")
      .withArgs(BigNumber.from(0), creator.address, 1);
    // }

    // for (let i = 1; i <= 21; i++) {
    await expect(
      supeRareV2
        .connect(creator)
        .safeTransferToEschrow(
          creator.address,
          eschrowERC721.address,
          3,
          "0x00"
        )
    ).to.be.revertedWith("ERC721: operator query for nonexistent token");
    //   emit(supeRareV2, "Transfer")
    //   .withArgs(creator.address, eschrowERC721.address, i);
    // }
  });

  it("SupeRareV2 SafeTransfer Success: Creator initiates safeTransfer to an ERC721 compliant Eschrow contract", async function () {
    const {
      supeRare,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      eschrowERC721,
    } = await loadFixture(deployTokenFixture);
    for (let i = 1; i <= 21; i++) {
      await expect(supeRareV2.connect(creator).deposit_V1(i))
        .to.emit(supeRareV2, "Transfer")
        .withArgs(BigNumber.from(0), creator.address, i);
    }

    for (let i = 1; i <= 21; i++) {
      await expect(
        supeRareV2
          .connect(creator)
          .safeTransferToEschrow(
            creator.address,
            eschrowERC721.address,
            i,
            "0x00"
          )
      )
        .to.emit(supeRareV2, "Transfer")
        .withArgs(creator.address, eschrowERC721.address, i);
    }

    expect(await supeRareV2.balanceOf(eschrowERC721.address)).to.be.equal(21);
  });

  it("SupeRareV2 SafeTransfer Fail: Creator initiates safeTransfer to an NON-ERC721 compliant Eschrow contract", async function () {
    const {
      supeRare,
      supeRareV2,
      owner,
      addr1,
      creator,
      eschrow,
      eschrowERC721,
    } = await loadFixture(deployTokenFixture);

    await expect(supeRareV2.connect(creator).deposit_V1(10))
      .to.emit(supeRareV2, "Transfer")
      .withArgs(BigNumber.from(0), creator.address, 10);

    await expect(
      supeRareV2
        .connect(creator)
        .safeTransferToEschrow(creator.address, eschrow.address, 10, "0x00")
    ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
  });
});
