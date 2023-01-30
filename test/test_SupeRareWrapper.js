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
const _ERC721_RECEIVED = "0x150b7a02";

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract

describe("SupeRareWrapper Test Suite#1: Basics", function () {
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

    console.log("SupeRare contract deployed at:", supeRare.address);
    console.log(
      "SupeRareWrapper contract deployed at:",
      supeRareWrapper.address
    );

    ////console.log("Deployer Address", owner.address);

    return { supeRareWrapper, supeRare, owner, addr1, addr2 };
  }

  it("SupeRareWrapper Deployed: check contract address to be a proper address", async function () {
    const { supeRareWrapper } = await loadFixture(deployTokenFixture);
    expect(supeRareWrapper.address).to.be.a.properAddress;
  });

  it("SupeRareWrapper Owner: check the owner of the contract", async function () {
    const { supeRareWrapper, owner } = await loadFixture(deployTokenFixture);
    expect(await supeRareWrapper.owner()).to.be.equal(owner.address);
  });

  it("SupeRareWrapper transferOwnership: check the current owner can transfer ownership", async function () {
    const { supeRareWrapper, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );

    await expect(
      supeRareWrapper.connect(owner).transferOwnership(addr1.address)
    )
      .to.emit(supeRareWrapper, "OwnershipTransferred")
      .withArgs(owner.address, addr1.address);

    expect(await supeRareWrapper.owner()).to.be.equal(addr1.address);
  });

  it("SupeRareWrapper renounceOwnership: check the current owner can renounce ownership", async function () {
    const { supeRareWrapper, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareWrapper.connect(owner).renounceOwnership())
      .to.emit(supeRareWrapper, "OwnershipTransferred")
      .withArgs(owner.address, ethers.constants.AddressZero);

    expect(await supeRareWrapper.owner()).to.be.equal(
      ethers.constants.AddressZero
    );
  });

  it("SupeRareWrapper Name: check the name of the V2 token", async function () {
    const { supeRareWrapper, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );
    expect(await supeRareWrapper.name()).to.be.equal(NAME);
  });

  it("SupeRareWrapper Symbol: check the symbol of the V2 token", async function () {
    const { supeRareWrapper, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );
    expect(await supeRareWrapper.symbol()).to.be.equal(SYMBOL);
  });

  it("SupeRareWrapper onERC721Received: check the onERC721Received function selector", async function () {
    const { supeRareWrapper, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );

    const functionSelector = await supeRareWrapper.onERC721Received(
      owner.address,
      addr1.address,
      10,
      "0x00"
    );
    // console.log(functionSelector);
    expect(
      await supeRareWrapper.onERC721Received(
        owner.address,
        addr1.address,
        10,
        "0x00"
      )
    ).to.equal(_ERC721_RECEIVED);
  });
  it("SupeRareWrapper CreateWhitelist: Only owner can create the Whitelist", async function () {
    const { supeRareWrapper, supeRare, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);

    // console.log(
    //   "Owners",
    //   await supeRareWrapper.owner(),
    //   await supeRare.owner()
    // );
    await expect(
      supeRareWrapper.connect(addr2.address).whitelistCreator(addr1.address)
    ).to.be.reverted;
    // await supeRareWrapper.connect(owner).whitelistCreator(addr1.address);
    // ).to.emit(supeRareWrapper, "WhitelistCreator");
    //   .withArgs(addr2.address);
  });

  //   it("SupeRareWrapper IsWhiteListed: Check if an account is whitelisted", async function () {
  //     const { supeRareWrapper, owner, addr1, addr2 } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     await expect(supeRareWrapper.connect(owner).whitelistCreator(addr2.address))
  //       .to.emit(supeRareWrapper, "WhitelistCreator")
  //       .withArgs(addr2.address);

  //     let whiteListAddr = await supeRareWrapper.isWhitelisted(addr2.address);
  //     expect(whiteListAddr).to.be.true;

  //     whiteListAddr = await supeRareWrapper.isWhitelisted(addr1.address);
  //     expect(whiteListAddr).to.be.false;
  //   });

  it("SupeRareWrapper MaintainerPercentage: Check default value and change it.", async function () {
    const { supeRareWrapper, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    const maintainer_per = await supeRareWrapper
      .connect(owner)
      .getMaintainerPercentage(owner.address);
    // console.log(maintainer_per);
    //
    expect(maintainer_per).to.equal(BigNumber.from(30));

    await expect(
      supeRareWrapper.connect(addr2.address).setMaintainerPercentage(5)
    ).to.be.reverted;

    // maintainer_per = await supeRareWrapper.maintainerPercentage();
    expect(maintainer_per).to.equal(30);

    await supeRareWrapper.connect(owner).setMaintainerPercentage(5);

    // maintainer_per = await supeRareWrapper.maintainerPercentage();
    // expect(maintainer_per).to.equal(5);
  });

  it("SupeRareWrapper CreatorPercentage: Check default value and change it.", async function () {
    const { supeRareWrapper, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    const creator_per = await supeRareWrapper
      .connect(owner)
      .getCreatorPercentage(owner.address);
    // console.log(creator_per);
    //
    expect(creator_per).to.equal(BigNumber.from(100));

    // await expect(supeRareWrapper.connect(addr2.address).setCreatorPercentage(5))
    //   .to.be.reverted;

    // creator_per = await supeRareWrapper.creatorPercentage();
    // expect(creator_per).to.equal(100);

    // await supeRareWrapper.connect(owner).setCreatorPercentage(20);

    // creator_per = await supeRareWrapper.creatorPercentage();
    // expect(creator_per).to.equal(20);
  });

  it("SupeRareWrapper AddNewToken: Check the TotalSupply, tokenId and URI", async function () {
    const { supeRareWrapper, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );

    await expect(supeRareWrapper.connect(owner).whitelistCreator(addr1.address))
      .to.emit(supeRareWrapper, "WhitelistCreator")
      .withArgs(addr1.address);

    // await supeRareWrapper.connect(addr1).addNewToken("NewEditions_10");
    // expect(await supeRareWrapper.totalSupply()).to.equal(1);
    // const tokenId = await supeRareWrapper.tokensOf(addr1.address);
    // //console.log(ethers.BigNumber.from(1), tokenId[0]);
    // expect(tokenId[0]).to.be.equal(ethers.BigNumber.from("1"));
    // expect(await supeRareWrapper.tokenURI(tokenId[0])).to.equal(
    //   "NewEditions_10"
    // );
  });
});

// describe("SupeRareWrapper Test Suite#2: Creator creates SupeRareWrapper token: Tests", function () {
//   async function deployTokenFixture() {
//     [owner, addr1, creator] = await ethers.getSigners();

//     const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
//     //console.log("Deploying SupeRareWrapper ...\n");
//     const supeRareWrapper = await SupeRareWrapper.deploy();
//     await supeRareWrapper.deployed();
//     ////console.log("SupeRareWrapper contract deployed at:", supeRareWrapper.address);
//     ////console.log("Deployer Address", owner.address);
//     await expect(
//       supeRareWrapper.connect(owner).whitelistCreator(creator.address)
//     )
//       .to.emit(supeRareWrapper, "WhitelistCreator")
//       .withArgs(creator.address);

//     await expect(
//       supeRareWrapper
//         .connect(creator)
//         .addNewTokenWithEditions("NewEditions_10", 10, parseEther("1"))
//     ).to.emit(supeRareWrapper, "SalePriceSet");

//     return { supeRareWrapper, owner, addr1, creator };
//   }

//   it("AddNewTokenEdition: Create new tokens and check totalSupply", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     let totalSupply = await supeRareWrapper.totalSupply();
//     expect(totalSupply).to.equal(11);
//   });

//   it("AddNewTokenEdition: Check TokenURIs", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     let tokenURI;
//     for (let i = 1; i <= 11; i++) {
//       expect(await supeRareWrapper.tokenURI(i)).to.be.equal("NewEditions_10");
//     }
//   });

//   it("AddNewTokenEdition: Check SalePriceOfTokens", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     for (let i = 1; i <= 11; i++) {
//       i == 1
//         ? expect(await supeRareWrapper.salePriceOfToken(i)).to.be.equal(0)
//         : expect(await supeRareWrapper.salePriceOfToken(i)).to.be.equal(
//             parseEther("1")
//           );
//     }
//   });

//   it("AddNewTokenEdition: Check OwnerOf and CreatorOf tokenIds", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     let tokenURI;
//     for (let i = 1; i <= 11; i++) {
//       expect(await supeRareWrapper.ownerOf(i)).to.be.equal(creator.address);
//       expect(await supeRareWrapper.creatorOfToken(i)).to.be.equal(
//         creator.address
//       );
//     }
//   });

//   it("AddNewTokenEdition: Check all tokens belonging to the owner", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );
//     const tokensOfOwner = await supeRareWrapper.tokensOf(creator.address);
//     tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));
//   });

//   it("AddNewTokenEdition: Check balance of Owner", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     expect(await supeRareWrapper.balanceOf(creator.address)).to.equal(11);
//   });

//   it("AddNewTokenEdition: Check Original token URI", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     const tokensOfOwner = await supeRareWrapper.tokensOf(creator.address);
//     tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

//     expect(await supeRareWrapper.originalTokenOfUri("NewEditions_10")).to.equal(
//       "1"
//     );
//   });
// });

// describe("Creator creates SupeRareWrapper token: Tests", function () {
//   async function deployTokenFixture() {
//     [owner, addr1, creator] = await ethers.getSigners();

//     const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
//     //console.log("Deploying SupeRareWrapper ...\n");
//     const supeRareWrapper = await SupeRareWrapper.deploy();
//     await supeRareWrapper.deployed();
//     ////console.log("SupeRareWrapper contract deployed at:", supeRareWrapper.address);
//     ////console.log("Deployer Address", owner.address);
//     await expect(
//       supeRareWrapper.connect(owner).whitelistCreator(creator.address)
//     )
//       .to.emit(supeRareWrapper, "WhitelistCreator")
//       .withArgs(creator.address);

//     await expect(
//       supeRareWrapper
//         .connect(creator)
//         .addNewTokenWithEditions("NewEditions_10", 10, parseEther("1"))
//     ).to.emit(supeRareWrapper, "SalePriceSet");

//     return { supeRareWrapper, owner, addr1, creator };
//   }

//   it("AddNewTokenEdition: Create new tokens and check totalSupply", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     let totalSupply = await supeRareWrapper.totalSupply();
//     expect(totalSupply).to.equal(11);
//   });

//   it("AddNewTokenEdition: Check TokenURIs", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     let tokenURI;
//     for (let i = 1; i <= 11; i++) {
//       expect(await supeRareWrapper.tokenURI(i)).to.be.equal("NewEditions_10");
//     }
//   });

//   it("AddNewTokenEdition: Check SalePriceOfTokens", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     for (let i = 1; i <= 11; i++) {
//       i == 1
//         ? expect(await supeRareWrapper.salePriceOfToken(i)).to.be.equal(0)
//         : expect(await supeRareWrapper.salePriceOfToken(i)).to.be.equal(
//             parseEther("1")
//           );
//     }
//   });

//   it("AddNewTokenEdition: Check OwnerOf and CreatorOf tokenIds", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     let tokenURI;
//     for (let i = 1; i <= 11; i++) {
//       expect(await supeRareWrapper.ownerOf(i)).to.be.equal(creator.address);
//       expect(await supeRareWrapper.creatorOfToken(i)).to.be.equal(
//         creator.address
//       );
//     }
//   });

//   it("AddNewTokenEdition: Check all tokens belonging to the owner", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );
//     const tokensOfOwner = await supeRareWrapper.tokensOf(creator.address);
//     tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));
//   });

//   it("AddNewTokenEdition: Check balance of Owner", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     expect(await supeRareWrapper.balanceOf(creator.address)).to.equal(11);
//   });

//   it("AddNewTokenEdition: Check Original token URI", async function () {
//     const { supeRareWrapper, owner, addr1, creator } = await loadFixture(
//       deployTokenFixture
//     );

//     const tokensOfOwner = await supeRareWrapper.tokensOf(creator.address);
//     tokensOfOwner.forEach((v, i) => expect(v).to.be.equal(i + 1));

//     expect(await supeRareWrapper.originalTokenOfUri("NewEditions_10")).to.equal(
//       "1"
//     );
//   });
// });
