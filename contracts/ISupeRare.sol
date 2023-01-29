
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// pragma solidity ^0.4.18;

interface ISupeRare {




    
    /**
     * @notice A descriptive name for a collection of NFTs in this contract
     */
    function name() external pure returns (string memory);

    /**
     * @notice An abbreviated name for NFTs in this contract
     */
    function symbol() external pure returns (string memory _symbol);

      /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
  /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
  ///  3986. The URI may point to a JSON file that conforms to the "ERC721
  ///  Metadata JSON Schema".
  function tokenURI(uint256 _tokenId) external view returns (string memory);


      /**
   * @dev Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
    function approvedFor(uint256 _tokenId) external view returns (address);




  /**
  * @dev Gets the balance of the specified address
  * @param _owner address to query the balance of
  * @return uint256 representing the amount owned by the passed address
  */
  function balanceOf(address _owner) external view  returns (uint256);

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

    /**
     * @notice approve is not a supported function for this contract
     */
    function approve(address _to, uint256 _tokenId) external;




}