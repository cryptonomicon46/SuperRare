
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// pragma solidity ^0.4.18;

interface ISupeRareV2 {


      /**
   * @notice deposit_V1 allows the owner of SupeRareV1 to deposit an NFT and get a minted representation in SupeRareV2
   * @param _tokenId uint256 ID of the SupeRareV1 or original tokenId being deposited by owner
   * @return Returns the V2 balance of the owner in the contract
   * @dev emits a mint event
   */
    function deposit_V1(uint256 _tokenId) external returns (uint256);



    /**
   * @notice Withdraw_V1 allows the owner of SupeRareV1 to withdraw the deposited V1 SupeRare NFT 
   * @param _tokenId uint256 ID of the SupeRareV1 which will be mapped to find the corresponding V2 NFT TokenID
   * @return Returns the V2 balance of the owner in the contract
   * @dev emits a burn event
   */
    function Withdraw_V1(uint256 _tokenId) external returns (uint256);




}