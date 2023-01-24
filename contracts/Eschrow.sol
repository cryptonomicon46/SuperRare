// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Eschrow is  Ownable, ERC721 ,IERC721Receiver{

constructor() ERC721 ("Eschrow","ESH") {

}

function onERC721Received( address , address , uint256 , bytes calldata  ) public pure override returns (bytes4) {
    return this.onERC721Received.selector;
}

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return "Eschrow";
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return "ESH";
    }


}   