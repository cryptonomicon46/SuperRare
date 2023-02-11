SupeRareV2.sol: Wrapper contract to the SupRare.sol V1 contract that implements the standard ERC721 interface.

Is an ERC721 compliant NFT contract that mints V2 tokens for pegged V1 tokens.
Instructions for owners of V1 token holders (EOAs or ERC721 Contracts):

1. Owner/Creator/holder of the V1 token enlists in the V2 contract to get whitelisted by calling the 'getAddedToWhitelist(uint256)' before transfering to token to this contract.
   Warning:Do not transfer your V1 token to to contract before getting whitelisted, as your V1 token will get locked away in the V2 contract wothout proof of your ownership.
2. Owner/Creator/holder of the V1 token will then transfer the V1 token to the V2 contract to enable to ensure that the V1 token is locked away in the contract and is unavailable to the market. This also enables the V1:V2 peg in the contract.
3. Owner/Creator/holder of the V1 token will then be allowed to mint a V2 token by specifiying their V1 tokenId and calling the 'mintV2(uint256)' function.
4. Owner/Creator/holder now holds a minted V2 token with the same tokenID as the V1 token. This V2 token now holds the same value as the V1 token.
5. Owner of the minted V2 token can choose to safeTransfer the V2 token to an EOA or external contract that implements the 'IERC721Receiver.sol' using the 'safelyTransfer(address,address,uint256)' function.
6. Owner of the minted V2 token can also choose to withdraw the original V1 token by calling the 'withdraw(uint256)' function. This will burns the V2 token and transfer the V1 token back to the owner(EOA/external contract).

npx hardhat compile SupeRareV2.sol --network localhost

(base) $ npx hardhat coverage --testfiles "test/test_SupeRareV2.js"

# Version

> solidity-coverage: v0.8.2

# Instrumenting for coverage...

> Contract_ERC721.sol
> IMockV1.sol
> ISupeRareV2.sol
> MockV1.sol
> SupeRareV2.sol

# Compilation:

Compiled 20 Solidity files successfully

# Network Info

> HardhatEVM: v2.12.3
> network: hardhat

SupeRareV2 Test Suit: The Basics
✔ SupeRareV2 Deployed: check contract address to be a proper address (881ms)
✔ SupeRareV2 Name: check the name of the V2 token
✔ SupeRareV2 Symbol: check the symbol of the V2 token
✔ SupeRareV2 Owner: Check owner or the deployer of the contract
✔ SupeRareV2 transferOwnership: Only owner can transfer ownership
✔ SupeRareV2 TransferOwnership to new Owner: Check address of the new owner

SupeRareV2 Deposits: Tests related to depositing an NFT
✔ SupeRareV2 Deposit whitelist pass: Owner of an V1 NFT gets whitelisted. (405ms)
✔ SupeRareV2 Deposit and check if Whitelisted: Owner of an V1 NFT asks to get whitelisted and checks if whitelisted.
✔ SupeRareV2 Deposit whitelist fail: Owner of tries to get whitelisted again for the same v1 tokenID.
✔ SupeRareV2 Deposit verify balances before mint: V1 Onwer gets whitelisted, transfers V1 token check balances before and after
✔ SupeRareV2 Deposit, mintV2: Mint the v2 token and confirm the v1:v2 peg, check balances (42ms)

SupeRareV2 SafeTransfer: Creator mints V1 token, deposits it into V2 contract and transfers V2 token to an external ERC721 contract.
✔ SupeRareV2 SafeTransfer to Contract_ERC721#1: This should pass, as the contract is ERC721 compliant (660ms)
✔ SupeRareV2 SafeTransfer to Contract_ERC721#2: The external contract then tries to withdaw the V1 token (109ms)

SupeRareV2 Withdraw: Tests related to withdrawing a V1 token
✔ SupeRareV2 Withdraw onlyOwnerOfV2: Owner deposits V1 tokens, then tries to withdraw them (459ms)
✔ SupeRareV2 Withdraw new V2 owner: Creator transfers V2 token and new owner of V2 tries to withdraw V1 token (52ms)

15 passing (3s)

----------------------|----------|----------|----------|----------|----------------|
File | % Stmts | % Branch | % Funcs | % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
contracts/ | 48.89 | 34.13 | 53.25 | 52.12 | |
Contract_ERC721.sol | 90 | 50 | 80 | 91.67 | 83,90 |
IMockV1.sol | 100 | 100 | 100 | 100 | |
ISupeRareV2.sol | 100 | 100 | 100 | 100 | |
MockV1.sol | 34.4 | 19.05 | 41.18 | 38.32 |... 690,691,692 |
SupeRareV2.sol | 77.14 | 70 | 75 | 82.22 |... 282,283,290 |
----------------------|----------|----------|----------|----------|----------------|
All files | 48.89 | 34.13 | 53.25 | 52.12 | |
----------------------|----------|----------|----------|----------|----------------|

> Istanbul reports written to ./coverage/ and ./coverage.json
> Goerli Contracts
> npx hardhat run scripts/deploy_Goerli.js --network goerli

Goerli:
npx hardhat verify "" --network goerli

Test Script lines for test:
npx hardhat coverage --testfiles "test/test\_\*.js"
npx hardhat test ./test/test_SupeRareV2.js --network localhost

Mainnet:
npx hardhat run scripts/deploy_Mainnet.js --network mainnet
npx hardhat verify "" "" --network goerli
