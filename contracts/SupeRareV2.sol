// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "./ISupeRare.sol";
import "./ISupeRareV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
contract SupeRareV2 is Ownable, ERC721, ISupeRareV2  {   
    using Address for address;  
    address private  OriginalSupeRareAddr_;
    ISupeRare private supe;
    address private owner_;
    bool private _stopped;




   /**
     * @dev V2 TokenID => Positio mapping (owner,v1tokenID,block.timestamp)
     **/
    mapping  (uint256 => Position) public  V1Position;

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
    constructor (address OriginalSupeRareAddr__) ERC721 ("SupeRareV2","SUPRV2"){
        OriginalSupeRareAddr_ = OriginalSupeRareAddr__;
        supe = ISupeRare(OriginalSupeRareAddr_); }   
   

    ///@notice if _stopped = false, then deposits are enabled, else disabled
    modifier StopDeposits {
        require(!_stopped,"DEPOSITS_DISABLED");
        _;
    }

    /**
  * @dev Guarantees msg.sender is owner of the v1 token on the original SupeRareV1 contract
  * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
  */
  modifier onlyOwnerOfToken(uint256 _tokenId) {
    require(supe.ownerOf(_tokenId) == _msgSender(),"SupeRareV2: Not the Owner of the SupeRareV1 Token!");
    _;
  }
    /**
   * @notice deposit, should allow the owner of a SupeRareV1 NFT to deposit their NFT into the V2 contract and mint a V2 Token with the same tokenId
   * @param _tokenId uint256 ID of the SupeRareV1 being deposited by owner
   * @return bool returns true if the operation succeeds
   * @dev emits a PositionCreated event
   */
    function deposit(uint256 _tokenId) external StopDeposits virtual override onlyOwnerOfToken(_tokenId) returns (bool) {


        _mint(_msgSender(), _tokenId);

        V1Position[_tokenId] = Position(_msgSender(),_tokenId,supe.tokenURI(_tokenId), block.timestamp);

        emit PositionCreated(_msgSender(),_tokenId,supe.tokenURI(_tokenId));
        return true;
    }



    /**
   * @notice withdraw, should allow the original owner of the SupeRareV1 to withdraw their position
   * @param _tokenId uint256 ID of the SupeRareV1 being withdrawn
   * @return bool true if the function succeeds in its operation
   * @dev emits a PositionDeleted event
   */
    function withdraw(uint256 _tokenId) external virtual override onlyOwnerOfToken(_tokenId) returns (bool) {

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
    function getOwnerPosition(uint256 _tokenId) external view virtual override returns (Position memory) {
        require(_exists(_tokenId), "SupeRare V2: tokenID doesn't exist");
        return V1Position[_tokenId];
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
    function setBaseURI(string calldata baseURI) external virtual override onlyOwner returns (bool) {
        _setBaseURI(baseURI);
        emit BaseURISet(baseURI);
        return true;
    }

}