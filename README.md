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

Mainnet:
npx hardhat run scripts/deploy_Mainnet.js --network mainnet
npx hardhat verify "" "" --network goerli
