// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "hardhat/console.sol";
import "./IMockV1.sol";
import "./ISupeRareV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @notice SupeRareV2.sol: Wrapper contract to the SupRare.sol V1 contract
Is an ERC721 compliant NFT contract that mints V2 tokens for pegged V1 tokens.
 */

contract SupeRareV2 is Ownable, ISupeRareV2, ERC721, IERC721Receiver {   
    using Address for address;  
    address private  OriginalSupeRareAddr_;
    IMockV1 private supe;
    address private owner_;
    string private _name = "SupeRare";

    // Token symbol
    string private _symbol = "SUPR";

    /**
     * @dev Maintain a mapping of the original owner address to V1 TokenID to minted V2 TokenID
     **/
    mapping(address => mapping (uint256=>uint256)) public ownerAddrToV1toV2TokenId; 

    /**
     * @dev Owner of V1 token needs to get added to the white list
     **/
    mapping(uint256 => address) public ownerWhiteList;


    mapping(uint256=>bool) private v1_v2_peg; 



    /**
     * @dev The V1 token has been deposited into this contract and is pegged
     **/
    event Pegged( uint256 indexed v1tokenId);

       /**
     * @dev Owner of V1 token has been added to the whitelist 
     **/
    event OwnerWhitelisted(address indexed v1owner, uint256 indexed v1tokenId);

       /**
     * @dev Triggered when a V1 token is deposited to mint a V2 token 
     **/
    event MintV2(address indexed v1owner, uint256 indexed v2tokenId);

       /**
     * @dev Triggered when a V2 token is burned to withdraw the v2 token
     **/
    event WithdrawV1(address indexed v2owner, uint256 indexed v2tokenId);
      
       /**
     * @dev Triggered when a the v2tokenId's tokenURI is set
     **/
    event TokenURISet(uint256 _tokenId,string _tokenURI);

       /**
     * @dev Triggered when a the v2tokenId's tokenURI is set
     **/
      event  BaseURISet(string _baseURI);

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


 
  
          constructor (address OriginalSupeRareAddr_) ERC721 (_name,_symbol){
        OriginalSupeRareAddr_ = OriginalSupeRareAddr_;
        supe = IMockV1(OriginalSupeRareAddr_);
        _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC721_METADATA);
        _registerInterface(_INTERFACE_ID_ERC721_ENUMERABLE); } 
   

 

    /**
  * @dev Guarantees msg.sender is owner of the v2 token 
  * @param _tokenId is the v2 tokenId
  */
  modifier onlyOwnerOfToken(uint256 _tokenId) {
    require(ERC721.ownerOf(_tokenId) == _msgSender(),"SupeRareV2: Sender isn't the owner of the V2 token!");
    _;
  }

      /**
     * @dev Guarantees msg.sender is owner of the v1 token on the original SupeRareV1 contract
     * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
     */
  modifier onlyOwnerOfV1(uint256 _tokenId) {
    require(supe.ownerOf(_tokenId) == _msgSender(),"SupeRareV2: Sender isn't the owner of the V1 Token!");
    _;
  }


    /**
     * @dev Guarantees msg.sender is whitelisted
     * @param _tokenId is the V1 tokenId
     */
    modifier onlyWhitelisted(uint256 _tokenId) {
        require(ownerWhiteList[_tokenId] == _msgSender(),"SupeRareV2: Sender isn't whitelisted or approved for this operation!");
        _;
    }


        /**
     * @dev Guarantees that the V1:V2 tokens are pegged
     * @param _tokenId is the V1 tokenId
     */
    modifier onlyPegged(uint256 _tokenId) {
        require(v1_v2_peg[_tokenId],"SupeRareV2: The v1:v2 token peg hasn't been established!");
        _;
    }


    /**
     * @dev getAddedToWhitelist: Owner gets added to the whitelist based on the v1 token ownership
     * @param _v1TokenId the v1 tokenID 
     * @return bool true if the operation succeeds
     */
    function getAddedToWhitelist(uint256 _v1TokenId) external virtual override onlyOwnerOfV1(_v1TokenId) returns (bool){
        require(ownerWhiteList[_v1TokenId] != _msgSender(),"SupeRareV2: Account already whitelisted!");
         ownerWhiteList[_v1TokenId] = _msgSender();
        emit OwnerWhitelisted(_msgSender(),_v1TokenId);
         return true;
    }

    /**
     * @dev isWhitelisted: Check if EOA or external contract is whitelisted
     * @param _v1TokenId the v1 tokenID 
     * @return bool true if owner is whitelisted else return false
     */
    function isWhitelisted(uint256 _v1TokenId) external view virtual override returns (bool){
        return  (ownerWhiteList[_v1TokenId] == _msgSender())? true: false;

    }


    /**
     * @dev isPegged: Returns true if the V1 token has been transferred to this contract
     * @param _tokenId the v1 tokenID 
     * @return returns true if there's a peg
     */
    function isPegged(uint _tokenId) external virtual override view returns (bool) {
        return v1_v2_peg[_tokenId];
    }

    /**
     * @dev _setPeg: will set the v1_v2_peg[tokenId] to true if the contract owns the v1 token
     * @param _tokenId the v1 tokenID 
     * @return returns true if the peg assignment succeeds
     */
    function _setPeg(uint256 _tokenId) internal virtual  returns (bool) {
        require(supe.ownerOf(_tokenId)== address(this),"SupeRareV2: Unable to peg the V1 token!");
        v1_v2_peg[_tokenId] = true;
        emit Pegged(_tokenId);
        return true;
    }



    /**
   * @notice mintV2, should allow a whitelisted owner to call mint, if it's a contract then it needs to implement the onERC721Received function 
   * @param _tokenId v1 tokenID
   * @return bool returns true if the operation succeeds
   * @dev emits a PositionCreated event
   */
    function mintV2(uint256 _tokenId) external virtual override onlyWhitelisted(_tokenId) returns (bool) {
        require(_setPeg(_tokenId),"SupeRareV2: Get added to whitelist, transfer the V1 token to this contract, then call mintV2!");
        _safeMint(_msgSender(), _tokenId);
        _setTokenURI(_tokenId, supe.tokenURI(_tokenId));
        v1_v2_peg[_tokenId]= true; 
        emit MintV2(_msgSender(),_tokenId);
        return true;
    }



    /**
   * @notice withdraw, should allow the owner of a v2 token only for a pegged v1 token.
   * @param _tokenId is the v2 tokenID to be burned
   * @return bool true if the function succeeds in its operation
   * @dev emits a PositionDeleted event
   */
    function withdraw(uint256 _tokenId) external virtual override onlyOwnerOfToken(_tokenId) onlyPegged(_tokenId) returns (bool) {
        require(_msgSender()!= address(0),"SupeRareV2: Invalid recipient address!");
        _burn(_tokenId);    
         supe.transfer(_msgSender(),_tokenId);
        v1_v2_peg[_tokenId] = false;
        emit WithdrawV1(_msgSender(),_tokenId);
        return true;
    }


    /**
   * @notice safelyTransfer, should perform the ERC721 checks before transfering token to an external contract
   * @param from address of approved or sender
   * @param tokenId of the v2 token being transferred
   * @return bool true if the function succeeds in its operation
   * @dev emits a 'Transfer' event
   */
    function safelyTransfer(address from, address to, uint256 tokenId) external virtual override returns (bool) {
        safeTransferFrom(from, to, tokenId, "");
        return true;
    }
    

    /**
   * @notice getSupeRareAddress returns the address of the SupeRareV1 contract
   * @return address of the V1 contract
   */
    function getSupeRareAddress() external view virtual override returns (address) {
        return OriginalSupeRareAddr_;
    }



      
    /**
   * @notice setTokenURI   //ERC721: Change the tokenURI if needed on a per token basis by only by the owner of this contract
   * @param _tokenId Owner's current V2 TokenID
   * @return bool returns true of the operation succeeds
   */
    function setTokenURI(uint256 _tokenId,string calldata _tokenURI) external virtual override onlyOwner returns (bool) {
         _setTokenURI(_tokenId, _tokenURI);
        emit TokenURISet(_tokenId,_tokenURI);
        return true;
    }


    /**
   * @notice setBaseURI   //ERC721: Change the tokenURI if needed on a per token basis only by the owner of this contract
   * @param baseURI Owner's current V2 TokenID
   * @return bool returns true of the operation succeeds
   */
    function setBaseURI(string calldata baseURI) external virtual override  onlyOwner returns (bool) {
        _setBaseURI(baseURI);
        emit BaseURISet(baseURI);
        return true;
    }



    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    function onERC721Received(address, address, uint256, bytes memory) public view virtual override returns (bytes4) {
        return _ERC721_RECEIVED;
    }

}