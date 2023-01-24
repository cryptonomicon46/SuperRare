const { parse } = require("dotenv");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, addr1, addr2, addr3, addr4] = await ethers.getSigners();

  //   console.log(
  //     "\nDeploying SupeRare contract with the account:",
  //     deployer.address
  //   );

  //   Deploy SupeRare
  const SupeRare = await ethers.getContractFactory("SupeRare");
  const supeRare = await SupeRare.deploy();
  //   await supeRare.deployed();
  console.log("SupeRare contract depoloyed at ", supeRare.address);
  //   console.log("\n");

  //Deploy SupeRareWrapper
  const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
  const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
  console.log(
    "SupeRareWrapper contract depoloyed at ",
    supeRareWrapper.address
  );

  const Eschrow = await ethers.getContractFactory("Eschrow");
  const eschrow = await Eschrow.deploy();
  console.log("Eschrow contract depoloyed at ", eschrow.address);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
