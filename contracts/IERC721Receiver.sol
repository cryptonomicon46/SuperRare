// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
/**
 * @title ERC721 interface
 * @dev see https://github.com/ethereum/eips/issues/721
 */
// interface ERC721 {
//   event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
//   event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);

//   function balanceOf(address _owner) public view returns (uint256 _balance);
//   function ownerOf(uint256 _tokenId) public view returns (address _owner);
//   function transfer(address _to, uint256 _tokenId) public;
//   function approve(address _to, uint256 _tokenId) public;
//   function takeOwnership(uint256 _tokenId) public;
// }

interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}