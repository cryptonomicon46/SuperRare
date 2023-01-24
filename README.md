Uniswap V3 functions implemented:
1.ETH-> DAI ExactInputSingle swap
2.ETH-> DAI -> USDC ExactInput Multi Hop swap

Setup Instructions
npm install
npx hardhat accounts
npx hardhat clean
npx hardhat compile

npx hardhat test
npx hardhat node
node scripts/accounts.js
npx hardhat run accounts.js
npx hardhat help

$ npm init
$ npm add --save-dev hardhat
$ npx hardhat init

Get an Alchemy key to run a forked verison of mainnet on your local node

npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/<API_KEY>

To targed a specific blcknumber
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/<API_KEY> --fork-block-number 16091924

To run all the tests
npx hardhat test

To test a specific test file
npx hardhat test ./test/test_SwapETH2DAI.js --network localhost

To test a specific "IT" in a selected test file
npx hardhat test ./test/test_SwapETH2DAI2USDC.js --grep "Contract Deployed" --network localhost
npx hardhat test ./test/test_SwapETH2DAI2USDC.js --grep "USDC amountOut" --network localhost

npx hardhat test ./test/test_FusionToken.js --network localhost
npx hardhat run scripts/deploy.js --network goerli
npx hardhat verify "" --network goerli

npx hardhat run scripts/deploy.js --network mainnet
npx hardhat verify "" --network mainnet

Test coverage
yarn add solidity-coverage --dev

npx hardhat coverage --testfiles "test/test_SwapContract.js"
