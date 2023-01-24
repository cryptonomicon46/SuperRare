
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// pragma solidity ^0.4.18;

interface ISupeRare {
      /**
   * @dev Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
    function approvedFor(uint256 _tokenId) external view returns (address);

    /**
  * @dev Gets the owner of the specified token ID
  * @param _tokenId uint256 ID of the token to query the owner of
  * @return owner address currently marked as the owner of the given token ID
  */
    function ownerOf(uint256 _tokenId) external view returns (address owner);


    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Sets the token to be on its second sale.
     * @param _to address to receive the ownership of the given token ID
     * @param _tokenId uint256 ID of the token to be transferred
     */
    function transfer(address _to, uint256 _tokenId) external ;

}