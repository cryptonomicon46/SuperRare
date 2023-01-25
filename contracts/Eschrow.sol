// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Eschrow {



    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public pure  returns (string memory) {
        return "Eschrow";
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public pure returns (string memory) {
        return "ESH";
    }


}   