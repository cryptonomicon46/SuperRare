// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// import "@openzeppelin/contracts/utils/Address.sol";
// import "./IERC721Receiver.sol";
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
     * @dev Triggered when the contract is stopped or started
     **/
    event ToggleStartStop(bool);


   /**
     * @dev Maintain a mapping of the original owner address to V1 TokenID to minted V2 TokenID
     **/
    mapping(address => mapping (uint256=>uint256)) public ownerAddrToV1toV2TokenId; 
    constructor (address OriginalSupeRareAddr__) ERC721 ("SupeRareV2","SUPRV2"){
        OriginalSupeRareAddr_ = OriginalSupeRareAddr__;
        supe = ISupeRare(OriginalSupeRareAddr_);
      
    }   
   

    ///@notice if _stopped = false, then deposits are enabled, else disabled
    modifier StopDeposits {
        require(!_stopped,"DEPOSITS_DISABLED");
        _;
    }
    /**
   * @notice deposit_V1 allows the owner of SupeRareV1 to deposit an NFT and get a minted representation in SupeRareV2
   * @param v1TokenId uint256 ID of the SupeRareV1 or original tokenId being deposited by owner
   * @return Returns the V2 balance of the owner in the contract
   * @dev emits a mint event, modifier allows stopping the deposits in case of an emergency
   */
    function deposit_V1(uint256 v1TokenId) external virtual override StopDeposits returns (uint256) {
        //Check if owner of the SupeRareV1 NFT
        //Update state mapping in this contract
        //Mint a V2 and emit a mint event

        require(supe.ownerOf(v1TokenId) == _msgSender(),"SupeRareV2: Not the Owner of the SupeRareV1 Token!");
        require(bytes(supe.tokenURI(v1TokenId)).length != 0,"SupeRareV2: Invalid V1 TokenURI!");

        _mint(_msgSender(),v1TokenId);
         _setTokenURI(v1TokenId, supe.tokenURI(v1TokenId));


        return balanceOf(_msgSender());


    }



    /**
   * @notice Withdraw_V1 allows the owner of SupeRareV1 to withdraw the deposited V1 SupeRare NFT 
   * @param v1TokenId uint256 ID of the SupeRareV1 which will be mapped to find the corresponding V2 NFT TokenID
   * @return Returns the V2 balance of the owner in the contract
   * @dev emits a burn event
   */
    function Withdraw_V1(uint256 v1TokenId) external virtual override  returns (uint256) {
        //Check if owner of the SupeRareV1 NFT
        //Update state mapping in this contract
        //Mint a V2 and emit a mint event

        require(supe.ownerOf(v1TokenId) == _msgSender(),"SupeRareV2: Not the Owner of the SupeRareV1 Token!");
        _burn(v1TokenId);

        return balanceOf(_msgSender());


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





}