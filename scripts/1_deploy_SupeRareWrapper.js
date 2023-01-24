const { parse } = require("dotenv");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const { console } = require("console");

async function main() {
  const [deployer, addr1, addr2, addr3, addr4] = await ethers.getSigners();

  console.log(
    "\nDeploying SupeRare contract with the account:",
    deployer.address
  );

  // console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log(
    "Deployer account %s balance is %o ETH",
    deployer.address,
    ethers.utils.formatEther(deployerBal)
  );

  //Deploy SupeRare
  const SupeRare = await ethers.getContractFactory("SupeRare");
  const supeRare = await SupeRare.deploy();
  console.log("supeRare contract depoloyed at ", supeRare.address);
  console.log("\n");

  //Deploy SupeRareWrapper

  const SupeRareWrapper = await ethers.getContractFactory("SupeRareWrapper");
  const supeRareWrapper = await SupeRareWrapper.deploy(supeRare.address);
  console.log(
    "SupeRareWrapper contract depoloyed at ",
    supeRareWrapper.address
  );
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
