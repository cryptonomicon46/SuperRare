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
    /// @dev The ID of the next token that will be minted. Skips 0
    uint176 private _nextId = 1;

   /**
     * @dev V1 => V2 TokenID mapping
     **/
    mapping(uint256 => uint256) v1_v2_tokenId;

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
    event PositionCreated(address indexed OrigOwner, uint256 indexed v2TokenID, uint256 indexed v1TokenID);

       /**
     * @dev Triggered when a V2 token is burned to withdraw position
     **/
    event PositionDeleted(address indexed OrigOwner, uint256 indexed v2TokenID, uint256 indexed v1TokenID);
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
  * @dev Guarantees msg.sender is owner of the v1 token on the original SupeRareV1 contract
  * @param _v1tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
  */
  modifier onlyOwnerOfV1(uint256 _v1tokenId) {
    require(supe.ownerOf(_v1tokenId) == _msgSender(),"SupeRareV2: Not the Owner of the SupeRareV1 Token!");
    _;
  }
    /**
   * @notice deposit allows the owner of SupeRareV1 to deposit an NFT and get a minted representation in SupeRareV2
   * @param v1tokenId uint256 ID of the SupeRareV1 or original tokenId being deposited by owner
   * @return v2tokenId returns the V2SupeRare tokenId
   * @dev emits a PositionCreated event
   */
    function deposit(uint256 v1tokenId) external StopDeposits virtual override onlyOwnerOfV1(v1tokenId) returns (uint256 v2tokenId) {

        _mint(_msgSender(), (v2tokenId = _nextId++));
        V1Position[v2tokenId] = Position(_msgSender(),v1tokenId, block.timestamp);
        v1_v2_tokenId[v1tokenId] = v2tokenId;

        emit PositionCreated(_msgSender(),v2tokenId,v1tokenId);
        return v2tokenId;
    }


    /**
     * @notice updateOwnership updates the ownership if the original V1 token was sold via bit/sale/transfer to a newOwner
     * @param v1tokenId the original V1TokenId
     * @return  true if the operation succeeds
     * @dev emits an OwnershipUpdated(address,address,uint256) event 
     */
        function updateOwnership(uint v1tokenId) external virtual override  onlyOwnerOfV1(v1tokenId) returns (bool) {
            uint256 v2TokenId = v1_v2_tokenId[v1tokenId];

             address _origV1Owner =  V1Position[v2TokenId].v1Owner;
             if( _origV1Owner != _msgSender()) {
                    V1Position[v2TokenId].v1Owner = _msgSender();
                    emit  OwnershipUpdated(_origV1Owner,_msgSender(),v1tokenId);
             }
        return true;
        }



    /**
   * @notice withdraw allows the owner of SupeRareV1 to withdraw the deposited V1 SupeRare NFT 
   * @param v1TokenId uint256 ID of the SupeRareV1 which will be mapped to find the corresponding V2 NFT TokenID
   * @return bool true if the function succeeds in its operation
   * @dev emits a burn event, deletes the corresponding Position 
   */
    function withdraw(uint256 v1TokenId) external virtual override onlyOwnerOfV1(v1TokenId) returns (bool) {
        uint _v2TokenId= v1_v2_tokenId[v1TokenId];
        _burn(_v2TokenId);
        delete V1Position[v1TokenId];
        emit PositionDeleted(_msgSender(),_v2TokenId,v1TokenId);
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
        return V1Position[v2TokenId];
    }

}