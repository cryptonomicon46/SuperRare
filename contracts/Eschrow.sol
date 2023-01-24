// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Eschrow is IERC721Receiver {



function onERC721Received( address , address , uint256 , bytes calldata  ) public pure override returns (bytes4) {
    return this.onERC721Received.selector;
}
}   