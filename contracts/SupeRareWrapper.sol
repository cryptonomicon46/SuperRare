// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
import "@openzeppelin/contracts/utils/Address.sol";
import "./IERC721Receiver.sol";
import "./ISupeRare.sol";


contract SupeRareWrapper   {   
    using Address for address;
    address private  OriginalSupeRareAddr_;
    ISupeRare private supe;
    address private owner_;

    /**
     * @dev Emitted when ownership is transfered from `previousOwner` to `newOwner`
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);


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


    constructor (address OriginalSupeRareAddr__) {
        OriginalSupeRareAddr_ = OriginalSupeRareAddr__;
        supe = ISupeRare(OriginalSupeRareAddr_);
        owner_ = msg.sender;
    }   
   

    // /**
    //  * @dev See {IERC721-safeTransferFrom} https://eips.ethereum.org/EIPS/eip-721
    //  * @param from is the address that's approved or owner of the `tokenId`
    //  * @param to is either an EOA or an ERC721 compliant contract implementing onERC721Received
    //  * @param tokenId the underlying NFT asset to be transferred
    //  * @dev only the owner of this contract can invoke the safe transfer

    //  */
    // function safeTransferFrom(address from, address to, uint256 tokenId) public onlyOwner {
    //     safeTransferFrom(from, to, tokenId, "");
    // }

    /**
     * @dev See {IERC721-safeTransferFrom} https://eips.ethereum.org/EIPS/eip-721
     * @param from is the address that's approved or owner of the `tokenId`
     * @param to is either an EOA or an ERC721 compliant contract implementing onERC721Received
     * @param tokenId the underlying NFT asset to be transferred 
     * @param _data  Additional data with no specified format, sent in call to `_to`
     * @dev only the owner of this contract can invoke the safe transfer
     */ 
    function safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) public onlyOwner  {
        // require(supe.approvedFor(tokenId) != address(0),"INVALID_TOKENID" );
        require(from == supe.ownerOf(tokenId),"NOT_NFT_OWNER" );
        
        _safeTransfer(from, to, tokenId, _data);
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
     * Conducts a low level call to the OriginalSupeRareAddr_ to the "transfer(address,uint256)" function selector with arg
     * inorder to perform a state change on the original SupeRare contract
     * @param from the owner of approved address for the NFT asset
     * @param to `to` cannot be the zero address.
     * @param tokenId `tokenId` token must be owned by `from` 
     * @dev Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        // require(SupeOriginalAddr.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own"); // internal owner
        require(to != address(0), "ERC721: transfer to the zero address");
        (bool success, ) =  OriginalSupeRareAddr_.call(abi.encodeWithSignature("transfer(address,uint256)", to, tokenId));
        require(success, "Refund failed");
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
        return (retval == _INTERFACE_ID_ERC721);
    }



    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner_,"ONLY_OWNER");
        _;
    }


    /**
     * @notice changeOwner allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     * @dev emits a `OwnershipTransferred` event 
     */
    function changeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner_, newOwner);
        owner_ = newOwner;
    }

    ///@notice getOwner returns the address that deployed the contract
    function getOwner() external view returns (address) {
        return owner_;
    }

    ///@notice getSupeRareAddress returns the address of the SupeRare Contract
    function getSupeRareAddress() external view returns (address) {
        return OriginalSupeRareAddr_;
    }

}