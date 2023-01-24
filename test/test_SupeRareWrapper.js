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

describe("SupeRareWrapper Test Suit: Basics", function () {
  async function deployTokenFixture() {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
    console.log("Deploying SupeRareWrapper ...\n");
    const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
    await supeRareWrapper.deployed();

    // console.log("SupeRare contract deployed at:", supeRare.address);
    // console.log("Deployer Address", owner.address);

    return { supeRare, supeRareWrapper, owner, addr1, addr2 };
  }

  it("SupeRare Deployed: check contract address to be a proper address", async function () {
    const { supeRare } = await loadFixture(deployTokenFixture);
    expect(supeRare.address).to.be.a.properAddress;
  });

  it("SupeRareWrapper Deployed: check contract address to be a proper address", async function () {
    const { supeRareWrapper } = await loadFixture(deployTokenFixture);
    expect(supeRareWrapper.address).to.be.a.properAddress;
  });

  it("Name: check the name of the token", async function () {
    const { supeRare } = await loadFixture(deployTokenFixture);
    expect(await supeRare.name()).to.be.equal(NAME);
  });

  it("Symbol: check the symbol of the token", async function () {
    const { supeRare } = await loadFixture(deployTokenFixture);
    expect(await supeRare.symbol()).to.be.equal(SYMBOL);
  });

  it("Only owner can create the Whitelist", async function () {
    const { supeRare, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRare.connect(addr2.address).whitelistCreator(addr1.address)
    ).to.be.reverted;

    await expect(supeRare.connect(owner).whitelistCreator(addr2.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(addr2.address);
  });

  it("IsWhiteListed: Check if an account is whitelisted", async function () {
    const { supeRare, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRare.connect(owner).whitelistCreator(addr2.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(addr2.address);

    let whiteListAddr = await supeRare.isWhitelisted(addr2.address);
    expect(whiteListAddr).to.be.true;

    whiteListAddr = await supeRare.isWhitelisted(addr1.address);
    expect(whiteListAddr).to.be.false;
  });

  it("MaintainerPercentage: Check default value and change it.", async function () {
    const { supeRare, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    let maintainer_per = await supeRare.maintainerPercentage();
    // console.log(maintainer_per);

    expect(maintainer_per).to.equal(30);

    await expect(supeRare.connect(addr2.address).setMaintainerPercentage(5)).to
      .be.reverted;

    maintainer_per = await supeRare.maintainerPercentage();
    expect(maintainer_per).to.equal(30);

    await supeRare.connect(owner).setMaintainerPercentage(5);

    maintainer_per = await supeRare.maintainerPercentage();
    expect(maintainer_per).to.equal(5);
  });

  it("CreatorPercentage: Check default value and change it.", async function () {
    const { supeRare, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    let creator_per = await supeRare.creatorPercentage();
    // console.log(creator_per);

    expect(creator_per).to.equal(100);

    await expect(supeRare.connect(addr2.address).setCreatorPercentage(5)).to.be
      .reverted;

    creator_per = await supeRare.creatorPercentage();
    expect(creator_per).to.equal(100);

    await supeRare.connect(owner).setCreatorPercentage(20);

    creator_per = await supeRare.creatorPercentage();
    expect(creator_per).to.equal(20);
  });

  it("AddNewToken: Check the TotalSupply, tokenId and URI", async function () {
    const { supeRare, owner, addr1 } = await loadFixture(deployTokenFixture);

    await expect(supeRare.connect(owner).whitelistCreator(addr1.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(addr1.address);

    await supeRare.connect(addr1).addNewToken("NewEditions_10");
    expect(await supeRare.totalSupply()).to.equal(1);
    const tokenId = await supeRare.tokensOf(addr1.address);
    console.log(ethers.BigNumber.from(1), tokenId[0]);
    expect(tokenId[0]).to.be.equal(ethers.BigNumber.from("1"));
    expect(await supeRare.tokenURI(tokenId[0])).to.equal("NewEditions_10");
  });
});

describe("Creator creates SupeRare token: Tests", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();
    // console.log("SupeRare contract deployed at:", supeRare.address);
    // console.log("Deployer Address", owner.address);
    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(
      supeRare
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_10", 10, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");

    return { supeRare, owner, addr1, creator };
  }

  it("AddNewTokenEdition: Create new tokens and check totalSupply", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let totalSupply = await supeRare.totalSupply();
    expect(totalSupply).to.equal(11);
  });

  it("AddNewTokenEdition: Check TokenURIs", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await supeRare.tokenURI(i)).to.be.equal("NewEditions_10");
    }
  });

  it("AddNewTokenEdition: Check SalePriceOfTokens", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    for (let i = 1; i <= 11; i++) {
      i == 1
        ? expect(await supeRare.salePriceOfToken(i)).to.be.equal(0)
        : expect(await supeRare.salePriceOfToken(i)).to.be.equal(
            parseEther("1")
          );
    }
  });

  it("AddNewTokenEdition: Check OwnerOf and CreatorOf tokenIds", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await supeRare.ownerOf(i)).to.be.equal(creator.address);
      expect(await supeRare.creatorOfToken(i)).to.be.equal(creator.address);
    }
  });

  it("AddNewTokenEdition: Check all tokens belonging to the owner", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    const tokensOfOwner = await supeRare.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));
  });

  it("AddNewTokenEdition: Check balance of Owner", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await supeRare.balanceOf(creator.address)).to.equal(11);
  });

  it("AddNewTokenEdition: Check Original token URI", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    const tokensOfOwner = await supeRare.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

    expect(await supeRare.originalTokenOfUri("NewEditions_10")).to.equal("1");
  });

  //   it("AddNewTokenEdition: Transfer Ownership of a token", async function () {
  //     const { supeRare, owner, addr1, creator } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     const tokensOfOwner = await supeRare.tokensOf(creator.address);
  //     tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

  //     await supeRare.connect(creator).transfer(addr1.address, 6);
  //     expect(await supeRare.ownerOf(6).to.be.equal(addr1.address));
  //   });
});

