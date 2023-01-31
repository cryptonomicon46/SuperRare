
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;
// pragma solidity ^0.4.18;

interface ISupeRareV2 {



    /**
   * @notice getSupeRareAddress returns the address of the SupeRareV1 contract
   * @return address of the V1 contract
   */
    function getSupeRareAddress() external returns (address);

    /**
     * @dev isPegged: Returns true if the V1 token has been transferred to this contract
     * @param _tokenId the v1 tokenID 
     * @return returns true if there's a peg
     */
    function isPegged(uint _tokenId) external  returns (bool);

    /**
   * @notice mintV2, should allow a whitelisted owner to call mint, if it's a contract then it needs to implement the onERC721Received function 
   * @param _tokenId v1 tokenID
   * @return bool returns true if the operation succeeds
   * @dev emits a PositionCreated event
   */
    function mintV2(uint256 _tokenId) external returns (bool);



    /**
   * @notice withdraw, should allow the owner of a v2 token only for a pegged v1 token.
   * @param _tokenId is the v2 tokenID to be burned
   * @return bool true if the function succeeds in its operation
   * @dev emits a PositionDeleted event
   */
    function withdraw(uint256 _tokenId) external returns (bool);


    /**
     * @dev SupeRareV2: Owner gets added to the whitelist based on the v1 token ownership
     * @param _v1TokenId the v1 tokenID 
     * @return bool true if the operation succeeds
     */
    function getAddedToWhitelist(uint256 _v1TokenId) external  returns (bool);


    /**
   * @notice setTokenURI   //ERC721: Change the tokenURI if needed on a per token basis by only by the owner of this contract
   * @param v2tokenId Owner's current V2 TokenID
   * @return bool returns true of the operation succeeds
   */
    function setTokenURI(uint256 v2tokenId,string calldata _tokenURI) external returns (bool);


    /**
   * @notice setBaseURI   //ERC721: Change the tokenURI if needed on a per token basis only by the owner of this contract
   * @param _baseURI Owner's current V2 TokenID
   * @return bool returns true of the operation succeeds
   */
    function setBaseURI(string calldata _baseURI) external returns (bool);



    /**
   * @notice safelyTransfer, should perform the ERC721 checks before transfering token to an external contract
   * @param from address of approved or sender
   * @param tokenId of the v2 token being transferred
   * @return bool true if the function succeeds in its operation
   * @dev emits a 'Transfer' event
   */
    function safelyTransfer(address from, address to, uint256 tokenId) external returns (bool);

}