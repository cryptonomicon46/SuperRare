const { parse } = require("dotenv");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, addr1, addr2, addr3, addr4] = await ethers.getSigners();

  const SupeRareV1 = "0x41a322b28d0ff354040e2cbc676f0320d8c8850d"; //mainnet contract address
  //Deploy SupeRareV2
  const SupeRareV2 = await ethers.getContractFactory("SupeRareV2");
  const supeRareV2 = await SupeRareV2.deploy(SupeRareV1);
  console.log("SupeRareV2 contract depoloyed at ", supeRareV2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
