const { parse } = require("dotenv");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, addr1, addr2, addr3, addr4] = await ethers.getSigners();

  console.log(
    "\nDeploying SupeRare contract with the account:",
    deployer.address
  );

  //Deploy SupeRareV1-MOCK to create Mock V1 tokens for the owner
  //   const SupeRare = await ethers.getContractFactory("SupeRare");
  //   const supeRare = await SupeRare.deploy();
  //   console.log("SupeRare contract depoloyed at ", supeRare.address);
  //   console.log("\n");

  const SupeRareV1 = "0x7cb9c911fb925e0b4cb6b23dc4b13bf784b38f77"; //goerli contract address

  //Deploy SupeRareV2- Which mints 1:1 tokens for Owners of V1 tokens
  const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
  const supeRareV2 = await SupeRareV2.deploy(SupeRareV1);
  console.log("supeRareV2 contract depoloyed at ", supeRareV2.address);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
