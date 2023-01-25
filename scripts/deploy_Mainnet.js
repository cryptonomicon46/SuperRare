const { parse } = require("dotenv");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, addr1, addr2, addr3, addr4] = await ethers.getSigners();

  const SupeRareAddress = "0x41a322b28d0ff354040e2cbc676f0320d8c8850d";
  //Deploy SupeRareWrapper
  const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
  const supeRareWrapper = await SupeRareWrapper.deploy(SupeRareAddress);
  console.log(
    "SupeRareWrapper contract depoloyed at ",
    supeRareWrapper.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
