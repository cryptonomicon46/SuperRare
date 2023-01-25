SupeRareV2.sol:
Is an ERC721 compliant NFT contract that mints 1:1 V2 tokens for holders of the SupeRare V1 tokens.
Allows the Owner of the V1 tokens to deposit their V1 tokens and receive V2 tokens in response.
The V2 tokens are an accurate representation of the tokenID/tokenURI of the V1 tokens.
They V2 tokens are burnt when the owner withraws his V1 tokens.
Once deposited, the owner of the V1 tokenID can initiate a SafeTransfer to either an EOA or an ERC721 compliant Eschrow contract.
The transaction gets reverted if the receiver is a contract and is not ERC721 compliant

Schematic_SupeRareV2.jpg
Shows the schematic of the V2 contract architecture and interactions

Goerli Contracts
npx hardhat run scripts/deploy_Goerli.js --network goerli

Goerli:
npx hardhat verify "" --network goerli

Test Script lines for test:
npx hardhat coverage --testfiles "test/test\_\*.js"
npx hardhat test ./test/test_SupeRareV2.js --network localhost

----------------------|----------|----------|----------|----------|----------------|
File | % Stmts | % Branch | % Funcs | % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
contracts/ | 36.3 | 28.3 | 47.69 | 37.5 | |
Eschrow.sol | 0 | 100 | 0 | 0 | 16,23 |
EschrowERC721.sol | 33.33 | 100 | 50 | 33.33 | 26,33 |
IERC721Receiver.sol | 100 | 100 | 100 | 100 | |
ISupeRare.sol | 100 | 100 | 100 | 100 | |
ISupeRareV2.sol | 100 | 100 | 100 | 100 | |
SupeRare.sol | 28.46 | 16.28 | 43.14 | 30.3 |... 686,687,688 |
SupeRareV2.sol | 94.44 | 80 | 87.5 | 95.45 | 96 |
----------------------|----------|----------|----------|----------|----------------|
All files | 36.3 | 28.3 | 47.69 | 37.5 | |
----------------------|----------|----------|----------|----------|----------------|

Mainnet:
npx hardhat run scripts/deploy_Mainnet.js --network mainnet
npx hardhat verify "" "" --network goerli
