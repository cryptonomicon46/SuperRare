// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

// import "./ISupeRare.sol";
// import "./ISupeRareV2.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol";


import "hardhat/console.sol";
import "./ISupeRare.sol";

// import "./IERC721Metadata.sol";
// import "./IERC721Receiver.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/introspection/ERC165.sol";

contract SupeRareV2 is Ownable,  ERC721, IERC721Receiver  {   
    using Address for address;  
    address private  OriginalSupeRareAddr_;
    ISupeRare private supe;
    address private owner_;
    bool private _stopped;

    string private _name = "SupeRare";

    // Token symbol
    string private _symbol = "SUPR";
    /**
     * @dev This captures the Depositer's V1 Position 
     */
    struct  Position {
        address tokenOwner;
        uint256 tokenID;
        string tokenURI;
        uint256 timeStamp;   
    } 


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

   /**
     * @dev V2 TokenID => Position mapping (owner,v1tokenID,block.timestamp)
     **/
    mapping  (uint256 => Position) public  V1Position;


       /**
     * @dev V1 TokenID to Owner address mapping 
     **/
    mapping  (uint256 => address) private  _ownerDeposits;


       /**
     * @dev Triggered when a V1 token is deposited to mint a V2 token 
     **/
    event V1TokenDeposited(address indexed tokenOwner, uint256 indexed _tokenId);

   /**
     * @dev Triggered when the contract is stopped or started
     **/
    event ToggleStartStop(bool);

   /**
     * @dev Triggered when the ownership of the V1 token changes
     **/
      event  OwnershipUpdated(address indexed OrigV1Owner,address indexed NewV1Owner,uint256 indexed v1TokenId);


       /**
     * @dev Triggered when a V1 token is deposited to mint a V2 token 
     **/
    event PositionCreated(address indexed tokenOwner, uint256 indexed _tokenId, string indexed tokenURI);

       /**
     * @dev Triggered when a V2 token is burned to withdraw position
     **/
    event PositionDeleted(address indexed OrigOwner, uint256 indexed _tokenId);
      
       /**
     * @dev Triggered when a the v2tokenId's tokenURI is set
     **/
    event TokenURISet(uint256 _tokenId,string _tokenURI);

       /**
     * @dev Triggered when a the v2tokenId's tokenURI is set
     **/
      event  BaseURISet(string _baseURI);
  /**
   * 
     * @dev Maintain a mapping of the original owner address to V1 TokenID to minted V2 TokenID
     **/
    mapping(address => mapping (uint256=>uint256)) public ownerAddrToV1toV2TokenId; 

  /**
   * 
     * @dev Maintain a V1:V2 tokenID peg
     **/
    mapping(uint256=>uint256) public v1_v2_peg; 
    // constructor (address OriginalSupeRareAddr__) ERC721 ("SupeRareV2","SUPRV2"){
    //     OriginalSupeRareAddr_ = OriginalSupeRareAddr__;
    //     supe = ISupeRare(OriginalSupeRareAddr_); }   

            constructor (address OriginalSupeRareAddr__) ERC721 (_name,_symbol){
        OriginalSupeRareAddr_ = OriginalSupeRareAddr__;
        supe = ISupeRare(OriginalSupeRareAddr_);
        _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC721_METADATA);
        _registerInterface(_INTERFACE_ID_ERC721_ENUMERABLE); } 
   

 

    /**
  * @dev Guarantees msg.sender is owner of the v1 token on the original SupeRareV1 contract
  * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
  */
  modifier onlyOwnerOfToken(uint256 _tokenId) {
    require(_ownerDeposits[_tokenId] == _msgSender(),"SupeRareV2: Not the Owner of the SupeRareV1 Token!");
    _;
  }


    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view  override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return supe.tokenURI(tokenId);
    }



/**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        require(account != address(0), "ERC721: balance query for the zero address");
        // return supe.balanceOf(account);
        return ERC721.balanceOf(account);
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        // return supe.ownerOf(tokenId);
        return ERC721.ownerOf(tokenId);
    }


   

 function getOwnerDeposit(uint256 tokenId) external view returns (address){
    return _ownerDeposits[tokenId];
 }
    /**
   * @notice deposit, should allow the owner of a SupeRareV1 NFT to deposit their NFT into the V2 contract and mint a V2 Token with the same tokenId
   * @param _tokenId uint256 ID of the SupeRareV1 being deposited by owner
   * @return bool returns true if the operation succeeds
   * @dev emits a PositionCreated event
   */
    function mintV2(uint256 _tokenId) external onlyOwnerOfToken(_tokenId) returns (bool) {


        _mint(_msgSender(), _tokenId);
        _setTokenURI(_tokenId, supe.tokenURI(_tokenId));

        // V1Position[_tokenId] = Position(_msgSender(),_tokenId,supe.tokenURI(_tokenId), block.timestamp);

        // emit PositionCreated(_msgSender(),_tokenId,supe.tokenURI(_tokenId));
        return true;
    }



    /**
   * @notice withdraw, should allow the original owner of the SupeRareV1 to withdraw their position
   * @param _tokenId uint256 ID of the SupeRareV1 being withdrawn
   * @return bool true if the function succeeds in its operation
   * @dev emits a PositionDeleted event
   */
    function withdraw(uint256 _tokenId) external onlyOwnerOfToken(_tokenId) returns (bool) {

        _burn(_tokenId);
        delete V1Position[_tokenId];
        emit PositionDeleted(_msgSender(),_tokenId);
        return true;
    }

    ///@notice contract_status, check if deposits are halted 
    ///@dev returns true= stopped || false == active
    function contract_status() external view returns (bool) {
        return _stopped;
    }

    ///@notice ToggleContract, toggle stopped flag to stop deposits and only enable withdraws
    function ToggleContract() onlyOwner public{
        _stopped = !_stopped;
        emit ToggleStartStop(_stopped);
    }

    ///@notice getSupeRareAddress returns the address of the SupeRareV1 Contract
    function getSupeRareAddress() external view returns (address) {
        return OriginalSupeRareAddr_;
    }

        /**
   * @notice getOwnerPosition gets the owner's V1 position corresponding to teh v1TokenId
   * @param _tokenId Owner's current V2 TokenID
   * @return  DepositerPositionV1 corresponding to the minted V2TokenID
   */
    function getOwnerPosition(uint256 _tokenId) external view returns (Position memory) {
        require(_exists(_tokenId), "SupeRare V2: tokenID doesn't exist");
        return V1Position[_tokenId];
    }


      
    /**
   * @notice setTokenURI   //ERC721: Change the tokenURI if needed on a per token basis by only by the owner of this contract
   * @param _tokenId Owner's current V2 TokenID
   * @return bool returns true of the operation succeeds
   */
    function setTokenURI(uint256 _tokenId,string calldata _tokenURI) external onlyOwner returns (bool) {
         _setTokenURI(_tokenId, _tokenURI);
        emit TokenURISet(_tokenId,_tokenURI);
        return true;
    }


    /**
   * @notice setBaseURI   //ERC721: Change the tokenURI if needed on a per token basis only by the owner of this contract
   * @param baseURI Owner's current V2 TokenID
   * @return bool returns true of the operation succeeds
   */
    function setBaseURI(string calldata baseURI) external  onlyOwner returns (bool) {
        _setBaseURI(baseURI);
        emit BaseURISet(baseURI);
        return true;
    }



    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    function onERC721Received(address, address, uint256, bytes memory) public view virtual override returns (bytes4) {
        // return this.onERC721Received.selector;
            console.logBytes4(_ERC721_RECEIVED);


        return _ERC721_RECEIVED;
    }


}