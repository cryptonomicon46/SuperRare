
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;
// pragma solidity ^0.4.18;

interface ISupeRareV2 {

    /**
     * @dev This captures the Depositer's V1 Position 
     */
    struct  Position {
        address v1Owner;
        uint256 v1TokenID;
        uint256 timeStamp;   
    } 


      /**
   * @notice deposit allows the owner of SupeRareV1 to deposit an NFT and get a minted representation in SupeRareV2
   * @param _tokenId uint256 ID of the SupeRareV1 or original tokenId being deposited by owner
   * @return  minted v2 TokenID
   * @dev emits a mint event
   */
    function deposit(uint256 _tokenId) external returns (uint256);



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
     * @notice updateOwnership updates the ownership if the original V1 token was sold via bit/sale/transfer to a newOwner
     * @param v1TokenId the original V1TokenId
     * @return  true if the operation succeeds
     * @dev emits an OwnershipUpdated(address,address,uint256) event 
     */
    function updateOwnership(uint v1TokenId) external returns (bool);

}