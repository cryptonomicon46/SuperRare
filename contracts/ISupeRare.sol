
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// pragma solidity ^0.4.18;

interface ISupeRare {
    function approvedFor(uint256 _tokenId) external view returns (address);
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function approve(address _to, uint256 _tokenId) external ; 
    function transfer(address _to, uint256 _tokenId) external ;

}