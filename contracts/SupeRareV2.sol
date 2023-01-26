// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "./ISupeRare.sol";
import "./ISupeRareV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupeRareV2 is Ownable, ERC721, ISupeRareV2  {   
    using Address for address;  
    address private  OriginalSupeRareAddr_;
    ISupeRare private supe;
    address private owner_;
    bool private _stopped;


   /**
     * @dev V2 Token Minted that represents the Depositer's V1 position (address,uint256,uint256)
     **/
    mapping  (uint256 => Position) public  V2tokenToV1Position;

   /**
     * @dev Triggered when the contract is stopped or started
     **/
    event ToggleStartStop(bool);

       /**
     * @dev Triggered when a V1 token is deposited to mint a V2 token and position
     **/
    event PositionCreated(address indexed OrigOwner, uint256 indexed v1TokenID, uint256 indexed timeStamp);

       /**
     * @dev Triggered when a V2 token is burned to withdraw position
     **/
    event PositionDeleted(address indexed OrigOwner, uint256 indexed v1TokenID, uint256 indexed timeStamp);
  /**
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
  * @dev Guarantees msg.sender is owner of the given token
  * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
  */
  modifier onlyOwnerOf(uint256 _tokenId) {
    require(ownerOf(_tokenId) == _msgSender());
    _;
  }
    /**
   * @notice deposit allows the owner of SupeRareV1 to deposit an NFT and get a minted representation in SupeRareV2
   * @param v1TokenId uint256 ID of the SupeRareV1 or original tokenId being deposited by owner
   * @return bool true if the function succeeds in its operation
   * @dev emits a PositionCreated event, creates the Position ,modifier allows stopping the deposits in case of an emergency
   */
    function deposit(uint256 v1TokenId) external StopDeposits virtual override returns (bool) {
        require(supe.ownerOf(v1TokenId) == _msgSender(),"SupeRareV2: Not the Owner of the SupeRareV1 Token!");
        V2tokenToV1Position[v1TokenId] = Position(msg.sender,v1TokenId, block.timestamp);
        _mint(_msgSender(),v1TokenId);
        emit PositionCreated(_msgSender(),v1TokenId,block.timestamp);
        return true;
    }

    /**
   * @notice withdraw allows the owner of SupeRareV1 to withdraw the deposited V1 SupeRare NFT 
   * @param v1TokenId uint256 ID of the SupeRareV1 which will be mapped to find the corresponding V2 NFT TokenID
   * @return bool true if the function succeeds in its operation
   * @dev emits a burn event, deletes the corresponding Position 
   */
    function withdraw(uint256 v1TokenId) external virtual override onlyOwnerOf(v1TokenId) returns (bool) {
        require(supe.ownerOf(v1TokenId) == V2tokenToV1Position[v1TokenId].OrigOwner,"SupeRareV2: Not the Owner of the Original SupeRareV1 Token!");
        _burn(v1TokenId);
        delete V2tokenToV1Position[v1TokenId];
        emit PositionDeleted(_msgSender(),v1TokenId,block.timestamp);

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
   * @param v2TokenId Owner's current V2 TokenID
   * @return  DepositerPositionV1 corresponding to the minted V2TokenID
   */
    function getOwnerPosition(uint256 v2TokenId) external view virtual override returns (Position memory) {
        return V2tokenToV1Position[v2TokenId];
    }

}