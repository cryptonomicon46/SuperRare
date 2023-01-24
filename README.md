SupeRare.sol: SupeRare V1 contract deploed at 0x41a322b28d0ff354040e2cbc676f0320d8c8850d on mainnet. Which isn't ERC721 compliant, so it needs a wrapper function to do the same.

SupeRareWrapper.sol: Implements ERC721OnReceived and performs SafeTransfer of SupeRare assets to EOA or an Eschrow contract.

----------------------|----------|----------|----------|----------|----------------|
File | % Stmts | % Branch | % Funcs | % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
contracts/ | 50.34 | 25.96 | 66.15 | 53.13 | |
Eschrow.sol | 100 | 100 | 100 | 100 | |
IERC721Receiver.sol | 100 | 100 | 100 | 100 | |
ISupeRare.sol | 100 | 100 | 100 | 100 | |
SupeRare.sol | 43.9 | 23.26 | 58.82 | 47.88 |... 686,687,688 |
SupeRareWrapper.sol | 84.21 | 38.89 | 90 | 83.33 | 99,129,130,131 |
----------------------|----------|----------|----------|----------|----------------|
All files | 50.34 | 25.96 | 66.15 | 53.13 | |
----------------------|----------|----------|----------|----------|----------------|
