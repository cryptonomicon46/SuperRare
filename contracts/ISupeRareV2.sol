
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;
// pragma solidity ^0.4.18;

interface ISupeRareV2 {

    /**
     * @dev This captures the Depositer's V1 Position 
     */
    struct  Position {
        address tokenOwner;
        uint256 tokenID;
        string tokenURI;
        uint256 timeStamp;   
    } 


    /**
   * @notice deposit allows the owner of SupeRareV1 to deposit an NFT and get a minted representation  SupeRareV2 with the same tokenID
   * @param _tokenId uint256 ID of the SupeRareV1 or original tokenId being deposited by owner
   * @return bool returns true if the operation succeeds
   * @dev emits a PositionCreated event
   */
    function deposit(uint256 _tokenId) external returns (bool);



    /**
   * @notice withdraw allows the owner of SupeRareV1 to withdraw the deposited V1 SupeRare NFT 
   * @param _tokenId uint256 ID of the SupeRareV1 which will be mapped to find the corresponding V2 NFT TokenID
   * @return  true if it succeeds in it's operation
   * @dev emits a burn event
   */
    function withdraw(uint256 _tokenId) external returns (bool);

    /**
   * @notice getOwnerPosition gets the owner's V1 position corresponding to teh v1TokenId
   * @param v2TokenId Owner's current V2 TokenID
   * @return  Position corresponding to the minted V2TokenID
   */
    function getOwnerPosition(uint256 v2TokenId) external returns (Position memory);


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

}