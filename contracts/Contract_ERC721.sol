// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISupeRare.sol";
import "./ISupeRareV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
contract Contract_ERC721 is  Ownable, ERC721, IERC721Receiver{


event WithdrawV1(address indexed account, uint256 indexed tokenId);
event transferredV1(address indexed _from, address indexed _to, uint256 indexed _tokenId);
event MintV2(address indexed v1owner, uint256 indexed v2tokenId);
string private _name = "Contract ERC721";
string private _symbol = "CERC721";
  // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
/*
     *     bytes4(keccak256('balanceOf(address)')) == 0x70a08231
     *     bytes4(keccak256('ownerOf(uint256)')) == 0x6352211e
     *     bytes4(keccak256('approve(address,uint256)')) == 0x095ea7b3
     *     bytes4(keccak256('getApproved(uint256)')) == 0x081812fc
     *     bytes4(keccak256('setApprovalForAll(address,bool)')) == 0xa22cb465
     *     bytes4(keccak256('isApprovedForAll(address,address)')) == 0xe985e9c5
     *     bytes4(keccak256('transferFrom(address,address,uint256)')) == 0x23b872dd
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) == 0x42842e0e
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)')) == 0xb88d4fde
     *
     *     => 0x70a08231 ^ 0x6352211e ^ 0x095ea7b3 ^ 0x081812fc ^
     *        0xa22cb465 ^ 0xe985e9c5 ^ 0x23b872dd ^ 0x42842e0e ^ 0xb88d4fde == 0x80ac58cd
     */
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    /*
     *     bytes4(keccak256('name()')) == 0x06fdde03
     *     bytes4(keccak256('symbol()')) == 0x95d89b41
     *     bytes4(keccak256('tokenURI(uint256)')) == 0xc87b56dd
     *
     *     => 0x06fdde03 ^ 0x95d89b41 ^ 0xc87b56dd == 0x5b5e139f
     */
    bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    /*
     *     bytes4(keccak256('totalSupply()')) == 0x18160ddd
     *     bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) == 0x2f745c59
     *     bytes4(keccak256('tokenByIndex(uint256)')) == 0x4f6ccce7
     *
     *     => 0x18160ddd ^ 0x2f745c59 ^ 0x4f6ccce7 == 0x780e9d63
     */
    bytes4 private constant _INTERFACE_ID_ERC721_ENUMERABLE = 0x780e9d63;
    address private _SupeRareV2Addr;
    address private _SupeRareV1Addr;
    ISupeRare supeV1;
    ISupeRareV2 supeV2;

          constructor (address SupeRareV1Addr_, address SupeRareV2Addr_) ERC721 (_name,_symbol){
        _SupeRareV1Addr =  SupeRareV1Addr_;
        _SupeRareV2Addr = SupeRareV2Addr_;
        supeV1 = ISupeRare(_SupeRareV1Addr);
        supeV2 = ISupeRareV2(_SupeRareV2Addr);


        _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC721_METADATA);
        _registerInterface(_INTERFACE_ID_ERC721_ENUMERABLE); } 
   
    /**
     * @dev Implementation of the IERC721 receiver to ensure this contract can receive ERC721 compatible safeTransfers of tokens
     */
function onERC721Received( address , address , uint256 , bytes calldata  ) public pure override returns (bytes4) {
    return this.onERC721Received.selector;
}

    /**
     * @dev returns the name of this contract 
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev returns the symbol of this contract 
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    ///@dev check v1 token balance on the V1 contract  
    function checkV1Ownership(uint _tokenId) external view returns (bool) {
        return IERC721(_SupeRareV1Addr).ownerOf(_tokenId) == address(this);
    }

    ///@dev check v2 token balance on the v2 contract

    function checkV2Ownership(uint _tokenId) external view returns (bool) {

        return IERC721(_SupeRareV2Addr).ownerOf(_tokenId) == address(this);
    }
    
    ///@dev This contract wishes to withdraw the underlying V1 token as it's the owner of the V2 token
      ///@notice onlyOwner modifier applied

    function withdrawV1(uint  _tokenId) external onlyOwner returns (bool) {
        supeV2.withdraw(_tokenId);
        console.log("Must be true:", supeV1.ownerOf(_tokenId)== address(this));
        emit WithdrawV1(address(this),_tokenId);
        return true;
        
    }


    ///@dev This contract wishes to get whitelisted as it's the owner of a V1 token and wishes to mint a V2 token
    ///@notice onlyOwner modifier applied
    function getWhiteListed(uint  _tokenId) external onlyOwner returns (bool) {
        supeV2.getAddedToWhitelist(_tokenId);
        return supeV2.isWhitelisted(_tokenId);
        
    }

    ///@dev This contract wishes to mint a V2 token when it owns a V1 token
    ///@notice onlyOwner modifier applied
    function mintV2(uint256 _tokenId) external onlyOwner returns (bool) {
        supeV2.mintV2(_tokenId);
        emit MintV2(address(this),_tokenId);
        return true;

    }


    ///@dev Transfer the V1 token on the V1 contract to a new owner
    ///@notice onlyOwner modifier applied
    function transferV1(address _to, uint256 _tokenId) external onlyOwner returns (bool) {
        require(_to != address(0) || _to != address(this),"CONTRACT ERC721: INVALID_TO_ADDRESS");
        supeV1.transfer(_to,_tokenId);
        transferredV1(address(this),_to,_tokenId);
        return true;

    }


}   