describe("Creator creates SupeRare token: Tests", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();
    // console.log("SupeRare contract deployed at:", supeRare.address);
    // console.log("Deployer Address", owner.address);
    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(
      supeRare
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_10", 10, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");

    return { supeRare, owner, addr1, creator };
  }

  it("AddNewTokenEdition: Create new tokens and check totalSupply", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let totalSupply = await supeRare.totalSupply();
    expect(totalSupply).to.equal(11);
  });

  it("AddNewTokenEdition: Check TokenURIs", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await supeRare.tokenURI(i)).to.be.equal("NewEditions_10");
    }
  });

  it("AddNewTokenEdition: Check SalePriceOfTokens", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    for (let i = 1; i <= 11; i++) {
      i == 1
        ? expect(await supeRare.salePriceOfToken(i)).to.be.equal(0)
        : expect(await supeRare.salePriceOfToken(i)).to.be.equal(
            parseEther("1")
          );
    }
  });

  it("AddNewTokenEdition: Check OwnerOf and CreatorOf tokenIds", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    let tokenURI;
    for (let i = 1; i <= 11; i++) {
      expect(await supeRare.ownerOf(i)).to.be.equal(creator.address);
      expect(await supeRare.creatorOfToken(i)).to.be.equal(creator.address);
    }
  });

  it("AddNewTokenEdition: Check all tokens belonging to the owner", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );
    const tokensOfOwner = await supeRare.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));
  });

  it("AddNewTokenEdition: Check balance of Owner", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    expect(await supeRare.balanceOf(creator.address)).to.equal(11);
  });

  it("AddNewTokenEdition: Check Original token URI", async function () {
    const { supeRare, owner, addr1, creator } = await loadFixture(
      deployTokenFixture
    );

    const tokensOfOwner = await supeRare.tokensOf(creator.address);
    tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

    expect(await supeRare.originalTokenOfUri("NewEditions_10")).to.equal("1");
  });

  //   it("AddNewTokenEdition: Transfer Ownership of a token", async function () {
  //     const { supeRare, owner, addr1, creator } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     const tokensOfOwner = await supeRare.tokensOf(creator.address);
  //     tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

  //     await supeRare.connect(creator).transfer(addr1.address, 6);
  //     expect(await supeRare.ownerOf(6).to.be.equal(addr1.address));
  //   });
});

describe("Safe Transfer Function Tests", function () {
  async function deployTokenFixture() {
    [owner, addr1, creator] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();

    const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
    console.log("Deploying SupeRareWrapper ...\n");
    const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
    await supeRareWrapper.deployed();
    console.log(
      `supeRareWrapper contract deployed at ${supeRareWrapper.address}`
    );

    const Eschrow = await ethers.getContractFactory("Eschrow");
    console.log("Deploying Eschrow contract...");
    const eschrow = await Eschrow.deploy();
    await eschrow.deployed();
    console.log(`Eschrow contract deployed at ${eschrow.address}`);

    await expect(supeRare.connect(owner).whitelistCreator(creator.address))
      .to.emit(supeRare, "WhitelistCreator")
      .withArgs(creator.address);

    await expect(
      supeRare
        .connect(creator)
        .addNewTokenWithEditions("NewEditions_10", 1, parseEther("1"))
    ).to.emit(supeRare, "SalePriceSet");

    return { supeRare, supeRareWrapper, eschrow, owner, addr1, creator };
  }
  it("SafeTransfer: Check if Eschrow contract is a valid address", async function () {
    const { eschrow } = await loadFixture(deployTokenFixture);
    expect(eschrow.address).to.be.a.properAddress;
  });

  it("Transfer NFT to WrapperContract : Creator transfers NFT, check WrapperContract's balance", async function () {
    const { supeRare, supeRareWrapper, owner, addr1, creator } =
      await loadFixture(deployTokenFixture);

    await supeRare.connect(creator).transfer(supeRareWrapper.address, 2);
    console.log(
      `Tokens of supeRareWrapper:${await supeRare.tokensOf(
        supeRareWrapper.address
      )}`
    );
    const tokenId = await supeRare.tokensOf(supeRareWrapper.address);
    expect(tokenId[0]).to.equal(BigNumber.from(2));
  });

  it("WrapperContract ST to Eschrow: Wrapper contract invokes safeTransfer into Eschrow contract", async function () {
    const { supeRare, supeRareWrapper, eschrow, owner, addr1, creator } =
      await loadFixture(deployTokenFixture);

    await supeRare.connect(creator).transfer(supeRareWrapper.address, 2);
    console.log(
      `Tokens of supeRareWrapper:${await supeRare.tokensOf(
        supeRareWrapper.address
      )}`
    );
    let tokenId = await supeRare.tokensOf(supeRareWrapper.address);
    expect(tokenId[0]).to.equal(BigNumber.from(2));

    // let tokenIdEschrow = await supeRare.tokensOf(eschrow.address);
    // expect(tokenIdEschrow[0]).to.equal(BigNumber.from(2));
    console.log(`Owner of WrapperContract:${await supeRareWrapper.getOwner()}`);
    console.log(
      `Original SupeRare Contract:${await supeRareWrapper.getSupeRareAddress()}`
    );

    await supeRareWrapper
      .connect(owner)
      .safeTransfer(
        supeRareWrapper.address,
        eschrow.address,
        BigNumber.from(2),
        "0x00"
      );
  });
});
