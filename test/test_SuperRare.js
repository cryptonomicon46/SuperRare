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

describe("SupeRare Test Suit: ERC721 Compatible Contract", function () {
  async function deployTokenFixture() {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SupeRare = await ethers.getContractFactory("SupeRare");
    console.log("Deploying SupeRare ...\n");
    const supeRare = await SupeRare.deploy();
    await supeRare.deployed();
    console.log("SupeRare contract deployed at:", supeRare.address);
    console.log("Deployer Address", owner.address);

    return { supeRare, owner, addr1, addr2 };
  }

  it("Contract Deployed: check contract address to be a proper address", async function () {
    const { supeRare } = await loadFixture(deployTokenFixture);
    expect(supeRare.address).to.be.a.properAddress;
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

  it("Read maintainer %, but only owner can change the value", async function () {
    const { supeRare, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    let maintainer_per = await supeRare.maintainerPercentage();
    console.log(maintainer_per);

    expect(maintainer_per).to.equal(30);

    await expect(supeRare.connect(addr2.address).setMaintainerPercentage(5)).to
      .be.reverted;

    expect(await supeRare.maintainerPercentage).to.equal(30);

    await supeRare.connect(owner).setMaintainerPercentage(30);

    await supeRare.connect(owner.address).setMaintainerPercentage(5);
    expect(await supeRare.maintainerPercentage).to.equal(5);
  });

  //   it("Intial balance: check owner's initial balance", async function () {
  //     const { weth_token, owner } = await loadFixture(deployTokenFixture);

  //     const owner_initialBal = await weth_token.balanceOf(owner.address);
  //     console.log(owner_initialBal);
  //     expect(owner_initialBal).to.equal("0");
  //   });

  //   it("Check Decimal: Check the decimal places for the Fusion token.", async function () {
  //     const { weth_token } = await loadFixture(deployTokenFixture);
  //     const decimal = await weth_token.decimal();
  //     console.log(decimal);
  //     expect(decimal).to.be.equal(DECIMAL);
  //   });

  //   it("Check owner address: Confirm the contract owner address.", async function () {
  //     const { weth_token, owner } = await loadFixture(deployTokenFixture);
  //     expect(await weth_token.owner()).to.be.equal(owner.address);
  //   });

  //   it("Deposit ETH: Sender deposits ETH to be wrapped into WETH", async function () {
  //     const { weth_token, owner, addr1, addr2 } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     const owner_initialBal = await weth_token.balanceOf(owner.address);
  //     expect(owner_initialBal).to.equal("0");

  //     await expect(weth_token.deposit({ value: parseEther("1.0") })).to.emit(
  //       weth_token,
  //       "Deposit"
  //     );

  //     const owner_NewBal = await weth_token.balanceOf(owner.address);
  //     expect(ethers.utils.formatUnits(owner_NewBal, 18)).to.equal("1.0");
  //   });

  //   it("Withdraw Fail: Initially no WETH should be available to withdraw", async function () {
  //     const { weth_token, owner, addr1, addr2 } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     const owner_initialBal = await weth_token.balanceOf(owner.address);
  //     expect(owner_initialBal).to.equal("0");

  //     await expect(weth_token.withdraw(1)).to.be.revertedWith(
  //       "NOTHING_TO_WITHDRAW"
  //     );

  //     await expect(weth_token.deposit({ value: parseEther("1.0") })).to.emit(
  //       weth_token,
  //       "Deposit"
  //     );
  //   });

  //   it("Withdraw Success: Deposit some ETH->WETH and then withdraw", async function () {
  //     const { weth_token, owner, addr1, addr2 } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     const owner_initialBal = await weth_token.balanceOf(owner.address);
  //     expect(owner_initialBal).to.equal("0");

  //     await expect(weth_token.withdraw(1)).to.be.revertedWith(
  //       "NOTHING_TO_WITHDRAW"
  //     );

  //     await expect(weth_token.deposit({ value: parseEther("1.0") })).to.emit(
  //       weth_token,
  //       "Deposit"
  //     );

  //     const owner_NewBal = await weth_token.balanceOf(owner.address);
  //     expect(ethers.utils.formatUnits(owner_NewBal, 18)).to.equal("1.0");

  //     await expect(weth_token.withdraw(parseEther("1.0"))).to.emit(
  //       weth_token,
  //       "Withdraw"
  //     );

  //     const owner_NewBal2 = await weth_token.balanceOf(owner.address);
  //     expect(ethers.utils.formatUnits(owner_NewBal2, 18)).to.equal("0.0");
  //   });
});
