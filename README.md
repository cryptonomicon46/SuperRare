\***\*\*\*\***-------------------------------------\***\*\*\*\***
SupeRareV2.sol: Wrapper contract to the SupRare.sol V1 contract
Is an ERC721 compliant NFT contract that mints V2 tokens for pegged V1 tokens. \***\*\*\*\***-------------------------------------\***\*\*\*\***
Instructions for owners of V1 tokens: \***\*\*\*\***-------------------------------------\***\*\*\*\***

1.Owner/Creator/holder of the V1 token enlists in the V2 contract to get whitelisted for holding a V1 token on the original V1 contract.
2.Owner/Creator/holder of the V1 token will then transfer the V1 token to the V2 contract to enable the V1:V2 peg.
3.Owner/Creator/holder of the V1 token will then mint a V2 token on the v2 contract using the
'mintV2(uint256)' function.
4.Owner/Creator/holder now holds a minted V2 token with the same tokenID as the V1 token. Ensuring that the V1 token is locked away in the V2 contract.
5.Owner of the V2 token can choose to safeTransfer the V2 token to an EOA or external contract that implements the 'IERC721Receiver.sol' using the 'safelyTransfer(address,address,uint256)' function.
6.Owner of the V2 token can also choose to withdraw the original V1 token. By using the 'withdraw(uint256)' function. This in turn burns the V2 token and transfer the V1 token back to the owner. \***\*\*\*\***-------------------------------------\***\*\*\*\***
Test coverage: \***\*\*\*\***-------------------------------------\***\*\*\*\***
Version
=======

> solidity-coverage: v0.8.2

# Instrumenting for coverage...

> Eschrow.sol
> EschrowERC721.sol
> ISupeRare.sol
> ISupeRareV2.sol
> SupeRare.sol
> SupeRareV2.sol

# Compilation:

Compiled 1 Solidity file successfully

# Network Info

> HardhatEVM: v2.12.3
> network: hardhat

SupeRareV2 Test Suit: The Basics
✔ SupeRareV2 Deployed: check contract address to be a proper address (1034ms)
✔ SupeRareV2 Name: check the name of the V2 token
✔ SupeRareV2 Symbol: check the symbol of the V2 token
✔ SupeRareV2 Owner: Check owner or the deployer of the contract
✔ SupeRareV2 transferOwnership: Only owner can transfer ownership
✔ SupeRareV2 TransferOwnership to new Owner: Check address of the new owner

SupeRareV2 Deposits: Tests related to depositing an NFT
Whitelist creator
✔ SupeRareV2 Deposit whitelist pass: Owner of an V1 NFT gets whitelisted. (706ms)
✔ SupeRareV2 Deposit whitelist fail: Owner of tries to get whitelisted again for the same v1 tokenID.
✔ SupeRareV2 Deposit verify balances before mint: V1 Onwer gets whitelisted, transfers V1 token check balances before and after
✔ SupeRareV2 Deposit, mintV2: Mint the v2 token and confirm the v1:v2 peg, check balances (43ms)

SupeRareV2 SafeTransfer: Tests related to setting SafeTransfer of the V2 Token
Whitelist creator
✔ SupeRareV2 SafeTransfer to EschrowERC721: This should pass, as the contract is ERC721 compliant (812ms)

SupeRareV2 Withdraw: Tests related to withdrawing a V1 token
Whitelist creator
✔ SupeRareV2 Withdraw onlyOwnerOfV2: Owner deposits V1 tokens, then tries to withdraw them (515ms)

12 passing (3s)

--------------------|----------|----------|----------|----------|----------------|
File | % Stmts | % Branch | % Funcs | % Lines |Uncovered Lines |
--------------------|----------|----------|----------|----------|----------------|
contracts/ | 43.79 | 29.46 | 47.22 | 47.51 | |
Eschrow.sol | 0 | 100 | 0 | 0 | 16,23 |
EschrowERC721.sol | 66.67 | 100 | 50 | 66.67 | 67,74 |
ISupeRare.sol | 100 | 100 | 100 | 100 | |
ISupeRareV2.sol | 100 | 100 | 100 | 100 | |
SupeRare.sol | 34.92 | 19.05 | 41.18 | 38.69 |... 691,692,693 |
SupeRareV2.sol | 74.29 | 60.71 | 73.33 | 80 |... 274,282,285 |
--------------------|----------|----------|----------|----------|----------------|
All files | 43.79 | 29.46 | 47.22 | 47.51 | |
--------------------|----------|----------|----------|----------|----------------|

> Istanbul reports written to ./coverage/ and ./coverage.json \***\*\*\*\***-------------------------------------\***\*\*\*\***

Goerli Contracts
npx hardhat run scripts/deploy_Goerli.js --network goerli

Goerli:
npx hardhat verify "" --network goerli

Test Script lines for test:
npx hardhat coverage --testfiles "test/test\_\*.js"
npx hardhat test ./test/test_SupeRareV2.js --network localhost

Mainnet:
npx hardhat run scripts/deploy_Mainnet.js --network mainnet
npx hardhat verify "" "" --network goerli
