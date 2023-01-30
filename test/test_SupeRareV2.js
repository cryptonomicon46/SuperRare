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

    it("SupeRareV2 Deposit getAddedToWhitelist: Owner of an V1 NFT gets whitelisted", async function () {
      const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
        deployTokenFixture
      );

      await expect(
        supeRareV2.connect(addr1).getAddedToWhitelist(1)
      ).to.be.revertedWith(
        "SupeRareV2: Sender isn't the owner of the V1 Token!"
      );

      await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
        .to.emit(supeRareV2, "OwnerWhitelisted")
        .withArgs(creator.address, 1);
    });

    it("SupeRareV2 Deposit getAddedToWhitelist again: Owner of tries to get whitelisted again", async function () {
      const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
        deployTokenFixture
      );

      await expect(
        supeRareV2.connect(addr1).getAddedToWhitelist(1)
      ).to.be.revertedWith(
        "SupeRareV2: Sender isn't the owner of the V1 Token!"
      );

      await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
        .to.emit(supeRareV2, "OwnerWhitelisted")
        .withArgs(creator.address, 1);

      await expect(
        supeRareV2.connect(creator).getAddedToWhitelist(1)
      ).to.be.revertedWith("SupeRareV2: Account already whitelisted!");
    });

    it("SupeRareV2 Deposit setPeg: V1:V2 peg checked after v1 owner transfers the v1 token to this contract", async function () {
      const { supeRare, supeRareV2, owner, addr1, creator } = await loadFixture(
        deployTokenFixture
      );
      await expect(supeRareV2.connect(addr1).setPeg(1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(supeRareV2.setPeg(1)).to.be.revertedWith(
        "SupeRareV2: Unable to peg the V1 token!"
      );

      await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
        .to.emit(supeRare, "Transfer")
        .withArgs(creator.address, supeRareV2.address, 1);

      await expect(supeRareV2.connect(owner).setPeg(1))
        .to.emit(supeRareV2, "Pegged")
        .withArgs(1);
    });

    it("SupeRareV2 Deposits verify balances: V1 Onwer gets whitelisted, transfers V1 token check balances before and after ", async function () {
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
  });
  describe("SupeRareV2 TokenURI: Tests related to setting TokenURI/BaseURI", function () {
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
          .addNewTokenWithEditions("", 1, parseEther("1"))
      ).to.emit(supeRare, "SalePriceSet");
      // await expect(
      //   supeRare
      //     .connect(creator)
      //     .addNewTokenWithEditions("NewEditions_20", 20, parseEther("1"))
      // ).to.emit(supeRare, "SalePriceSet");

      return { supeRare, supeRareV2, owner, addr1, creator };
    }

    it("SupeRareV2 SetTokenURI: Owner sets the tokenURI on the v2 contract", async function () {
      const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
        .to.emit(supeRareV2, "OwnerWhitelisted")
        .withArgs(creator.address, 1);

      await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
        .to.emit(supeRare, "Transfer")
        .withArgs(creator.address, supeRareV2.address, 1);

      await expect(supeRareV2.connect(owner).setPeg(1))
        .to.emit(supeRareV2, "Pegged")
        .withArgs(1);

      await expect(supeRareV2.connect(creator).mintV2(1))
        .to.be.emit(supeRareV2, "MintV2")
        .withArgs(creator.address, 1);

      await expect(
        supeRareV2.connect(addr1).setTokenURI(1, "V2EditionTokenURI.json")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        supeRareV2.connect(owner).setTokenURI(1, "V2EditionTokenURI.json")
      )
        .to.emit(supeRareV2, "TokenURISet")
        .withArgs(1, "V2EditionTokenURI.json");
    });
    it("SupeRareV2 SetBaseURI: Owner sets the baseURI on the v2 contract", async function () {
      const { supeRare, supeRareV2, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
        .to.emit(supeRareV2, "OwnerWhitelisted")
        .withArgs(creator.address, 1);

      await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
        .to.emit(supeRare, "Transfer")
        .withArgs(creator.address, supeRareV2.address, 1);

      await expect(supeRareV2.connect(owner).setPeg(1))
        .to.emit(supeRareV2, "Pegged")
        .withArgs(1);

      await expect(supeRareV2.connect(creator).mintV2(1))
        .to.be.emit(supeRareV2, "MintV2")
        .withArgs(creator.address, 1);

      await expect(
        supeRareV2.connect(addr1).setBaseURI("baseURI_tag")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(supeRareV2.connect(owner).setBaseURI("baseURI_tag"))
        .to.emit(supeRareV2, "BaseURISet")
        .withArgs("baseURI_tag");
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

      console.log(
        `Balance of creator on v1 contract before transfer ${await supeRare.balanceOf(
          creator.address
        )}`
      );

      console.log(
        `Balance of superRareV2 on v1 contract before transfer ${await supeRareV2.balanceOf(
          creator.address
        )}`
      );

      console.log(
        `TotalSupply on v1 contract is ${await supeRare.totalSupply()}`
      );

      await expect(supeRareV2.connect(creator).getAddedToWhitelist(1))
        .to.emit(supeRareV2, "OwnerWhitelisted")
        .withArgs(creator.address, 1);

      await expect(supeRare.connect(creator).transfer(supeRareV2.address, 1))
        .to.emit(supeRare, "Transfer")
        .withArgs(creator.address, supeRareV2.address, 1);

      console.log(
        `Balance of creator on v1 contract after transfer ${await supeRare.balanceOf(
          creator.address
        )}`
      );

      console.log(
        `Balance of superRareV2 on v1 contract after transfer ${await supeRare.balanceOf(
          supeRareV2.address
        )}`
      );

      await expect(supeRareV2.connect(owner).setPeg(1))
        .to.emit(supeRareV2, "Pegged")
        .withArgs(1);

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
      expect(await supeRare.balanceOf(creator.address)).to.equal(1);

      await expect(supeRareV2.connect(addr1).withdraw(1)).to.be.revertedWith(
        "SupeRareV2: Sender isn't the owner of the V2 token!"
      );
      await expect(supeRareV2.connect(creator).withdraw(1))
        .to.be.emit(supeRareV2, "WithdrawV1")
        .withArgs(creator.address, 1);

      //   expect(await supeRare.balanceOf(supeRareV2.address)).to.equal(0);
      expect(await supeRare.balanceOf(creator.address)).to.equal(2);

      //   expect((await supeRare.tokensOf(supeRareV2.address))[0]).to.equal(
      //     BigNumber.from("1")
      //   );
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
