// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// pragma solidity ^0.4.18;
import "@openzeppelin/contracts/utils/Address.sol";
import "./IERC721Receiver.sol";
import "./ISupeRare.sol";


contract SupeRareWrapper   {   
    using Address for address;
    address private  OriginalSupeRareAddr;
    ISupeRare private supe;
    address private owner_;

    /**
     * @dev Emitted when this contract is approved for a certian `tokenId`
     */
    event ApprovedThisContract(uint256 tokenId);

    /**
     * @dev Emitted when ownership is transfered from `previousOwner` to `newOwner`
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    constructor (address OriginalSupeRareAddr_) {
        OriginalSupeRareAddr = OriginalSupeRareAddr_;
        supe = ISupeRare(OriginalSupeRareAddr);
        owner_ = msg.sender;
    }   
   
   
    /**
     * @notice ApproveThisContract, approves this contract to handle a `tokenId`
     * @param tokenId  the token that'll be approved by this contract
     * @dev Emits a `ApprovedThisContract` event with the `tokenId`
     */     
    function ApproveThisContract(uint tokenId) external  {
        require(supe.approvedFor(tokenId)!=address(0),"ERC721: operator query for nonexistent token");
        require(supe.ownerOf(tokenId)== msg.sender ||supe.approvedFor(tokenId)== msg.sender ,"NOT_OWNER_OR_APPROVED");
        supe.approve(address(this),tokenId);
        emit ApprovedThisContract(tokenId);
    
    }


  /**
   * @dev getApproved Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
  function getApproved(uint256 _tokenId) public view  returns (address) {
    // return tokenApprovals[_tokenId];
    return supe.approvedFor(_tokenId);
  }

    /**
     * @dev See {IERC721-safeTransferFrom} https://eips.ethereum.org/EIPS/eip-721
     * @param from is the address that's approved or owner of the `tokenId`
     * @param to is either an EOA or an ERC721 compliant contract implementing onERC721Received
     * @param tokenId the underlying NFT asset to be transferred
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public  {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom} https://eips.ethereum.org/EIPS/eip-721
     * @param from is the address that's approved or owner of the `tokenId`
     * @param to is either an EOA or an ERC721 compliant contract implementing onERC721Received
     * @param tokenId the underlying NFT asset to be transferred 
     * @param _data  Additional data with no specified format, sent in call to `_to`
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public  {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }



    /**
     * @dev _isApprovedOrOwner returns if the `spender` is approved/owner of the NFT asset
     * @param spender the EOA that is approved or owner of the NFT asset
     * @param tokenId the underlying NFT asset to be transferred 
     * @notice the `tokenId` must exist 
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        // require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        require(supe.approvedFor(tokenId) != address(0),"ERC721: operator query for nonexistent token!" );

        address owner = supe.ownerOf(tokenId);
        // return (spender == owner || getApproved(tokenId) == spender || ERC721.isApprovedForAll(owner, spender));
        return (spender == owner || getApproved(tokenId) == spender);

    }



    /**
     * @notice Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients are aware of the ERC721 protocol to prevent tokens from being forever locked.
     * @param from cannot be the zero address.
     * @param to cannot be the zero address.
     * @param tokenId token must exist and be owned by `from`.
    * @param _data` is additional data, it has no specified format and it is sent in call to `to`.
     * @dev If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     * @dev Emits a {Transfer} event.
     */

    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) internal virtual {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    /**
     * @notice _transfer Transfers `tokenId` from `from` to `to`
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     * @param from the owner of approved address for the NFT asset
     * @param to `to` cannot be the zero address.
     * @param tokenId `tokenId` token must be owned by `from` 
     * @dev Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        // require(SupeOriginalAddr.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own"); // internal owner
        require(to != address(0), "ERC721: transfer to the zero address");

        supe.transfer(to,tokenId);
        emit Transfer(from, to, tokenId);
    }



    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
        private returns (bool)
    {
        if (!to.isContract()) {
            return true;
        }
        bytes memory returndata = to.functionCall(abi.encodeWithSelector(
            IERC721Receiver(to).onERC721Received.selector,
            msg.sender,
            from,
            tokenId,
            _data
        ), "ERC721: transfer to non ERC721Receiver implementer");
        bytes4 retval = abi.decode(returndata, (bytes4));
        return (retval == _ERC721_RECEIVED);
    }



    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner_);
        _;
    }


    /**
     * @notice Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     * @dev emits a `OwnershipTransferred` event 
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner_, newOwner);
        owner_ = newOwner;
    }
}